import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc, query, where } from 'firebase/firestore';

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

console.log('🔧 Fixing New Venue Active Status...');

async function fixNewVenueActiveStatus() {
  try {
    // Find venues that don't have isActive field or have it as undefined
    console.log('📋 Finding venues with missing or incorrect isActive field...');
    const venuesRef = collection(db, 'venues');
    const allSnapshot = await getDocs(venuesRef);
    
    const venuesToFix = [];
    
    allSnapshot.forEach((doc) => {
      const data = doc.data();
      // Check if isActive is undefined, null, or missing
      if (data.isActive === undefined || data.isActive === null) {
        venuesToFix.push({
          id: doc.id,
          name: data.name,
          status: data.status,
          currentIsActive: data.isActive
        });
      }
    });
    
    console.log(`📊 Found ${venuesToFix.length} venues to fix:`);
    venuesToFix.forEach(venue => {
      console.log(`   - ${venue.name} (ID: ${venue.id}) - isActive: ${venue.currentIsActive}, status: ${venue.status}`);
    });
    
    if (venuesToFix.length === 0) {
      console.log('✅ All venues already have correct isActive field');
      return;
    }
    
    // Fix each venue
    for (const venue of venuesToFix) {
      console.log(`🔄 Fixing venue: ${venue.name}`);
      
      const venueRef = doc(db, 'venues', venue.id);
      
      // Set isActive based on status
      const isActive = venue.status === 'active';
      
      await updateDoc(venueRef, {
        isActive: isActive,
        updatedAt: new Date()
      });
      
      console.log(`   ✅ Updated ${venue.name}: isActive = ${isActive}`);
    }
    
    console.log('\n🎉 All venues fixed!');
    
    // Verify the fix
    console.log('\n🔍 Verifying fix...');
    const activeVenuesQuery = query(venuesRef, where('isActive', '==', true));
    const activeSnapshot = await getDocs(activeVenuesQuery);
    
    console.log(`📱 Mobile app will now show ${activeSnapshot.size} venues:`);
    activeSnapshot.forEach((doc, index) => {
      const data = doc.data();
      console.log(`   ${index + 1}. ${data.name} - ${data.sports?.[0] || 'Unknown sport'}`);
    });
    
    // Check if the newest venue is now included
    const newestFixedVenue = venuesToFix.find(v => v.name === 'New');
    if (newestFixedVenue) {
      const isNowActive = activeSnapshot.docs.some(doc => doc.id === newestFixedVenue.id);
      if (isNowActive) {
        console.log(`\n✅ SUCCESS: Newest venue "${newestFixedVenue.name}" will now show in mobile app!`);
      } else {
        console.log(`\n❌ Issue: Newest venue "${newestFixedVenue.name}" still not showing`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error fixing venue active status:', error);
  }
}

fixNewVenueActiveStatus();