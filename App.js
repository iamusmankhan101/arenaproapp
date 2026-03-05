import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'react-native';
import { useFonts, Montserrat_400Regular, Montserrat_500Medium, Montserrat_600SemiBold, Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef } from 'react';
import { store } from './src/store/store';
import AppNavigator, { linking } from './src/navigation/AppNavigator';
import { theme } from './src/theme/theme';
import realtimeSyncService from './src/services/realtimeSync';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import FlashMessage, { showMessage } from "react-native-flash-message";
import { notificationService } from './src/services/notificationService';
import { doc, updateDoc } from 'firebase/firestore';
import { db, auth } from './src/config/firebase';
import * as Linking from 'expo-linking';

// Keep the splash screen visible while we fetch resources
try {
  SplashScreen.preventAutoHideAsync().catch(() => {
    /* reload if splash screen is already hidden */
  });
} catch (e) {
  console.warn('SplashScreen.preventAutoHideAsync error:', e);
}

export default function App() {
  const navigationRef = useRef();
  
  let [fontsLoaded, fontError] = useFonts({
    // Montserrat - Secondary font for body text
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
    // ClashDisplay - Primary font for headings/titles
    'ClashDisplay-Regular': require('./assets/fonts/ClashDisplay-Regular.otf'),
    'ClashDisplay-Medium': require('./assets/fonts/ClashDisplay-Medium.otf'),
    'ClashDisplay-Semibold': require('./assets/fonts/ClashDisplay-Semibold.otf'),
    'ClashDisplay-Bold': require('./assets/fonts/ClashDisplay-Bold.otf'),
  });

  // Handle deep links for password reset
  useEffect(() => {
    const handleDeepLink = (event) => {
      const url = event.url;
      console.log('🔗 Deep link received:', url);
      
      // Check if it's a password reset link
      if (url && url.includes('reset-password')) {
        try {
          // Extract oobCode from URL
          const urlObj = new URL(url);
          const oobCode = urlObj.searchParams.get('oobCode');
          
          if (oobCode && navigationRef.current) {
            console.log('🔑 Password reset code found, navigating to NewPassword screen');
            // Navigate to NewPassword screen with the code
            navigationRef.current.navigate('NewPassword', { oobCode });
          }
        } catch (error) {
          console.error('Error parsing deep link:', error);
        }
      }
    };

    // Listen for deep links when app is already open
    const subscription = Linking.addEventListener('url', handleDeepLink);

    // Check if app was opened with a deep link
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink({ url });
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    // Set default status bar style
    StatusBar.setBarStyle('dark-content', true);
    
    async function prepare() {
      try {
        // Keep the splash screen visible while we fetch resources
        // await SplashScreen.hideAsync(); // Removed to let AppNavigator control hiding
      } catch (e) {
        console.warn('SplashScreen.hideAsync error:', e);
      }

      if (fontsLoaded || fontError) {
        // Initialize real-time sync when app starts
        realtimeSyncService.initialize();
        console.log('🚀 Real-time sync initialized');
      }
    }
    prepare();

    // Cleanup on app unmount
    return () => {
      realtimeSyncService.cleanup();
    };
  }, [fontsLoaded, fontError]);

  // --- NOTIFICATION SETUP ---
  useEffect(() => {
    const setupNotifications = async () => {
      try {
        // 1. Request Permission
        const hasPermission = await notificationService.requestUserPermission();

        // 2. Get Token & Update User Profile
        if (hasPermission) {
          const token = await notificationService.getFCMToken();
          if (token && auth.currentUser) {
            try {
              const userRef = doc(db, 'users', auth.currentUser.uid);
              await updateDoc(userRef, { fcmToken: token });
              console.log('✅ FCM Token updated for user');
            } catch (e) {
              console.log('Silent error updating FCM token:', e.message);
            }
          }
        }

        // 3. Foreground Message Listener
        // Only attempt if messaging is available (checked inside notificationService)
        // NOTE: Commented out to prevent Metro resolver errors in Expo Go
        let messagingModule = null;
        /*
        try {
          messagingModule = require('@react-native-firebase/messaging').default;
        } catch (e) {
          // Module not found, skip listener
          return () => {};
        }
        */

        if (messagingModule) {
          const unsubscribe = messagingModule().onMessage(async remoteMessage => {
            console.log('Foreground Notification:', remoteMessage);
            showMessage({
              message: remoteMessage.notification?.title || 'New Notification',
              description: remoteMessage.notification?.body || '',
              type: "success",
              icon: "success",
              duration: 4000,
            });
          });
          return unsubscribe;
        }
      } catch (error) {
        console.log('Error in setupNotifications:', error);
      }
      return () => { };
    };

    let unsubscriber;
    setupNotifications().then(unsub => {
      unsubscriber = unsub;
    });

    return () => {
      if (unsubscriber) unsubscriber();
    };
  }, []);

  // Safety mechanism: Force hide splash screen after 5 seconds
  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        await SplashScreen.hideAsync();
        console.log('⏰ Splash screen hidden by safety timeout');
      } catch (e) {
        // Ignore error if already hidden
      }
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <Provider store={store}>
          <PaperProvider theme={theme}>
            <NavigationContainer ref={navigationRef} linking={linking}>
              <AppNavigator />
              <FlashMessage position="top" />
            </NavigationContainer>
          </PaperProvider>
        </Provider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}