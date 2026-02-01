// Test script to verify venue sync functionality
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, where } = require('firebase/firestore');

// Your Firebase config
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

async function testVenueSync() {
  try {
    console.log('🔍 Testing venue sync functionality...');
    
    // Test 1: Get all venues
    console.log('\n📊 Test 1: Fetching all venues...');
    const turfsRef = collection(db, 'turfs');
    const allSnapshot = await getDocs(turfsRef);
    console.log(`Found ${allSnapshot.size} total venues`);
    
    // Test 2: Get active venues only
    console.log('\n📊 Test 2: Fetching active venues...');
    const activeQuery = query(turfsRef, where('isActive', '==', true));
    const activeSnapshot = await getDocs(activeQuery);
    console.log(`Found ${activeSnapshot.size} active venues`);
    
    // Test 3: Check venue data structure
    console.log('\n📊 Test 3: Checking venue data structure...');
    activeSnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`\n🏟️ Venue: ${data.name || 'Unnamed'}`);
      console.log(`   ID: ${doc.id}`);
      console.log(`   Active: ${data.isActive}`);
      console.log(`   Location: ${data.location?.latitude || 'N/A'}, ${data.location?.longitude || 'N/A'}`);
      console.log(`   Sports: ${data.sports?.join(', ') || 'N/A'}`);
      console.log(`   Base Price: ${data.pricing?.basePrice || 'N/A'}`);
      console.log(`   Created: ${data.createdAt ? 'Yes' : 'No'}`);
    });
    
    console.log('\n✅ Venue sync test completed successfully!');
    console.log('📱 Your app should now be able to sync these venues.');
    
  } catch (error) {
    console.error('❌ Error testing venue sync:', error);
  }
}

// Run the test
testVenueSync();