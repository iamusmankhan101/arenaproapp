const admin = require('firebase-admin');
const path = require('path');

let isInitialized = false;

try {
    // Check if service account key exists
    const serviceAccount = require('./serviceAccountKey.json');

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });

    isInitialized = true;
    console.log('✅ Firebase Admin Initialized successfully');
} catch (error) {
    console.warn('⚠️ Firebase Admin Initialization Failed:', error.message);
    console.warn('⚠️ Make sure backend/config/serviceAccountKey.json exists');
}

/**
 * Sends a push notification to a specific device token
 * @param {string} token - The FCM device token
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {object} data - Optional data payload
 */
const sendNotification = async (token, title, body, data = {}) => {
    if (!isInitialized) {
        console.warn('⚠️ Cannot send notification: Firebase Admin not initialized');
        return false;
    }

    if (!token) {
        console.warn('⚠️ Cannot send notification: No token provided');
        return false;
    }

    const message = {
        notification: {
            title,
            body,
        },
        data: data, // Data payload must be strings
        token: token,
    };

    try {
        const response = await admin.messaging().send(message);
        console.log('✅ Notification sent successfully:', response);
        return true;
    } catch (error) {
        console.error('❌ Error sending notification:', error);
        return false;
    }
};

module.exports = {
    admin,
    sendNotification
};
