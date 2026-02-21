const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function checkVenueSportsData() {
  console.log('🔍 Checking venue sports data in Firestore...\n');

  try {
    const venuesSnapshot = await db.collection('venues').get();
    
    console.log(`📊 Total venues: ${venuesSnapshot.size}\n`);

    venuesSnapshot.forEach((doc) => {
      const data = doc.data();
      const sportsValue = data.sports;
      const sportsType = typeof sportsValue;
      
      console.log(`Venue: ${data.name}`);
      console.log(`  ID: ${doc.id}`);
      console.log(`  Sports value: ${JSON.stringify(sportsValue)}`);
      console.log(`  Sports type: ${sportsType}`);
      console.log(`  Is null: ${sportsValue === null}`);
      console.log(`  Is undefined: ${sportsValue === undefined}`);
      console.log(`  Is empty string: ${sportsValue === ''}`);
      
      if (sportsType === 'string') {
        console.log(`  String length: ${sportsValue.length}`);
        console.log(`  Trimmed length: ${sportsValue.trim().length}`);
      }
      
      console.log('---\n');
    });

    console.log('✅ Check complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkVenueSportsData();
