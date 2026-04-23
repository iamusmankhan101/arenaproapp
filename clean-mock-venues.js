// Script to clean up old mock venues from Firestore
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc, query, where } from 'firebase/firestore';

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

// List of mock venue IDs to remove (based on your output)
const MOCK_VENUE_IDS = [
  'NGgVoZduQRHBSPxmyzKP', // Admin Test Arena
  'NdnBQ7QD9CeZMtdcMvvc', // Elite Sports Arena
  'ilpOgGWQmDS1FfrqFLJk', // temp
  'ivyHGccusTT28XEVEaSw', // Champions Football Club
  'k55nmJg5a1RpaSbBM0Yo'  // Urban Cricket Ground
];

// Alternative: Remove venues by name patterns (if IDs change)
const MOCK_VENUE_NAMES = [
  'Admin Test Arena',
  'Elite Sports Arena',
  'temp',
  'Champions Football Club',
  'Urban Cricket Ground',
  'Sample Sports Arena' // In case there are any sample venues
];

async function cleanMockVenues() {
  try {
    console.log('🧹 Starting cleanup of mock venues...');
    
    // Get all venues
    const turfsRef = collection(db, 'turfs');
    const snapshot = await getDocs(turfsRef);
    
    console.log(`📊 Found ${snapshot.size} total venues in database`);
    
    let deletedCount = 0;
    let keptCount = 0;
    
    for (const venueDoc of snapshot.docs) {
      const venueData = venueDoc.data();
      const venueId = venueDoc.id;
      const venueName = venueData.name || 'Unnamed';
      
      // Check if this is a mock venue (by ID or name)
      const isMockById = MOCK_VENUE_IDS.includes(venueId);
      const isMockByName = MOCK_VENUE_NAMES.some(mockName => 
        venueName.toLowerCase().includes(mockName.toLowerCase())
      );
      
      if (isMockById || isMockByName) {
        console.log(`🗑️  Deleting mock venue: ${venueName} (ID: ${venueId})`);
        await deleteDoc(doc(db, 'turfs', venueId));
        deletedCount++;
      } else {
        console.log(`✅ Keeping venue: ${venueName} (ID: ${venueId})`);
        keptCount++;
      }
    }
    
    console.log(`\n🎉 Cleanup completed!`);
    console.log(`   - Deleted: ${deletedCount} mock venues`);
    console.log(`   - Kept: ${keptCount} real venues`);
    
    if (deletedCount === 0) {
      console.log('ℹ️  No mock venues found to delete. Your database might already be clean!');
    }
    
  } catch (error) {
    console.error('❌ Error cleaning mock venues:', error);
  }
}

async function listAllVenues() {
  try {
    console.log('\n📋 Current venues in database:');
    
    const turfsRef = collection(db, 'turfs');
    const snapshot = await getDocs(turfsRef);
    
    if (snapshot.empty) {
      console.log('   No venues found');
      return;
    }
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`   - ${data.name || 'Unnamed'} (ID: ${doc.id}, Active: ${data.isActive})`);
    });
    
  } catch (error) {
    console.error('❌ Error listing venues:', error);
  }
}

// Run the cleanup
async function main() {
  console.log('🚀 Mock Venue Cleanup Tool');
  console.log('==========================\n');
  
  // First, show current venues
  await listAllVenues();
  
  // Then clean up mock venues
  await cleanMockVenues();
  
  // Finally, show remaining venues
  await listAllVenues();
  
  console.log('\n✨ Done! Your mobile app should now only show venues added through the admin panel.');
}

main();