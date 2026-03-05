import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';

// Firebase config (same as mobile app)
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

console.log('🔍 Testing mobile app venue loading...');

async function testMobileVenueLoading() {
  try {
    // Test the exact query the mobile app uses
    console.log('📱 Simulating mobile app getNearbyTurfs query...');
    
    const venuesRef = collection(db, 'venues');
    const q = query(venuesRef, where('isActive', '==', true));
    const snapshot = await getDocs(q);
    
    console.log(`📊 Found ${snapshot.size} active venues`);
    
    const venues = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`\n🏟️ Venue: ${data.name} (ID: ${doc.id})`);
      console.log(`   Sports: ${data.sports?.join(', ') || 'Not specified'}`);
      console.log(`   Area: ${data.area || 'Not specified'}`);
      console.log(`   Active: ${data.isActive}`);
      console.log(`   Location: ${JSON.stringify(data.location || { lat: data.latitude, lng: data.longitude })}`);
      
      // Check if venue has required fields for mobile app
      const hasRequiredFields = data.name && data.area && (data.location || (data.latitude && data.longitude));
      console.log(`   Has required fields: ${hasRequiredFields ? '✅' : '❌'}`);
      
      if (hasRequiredFields) {
        venues.push({
          id: doc.id,
          ...data
        });
      }
    });
    
    console.log(`\n📱 Mobile app would show ${venues.length} venues`);
    
    if (venues.length === 0) {
      console.log('❌ No venues would be displayed in mobile app');
      console.log('💡 Check if venues have required fields: name, area, location/coordinates');
    } else {
      console.log('✅ Venues should be visible in mobile app');
    }
    
  } catch (error) {
    console.error('❌ Error testing mobile venue loading:', error);
  }
}

testMobileVenueLoading();