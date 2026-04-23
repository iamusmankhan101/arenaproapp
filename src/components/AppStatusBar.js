/**
 * AppStatusBar Component
 * 
 * A wrapper component for StatusBar that handles platform-specific
 * configurations and provides consistent appearance across the app.
 */

import React from 'react';
import { StatusBar, Platform } from 'react-native';
import { StatusBarPresets } from '../utils/statusBarUtils';

/**
 * AppStatusBar Component
 * 
 * @param {Object} props
 * @param {'light' | 'dark' | 'primary' | 'transparent'} props.preset - StatusBar preset
 * @param {'light-content' | 'dark-content'} props.barStyle - StatusBar style (overrides preset)
 * @param {string} props.backgroundColor - Background color (Android only)
 * @param {boolean} props.translucent - Translucent status bar (Android only)
 * @param {boolean} props.hidden - Hide status bar
 * @param {boolean} props.animated - Animate status bar changes
 */
export default function AppStatusBar({
  preset = 'light',
  barStyle,
  backgroundColor,
  translucent,
  hidden = false,
  animated = true,
  ...props
}) {
  // Get preset configuration
  const getPresetConfig = () => {
    switch (preset) {
      case 'dark':
        return StatusBarPresets.DARK;
      case 'primary':
        return StatusBarPresets.PRIMARY;
      case 'transparent':
        return StatusBarPresets.TRANSPARENT;
      case 'light':
      default:
        return StatusBarPresets.LIGHT;
    }
  };

  const presetConfig = getPresetConfig();

  // Determine final configuration
  const finalBarStyle = barStyle || presetConfig.barStyle;
  const finalBackgroundColor = backgroundColor || presetConfig.backgroundColor;
  const finalTranslucent = translucent !== undefined ? translucent : presetConfig.translucent;

  return (
    <StatusBar
      barStyle={finalBarStyle}
      backgroundColor={Platform.OS === 'android' ? finalBackgroundColor : undefined}
      translucent={Platform.OS === 'android' ? finalTranslucent : undefined}
      hidden={hidden}
      animated={animated}
      {...props}
    />
  );
}

/**
 * Preset-specific StatusBar components for convenience
 */

export const LightStatusBar = (props) => (
  <AppStatusBar preset="light" {...props} />
);

export const DarkStatusBar = (props) => (
  <AppStatusBar preset="dark" {...props} />
);

export const PrimaryStatusBar = (props) => (
  <AppStatusBar preset="primary" {...props} />
);

export const TransparentStatusBar = (props) => (
  <AppStatusBar preset="transparent" {...props} />
);
