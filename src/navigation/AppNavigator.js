import React, { useEffect, useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSelector, useDispatch } from 'react-redux';
import { loadStoredAuth } from '../store/slices/authSlice';
import { theme } from '../theme/theme';
import { MaterialIcons } from '@expo/vector-icons';

// Admin Components
import AdminLoginScreen from '../screens/admin/AdminLoginScreen';
import AdminNavigator from './AdminNavigator';

// Splash Screen
import SplashScreen from '../screens/SplashScreen';

// Auth Screens
import WelcomeScreen from '../screens/auth/WelcomeScreen';
import SignInScreen from '../screens/auth/SignInScreen';
import SignUpScreen from '../screens/auth/SignUpScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import OTPScreen from '../screens/auth/OTPScreen';

// Main Screens
import HomeScreen from '../screens/main/HomeScreen';
import VenueListScreen from '../screens/main/VenueListScreen';
import MapScreen from '../screens/main/MapScreen';
import FavoritesScreen from '../screens/main/FavoritesScreen';
import BookingScreen from '../screens/booking/BookingScreen';
import ChallengeScreen from '../screens/team/ChallengeScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import ManageProfileScreen from '../screens/profile/ManageProfileScreen';
import PasswordSecurityScreen from '../screens/profile/PasswordSecurityScreen';

// Detail Screens
import TurfDetailScreen from '../screens/turf/TurfDetailScreen';
import ChallengeDetailScreen from '../screens/team/ChallengeDetailScreen';
import BookingConfirmScreen from '../screens/booking/BookingConfirmScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          if (route.name === 'Home') {
            return <MaterialIcons name="home" size={size} color={color} />;
          } else if (route.name === 'Map') {
            return <MaterialIcons name="map" size={size} color={color} />;
          } else if (route.name === 'Bookings') {
            return <MaterialIcons name="event" size={size} color={color} />;
          } else if (route.name === 'Lalkaar') {
            return <MaterialIcons name="sports-soccer" size={size} color={color} />;
          } else if (route.name === 'Profile') {
            return <MaterialIcons name="person" size={size} color={color} />;
          }
          return null;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Map" component={MapScreen} />
      <Tab.Screen name="Bookings" component={BookingScreen} />
      <Tab.Screen name="Lalkaar" component={ChallengeScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const dispatch = useDispatch();
  const { isAuthenticated, initializing } = useSelector(state => state.auth);
  const [showSplash, setShowSplash] = useState(true);
  
  useEffect(() => {
    // Show splash screen for 3 seconds then proceed to main app
    const splashTimer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);

    // Load stored authentication on app start
    dispatch(loadStoredAuth());

    return () => clearTimeout(splashTimer);
  }, [dispatch]);

  // Show splash screen first
  if (showSplash || initializing) {
    return <SplashScreen />;
  }
  
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <>
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="SignIn" component={SignInScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          <Stack.Screen name="OTP" component={OTPScreen} />
          <Stack.Screen name="AdminLogin" component={AdminLoginScreen} />
          <Stack.Screen name="AdminPanel" component={AdminNavigator} />
        </>
      ) : (
        <>
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen name="VenueList" component={VenueListScreen} />
          <Stack.Screen name="Favorites" component={FavoritesScreen} />
          <Stack.Screen name="ManageProfile" component={ManageProfileScreen} />
          <Stack.Screen name="PasswordSecurity" component={PasswordSecurityScreen} />
          <Stack.Screen name="TurfDetail" component={TurfDetailScreen} />
          <Stack.Screen name="ChallengeDetail" component={ChallengeDetailScreen} />
          <Stack.Screen name="BookingConfirm" component={BookingConfirmScreen} />
          <Stack.Screen name="AdminLogin" component={AdminLoginScreen} />
          <Stack.Screen name="AdminPanel" component={AdminNavigator} />
          {/* Auth screens available for guest booking flow */}
          <Stack.Screen name="SignIn" component={SignInScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          <Stack.Screen name="OTP" component={OTPScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}