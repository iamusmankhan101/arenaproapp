// Script to debug venue sync between admin panel and mobile app
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where, orderBy } from 'firebase/firestore';

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

async function debugVenueSync() {
  try {
    console.log('🔍 DEBUGGING VENUE SYNC BETWEEN ADMIN PANEL AND MOBILE APP');
    console.log('==========================================================\n');
    
    // Get all venues from turfs collection
    const turfsRef = collection(db, 'turfs');
    const allVenuesSnapshot = await getDocs(turfsRef);
    
    console.log(`📊 Total venues in 'turfs' collection: ${allVenuesSnapshot.size}\n`);
    
    if (allVenuesSnapshot.empty) {
      console.log('❌ NO VENUES FOUND IN DATABASE!');
      console.log('   This means:');
      console.log('   1. No venues have been added through admin panel yet');
      console.log('   2. Or venues are being stored in a different collection');
      console.log('   3. Or there\'s a Firebase connection issue\n');
      
      // Check if there are venues in other possible collections
      console.log('🔍 Checking other possible collections...');
      const possibleCollections = ['venues', 'venue', 'sports_venues', 'locations'];
      
      for (const collectionName of possibleCollections) {
        try {
          const altRef = collection(db, collectionName);
          const altSnapshot = await getDocs(altRef);
          if (!altSnapshot.empty) {
            console.log(`✅ Found ${altSnapshot.size} documents in '${collectionName}' collection`);
          }
        } catch (error) {
          // Collection doesn't exist, ignore
        }
      }
      
      return;
    }
    
    console.log('🏟️  DETAILED VENUE ANALYSIS:');
    console.log('============================\n');
    
    let activeCount = 0;
    let inactiveCount = 0;
    let mobileVisibleCount = 0;
    let adminVisibleCount = 0;
    
    // Karachi coordinates for mobile app distance calculation
    const karachiLat = 24.8607;
    const karachiLng = 67.0011;
    const mobileRadius = 50; // km
    
    allVenuesSnapshot.forEach((doc, index) => {
      const data = doc.data();
      const venueId = doc.id;
      const venueName = data.name || 'Unnamed Venue';
      
      console.log(`${index + 1}. ${venueName} (ID: ${venueId})`);
      console.log(`   📍 Location Data:`);
      
      // Check location data structure
      let turfLat, turfLng, locationInfo = 'No location data';
      if (data.location?.coordinates) {
        turfLat = data.location.coordinates.latitude;
        turfLng = data.location.coordinates.longitude;
        locationInfo = `coordinates: ${turfLat}, ${turfLng}`;
      } else if (data.location?.latitude) {
        turfLat = data.location.latitude;
        turfLng = data.location.longitude;
        locationInfo = `location: ${turfLat}, ${turfLng}`;
      } else if (data.latitude) {
        turfLat = data.latitude;
        turfLng = data.longitude;
        locationInfo = `direct: ${turfLat}, ${turfLng}`;
      }
      
      console.log(`      ${locationInfo}`);
      console.log(`      Area: ${data.area || 'Not specified'}, City: ${data.city || 'Not specified'}`);
      
      // Check if active
      const isActive = data.isActive === true;
      console.log(`   🔄 Status: ${isActive ? 'ACTIVE' : 'INACTIVE'}`);
      
      if (isActive) {
        activeCount++;
        adminVisibleCount++; // Admin can see all active venues
        
        // Check if mobile app can see this venue
        if (turfLat && turfLng) {
          const distance = calculateDistance(karachiLat, karachiLng, turfLat, turfLng);
          console.log(`   📏 Distance from Karachi: ${distance.toFixed(1)}km`);
          
          if (distance <= mobileRadius) {
            mobileVisibleCount++;
            console.log(`   📱 MOBILE VISIBLE: YES (within ${mobileRadius}km radius)`);
          } else {
            console.log(`   📱 MOBILE VISIBLE: NO (too far, >${mobileRadius}km)`);
          }
        } else {
          console.log(`   📱 MOBILE VISIBLE: NO (missing location data)`);
        }
      } else {
        inactiveCount++;
        console.log(`   📱 MOBILE VISIBLE: NO (inactive)`);
      }
      
      // Check other important fields
      console.log(`   🏃 Sports: ${data.sports?.join(', ') || 'Not specified'}`);
      console.log(`   💰 Base Price: PKR ${data.pricing?.basePrice || 'Not set'}`);
      console.log(`   🕐 Hours: ${data.operatingHours?.open || 'Not set'} - ${data.operatingHours?.close || 'Not set'}`);
      console.log(`   📅 Created: ${data.createdAt?.toDate()?.toLocaleString() || 'Unknown'}`);
      console.log('');
    });
    
    console.log('📊 SUMMARY:');
    console.log('===========');
    console.log(`Total venues in database: ${allVenuesSnapshot.size}`);
    console.log(`Active venues: ${activeCount}`);
    console.log(`Inactive venues: ${inactiveCount}`);
    console.log(`Visible in admin panel: ${adminVisibleCount}`);
    console.log(`Visible in mobile app: ${mobileVisibleCount}\n`);
    
    if (mobileVisibleCount === 0) {
      console.log('❌ PROBLEM IDENTIFIED: NO VENUES VISIBLE IN MOBILE APP');
      console.log('   Possible causes:');
      console.log('   1. All venues are inactive (isActive: false)');
      console.log('   2. All venues are too far from Karachi (>50km)');
      console.log('   3. Venues missing location data (latitude/longitude)');
      console.log('   4. Mobile app using wrong collection name');
      console.log('   5. Mobile app Firebase configuration issue\n');
      
      console.log('🔧 SOLUTIONS:');
      console.log('   1. Make sure venues are set to active in admin panel');
      console.log('   2. Add venues in/near Karachi (or adjust mobile app radius)');
      console.log('   3. Ensure all venues have proper latitude/longitude');
      console.log('   4. Check mobile app Firebase configuration');
    } else {
      console.log('✅ VENUES SHOULD BE VISIBLE IN MOBILE APP');
      console.log('   If they\'re not showing up:');
      console.log('   1. Restart your mobile app');
      console.log('   2. Check mobile app internet connection');
      console.log('   3. Check mobile app Firebase configuration');
      console.log('   4. Check mobile app console for errors');
    }
    
    // Test mobile app query exactly
    console.log('\n🧪 TESTING MOBILE APP QUERY:');
    console.log('=============================');
    
    try {
      const mobileQuery = query(turfsRef, where('isActive', '==', true));
      const mobileSnapshot = await getDocs(mobileQuery);
      
      console.log(`Mobile query found: ${mobileSnapshot.size} active venues`);
      
      const mobileVenues = [];
      mobileSnapshot.forEach((doc) => {
        const data = doc.data();
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
          if (distance <= mobileRadius) {
            mobileVenues.push({
              id: doc.id,
              name: data.name,
              distance: distance.toFixed(1)
            });
          }
        }
      });
      
      console.log(`Venues within mobile app radius: ${mobileVenues.length}`);
      mobileVenues.forEach((venue, index) => {
        console.log(`   ${index + 1}. ${venue.name} (${venue.distance}km away)`);
      });
      
    } catch (error) {
      console.error('❌ Error testing mobile query:', error);
    }
    
  } catch (error) {
    console.error('❌ Error debugging venue sync:', error);
  }
}

// Run the debug
debugVenueSync();