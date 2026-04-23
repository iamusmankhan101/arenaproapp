# Peak Hours Feature - Visual Guide

## 📊 Feature Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    VENUE MANAGEMENT SYSTEM                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  Venues Page     │
                    │  (DataGrid)      │
                    └──────────────────┘
                              │
                    ┌─────────┴─────────┐
                    ▼                   ▼
            ┌──────────────┐    ┌──────────────┐
            │ Peak Hours   │    │ Other Info   │
            │ Column       │    │ (Price, etc) │
            └──────────────┘    └──────────────┘
                    │
                    ▼
        ┌───────────────────────┐
        │ Peak Hours Config     │
        │ - Time Range          │
        │ - Multiplier          │
        │ - Status              │
        └───────────────────────┘
```

## 🎯 User Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ VENUE MANAGER WORKFLOW                                          │
└─────────────────────────────────────────────────────────────────┘

1. OPEN VENUE FORM
   ┌──────────────────────────────────────────┐
   │ Venues Management Page                   │
   │ [Add Venue] or [Edit Venue]              │
   └──────────────────────────────────────────┘
                    │
                    ▼
2. NAVIGATE TO PRICING SECTION
   ┌──────────────────────────────────────────┐
   │ Step 1: Venue Details                    │
   │ Step 2: Sports & Location                │
   │ Step 3: Pricing & Media ← YOU ARE HERE   │
   └──────────────────────────────────────────┘
                    │
                    ▼
3. CONFIGURE PEAK HOURS
   ┌──────────────────────────────────────────┐
   │ Peak Hours Configuration                 │
   │ ☑ Enable Peak Hours Pricing              │
   │                                          │
   │ Peak Hours Start:    [17:00]             │
   │ Peak Hours End:      [23:00]             │
   │ Price Multiplier:    [1.5]               │
   │                                          │
   │ Peak price: PKR 3,000 per slot           │
   └──────────────────────────────────────────┘
                    │
                    ▼
4. SAVE VENUE
   ┌──────────────────────────────────────────┐
   │ [Register Venue] or [Update Venue]       │
   └──────────────────────────────────────────┘
                    │
                    ▼
5. VIEW IN GRID
   ┌──────────────────────────────────────────┐
   │ Venues Grid                              │
   │ Peak Hours: 17:00 - 23:00 (1.5x)         │
   └──────────────────────────────────────────┘
```

## 💰 Pricing Calculation

```
┌─────────────────────────────────────────────────────────────────┐
│ PRICING LOGIC                                                   │
└─────────────────────────────────────────────────────────────────┘

BASE CONFIGURATION:
┌─────────────────────────────────────────┐
│ Base Price:        PKR 2,000            │
│ Peak Hours:        5:00 PM - 11:00 PM   │
│ Multiplier:        1.5                  │
└─────────────────────────────────────────┘

BOOKING TIME SCENARIOS:

Scenario 1: OFF-PEAK BOOKING
┌─────────────────────────────────────────┐
│ Time: 2:00 PM (14:00)                   │
│ Status: OFF-PEAK                        │
│ Price: PKR 2,000 (base price)           │
└─────────────────────────────────────────┘

Scenario 2: PEAK BOOKING
┌─────────────────────────────────────────┐
│ Time: 7:00 PM (19:00)                   │
│ Status: PEAK HOURS                      │
│ Price: PKR 2,000 × 1.5 = PKR 3,000      │
└─────────────────────────────────────────┘

Scenario 3: LATE NIGHT (OFF-PEAK)
┌─────────────────────────────────────────┐
│ Time: 11:30 PM (23:30)                  │
│ Status: OFF-PEAK (after peak hours)     │
│ Price: PKR 2,000 (base price)           │
└─────────────────────────────────────────┘
```

## 📈 Daily Revenue Timeline

```
TIME SLOTS AND PRICING THROUGHOUT THE DAY

6:00 AM ─────────────────────────────────────────────────────── 11:00 PM
│                                                                │
├─ OFF-PEAK ─────────────────────────────────────────────────────┤
│ PKR 2,000/slot                                                 │
│ 6 AM - 5 PM (11 hours)                                         │
│ Avg 6 bookings = PKR 12,000                                    │
│                                                                │
├─ PEAK HOURS ────────────────────────────────────────────────────┤
│ PKR 3,000/slot (1.5x multiplier)                               │
│ 5 PM - 11 PM (6 hours)                                         │
│ Avg 4 bookings = PKR 12,000                                    │
│                                                                │
└─ TOTAL DAILY REVENUE: PKR 24,000 ──────────────────────────────┘

REVENUE COMPARISON:
┌─────────────────────────────────────────┐
│ Without Peak Hours:                     │
│ 10 bookings × PKR 2,000 = PKR 20,000    │
│                                         │
│ With Peak Hours (1.5x):                 │
│ 6 off-peak × PKR 2,000 = PKR 12,000     │
│ 4 peak × PKR 3,000 = PKR 12,000         │
│ Total = PKR 24,000                      │
│                                         │
│ INCREASE: +PKR 4,000 (+20%)             │
└─────────────────────────────────────────┘
```

## 🎨 UI Components

