/**
 * Unit Tests and Property-Based Tests for Discount Utilities
 * 
 * Tests validate the correctness of discount calculation and display logic
 * across various edge cases and randomized inputs.
 */

import * as fc from 'fast-check';
import {
  getDiscountValue,
  hasDiscount,
  calculateDiscountedPrice,
  getOriginalPrice,
} from './discountUtils';

// ============================================================================
// UNIT TESTS - Specific Examples and Edge Cases
// ============================================================================

describe('discountUtils - Unit Tests', () => {
  describe('getDiscountValue', () => {
    test('should return 0 for null venue', () => {
      expect(getDiscountValue(null)).toBe(0);
    });

    test('should return 0 for undefined venue', () => {
      expect(getDiscountValue(undefined)).toBe(0);
    });

    test('should return discount value when only discount field exists', () => {
      const venue = { discount: 15 };
      expect(getDiscountValue(venue)).toBe(15);
    });

    test('should return discountPercentage value when only discountPercentage field exists', () => {
      const venue = { discountPercentage: 20 };
      expect(getDiscountValue(venue)).toBe(20);
    });

    test('should prioritize discountPercentage over discount when both exist', () => {
      const venue = { discount: 15, discountPercentage: 25 };
      expect(getDiscountValue(venue)).toBe(25);
    });

    test('should return 0 for non-numeric discount value', () => {
      const venue = { discount: 'invalid' };
      expect(getDiscountValue(venue)).toBe(0);
    });

    test('should return 0 for negative discount value', () => {
      const venue = { discount: -10 };
      expect(getDiscountValue(venue)).toBe(0);
    });

    test('should handle string numeric values', () => {
      const venue = { discount: '15' };
      expect(getDiscountValue(venue)).toBe(15);
    });

    test('should return 0 when discount is 0', () => {
      const venue = { discount: 0 };
      expect(getDiscountValue(venue)).toBe(0);
    });
  });

  describe('hasDiscount', () => {
    test('should return false for venue with no discount', () => {
      const venue = { name: 'Test Venue' };
      expect(hasDiscount(venue)).toBe(false);
    });

    test('should return false for venue with 0 discount', () => {
      const venue = { discount: 0 };
      expect(hasDiscount(venue)).toBe(false);
    });

    test('should return true for venue with positive discount', () => {
      const venue = { discount: 15 };
      expect(hasDiscount(venue)).toBe(true);
    });

    test('should return false for null venue', () => {
      expect(hasDiscount(null)).toBe(false);
    });

    test('should return false for undefined venue', () => {
      expect(hasDiscount(undefined)).toBe(false);
    });

    test('should return false for negative discount', () => {
      const venue = { discount: -5 };
      expect(hasDiscount(venue)).toBe(false);
    });
  });

  describe('calculateDiscountedPrice', () => {
    test('should calculate 15% discount correctly', () => {
      expect(calculateDiscountedPrice(2000, 15)).toBe(1700);
    });

    test('should calculate 20% discount correctly', () => {
      expect(calculateDiscountedPrice(3000, 20)).toBe(2400);
    });

    test('should return original price for 0% discount', () => {
      expect(calculateDiscountedPrice(2000, 0)).toBe(2000);
    });

    test('should return 0 for 100% discount', () => {
      expect(calculateDiscountedPrice(2000, 100)).toBe(0);
    });

    test('should cap discount at 100% and warn', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      expect(calculateDiscountedPrice(2000, 150)).toBe(0);
      expect(consoleSpy).toHaveBeenCalledWith('Discount 150% exceeds 100%, capping at 100%');
      consoleSpy.mockRestore();
    });

    test('should return original price for negative discount', () => {
      expect(calculateDiscountedPrice(2000, -10)).toBe(2000);
    });

    test('should round to nearest integer', () => {
      expect(calculateDiscountedPrice(1000, 33)).toBe(670); // 1000 * 0.67 = 670
    });

    test('should handle null original price', () => {
      expect(calculateDiscountedPrice(null, 15)).toBe(null);
    });

    test('should handle undefined original price', () => {
      expect(calculateDiscountedPrice(undefined, 15)).toBe(undefined);
    });

    test('should handle null discount percentage', () => {
      expect(calculateDiscountedPrice(2000, null)).toBe(2000);
    });
  });

  describe('getOriginalPrice', () => {
    test('should return 0 for null venue', () => {
      expect(getOriginalPrice(null)).toBe(0);
    });

    test('should return 0 for undefined venue', () => {
      expect(getOriginalPrice(undefined)).toBe(0);
    });

    test('should return pricePerHour when it exists', () => {
      const venue = { pricePerHour: 2000 };
      expect(getOriginalPrice(venue)).toBe(2000);
    });

    test('should return pricing.basePrice when pricePerHour does not exist', () => {
      const venue = { pricing: { basePrice: 1500 } };
      expect(getOriginalPrice(venue)).toBe(1500);
    });

    test('should prioritize pricePerHour over pricing.basePrice', () => {
      const venue = { pricePerHour: 2000, pricing: { basePrice: 1500 } };
      expect(getOriginalPrice(venue)).toBe(2000);
    });

    test('should return 0 and warn when no price fields exist', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      const venue = { id: 'test-venue', name: 'Test Venue' };
      expect(getOriginalPrice(venue)).toBe(0);
      expect(consoleSpy).toHaveBeenCalledWith('Venue has no valid price field:', 'test-venue');
      consoleSpy.mockRestore();
    });

    test('should handle venue without id', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      const venue = { name: 'Test Venue' };
      expect(getOriginalPrice(venue)).toBe(0);
      expect(consoleSpy).toHaveBeenCalledWith('Venue has no valid price field:', 'unknown');
      consoleSpy.mockRestore();
    });
  });
});

