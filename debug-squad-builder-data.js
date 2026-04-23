const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin
const serviceAccount = require(path.join(__dirname, 'serviceAccountKey.json'));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function debugSquadBuilderData() {
  console.log('🔍 Debugging Squad Builder Data...\n');

  try {
    const bookingsRef = db.collection('bookings');
    const snapshot = await bookingsRef
      .where('needPlayers', '==', true)
      .get();

    if (snapshot.empty) {
      console.log('❌ No bookings with needPlayers=true found!');
      console.log('\n💡 To create a squad builder game:');
      console.log('1. Make a booking in the app');
      console.log('2. Toggle "Need Players" switch ON');
      console.log('3. Set the number of players needed');
      console.log('4. Complete the booking');
      return;
    }

    console.log(`✅ Found ${snapshot.size} squad builder games:\n`);

    snapshot.forEach((doc, index) => {
      const data = doc.data();
      console.log(`Game ${index + 1}: ${doc.id}`);
      console.log('─'.repeat(60));
      console.log(`Venue: ${data.turfName}`);
      console.log(`Sport: ${data.sport || 'Not specified'}`);
      console.log(`Organizer: ${data.userName || 'Unknown'}`);
      console.log(`Date: ${data.dateTime ? new Date(data.dateTime).toLocaleDateString() : 'Not set'}`);
      console.log(`Time: ${data.startTime} - ${data.endTime}`);
      console.log('');
      console.log('💰 Pricing:');
      console.log(`  Total Amount: PKR ${data.totalAmount || 0}`);
      console.log(`  Price per Player: PKR ${data.slotPricePerPlayer || 0}`);
      console.log('');
      console.log('👥 Players:');
      console.log(`  Organizer's Group Size: ${data.numberOfPlayers || 1}`);
      console.log(`  Players Needed (additional): ${data.playersNeeded || 0}`);
      console.log(`  Players Joined: ${data.playersJoined?.length || 0}`);
      console.log(`  Total Players: ${(data.numberOfPlayers || 1) + (data.playersNeeded || 0)}`);
      console.log(`  Current Players: ${(data.numberOfPlayers || 1) + (data.playersJoined?.length || 0)}`);
      console.log(`  Spots Left: ${(data.playersNeeded || 0) - (data.playersJoined?.length || 0)}`);
      console.log('');
      console.log('📊 Calculation Check:');
      const totalPlayers = (data.numberOfPlayers || 1) + (data.playersNeeded || 0);
      const expectedPricePerPlayer = Math.ceil(data.totalAmount / totalPlayers);
      const isCorrect = data.slotPricePerPlayer === expectedPricePerPlayer;
      console.log(`  Expected: PKR ${expectedPricePerPlayer} (Total ${data.totalAmount} / ${totalPlayers} players)`);
      console.log(`  Actual: PKR ${data.slotPricePerPlayer}`);
      console.log(`  Status: ${isCorrect ? '✅ CORRECT' : '❌ INCORRECT'}`);
      console.log('');
      console.log('📝 Status:');
      console.log(`  Booking Status: ${data.status}`);
      console.log(`  Payment Status: ${data.paymentStatus}`);
      console.log(`  Need Players: ${data.needPlayers}`);
      console.log('\n');
    });

    console.log('═'.repeat(60));
    console.log('\n💡 Understanding the Numbers:');
    console.log('');
    console.log('numberOfPlayers = Size of organizer\'s group (1, 2, 3, etc.)');
    console.log('playersNeeded = Number of ADDITIONAL players needed from Squad Builder');
    console.log('Total players in game = numberOfPlayers + playersNeeded');
    console.log('Price per player = Total Amount / (numberOfPlayers + playersNeeded)');
    console.log('');
    console.log('Example:');
    console.log('  Total: PKR 3000');
    console.log('  Organizer\'s Group: 2 players');
    console.log('  Players Needed: 4 additional');
    console.log('  Total Players: 6 (2 + 4)');
    console.log('  Price per Player: PKR 500 (3000 / 6)');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the script
debugSquadBuilderData()
  .then(() => {
    console.log('\n✅ Debug complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
