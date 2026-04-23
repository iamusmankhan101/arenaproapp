# HomeScreen Categories Update - Complete ✅

## Changes Made

### 1. Removed Basketball Category
**Before:** 4 categories (Cricket, Futsal, Padel, Basketball)
```javascript
const sportsCategories = [
  { id: 1, name: 'Cricket', icon: 'sports-cricket' },
  { id: 2, name: 'Futsal', icon: 'sports-soccer' },
  { id: 3, name: 'Padel', icon: 'sports-tennis' },
  { id: 4, name: 'Basketball', icon: 'sports-basketball' }, // ❌ Removed
];
```

**After:** 3 categories (Cricket, Futsal, Padel)
```javascript
const sportsCategories = [
  { id: 1, name: 'Cricket', icon: 'sports-cricket' },
  { id: 2, name: 'Futsal', icon: 'sports-soccer' },
  { id: 3, name: 'Padel', icon: 'sports-tennis' },
];
```

### 2. Updated Category Icon Colors

**Icon Background (Container):**
- Unselected: Primary color (#004d43) - solid
- Selected: Secondary color (#e8ee26) - solid

**Icon Color:**
- Unselected: Secondary color (#e8ee26)
- Selected: Primary color (#004d43)

**Before:**
```javascript
// Background
backgroundColor: `${theme.colors.primary}15`, // Light primary (15% opacity)
categoryIconContainerActive: {
  backgroundColor: theme.colors.primary, // Solid primary
}

// Icon
color={selectedSport === sport.name ? theme.colors.secondary : theme.colors.primary}
```

**After:**
```javascript
// Background
backgroundColor: theme.colors.primary, // ✅ Solid primary
categoryIconContainerActive: {
  backgroundColor: theme.colors.secondary, // ✅ Solid secondary
}

// Icon
color={selectedSport === sport.name ? theme.colors.primary : theme.colors.secondary}
// ✅ Swapped colors
```

## Visual Result

### Unselected Category:
- Background: Primary (#004d43) - dark teal
- Icon: Secondary (#e8ee26) - lime yellow
- Text: Default text color

### Selected Category:
- Background: Secondary (#e8ee26) - lime yellow
- Icon: Primary (#004d43) - dark teal
- Text: Primary color

## Files Modified
- `src/screens/main/HomeScreen.js`

## Brand Color Usage
- Primary (#004d43): Dark teal - used for unselected backgrounds and selected icons
- Secondary (#e8ee26): Lime yellow - used for selected backgrounds and unselected icons

This creates a nice contrast and makes the selected category stand out with the bright lime background.
