import { MD3LightTheme } from 'react-native-paper';

export const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#2E7D32', // Green for turf
    secondary: '#FF6F00', // Orange for energy
    tertiary: '#1976D2', // Blue for trust
    surface: '#FFFFFF',
    background: '#F5F5F5',
    error: '#D32F2F',
    success: '#388E3C',
    warning: '#F57C00',
    splash: '#337f35', // Green for splash screen
  },
  fonts: {
    ...MD3LightTheme.fonts,
    default: {
      fontFamily: 'Montserrat_400Regular',
    },
    displayLarge: {
      ...MD3LightTheme.fonts.displayLarge,
      fontFamily: 'Montserrat_700Bold',
    },
    displayMedium: {
      ...MD3LightTheme.fonts.displayMedium,
      fontFamily: 'Montserrat_700Bold',
    },
    displaySmall: {
      ...MD3LightTheme.fonts.displaySmall,
      fontFamily: 'Montserrat_600SemiBold',
    },
    headlineLarge: {
      ...MD3LightTheme.fonts.headlineLarge,
      fontFamily: 'Montserrat_700Bold',
    },
    headlineMedium: {
      ...MD3LightTheme.fonts.headlineMedium,
      fontFamily: 'Montserrat_600SemiBold',
    },
    headlineSmall: {
      ...MD3LightTheme.fonts.headlineSmall,
      fontFamily: 'Montserrat_600SemiBold',
    },
    titleLarge: {
      ...MD3LightTheme.fonts.titleLarge,
      fontFamily: 'Montserrat_600SemiBold',
    },
    titleMedium: {
      ...MD3LightTheme.fonts.titleMedium,
      fontFamily: 'Montserrat_500Medium',
    },
    titleSmall: {
      ...MD3LightTheme.fonts.titleSmall,
      fontFamily: 'Montserrat_500Medium',
    },
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
};