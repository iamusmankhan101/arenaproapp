# Implementation Plan: Discount Display Fix

## Overview

This implementation plan addresses the discount display issues across the ArenaPro mobile application. The approach creates a centralized utility module for discount logic, then systematically updates each display component to use the new utilities. The implementation ensures consistency, accuracy, and proper conditional rendering of discount information.

## Tasks

- [-] 1. Create discount utility module
  - Create `src/utils/discountUtils.js` with utility functions
  - Implement `getDiscountValue()` function with field priority logic
  - Implement `hasDiscount()` function for conditional rendering
  - Implement `calculateDiscountedPrice()` function with rounding
  - Implement `getOriginalPrice()` function with field priority logic
  - Add input validation and error handling for edge cases
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 7.1, 7.2, 7.3, 7.4, 7.5, 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ]* 1.1 Write property test for discount value extraction consistency
  - **Property 1: Discount Value Extraction Consistency**
  - **Validates: Requirements 1.1, 1.2, 1.3, 1.4, 9.1, 9.2, 9.3, 9.4, 9.5**

- [ ]* 1.2 Write property test for price field priority
  - **Property 4: Price Field Priority**
  - **Validates: Requirements 7.2, 7.3, 7.4**

- [ ]* 1.3 Write property test for discount field priority
  - **Property 5: Discount Field Priority**
  - **Validates: Requirements 1.2, 9.3**

- [ ]* 1.4 Write property test for zero discount equivalence
  - **Property 6: Zero Discount Equivalence**
  - **Validates: Requirements 1.4, 2.2, 9.5**

- [ ]* 1.5 Write property test for discount calculation accuracy
  - **Property 3: Discount Calculation Accuracy**
  - **Validates: Requirements 7.1, 7.5**

- [ ]* 1.6 Write unit tests for edge cases
  - Test discount > 100% (should cap at 100%)
  - Test negative discount (should treat as 0)
  - Test non-numeric discount values
  - Test missing price fields
  - _Requirements: 7.1, 7.5, 9.5_

- [x] 2. Update TurfDetailScreen discount display
  - [x] 2.1 Import discount utility functions
    - Add import statement for `discountUtils.js`
    - _Requirements: 3.1_
  
  - [x] 2.2 Replace hardcoded discount badge (line 769)
    - Remove hardcoded "20% Off" text
    - Use `getDiscountValue(venue)` to get dynamic discount
    - Add conditional rendering using `hasDiscount(venue)`
    - Update discount badge text to use dynamic value
    - _Requirements: 3.1, 3.2, 2.1, 2.2, 2.3, 2.4_
  
  - [x] 2.3 Add discounted price display
    - Get original price using `getOriginalPrice(venue)`
    - Calculate discounted price using `calculateDiscountedPrice()`
    - Add original price with strikethrough styling (conditional)
    - Add discounted price display (conditional)
    - Ensure Montserrat font family is used for prices
    - _Requirements: 3.3, 3.4, 3.5, 8.4, 8.5_

- [ ]* 2.4 Write property test for TurfDetailScreen discount badge visibility
  - **Property 2: Discount Badge Visibility Correctness**
  - **Validates: Requirements 2.1, 2.2, 2.3, 3.2**

- [ ]* 2.5 Write property test for TurfDetailScreen strikethrough display
  - **Property 8: Strikethrough Display Condition**
  - **Validates: Requirements 3.3**

- [ ] 3. Update HomeScreen discount display
  - [~] 3.1 Import discount utility functions
    - Add import statement for `discountUtils.js`
    - _Requirements: 4.1_
  
  - [~] 3.2 Update recommended venues discount badge
    - Replace existing discount check with `hasDiscount(venue)`
    - Use `getDiscountValue(venue)` for badge text
    - Ensure conditional rendering is correct
    - _Requirements: 4.1, 4.2, 4.3, 2.4_
  
  - [~] 3.3 Add discounted price display to recommended venues
    - Get original price using `getOriginalPrice(venue)`
    - Calculate discounted price using `calculateDiscountedPrice()`
    - Add original price with strikethrough (conditional)
    - Add discounted price display (conditional)
    - _Requirements: 4.4, 4.5_
  
  - [~] 3.4 Update nearby venues discount badge
    - Replace existing discount check with `hasDiscount(venue)`
    - Use `getDiscountValue(venue)` for badge text
    - Ensure conditional rendering is correct
    - _Requirements: 4.1, 4.2, 4.3, 2.4_
  
  - [~] 3.5 Add discounted price display to nearby venues
    - Get original price using `getOriginalPrice(venue)`
    - Calculate discounted price using `calculateDiscountedPrice()`
    - Add original price with strikethrough (conditional)
    - Add discounted price display (conditional)
    - _Requirements: 4.4, 4.5_

