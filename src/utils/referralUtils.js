/**
 * Referral System Utilities
 * Handles referral code generation, validation, and constants
 */

// Referral system constants
export const REFERRAL_CONSTANTS = {
    NEW_USER_DISCOUNT: 300,      // Rs. 300 off first booking for new user
    REFERRER_REWARD: 300,         // Rs. 300 off 2nd booking for referrer
    CODE_LENGTH: 7,               // Format: HAMZ-582 (4 letters + dash + 3 digits)
    MIN_NAME_LENGTH: 2,
    MAX_NAME_LENGTH: 4,
    MIN_BOOKINGS_FOR_REFERRAL: 1, // User needs 1 completed booking to get referral code
};

/**
 * Generate a unique referral code from user's name
 * @param {string} name - User's full name
 * @returns {string} Referral code in format: HAMZ-582
 */
export const generateReferralCode = (name) => {
    if (!name || typeof name !== 'string') {
        throw new Error('Invalid name provided for referral code generation');
    }

    // Clean the name: remove non-alphabetic characters and convert to uppercase
    const cleanName = name
        .replace(/[^a-zA-Z]/g, '')
        .toUpperCase()
        .substring(0, REFERRAL_CONSTANTS.MAX_NAME_LENGTH);

    // Ensure we have at least minimum characters
    if (cleanName.length < REFERRAL_CONSTANTS.MIN_NAME_LENGTH) {
        throw new Error('Name too short to generate referral code');
    }

    // Generate 3 random digits
    const randomNum = Math.floor(100 + Math.random() * 900);

    // Return format: HAMZ-582
    return `${cleanName}-${randomNum}`;
};

/**
 * Validate referral code format
 * @param {string} code - Referral code to validate
 * @returns {boolean} True if format is valid
 */
export const validateReferralCodeFormat = (code) => {
    if (!code || typeof code !== 'string') {
        return false;
    }

    // Check format: 2-4 uppercase letters, dash, 3 digits
    const codePattern = /^[A-Z]{2,4}-\d{3}$/;
    return codePattern.test(code.trim());
};

/**
 * Normalize referral code (trim and uppercase)
 * @param {string} code - Referral code to normalize
 * @returns {string} Normalized code
 */
export const normalizeReferralCode = (code) => {
    if (!code || typeof code !== 'string') {
        return '';
    }
    return code.trim().toUpperCase();
};

/**
 * Check if user is eligible for referral discount
 * @param {object} user - User object
 * @returns {boolean} True if eligible
 */
export const isEligibleForReferralDiscount = (user) => {
    if (!user) return false;

    return (
        user.referredBy &&                          // Was referred by someone
        user.referralStatus === 'PENDING' &&        // Hasn't completed first booking yet
        !user.hasCompletedFirstBooking              // First booking flag
    );
};

/**
 * Check if referrer is eligible for reward
 * @param {object} referee - The user who was referred
 * @returns {boolean} True if referrer should get reward
 */
export const isReferrerEligibleForReward = (referee) => {
    if (!referee) return false;

    return (
        referee.referredBy &&                       // Has a referrer
        referee.referralStatus === 'PENDING' &&     // Reward not yet given
        referee.hasCompletedFirstBooking            // Just completed first booking
    );
};

/**
 * Format wallet balance for display
 * @param {number} balance - Wallet balance in PKR
 * @returns {string} Formatted balance
 */
export const formatWalletBalance = (balance) => {
    if (typeof balance !== 'number' || isNaN(balance)) {
        return 'Rs. 0';
    }
    return `Rs. ${balance.toLocaleString()}`;
};

/**
 * Calculate discount amount for booking
 * @param {number} bookingTotal - Total booking amount
 * @param {number} discountAmount - Discount to apply
 * @returns {object} { discountApplied, finalTotal }
 */
export const calculateDiscountedTotal = (bookingTotal, discountAmount) => {
    const total = Number(bookingTotal) || 0;
    const discount = Number(discountAmount) || 0;

    // Discount cannot exceed booking total
    const discountApplied = Math.min(discount, total);
    const finalTotal = Math.max(0, total - discountApplied);

    return {
        discountApplied,
        finalTotal,
    };
};

export default {
    REFERRAL_CONSTANTS,
    generateReferralCode,
    validateReferralCodeFormat,
    normalizeReferralCode,
    isEligibleForReferralDiscount,
    isReferrerEligibleForReward,
    formatWalletBalance,
    calculateDiscountedTotal,
};