### Peak Hours Configuration Card

```
┌─────────────────────────────────────────────────────────────┐
│ Peak Hours Configuration                                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ☑ Enable Peak Hours Pricing                                │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ Peak Hours Start    Peak Hours End    Price Multiplier  ││
│ │ [17:00]             [23:00]           [1.5]             ││
│ │ e.g., 5:00 PM      e.g., 11:00 PM    e.g., 1.5 = 50%  ││
│ │                                                         ││
│ │ Peak price will be: PKR 3,000 per slot                 ││
│ └─────────────────────────────────────────────────────────┘│
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Venues Grid - Peak Hours Column

```
┌──────────────────────────────────────────────────────────────┐
│ VENUES MANAGEMENT                                            │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ Venue Name  │ Sports │ Status │ Peak Hours                  │
├─────────────┼────────┼────────┼─────────────────────────────┤
│ Arena Pro   │ Football│ Active │ 17:00 - 23:00              │
│             │        │        │ 1.5x multiplier            │
├─────────────┼────────┼────────┼─────────────────────────────┤
│ Sports Hub  │ Cricket │ Active │ Not configured             │
├─────────────┼────────┼────────┼─────────────────────────────┤
│ Padel Court │ Padel  │ Active │ 18:00 - 22:00              │
│             │        │        │ 1.3x multiplier            │
└──────────────────────────────────────────────────────────────┘
```

## 🔄 Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│ DATA FLOW DIAGRAM                                           │
└─────────────────────────────────────────────────────────────┘

USER INPUT
    │
    ▼
┌─────────────────────────────────────────┐
│ AddVenueModal Component                 │
│ - formData.peakHours                    │
│ - handlePeakHoursChange()               │
└─────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────┐
│ Redux Action                            │
│ - addVenue() or updateVenue()           │
└─────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────┐
│ Backend API                             │
│ POST /admin/venues                      │
│ PUT /admin/venues/{venueId}             │
└─────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────┐
│ Firestore Database                      │
│ venues collection                       │
│ - peakHours field                       │
└─────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────┐
│ VenuesPage Component                    │
│ - Displays Peak Hours column            │
│ - Shows time range & multiplier         │
└─────────────────────────────────────────┘
```

## 📋 State Structure

```
FORM STATE (AddVenueModal)
┌─────────────────────────────────────────┐
│ formData: {                             │
│   name: string,                         │
│   basePrice: string,                    │
│   openTime: string,                     │
│   closeTime: string,                    │
│   ...                                   │
│   peakHours: {                          │
│     enabled: boolean,                   │
│     startTime: string (HH:MM),          │
│     endTime: string (HH:MM),            │
│     priceMultiplier: number             │
│   }                                     │
│ }                                       │
└─────────────────────────────────────────┘

FIRESTORE DOCUMENT (Venue)
┌─────────────────────────────────────────┐
│ {                                       │
│   id: string,                           │
│   name: string,                         │
│   pricing: {                            │
│     basePrice: number                   │
│   },                                    │
│   operatingHours: {                     │
│     open: string,                       │
│     close: string                       │
│   },                                    │
│   peakHours: {                          │
│     enabled: boolean,                   │
│     startTime: string,                  │
│     endTime: string,                    │
│     priceMultiplier: number             │
│   },                                    │
│   ...                                   │
│ }                                       │
└─────────────────────────────────────────┘
```

## 🎯 Multiplier Examples

```
PRICE MULTIPLIER REFERENCE

Multiplier │ Markup │ Base Price │ Peak Price │ Use Case
───────────┼────────┼────────────┼────────────┼──────────────────
1.0        │ 0%     │ 2,000      │ 2,000      │ No markup
1.1        │ 10%    │ 2,000      │ 2,200      │ Minimal increase
1.2        │ 20%    │ 2,000      │ 2,400      │ Light premium
1.3        │ 30%    │ 2,000      │ 2,600      │ Moderate premium
1.5        │ 50%    │ 2,000      │ 3,000      │ Standard peak
1.8        │ 80%    │ 2,000      │ 3,600      │ High demand
2.0        │ 100%   │ 2,000      │ 4,000      │ Double price
```

## ✅ Implementation Checklist

```
FEATURE IMPLEMENTATION STATUS

Core Functionality:
  ✅ Peak hours toggle in form
  ✅ Time pickers for start/end
  ✅ Price multiplier input
  ✅ Real-time price calculation
  ✅ Form state management
  ✅ Data persistence

Display & UI:
  ✅ Peak Hours column in grid
  ✅ Status indicator (enabled/disabled)
  ✅ Time range display
  ✅ Multiplier display
  ✅ Orange highlight for active

Data Management:
  ✅ Redux state integration
  ✅ Firestore persistence
  ✅ Edit venue loading
  ✅ Form reset logic

Integration:
  ✅ API payload inclusion
  ✅ Backend compatibility
  ✅ Backward compatibility
  ✅ No breaking changes

Documentation:
  ✅ Feature documentation
  ✅ Quick start guide
  ✅ Implementation summary
  ✅ Visual guide (this file)
```

---

**Last Updated**: April 22, 2026
**Version**: 1.0
**Status**: Complete & Ready
