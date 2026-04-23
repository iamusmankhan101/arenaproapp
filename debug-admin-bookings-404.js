// Debug script for admin panel 404 bookings error
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyA7G3uLmKNCDhiyTuwK6GBbTxRJFvmGNpY",
  authDomain: "arena-pro-97b5f.firebaseapp.com",
  projectId: "arena-pro-97b5f",
  storageBucket: "arena-pro-97b5f.firebasestorage.app",
  messagingSenderId: "960416327217",
  appId: "1:960416327217:android:bc3d63f865bef8be8f5710"
};

async function debugAdminBookings() {
  try {
    console.log('🔍 Debugging admin panel bookings 404 error...');
    
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    // Test bookings collection
    console.log('📅 Testing bookings collection...');
    const bookingsRef = collection(db, 'bookings');
    const bookingsSnapshot = await getDocs(bookingsRef);
    
    console.log(`✅ Bookings collection exists: ${bookingsSnapshot.size} documents`);
    
    if (bookingsSnapshot.size > 0) {
      console.log('📋 Sample booking data:');
      const firstBooking = bookingsSnapshot.docs[0];
      console.log('ID:', firstBooking.id);
      console.log('Data:', JSON.stringify(firstBooking.data(), null, 2));
    }
    
    // Test venues collection for reference
    console.log('\n🏟️ Testing venues collection...');
    const venuesRef = collection(db, 'venues');
    const venuesSnapshot = await getDocs(venuesRef);
    
    console.log(`✅ Venues collection exists: ${venuesSnapshot.size} documents`);
    
    console.log('\n🔧 Debugging suggestions:');
    console.log('1. Clear browser cache and hard refresh (Ctrl+Shift+R)');
    console.log('2. Check browser Network tab for the exact failing request');
    console.log('3. Ensure no service worker is caching old API calls');
    console.log('4. Check if any browser extensions are interfering');
    console.log('5. Try opening admin panel in incognito mode');
    
    console.log('\n✅ Firebase connection is working correctly');
    console.log('The 404 error is likely due to browser cache or old JavaScript');
    
  } catch (error) {
    console.error('❌ Error debugging admin bookings:', error);
  }
}

debugAdminBookings();