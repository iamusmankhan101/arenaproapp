# Design Document: Discount Display Fix

## Overview

This design addresses the discount display inconsistencies across the ArenaPro mobile application. The solution implements a unified approach to retrieving discount data from Firestore, conditionally rendering discount badges, and calculating discounted prices. The implementation focuses on four key components: TurfDetailScreen, HomeScreen, HomeScreenRedesigned, and TurfCard.

## Architecture

### Component Structure

```
Discount Display System
├── Data Layer (Firestore venue documents)
│   ├── discount field (legacy)
│   └── discountPercentage field (primary)
├── Display Components
│   ├── TurfDetailScreen
│   ├── HomeScreen
│   ├── HomeScreenRedesigned
│   └── TurfCard
└── Utility Functions
    ├── getDiscountValue()
    ├── calculateDiscountedPrice()
    └── hasDiscount()
```

### Data Flow

1. Venue data retrieved from Firestore
2. Discount value extracted using field priority logic
3. Conditional rendering decision made
4. If discount exists: calculate discounted price
5. Render discount badge and pricing information

## Components and Interfaces

### Utility Functions

```javascript
// src/utils/discountUtils.js

/**
 * Extracts discount value from venue data with field priority
 * @param {Object} venue - Venue object from Firestore
 * @returns {number} - Discount percentage (0 if no discount)
 */
export function getDiscountValue(venue) {
  if (!venue) return 0;
  
  // Priority: discountPercentage > discount
  const discount = venue.discountPercentage ?? venue.discount ?? 0;
  
  // Ensure it's a valid number
  const numericDiscount = Number(discount);
  return isNaN(numericDiscount) ? 0 : numericDiscount;
}

/**
 * Checks if venue has a valid discount
 * @param {Object} venue - Venue object from Firestore
 * @returns {boolean} - True if discount exists and is greater than 0
 */
export function hasDiscount(venue) {
  return getDiscountValue(venue) > 0;
}

/**
 * Calculates discounted price
 * @param {number} originalPrice - Original price per hour
 * @param {number} discountPercentage - Discount percentage
 * @returns {number} - Discounted price rounded to nearest integer
 */
export function calculateDiscountedPrice(originalPrice, discountPercentage) {
  if (!originalPrice || !discountPercentage || discountPercentage <= 0) {
    return originalPrice;
  }
  
  const discounted = originalPrice * (1 - discountPercentage / 100);
  return Math.round(discounted);
}

/**
 * Gets original price from venue data with field priority
 * @param {Object} venue - Venue object from Firestore
 * @returns {number} - Original price per hour
 */
export function getOriginalPrice(venue) {
  if (!venue) return 0;
  
  // Priority: pricePerHour > pricing.basePrice
  return venue.pricePerHour ?? venue.pricing?.basePrice ?? 0;
}
```

### Discount Badge Component

```javascript
// Reusable discount badge styling
const discountBadgeStyles = {
  discountBadge: {
    backgroundColor: theme.colors.primary, // #004d43
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  discountText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.secondary, // #e8ee26
    fontFamily: 'ClashDisplay-Medium',
  },
};
```

### Price Display Component

```javascript
// Price display with discount
const PriceDisplay = ({ venue }) => {
  const originalPrice = getOriginalPrice(venue);
  const discount = getDiscountValue(venue);
  const showDiscount = hasDiscount(venue);
  const discountedPrice = showDiscount 
    ? calculateDiscountedPrice(originalPrice, discount)
    : originalPrice;

  return (
    <View style={styles.priceContainer}>
      {showDiscount && (
        <Text style={styles.originalPrice}>
          PKR {originalPrice}
        </Text>
      )}
      <Text style={styles.finalPrice}>
        PKR {showDiscount ? discountedPrice : originalPrice}
        <Text style={styles.priceUnit}> /hour</Text>
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  originalPrice: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textDecorationLine: 'line-through',
    fontFamily: 'Montserrat_400Regular',
  },
  finalPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.primary,
    fontFamily: 'Montserrat_700Bold',
  },
  priceUnit: {
    fontSize: 12,
    fontWeight: '400',
    color: theme.colors.textSecondary,
  },
});
```

## Data Models

### Venue Data Structure

