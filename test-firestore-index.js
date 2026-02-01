import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyA7G3uLmKNCDhiyTuwK6GBbTxRJFvmGNpY",
  authDomain: "arena-pro-97b5f.firebaseapp.com",
  projectId: "arena-pro-97b5f",
  storageBucket: "arena-pro-97b5f.firebasestorage.app",
  messagingSenderId: "960416327217",
  appId: "1:960416327217:android:bc3d63f865bef8be8f5710"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

console.log('🧪 Testing Firestore Index...');

async function testFirestoreIndex() {
  try {
    console.log('📋 Testing the composite index query...');
    
    // This is the exact query that was failing
    const bookingsRef = collection(db, 'bookings');
    const testDate = new Date();
    testDate.setHours(0, 0, 0, 0);
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);
    
    const q = query(bookingsRef, 
      where('turfId', '==', 'test-venue-id'),
      where('date', '>=', testDate),
      where('date', '<=', endDate),
      where('status', 'in', ['confirmed', 'pending'])
    );
    
    console.log('🔄 Executing query...');
    const snapshot = await getDocs(q);
    
    console.log(`✅ SUCCESS: Query executed successfully!`);
    console.log(`📊 Found ${snapshot.size} bookings (this is expected to be 0 for test venue)`);
    console.log('💡 The Firestore index is working correctly.');
    
  } catch (error) {
    if (error.message.includes('index')) {
      console.log('⏳ Index is still building...');
      console.log('💡 Please wait 2-3 more minutes and try again.');
      console.log('🔗 Check status at: https://console.firebase.google.com/project/arena-pro-97b5f/firestore/indexes');
    } else {
      console.error('❌ Unexpected error:', error.message);
    }
  }
}

testFirestoreIndex();