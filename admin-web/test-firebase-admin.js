// Test Firebase connection for admin panel
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyA7G3uLmKNCDhiyTuwK6GBbTxRJFvmGNpY",
  authDomain: "arena-pro-97b5f.firebaseapp.com",
  projectId: "arena-pro-97b5f",
  storageBucket: "arena-pro-97b5f.firebasestorage.app",
  messagingSenderId: "960416327217",
  appId: "1:960416327217:android:bc3d63f865bef8be8f5710"
};

async function testFirebaseConnection() {
  try {
    console.log('🔥 Testing Firebase connection for admin panel...');
    
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    console.log('✅ Firebase initialized successfully');
    console.log('📊 DB instance:', db);
    
    // Test reading turfs collection
    const turfsRef = collection(db, 'turfs');
    console.log('📋 Turfs collection reference:', turfsRef);
    
    const snapshot = await getDocs(turfsRef);
    console.log(`✅ Successfully connected to Firestore`);
    console.log(`📊 Found ${snapshot.size} venues in database`);
    
    if (snapshot.size > 0) {
      console.log('\n📋 Existing venues:');
      snapshot.forEach((doc) => {
        const data = doc.data();
        console.log(`  - ${data.name} (${data.location?.area || 'Unknown area'})`);
      });
    } else {
      console.log('ℹ️  No venues found - database is empty');
    }
    
    console.log('\n🎉 Firebase connection test successful!');
    console.log('🚀 Admin panel should work with Firebase!');
    
  } catch (error) {
    console.error('❌ Firebase connection failed:', error);
    console.log('\n🔧 Troubleshooting steps:');
    console.log('1. Check your internet connection');
    console.log('2. Verify Firebase project settings');
    console.log('3. Ensure Firestore is enabled in Firebase Console');
    console.log('4. Check Firebase security rules');
  }
}

// Run the test
testFirebaseConnection();