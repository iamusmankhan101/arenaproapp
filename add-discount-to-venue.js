const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, updateDoc } = require('firebase/firestore');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDCBJE7Tz-Ql0Tz8Tz8Tz8Tz8Tz8Tz8Tz8",
  authDomain: "sports-vendor-app.firebaseapp.com",
  projectId: "sports-vendor-app",
  storageBucket: "sports-vendor-app.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890abcdef"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function addDiscountToVenues() {
  console.log('🔧 Adding discount field to venues...\n');

  try {
    // Get all venues
    const venuesRef = collection(db, 'venues');
    const snapshot = await getDocs(venuesRef);

    if (snapshot.empty) {
      console.log('❌ No venues found');
      return;
    }

    console.log(`✅ Found ${snapshot.size} venues\n`);

    let updatedCount = 0;
    let skippedCount = 0;

    for (const venueDoc of snapshot.docs) {
      const venueData = venueDoc.data();
      const venueName = venueData.name || 'Unknown';

      // Check if venue already has discount
      if (venueData.discount || venueData.discountPercentage) {
        console.log(`⏭️  Skipping ${venueName} - already has discount (${venueData.discount || venueData.discountPercentage}%)`);
        skippedCount++;
        continue;
      }

      // Add 15% discount to all venues
      const discountValue = 15;

      await updateDoc(doc(db, 'venues', venueDoc.id), {
        discountPercentage: discountValue,
        updatedAt: new Date()
      });

      console.log(`✅ Added ${discountValue}% discount to: ${venueName}`);
      updatedCount++;
    }

    console.log('\n📊 Summary:');
    console.log(`   Updated: ${updatedCount} venues`);
    console.log(`   Skipped: ${skippedCount} venues (already had discount)`);
    console.log(`   Total: ${snapshot.size} venues`);

  } catch (error) {
    console.error('❌ Error:', error);
  }

  process.exit(0);
}

addDiscountToVenues();
