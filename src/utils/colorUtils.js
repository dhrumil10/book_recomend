// src/utils/colorUtils.js

// Available style-compatible colors
const TAILWIND_COLORS = ['indigo', 'red', 'green', 'blue', 'yellow', 'purple', 'pink', 'orange'];

/**
 * Generates a consistent color based on a string identifier
 * @param {string} str - String to use for generating color
 * @returns {string} - A color name consistent with Tailwind classes
 */
export const getConsistentColor = (str) => {
  if (!str) return TAILWIND_COLORS[0];
  
  // Generate a consistent index based on string hash
  const charSum = String(str).split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return TAILWIND_COLORS[charSum % TAILWIND_COLORS.length];
};