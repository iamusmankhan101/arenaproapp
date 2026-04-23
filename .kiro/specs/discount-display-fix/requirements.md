# Requirements Document

## Introduction

This specification addresses the discount display issues across the ArenaPro mobile application. Currently, discount values are hardcoded or inconsistently checked, leading to incorrect or missing discount information. The system must display dynamic discount values from Firestore venue data and show discounted pricing calculations consistently across all venue display components.

## Glossary

- **Venue**: A sports facility available for booking in the system
- **Discount_System**: The component responsible for retrieving and displaying discount information
- **Discount_Badge**: A UI element that displays the discount percentage
- **Discounted_Price**: The calculated price after applying the discount percentage
- **Original_Price**: The base price before discount (pricePerHour or pricing.basePrice)
- **Firestore**: The database system storing venue data
- **HomeScreen**: The main screen showing recommended and nearby venues
- **HomeScreenRedesigned**: An alternative home screen implementation
- **TurfDetailScreen**: The detailed view of a specific venue
- **TurfCard**: A reusable component for displaying venue information

## Requirements

### Requirement 1: Dynamic Discount Retrieval

**User Story:** As a user, I want to see accurate discount information for venues, so that I can make informed booking decisions based on current promotions.

#### Acceptance Criteria

1. WHEN a venue document is retrieved from Firestore, THE Discount_System SHALL check for both `discount` and `discountPercentage` fields
2. WHEN both `discount` and `discountPercentage` fields exist, THE Discount_System SHALL use `discountPercentage` as the primary source
3. WHEN a venue has a discount value greater than 0, THE Discount_System SHALL make the discount available to display components
4. WHEN a venue has no discount or a discount value of 0, THE Discount_System SHALL indicate no discount is available

### Requirement 2: Conditional Discount Badge Display

**User Story:** As a user, I want to see discount badges only when discounts are actually available, so that I am not confused by empty or misleading promotional indicators.

#### Acceptance Criteria

1. WHEN a venue has no discount value, THE Discount_Badge SHALL not be rendered
2. WHEN a venue has a discount value of 0, THE Discount_Badge SHALL not be rendered
3. WHEN a venue has a discount value greater than 0, THE Discount_Badge SHALL be rendered with the discount percentage
4. THE Discount_Badge SHALL display the format "{discount}% Off" where {discount} is the numeric value

### Requirement 3: TurfDetailScreen Discount Display

**User Story:** As a user viewing venue details, I want to see the current discount and discounted pricing, so that I understand the savings I will receive.

#### Acceptance Criteria

1. WHEN TurfDetailScreen displays a venue with a discount, THE Discount_Badge SHALL show the dynamic discount value from Firestore
2. WHEN TurfDetailScreen displays a venue without a discount, THE Discount_Badge SHALL not be rendered
3. WHEN a discount exists, THE TurfDetailScreen SHALL display the original price with strikethrough styling
4. WHEN a discount exists, THE TurfDetailScreen SHALL display the calculated discounted price
5. THE discounted price SHALL be calculated as: originalPrice * (1 - discount/100)

### Requirement 4: HomeScreen Discount Display

**User Story:** As a user browsing venues on the home screen, I want to see which venues have discounts, so that I can quickly identify promotional offers.

#### Acceptance Criteria

1. WHEN HomeScreen displays a venue card, THE Discount_System SHALL check both `discount` and `discountPercentage` fields
2. WHEN a venue has a discount value greater than 0, THE Discount_Badge SHALL be displayed on the venue card
3. WHEN a venue has no discount, THE Discount_Badge SHALL not be rendered
4. WHEN a discount exists, THE HomeScreen SHALL display the discounted price calculation
5. THE discounted price display SHALL show both original price (strikethrough) and discounted price

### Requirement 5: HomeScreenRedesigned Discount Display

**User Story:** As a user on the redesigned home screen, I want to see discount information consistently with the main home screen, so that I have a uniform experience.

#### Acceptance Criteria

1. WHEN HomeScreenRedesigned displays a venue card, THE Discount_System SHALL check both `discount` and `discountPercentage` fields
2. WHEN a venue has a discount value greater than 0, THE Discount_Badge SHALL be displayed on the venue card
3. WHEN a venue has no discount, THE Discount_Badge SHALL not be rendered
4. THE discount display behavior SHALL match the HomeScreen implementation
5. WHEN a discount exists, THE HomeScreenRedesigned SHALL display the discounted price calculation

### Requirement 6: TurfCard Discount Display

**User Story:** As a user viewing venue cards in various parts of the app, I want to see discount information on the TurfCard component, so that I can identify promotional offers regardless of where the card appears.

#### Acceptance Criteria

1. WHEN TurfCard receives venue data with a discount, THE Discount_Badge SHALL be rendered
2. WHEN TurfCard receives venue data without a discount, THE Discount_Badge SHALL not be rendered
3. THE TurfCard SHALL check both `discount` and `discountPercentage` fields
4. WHEN a discount exists, THE TurfCard SHALL display the discounted price calculation
5. THE discounted price display SHALL show both original price (strikethrough) and discounted price

### Requirement 7: Discount Calculation Accuracy

**User Story:** As a user, I want discount calculations to be mathematically correct, so that I can trust the pricing information displayed.

#### Acceptance Criteria

1. WHEN calculating a discounted price, THE Discount_System SHALL use the formula: discountedPrice = originalPrice * (1 - discount/100)
2. WHEN the original price is from `pricePerHour`, THE Discount_System SHALL use that value
3. WHEN the original price is from `pricing.basePrice`, THE Discount_System SHALL use that value
4. WHEN both price fields exist, THE Discount_System SHALL prioritize `pricePerHour`
5. THE calculated discounted price SHALL be rounded to the nearest integer for display

### Requirement 8: Visual Consistency

**User Story:** As a user, I want discount displays to follow the app's design system, so that the interface feels cohesive and professional.

#### Acceptance Criteria

1. THE Discount_Badge SHALL use the primary brand color (#004d43) as background
2. THE Discount_Badge SHALL use the secondary brand color (#e8ee26) for text
3. THE Discount_Badge text SHALL use ClashDisplay-Medium font family
4. THE original price strikethrough SHALL use Montserrat font family
5. THE discounted price SHALL use Montserrat font family with appropriate weight

### Requirement 9: Data Field Compatibility

**User Story:** As a system, I want to handle both legacy and new discount field names, so that existing venue data continues to work correctly.

#### Acceptance Criteria

1. WHEN a venue document contains only `discount` field, THE Discount_System SHALL use that value
2. WHEN a venue document contains only `discountPercentage` field, THE Discount_System SHALL use that value
3. WHEN a venue document contains both fields, THE Discount_System SHALL prioritize `discountPercentage`
4. WHEN neither field exists, THE Discount_System SHALL treat the discount as 0
5. THE Discount_System SHALL handle null, undefined, and 0 values equivalently as "no discount"
