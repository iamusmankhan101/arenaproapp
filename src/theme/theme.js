import { MD3LightTheme } from 'react-native-paper';

export const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#004d43', // Brand primary - dark teal
    secondary: '#e8ee26', // Brand secondary - bright lime
    tertiary: '#006b5a', // Darker teal variation
    surface: '#FFFFFF',
    background: '#F5F5F5',
    error: '#D32F2F',
    success: '#004d43', // Use brand primary for success
    warning: '#F57C00',
    splash: '#004d43', // Brand primary for splash screen
    
    // Text colors
    text: '#212121',
    textSecondary: '#757575',
    
    // Additional UI colors
    border: '#E0E0E0',
    disabled: '#BDBDBD',
    
    // Additional brand variations
    primaryLight: '#e8f5f3',
    secondaryLight: '#f7fce8',
    primaryDark: '#003832',
    secondaryDark: '#a8c555',
  },
  fonts: {
    ...MD3LightTheme.fonts,
    // Default body font - Montserrat
    default: {
      fontFamily: 'Montserrat_400Regular',
    },
    // Display fonts - ClashDisplay-Medium (Primary font for large headings)
    displayLarge: {
      ...MD3LightTheme.fonts.displayLarge,
      fontFamily: 'ClashDisplay-Medium',
    },
    displayMedium: {
      ...MD3LightTheme.fonts.displayMedium,
      fontFamily: 'ClashDisplay-Medium',
    },
    displaySmall: {
      ...MD3LightTheme.fonts.displaySmall,
      fontFamily: 'ClashDisplay-Medium',
    },
    // Headline fonts - ClashDisplay-Medium (Primary font for section headings)
    headlineLarge: {
      ...MD3LightTheme.fonts.headlineLarge,
      fontFamily: 'ClashDisplay-Medium',
    },
    headlineMedium: {
      ...MD3LightTheme.fonts.headlineMedium,
      fontFamily: 'ClashDisplay-Medium',
    },
    headlineSmall: {
      ...MD3LightTheme.fonts.headlineSmall,
      fontFamily: 'ClashDisplay-Medium',
    },
    // Title fonts - ClashDisplay-Medium (Primary font for titles)
    titleLarge: {
      ...MD3LightTheme.fonts.titleLarge,
      fontFamily: 'ClashDisplay-Medium',
    },
    titleMedium: {
      ...MD3LightTheme.fonts.titleMedium,
      fontFamily: 'ClashDisplay-Medium',
    },
    titleSmall: {
      ...MD3LightTheme.fonts.titleSmall,
      fontFamily: 'ClashDisplay-Medium',
    },
    // Body fonts - Montserrat (Secondary font for body text)
    bodyLarge: {
      ...MD3LightTheme.fonts.bodyLarge,
      fontFamily: 'Montserrat_400Regular',
    },
    bodyMedium: {
      ...MD3LightTheme.fonts.bodyMedium,
      fontFamily: 'Montserrat_400Regular',
    },
    bodySmall: {
      ...MD3LightTheme.fonts.bodySmall,
      fontFamily: 'Montserrat_400Regular',
    },
    // Label fonts - Montserrat (Secondary font for labels)
    labelLarge: {
      ...MD3LightTheme.fonts.labelLarge,
      fontFamily: 'Montserrat_500Medium',
    },
    labelMedium: {
      ...MD3LightTheme.fonts.labelMedium,
      fontFamily: 'Montserrat_500Medium',
    },
    labelSmall: {
      ...MD3LightTheme.fonts.labelSmall,
      fontFamily: 'Montserrat_400Regular',
    },
  },
  // Glassmorphism styles
  glass: {
    // Light glass effect (for light backgrounds)
    light: {
      backgroundColor: 'rgba(255, 255, 255, 0.7)',
      borderColor: 'rgba(255, 255, 255, 0.3)',
      borderWidth: 1,
    },
    // Dark glass effect (for dark backgrounds)
    dark: {
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      borderWidth: 1,
    },
    // Primary glass effect (with brand color tint)
    primary: {
      backgroundColor: 'rgba(0, 77, 67, 0.15)',
      borderColor: 'rgba(0, 77, 67, 0.3)',
      borderWidth: 1,
    },
    // Secondary glass effect (with secondary color tint)
    secondary: {
      backgroundColor: 'rgba(232, 238, 38, 0.15)',
      borderColor: 'rgba(232, 238, 38, 0.3)',
      borderWidth: 1,
    },
  },
};