- [ ]* 3.6 Write property test for HomeScreen discount badge visibility
  - **Property 2: Discount Badge Visibility Correctness**
  - **Validates: Requirements 4.3**

- [ ]* 3.7 Write property test for HomeScreen discounted price display
  - **Property 9: Discounted Price Display Condition**
  - **Validates: Requirements 4.5**

- [ ] 4. Update HomeScreenRedesigned discount display
  - [~] 4.1 Import discount utility functions
    - Add import statement for `discountUtils.js`
    - _Requirements: 5.1_
  
  - [~] 4.2 Update recommended venues discount badge
    - Replace `venue.discount` check with `hasDiscount(venue)`
    - Use `getDiscountValue(venue)` for badge text
    - Ensure conditional rendering is correct
    - _Requirements: 5.1, 5.2, 5.3, 2.4_
  
  - [~] 4.3 Add discounted price display to recommended venues
    - Get original price using `getOriginalPrice(venue)`
    - Calculate discounted price using `calculateDiscountedPrice()`
    - Add original price with strikethrough (conditional)
    - Add discounted price display (conditional)
    - _Requirements: 5.4, 5.5_
  
  - [~] 4.4 Update nearby venues discount badge
    - Replace `venue.discount` check with `hasDiscount(venue)`
    - Use `getDiscountValue(venue)` for badge text
    - Ensure conditional rendering is correct
    - _Requirements: 5.1, 5.2, 5.3, 2.4_
  
  - [~] 4.5 Add discounted price display to nearby venues
    - Get original price using `getOriginalPrice(venue)`
    - Calculate discounted price using `calculateDiscountedPrice()`
    - Add original price with strikethrough (conditional)
    - Add discounted price display (conditional)
    - _Requirements: 5.4, 5.5_

- [ ]* 4.6 Write property test for HomeScreenRedesigned discount badge visibility
  - **Property 2: Discount Badge Visibility Correctness**
  - **Validates: Requirements 5.3**

- [ ]* 4.7 Write property test for HomeScreenRedesigned discounted price display
  - **Property 9: Discounted Price Display Condition**
  - **Validates: Requirements 5.5**

- [x] 5. Update TurfCard discount display
  - [x] 5.1 Import discount utility functions
    - Add import statement for `discountUtils.js`
    - _Requirements: 6.1_
  
  - [x] 5.2 Add discount badge to TurfCard
    - Add conditional discount badge rendering using `hasDiscount(venue)`
    - Use `getDiscountValue(venue)` for badge text
    - Position badge on venue image (top-left)
    - Apply brand colors: primary background, secondary text
    - Use ClashDisplay-Medium font family
    - _Requirements: 6.1, 6.2, 6.3, 2.4, 8.1, 8.2, 8.3_
  
  - [x] 5.3 Add discounted price display to TurfCard
    - Get original price using `getOriginalPrice(venue)`
    - Calculate discounted price using `calculateDiscountedPrice()`
    - Add original price with strikethrough (conditional)
    - Add discounted price display (conditional)
    - Use Montserrat font family for prices
    - _Requirements: 6.4, 6.5, 8.4, 8.5_

- [ ]* 5.4 Write property test for TurfCard discount badge visibility
  - **Property 2: Discount Badge Visibility Correctness**
  - **Validates: Requirements 6.2**

- [ ]* 5.5 Write property test for TurfCard discounted price display
  - **Property 9: Discounted Price Display Condition**
  - **Validates: Requirements 6.5**

- [ ] 6. Verify visual consistency across components
  - [~] 6.1 Verify discount badge styling
    - Check primary color (#004d43) background on all components
    - Check secondary color (#e8ee26) text on all components
    - Check ClashDisplay-Medium font on all components
    - Check border radius and padding consistency
    - _Requirements: 8.1, 8.2, 8.3_
  
  - [~] 6.2 Verify price display styling
    - Check Montserrat font family on all components
    - Check strikethrough styling consistency
    - Check discounted price color (primary)
    - Check price unit styling
    - _Requirements: 8.4, 8.5_

- [ ]* 6.3 Write property test for discount badge format consistency
  - **Property 7: Discount Badge Format Consistency**
  - **Validates: Requirements 2.4**

- [ ]* 6.4 Write property test for component consistency
  - **Property 10: Component Consistency**
  - **Validates: Requirements 3.1, 4.1, 4.2, 5.1, 5.2, 5.4, 6.1, 6.3**

- [x] 7. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests validate universal correctness properties with minimum 100 iterations
- Unit tests validate specific examples and edge cases
- The implementation maintains backward compatibility with existing venue data
- All discount badges use brand colors: primary (#004d43) background, secondary (#e8ee26) text
- All text uses specified font families: ClashDisplay-Medium for badges, Montserrat for prices
