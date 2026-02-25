import React, { useEffect, useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSelector, useDispatch } from 'react-redux';
import { loadStoredAuth, initializeAuth } from '../store/slices/authSlice';
import { theme } from '../theme/theme';
import { MaterialIcons } from '@expo/vector-icons';
import CustomTabBar from '../components/CustomTabBar';
import * as Linking from 'expo-linking';

// Admin Components
import AdminLoginScreen from '../screens/admin/AdminLoginScreen';
import AdminNavigator from './AdminNavigator';

// Splash Screen
import * as SplashScreen from 'expo-splash-screen';

// Auth Screens
import WelcomeScreen from '../screens/auth/WelcomeScreen';
import SignInScreen from '../screens/auth/SignInScreen';
import SignUpScreen from '../screens/auth/SignUpScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import NewPasswordScreen from '../screens/auth/NewPasswordScreen';
import OTPScreen from '../screens/auth/OTPScreen';

// Location Screens
import LocationPermissionScreen from '../screens/location/LocationPermissionScreen';
import ManualLocationScreen from '../screens/location/ManualLocationScreen';
import * as Location from 'expo-location';

// Main Screens
import HomeScreen from '../screens/main/HomeScreen';
import VenueListScreen from '../screens/main/VenueListScreen';
import MapScreen from '../screens/main/MapScreen';
import FavoritesScreen from '../screens/main/FavoritesScreen';
import BookingScreen from '../screens/booking/BookingScreen';
import ChallengeScreen from '../screens/team/ChallengeScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import SquadBuilderScreen from '../screens/main/SquadBuilderScreen';
import ManageProfileScreen from '../screens/profile/ManageProfileScreen';
import PasswordSecurityScreen from '../screens/profile/PasswordSecurityScreen';
import NotificationScreen from '../screens/profile/NotificationScreen';

// Detail Screens
import TurfDetailScreen from '../screens/turf/TurfDetailScreen';
import ChallengeDetailScreen from '../screens/team/ChallengeDetailScreen';
import BookingConfirmScreen from '../screens/booking/BookingConfirmScreen';
import BookingSuccessScreen from '../screens/booking/BookingSuccessScreen';
import EReceiptScreen from '../screens/booking/EReceiptScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

export const linking = {
  prefixes: [Linking.createURL('/'), 'https://arenapro.pk', 'arenapro://'],
  config: {
    screens: {
      NewPassword: {
        path: 'reset-password',
        parse: {
          oobCode: (oobCode) => oobCode,
        },
      },
      MainTabs: {
        screens: {
          Lalkaar: 'challenge',
        },
      },
      ChallengeDetail: 'challenge/:challengeId',
    },
  },
};

function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
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
        options={{ tabBarLabel: 'Challenge' }}
      />
      <Tab.Screen
        name="SquadBuilder"
        component={SquadBuilderScreen}
        options={{ tabBarLabel: 'Matchmaking' }}
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

  useEffect(() => {
    // Initialize Firebase auth listener
    dispatch(initializeAuth());

    // Load stored authentication on app start
    dispatch(loadStoredAuth());
  }, [dispatch]);

  const [hasLocationPermission, setHasLocationPermission] = useState(null);

  useEffect(() => {
    async function checkPermission() {
      if (isAuthenticated) {
        try {
          const { status } = await Location.getForegroundPermissionsAsync();
          setHasLocationPermission(status === 'granted');
        } catch (error) {
          console.log('📍 Error checking location permission:', error);
          setHasLocationPermission(false);
        }
      }
    }
    checkPermission();
  }, [isAuthenticated]);

  // Handle splash screen
  useEffect(() => {
    if (!initializing) {
      SplashScreen.hideAsync().catch(console.warn);
    }
  }, [initializing]);

  // Show splash screen while initializing or checking permissions
  if (initializing) {
    return null; // Keep splash screen visible
  }

  // For authenticated users, don't wait for location permission check
  // Let the app load and check permissions in background
  // The LocationPermissionScreen will handle the permission flow if needed

  // Debug what screen should be shown
  console.log('🔍 NAVIGATOR DEBUG: Auth state:', {
    isAuthenticated,
    initializing,
    hasUser: !!user,
    hasLocationPermission
  });

  if (isAuthenticated) {
    console.log('🔍 NAVIGATOR DEBUG: Rendering authenticated screens');
  } else {
    console.log('🔍 NAVIGATOR DEBUG: Rendering authentication screens');
  }

  return (
    <Stack.Navigator
      initialRouteName={isAuthenticated ? (hasLocationPermission ? 'MainTabs' : 'LocationPermission') : 'Welcome'}
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
            name="NewPassword"
            component={NewPasswordScreen}
            options={{
              title: 'New Password',
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
            name="LocationPermission"
            component={LocationPermissionScreen}
            options={{
              gestureEnabled: false,
            }}
          />
          <Stack.Screen
            name="ManualLocation"
            component={ManualLocationScreen}
            options={{
              title: 'Enter Location',
              gestureEnabled: true,
            }}
          />
          <Stack.Screen
            name="MainTabs"
            component={MainTabs}
            options={{
              gestureEnabled: false,
            }}
            initialParams={{ skipLocationCheck: hasLocationPermission === true }}
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
            name="Notification"
            component={NotificationScreen}
            options={{
              title: 'Notifications',
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
            name="BookingSuccess"
            component={BookingSuccessScreen}
            options={{
              title: 'Booking Success',
              gestureEnabled: false,
            }}
          />
          <Stack.Screen
            name="EReceipt"
            component={EReceiptScreen}
            options={{
              title: 'E-Receipt',
              gestureEnabled: true,
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
      )}
    </Stack.Navigator>
  );
}