export const COFFEE_MEASURE_LIMITS = Object.freeze({ scoop: { min: 1, max: 20 }, dl: { min: 10, max: 80 } });

export function validCoffeeMeasureFactor(value, unit) {
  if (!Object.hasOwn(COFFEE_MEASURE_LIMITS, unit)) return false;
  const { min, max } = COFFEE_MEASURE_LIMITS[unit];
  return Number.isFinite(value) && value >= min && value <= max && Math.abs(value * 100 - Math.round(value * 100)) < 1e-8;
}

/** These are estimates for loose, level ground coffee; weight remains canonical. */
export function estimateCoffeeMeasures(coffeeGrams, { gramsPerScoop, gramsPerDl } = {}) {
  if (!Number.isFinite(coffeeGrams) || coffeeGrams <= 0 || !validCoffeeMeasureFactor(gramsPerScoop, 'scoop') || !validCoffeeMeasureFactor(gramsPerDl, 'dl')) return null;
  return { scoops: coffeeGrams / gramsPerScoop, coffeeDl: coffeeGrams / gramsPerDl };
}

/** Water is tank input, not a promise about finished beverage yield. */
export function calculateBatch(plan, settings) {
  const { mode, waterMl, cups, cupMl, gramsPerLitre, capacityMl } = settings;
  const errors = {};
  const integer = value => Number.isFinite(value) && Number.isInteger(value);
  if (!['water', 'cups'].includes(mode)) errors.amount = 'Välj vattenmängd eller antal koppar.';
  if (mode === 'cups' && (!integer(cups) || cups < 1 || cups > 16)) errors.amount = 'Ange 1–16 hela koppar.';
  if (mode === 'cups' && ![125, 200, 250].includes(cupMl)) errors.cupSize = 'Välj en koppstorlek i listan.';
  if (!integer(capacityMl) || capacityMl < plan.minWaterMl || capacityMl > plan.maxWaterMl) errors.capacity = `Ange bryggarens maxvolym mellan ${plan.minWaterMl} och ${plan.maxWaterMl} ml.`;
  if (!integer(gramsPerLitre) || gramsPerLitre < 50 || gramsPerLitre > 75) errors.strength = 'Ange 50–75 g kaffe per liter vatten.';
  const requestedWater = mode === 'cups' ? cups * cupMl : waterMl;
  if (!errors.amount && (!integer(requestedWater) || requestedWater < plan.minWaterMl || requestedWater > plan.maxWaterMl)) errors.amount = `Välj en batch mellan ${plan.minWaterMl} och ${plan.maxWaterMl} ml vatten.`;
  if (!errors.amount && !errors.capacity && requestedWater > capacityMl) errors.amount = 'Mängden överstiger bryggarens maxvolym. Minska batchen eller kontrollera kapaciteten.';
  if (Object.keys(errors).length) return { errors, result: null };
  return { errors, result: { waterMl: requestedWater, coffeeGrams: Math.round(requestedWater * gramsPerLitre / 100) / 10, gramsPerLitre } };
}
