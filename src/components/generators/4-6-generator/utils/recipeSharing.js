import { validateRecipe } from './recipe.js';

/** Versioned parameters preserve decimal doses without overlapping packed fields. */
export function encodeRecipe(recipe) {
  if (validateRecipe(recipe)) return null;
  return ['v1', recipe.weight, recipe.ratio, recipe.roast, recipe.strength, recipe.taste].join(':');
}

export function decodeRecipe(value) {
  if (typeof value !== 'string' || value.length > 100) return null;
  const [version, weight, ratio, roast, strength, taste, extra] = value.split(':');
  if (version !== 'v1' || extra !== undefined || !/^\d+(?:\.\d)?$/.test(weight) || !/^\d+$/.test(ratio)) return null;
  const recipe = { weight: Number(weight), ratio: Number(ratio), roast, strength, taste };
  return validateRecipe(recipe) ? null : recipe;
}

/** Strict compatibility decoder for previously shared integer-dose links. */
export function decodeHashToRecipe(hash) {
  if (typeof hash !== 'string' || !/^[0-9a-z]{4,6}$/.test(hash)) return null;
  const packed = parseInt(hash, 36);
  if (!Number.isSafeInteger(packed) || packed % 10 !== 0) return null;
  const recipe = {
    weight: Math.floor(packed / 1000000),
    ratio: Math.floor((packed % 1000000) / 10000),
    roast: ['Light', 'Medium', 'Dark'][Math.floor((packed % 10000) / 1000)],
    strength: ['Strong', 'Balanced', 'Weak'][Math.floor((packed % 1000) / 100)],
    taste: ['Acidic', 'Balanced', 'Sweet'][Math.floor((packed % 100) / 10)],
  };
  return validateRecipe(recipe) ? null : recipe;
}

export function recipeFromUrl(url) {
  if (url.searchParams.has('recipe')) return decodeRecipe(url.searchParams.get('recipe'));
  return decodeHashToRecipe(url.hash.slice(1));
}

export function createShareUrl(href, recipe) {
  const encoded = encodeRecipe(recipe);
  if (!encoded) return null;
  const url = new URL(href);
  url.searchParams.set('recipe', encoded);
  url.hash = '';
  return url;
}

export async function shareRecipe(recipe) {
  const url = createShareUrl(window.location.href, recipe);
  if (!url) return { success: false, message: 'Kontrollera receptets värden innan du delar.' };
  window.history.replaceState(null, '', url);
  if (navigator.share) {
    try {
      await navigator.share({ title: 'Min 4:6-metod på Kaffekompis', text: 'Mitt bryggrecept', url: url.href });
      return { success: true, message: 'Receptet har delats.' };
    } catch (error) {
      if (error.name === 'AbortError') return { success: false, message: 'Delningen avbröts.' };
    }
  }
  try {
    await navigator.clipboard.writeText(url.href);
    return { success: true, message: 'Receptlänken har kopierats.' };
  } catch {
    return { success: false, message: 'Kunde inte kopiera länken. Kopiera adressen i adressfältet.' };
  }
}
