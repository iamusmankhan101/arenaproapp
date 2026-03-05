/**
 * Example: StatusBar Usage in Different Screen Types
 * 
 * This file demonstrates how to properly implement StatusBar
 * in various screen types across the app.
 */

// ============================================
// EXAMPLE 1: Light Background Screen (Home, Profile, Bookings)
// ============================================

import React from 'react';
import { View, StyleSheet, ScrollView, Platform } from 'react-native';
import { Text } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LightStatusBar } from '../components/AppStatusBar';
import { theme } from '../theme/theme';

function LightBackgroundScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      {/* StatusBar for light background */}
      <LightStatusBar />
      
      {/* Header with safe area */}
      <View style={[styles.header, { paddingTop: Platform.OS === 'ios' ? insets.top + 10 : 20 }]}>
        <Text style={styles.headerTitle}>Screen Title</Text>
      </View>

      <ScrollView>
        {/* Content */}
      </ScrollView>
    </View>
  );
}

// ============================================
// EXAMPLE 2: Dark Background Screen (Primary Color)
// ============================================

import { DarkStatusBar, PrimaryStatusBar } from '../components/AppStatusBar';

function DarkBackgroundScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.primary }]}>
      {/* StatusBar for dark background */}
      <PrimaryStatusBar />
      
      {/* Header with safe area */}
      <View style={[styles.darkHeader, { paddingTop: Platform.OS === 'ios' ? insets.top + 10 : 20 }]}>
        <Text style={styles.darkHeaderTitle}>Screen Title</Text>
      </View>

      <ScrollView>
        {/* Content */}
      </ScrollView>
    </View>
  );
}

// ============================================
// EXAMPLE 3: Image Background Screen (TurfDetail, VenueDetail)
// ============================================

import { TransparentStatusBar } from '../components/AppStatusBar';
import { Image } from 'react-native';

function ImageBackgroundScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      {/* Transparent StatusBar for image overlay */}
      <TransparentStatusBar />
      
      {/* Full-screen image */}
      <Image 
        source={require('../images/venue.jpg')} 
        style={styles.headerImage}
      />

      {/* Overlay header with safe area */}
      <View style={[styles.overlayHeader, { top: Platform.OS === 'ios' ? insets.top + 10 : 40 }]}>
        <TouchableOpacity style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      <ScrollView>
        {/* Content */}
      </ScrollView>
    </View>
  );
}

// ============================================
// EXAMPLE 4: Using AppStatusBar with Custom Config
// ============================================

import AppStatusBar from '../components/AppStatusBar';

function CustomStatusBarScreen() {
  return (
    <View style={styles.container}>
      {/* Custom StatusBar configuration */}
      <AppStatusBar 
        barStyle="dark-content"
        backgroundColor="#F8F9FA"
        translucent={true}
        animated={true}
      />
      
      {/* Content */}
    </View>
  );
}

// ============================================
// EXAMPLE 5: Using StatusBar Presets
// ============================================

import { StatusBar } from 'react-native';
import { StatusBarPresets } from '../utils/statusBarUtils';

function PresetStatusBarScreen() {
  return (
    <View style={styles.container}>
      {/* Using preset configuration */}
      <StatusBar {...StatusBarPresets.LIGHT} />
      
      {/* Content */}
    </View>
  );
}

// ============================================
// EXAMPLE 6: Dynamic StatusBar Based on Scroll
// ============================================

import { useState } from 'react';

function DynamicStatusBarScreen() {
  const [scrolled, setScrolled] = useState(false);

  const handleScroll = (event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    setScrolled(offsetY > 100);
  };

  return (
    <View style={styles.container}>
      {/* StatusBar changes based on scroll position */}
      {scrolled ? <LightStatusBar /> : <TransparentStatusBar />}
      
      <ScrollView onScroll={handleScroll} scrollEventThrottle={16}>
        {/* Content */}
      </ScrollView>
    </View>
  );
}

// ============================================
// EXAMPLE 7: Modal with StatusBar
// ============================================

import { Modal } from 'react-native';

function ModalScreen({ visible, onDismiss }) {
  return (
    <Modal visible={visible} onDismiss={onDismiss} animationType="slide">
      <View style={styles.modalContainer}>
        {/* StatusBar for modal */}
        <LightStatusBar />
        
        {/* Modal content */}
      </View>
    </Modal>
  );
}

// ============================================
// EXAMPLE 8: Tab Navigator with StatusBar
// ============================================

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <>
      {/* Global StatusBar for all tabs */}
      <LightStatusBar />
      
      <Tab.Navigator>
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Map" component={MapScreen} />
        <Tab.Screen name="Bookings" component={BookingScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
    </>
  );
}

// ============================================
// EXAMPLE 9: Using StatusBar Height Utility
// ============================================

import { getStatusBarHeight } from '../utils/statusBarUtils';

function StatusBarHeightScreen() {
  const statusBarHeight = getStatusBarHeight();

  return (
    <View style={styles.container}>
      <LightStatusBar />
      
      {/* Manual padding using StatusBar height */}
      <View style={{ paddingTop: statusBarHeight }}>
        <Text>Content with StatusBar padding</Text>
      </View>
    </View>
  );
}

// ============================================
// EXAMPLE 10: Android-Specific StatusBar
// ============================================

function AndroidSpecificScreen() {
  return (
    <View style={styles.container}>
      <AppStatusBar 
        barStyle="dark-content"
        backgroundColor={Platform.OS === 'android' ? '#FFFFFF' : undefined}
        translucent={Platform.OS === 'android'}
      />
      
      {/* Content */}
    </View>
  );
}

// ============================================
// Styles
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
  },
  darkHeader: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: theme.colors.primary,
  },
  darkHeaderTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerImage: {
    width: '100%',
    height: 300,
    position: 'absolute',
    top: 0,
  },
  overlayHeader: {
    position: 'absolute',
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});

// ============================================
// Export Examples
// ============================================

export {
  LightBackgroundScreen,
  DarkBackgroundScreen,
  ImageBackgroundScreen,
  CustomStatusBarScreen,
  PresetStatusBarScreen,
  DynamicStatusBarScreen,
  ModalScreen,
  MainTabs,
  StatusBarHeightScreen,
  AndroidSpecificScreen,
};
