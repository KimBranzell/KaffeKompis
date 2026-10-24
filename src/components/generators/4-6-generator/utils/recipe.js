export const DEFAULT_RECIPE = Object.freeze({ weight: 20, ratio: 15, roast: 'Medium', strength: 'Balanced', taste: 'Balanced' });
export const DOSE_LIMITS = Object.freeze({ min: 6, max: 76, step: 0.1 });
export const RATIOS = Object.freeze([12, 13, 14, 15, 16, 17, 18]);
export const ROASTS = Object.freeze([
  { grade: 'Light', label: 'Ljusrost', temperature: 94, color: '#C49669' },
  { grade: 'Medium', label: 'Mellanrost', temperature: 92, color: '#8B4513' },
  { grade: 'Dark', label: 'Mörkrost', temperature: 90, color: '#3E2723' },
]);

export function isValidDose(value) {
  return Number.isFinite(value) && value >= DOSE_LIMITS.min && value <= DOSE_LIMITS.max
    && Math.abs(value * 10 - Math.round(value * 10)) < 1e-8;
}

export function validateRecipe(recipe) {
  if (!recipe || !isValidDose(recipe.weight)) return { field: 'weight', message: 'Ange 6–76 gram kaffe med högst en decimal.' };
  if (!RATIOS.includes(recipe.ratio)) return { field: 'ratio', message: 'Välj ett bryggförhållande mellan 1:12 och 1:18.' };
  if (!ROASTS.some(({ grade }) => grade === recipe.roast)
    || !['Strong', 'Balanced', 'Weak'].includes(recipe.strength)
    || !['Acidic', 'Balanced', 'Sweet'].includes(recipe.taste)) {
    return { field: 'profile', message: 'Välj en giltig rostning, styrka och smakprofil.' };
  }
  return null;
}

export function temperatureForRoast(roast) {
  return ROASTS.find(({ grade }) => grade === roast)?.temperature ?? 92;
}

const STORAGE_KEYS = { weight: '46method.coffeeWeight', ratio: '46method.waterRatio', roast: '46method.roastGrade', strength: '46method.strength', taste: '46method.taste' };

export function readSavedRecipe(storage) {
  const recipe = { ...DEFAULT_RECIPE };
  for (const [field, key] of Object.entries(STORAGE_KEYS)) {
    try {
      const raw = storage?.getItem(key);
      if (raw == null || raw.trim() === '') continue;
      const value = field === 'weight' || field === 'ratio' ? Number(raw) : raw;
      if (!validateRecipe({ ...DEFAULT_RECIPE, [field]: value })) recipe[field] = value;
    } catch {
      // Browsing restrictions must not prevent brewing with the defaults.
    }
  }
  return recipe;
}

export function saveRecipe(storage, recipe) {
  if (validateRecipe(recipe)) return;
  try {
    for (const [field, key] of Object.entries(STORAGE_KEYS)) storage?.setItem(key, String(recipe[field]));
  } catch {
    // Preferences are optional; the current recipe remains usable.
  }
}
