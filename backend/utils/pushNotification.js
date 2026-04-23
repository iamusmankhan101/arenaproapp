const { getFirestore } = require('firebase-admin/firestore');
const admin = require('firebase-admin');

// Initialize Firebase Admin if not already done
if (!admin.apps.length) {
    try {
        const serviceAccount = require('../config/serviceAccountKey.json');
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
    } catch (error) {
        // Fallback: initialize with default credentials
        admin.initializeApp();
        console.log('⚠️ Firebase Admin initialized with default credentials');
    }
}

const firestoreDb = getFirestore();

/**
 * Send a push notification via Expo Push API
 * @param {string} expoPushToken - The recipient's Expo push token
 * @param {string} title - Notification title
 * @param {string} body - Notification body/message
 * @param {object} data - Extra data to attach to the notification
 */
const sendExpoPush = async (expoPushToken, title, body, data = {}) => {
    if (!expoPushToken) {
        console.log('⚠️ No push token provided, skipping push');
        return null;
    }

    const message = {
        to: expoPushToken,
        sound: 'default',
        title,
        body,
        data,
        priority: 'high',
        channelId: 'default',
    };

    try {
        const response = await fetch('https://exp.host/--/api/v2/push/send', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Accept-encoding': 'gzip, deflate',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(message),
        });

        const result = await response.json();
        console.log('📤 Expo push sent:', result);
        return result;
    } catch (error) {
        console.error('❌ Error sending Expo push:', error);
        return null;
    }
};

/**
 * Send a push notification to a user by userId
 * Looks up their Expo push token from Firestore and sends the push
 * Also writes a notification document to the notifications collection
 */
const sendPushToUser = async (userId, title, body, type = 'system', icon = 'notifications', data = {}) => {
    try {
        // 1. Write notification to Firestore (for in-app notification screen)
        await firestoreDb.collection('notifications').add({
            userId,
            type,
            title,
            message: body,
            icon,
            read: false,
            data,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        console.log('📬 Notification written to Firestore for user:', userId);

        // 2. Look up user's push token
        const userDoc = await firestoreDb.collection('users').doc(userId).get();
        if (!userDoc.exists) {
            console.log('⚠️ User not found:', userId);
            return;
        }

        const userData = userDoc.data();
        const pushToken = userData.expoPushToken;

        if (!pushToken) {
            console.log('⚠️ No push token for user:', userId);
            return;
        }

        // 3. Send the push notification
        await sendExpoPush(pushToken, title, body, { type, ...data });
    } catch (error) {
        console.error('❌ Error in sendPushToUser:', error);
    }
};

/**
 * Send push notifications to multiple users
 */
const sendPushToMultipleUsers = async (userIds, title, body, type = 'system', icon = 'notifications', data = {}) => {
    const promises = userIds.map(userId => sendPushToUser(userId, title, body, type, icon, data));
    await Promise.allSettled(promises);
};

module.exports = {
    sendExpoPush,
    sendPushToUser,
    sendPushToMultipleUsers,
};
