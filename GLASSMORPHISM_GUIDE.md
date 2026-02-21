# Glassmorphism Implementation Guide

## Overview
Glassmorphism has been added to the Arena Pro app to create a modern, frosted glass aesthetic throughout the UI. This guide explains how to use the glassmorphism components and styles.

## Components

### GlassCard Component
A reusable component that creates glassmorphism effects on any content.

**Location:** `src/components/GlassCard.js`

**Usage:**
```jsx
import GlassCard from '../components/GlassCard';

<GlassCard 
  intensity={20}        // Blur intensity (default: 20)
  tint="light"          // 'light', 'dark', or 'default' (default: 'light')
  borderRadius={16}     // Border radius (default: 16)
  elevation={4}         // Android shadow elevation (default: 4)
  style={customStyles}  // Additional custom styles
>
  <Text>Your content here</Text>
</GlassCard>
```

**Props:**
- `children`: Content to render inside the glass card
- `style`: Additional styles to apply
- `intensity`: Blur intensity (1-100, default: 20)
- `tint`: Blur tint - 'light', 'dark', or 'default' (default: 'light')
- `borderRadius`: Border radius in pixels (default: 16)
- `elevation`: Shadow elevation for Android (default: 4)

### BlurView (Direct Usage)
For more control, you can use BlurView directly from expo-blur.

**Usage:**
```jsx
import { BlurView } from 'expo-blur';

<BlurView intensity={80} tint="light" style={styles.glassOverlay}>
  <View style={styles.content}>
    <Text>Content with blur background</Text>
  </View>
</BlurView>
```

## Theme Glass Styles

The theme now includes predefined glassmorphism styles:

**Location:** `src/theme/theme.js`

**Available Styles:**
```javascript
theme.glass.light      // Light glass (for light backgrounds)
theme.glass.dark       // Dark glass (for dark backgrounds)
theme.glass.primary    // Primary brand color tint
theme.glass.secondary  // Secondary brand color tint
```

**Usage:**
```jsx
<View style={[styles.card, theme.glass.light]}>
  <Text>Glass card with light effect</Text>
</View>
```

## Implementation Examples

### 1. Card with Glass Effect
```jsx
<GlassCard style={styles.card}>
  <Text style={styles.title}>Title</Text>
  <Text style={styles.description}>Description</Text>
</GlassCard>
```

### 2. Overlay on Image
```jsx
<View style={styles.container}>
  <Image source={image} style={styles.image} />
  <BlurView intensity={80} tint="light" style={styles.overlay}>
    <Text style={styles.overlayText}>Overlay Text</Text>
  </BlurView>
</View>

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 200,
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
});
```

### 3. Modal with Glass Background
```jsx
<Modal transparent visible={visible}>
  <BlurView intensity={90} tint="dark" style={styles.modalBackground}>
    <GlassCard style={styles.modalContent}>
      <Text>Modal Content</Text>
    </GlassCard>
  </BlurView>
</Modal>

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    padding: 24,
  },
});
```

### 4. Button with Glass Effect
```jsx
<TouchableOpacity>
  <GlassCard 
    intensity={30} 
    tint="light"
    style={styles.glassButton}
  >
    <Text style={styles.buttonText}>Glass Button</Text>
  </GlassCard>
</TouchableOpacity>

const styles = StyleSheet.create({
  glassButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  buttonText: {
    fontFamily: 'ClashDisplay-Medium',
    fontSize: 16,
    color: theme.colors.primary,
  },
});
```

## Platform Differences

### iOS
- Uses native BlurView with full blur effects
- Supports intensity and tint props
- Smooth, native performance

### Android
- Uses semi-transparent background fallback
- Elevation for shadow effects
- Optimized for performance

## Best Practices

1. **Use Appropriate Intensity**
   - Light overlays: 20-40
   - Medium overlays: 40-60
   - Heavy overlays: 60-100

2. **Choose Right Tint**
   - `light`: For content over light backgrounds
   - `dark`: For content over dark backgrounds
   - `default`: System default (adapts to theme)

3. **Performance**
   - Avoid nesting multiple BlurViews
   - Use GlassCard for simple cases
   - Test on actual devices (blur is expensive)

4. **Accessibility**
   - Ensure text contrast is sufficient
   - Test with different accessibility settings
   - Provide fallback for reduced transparency

5. **Consistency**
   - Use theme.glass styles for consistency
   - Maintain similar blur intensities across similar components
   - Follow brand color guidelines

## Where Glassmorphism is Applied

### Current Implementation:
- ✅ HomeScreen venue cards (recommended & nearby)
- ✅ Venue card info overlays
- ✅ Favorite buttons with glass background

### Recommended for Future:
- Modals (FilterModal, CreateChallengeModal)
- Bottom sheets
- Navigation bars
- Search bars
- Notification cards
- Profile cards
- Booking cards
- Challenge cards
- Settings panels

## Troubleshooting

### Blur not showing on Android
- Android uses fallback with semi-transparent background
- This is expected behavior for performance

### Performance issues
- Reduce blur intensity
- Limit number of BlurViews on screen
- Use GlassCard instead of nested BlurViews

### Text not readable
- Increase blur intensity
- Add semi-transparent background overlay
- Adjust text color for better contrast

## Dependencies

- `expo-blur`: ^14.0.1 (or latest compatible with SDK 54)

## Installation

Already installed! If you need to reinstall:
```bash
npx expo install expo-blur
```

## Examples in Codebase

Check these files for implementation examples:
- `src/screens/main/HomeScreen.js` - Venue cards with glass overlays
- `src/components/GlassCard.js` - Reusable glass component
- `src/theme/theme.js` - Glass style definitions
