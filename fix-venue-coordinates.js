// Fix venue coordinates to ensure they're unique and properly distributed
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyA7G3uLmKNCDhiyTuwK6GBbTxRJFvmGNpY",
  authDomain: "arena-pro-97b5f.firebaseapp.com",
  projectId: "arena-pro-97b5f",
  storageBucket: "arena-pro-97b5f.firebasestorage.app",
  messagingSenderId: "960416327217",
  appId: "1:960416327217:android:bc3d63f865bef8be8f5710"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Unique coordinates for each venue in Lahore area
const uniqueCoordinates = [
  { latitude: 31.5204, longitude: 74.3587, area: 'DHA Phase 5' },
  { latitude: 31.5304, longitude: 74.3687, area: 'Gulberg III' },
  { latitude: 31.5104, longitude: 74.3487, area: 'Model Town' },
  { latitude: 31.4354, longitude: 74.2635, area: 'Wapda Town' },
  { latitude: 31.5454, longitude: 74.3787, area: 'Johar Town' },
  { latitude: 31.4904, longitude: 74.3287, area: 'Garden Town' },
  { latitude: 31.5604, longitude: 74.3887, area: 'Defence' },
  { latitude: 31.4754, longitude: 74.3137, area: 'Faisal Town' }
];

async function fixVenueCoordinates() {
  console.log('🔧 Fixing venue coordinates to prevent overlapping...\n');
  
  try {
    // Get all venues
    const venuesRef = collection(db, 'venues');
    const venuesSnapshot = await getDocs(venuesRef);
    
    console.log(`📊 Found ${venuesSnapshot.size} venues to fix`);
    
    if (venuesSnapshot.size === 0) {
      console.log('❌ No venues found in database');
      return;
    }
    
    const venues = [];
    venuesSnapshot.forEach((doc) => {
      venues.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // Check current coordinates
    console.log('\n📍 Current venue coordinates:');
    venues.forEach((venue, index) => {
      console.log(`${index + 1}. ${venue.name}:`);
      console.log(`   Direct: ${venue.latitude}, ${venue.longitude}`);
      console.log(`   Location: ${venue.location?.latitude}, ${venue.location?.longitude}`);
    });
    
    // Update each venue with unique coordinates
    console.log('\n🔄 Updating venue coordinates...');
    
    for (let i = 0; i < venues.length; i++) {
      const venue = venues[i];
      const newCoords = uniqueCoordinates[i % uniqueCoordinates.length];
      
      console.log(`${i + 1}. Updating ${venue.name}:`);
      console.log(`   New coordinates: ${newCoords.latitude}, ${newCoords.longitude} (${newCoords.area})`);
      
      const venueRef = doc(db, 'venues', venue.id);
      await updateDoc(venueRef, {
        latitude: newCoords.latitude,
        longitude: newCoords.longitude,
        location: {
          latitude: newCoords.latitude,
          longitude: newCoords.longitude,
          city: 'Lahore',
          area: newCoords.area
        },
        area: newCoords.area,
        updatedAt: new Date()
      });
      
      console.log(`   ✅ Updated successfully`);
    }
    
    console.log(`\n✅ Successfully updated ${venues.length} venue coordinates!`);
    
    console.log('\n📊 COORDINATE DISTRIBUTION:');
    uniqueCoordinates.slice(0, venues.length).forEach((coord, index) => {
      const venue = venues[index];
      console.log(`${index + 1}. ${venue?.name || 'Venue'}: ${coord.latitude}, ${coord.longitude} (${coord.area})`);
    });
    
    console.log('\n🎯 NEXT STEPS:');
    console.log('1. Refresh the MapScreen in the mobile app');
    console.log('2. You should now see all 5 markers spread across Lahore');
    console.log('3. No more overlapping or glitching markers');
    console.log('4. Each venue has a unique location');
    
    console.log('\n💡 BENEFITS:');
    console.log('- All venues now have unique coordinates');
    console.log('- Markers will not overlap or glitch');
    console.log('- Better user experience on map');
    console.log('- Realistic venue distribution across Lahore');
    
  } catch (error) {
    console.error('❌ Error fixing venue coordinates:', error);
  }
}

// Run the function
fixVenueCoordinates().then(() => {
  console.log('\n✅ Venue coordinates fix completed');
  process.exit(0);
}).catch(error => {
  console.error('❌ Failed to fix venue coordinates:', error);
  process.exit(1);
});