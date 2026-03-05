# MapScreen Location Icon - Visual Guide

## Location Icon Appearance

### Icon Design
```
┌─────────────────────────────────────┐
│                                     │
│         MAP VIEW                    │
│                                     │
│    [Venue Markers]                  │
│                                     │
│                                     │
│                                     │
│                              ┌───┐  │
│                              │ ⊕ │  │ ← Location FAB
│                              └───┘  │
│                                     │
│  [Venue Card at bottom]             │
└─────────────────────────────────────┘
```

### FAB Button Details
```
┌──────────────┐
│              │
│      ⊕       │  ← "my-location" icon (GPS crosshair)
│              │
└──────────────┘
   Small FAB
   40x40 px
```

### Color Scheme
```
Background: #004d43 (Primary - Dark Green)
Icon:       #e8ee26 (Secondary - Yellow)
Shadow:     Elevated with shadow
```

## Positioning

### Android
```
Bottom: 180px from bottom edge
Right:  20px from right edge
```

### iOS
```
Bottom: 160px from bottom edge
Right:  20px from right edge
```

### Z-Index Layering
```
Top Layer:    Venue Cards (when selected)
Middle Layer: Location FAB ← Here
Bottom Layer: Map View
```

## Interaction States

### Default State
```
┌──────────────┐
│              │
│      ⊕       │  Background: #004d43
│              │  Icon: #e8ee26
└──────────────┘  Opacity: 100%
```

### Pressed State
```
┌──────────────┐
│              │
│      ⊕       │  Background: Slightly darker
│              │  Icon: #e8ee26
└──────────────┘  Opacity: 90%
```

### Hidden State (No Permission)
```
[Not visible]
```

## Animation Sequence

### When Tapped
```
1. User taps FAB
   ┌──────────────┐
   │      ⊕       │ ← Tap
   └──────────────┘

2. Map starts animating (0ms)
   [Map begins smooth transition]

3. Map centers on user (1000ms)
   [User location now centered]
   
4. Animation complete
   [User can see their location clearly]
```

### Animation Details
- **Duration**: 1000ms (1 second)
- **Type**: Smooth easing
- **Zoom**: 0.05 delta (appropriate for viewing nearby venues)
- **Target**: User's current GPS coordinates

## Conditional Display Logic

### Shows When:
```
✓ hasLocationPermission === true
✓ userLocation !== null
✓ Map is loaded
```

### Hides When:
```
✗ hasLocationPermission === false
✗ userLocation === null
✗ Location services disabled
```

## Screen Layout Examples

### With Location Permission
```
┌─────────────────────────────────────┐
│ [Sports Filter Chips]               │
│ [Search Bar]                        │
│                                     │
│         MAP WITH MARKERS            │
│                                     │
│                              ┌───┐  │
│                              │ ⊕ │  │ ← Visible
│                              └───┘  │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Selected Venue Card         │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

### Without Location Permission
```
┌─────────────────────────────────────┐
│ [Sports Filter Chips]               │
│ [Search Bar]                        │
│                                     │
│         MAP WITH MARKERS            │
│                                     │
│                                     │ ← No FAB
│                                     │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Selected Venue Card         │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

## Size Comparison

### Small FAB (Current)
```
┌──────┐
│  ⊕   │  40x40 px
└──────┘  Compact, unobtrusive
```

### Regular FAB (Not Used)
```
┌──────────┐
│    ⊕     │  56x56 px
└──────────┘  Too large for this use case
```

## Brand Color Integration

### Primary Color (#004d43)
```
Used for: FAB background
Effect:   Matches app's primary brand color
Contrast: High contrast with map
```

### Secondary Color (#e8ee26)
```
Used for: Icon color
Effect:   High visibility on dark background
Contrast: Excellent readability
```

## Accessibility Features

### Touch Target
```
Minimum: 40x40 px (meets accessibility guidelines)
Actual:  40x40 px (small FAB)
Status:  ✓ Accessible
```

### Visual Contrast
```
Background: #004d43 (dark)
Icon:       #e8ee26 (bright)
Ratio:      High contrast
Status:     ✓ WCAG compliant
```

### Screen Reader
```
Label:      "Center on my location"
Action:     "Button"
Hint:       "Double tap to center map on your current location"
```

## Comparison with Other Map Apps

### Google Maps
- Uses blue circle with white crosshair
- Similar positioning (bottom-right)
- Similar functionality

### Apple Maps
- Uses blue arrow icon
- Bottom-right positioning
- Same centering behavior

### Our Implementation
- Uses Material Design "my-location" icon
- Brand colors for consistency
- Same UX pattern as major apps

## Summary

The location icon is:
- **Positioned**: Bottom-right corner, above venue cards
- **Styled**: Primary background, secondary icon
- **Sized**: Small (40x40 px) for minimal intrusion
- **Animated**: Smooth 1000ms transition
- **Conditional**: Only shows with location permission
- **Accessible**: Meets touch target and contrast guidelines
- **Branded**: Uses app's color scheme

Users will immediately recognize this as a location centering button, consistent with their experience in other map applications.