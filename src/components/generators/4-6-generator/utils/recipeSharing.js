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
    console.log('Packed value:', packed);

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

    console.log('Decoded values:', decoded);
    return decoded;
  } catch (e) {
    console.log('Decoding error:', e);
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
export function shareRecipe({ coffeeWeight, waterRatio, roastGrade, strength, taste }) {
  const hash = encodeRecipeToHash(coffeeWeight, waterRatio, roastGrade, strength, taste);
  const shareableUrl = `${window.location.origin}${window.location.pathname}#${hash}`;

  if (navigator.share) {
    return navigator.share({
      title: 'Min 4:6-metod på Kaffekompis',
      text: 'Kolla in mitt kafferecept!',
      url: shareableUrl
    });
  }

  return navigator.clipboard.writeText(shareableUrl)
    .then(() => {
      // Return an object with additional info that the component can use
      return {
        success: true,
        method: 'clipboard',
        message: 'Kopierad!'
      };
    })
    .catch(() => ({
      success: false,
      method: 'clipboard',
      message: 'Kunde inte kopiera'
    }));
}
