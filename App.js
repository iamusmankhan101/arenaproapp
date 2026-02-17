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
      if (fontsLoaded || fontError) {
        try {
          await SplashScreen.hideAsync();
        } catch (e) {
          console.warn('SplashScreen.hideAsync error:', e);
        }

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
            </NavigationContainer>
          </PaperProvider>
        </Provider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}