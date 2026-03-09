import { writable, derived } from "svelte/store";
import { BREWING_CONSTANTS } from "./constants.js";
import { decodeHashToRecipe } from "./recipeSharing.js";
import {
  calculateFirstAndSecondPours,
  calculateSubsequentPours,
} from "./calculations.js";

const STORAGE_KEYS = {
  coffeeWeight: "46method.coffeeWeight",
  waterRatio: "46method.waterRatio",
  roastGrade: "46method.roastGrade",
  strength: "46method.strength",
  taste: "46method.taste",
};

const VALID_ROASTS = ["Light", "Medium", "Dark"];
const VALID_STRENGTHS = ["Strong", "Balanced", "Weak"];
const VALID_TASTES = ["Acidic", "Balanced", "Sweet"];

function readNumberFromStorage(key, fallback) {
  if (typeof window === "undefined") {
    return fallback;
  }

  const storedValue = Number(window.localStorage.getItem(key));
  return Number.isFinite(storedValue) ? storedValue : fallback;
}

function readEnumFromStorage(key, allowedValues, fallback) {
  if (typeof window === "undefined") {
    return fallback;
  }

  const storedValue = window.localStorage.getItem(key);
  return allowedValues.includes(storedValue) ? storedValue : fallback;
}

/**
 * Creates and manages the brewing store with all necessary state variables
 * for the 4:6 brewing method.
 */
export function createBrewingStore() {
  const hash =
    typeof window !== "undefined" ? window.location.hash.substring(1) : "";
  const recipeFromHash = hash ? decodeHashToRecipe(hash) : null;

  const initialCoffeeWeight = recipeFromHash?.weight ?? readNumberFromStorage(STORAGE_KEYS.coffeeWeight, 20);
  const initialWaterRatio = recipeFromHash?.ratio ?? readNumberFromStorage(STORAGE_KEYS.waterRatio, 15);
  const initialRoastGrade = recipeFromHash?.roast ?? readEnumFromStorage(STORAGE_KEYS.roastGrade, VALID_ROASTS, "Medium");
  const initialStrength = recipeFromHash?.strength ?? readEnumFromStorage(STORAGE_KEYS.strength, VALID_STRENGTHS, "Balanced");
  const initialTaste = recipeFromHash?.taste ?? readEnumFromStorage(STORAGE_KEYS.taste, VALID_TASTES, "Balanced");

  const roastTemperatures = {
    Light: 94,
    Medium: 92,
    Dark: 90,
  };

  const coffeeWeight = writable(initialCoffeeWeight);
  const waterRatio = writable(initialWaterRatio);
  const roastGrade = writable(initialRoastGrade);
  const brewingTemperature = writable(roastTemperatures[initialRoastGrade]);
  const strength = writable(
    initialStrength
  );
  const taste = writable(initialTaste);
  let isApplyingHashRecipe = false;

  /** Derived water weight based on coffee weight and ratio */
  const waterWeight = derived(
    [coffeeWeight, waterRatio],
    ([$coffeeWeight, $waterRatio]) => $coffeeWeight * $waterRatio
  );

  roastGrade.subscribe((value) => {
    brewingTemperature.set(roastTemperatures[value] ?? roastTemperatures.Medium);
  });

  const brewingSchedule = derived(
    [waterWeight, strength, taste],
    ([$waterWeight, $strength, $taste]) => {
      const firstPortion = $waterWeight * BREWING_CONSTANTS.FIRST_POUR_RATIO;
      const remainingPortion = $waterWeight * BREWING_CONSTANTS.SECOND_POUR_RATIO;
      const [firstPour, secondPour] = calculateFirstAndSecondPours($taste, firstPortion);
      const remainingPours = calculateSubsequentPours($strength, remainingPortion);

      let schedule = [
        { startTime: BREWING_CONSTANTS.INITIAL_DELAY_SECONDS, pour: firstPour, total: firstPour },
        { startTime: BREWING_CONSTANTS.CYCLE_DURATION_SECONDS, pour: secondPour, total: firstPortion }
      ];

      let currentTotal = firstPortion;
      remainingPours.forEach((pour, index) => {
        currentTotal += pour;
        schedule.push({
          startTime: BREWING_CONSTANTS.CYCLE_DURATION_SECONDS * (index + 2),
          pour: pour,
          total: currentTotal
        });
      });

      return schedule;
    }
  );

  /** Brewing process state */
  const currentStep = writable(0);
  const isBrewing = writable(false);
  const totalTime = writable(0);

  // Replace the writable currentStep with derived
  const calculatedStep = derived(
    [totalTime, brewingSchedule],
    ([$totalTime, $brewingSchedule]) => {
      return $brewingSchedule.findIndex((_, index) => {
        const nextStep = $brewingSchedule[index + 1];
        return nextStep ? $totalTime < nextStep.startTime : true;
      });
    }
  );

  // Subscribe to the calculated step and update the writable store
  calculatedStep.subscribe(value => {
    currentStep.set(value);
  });

  const resetTimerState = () => {
    currentStep.set(0);
    isBrewing.set(false);
    totalTime.set(0);
  };

  const resetRecipeState = () => {
    coffeeWeight.set(20);
    waterRatio.set(15);
    roastGrade.set("Medium");
    strength.set("Balanced");
    taste.set("Balanced");
    resetTimerState();
  };

  function applyRecipe(recipe) {
    if (!recipe) {
      return;
    }

    isApplyingHashRecipe = true;
    coffeeWeight.set(recipe.weight);
    waterRatio.set(recipe.ratio);
    roastGrade.set(recipe.roast);
    strength.set(recipe.strength);
    taste.set(recipe.taste);
    resetTimerState();
    isApplyingHashRecipe = false;
  }

  if (recipeFromHash) {
    applyRecipe(recipeFromHash);
  }

  if (typeof window !== "undefined") {
    window.addEventListener("hashchange", () => {
      if (isApplyingHashRecipe) {
        return;
      }

      const nextHash = window.location.hash.substring(1);
      if (!nextHash) {
        return;
      }

      const decodedRecipe = decodeHashToRecipe(nextHash);
      applyRecipe(decodedRecipe);
    });
  }

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
    reset: resetRecipeState,
    resetTimerState,
    applyRecipe,
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
  taste,
  reset,
  resetTimerState,
  applyRecipe,
} = createBrewingStore();
