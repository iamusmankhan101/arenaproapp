import AsyncStorage from '@react-native-async-storage/async-storage';
import { PermissionsAndroid, Platform } from 'react-native';

// Dynamically import messaging only if it exists (for native builds)
// In Expo Go, this will fail or return a mock if not linked correctly
let messaging;
try {
    messaging = require('@react-native-firebase/messaging').default;
} catch (e) {
    console.log('Firebase Messaging native module not available');
}

export const notificationService = {
    // Request permission
    requestUserPermission: async () => {
        if (!messaging) {
            console.log('Push notifications skipping: Native module not found');
            return false;
        }

        try {
            if (Platform.OS === 'android') {
                const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
                if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                    return true;
                }
            }

            const authStatus = await messaging().requestPermission();
            const enabled =
                authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
                authStatus === messaging.AuthorizationStatus.PROVISIONAL;

            console.log('Authorization status:', authStatus);
            return enabled;
        } catch (error) {
            console.log('Error requesting permission:', error);
            return false;
        }
    },

    // Get FCM Token
    getFCMToken: async () => {
        if (!messaging) return null;
        try {
            // Check if we already have a token
            const fcmToken = await AsyncStorage.getItem('fcmToken');
            if (fcmToken) {
                console.log('Found saved FCM token:', fcmToken);
                return fcmToken;
            }

            // If not, get a new one
            const token = await messaging().getToken();
            if (token) {
                console.log('New FCM token:', token);
                await AsyncStorage.setItem('fcmToken', token);
                return token;
            }
        } catch (error) {
            console.log('Error getting FCM token:', error);
            return null;
        }
    },

    // Listen for Token Refresh
    onTokenRefresh: (callback) => {
        if (!messaging) return () => { };
        try {
            return messaging().onTokenRefresh(token => {
                console.log('FCM Token refreshed:', token);
                AsyncStorage.setItem('fcmToken', token);
                callback(token);
            });
        } catch (error) {
            console.log('Error in onTokenRefresh:', error);
            return () => { };
        }
    },

    // Background Handler (Must be called early outside components)
    setBackgroundMessageHandler: () => {
        if (!messaging) return;
        try {
            messaging().setBackgroundMessageHandler(async remoteMessage => {
                console.log('Message handled in the background!', remoteMessage);
            });
        } catch (error) {
            console.log('Error setting background handler:', error);
        }
    }
};
