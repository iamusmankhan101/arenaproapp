// Script to verify venues added through admin panel are visible to mobile app
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';

// Firebase config (same as your app)
const firebaseConfig = {
  apiKey: "AIzaSyBKCwem9qZWN0cy9hcmVuYS1wcm8tOTdiNWY",
  authDomain: "arena-pro-97b5f.firebaseapp.com",
  projectId: "arena-pro-97b5f",
  storageBucket: "arena-pro-97b5f.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Helper function to calculate distance between two points
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in kilometers
};

async function verifyAdminVenues() {
  try {
    console.log('🔍 Verifying venues for mobile app...');
    console.log('=====================================\n');
    
    // Get all venues
    const turfsRef = collection(db, 'venues');
    const snapshot = await getDocs(turfsRef);
    
    console.log(`📊 Total venues in database: ${snapshot.size}`);
    
    if (snapshot.empty) {
      console.log('❌ No venues found in database!');
      console.log('   Please add venues through the admin panel first.');
      return;
    }
    
    // Get active venues (what mobile app will see)
    const activeQuery = query(turfsRef, where('isActive', '==', true));
    const activeSnapshot = await getDocs(activeQuery);
    
    console.log(`✅ Active venues (visible to mobile): ${activeSnapshot.size}`);
    console.log(`⚠️  Inactive venues: ${snapshot.size - activeSnapshot.size}\n`);
    
    // Test mobile app query (nearby venues in Karachi)
    const karachiLat = 24.8607;
    const karachiLng = 67.0011;
    const radius = 50; // km
    
    console.log('🏟️  Venues that will appear in mobile app:');
    console.log('==========================================');
    
    let mobileVisibleCount = 0;
    
    activeSnapshot.forEach((doc) => {
      const data = doc.data();
      
      // Check location data
      let turfLat, turfLng;
      if (data.location?.coordinates) {
        turfLat = data.location.coordinates.latitude;
        turfLng = data.location.coordinates.longitude;
      } else if (data.location?.latitude) {
        turfLat = data.location.latitude;
        turfLng = data.location.longitude;
      } else if (data.latitude) {
        turfLat = data.latitude;
        turfLng = data.longitude;
      }
      
      if (turfLat && turfLng) {
        const distance = calculateDistance(karachiLat, karachiLng, turfLat, turfLng);
        
        if (distance <= radius) {
          mobileVisibleCount++;
          console.log(`✅ ${data.name || 'Unnamed Venue'}`);
          console.log(`   📍 Location: ${data.area || 'Unknown Area'}, ${data.city || 'Unknown City'}`);
          console.log(`   🏃 Sports: ${data.sports?.join(', ') || 'Not specified'}`);
          console.log(`   📏 Distance: ${distance.toFixed(1)}km from Karachi center`);
          console.log(`   💰 Price: PKR ${data.pricing?.basePrice || 'Not set'}/hour`);
          console.log(`   🕐 Hours: ${data.operatingHours?.open || '6:00'} - ${data.operatingHours?.close || '23:00'}`);
          console.log('');
        } else {
          console.log(`⚠️  ${data.name || 'Unnamed Venue'} - Too far (${distance.toFixed(1)}km)`);
        }
      } else {
        console.log(`❌ ${data.name || 'Unnamed Venue'} - No location data`);
      }
    });
    
    console.log('==========================================');
    console.log(`📱 Total venues visible in mobile app: ${mobileVisibleCount}`);
    
    if (mobileVisibleCount === 0) {
      console.log('\n❌ No venues will appear in mobile app!');
      console.log('   Possible issues:');
      console.log('   1. No active venues in database');
      console.log('   2. Venues are too far from Karachi (>50km)');
      console.log('   3. Venues missing location data');
      console.log('   4. Please add venues through admin panel');
    } else {
      console.log('\n✅ Venues should appear in mobile app!');
      console.log('   If they don\'t appear:');
      console.log('   1. Restart your mobile app');
      console.log('   2. Check internet connection');
      console.log('   3. Check Firebase configuration');
    }
    
  } catch (error) {
    console.error('❌ Error verifying venues:', error);
  }
}

// Run verification
verifyAdminVenues();