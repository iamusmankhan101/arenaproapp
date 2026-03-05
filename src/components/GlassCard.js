import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { theme } from '../theme/theme';

/**
 * GlassCard - Glassmorphism card component
 * 
 * Props:
 * - children: Content to render inside the card
 * - style: Additional styles to apply
 * - intensity: Blur intensity (default: 20)
 * - tint: Blur tint - 'light', 'dark', or 'default' (default: 'light')
 * - borderRadius: Border radius (default: 16)
 * - elevation: Shadow elevation for Android (default: 4)
 */
export default function GlassCard({ 
  children, 
  style, 
  intensity = 20,
  tint = 'light',
  borderRadius = 16,
  elevation = 4
}) {
  if (Platform.OS === 'ios') {
    return (
      <BlurView
        intensity={intensity}
        tint={tint}
        style={[
          styles.glassCard,
          { borderRadius },
          style
        ]}
      >
        <View style={[styles.glassOverlay, { borderRadius }]}>
          {children}
        </View>
      </BlurView>
    );
  }

  // Android fallback with semi-transparent background
  return (
    <View
      style={[
        styles.glassCard,
        styles.androidGlass,
        { borderRadius, elevation },
        style
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  glassCard: {
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  glassOverlay: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    backdropFilter: 'blur(10px)',
  },
  androidGlass: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
});
