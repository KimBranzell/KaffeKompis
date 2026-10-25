import { afterEach, describe, expect, it, vi } from 'vitest';
import { get } from 'svelte/store';
import { brewPlanSchema } from '../src/lib/recipes/schema.js';
import { scaleBrewPlan, validRecipeDose, recipeTimeLabel, recipeRatioLabel } from '../src/lib/recipes/brewing.js';
import { createRecipeSession } from '../src/lib/recipes/session.js';

function plan() {
  return {
    version: 1, coffeeGrams: 20, waterGrams: 320, brewer: 'V60 02', dosePresets: [15, 20, 30, 40], temperatureC: 94, grind: 'Medelfint',
    minDoseGrams: 15, maxDoseGrams: 40, maxWaterGrams: 640,
    targetTime: { minSeconds: 210, maxSeconds: 240 },
    taste: 'Ren och balanserad', yieldNote: 'Vatten stannar i kaffet.',
    equipment: ['V60 02'], preparation: ['Skölj filtret.'],
    steps: [
      { kind: 'pour', atSeconds: 0, title: 'Blomma', instruction: 'Blöt hela bädden.', waterGrams: 50 },
      { kind: 'pour', atSeconds: 30, title: 'Andra hällningen', instruction: 'Häll jämnt.', waterGrams: 90 },
      { kind: 'pour', atSeconds: 75, title: 'Tredje hällningen', instruction: 'Häll jämnt.', waterGrams: 90 },
      { kind: 'pour', atSeconds: 120, title: 'Sista hällningen', instruction: 'Häll jämnt.', waterGrams: 90 },
      { kind: 'wait', atSeconds: 155, title: 'Vänta', instruction: 'Låt kaffet rinna igenom.' },
    ],
    relatedGuides: ['rostningsgrader'], sources: [{ title: 'Grundteknik', url: 'https://www.hario.co.uk/pages/brew-guides-v60-expert', note: 'Egen dos och tidsplan.' }], reviewedOn: '2026-10-25',
  };
}
afterEach(() => vi.useRealTimers());

const immersionCases = [
  { name: 'AeroPress', coffee: 18, water: 200, min: 12, max: 18, presets: [12, 15, 18], stir: 15, steep: 30, press: 90, minTime: 120, maxTime: 150, ratioLabel: '≈ 1:11,11' },
  { name: 'French press', coffee: 30, water: 500, min: 15, max: 45, presets: [15, 30, 45], stir: 30, steep: 45, press: 285, minTime: 315, maxTime: 345, ratioLabel: '≈ 1:16,67' },
];
function immersionPlan(spec) {
  return {
    ...plan(), coffeeGrams: spec.coffee, waterGrams: spec.water, brewer: spec.name,
    minDoseGrams: spec.min, maxDoseGrams: spec.max, dosePresets: spec.presets,
    maxWaterGrams: spec.water * spec.max / spec.coffee,
    targetTime: { minSeconds: spec.minTime, maxSeconds: spec.maxTime },
    steps: [
      { kind: 'pour', atSeconds: 0, title: 'Häll', instruction: 'Blöt kaffet.', waterGrams: spec.water },
      { kind: 'stir', atSeconds: spec.stir, title: 'Rör om', instruction: 'Rör och gör klart.' },
      { kind: 'steep', atSeconds: spec.steep, title: 'Låt dra', instruction: 'Låt kaffet dra.' },
      { kind: 'press', atSeconds: spec.press, title: 'Pressa', instruction: 'Pressa och servera.' },
    ],
  };
}

describe('recipe authoring contract', () => {
  it('accepts a complete plan and generates its time label from structured data', () => {
    expect(brewPlanSchema.safeParse(plan()).success).toBe(true);
    expect(brewPlanSchema.safeParse({ ...plan(), version: 2 }).success).toBe(true);
    expect(recipeTimeLabel({ brew: plan() })).toBe('3:30–4:00');
    expect(recipeTimeLabel({ brewTime: '4:00' })).toBe('4:00');
  });
  it('rejects a plan whose pours do not reach the stated water total', () => {
    const data = plan(); data.steps[3].waterGrams = 80;
    expect(brewPlanSchema.safeParse(data).success).toBe(false);
  });
  it('rejects supported doses that exceed the batch capacity', () => {
    const data = plan(); data.maxWaterGrams = 600;
    expect(brewPlanSchema.safeParse(data).success).toBe(false);
  });
  it('rejects an out-of-order timeline and a wait step with water to pour', () => {
    const data = plan(); data.steps[2].atSeconds = 20;
    expect(brewPlanSchema.safeParse(data).success).toBe(false);
    const other = plan(); other.steps[4].waterGrams = 10;
    expect(brewPlanSchema.safeParse(other).success).toBe(false);
  });
  it('rejects an invalid base dose, reversed time range, or invalid recipe revision', () => {
    expect(brewPlanSchema.safeParse({ ...plan(), coffeeGrams: 50 }).success).toBe(false);
    expect(brewPlanSchema.safeParse({ ...plan(), targetTime: { minSeconds: 300, maxSeconds: 200 } }).success).toBe(false);
    expect(brewPlanSchema.safeParse({ ...plan(), version: 0 }).success).toBe(false);
    expect(brewPlanSchema.safeParse({ ...plan(), version: 1.5 }).success).toBe(false);
  });
  it('rejects missing steps and dose presets outside the supported interval', () => {
    expect(brewPlanSchema.safeParse({ ...plan(), steps: [] }).success).toBe(false);
    expect(brewPlanSchema.safeParse({ ...plan(), dosePresets: [45] }).success).toBe(false);
    expect(brewPlanSchema.safeParse({ ...plan(), dosePresets: [20.55] }).success).toBe(false);
  });
});

