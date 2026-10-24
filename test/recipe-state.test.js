import { afterEach, describe, expect, it, vi } from 'vitest';
import { get } from 'svelte/store';
import { DEFAULT_RECIPE, readSavedRecipe, saveRecipe, temperatureForRoast } from '../src/components/generators/4-6-generator/utils/recipe.js';
import { createShareUrl, decodeHashToRecipe, decodeRecipe, encodeRecipe, recipeFromUrl, shareRecipe } from '../src/components/generators/4-6-generator/utils/recipeSharing.js';
import { createBrewingStore } from '../src/components/generators/4-6-generator/utils/brewingStore.js';
import { getGrinderSetting } from '../src/components/generators/4-6-generator/utils/grinderSettings.js';

const recipe = { ...DEFAULT_RECIPE, weight: 20.5, taste: 'Sweet' };
function browserAt(href, values = {}) {
  const browser = new EventTarget();
  const entries = new Map(Object.entries(values));
  browser.location = { href };
  browser.localStorage = { getItem: key => entries.get(key) ?? null, setItem: (key, value) => entries.set(key, value) };
  browser.document = new EventTarget();
  browser.history = { replaceState: vi.fn((_, __, url) => browser.location.href = String(url)) };
  return browser;
}

afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });

describe('saved preferences', () => {
  it.each([null, '', ' ', '0', '-1', 'NaN', 'Infinity', '100', '20.55'])('recovers from missing or invalid dose %j', value => {
    const storage = { getItem: key => key.endsWith('coffeeWeight') ? value : null };
    expect(readSavedRecipe(storage)).toEqual(DEFAULT_RECIPE);
  });
  it('restores supported decimals and replaces individual corrupt fields', () => {
    const browser = browserAt('https://example.com/', { '46method.coffeeWeight': '20.5', '46method.waterRatio': '0', '46method.roastGrade': 'Dark', '46method.taste': 'unknown' });
    expect(readSavedRecipe(browser.localStorage)).toEqual({ ...DEFAULT_RECIPE, weight: 20.5, roast: 'Dark' });
  });
  it('works when storage reads and writes are blocked', () => {
    const blocked = { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('quota'); } };
    expect(readSavedRecipe(blocked)).toEqual(DEFAULT_RECIPE);
    expect(() => saveRecipe(blocked, recipe)).not.toThrow();
    const browser = browserAt('https://example.com/');
    Object.defineProperty(browser, 'localStorage', { get() { throw new Error('blocked'); } });
    const store = createBrewingStore();
    const cleanup = store.connectBrowser(browser);
    expect(get(store.recipe)).toEqual(DEFAULT_RECIPE);
    cleanup();
  });
  it('does not persist invalid input over a valid saved recipe', () => {
    const storage = { setItem: vi.fn() };
    saveRecipe(storage, { ...recipe, weight: undefined });
    expect(storage.setItem).not.toHaveBeenCalled();
  });
});

describe('shared recipes', () => {
  it.each([6, 20, 20.1, 20.5, 75.9, 76])('preserves dose %sg and the complete profile', weight => {
    const expected = { ...recipe, weight, roast: 'Dark', strength: 'Weak' };
    expect(decodeRecipe(encodeRecipe(expected))).toEqual(expected);
  });
  it('reads valid old links and rejects anchors, corrupt packed fields, and trailing junk', () => {
    expect(decodeHashToRecipe('bzwp2')).toEqual(DEFAULT_RECIPE);
    for (const value of ['main-content', '%%%', 'bzwp2!', 'bzwp3', 'camhy', 'c21uu', '', 'zzzzzzzzzz']) {
      expect(decodeHashToRecipe(value), value).toBeNull();
    }
  });
  it.each(['v2:20:15:Medium:Balanced:Sweet', 'v1:0:15:Medium:Balanced:Sweet', 'v1:20.55:15:Medium:Balanced:Sweet', 'v1:20:99:Medium:Balanced:Sweet', 'v1:20:15:unknown:Balanced:Sweet', 'v1:20:15:Medium:Balanced:Sweet:extra'])('rejects invalid serialized recipes: %s', value => {
    expect(decodeRecipe(value)).toBeNull();
  });
  it('isolates recipe data from anchors and preserves the production path and other query parameters', () => {
    const url = createShareUrl('https://example.com/KaffeKompis/verktyg/4-6-metoden/?source=test#main-content', recipe);
    expect(url.pathname).toBe('/KaffeKompis/verktyg/4-6-metoden/');
    expect(url.searchParams.get('source')).toBe('test');
    expect(url.hash).toBe('');
    expect(recipeFromUrl(url)).toEqual(recipe);
    url.hash = 'main-content';
    expect(recipeFromUrl(url)).toEqual(recipe);
  });
  it('gives explicit query data precedence over legacy hashes, including invalid query data', () => {
    expect(recipeFromUrl(new URL('https://example.com/?recipe=invalid#bzwp2'))).toBeNull();
  });
  it('falls back to clipboard if native sharing fails, without changing the recipe', async () => {
    const browser = browserAt('https://example.com/KaffeKompis/');
    const clipboard = { writeText: vi.fn().mockResolvedValue() };
    vi.stubGlobal('window', browser);
    vi.stubGlobal('navigator', { share: vi.fn().mockRejectedValue(new Error('unavailable')), clipboard });
    expect((await shareRecipe(recipe)).success).toBe(true);
    expect(recipeFromUrl(new URL(clipboard.writeText.mock.calls[0][0]))).toEqual(recipe);
  });
});

