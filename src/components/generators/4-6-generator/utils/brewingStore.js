import { writable, derived, get } from 'svelte/store';
import { BREWING_CONSTANTS } from './constants.js';
import { DEFAULT_RECIPE, validateRecipe, temperatureForRoast, readSavedRecipe, saveRecipe } from './recipe.js';
import { recipeFromUrl, createShareUrl, decodeHashToRecipe } from './recipeSharing.js';
import { calculateFirstAndSecondPours, calculateSubsequentPours } from './calculations.js';

function scheduleForRecipe(recipe) {
  if (validateRecipe(recipe)) return [];
  const water = recipe.weight * recipe.ratio;
  const firstPortion = water * BREWING_CONSTANTS.FIRST_POUR_RATIO;
  const [first, second] = calculateFirstAndSecondPours(recipe.taste, firstPortion);
  const pours = [first, second, ...calculateSubsequentPours(recipe.strength, water * BREWING_CONSTANTS.SECOND_POUR_RATIO)];
  let total = 0;
  return pours.map((pour, index) => ({ startTime: index * BREWING_CONSTANTS.CYCLE_DURATION_SECONDS, pour, total: (total += pour) }));
}

/** A recipe and timer belong to one mounted generator, including during SSR. */
export function createBrewingStore() {
  const coffeeWeight = writable(DEFAULT_RECIPE.weight);
  const waterRatio = writable(DEFAULT_RECIPE.ratio);
  const roastGrade = writable(DEFAULT_RECIPE.roast);
  const strength = writable(DEFAULT_RECIPE.strength);
  const taste = writable(DEFAULT_RECIPE.taste);
  const recipe = derived([coffeeWeight, waterRatio, roastGrade, strength, taste],
    ([weight, ratio, roast, strength, taste]) => ({ weight, ratio, roast, strength, taste }));
  const validationError = derived(recipe, validateRecipe);
  const status = writable('idle');
  const isLocked = derived(status, value => value === 'preparing' || value === 'brewing');
  const isBrewing = derived(status, value => value === 'brewing');
  const totalTime = writable(0);
  const prepTime = writable(BREWING_CONSTANTS.PREP_DURATION_SECONDS);
  const snapshot = writable(null);
  const displayRecipe = derived([recipe, snapshot, isLocked], ([setup, active, locked]) => locked && active ? active : setup);
  const brewingTemperature = derived(displayRecipe, value => temperatureForRoast(value.roast));
  const waterWeight = derived(displayRecipe, value => validateRecipe(value) ? 0 : value.weight * value.ratio);
  const brewingSchedule = derived(displayRecipe, scheduleForRecipe);
  const currentStep = derived([totalTime, brewingSchedule], ([time, schedule]) =>
    Math.max(0, schedule.findIndex((_, index) => !schedule[index + 1] || time < schedule[index + 1].startTime)));
  const loadNotice = writable('');
  let intervalId = null;
  let brewStartsAt = 0;
  let duration = 0;

  function clearTimer() {
    if (intervalId !== null) clearInterval(intervalId);
    intervalId = null;
  }

  function resetTimerState() {
    clearTimer();
    status.set('idle');
    snapshot.set(null);
    totalTime.set(0);
    prepTime.set(BREWING_CONSTANTS.PREP_DURATION_SECONDS);
  }

  function startBrewing() {
    const nextRecipe = { ...get(recipe) };
    if (validateRecipe(nextRecipe)) return false;
    resetTimerState();
    snapshot.set(nextRecipe);
    duration = scheduleForRecipe(nextRecipe).length * BREWING_CONSTANTS.CYCLE_DURATION_SECONDS;
    brewStartsAt = Date.now() + BREWING_CONSTANTS.PREP_DURATION_SECONDS * 1000;
    status.set('preparing');
    intervalId = setInterval(updateTimer, 100);
    return true;
  }

  function updateTimer() {
    // Wall time includes background tabs and sleep; callbacks only refresh the display.
    const elapsed = (Date.now() - brewStartsAt) / 1000;
    if (elapsed < 0) {
      prepTime.set(Math.ceil(-elapsed));
      return;
    }
    totalTime.set(Math.max(0, Math.min(duration, elapsed)));
    if (elapsed >= duration) {
      clearTimer();
      status.set('completed');
    } else status.set('brewing');
  }

  function stopBrewing() {
    clearTimer();
    status.set('stopped');
  }

  function applyRecipe(nextRecipe) {
    if (get(isLocked) || validateRecipe(nextRecipe)) return false;
    resetTimerState();
    coffeeWeight.set(nextRecipe.weight);
    waterRatio.set(nextRecipe.ratio);
    roastGrade.set(nextRecipe.roast);
    strength.set(nextRecipe.strength);
    taste.set(nextRecipe.taste);
    return true;
  }

  function connectBrowser(browser) {
    let storage;
    try { storage = browser.localStorage; } catch { /* Storage can be unavailable. */ }
    const url = new URL(browser.location.href);
    const shared = recipeFromUrl(url);
    applyRecipe(shared ?? readSavedRecipe(storage));
    if (url.searchParams.has('recipe') && !shared) {
      loadNotice.set('Delningslänken innehåller ogiltiga värden. Dina sparade inställningar eller standardreceptet visas.');
    }
    if (shared && !url.searchParams.has('recipe') && decodeHashToRecipe(url.hash.slice(1))) {
      browser.history.replaceState(null, '', createShareUrl(url.href, shared));
    }
    // Links load once per page. Anchor navigation and its history never replace a recipe.
    const onVisibilityChange = () => { if (get(isLocked)) updateTimer(); };
    browser.document?.addEventListener('visibilitychange', onVisibilityChange);
    const unsubscribe = recipe.subscribe(value => {
      saveRecipe(storage, value);
      if (!get(isLocked)) resetTimerState();
    });
    return () => {
      unsubscribe();
      browser.document?.removeEventListener('visibilitychange', onVisibilityChange);
      resetTimerState();
    };
  }

  return {
    coffeeWeight, waterRatio, roastGrade, strength, taste, recipe, displayRecipe,
    validationError, brewingTemperature, waterWeight, brewingSchedule, currentStep,
    status, isLocked, isBrewing, totalTime, prepTime, loadNotice,
    startBrewing, stopBrewing, resetTimerState, applyRecipe, connectBrowser,
  };
}
