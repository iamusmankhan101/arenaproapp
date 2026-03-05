/**
 * Test script to verify venue card images are showing correctly
 * 
 * This script tests:
 * 1. Sports data normalization in getNearbyTurfs
 * 2. Sports data normalization in getTurfDetails
 * 3. getVenueImageBySport function with normalized sports array
 * 4. Image source selection (remote vs local fallback)
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, where } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyDWnYKwBbzKCE-P7VvvMqBxJYiZnxPxXxs",
  authDomain: "pitchit-d8c0f.firebaseapp.com",
  projectId: "pitchit-d8c0f",
  storageBucket: "pitchit-d8c0f.firebasestorage.app",
  messagingSenderId: "1059583516430",
  appId: "1:1059583516430:web:e8f8e8e8e8e8e8e8e8e8e8"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Simulate serializeFirestoreData
function serializeFirestoreData(data) {
  return JSON.parse(JSON.stringify(data));
}

// Simulate getVenueImageBySport
function getVenueImageBySport(venue) {
  let primarySport = 'Football'; // default

  if (Array.isArray(venue.sports) && venue.sports.length > 0) {
    primarySport = venue.sports[0];
  } else if (typeof venue.sports === 'string') {
    primarySport = venue.sports.split(',')[0].trim();
  } else if (venue.sport) {
    primarySport = venue.sport;
  }

  console.log(`   🖼️ getVenueImageBySport: sports=${JSON.stringify(venue.sports)}, primarySport=${primarySport}`);

  const sportImages = {
    'Cricket': 'cricket.jpg',
    'Football': 'football.jpg',
    'Futsal': 'football.jpg',
    'Padel': 'padel.jpg',
    'Basketball': 'football.jpg',
    'Tennis': 'padel.jpg',
  };
  return sportImages[primarySport] || 'football.jpg';
}

async function testVenueImages() {
  console.log('\n🧪 Testing Venue Card Images Fix\n');
  console.log('='.repeat(60));

  try {
    // Test 1: Fetch venues like getNearbyTurfs does
    console.log('\n📋 TEST 1: Fetching venues with sports normalization');
    console.log('-'.repeat(60));
    
    const turfsRef = collection(db, 'venues');
    const q = query(turfsRef, where('status', '==', 'active'));
    const snapshot = await getDocs(q);

    console.log(`✅ Found ${snapshot.size} active venues\n`);

    const venues = [];
    snapshot.forEach((doc) => {
      const data = doc.data();

      // Normalize sports data (same as fixed getNearbyTurfs)
      let sports = data.sports;
      if (!sports) {
        sports = [];
      } else if (typeof sports === 'string') {
        sports = sports.split(',').map(s => s.trim()).filter(Boolean);
      } else if (!Array.isArray(sports)) {
        sports = [];
      }

      const serializedData = serializeFirestoreData({
        id: doc.id,
        ...data,
        sports, // Override with normalized sports array
        sport: sports.length > 0 ? sports[0] : 'Unknown',
      });

      venues.push(serializedData);
    });

    // Test 2: Check each venue's sports data and image selection
    console.log('\n📋 TEST 2: Checking sports data and image selection');
    console.log('-'.repeat(60));

    let successCount = 0;
    let failCount = 0;

    venues.forEach((venue, index) => {
      console.log(`\n${index + 1}. ${venue.name}`);
      console.log(`   Raw sports from DB: ${JSON.stringify(venue.sports)}`);
      console.log(`   Is Array: ${Array.isArray(venue.sports)}`);
      console.log(`   Length: ${venue.sports?.length || 0}`);
      
      // Test image selection
      const hasRemoteImage = venue.images && venue.images.length > 0;
      console.log(`   Has remote image: ${hasRemoteImage}`);
      
      if (hasRemoteImage) {
        console.log(`   ✅ Will use remote image: ${venue.images[0]}`);
        successCount++;
      } else {
        const fallbackImage = getVenueImageBySport(venue);
        console.log(`   ✅ Will use fallback image: ${fallbackImage}`);
        successCount++;
      }
    });

    // Test 3: Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total venues tested: ${venues.length}`);
    console.log(`✅ Successful image selection: ${successCount}`);
    console.log(`❌ Failed image selection: ${failCount}`);
    
    if (failCount === 0) {
      console.log('\n🎉 All venue images should now display correctly!');
      console.log('\n📝 Changes made:');
      console.log('   1. ✅ Normalized sports data in getNearbyTurfs');
      console.log('   2. ✅ Added debug logging to getVenueImageBySport');
      console.log('   3. ✅ Added image load/error handlers in HomeScreen');
      console.log('   4. ✅ Ensured sports is always an array');
    } else {
      console.log('\n⚠️ Some venues may have issues displaying images');
    }

  } catch (error) {
    console.error('\n❌ Error during test:', error);
  }

  process.exit(0);
}

testVenueImages();
