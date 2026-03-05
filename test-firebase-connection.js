// Quick Firebase Connection Test
// Run with: node test-firebase-connection.js

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyA7G3uLmKNCDhiyTuwK6GBbTxRJFvmGNpY",
  authDomain: "arena-pro-97b5f.firebaseapp.com",
  projectId: "arena-pro-97b5f",
  storageBucket: "arena-pro-97b5f.firebasestorage.app",
  messagingSenderId: "960416327217",
  appId: "1:960416327217:android:bc3d63f865bef8be8f5710"
};

async function testConnection() {
  try {
    console.log('🔥 Testing Firebase connection...');
    
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    console.log('✅ Firebase initialized successfully');
    
    // Test reading turfs collection
    const turfsRef = collection(db, 'turfs');
    const snapshot = await getDocs(turfsRef);
    
    console.log(`✅ Connected to Firestore`);
    console.log(`📊 Found ${snapshot.size} venues in database`);
    
    if (snapshot.size > 0) {
      console.log('\n📋 Existing venues:');
      snapshot.forEach((doc) => {
        const data = doc.data();
        console.log(`  - ${data.name} (${data.location?.area || 'Unknown area'})`);
      });
    } else {
      console.log('ℹ️  No venues found - ready to add your first venue!');
    }
    
    console.log('\n🎉 Firebase connection test successful!');
    console.log('🚀 Your real-time sync should work perfectly!');
    
  } catch (error) {
    console.error('❌ Firebase connection failed:', error.message);
    console.log('\n🔧 Troubleshooting steps:');
    console.log('1. Check your internet connection');
    console.log('2. Verify Firebase project settings');
    console.log('3. Ensure Firestore is enabled in Firebase Console');
    console.log('4. Check Firebase security rules');
  }
}

testConnection();