# Peak Hours Feature Documentation

## Overview
The Peak Hours feature allows venue managers to configure dynamic pricing for specific time periods. This enables venues to charge premium rates during high-demand hours (typically evenings and weekends) while maintaining standard rates during off-peak hours.

## Features Added

### 1. Peak Hours Configuration in Venue Form
Located in the **Pricing & Hours** section of the venue registration/edit form:

#### Configuration Options:
- **Enable Peak Hours Pricing**: Toggle to activate/deactivate peak hours
- **Peak Hours Start Time**: Set the start time for peak hours (e.g., 5:00 PM)
- **Peak Hours End Time**: Set the end time for peak hours (e.g., 11:00 PM)
- **Price Multiplier**: Set the pricing multiplier (e.g., 1.5 = 50% markup on base price)

#### Example:
```
Base Price: PKR 2,000 per slot
Peak Hours: 5:00 PM - 11:00 PM
Price Multiplier: 1.5
Peak Price: PKR 3,000 per slot (2,000 × 1.5)
```

### 2. Data Model
Peak hours configuration is stored in the venue document with the following structure:

```javascript
peakHours: {
  enabled: boolean,           // Whether peak hours pricing is active
  startTime: string,          // Start time in HH:MM format (24-hour)
  endTime: string,            // End time in HH:MM format (24-hour)
  priceMultiplier: number     // Multiplier applied to base price
}
```

### 3. Venues Management Page
The Venues page now displays peak hours information in a dedicated column:

- **Peak Hours Column**: Shows the configured peak hours time range and price multiplier
- **Status Indicator**: 
  - Shows "Not configured" if peak hours are disabled
  - Shows time range and multiplier if enabled (highlighted in orange)

### 4. Form Validation
- Peak hours configuration is optional
- When enabled, both start and end times must be provided
- Price multiplier must be >= 1.0
- Peak hours can span across midnight (e.g., 10:00 PM - 2:00 AM)

## Implementation Details

### Files Modified:
1. **admin-web/src/components/AddVenueModal.js**
   - Added `peakHours` to form state
   - Added `handlePeakHoursChange` handler function
   - Added Peak Hours Configuration UI section in Step 2 (Pricing & Media)
   - Updated form reset logic to include peak hours

2. **admin-web/src/pages/VenuesPage.js**
   - Added Peak Hours column to DataGrid
   - Displays peak hours status and multiplier for each venue

### State Management:
Peak hours data is managed through Redux in the admin slice:
- Stored with venue data in Firestore
- Persisted when creating/updating venues
- Retrieved when editing existing venues

## Usage Guide

### For Venue Managers:

#### Setting Up Peak Hours:
1. Go to **Venues Management** page
2. Click **Add Venue** or **Edit** an existing venue
3. Navigate to **Step 3: Pricing & Media**
4. Scroll to **Peak Hours Configuration** section
5. Check **Enable Peak Hours Pricing**
6. Set the peak hours time range (e.g., 5:00 PM - 11:00 PM)
7. Set the price multiplier (e.g., 1.5 for 50% markup)
8. Click **Register Venue** or **Update Venue**

#### Example Scenarios:

**Scenario 1: Evening Peak Hours**
- Base Price: PKR 2,000
- Peak Hours: 5:00 PM - 11:00 PM
- Multiplier: 1.5
- Peak Price: PKR 3,000

**Scenario 2: Weekend Premium**
- Base Price: PKR 1,500
- Peak Hours: 10:00 AM - 10:00 PM (weekends)
- Multiplier: 1.3
- Peak Price: PKR 1,950

**Scenario 3: No Peak Hours**
- Leave "Enable Peak Hours Pricing" unchecked
- All slots charged at base price

## Revenue Impact

### Benefits:
1. **Increased Revenue**: Premium pricing during high-demand periods
2. **Demand Management**: Higher prices can reduce bookings during peak times
3. **Flexibility**: Easy to adjust multipliers based on demand patterns
4. **Competitive Advantage**: Venues can optimize pricing strategy

### Example Revenue Calculation:
```
Scenario: 10 bookings per day
- Off-peak (8 AM - 5 PM): 6 bookings × PKR 2,000 = PKR 12,000
- Peak (5 PM - 11 PM): 4 bookings × PKR 3,000 = PKR 12,000
- Daily Revenue: PKR 24,000

Without Peak Hours:
- 10 bookings × PKR 2,000 = PKR 20,000
- Additional Revenue: PKR 4,000 per day (+20%)
```

## Integration with Revenue Management

Peak hours pricing is reflected in:
1. **Revenue Reports**: Peak vs Off-Peak revenue breakdown
2. **Booking Details**: Shows whether booking is during peak hours
3. **Analytics**: Peak hour utilization and revenue metrics
4. **Customer Pricing**: Customers see peak hour pricing when booking

## API Endpoints

### Venue Creation/Update:
```
POST /admin/venues
PUT /admin/venues/{venueId}

Request Body includes:
{
  ...venueData,
  peakHours: {
    enabled: true,
    startTime: "17:00",
    endTime: "23:00",
    priceMultiplier: 1.5
  }
}
```

### Venue Retrieval:
```
GET /admin/venues
GET /admin/venues/{venueId}

Response includes peakHours configuration
```

## Future Enhancements

Potential improvements for future versions:

1. **Day-Specific Peak Hours**: Different peak hours for weekdays vs weekends
2. **Multiple Peak Periods**: Support for multiple peak hour windows per day
3. **Seasonal Pricing**: Different multipliers for different seasons
4. **Dynamic Pricing**: AI-based pricing recommendations based on demand
5. **Peak Hours Analytics**: Detailed reports on peak hour performance
6. **Customer Notifications**: Alert customers about peak hour pricing
7. **Bulk Configuration**: Apply peak hours settings to multiple venues at once

## Troubleshooting

### Peak Hours Not Showing:
- Ensure "Enable Peak Hours Pricing" is checked
- Verify start and end times are in valid HH:MM format
- Check that price multiplier is >= 1.0

### Peak Hours Not Applied to Bookings:
- Verify peak hours configuration is saved
- Check that booking time falls within peak hours range
- Ensure venue is active and published

### Pricing Calculation Issues:
- Confirm base price is set correctly
- Verify multiplier value (e.g., 1.5 for 50% markup)
- Check for any discount percentages that might affect final price

## Support

For issues or questions about the Peak Hours feature:
1. Check this documentation
2. Review the implementation in AddVenueModal.js
3. Contact the development team

---

**Last Updated**: April 2026
**Version**: 1.0
**Status**: Production Ready
