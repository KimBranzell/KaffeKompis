import { writable, derived } from 'svelte/store';
import { BREWING_CONSTANTS } from './constants.js';
import { decodeHashToRecipe } from './recipeSharing.js';

/**
 * Creates and manages the brewing store with all necessary state variables
 * for the 4:6 brewing method.
 */
export function createBrewingStore() {
  /** Check for hash in URL */
  const hash = typeof window !== 'undefined' ? window.location.hash.substring(1) : '';
  const recipeFromHash = hash ? decodeHashToRecipe(hash) : null;

  /** Core brewing parameters */
  const coffeeWeight = writable(recipeFromHash ? recipeFromHash.weight : 20);
  const waterRatio = writable(recipeFromHash ? recipeFromHash.ratio : 15);
  const roastGrade = writable(recipeFromHash ? recipeFromHash.roast : 'Medium');
  const brewingTemperature = writable(93);
  const strength = writable(recipeFromHash ? recipeFromHash.strength : 'Balanced');
  const taste = writable(recipeFromHash ? recipeFromHash.taste : 'Balanced');

  /** Derived water weight based on coffee weight and ratio */
  const waterWeight = derived(
    [coffeeWeight, waterRatio],
    ([$coffeeWeight, $waterRatio]) => $coffeeWeight * $waterRatio
  );

  if (hash && typeof window !== 'undefined') {
    history.replaceState(null, '', window.location.pathname);
  }

  /** Brewing process state */
  const brewingSchedule = writable([]);
  const currentStep = writable(0);
  const isBrewing = writable(false);
  const totalTime = writable(0);


  return {
    // Core parameters
    coffeeWeight,
    waterRatio,
    roastGrade,
    brewingTemperature,
    strength,
    taste,

    // Derived values
    waterWeight,

    // Process state
    brewingSchedule,
    currentStep,
    isBrewing,
    totalTime,

    // Store reset function
    reset: () => {
      coffeeWeight.set(20);
      waterRatio.set(15);
      roastGrade.set('Medium');
      brewingTemperature.set(94);
      strength.set('Balanced');
      taste.set('Balanced');
      currentStep.set(0);
      isBrewing.set(false);
      totalTime.set(0);
      brewingSchedule.set([]);
    }
  };
}

/** Create and export the store instance */
export const {
  coffeeWeight,
  waterRatio,
  roastGrade,
  brewingTemperature,
  waterWeight,
  brewingSchedule,
  currentStep,
  isBrewing,
  totalTime,
  strength,
  taste
} = createBrewingStore();
