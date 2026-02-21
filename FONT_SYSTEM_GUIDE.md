# Arena Pro - Font System Guide

## Font Hierarchy

Arena Pro uses a two-font system for optimal typography:

### Primary Font: ClashDisplay
**Usage**: Headings, titles, buttons, and display text
- **Bold** (`ClashDisplay-Bold`): Large headings, main titles
- **Semibold** (`ClashDisplay-Semibold`): Section headings, medium titles
- **Medium** (`ClashDisplay-Medium`): Small titles, emphasized text
- **Regular** (`ClashDisplay-Regular`): Standard display text

### Secondary Font: Montserrat
**Usage**: Body text, descriptions, labels, and UI elements
- **Bold** (`Montserrat_700Bold`): Emphasized body text
- **Semibold** (`Montserrat_600SemiBold`): Strong labels
- **Medium** (`Montserrat_500Medium`): Labels, captions
- **Regular** (`Montserrat_400Regular`): Body text, descriptions

---

## Theme Font Mapping

The theme automatically maps React Native Paper text variants to the appropriate fonts:

### Display Text (ClashDisplay)
```javascript
displayLarge: 'ClashDisplay-Bold'
displayMedium: 'ClashDisplay-Bold'
displaySmall: 'ClashDisplay-Semibold'
```

### Headlines (ClashDisplay)
```javascript
headlineLarge: 'ClashDisplay-Bold'
headlineMedium: 'ClashDisplay-Semibold'
headlineSmall: 'ClashDisplay-Semibold'
```

### Titles (ClashDisplay)
```javascript
titleLarge: 'ClashDisplay-Semibold'
titleMedium: 'ClashDisplay-Medium'
titleSmall: 'ClashDisplay-Medium'
```

### Body Text (Montserrat)
```javascript
bodyLarge: 'Montserrat_400Regular'
bodyMedium: 'Montserrat_400Regular'
bodySmall: 'Montserrat_400Regular'
```

### Labels (Montserrat)
```javascript
labelLarge: 'Montserrat_500Medium'
labelMedium: 'Montserrat_500Medium'
labelSmall: 'Montserrat_400Regular'
```

---

## Usage Examples

### Using React Native Paper Text Component
```jsx
import { Text } from 'react-native-paper';

// Heading (ClashDisplay-Bold)
<Text variant="headlineLarge">Welcome to Arena Pro</Text>

// Title (ClashDisplay-Semibold)
<Text variant="titleLarge">Book Your Venue</Text>

// Body text (Montserrat_400Regular)
<Text variant="bodyMedium">Find and book sports venues near you</Text>

// Label (Montserrat_500Medium)
<Text variant="labelLarge">FEATURED</Text>
```

### Using StyleSheet with Custom Styles
```jsx
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  // Heading style
  heading: {
    fontFamily: 'ClashDisplay-Bold',
    fontSize: 28,
    color: '#004d43',
  },
  
  // Subheading style
  subheading: {
    fontFamily: 'ClashDisplay-Semibold',
    fontSize: 20,
    color: '#004d43',
  },
  
  // Body text style
  bodyText: {
    fontFamily: 'Montserrat_400Regular',
    fontSize: 16,
    color: '#757575',
    lineHeight: 24,
  },
  
  // Button text style
  buttonText: {
    fontFamily: 'ClashDisplay-Bold',
    fontSize: 16,
    color: '#e8ee26',
  },
});
```

---

## Best Practices

### 1. Headings and Titles
- Always use **ClashDisplay** for headings and titles
- Use Bold for main headings (h1, h2)
- Use Semibold for section headings (h3, h4)
- Use Medium for small titles and emphasized text

### 2. Body Text
- Always use **Montserrat** for body text and descriptions
- Use Regular (400) for standard body text
- Use Medium (500) for labels and captions
- Use Semibold (600) for emphasized text within body content

