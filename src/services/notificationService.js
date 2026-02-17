import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PermissionsAndroid, Platform } from 'react-native';

export const notificationService = {
    // Request permission
    requestUserPermission: async () => {
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
    },

    // Get FCM Token
    getFCMToken: async () => {
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
        return messaging().onTokenRefresh(token => {
            console.log('FCM Token refreshed:', token);
            AsyncStorage.setItem('fcmToken', token);
            callback(token);
        });
    },

    // Background Handler (Must be called early outside components)
    setBackgroundMessageHandler: () => {
        messaging().setBackgroundMessageHandler(async remoteMessage => {
            console.log('Message handled in the background!', remoteMessage);
        });
    }
};
