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

async function addTestSquadGames() {
  console.log('🎮 Adding test squad builder games...\n');

  const testGames = [
    {
      // Game 1: Football at Super Sixes
      userId: 'test-user-1',
      userName: 'Ahmed Khan',
      userPhotoURL: null,
      turfId: 'super-sixes-arena',
      turfName: 'Super Sixes Arena',
      turfArea: 'DHA Phase 5',
      sport: 'Football',
      dateTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
      startTime: '06:00 PM',
      endTime: '07:00 PM',
      duration: 1,
      totalAmount: 3000,
      slotPricePerPlayer: 500, // 3000 / 6 players
      playersNeeded: 5, // Need 5 more players (organizer is 1)
      playersJoined: [],
      needPlayers: true,
      status: 'confirmed',
      paymentStatus: 'paid',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    },
    {
      // Game 2: Cricket at Lahore Gymkhana
      userId: 'test-user-2',
      userName: 'Hassan Ali',
      userPhotoURL: null,
      turfId: 'lahore-gymkhana',
      turfName: 'Lahore Gymkhana Cricket Ground',
      turfArea: 'Mall Road',
      sport: 'Cricket',
      dateTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
      startTime: '04:00 PM',
      endTime: '06:00 PM',
      duration: 2,
      totalAmount: 5500,
      slotPricePerPlayer: 500, // 5500 / 11 players
      playersNeeded: 10, // Need 10 more players
      playersJoined: [],
      needPlayers: true,
      status: 'confirmed',
      paymentStatus: 'paid',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    },
    {
      // Game 3: Futsal at Arena Sports Complex
      userId: 'test-user-3',
      userName: 'Bilal Ahmed',
      userPhotoURL: null,
      turfId: 'arena-sports-complex',
      turfName: 'Arena Sports Complex',
      turfArea: 'Gulberg',
      sport: 'Futsal',
      dateTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
      startTime: '08:00 PM',
      endTime: '09:00 PM',
      duration: 1,
      totalAmount: 2400,
      slotPricePerPlayer: 300, // 2400 / 8 players
      playersNeeded: 7, // Need 7 more players
      playersJoined: [],
      needPlayers: true,
      status: 'confirmed',
      paymentStatus: 'paid',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    },
    {
      // Game 4: Padel at DHA Sports Club
      userId: 'test-user-4',
      userName: 'Usman Malik',
      userPhotoURL: null,
      turfId: 'dha-sports-club',
      turfName: 'DHA Sports Club',
      turfArea: 'DHA Phase 6',
      sport: 'Padel',
      dateTime: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days from now
      startTime: '07:00 PM',
      endTime: '08:00 PM',
      duration: 1,
      totalAmount: 2000,
      slotPricePerPlayer: 500, // 2000 / 4 players
      playersNeeded: 3, // Need 3 more players
      playersJoined: [],
      needPlayers: true,
      status: 'confirmed',
      paymentStatus: 'paid',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    },
    {
      // Game 5: Football with some players already joined
      userId: 'test-user-5',
      userName: 'Zain Abbas',
      userPhotoURL: null,
      turfId: 'super-sixes-arena',
      turfName: 'Super Sixes Arena',
      turfArea: 'DHA Phase 5',
      sport: 'Football',
      dateTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
      startTime: '05:00 PM',
      endTime: '06:00 PM',
      duration: 1,
      totalAmount: 3000,
      slotPricePerPlayer: 500,
      playersNeeded: 5,
      playersJoined: [
        {
          uid: 'joined-user-1',
          name: 'Ali Raza',
          joinedAt: new Date().toISOString(),
          paidAmount: 500,
          paymentStatus: 'paid',
          paymentMethod: 'jazzcash'
        },
        {
          uid: 'joined-user-2',
          name: 'Hamza Sheikh',
          joinedAt: new Date().toISOString(),
          paidAmount: 500,
          paymentStatus: 'paid',
          paymentMethod: 'easypaisa'
        }
      ],
      needPlayers: true,
      status: 'confirmed',
      paymentStatus: 'paid',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }
  ];

  try {
    const bookingsRef = db.collection('bookings');
    
    for (let i = 0; i < testGames.length; i++) {
      const game = testGames[i];
      const docRef = await bookingsRef.add(game);
      console.log(`✅ Added game ${i + 1}: ${game.sport} at ${game.turfName} (ID: ${docRef.id})`);
      console.log(`   - Players needed: ${game.playersNeeded}`);
      console.log(`   - Players joined: ${game.playersJoined.length}`);
      console.log(`   - Price per player: PKR ${game.slotPricePerPlayer}`);
      console.log(`   - Date: ${new Date(game.dateTime).toLocaleDateString()}`);
      console.log('');
    }

    console.log('🎉 Successfully added all test squad builder games!');
    console.log('\n📱 You can now see these games in the Squad Builder screen.');
    
  } catch (error) {
    console.error('❌ Error adding test games:', error);
  }
}

// Run the script
addTestSquadGames()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
