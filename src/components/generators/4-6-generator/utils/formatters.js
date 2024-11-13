/**
 * Formats a number of seconds as a string in the format "minutes:seconds".
 *
 * @param {number} seconds - The number of seconds to format.
 * @returns {string} The formatted time string.
 */
export function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  const formattedSeconds = remainingSeconds.toString().padStart(2, "0");
  return `${minutes}:${formattedSeconds}`;
}

/**
 * Extracts the numeric part of a water to coffee ratio string.
 *
 * @param {string} ratioString - The water to coffee ratio string in the format "1:16".
 * @returns {number|null} - The numeric part of the ratio, or null if the input is invalid.
 */
export function getNumericRatio(ratioString) {
  const parts = ratioString.split(':');
  return parts.length > 1 ? parseInt(parts[1], 10) : null;
}