describe('brewing session', () => {
  it('starts with valid defaults and a schedule whose pours equal its water target', () => {
    const store = createBrewingStore();
    expect(get(store.recipe)).toEqual(DEFAULT_RECIPE);
    expect(get(store.waterWeight)).toBe(300);
    expect(get(store.brewingSchedule).reduce((sum, step) => sum + step.pour, 0)).toBeCloseTo(300);
  });
  it('loads shared data before saved preferences and migrates a valid legacy URL', () => {
    const browser = browserAt(createShareUrl('https://example.com/', recipe).href, { '46method.coffeeWeight': '30' });
    const store = createBrewingStore();
    const cleanup = store.connectBrowser(browser);
    expect(get(store.recipe)).toEqual(recipe);
    cleanup();
    const oldBrowser = browserAt('https://example.com/#bzwp2');
    const oldStore = createBrewingStore();
    const oldCleanup = oldStore.connectBrowser(oldBrowser);
    expect(new URL(oldBrowser.location.href).searchParams.has('recipe')).toBe(true);
    oldCleanup();
  });
  it('leaves recipe and timer untouched when an anchor changes', () => {
    vi.useFakeTimers();
    const browser = browserAt('https://example.com/#main-content');
    const store = createBrewingStore();
    const cleanup = store.connectBrowser(browser);
    store.startBrewing();
    vi.advanceTimersByTime(6000);
    browser.location.href = 'https://example.com/#main-content';
    browser.dispatchEvent(new Event('hashchange'));
    expect(get(store.recipe)).toEqual(DEFAULT_RECIPE);
    expect(get(store.status)).toBe('brewing');
    expect(get(store.totalTime)).toBe(1);
    cleanup();
    expect(vi.getTimerCount()).toBe(0);
  });
  it('preserves edits when following anchors and traversing their history', () => {
    const browser = browserAt(createShareUrl('https://example.com/', recipe).href);
    const store = createBrewingStore();
    const cleanup = store.connectBrowser(browser);
    store.coffeeWeight.set(25);
    browser.location.href += '#main-content';
    browser.dispatchEvent(new Event('popstate'));
    browser.dispatchEvent(new Event('hashchange'));
    expect(get(store.coffeeWeight)).toBe(25);
    cleanup();
  });
  it('refuses invalid starts and invalid recipes', () => {
    vi.useFakeTimers();
    const store = createBrewingStore();
    store.coffeeWeight.set(0);
    expect(store.startBrewing()).toBe(false);
    expect(get(store.status)).toBe('idle');
    expect(vi.getTimerCount()).toBe(0);
    expect(store.applyRecipe({ ...recipe, ratio: 0 })).toBe(false);
  });
  it('keeps the running schedule stable and rejects recipe replacement until stopped', () => {
    vi.useFakeTimers();
    const store = createBrewingStore();
    store.startBrewing();
    const schedule = get(store.brewingSchedule);
    expect(store.applyRecipe(recipe)).toBe(false);
    store.strength.set('Strong');
    store.coffeeWeight.set(40);
    expect(get(store.brewingSchedule)).toEqual(schedule);
    expect(get(store.displayRecipe)).toEqual(DEFAULT_RECIPE);
    store.stopBrewing();
    expect(store.applyRecipe(recipe)).toBe(true);
    expect(vi.getTimerCount()).toBe(0);
  });
  it('catches up after delayed callbacks, completes, and clears the timer', () => {
    vi.useFakeTimers();
    vi.setSystemTime(1000);
    const store = createBrewingStore();
    store.startBrewing();
    vi.setSystemTime(1000 + 5000 + 91000);
    vi.advanceTimersByTime(100);
    expect(get(store.totalTime)).toBeCloseTo(91.1);
    expect(get(store.currentStep)).toBe(2);
    vi.setSystemTime(1000 + 5000 + 300000);
    vi.advanceTimersByTime(100);
    expect(get(store.status)).toBe('completed');
    expect(get(store.totalTime)).toBe(225);
    expect(vi.getTimerCount()).toBe(0);
  });
  it('stops and resets a preparation countdown without starting another timer', () => {
    vi.useFakeTimers();
    const store = createBrewingStore();
    store.startBrewing();
    vi.advanceTimersByTime(2000);
    store.stopBrewing();
    vi.advanceTimersByTime(10000);
    expect(get(store.status)).toBe('stopped');
    expect(get(store.totalTime)).toBe(0);
    store.resetTimerState();
    expect(get(store.status)).toBe('idle');
    expect(vi.getTimerCount()).toBe(0);
  });
  it('uses the same temperature for selected, saved, and shared roasts', () => {
    const store = createBrewingStore();
    for (const roast of ['Light', 'Medium', 'Dark']) {
      store.applyRecipe({ ...recipe, roast });
      expect(get(store.brewingTemperature)).toBe(temperatureForRoast(roast));
    }
  });
  it('does not invent a grinder setting beyond its calibration table', () => {
    expect(getGrinderSetting(1200)).toBeNull();
    expect(getGrinderSetting(823).clicks).toBe(26);
  });
});
