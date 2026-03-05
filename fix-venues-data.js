// Script to fix venues data - set isActive to true and add missing fields
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc, serverTimestamp } from 'firebase/firestore';

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

async function fixVenuesData() {
  try {
    console.log('🔧 Fixing venues data...');
    
    // Get all venues from venues collection
    const venuesRef = collection(db, 'venues');
    const snapshot = await getDocs(venuesRef);
    
    console.log(`📊 Found ${snapshot.size} venues to fix`);
    
    if (snapshot.empty) {
      console.log('❌ No venues found to fix');
      return;
    }
    
    let fixedCount = 0;
    
    for (const venueDoc of snapshot.docs) {
      const venueData = venueDoc.data();
      const venueId = venueDoc.id;
      const venueName = venueData.name || 'Unnamed Venue';
      
      console.log(`🔧 Fixing venue: ${venueName} (ID: ${venueId})`);
      
      // Prepare updates
      const updates = {};
      
      // Set isActive to true if not set
      if (venueData.isActive === undefined) {
        updates.isActive = true;
        console.log('   ✅ Setting isActive = true');
      }
      
      // Add location data if missing
      if (!venueData.location || (!venueData.location.latitude && !venueData.location.coordinates)) {
        // Default to Karachi coordinates if no location is set
        updates.location = {
          latitude: 24.8607,
          longitude: 67.0011,
          city: venueData.city || 'Karachi'
        };
        console.log('   📍 Adding default location (Karachi)');
      }
      
      // Add pricing if missing
      if (!venueData.pricing) {
        updates.pricing = {
          basePrice: 2000
        };
        console.log('   💰 Adding default pricing (PKR 2000)');
      }
      
      // Add operating hours if missing
      if (!venueData.operatingHours) {
        updates.operatingHours = {
          open: '06:00',
          close: '23:00'
        };
        console.log('   🕐 Adding default operating hours (6:00-23:00)');
      }
      
      // Add sports array if it's a string
      if (typeof venueData.sports === 'string') {
        updates.sports = [venueData.sports];
        console.log(`   🏃 Converting sports to array: [${venueData.sports}]`);
      } else if (!venueData.sports) {
        updates.sports = ['Football']; // Default sport
        console.log('   🏃 Adding default sport: Football');
      }
      
      // Add timestamps if missing
      if (!venueData.createdAt) {
        updates.createdAt = serverTimestamp();
        console.log('   📅 Adding createdAt timestamp');
      }
      
      updates.updatedAt = serverTimestamp();
      
      // Apply updates if there are any
      if (Object.keys(updates).length > 0) {
        await updateDoc(doc(db, 'venues', venueId), updates);
        fixedCount++;
        console.log(`   ✅ Updated venue with ${Object.keys(updates).length} fields`);
      } else {
        console.log('   ℹ️  No updates needed');
      }
      
      console.log('');
    }
    
    console.log(`🎉 Fixed ${fixedCount} venues!`);
    console.log('   All venues should now be visible in the mobile app.');
    
  } catch (error) {
    console.error('❌ Error fixing venues data:', error);
  }
}

// Run the fix
fixVenuesData();