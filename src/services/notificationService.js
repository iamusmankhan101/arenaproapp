import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { doc, setDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

// Configure how notifications appear when app is in foreground
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

export const notificationService = {
    /**
     * Register for push notifications and return the Expo push token
     */
    registerForPushNotifications: async () => {
        try {
            // Must be a physical device
            if (!Device.isDevice) {
                console.log('📱 Push notifications require a physical device');
                return null;
            }

            // Check existing permissions
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;

            // Request permission if not granted
            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }

            if (finalStatus !== 'granted') {
                console.log('❌ Push notification permission not granted');
                return null;
            }

            // Get Expo push token
            const projectId = Constants.expoConfig?.extra?.eas?.projectId;
            const tokenData = await Notifications.getExpoPushTokenAsync({
                projectId: projectId,
            });

            const token = tokenData.data;
            console.log('✅ Expo Push Token:', token);

            // Set up Android notification channel
            if (Platform.OS === 'android') {
                await Notifications.setNotificationChannelAsync('default', {
                    name: 'Arena Pro',
                    importance: Notifications.AndroidImportance.MAX,
                    vibrationPattern: [0, 250, 250, 250],
                    lightColor: '#004d43',
                    sound: 'default',
                });
            }

            return token;
        } catch (error) {
            console.error('❌ Error registering for push notifications:', error);
            return null;
        }
    },

    /**
     * Save the push token to the user's Firestore document
     */
    savePushToken: async (userId, token) => {
        if (!userId || !token) return;
        try {
            const userRef = doc(db, 'users', userId);
            await setDoc(userRef, {
                expoPushToken: token,
                pushTokenUpdatedAt: serverTimestamp(),
            }, { merge: true });
            console.log('✅ Push token saved to Firestore');
        } catch (error) {
            console.error('❌ Error saving push token:', error);
        }
    },

    /**
     * Create a notification in the Firestore notifications collection
     * This triggers the NotificationScreen to show it AND can be used to send a push
     */
    createNotification: async ({ userId, type, title, message, icon, data = {} }) => {
        if (!userId) return null;
        try {
            const notifRef = collection(db, 'notifications');
            const docRef = await addDoc(notifRef, {
                userId,
                type,        // 'booking', 'challenge', 'squad', 'system'
                title,
                message,
                icon: icon || 'notifications',
                read: false,
                data,        // Extra context: bookingId, challengeId, etc.
                createdAt: serverTimestamp(),
            });
            console.log('📬 Notification created:', title);
            return docRef.id;
        } catch (error) {
            console.error('❌ Error creating notification:', error);
            return null;
        }
    },

    /**
     * Send a local push notification immediately (works in Expo Go)
     */
    sendLocalNotification: async ({ title, body, data = {} }) => {
        try {
            await Notifications.scheduleNotificationAsync({
                content: {
                    title,
                    body,
                    data,
                    sound: 'default',
                },
                trigger: null, // null = send immediately
            });
            console.log('📤 Local notification sent:', title);
        } catch (error) {
            console.error('❌ Error sending local notification:', error);
        }
    },

    /**
     * Create a Firestore notification AND send a local push notification
     * This is the primary method to call from event triggers
     */
    notify: async ({ userId, type, title, message, icon, data = {} }) => {
        // Write to Firestore (for NotificationScreen)
        await notificationService.createNotification({ userId, type, title, message, icon, data });

        // Also send a local push notification for immediate feedback
        await notificationService.sendLocalNotification({ title, body: message, data: { type, ...data } });
    },

    /**
     * Set up notification response listener (when user taps a notification)
     * Returns a cleanup function to remove the listener
     */
    setupResponseListener: (navigation) => {
        const subscription = Notifications.addNotificationResponseReceivedListener(response => {
            const data = response.notification.request.content.data;
            console.log('📬 Notification tapped:', data);

            // Navigate based on notification type
            if (data.type === 'booking') {
                navigation.navigate('MainTabs', { screen: 'Bookings' });
            } else if (data.type === 'challenge') {
                if (data.challengeId) {
                    navigation.navigate('ChallengeDetail', { challengeId: data.challengeId });
                } else {
                    navigation.navigate('MainTabs', { screen: 'Lalkaar' });
                }
            } else if (data.type === 'squad') {
                navigation.navigate('MainTabs', { screen: 'SquadBuilder' });
            }
        });

        return () => subscription.remove();
    },

    /**
     * Set up foreground notification listener
     * Returns a cleanup function
     */
    setupForegroundListener: (callback) => {
        const subscription = Notifications.addNotificationReceivedListener(notification => {
            console.log('📬 Foreground notification:', notification.request.content.title);
            if (callback) callback(notification);
        });

        return () => subscription.remove();
    },
};
