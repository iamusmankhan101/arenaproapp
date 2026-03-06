/**
 * Discount Utilities
 * 
 * Centralized utility functions for handling discount calculations and display logic
 * across the ArenaPro mobile application.
 */

/**
 * Extracts discount value from venue data with field priority
 * Priority: discountPercentage > discount
 * 
 * @param {Object} venue - Venue object from Firestore
 * @returns {number} - Discount percentage (0 if no discount)
 */
export function getDiscountValue(venue) {
  if (!venue) return 0;
  
  // Priority: discountPercentage > discount
  const discount = venue.discountPercentage ?? venue.discount ?? 0;
  
  // Ensure it's a valid number
  const numericDiscount = Number(discount);
  if (isNaN(numericDiscount)) return 0;
  
  // Treat negative values as 0
  return numericDiscount < 0 ? 0 : numericDiscount;
}

/**
 * Checks if venue has a valid discount
 * 
 * @param {Object} venue - Venue object from Firestore
 * @returns {boolean} - True if discount exists and is greater than 0
 */
export function hasDiscount(venue) {
  return getDiscountValue(venue) > 0;
}

/**
 * Calculates discounted price with proper rounding
 * Formula: discountedPrice = originalPrice * (1 - discount/100)
 * 
 * @param {number} originalPrice - Original price per hour
 * @param {number} discountPercentage - Discount percentage
 * @returns {number} - Discounted price rounded to nearest integer
 */
export function calculateDiscountedPrice(originalPrice, discountPercentage) {
  if (!originalPrice || !discountPercentage || discountPercentage <= 0) {
    return originalPrice;
  }
  
  // Cap discount at 100%
  const cappedDiscount = Math.min(discountPercentage, 100);
  
  if (cappedDiscount !== discountPercentage) {
    console.warn(`Discount ${discountPercentage}% exceeds 100%, capping at 100%`);
  }
  
  const discounted = originalPrice * (1 - cappedDiscount / 100);
  return Math.round(discounted);
}

/**
 * Gets original price from venue data with field priority
 * Priority: pricePerHour > pricing.basePrice
 * 
 * @param {Object} venue - Venue object from Firestore
 * @returns {number} - Original price per hour
 */
export function getOriginalPrice(venue) {
  if (!venue) return 0;
  
  // Priority: pricePerHour > pricing.basePrice
  const price = venue.pricePerHour ?? venue.pricing?.basePrice ?? 0;
  
  if (price === 0) {
    console.warn('Venue has no valid price field:', venue.id || 'unknown');
  }
  
  return price;
}
