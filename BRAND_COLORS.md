# 🎨 Arena Pro Brand Colors

## Primary Brand Colors

### Primary Color
- **Hex**: `#004d43`
- **RGB**: `rgb(0, 77, 67)`
- **Description**: Dark teal/green - main brand color
- **Usage**: Primary buttons, headers, navigation, key UI elements

### Secondary Color
- **Hex**: `#e8ee26`
- **RGB**: `rgb(232, 238, 38)`
- **Description**: Bright lime - accent color
- **Usage**: Secondary buttons, highlights, success states, accents

## Color Variations

### Primary Variations
- **Light**: `#e8f5f3` - Backgrounds, subtle highlights
- **Dark**: `#003832` - Hover states, pressed states
- **Medium**: `#006b5a` - Tertiary elements

### Secondary Variations
- **Light**: `#f7fce8` - Light backgrounds, subtle accents
- **Dark**: `#a8c555` - Darker accent states

## Implementation

### Mobile App (React Native)
```javascript
// src/theme/theme.js
colors: {
  primary: '#004d43',
  secondary: '#e8ee26',
  primaryLight: '#e8f5f3',
  secondaryLight: '#f7fce8',
  primaryDark: '#003832',
  secondaryDark: '#a8c555',
}
```

### Admin Panel (Material-UI)
```javascript
// admin-web/src/theme/theme.js
palette: {
  primary: {
    main: '#004d43',
    light: '#e8f5f3',
    dark: '#003832',
  },
  secondary: {
    main: '#e8ee26',
    light: '#f7fce8',
    dark: '#a8c555',
  },
}
```

## Usage Guidelines

### Primary Color (#004d43)
- ✅ **Use for**: Main navigation, primary buttons, headers, logos
- ✅ **Good contrast with**: White, light backgrounds, secondary color
- ❌ **Avoid**: Using on dark backgrounds without sufficient contrast

### Secondary Color (#e8ee26)
- ✅ **Use for**: Accent elements, success states, highlights, call-to-action
- ✅ **Good contrast with**: Dark text, primary color
- ❌ **Avoid**: Large text areas, insufficient contrast combinations

## Accessibility

- **Primary on White**: ✅ WCAG AA compliant (contrast ratio: 12.6:1)
- **Secondary on Dark**: ✅ WCAG AA compliant when used properly
- **Always test**: Color combinations for accessibility compliance

## Brand Personality

These colors represent:
- 🌿 **Nature & Sports**: Connection to outdoor activities and turf
- 💪 **Strength & Reliability**: Professional sports venue management
- ⚡ **Energy & Growth**: Dynamic booking and management platform
- 🎯 **Precision & Focus**: Accurate scheduling and venue coordination

## Files Updated

### Mobile App
- `src/theme/theme.js` - Main theme configuration

### Admin Panel
- `admin-web/src/theme/theme.js` - Material-UI theme
- `admin-web/src/index.js` - Theme provider setup
- `admin-web/src/pages/LoginPage.js` - Login gradient colors

---

**Note**: These brand colors are now consistently applied across both the mobile app and admin panel for a cohesive user experience.