import React, { useEffect, useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSelector, useDispatch } from 'react-redux';
import { loadStoredAuth, initializeAuth } from '../store/slices/authSlice';
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
        tabBarActiveTintColor: '#e8ee26', // Secondary color for active icons
        tabBarInactiveTintColor: 'rgba(232, 238, 38, 0.6)', // Dimmed secondary color for inactive
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 20,
          left: 20,
          right: 20,
          backgroundColor: '#004d43', // Primary color background
          borderRadius: 25,
          height: 70,
          paddingBottom: 10,
          paddingTop: 10,
          paddingHorizontal: 10,
          borderTopWidth: 0,
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 5 },
          shadowOpacity: 0.3,
          shadowRadius: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginBottom: 2,
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen 
        name="Map" 
        component={MapScreen}
        options={{ tabBarLabel: 'Map' }}
      />
      <Tab.Screen 
        name="Bookings" 
        component={BookingScreen}
        options={{ tabBarLabel: 'Bookings' }}
      />
      <Tab.Screen 
        name="Lalkaar" 
        component={ChallengeScreen}
        options={{ tabBarLabel: 'Challenges' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ tabBarLabel: 'Profile' }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const dispatch = useDispatch();
  const { isAuthenticated, initializing, user } = useSelector(state => state.auth);
  const [showSplash, setShowSplash] = useState(true);
  
  useEffect(() => {
    // Initialize Firebase auth listener
    dispatch(initializeAuth());
    
    // Load stored authentication on app start
    dispatch(loadStoredAuth());
    
    // Show splash screen for 3 seconds then proceed to main app
    const splashTimer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);

    return () => clearTimeout(splashTimer);
  }, [dispatch]);

  // Show splash screen first
  if (showSplash || initializing) {
    return <SplashScreen />;
  }

  // Debug what screen should be shown
  console.log('🔍 NAVIGATOR DEBUG: Auth state:', { 
    isAuthenticated, 
    initializing, 
    hasUser: !!user,
    showSplash 
  });
  
  if (isAuthenticated) {
    console.log('🔍 NAVIGATOR DEBUG: Rendering authenticated screens');
  } else {
    console.log('🔍 NAVIGATOR DEBUG: Rendering authentication screens');
  }
  
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        cardStyle: { backgroundColor: 'white' },
        gestureEnabled: true,
        gestureDirection: 'horizontal',
      }}
    >
      {!isAuthenticated ? (
        <>
          <Stack.Screen 
            name="Welcome" 
            component={WelcomeScreen}
            options={{
              animationTypeForReplace: 'push',
              gestureEnabled: false,
            }}
          />
          <Stack.Screen 
            name="SignIn" 
            component={SignInScreen}
            options={{
              title: 'Sign In',
              gestureEnabled: true,
            }}
          />
          <Stack.Screen 
            name="SignUp" 
            component={SignUpScreen}
            options={{
              title: 'Sign Up',
              gestureEnabled: true,
            }}
          />
          <Stack.Screen 
            name="ForgotPassword" 
            component={ForgotPasswordScreen}
            options={{
              title: 'Reset Password',
              gestureEnabled: true,
            }}
          />
          <Stack.Screen 
            name="OTP" 
            component={OTPScreen}
            options={{
              title: 'Verify OTP',
              gestureEnabled: false,
            }}
          />
          <Stack.Screen 
            name="AdminLogin" 
            component={AdminLoginScreen}
            options={{
              title: 'Admin Login',
              gestureEnabled: true,
            }}
          />
          <Stack.Screen 
            name="AdminPanel" 
            component={AdminNavigator}
            options={{
              gestureEnabled: false,
            }}
          />
        </>
      ) : (
        <>
          <Stack.Screen 
            name="MainTabs" 
            component={MainTabs}
            options={{
              gestureEnabled: false,
            }}
          />
          <Stack.Screen 
            name="VenueList" 
            component={VenueListScreen}
            options={{
              title: 'All Venues',
              gestureEnabled: true,
            }}
          />
          <Stack.Screen 
            name="Favorites" 
            component={FavoritesScreen}
            options={{
              title: 'Favorites',
              gestureEnabled: true,
            }}
          />
          <Stack.Screen 
            name="ManageProfile" 
            component={ManageProfileScreen}
            options={{
              title: 'Manage Profile',
              gestureEnabled: true,
            }}
          />
          <Stack.Screen 
            name="PasswordSecurity" 
            component={PasswordSecurityScreen}
            options={{
              title: 'Password & Security',
              gestureEnabled: true,
            }}
          />
          <Stack.Screen 
            name="TurfDetail" 
            component={TurfDetailScreen}
            options={{
              title: 'Venue Details',
              gestureEnabled: true,
            }}
          />
          <Stack.Screen 
            name="ChallengeDetail" 
            component={ChallengeDetailScreen}
            options={{
              title: 'Challenge Details',
              gestureEnabled: true,
            }}
          />
          <Stack.Screen 
            name="BookingConfirm" 
            component={BookingConfirmScreen}
            options={{
              title: 'Confirm Booking',
              gestureEnabled: false,
            }}
          />
          <Stack.Screen 
            name="AdminLogin" 
            component={AdminLoginScreen}
            options={{
              title: 'Admin Login',
              gestureEnabled: true,
            }}
          />
          <Stack.Screen 
            name="AdminPanel" 
            component={AdminNavigator}
            options={{
              gestureEnabled: false,
            }}
          />
          {/* Auth screens available for profile management */}
          <Stack.Screen 
            name="SignIn" 
            component={SignInScreen}
            options={{
              title: 'Sign In',
              gestureEnabled: true,
            }}
          />
          <Stack.Screen 
            name="SignUp" 
            component={SignUpScreen}
            options={{
              title: 'Sign Up',
              gestureEnabled: true,
            }}
          />
          <Stack.Screen 
            name="ForgotPassword" 
            component={ForgotPasswordScreen}
            options={{
              title: 'Reset Password',
              gestureEnabled: true,
            }}
          />
          <Stack.Screen 
            name="OTP" 
            component={OTPScreen}
            options={{
              title: 'Verify OTP',
              gestureEnabled: false,
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}