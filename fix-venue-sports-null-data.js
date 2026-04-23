const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function fixVenueSportsData() {
  console.log('🔧 Fixing venue sports data in Firestore...\n');

  try {
    const venuesSnapshot = await db.collection('venues').get();
    
    console.log(`📊 Total venues: ${venuesSnapshot.size}\n`);

    let fixedCount = 0;
    const batch = db.batch();

    venuesSnapshot.forEach((doc) => {
      const data = doc.data();
      const sportsValue = data.sports;
      
      // Check if sports is null, undefined, or empty string
      if (sportsValue === null || sportsValue === undefined || sportsValue === '') {
        console.log(`🔧 Fixing venue: ${data.name} (ID: ${doc.id})`);
        console.log(`   Current sports value: ${JSON.stringify(sportsValue)}`);
        
        // Set a default value based on other venue data
        let defaultSport = 'Football'; // Default fallback
        
        // Try to infer from venue name
        const venueName = (data.name || '').toLowerCase();
        if (venueName.includes('cricket')) {
          defaultSport = 'Cricket';
        } else if (venueName.includes('padel')) {
          defaultSport = 'Padel';
        } else if (venueName.includes('futsal')) {
          defaultSport = 'Futsal';
        }
        
        console.log(`   Setting default sport: ${defaultSport}\n`);
        
        // Update the document
        batch.update(doc.ref, {
          sports: defaultSport,
          sport: defaultSport // Also set the singular field for compatibility
        });
        
        fixedCount++;
      }
    });

    if (fixedCount > 0) {
      console.log(`💾 Committing ${fixedCount} updates to Firestore...`);
      await batch.commit();
      console.log('✅ All venues fixed successfully!');
    } else {
      console.log('✅ No venues need fixing - all have valid sports data');
    }

    console.log(`\n📊 Summary:`);
    console.log(`   Total venues: ${venuesSnapshot.size}`);
    console.log(`   Fixed venues: ${fixedCount}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixVenueSportsData();
