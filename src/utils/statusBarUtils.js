/**
 * StatusBar Utilities
 * 
 * Centralized utility for managing StatusBar appearance across iOS and Android
 * with proper handling of safe areas, translucency, and theme consistency.
 */

import { Platform, StatusBar } from 'react-native';

/**
 * StatusBar configuration presets for different screen types
 */
export const StatusBarPresets = {
  // Light background screens (white/light gray)
  LIGHT: {
    barStyle: 'dark-content',
    backgroundColor: Platform.OS === 'android' ? 'transparent' : undefined,
    translucent: Platform.OS === 'android',
  },
  
  // Dark background screens (primary color, dark images)
  DARK: {
    barStyle: 'light-content',
    backgroundColor: Platform.OS === 'android' ? 'transparent' : undefined,
    translucent: Platform.OS === 'android',
  },
  
  // Primary color background
  PRIMARY: {
    barStyle: 'light-content',
    backgroundColor: Platform.OS === 'android' ? '#004d43' : undefined,
    translucent: false,
  },
  
  // Transparent overlay (for image backgrounds)
  TRANSPARENT: {
    barStyle: 'light-content',
    backgroundColor: 'transparent',
    translucent: true,
  },
};

/**
 * Get StatusBar height for the current platform
 * @returns {number} StatusBar height in pixels
 */
export const getStatusBarHeight = () => {
  if (Platform.OS === 'ios') {
    // iOS status bar is always 20 or 44 (with notch)
    return StatusBar.currentHeight || 44;
  }
  // Android status bar height
  return StatusBar.currentHeight || 24;
};

/**
 * Apply StatusBar configuration
 * @param {Object} config - StatusBar configuration
 */
export const applyStatusBar = (config) => {
  if (config.barStyle) {
    StatusBar.setBarStyle(config.barStyle, true);
  }
  
  if (Platform.OS === 'android') {
    if (config.backgroundColor !== undefined) {
      StatusBar.setBackgroundColor(config.backgroundColor, true);
    }
    if (config.translucent !== undefined) {
      StatusBar.setTranslucent(config.translucent);
    }
  }
};

/**
 * Get appropriate StatusBar preset based on background color
 * @param {string} backgroundColor - Background color of the screen
 * @returns {Object} StatusBar configuration
 */
export const getStatusBarForBackground = (backgroundColor) => {
  // Light backgrounds
  const lightBackgrounds = ['#FFFFFF', '#F8F9FA', '#F5F5F5', 'white'];
  if (lightBackgrounds.includes(backgroundColor)) {
    return StatusBarPresets.LIGHT;
  }
  
  // Dark backgrounds
  const darkBackgrounds = ['#004d43', '#000000', 'black'];
  if (darkBackgrounds.includes(backgroundColor)) {
    return StatusBarPresets.DARK;
  }
  
  // Default to light
  return StatusBarPresets.LIGHT;
};

/**
 * StatusBar configuration for common screen types
 */
export const ScreenStatusBars = {
  // Auth screens (Welcome, SignIn, SignUp)
  AUTH: StatusBarPresets.LIGHT,
  
  // Main tabs (Home, Map, Bookings, Profile)
  MAIN_TABS: StatusBarPresets.LIGHT,
  
  // Detail screens with images (TurfDetail, VenueDetail)
  DETAIL_WITH_IMAGE: StatusBarPresets.TRANSPARENT,
  
  // Modal screens
  MODAL: StatusBarPresets.LIGHT,
  
  // Booking flow
  BOOKING: StatusBarPresets.LIGHT,
  
  // Profile screens
  PROFILE: StatusBarPresets.LIGHT,
  
  // Challenge screens
  CHALLENGE: StatusBarPresets.LIGHT,
};

/**
 * iOS-specific StatusBar configuration
 */
export const iOSStatusBarConfig = {
  // Enable view controller based status bar appearance
  viewControllerBased: true,
  
  // Default style
  defaultStyle: 'dark-content',
  
  // Hidden status bar behavior
  hideAnimation: 'fade',
  showAnimation: 'fade',
};

/**
 * Android-specific StatusBar configuration
 */
export const androidStatusBarConfig = {
  // Enable translucent status bar
  translucent: true,
  
  // Default background color
  defaultBackgroundColor: 'transparent',
  
  // Navigation bar color
  navigationBarColor: '#FFFFFF',
  
  // Navigation bar style
  navigationBarStyle: 'dark-content',
};

/**
 * Apply platform-specific StatusBar configuration on app start
 */
export const initializeStatusBar = () => {
  if (Platform.OS === 'android') {
    StatusBar.setTranslucent(true);
    StatusBar.setBackgroundColor('transparent', false);
    StatusBar.setBarStyle('dark-content', true);
  } else {
    StatusBar.setBarStyle('dark-content', true);
  }
};
