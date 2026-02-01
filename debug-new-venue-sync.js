import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where, orderBy } from 'firebase/firestore';

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

console.log('🔍 Debugging New Venue Sync Issue...');

async function debugNewVenueSync() {
  try {
    // Get all venues from database
    console.log('📋 Fetching all venues from Firebase...');
    const venuesRef = collection(db, 'venues');
    const allVenuesQuery = query(venuesRef, orderBy('createdAt', 'desc'));
    const allSnapshot = await getDocs(allVenuesQuery);
    
    console.log(`📊 Total venues in database: ${allSnapshot.size}`);
    
    if (allSnapshot.empty) {
      console.log('❌ No venues found in database');
      return;
    }
    
    // Show all venues with creation dates
    console.log('\n📋 All venues in database:');
    allSnapshot.forEach((doc, index) => {
      const data = doc.data();
      const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
      console.log(`   ${index + 1}. ${data.name} (ID: ${doc.id})`);
      console.log(`      Created: ${createdAt.toLocaleString()}`);
      console.log(`      Active: ${data.isActive}`);
      console.log(`      Status: ${data.status}`);
      console.log('');
    });
    
    // Test mobile app query (active venues only)
    console.log('📱 Testing mobile app query (active venues only)...');
    const activeVenuesQuery = query(venuesRef, where('isActive', '==', true));
    const activeSnapshot = await getDocs(activeVenuesQuery);
    
    console.log(`📊 Active venues (mobile app would see): ${activeSnapshot.size}`);
    
    if (activeSnapshot.size < allSnapshot.size) {
      console.log('⚠️  Some venues are not active - this might be why they\'re not showing in mobile app');
      
      // Find inactive venues
      const inactiveVenues = [];
      allSnapshot.forEach((doc) => {
        const data = doc.data();
        if (!data.isActive) {
          inactiveVenues.push({ id: doc.id, name: data.name, status: data.status });
        }
      });
      
      if (inactiveVenues.length > 0) {
        console.log('\n❌ Inactive venues (not showing in mobile app):');
        inactiveVenues.forEach(venue => {
          console.log(`   - ${venue.name} (ID: ${venue.id}) - Status: ${venue.status}`);
        });
      }
    }
    
    // Check for missing required fields
    console.log('\n🔍 Checking venue data structure...');
    const requiredFields = ['name', 'sports', 'isActive', 'pricing', 'operatingHours'];
    
    activeSnapshot.forEach((doc) => {
      const data = doc.data();
      const missingFields = requiredFields.filter(field => !data[field]);
      
      if (missingFields.length > 0) {
        console.log(`⚠️  Venue "${data.name}" missing fields: ${missingFields.join(', ')}`);
      } else {
        console.log(`✅ Venue "${data.name}" has all required fields`);
      }
    });
    
    // Test the exact mobile app API call
    console.log('\n🧪 Testing mobile app API call...');
    
    // Simulate getNearbyTurfs function
    const turfs = [];
    activeSnapshot.forEach((doc) => {
      const data = doc.data();
      
      const serializedData = {
        id: doc.id,
        ...data,
        distance: 0,
        sport: Array.isArray(data.sports) ? data.sports[0] : (typeof data.sports === 'string' ? data.sports.split(',')[0].trim() : 'Unknown'),
        pricePerHour: data.pricing?.basePrice || 0,
        time: `${data.operatingHours?.open || '6:00'} to ${data.operatingHours?.close || '23:00'} (All Days)`
      };
      
      turfs.push(serializedData);
    });
    
    // Sort by name (same as mobile app)
    turfs.sort((a, b) => a.name.localeCompare(b.name));
    
    console.log(`📱 Mobile app would display ${turfs.length} venues:`);
    turfs.forEach((turf, index) => {
      console.log(`   ${index + 1}. ${turf.name} - ${turf.sport} - PKR ${turf.pricePerHour}`);
    });
    
    // Check if newest venue is in the list
    if (allSnapshot.size > 0) {
      const newestVenue = allSnapshot.docs[0].data();
      const newestVenueInMobileList = turfs.find(t => t.name === newestVenue.name);
      
      if (newestVenueInMobileList) {
        console.log(`\n✅ Newest venue "${newestVenue.name}" WILL show in mobile app`);
      } else {
        console.log(`\n❌ Newest venue "${newestVenue.name}" will NOT show in mobile app`);
        console.log('   Possible reasons:');
        console.log(`   - isActive: ${newestVenue.isActive}`);
        console.log(`   - status: ${newestVenue.status}`);
        console.log(`   - Missing required fields`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error debugging new venue sync:', error);
  }
}

debugNewVenueSync();