describe.each(immersionCases)('$name immersion brewing', spec => {
  it('accepts stirring, steeping, and pressing without inventing extra water', () => {
    const data = immersionPlan(spec);
    expect(brewPlanSchema.safeParse(data).success).toBe(true);
    const scaled = scaleBrewPlan(data, spec.coffee);
    expect(scaled.waterGrams).toBe(spec.water);
    expect(scaled.steps.map(step => step.waterGrams)).toEqual([spec.water, 0, 0, 0]);
    expect(scaled.steps.map(step => step.targetGrams)).toEqual([spec.water, spec.water, spec.water, spec.water]);
    expect(recipeRatioLabel(data)).toBe(spec.ratioLabel);
    expect(recipeRatioLabel(plan())).toBe('1:16');
  });
  it('scales every supported tenth from exact base quantities, preserving the timeline', () => {
    const data = immersionPlan(spec);
    for (let tenth = spec.min * 10; tenth <= spec.max * 10; tenth++) {
      const dose = tenth / 10;
      const result = scaleBrewPlan(data, dose);
      expect(result.waterGrams).toBeCloseTo(Math.round(spec.water * dose / spec.coffee * 10) / 10, 8);
      expect(result.steps[0].waterGrams).toBe(result.waterGrams);
      expect(result.steps.map(step => step.atSeconds)).toEqual(data.steps.map(step => step.atSeconds));
    }
    expect(scaleBrewPlan(data, spec.max + .1)).toBeNull();
    expect(scaleBrewPlan(data, spec.min - .1)).toBeNull();
  });
  it('holds at stirring after background delays and starts a full steep on confirmation', () => {
    vi.useFakeTimers(); vi.setSystemTime(1000);
    const session = createRecipeSession(); const data = immersionPlan(spec);
    session.start(data, spec.coffee);
    expect(session.advance()).toBe(false);
    expect(session.complete()).toBe(false);
    vi.setSystemTime(601000); session.refresh();
    expect(get(session.currentStep)).toBe(1);
    expect(get(session.remainingSeconds)).toBeNull();
    expect(session.complete()).toBe(false);
    expect(session.advance()).toBe(true);
    expect(get(session.currentStep)).toBe(2);
    const steepDuration = spec.press - spec.steep;
    expect(get(session.remainingSeconds)).toBe(steepDuration);
    vi.advanceTimersByTime((steepDuration - 1) * 1000); session.refresh();
    expect(get(session.currentStep)).toBe(2);
    expect(session.complete()).toBe(false);
    vi.advanceTimersByTime(1000); session.refresh();
    expect(get(session.currentStep)).toBe(3);
    vi.advanceTimersByTime(300000);
    expect(get(session.status)).toBe('brewing');
    expect(get(session.activeBrew).steps.map(step => step.atSeconds)).toEqual(data.steps.map(step => step.atSeconds));
    expect(session.complete()).toBe(true);
    expect(get(session.locked)).toBe(false);
    expect(vi.getTimerCount()).toBe(0);
  });
  it('cancels a shifted steep and restarts the original timeline', () => {
    vi.useFakeTimers(); const session = createRecipeSession(); const data = immersionPlan(spec);
    session.start(data, spec.coffee);
    vi.advanceTimersByTime(600000); session.advance(); session.stop();
    expect(get(session.locked)).toBe(false);
    expect(vi.getTimerCount()).toBe(0);
    session.reset(); session.start(data, spec.min);
    expect(get(session.currentStep)).toBe(0);
    expect(get(session.remainingSeconds)).toBe(spec.stir);
    vi.advanceTimersByTime(spec.stir * 1000); session.refresh();
    expect(get(session.currentStep)).toBe(1);
    session.destroy();
    expect(vi.getTimerCount()).toBe(0);
  });
});

