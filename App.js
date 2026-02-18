import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts, Montserrat_400Regular, Montserrat_500Medium, Montserrat_600SemiBold, Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { store } from './src/store/store';
import AppNavigator, { linking } from './src/navigation/AppNavigator';
import { theme } from './src/theme/theme';
import realtimeSyncService from './src/services/realtimeSync';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import FlashMessage, { showMessage } from "react-native-flash-message";
import messaging from '@react-native-firebase/messaging';
import { notificationService } from './src/services/notificationService';
import { doc, updateDoc } from 'firebase/firestore';
import { db, auth } from './src/config/firebase';

// Keep the splash screen visible while we fetch resources
try {
  SplashScreen.preventAutoHideAsync().catch(() => {
    /* reload if splash screen is already hidden */
  });
} catch (e) {
  console.warn('SplashScreen.preventAutoHideAsync error:', e);
}

export default function App() {
  let [fontsLoaded, fontError] = useFonts({
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
  });

  useEffect(() => {
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
      const unsubscribe = messaging().onMessage(async remoteMessage => {
        console.log('Foreground Notification:', remoteMessage);
        showMessage({
          message: remoteMessage.notification?.title || 'New Notification',
          description: remoteMessage.notification?.body || '',
          type: "success",
          icon: "success",
          duration: 4000,
          onPress: () => {
            // navigation.navigate(...) - requires navigation ref or hook
          }
        });
      });

      return unsubscribe;
    };

    const notificationUnsubscribePromise = setupNotifications();

    return () => {
      notificationUnsubscribePromise.then(unsub => unsub && unsub());
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
            <NavigationContainer linking={linking}>
              <AppNavigator />
              <FlashMessage position="top" />
            </NavigationContainer>
          </PaperProvider>
        </Provider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}