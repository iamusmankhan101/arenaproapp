const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, where, orderBy, limit } = require('firebase/firestore');

const firebaseConfig = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "dummy",
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "arenapro-5175b.firebaseapp.com",
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "arenapro-5175b",
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "arenapro-5175b.appspot.com",
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "73151834954",
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "1:73151834954:web:0e7c51475c80edb5",
    measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-D2L8R09F3M"
};

// We need to parse .env file to get correct values if dummy fails
const fs = require('fs');
const dotenv = require('dotenv');
if (fs.existsSync('.env')) {
    const envConfig = dotenv.parse(fs.readFileSync('.env'))
    for (const k in envConfig) {
        process.env[k] = envConfig[k]
    }
}

// override config
firebaseConfig.apiKey = process.env.EXPO_PUBLIC_FIREBASE_API_KEY;
firebaseConfig.authDomain = process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN;
firebaseConfig.projectId = process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID;

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
    try {
        const bookingsRef = collection(db, 'bookings');
        const q1 = query(bookingsRef, orderBy('createdAt', 'desc'), limit(5));
        const snap = await getDocs(q1);
        snap.docs.forEach(doc => {
            const d = doc.data();
            console.log(`Booking ${doc.id}:`);
            console.log(` - needPlayers: ${d.needPlayers} (${typeof d.needPlayers})`);
            console.log(` - status: ${d.status}`);
            console.log(` - dateTime: ${d.dateTime}`);
            console.log(` - playersNeeded: ${d.playersNeeded}`);
            console.log(` - playersJoined: ${d.playersJoined ? d.playersJoined.length : 0}`);
        });
        console.log("Done");
    } catch (err) {
        console.error(err);
    }
}

run();
