import { writable, derived } from "svelte/store";
import { BREWING_CONSTANTS } from "./constants.js";
import { decodeHashToRecipe } from "./recipeSharing.js";

/**
 * Creates and manages the brewing store with all necessary state variables
 * for the 4:6 brewing method.
 */
export function createBrewingStore() {
  /** Check for hash in URL */
  const hash =
    typeof window !== "undefined" ? window.location.hash.substring(1) : "";
  const recipeFromHash = hash ? decodeHashToRecipe(hash) : null;

  /** Core brewing parameters */
  const coffeeWeight = writable(recipeFromHash ? recipeFromHash.weight : 20);
  const waterRatio = writable(recipeFromHash ? recipeFromHash.ratio : 15);
  const roastGrade = writable(recipeFromHash ? recipeFromHash.roast : "Medium");
  const brewingTemperature = writable(93);
  const strength = writable(
    recipeFromHash ? recipeFromHash.strength : "Balanced"
  );
  const taste = writable(recipeFromHash ? recipeFromHash.taste : "Balanced");

  /** Derived water weight based on coffee weight and ratio */
  const waterWeight = derived(
    [coffeeWeight, waterRatio],
    ([$coffeeWeight, $waterRatio]) => $coffeeWeight * $waterRatio
  );

  if (hash && typeof window !== "undefined") {
    history.replaceState(null, "", window.location.pathname);
  }

  const brewingSchedule = derived(
    [waterWeight, strength, taste],
    ([$waterWeight, $strength, $taste]) => {
      // First 40% calculations based on taste
      const firstPortion = $waterWeight * 0.4;
      let firstPourSplit;

      switch($taste) {
        case "Sweet":
          firstPourSplit = [1/3, 2/3];
          break;
        case "Acidic":
          firstPourSplit = [2/3, 1/3];
          break;
        default: // Balanced
          firstPourSplit = [0.5, 0.5];
      }

      // Remaining 60% calculations based on strength
      const remainingPortion = $waterWeight * 0.6;
      let remainingPours;

      switch($strength) {
        case "Strong":
          remainingPours = Array(4).fill(remainingPortion / 4);
          break;
        case "Weak":
          remainingPours = Array(2).fill(remainingPortion / 2);
          break;
        default: // Balanced
          remainingPours = Array(3).fill(remainingPortion / 3);
      }

      // Build the complete schedule
      let schedule = [
        { startTime: 0, pour: firstPortion * firstPourSplit[0], total: firstPortion * firstPourSplit[0] },
        { startTime: 45, pour: firstPortion * firstPourSplit[1], total: firstPortion }
      ];

      let currentTotal = firstPortion;
      remainingPours.forEach((pour, index) => {
        currentTotal += pour;
        schedule.push({
          startTime: 90 + (index * 45), // 45 second intervals
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
      return $brewingSchedule.findIndex((step, index) => {
        const nextStep = $brewingSchedule[index + 1];
        return nextStep ? $totalTime < nextStep.startTime : true;
      });
    }
  );

  // Subscribe to the calculated step and update the writable store
  calculatedStep.subscribe(value => {
    currentStep.set(value);
  });

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
      roastGrade.set("Medium");
      brewingTemperature.set(94);
      strength.set("Balanced");
      taste.set("Balanced");
      currentStep.set(0);
      isBrewing.set(false);
      totalTime.set(0);
      brewingSchedule.set([]);
    },
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
} = createBrewingStore();