describe('dose and water scaling', () => {
  it('doubles quantities and cumulative targets while preserving time guidance', () => {
    const data = plan(); const scaled = scaleBrewPlan(data, 40);
    expect(scaled.waterGrams).toBe(640);
    expect(scaled.steps.map(step => step.waterGrams)).toEqual([100, 180, 180, 180, 0]);
    expect(scaled.steps.map(step => step.targetGrams)).toEqual([100, 280, 460, 640, 640]);
    expect(scaled.steps.map(step => step.atSeconds)).toEqual(data.steps.map(step => step.atSeconds));
    expect(data.steps[0].waterGrams).toBe(50);
  });
  it('conserves water after rounding at every supported tenth-gram dose', () => {
    for (let tenth = 150; tenth <= 400; tenth++) {
      const result = scaleBrewPlan(plan(), tenth / 10);
      expect(result.steps.reduce((sum, step) => sum + step.waterGrams, 0)).toBeCloseTo(result.waterGrams, 8);
      expect(result.steps.at(-1).targetGrams).toBe(result.waterGrams);
      expect(result.steps.every(step => step.waterGrams >= 0)).toBe(true);
    }
  });
  it.each([undefined, NaN, Infinity, 0, 14.9, 40.1, 20.55])('rejects invalid dose %s', dose => {
    expect(validRecipeDose(plan(), dose)).toBe(false);
    expect(scaleBrewPlan(plan(), dose)).toBeNull();
  });
  it('also enforces capacity when configuration changes', () => {
    expect(scaleBrewPlan({ ...plan(), maxWaterGrams: 500 }, 40)).toBeNull();
  });
  it('changes steps at the scheduled time and stays on drainage afterward', () => {
    vi.useFakeTimers(); const session = createRecipeSession();
    session.start(plan(), 20);
    vi.advanceTimersByTime(29900); session.refresh();
    expect(get(session.currentStep)).toBe(0);
    vi.advanceTimersByTime(100); session.refresh();
    expect(get(session.currentStep)).toBe(1);
    vi.advanceTimersByTime(45000); session.refresh();
    expect(get(session.currentStep)).toBe(2);
    vi.advanceTimersByTime(925000); session.refresh();
    expect(get(session.currentStep)).toBe(4);
    expect(get(session.locked)).toBe(true);
    session.destroy();
  });
});

describe('guided recipe session', () => {
  it('rejects invalid doses and prevents restarting an active brew', () => {
    vi.useFakeTimers(); const session = createRecipeSession();
    expect(session.start(plan(), 41)).toBe(false);
    expect(vi.getTimerCount()).toBe(0);
    expect(session.start(plan(), 40)).toBe(true);
    expect(session.start(plan(), 20)).toBe(false);
    expect(get(session.activeBrew).coffeeGrams).toBe(40);
    session.destroy(); expect(vi.getTimerCount()).toBe(0);
  });
  it('takes a snapshot rather than changing the active brew with the source recipe', () => {
    vi.useFakeTimers(); const data = plan(); const session = createRecipeSession();
    session.start(data, 20); data.steps[0].waterGrams = 999;
    expect(get(session.activeBrew).steps[0].waterGrams).toBe(50);
    session.destroy();
  });
  it('catches up after background delays and waits for manual completion', () => {
    vi.useFakeTimers(); vi.setSystemTime(1000); const session = createRecipeSession();
    session.start(plan(), 40);
    vi.setSystemTime(81000); session.refresh();
    expect(get(session.elapsedSeconds)).toBe(80);
    expect(get(session.currentStep)).toBe(2);
    vi.setSystemTime(301000); session.refresh();
    expect(get(session.status)).toBe('brewing');
    expect(get(session.currentStep)).toBe(4);
    expect(session.complete()).toBe(true);
    expect(get(session.status)).toBe('completed');
    expect(get(session.elapsedSeconds)).toBe(300);
    expect(vi.getTimerCount()).toBe(0);
  });
  it('stops, unlocks, and resets without leaving intervals behind', () => {
    vi.useFakeTimers(); const session = createRecipeSession();
    session.start(plan(), 20); vi.advanceTimersByTime(2000); session.stop();
    expect(get(session.locked)).toBe(false); expect(get(session.elapsedSeconds)).toBe(2);
    vi.advanceTimersByTime(10000); expect(get(session.elapsedSeconds)).toBe(2);
    expect(session.complete()).toBe(false); session.reset();
    expect(get(session.status)).toBe('idle'); expect(get(session.activeBrew)).toBeNull();
    expect(vi.getTimerCount()).toBe(0);
  });
});
