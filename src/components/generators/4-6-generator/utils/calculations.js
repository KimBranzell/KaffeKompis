import { BREWING_CONSTANTS } from './constants.js';

const {
  ACIDIC_POUR_FRACTION,
  SWEET_POUR_FRACTION,
  EVEN_POUR_FRACTION
} = BREWING_CONSTANTS;


/**
 * Calculates the first and second pour amounts based on the coffee taste profile.
 *
 * @param {string} coffeeTaste - The taste profile of the coffee, can be 'Acidic', 'Balanced', or 'Sweet'.
 * @param {number} firstPourWater - The amount of water used for the first pour.
 * @returns {[number, number]} - An array containing the first and second pour amounts.
 */
export function calculateFirstAndSecondPours(coffeeTaste, firstPourWater) {
  switch (coffeeTaste) {
    case "Acidic":
      return [
        firstPourWater * ACIDIC_POUR_FRACTION,
        firstPourWater * SWEET_POUR_FRACTION,
      ];
    case "Balanced":
      return [
        firstPourWater * EVEN_POUR_FRACTION,
        firstPourWater * EVEN_POUR_FRACTION,
      ];
    case "Sweet":
      return [
        firstPourWater * SWEET_POUR_FRACTION,
        firstPourWater * ACIDIC_POUR_FRACTION,
      ];
  }
}

/**
 * Calculates the subsequent pour amounts based on the specified coffee strength.
 *
 * @param {string} coffeeStrength - The strength of the coffee, can be 'Strong', 'Balanced', or 'Weak'.
 * @param {number} secondPourWater - The amount of water used for the second pour.
 * @returns {number[]} An array of pour amounts for the subsequent pours.
 */
export function calculateSubsequentPours(coffeeStrength, secondPourWater) {
  switch (coffeeStrength) {
    case "Strong":
      return Array(4).fill(secondPourWater / 4);
    case "Balanced":
      return Array(3).fill(secondPourWater / 3);
    case "Weak":
      return Array(2).fill(secondPourWater / 2);
  }
}

/**
 * Calculates the recommended grind size based on the provided coffee weight.
 * The function uses a combination of extrapolation and interpolation to determine the grind size.
 * For coffee weights less than 6g or greater than 76g, the function extrapolates the grind size
 * based on the known data points. For coffee weights between 6g and 76g, the function
 * interpolates the grind size based on the known data points.
 *
 * @param {number} coffeeWeight - The weight of the coffee in grams.
 * @returns {number} The recommended grind size.
 */
export function calculateGrindSize(coffeeWeight) {
  const knownGrindSizes = [
    { coffeeWeight: 6, grindSize: 700 },
    { coffeeWeight: 40, grindSize: 1000 },
    { coffeeWeight: 76, grindSize: 1200 }
  ];

  if (coffeeWeight < 6) {
    const slope = (knownGrindSizes[1].grindSize - knownGrindSizes[0].grindSize) /
                  (knownGrindSizes[1].coffeeWeight - knownGrindSizes[0].coffeeWeight);
    const extrapolatedGrindSize = knownGrindSizes[0].grindSize +
                                  (coffeeWeight - knownGrindSizes[0].coffeeWeight) * slope;
    return Math.round(extrapolatedGrindSize / 10) * 10;
  }

  if (coffeeWeight > 76) {
    const lastTwoPoints = knownGrindSizes.slice(-2);
    const slope = (lastTwoPoints[1].grindSize - lastTwoPoints[0].grindSize) /
                  (lastTwoPoints[1].coffeeWeight - lastTwoPoints[0].coffeeWeight);
    const extrapolatedGrindSize = lastTwoPoints[0].grindSize +
                                  (coffeeWeight - lastTwoPoints[0].coffeeWeight) * slope;
    return Math.round(extrapolatedGrindSize / 10) * 10;
  }

  let lowerPoint = knownGrindSizes[0];
  let upperPoint = knownGrindSizes[knownGrindSizes.length - 1];

  for (let i = 0; i < knownGrindSizes.length - 1; i++) {
    if (coffeeWeight >= knownGrindSizes[i].coffeeWeight && coffeeWeight <= knownGrindSizes[i + 1].coffeeWeight) {
      lowerPoint = knownGrindSizes[i];
      upperPoint = knownGrindSizes[i + 1];
      break;
    }
  }

  const weightRange = upperPoint.coffeeWeight - lowerPoint.coffeeWeight;
  const grindSizeRange = upperPoint.grindSize - lowerPoint.grindSize;
  const weightDifference = coffeeWeight - lowerPoint.coffeeWeight;
  const interpolatedGrindSize = lowerPoint.grindSize + (weightDifference / weightRange) * grindSizeRange;

  return Math.round(interpolatedGrindSize / 10) * 10;
}

/**
 * Calculates the recommended water to coffee ratio based on the coffee weight.
 *
 * @param {number} coffeeWeight - The weight of the coffee in grams.
 * @returns {string} - The recommended ratio as a string.
 */
export function calculateRecommendedRatio(coffeeWeight) {
  if (coffeeWeight < 20) return "1:16";
  if (coffeeWeight < 50) return "1:15";
  if (coffeeWeight < 69) return "1:14";
  if (coffeeWeight <= 76) return "1:13";
  return "";
}