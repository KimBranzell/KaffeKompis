import { describe, expect, it } from 'vitest';
import { calculateBatch, estimateCoffeeMeasures, validCoffeeMeasureFactor } from '../src/lib/recipes/batch.js';
import { batchRecipeSchema } from '../src/lib/recipes/schema.js';
import { recipeCardQuantities, recipeTimeLabel } from '../src/lib/recipes/brewing.js';

const plan = {
  version: 1, brewer: 'Elbryggare', waterMl: 1000, gramsPerLitre: 60,
  gramsPerScoop: 6, gramsPerDl: 40,
  minWaterMl: 500, maxWaterMl: 2000, capacityMl: 1250,
  grind: 'Filtermalning', taste: 'Balanserat', yieldNote: 'Mindre färdig dryck än vatten.',
  equipment: ['Bryggare'], preparation: ['Placera filtret.'], relatedGuides: [],
  sources: [{ title: 'ECBC', url: 'https://ecbc.coffee/overview/domestic/certification-standards/', note: 'Startpunkt.' }], reviewedOn: '2026-10-25',
  steps: [{ title: 'Fyll på', instruction: 'Fyll tanken.' }, { title: 'Brygg', instruction: 'Låt maskinen bli klar.' }],
};
const settings = { mode: 'water', waterMl: 1000, cups: 4, cupMl: 250, gramsPerLitre: 60, capacityMl: 1250 };

describe('electric filter batch calculator', () => {
  it.each([[500, 30], [750, 45], [1000, 60], [1250, 75]])('calculates %s ml water as %s g coffee at the default dose', (waterMl, coffeeGrams) => {
    expect(calculateBatch(plan, { ...settings, waterMl })).toEqual({ errors: {}, result: { waterMl, coffeeGrams, gramsPerLitre: 60 } });
  });
  it('uses the chosen dose and rounds coffee to a tenth of a gram', () => {
    expect(calculateBatch(plan, { ...settings, waterMl: 1250, gramsPerLitre: 65 }).result.coffeeGrams).toBe(81.3);
  });
  it.each([[125, 500, 30], [200, 800, 48], [250, 1000, 60]])('uses explicit %s ml cups instead of assuming a universal cup', (cupMl, waterMl, coffeeGrams) => {
    expect(calculateBatch(plan, { ...settings, mode: 'cups', cupMl }).result).toEqual({ waterMl, coffeeGrams, gramsPerLitre: 60 });
  });
  it('blocks both volume and cup batches above the machine capacity without clamping', () => {
    for (const values of [{ waterMl: 1250, capacityMl: 1000 }, { mode: 'cups', cups: 6, cupMl: 250 }]) {
      const calculated = calculateBatch(plan, { ...settings, ...values });
      expect(calculated.result).toBeNull();
      expect(calculated.errors.amount).toMatch(/maxvolym/);
    }
  });
  it.each([
    { waterMl: undefined }, { waterMl: 0 }, { waterMl: -100 }, { waterMl: 499 }, { waterMl: 2001 }, { waterMl: 750.5 }, { waterMl: Infinity }, { waterMl: NaN },
    { gramsPerLitre: undefined }, { gramsPerLitre: 49 }, { gramsPerLitre: 76 }, { gramsPerLitre: 60.5 },
    { capacityMl: undefined }, { capacityMl: 0 }, { capacityMl: 2001 },
    { mode: 'cups', cups: 0 }, { mode: 'cups', cups: 2.5 }, { mode: 'cups', cups: 17 }, { mode: 'cups', cupMl: 300 }, { mode: 'unknown' },
  ])('rejects invalid settings %j', values => {
    const calculated = calculateBatch(plan, { ...settings, ...values });
    expect(calculated.result).toBeNull();
    expect(Object.keys(calculated.errors).length).toBeGreaterThan(0);
  });
  it('ignores inactive cup inputs when calculating from water volume', () => {
    expect(calculateBatch(plan, { ...settings, cups: undefined, cupMl: undefined }).result.coffeeGrams).toBe(60);
  });
  it('validates authoring defaults and exposes consistent recipe card quantities', () => {
    expect(batchRecipeSchema.safeParse(plan).success).toBe(true);
    expect(batchRecipeSchema.safeParse({ ...plan, capacityMl: 750 }).success).toBe(false);
    expect(batchRecipeSchema.safeParse({ ...plan, minWaterMl: 1500 }).success).toBe(false);
    expect(recipeCardQuantities({ batch: plan })).toEqual({ dose: 60, ratioLabel: '60 g/l' });
    expect(recipeTimeLabel({ batch: plan, brewTime: 'Maskinberoende' })).toBe('Maskinberoende');
  });
});

describe('ground coffee volume estimates', () => {
  it('shows a litre batch as 10 level scoops or 1.5 dl with the starting assumptions', () => {
    const { coffeeGrams } = calculateBatch(plan, settings).result;
    expect(estimateCoffeeMeasures(coffeeGrams, plan)).toEqual({ scoops: 10, coffeeDl: 1.5 });
  });
  it('preserves useful fractional measures for smaller batches', () => {
    expect(estimateCoffeeMeasures(30, plan)).toEqual({ scoops: 5, coffeeDl: .75 });
    expect(estimateCoffeeMeasures(75, plan).scoops).toBe(12.5);
  });
  it('uses independent custom scoop size and ground coffee density without changing the recipe', () => {
    const custom = { gramsPerScoop: 10, gramsPerDl: 50 };
    expect(estimateCoffeeMeasures(60, custom)).toEqual({ scoops: 6, coffeeDl: 1.2 });
    expect(calculateBatch(plan, { ...settings, ...custom }).result.coffeeGrams).toBe(60);
    expect(estimateCoffeeMeasures(62.5, { ...custom, gramsPerScoop: 6.25 }).scoops).toBe(10);
  });
  it.each([
    { gramsPerScoop: undefined }, { gramsPerScoop: 0 }, { gramsPerScoop: -6 }, { gramsPerScoop: 21 }, { gramsPerScoop: NaN }, { gramsPerScoop: Infinity }, { gramsPerScoop: 6.123 },
    { gramsPerDl: undefined }, { gramsPerDl: 0 }, { gramsPerDl: 9 }, { gramsPerDl: 81 }, { gramsPerDl: NaN }, { gramsPerDl: Infinity }, { gramsPerDl: 40.123 },
  ])('hides estimates for invalid calibration %j while preserving the gram result', values => {
    expect(estimateCoffeeMeasures(60, { ...plan, ...values })).toBeNull();
    expect(calculateBatch(plan, { ...settings, ...values }).result.coffeeGrams).toBe(60);
    expect(batchRecipeSchema.safeParse({ ...plan, ...values }).success).toBe(false);
  });
  it.each([undefined, 0, -1, NaN, Infinity])('rejects invalid coffee weights %s', weight => {
    expect(estimateCoffeeMeasures(weight, plan)).toBeNull();
  });
  it('validates calibration boundaries and rejects unknown units', () => {
    expect(validCoffeeMeasureFactor(1, 'scoop')).toBe(true);
    expect(validCoffeeMeasureFactor(20, 'scoop')).toBe(true);
    expect(validCoffeeMeasureFactor(10, 'dl')).toBe(true);
    expect(validCoffeeMeasureFactor(80, 'dl')).toBe(true);
    expect(validCoffeeMeasureFactor(6, 'unknown')).toBe(false);
    expect(estimateCoffeeMeasures(60)).toBeNull();
  });
});
