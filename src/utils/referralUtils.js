/**
 * Generate a referral code from user's name
 * @param {string} fullName - User's full name
 * @returns {string} - 8 character referral code
 */
export const generateReferralCode = (fullName) => {
  if (!fullName || !fullName.trim()) {
    // Fallback to random code if no name provided
    return generateRandomCode();
  }

  // Remove special characters and spaces, convert to uppercase
  const cleanName = fullName
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase();

  if (cleanName.length === 0) {
    return generateRandomCode();
  }

  // Take first 4 characters of name (or pad with X if shorter)
  let namePrefix = cleanName.substring(0, 4).padEnd(4, 'X');

  // Generate 4 random alphanumeric characters
  const randomSuffix = generateRandomString(4);

  return namePrefix + randomSuffix;
};

/**
 * Generate a random alphanumeric string
 * @param {number} length - Length of the string
 * @returns {string}
 */
const generateRandomString = (length) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Generate a completely random code
 * @returns {string} - 8 character random code
 */
const generateRandomCode = () => {
  return generateRandomString(8);
};

/**
 * Validate referral code format
 * @param {string} code - Referral code to validate
 * @returns {boolean}
 */
export const isValidReferralCodeFormat = (code) => {
  if (!code || typeof code !== 'string') {
    return false;
  }

  // Must be 8 characters, alphanumeric only
  const regex = /^[A-Z0-9]{8}$/;
  return regex.test(code.toUpperCase());
};

/**
 * Format referral code for display
 * @param {string} code - Referral code
 * @returns {string} - Formatted code (e.g., "ABCD-1234")
 */
export const formatReferralCode = (code) => {
  if (!code || code.length !== 8) {
    return code;
  }

  return `${code.substring(0, 4)}-${code.substring(4)}`;
};