```typescript
interface Venue {
  id: string;
  name: string;
  
  // Discount fields (check both for compatibility)
  discount?: number;              // Legacy field
  discountPercentage?: number;    // Primary field
  
  // Price fields (check both for compatibility)
  pricePerHour?: number;          // Primary field
  pricing?: {
    basePrice?: number;           // Alternative field
  };
  
  // Other venue fields...
  images?: string[];
  rating?: number;
  location?: string;
  city?: string;
  sports?: string[] | string;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Discount Value Extraction Consistency

*For any* venue object, calling `getDiscountValue()` multiple times should return the same value, and the value should be a non-negative number.

**Validates: Requirements 1.1, 1.2, 1.3, 1.4, 9.1, 9.2, 9.3, 9.4, 9.5**

### Property 2: Discount Badge Visibility Correctness

*For any* venue object, the discount badge should be visible if and only if `hasDiscount(venue)` returns true.

**Validates: Requirements 2.1, 2.2, 2.3, 3.2, 4.3, 5.3, 6.2**

### Property 3: Discount Calculation Accuracy

*For any* valid original price and discount percentage greater than 0, the calculated discounted price should equal `Math.round(originalPrice * (1 - discount/100))`.

**Validates: Requirements 7.1, 7.5**

### Property 4: Price Field Priority

*For any* venue object with both `pricePerHour` and `pricing.basePrice` fields, `getOriginalPrice()` should return the value of `pricePerHour`.

**Validates: Requirements 7.2, 7.3, 7.4**

### Property 5: Discount Field Priority

*For any* venue object with both `discount` and `discountPercentage` fields, `getDiscountValue()` should return the value of `discountPercentage`.

**Validates: Requirements 1.2, 9.3**

### Property 6: Zero Discount Equivalence

*For any* venue object where the discount value is 0, null, or undefined, `hasDiscount()` should return false.

**Validates: Requirements 1.4, 2.2, 9.5**

### Property 7: Discount Badge Format Consistency

*For any* venue with a discount value greater than 0, the discount badge text should match the format "{discount}% Off" where {discount} is the numeric discount value.

**Validates: Requirements 2.4**

### Property 8: Strikethrough Display Condition

*For any* venue display component, the original price with strikethrough should be shown if and only if `hasDiscount(venue)` returns true.

**Validates: Requirements 3.3, 4.5, 5.5, 6.5**

### Property 9: Discounted Price Display Condition

*For any* venue display component, when a discount exists, both the original price (strikethrough) and discounted price should be displayed.

**Validates: Requirements 3.4, 4.5, 5.5, 6.5**

### Property 10: Component Consistency

*For any* venue object, the discount display behavior should be identical across TurfDetailScreen, HomeScreen, HomeScreenRedesigned, and TurfCard components.

**Validates: Requirements 3.1, 4.1, 4.2, 5.1, 5.2, 5.4, 6.1, 6.3**

## Error Handling

### Invalid Discount Values

- **Scenario**: Venue has non-numeric discount value
- **Handling**: Treat as 0 (no discount)
- **Implementation**: Use `Number()` conversion with `isNaN()` check

### Missing Price Fields

- **Scenario**: Venue has no `pricePerHour` or `pricing.basePrice`
- **Handling**: Return 0 and log warning
- **Implementation**: Use nullish coalescing operator with fallback

### Negative Discount Values

- **Scenario**: Venue has negative discount percentage
- **Handling**: Treat as 0 (no discount)
- **Implementation**: Add validation in `hasDiscount()` function

### Discount Greater Than 100

- **Scenario**: Venue has discount > 100%
- **Handling**: Cap at 100% and log warning
- **Implementation**: Add validation in `calculateDiscountedPrice()`

```javascript
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
```

## Testing Strategy

### Unit Tests

Unit tests will verify specific examples and edge cases:

1. **Discount Value Extraction**
   - Test with only `discount` field
   - Test with only `discountPercentage` field
   - Test with both fields (verify priority)
   - Test with null/undefined values
   - Test with non-numeric values

2. **Price Calculation**
   - Test standard discount (e.g., 15% off 2000 = 1700)
   - Test edge case: 0% discount
   - Test edge case: 100% discount
   - Test edge case: discount > 100%
   - Test rounding behavior

3. **Conditional Rendering**
   - Test badge visibility with discount
   - Test badge visibility without discount
   - Test strikethrough display with discount
   - Test strikethrough display without discount

### Property-Based Tests

Property-based tests will verify universal properties across randomized inputs. Each test should run a minimum of 100 iterations.

**Test Library**: Use `fast-check` for React Native property-based testing.

**Property Test 1: Discount Value Extraction Consistency**
- **Tag**: Feature: discount-display-fix, Property 1: Discount Value Extraction Consistency
- **Generator**: Random venue objects with various discount field combinations
- **Property**: Multiple calls to `getDiscountValue()` return same value, value >= 0

**Property Test 2: Discount Badge Visibility Correctness**
- **Tag**: Feature: discount-display-fix, Property 2: Discount Badge Visibility Correctness
- **Generator**: Random venue objects with various discount values
- **Property**: Badge visible ⟺ `hasDiscount()` returns true

**Property Test 3: Discount Calculation Accuracy**
- **Tag**: Feature: discount-display-fix, Property 3: Discount Calculation Accuracy
- **Generator**: Random positive prices and discount percentages (0-100)
- **Property**: `calculateDiscountedPrice(p, d) === Math.round(p * (1 - d/100))`

**Property Test 4: Price Field Priority**
- **Tag**: Feature: discount-display-fix, Property 4: Price Field Priority
- **Generator**: Random venue objects with both price fields
- **Property**: `getOriginalPrice()` returns `pricePerHour` value

**Property Test 5: Discount Field Priority**
- **Tag**: Feature: discount-display-fix, Property 5: Discount Field Priority
- **Generator**: Random venue objects with both discount fields
- **Property**: `getDiscountValue()` returns `discountPercentage` value

**Property Test 6: Zero Discount Equivalence**
- **Tag**: Feature: discount-display-fix, Property 6: Zero Discount Equivalence
- **Generator**: Random venue objects with 0, null, or undefined discount
- **Property**: `hasDiscount()` returns false

**Property Test 7: Discount Badge Format Consistency**
- **Tag**: Feature: discount-display-fix, Property 7: Discount Badge Format Consistency
- **Generator**: Random venue objects with positive discount values
- **Property**: Badge text matches "{discount}% Off" format

**Property Test 8: Strikethrough Display Condition**
- **Tag**: Feature: discount-display-fix, Property 8: Strikethrough Display Condition
- **Generator**: Random venue objects with various discount values
- **Property**: Strikethrough shown ⟺ `hasDiscount()` returns true

**Property Test 9: Discounted Price Display Condition**
- **Tag**: Feature: discount-display-fix, Property 9: Discounted Price Display Condition
- **Generator**: Random venue objects with positive discount values
- **Property**: Both original (strikethrough) and discounted prices displayed

**Property Test 10: Component Consistency**
- **Tag**: Feature: discount-display-fix, Property 10: Component Consistency
- **Generator**: Random venue objects
- **Property**: All components show same discount information for same venue

### Integration Tests

Integration tests will verify the complete flow:

1. **End-to-End Discount Display**
   - Load venue from Firestore
   - Verify discount badge appears correctly
   - Verify price calculation is correct
   - Verify styling matches design system

2. **Cross-Component Consistency**
   - Display same venue in all four components
   - Verify discount information is identical
   - Verify visual styling is consistent

## Implementation Notes

### File Modifications Required

1. **Create**: `src/utils/discountUtils.js` - New utility file
2. **Modify**: `src/screens/turf/TurfDetailScreen.js` - Line 769 and pricing display
3. **Modify**: `src/screens/main/HomeScreen.js` - Discount badge and price display
4. **Modify**: `src/screens/main/HomeScreenRedesigned.js` - Add discountPercentage check
5. **Modify**: `src/components/TurfCard.js` - Add discount badge and price display

### Backward Compatibility

The solution maintains backward compatibility by:
- Checking both `discount` and `discountPercentage` fields
- Checking both `pricePerHour` and `pricing.basePrice` fields
- Treating missing/null/0 values equivalently
- No breaking changes to existing venue data structure

### Performance Considerations

- Utility functions are pure and can be memoized if needed
- No additional Firestore queries required
- Calculations are simple arithmetic operations
- Conditional rendering prevents unnecessary DOM updates