### 3. Buttons
- Use **ClashDisplay-Bold** for primary button text
- Use **ClashDisplay-Semibold** for secondary button text
- Use **Montserrat_500Medium** for tertiary/text buttons

### 4. Forms and Inputs
- Use **Montserrat_400Regular** for input text
- Use **Montserrat_500Medium** for labels
- Use **ClashDisplay-Semibold** for form section titles

### 5. Cards and Lists
- Use **ClashDisplay-Semibold** for card titles
- Use **Montserrat_400Regular** for card descriptions
- Use **Montserrat_500Medium** for metadata (date, time, price)

---

## Font Installation

### Step 1: Download ClashDisplay
Download ClashDisplay from [FontShare](https://www.fontshare.com/fonts/clash-display) or [GitHub](https://github.com/IndianTypeFoundry/Clash-Display)

### Step 2: Add Font Files
Place the following files in `assets/fonts/`:
- `ClashDisplay-Regular.otf`
- `ClashDisplay-Medium.otf`
- `ClashDisplay-Semibold.otf`
- `ClashDisplay-Bold.otf`

### Step 3: Verify Loading
The fonts are loaded in `App.js`:
```javascript
useFonts({
  'ClashDisplay-Regular': require('./assets/fonts/ClashDisplay-Regular.otf'),
  'ClashDisplay-Medium': require('./assets/fonts/ClashDisplay-Medium.otf'),
  'ClashDisplay-Semibold': require('./assets/fonts/ClashDisplay-Semibold.otf'),
  'ClashDisplay-Bold': require('./assets/fonts/ClashDisplay-Bold.otf'),
  Montserrat_400Regular,
  Montserrat_500Medium,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
});
```

---

## Common Patterns

### Screen Header
```jsx
<Text style={{
  fontFamily: 'ClashDisplay-Bold',
  fontSize: 24,
  color: theme.colors.primary,
}}>
  Screen Title
</Text>
```

### Section Title
```jsx
<Text style={{
  fontFamily: 'ClashDisplay-Semibold',
  fontSize: 18,
  color: theme.colors.text,
}}>
  Section Name
</Text>
```

### Description Text
```jsx
<Text style={{
  fontFamily: 'Montserrat_400Regular',
  fontSize: 14,
  color: theme.colors.textSecondary,
  lineHeight: 20,
}}>
  This is a description that provides more details about the content.
</Text>
```

### Price/Metadata
```jsx
<Text style={{
  fontFamily: 'Montserrat_600SemiBold',
  fontSize: 16,
  color: theme.colors.primary,
}}>
  PKR 2,500
</Text>
```

---

## Migration Checklist

When updating existing screens to use the new font system:

- [ ] Replace `Montserrat_700Bold` with `ClashDisplay-Bold` for main headings
- [ ] Replace `Montserrat_600SemiBold` with `ClashDisplay-Semibold` for section titles
- [ ] Keep `Montserrat_400Regular` for body text (no change needed)
- [ ] Keep `Montserrat_500Medium` for labels (no change needed)
- [ ] Update button text to use `ClashDisplay-Bold`
- [ ] Update card titles to use `ClashDisplay-Semibold`
- [ ] Test font rendering on both iOS and Android

---

## Troubleshooting

### Fonts not loading
1. Verify font files are in `assets/fonts/` directory
2. Check file names match exactly (case-sensitive)
3. Clear Metro bundler cache: `npx expo start -c`
4. Rebuild the app

### Font looks different on device
1. Ensure font files are OTF format (not TTF)
2. Check font weight matches the variant (Bold = 700, Semibold = 600, etc.)
3. Verify fontFamily string matches exactly

### Performance issues
1. Fonts are loaded once at app startup
2. Use `useFonts` hook properly in App.js
3. Don't load fonts multiple times in different components

---

## License

- **ClashDisplay**: Check license at [FontShare](https://www.fontshare.com/fonts/clash-display)
- **Montserrat**: Open Font License (OFL)