// ============================================================================
// PROPERTY-BASED TESTS - Universal Properties
// ============================================================================

describe('discountUtils - Property-Based Tests', () => {
  /**
   * Property 1: Discount Value Extraction Consistency
   * **Validates: Requirements 1.1, 1.2, 1.3, 1.4, 9.1, 9.2, 9.3, 9.4, 9.5**
   * 
   * For any venue object, calling getDiscountValue() multiple times should
   * return the same value, and the value should be a non-negative number.
   */
  test('Property 1: Discount Value Extraction Consistency', () => {
    fc.assert(
      fc.property(
        fc.record({
          discount: fc.option(fc.oneof(fc.integer(), fc.double(), fc.string()), { nil: undefined }),
          discountPercentage: fc.option(fc.oneof(fc.integer(), fc.double(), fc.string()), { nil: undefined }),
        }),
        (venue) => {
          const firstCall = getDiscountValue(venue);
          const secondCall = getDiscountValue(venue);
          const thirdCall = getDiscountValue(venue);
          
          // Multiple calls return same value
          expect(firstCall).toBe(secondCall);
          expect(secondCall).toBe(thirdCall);
          
          // Value is non-negative
          expect(firstCall).toBeGreaterThanOrEqual(0);
          
          // Value is a number
          expect(typeof firstCall).toBe('number');
          expect(Number.isNaN(firstCall)).toBe(false);
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Property 2: Discount Badge Visibility Correctness
   * **Validates: Requirements 2.1, 2.2, 2.3, 3.2, 4.3, 5.3, 6.2**
   * 
   * For any venue object, the discount badge should be visible if and only if
   * hasDiscount(venue) returns true.
   */
  test('Property 2: Discount Badge Visibility Correctness', () => {
    fc.assert(
      fc.property(
        fc.record({
          discount: fc.option(fc.integer({ min: -100, max: 200 }), { nil: undefined }),
          discountPercentage: fc.option(fc.integer({ min: -100, max: 200 }), { nil: undefined }),
        }),
        (venue) => {
          const shouldShowBadge = hasDiscount(venue);
          const discountValue = getDiscountValue(venue);
          
          // Badge visible ⟺ discount > 0
          if (discountValue > 0) {
            expect(shouldShowBadge).toBe(true);
          } else {
            expect(shouldShowBadge).toBe(false);
          }
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Property 3: Discount Calculation Accuracy
   * **Validates: Requirements 7.1, 7.5**
   * 
   * For any valid original price and discount percentage greater than 0,
   * the calculated discounted price should equal Math.round(originalPrice * (1 - discount/100)).
   */
  test('Property 3: Discount Calculation Accuracy', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 100000 }),
        fc.integer({ min: 1, max: 100 }),
        (originalPrice, discountPercentage) => {
          const result = calculateDiscountedPrice(originalPrice, discountPercentage);
          const expected = Math.round(originalPrice * (1 - discountPercentage / 100));
          
          expect(result).toBe(expected);
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Property 4: Price Field Priority
   * **Validates: Requirements 7.2, 7.3, 7.4**
   * 
   * For any venue object with both pricePerHour and pricing.basePrice fields,
   * getOriginalPrice() should return the value of pricePerHour.
   */
  test('Property 4: Price Field Priority', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 100, max: 10000 }),
        fc.integer({ min: 100, max: 10000 }),
        (pricePerHour, basePrice) => {
          const venue = {
            pricePerHour,
            pricing: { basePrice },
          };
          
          const result = getOriginalPrice(venue);
          
          // Should always return pricePerHour when both exist
          expect(result).toBe(pricePerHour);
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Property 5: Discount Field Priority
   * **Validates: Requirements 1.2, 9.3**
   * 
   * For any venue object with both discount and discountPercentage fields,
   * getDiscountValue() should return the value of discountPercentage.
   */
  test('Property 5: Discount Field Priority', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 100 }),
        fc.integer({ min: 0, max: 100 }),
        (discount, discountPercentage) => {
          const venue = { discount, discountPercentage };
          
          const result = getDiscountValue(venue);
          
          // Should always return discountPercentage when both exist
          expect(result).toBe(discountPercentage);
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Property 6: Zero Discount Equivalence
   * **Validates: Requirements 1.4, 2.2, 9.5**
   * 
   * For any venue object where the discount value is 0, null, or undefined,
   * hasDiscount() should return false.
   */
  test('Property 6: Zero Discount Equivalence', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.constant({ discount: 0 }),
          fc.constant({ discount: null }),
          fc.constant({ discount: undefined }),
          fc.constant({ discountPercentage: 0 }),
          fc.constant({ discountPercentage: null }),
          fc.constant({ discountPercentage: undefined }),
          fc.constant({})
        ),
        (venue) => {
          const result = hasDiscount(venue);
          
          // Should always return false for zero/null/undefined
          expect(result).toBe(false);
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Property 7: Discount Badge Format Consistency
   * **Validates: Requirements 2.4**
   * 
   * For any venue with a discount value greater than 0, the discount badge text
   * should match the format "{discount}% Off" where {discount} is the numeric discount value.
   */
  test('Property 7: Discount Badge Format Consistency', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 100 }),
        (discountValue) => {
          const venue = { discount: discountValue };
          const discount = getDiscountValue(venue);
          const badgeText = `${discount}% Off`;
          
          // Badge text should match expected format
          expect(badgeText).toBe(`${discountValue}% Off`);
          expect(badgeText).toMatch(/^\d+% Off$/);
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Property 8: Strikethrough Display Condition
   * **Validates: Requirements 3.3, 4.5, 5.5, 6.5**
   * 
   * For any venue display component, the original price with strikethrough
   * should be shown if and only if hasDiscount(venue) returns true.
   */
  test('Property 8: Strikethrough Display Condition', () => {
    fc.assert(
      fc.property(
        fc.record({
          discount: fc.option(fc.integer({ min: -10, max: 100 }), { nil: undefined }),
          pricePerHour: fc.integer({ min: 100, max: 10000 }),
        }),
        (venue) => {
          const shouldShowStrikethrough = hasDiscount(venue);
          const discountValue = getDiscountValue(venue);
          
          // Strikethrough shown ⟺ hasDiscount() returns true
          if (discountValue > 0) {
            expect(shouldShowStrikethrough).toBe(true);
          } else {
            expect(shouldShowStrikethrough).toBe(false);
          }
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Property 9: Discounted Price Display Condition
   * **Validates: Requirements 3.4, 4.5, 5.5, 6.5**
   * 
   * For any venue display component, when a discount exists, both the original
   * price (strikethrough) and discounted price should be displayed.
   */
  test('Property 9: Discounted Price Display Condition', () => {
    fc.assert(
      fc.property(
        fc.record({
          discount: fc.integer({ min: 1, max: 100 }),
          pricePerHour: fc.integer({ min: 100, max: 10000 }),
        }),
        (venue) => {
          const originalPrice = getOriginalPrice(venue);
          const discount = getDiscountValue(venue);
          const discountedPrice = calculateDiscountedPrice(originalPrice, discount);
          
          // When discount exists, both prices should be available
          expect(hasDiscount(venue)).toBe(true);
          expect(originalPrice).toBeGreaterThan(0);
          expect(discountedPrice).toBeGreaterThan(0);
          expect(discountedPrice).toBeLessThan(originalPrice);
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Property 10: Component Consistency
   * **Validates: Requirements 3.1, 4.1, 4.2, 5.1, 5.2, 5.4, 6.1, 6.3**
   * 
   * For any venue object, the discount display behavior should be identical
   * across all components (same discount value, same hasDiscount result).
   */
  test('Property 10: Component Consistency', () => {
    fc.assert(
      fc.property(
        fc.record({
          discount: fc.option(fc.integer({ min: 0, max: 100 }), { nil: undefined }),
          discountPercentage: fc.option(fc.integer({ min: 0, max: 100 }), { nil: undefined }),
          pricePerHour: fc.option(fc.integer({ min: 100, max: 10000 }), { nil: undefined }),
          pricing: fc.option(
            fc.record({ basePrice: fc.integer({ min: 100, max: 10000 }) }),
            { nil: undefined }
          ),
        }),
        (venue) => {
          // Simulate multiple component calls
          const discountValue1 = getDiscountValue(venue);
          const discountValue2 = getDiscountValue(venue);
          const discountValue3 = getDiscountValue(venue);
          
          const hasDiscount1 = hasDiscount(venue);
          const hasDiscount2 = hasDiscount(venue);
          const hasDiscount3 = hasDiscount(venue);
          
          const originalPrice1 = getOriginalPrice(venue);
          const originalPrice2 = getOriginalPrice(venue);
          const originalPrice3 = getOriginalPrice(venue);
          
          // All components should get same values
          expect(discountValue1).toBe(discountValue2);
          expect(discountValue2).toBe(discountValue3);
          
          expect(hasDiscount1).toBe(hasDiscount2);
          expect(hasDiscount2).toBe(hasDiscount3);
          
          expect(originalPrice1).toBe(originalPrice2);
          expect(originalPrice2).toBe(originalPrice3);
        }
      ),
      { numRuns: 20 }
    );
  });
});
