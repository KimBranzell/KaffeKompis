/** Quantities scale; technique and time remain method-specific guidance. */
export function validRecipeDose(plan, dose) {
  return Number.isFinite(dose) && dose >= plan.minDoseGrams && dose <= plan.maxDoseGrams
    && dose * plan.ratio <= plan.maxWaterGrams && Math.abs(dose * 10 - Math.round(dose * 10)) < 1e-8;
}

const tenth = value => Math.round((value + Number.EPSILON) * 10) / 10;
export function scaleBrewPlan(plan, dose) {
  if (!validRecipeDose(plan, dose)) return null;
  let baseTotal = 0;
  let previousTarget = 0;
  const steps = plan.steps.map(step => {
    baseTotal += step.waterGrams ?? 0;
    const targetGrams = tenth(baseTotal * dose / plan.coffeeGrams);
    const waterGrams = step.kind === 'pour' ? tenth(targetGrams - previousTarget) : 0;
    previousTarget = targetGrams;
    return { ...step, waterGrams, targetGrams };
  });
  return { coffeeGrams: dose, waterGrams: tenth(dose * plan.ratio), steps };
}

export function stepAtTime(steps, seconds) {
  let index = 0;
  for (let next = 1; next < steps.length && seconds >= steps[next].atSeconds; next++) index = next;
  return index;
}

export function formatBrewTime(seconds) {
  const whole = Math.max(0, Math.floor(seconds));
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, '0')}`;
}

export function formatGrams(grams) {
  return new Intl.NumberFormat('sv-SE', { maximumFractionDigits: 1 }).format(grams);
}

export function recipeTimeLabel(data) {
  return data.brew
    ? `${formatBrewTime(data.brew.targetTime.minSeconds)}–${formatBrewTime(data.brew.targetTime.maxSeconds)}`
    : data.brewTime;
}
