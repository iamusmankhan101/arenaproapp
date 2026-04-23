// Test script to verify admin-added venues are visible to mobile app
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, where, addDoc, serverTimestamp } = require('firebase/firestore');

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

async function testAdminVenueSync() {
  try {
    console.log('🔍 Testing admin venue sync...');
    
    // Test 1: Check all venues in database
    console.log('\n📊 Test 1: Checking all venues...');
    const turfsRef = collection(db, 'turfs');
    const allSnapshot = await getDocs(turfsRef);
    console.log(`Found ${allSnapshot.size} total venues`);
    
    // Test 2: Check active venues (what mobile app sees)
    console.log('\n📊 Test 2: Checking active venues (mobile app view)...');
    const activeQuery = query(turfsRef, where('isActive', '==', true));
    const activeSnapshot = await getDocs(activeQuery);
    console.log(`Found ${activeSnapshot.size} active venues`);
    
    // Test 3: Analyze venue data structure
    console.log('\n📊 Test 3: Analyzing venue data structure...');
    let adminFormatCount = 0;
    let mobileFormatCount = 0;
    let bothFormatCount = 0;
    
    activeSnapshot.forEach((doc) => {
      const data = doc.data();
      const hasAdminFormat = data.location?.coordinates?.latitude;
      const hasMobileFormat = data.location?.latitude;
      
      console.log(`\n🏟️ Venue: ${data.name || 'Unnamed'}`);
      console.log(`   ID: ${doc.id}`);
      console.log(`   Admin format (location.coordinates.latitude): ${hasAdminFormat ? 'YES' : 'NO'}`);
      console.log(`   Mobile format (location.latitude): ${hasMobileFormat ? 'YES' : 'NO'}`);
      console.log(`   Sports: ${data.sports?.join(', ') || 'N/A'}`);
      console.log(`   Base Price: ${data.pricing?.basePrice || 'N/A'}`);
      console.log(`   Active: ${data.isActive}`);
      
      if (hasAdminFormat && !hasMobileFormat) adminFormatCount++;
      else if (!hasAdminFormat && hasMobileFormat) mobileFormatCount++;
      else if (hasAdminFormat && hasMobileFormat) bothFormatCount++;
    });
    
    console.log('\n📈 Data Format Summary:');
    console.log(`   Admin format only: ${adminFormatCount} venues`);
    console.log(`   Mobile format only: ${mobileFormatCount} venues`);
    console.log(`   Both formats: ${bothFormatCount} venues`);
    
    // Test 4: Add a test venue in the correct format
    console.log('\n📊 Test 4: Adding test venue in correct format...');
    const testVenue = {
      name: 'Admin Test Arena',
      description: 'Test venue added via admin panel simulation',
      address: '456 Admin Street, Karachi',
      city: 'Karachi',
      area: 'Gulshan-e-Iqbal',
      location: {
        latitude: 24.9207,
        longitude: 67.0811,
        city: 'Karachi'
      },
      sports: ['Football', 'Cricket'],
      facilities: ['Floodlights', 'Parking'],
      pricing: {
        basePrice: 3500
      },
      operatingHours: {
        open: '07:00',
        close: '22:00'
      },
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(turfsRef, testVenue);
    console.log(`✅ Test venue added with ID: ${docRef.id}`);
    
    console.log('\n✅ Admin venue sync test completed!');
    console.log('\n🎯 RECOMMENDATIONS:');
    
    if (adminFormatCount > 0) {
      console.log('⚠️  Some venues use admin format only - mobile app won\'t see them');
      console.log('   Fix: Update admin API to save in mobile-compatible format');
    }
    
    if (mobileFormatCount > 0 || bothFormatCount > 0) {
      console.log('✅ Some venues use mobile-compatible format - app should see them');
    }
    
    console.log('\n📱 Mobile app should now show venues with mobile-compatible format');
    
  } catch (error) {
    console.error('❌ Error testing admin venue sync:', error);
  }
}

// Run the test
testAdminVenueSync();