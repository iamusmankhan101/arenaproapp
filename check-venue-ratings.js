const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function checkVenueRatings() {
  try {
    console.log('🔍 Checking venue ratings in database...\n');
    
    const snapshot = await db.collection('venues')
      .where('isActive', '==', true)
      .limit(10)
      .get();
    
    console.log(`Found ${snapshot.size} active venues\n`);
    
    snapshot.forEach(doc => {
      const data = doc.data();
      console.log(`📍 ${data.name}:`);
      console.log(`   - rating: ${data.rating || 'NOT SET'}`);
      console.log(`   - reviewCount: ${data.reviewCount || 0}`);
      console.log(`   - reviews array: ${data.reviews?.length || 0} items`);
      console.log('');
    });
    
    // Check if any venues are missing ratings
    const missingRatings = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      if (!data.rating || data.rating === 0) {
        missingRatings.push(data.name);
      }
    });
    
    if (missingRatings.length > 0) {
      console.log('⚠️  Venues missing ratings:');
      missingRatings.forEach(name => console.log(`   - ${name}`));
    } else {
      console.log('✅ All venues have ratings set');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkVenueRatings();
