/**
 * Functions for encoding, decoding and sharing coffee recipes
 */
/**
 * Encodes a coffee recipe into a compact hash string.
 *
 * @param {number} coffeeWeight - The weight of the coffee in grams.
 * @param {number} waterRatio - The ratio of water to coffee, as a percentage.
 * @param {string} roastGrade - The roast grade of the coffee, one of 'Light', 'Medium', or 'Dark'.
 * @param {string} strength - The strength of the coffee, one of 'Strong', 'Balanced', or 'Weak'.
 * @param {string} taste - The taste profile of the coffee, one of 'Acidic', 'Balanced', or 'Sweet'.
 * @returns {string} A compact hash string representing the coffee recipe.
 */
export function encodeRecipeToHash(coffeeWeight, waterRatio, roastGrade, strength, taste) {
  const roastMap = { Light: 0, Medium: 1, Dark: 2 };
  const strengthMap = { Strong: 0, Balanced: 1, Weak: 2 };
  const tasteMap = { Acidic: 0, Balanced: 1, Sweet: 2 };

  const packed =
    coffeeWeight * 1000000 +
    waterRatio * 10000 +
    roastMap[roastGrade] * 1000 +
    strengthMap[strength] * 100 +
    tasteMap[taste] * 10;

  return packed.toString(36);
}

export function syncRecipeHash(hash) {
  const nextUrl = `${window.location.pathname}${window.location.search}#${hash}`;
  window.history.replaceState(null, "", nextUrl);
}

/**
 * Decodes a compact hash string back into a coffee recipe.
 *
 * @param {string} hash - A compact hash string representing a coffee recipe.
 * @returns {Object} An object containing the coffee recipe details, or `null` if the hash is invalid.
 * @property {number} weight - The weight of the coffee in grams.
 * @property {number} ratio - The ratio of water to coffee, as a percentage.
 * @property {string} roast - The roast grade of the coffee, one of 'Light', 'Medium', or 'Dark'.
 * @property {string} strength - The strength of the coffee, one of 'Strong', 'Balanced', or 'Weak'.
 * @property {string} taste - The taste profile of the coffee, one of 'Acidic', 'Balanced', or 'Sweet'.
 */
export function decodeHashToRecipe(hash) {
  const roastMap = { 0: 'Light', 1: 'Medium', 2: 'Dark' };
  const strengthMap = { 0: 'Strong', 1: 'Balanced', 2: 'Weak' };
  const tasteMap = { 0: 'Acidic', 1: 'Balanced', 2: 'Sweet' };

  try {
    const packed = parseInt(hash, 36);

    // Extract values
    const weight = Math.floor(packed / 1000000);
    const ratio = Math.floor((packed % 1000000) / 10000);
    const roastIndex = Math.floor((packed % 10000) / 1000);
    const strengthIndex = Math.floor((packed % 1000) / 100);
    const tasteIndex = Math.floor((packed % 100) / 10);

    // Create decoded object with proper type checking
    const decoded = {
      weight: isNaN(weight) ? 20 : weight,
      ratio: isNaN(ratio) ? 15 : ratio,
      roast: roastMap[roastIndex] || 'Medium',
      strength: strengthMap[strengthIndex] || 'Balanced',
      taste: tasteMap[tasteIndex] || 'Balanced'
    };

    return decoded;
  } catch {
    return null;
  }
}

/**
 * Shares a coffee recipe by encoding it into a compact hash string and generating a shareable URL.
 *
 * @param {Object} recipe - The coffee recipe to share.
 * @param {number} recipe.weight - The weight of the coffee in grams.
 * @param {number} recipe.ratio - The ratio of water to coffee, as a percentage.
 * @param {string} recipe.roast - The roast grade of the coffee, one of 'Light', 'Medium', or 'Dark'.
 * @param {string} recipe.strength - The strength of the coffee, one of 'Strong', 'Balanced', or 'Weak'.
 * @param {string} recipe.taste - The taste profile of the coffee, one of 'Acidic', 'Balanced', or 'Sweet'.
 * @returns {Promise<boolean>} A promise that resolves to `true` if the recipe was successfully shared, or `false` if an error occurred.
 */
export async function shareRecipe({ coffeeWeight, waterRatio, roastGrade, strength, taste }) {
  const hash = encodeRecipeToHash(coffeeWeight, waterRatio, roastGrade, strength, taste);
  syncRecipeHash(hash);
  const shareableUrl = `${window.location.origin}${window.location.pathname}#${hash}`;

  try {
    if (navigator.share) {
      await navigator.share({
        title: 'Min 4:6-metod på Kaffekompis',
        text: 'Kolla in mitt kafferecept!',
        url: shareableUrl
      });

      return {
        success: true,
        method: 'share',
        message: 'Delat!'
      };
    }

    await navigator.clipboard.writeText(shareableUrl);

    return {
      success: true,
      method: 'clipboard',
      message: 'Kopierad!'
    };
  } catch {
    return {
      success: false,
      method: navigator.share ? 'share' : 'clipboard',
      message: 'Kunde inte dela receptet'
    };
  }
}
