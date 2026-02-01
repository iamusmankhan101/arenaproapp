// Simple Node.js script to seed Firebase with sample data
const { initializeApp } = require('firebase/app');
const { 
  getFirestore, 
  collection, 
  addDoc, 
  writeBatch, 
  doc,
  deleteDoc,
  getDocs
} = require('firebase/firestore');

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyA7G3uLmKNCDhiyTuwK6GBbTxRJFvmGNpY",
  authDomain: "arena-pro-97b5f.firebaseapp.com",
  projectId: "arena-pro-97b5f",
  storageBucket: "arena-pro-97b5f.firebasestorage.app",
  messagingSenderId: "960416327217",
  appId: "1:960416327217:android:bc3d63f865bef8be8f5710"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Sample data
const sampleTurfs = [
  {
    name: 'Elite Football Arena',
    description: 'Premium football ground with FIFA-standard artificial turf and professional lighting.',
    location: {
      address: 'DHA Phase 5, Lahore',
      city: 'Lahore',
      area: 'DHA Phase 5',
      coordinates: {
        latitude: 31.4697,
        longitude: 74.4084
      }
    },
    sports: ['Football'],
    facilities: ['Floodlights', 'Parking', 'Changing Room', 'Cafeteria'],
    pricing: {
      basePrice: 2200,
      peakHourMultiplier: 1.5,
      offPeakDiscount: 0.8
    },
    operatingHours: {
      open: '06:00',
      close: '23:00'
    },
    images: ['https://example.com/football1.jpg'],
    isActive: true,
    rating: 4.3,
    reviewCount: 28,
    sport: 'Football',
    pricePerHour: 2200,
    time: '6 AM to 11 PM (All Days)',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Champions Cricket Ground',
    description: 'Professional cricket ground with natural grass wickets and practice nets.',
    location: {
      address: 'Model Town, Lahore',
      city: 'Lahore',
      area: 'Model Town',
      coordinates: {
        latitude: 31.4816,
        longitude: 74.3428
      }
    },
    sports: ['Cricket'],
    facilities: ['Practice Nets', 'Equipment Rental', 'Scoreboard', 'Pavilion'],
    pricing: {
      basePrice: 1500,
      peakHourMultiplier: 1.3,
      offPeakDiscount: 0.9
    },
    operatingHours: {
      open: '06:00',
      close: '22:00'
    },
    images: ['https://example.com/cricket1.jpg'],
    isActive: true,
    rating: 4.7,
    reviewCount: 67,
    sport: 'Cricket',
    pricePerHour: 1500,
    time: '6 AM to 10 PM (All Days)',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Pro Padel Club',
    description: 'Premium padel courts with climate control and professional coaching.',
    location: {
      address: 'Johar Town, Lahore',
      city: 'Lahore',
      area: 'Johar Town',
      coordinates: {
        latitude: 31.4504,
        longitude: 74.2669
      }
    },
    sports: ['Padel'],
    facilities: ['Air Conditioning', 'Pro Shop', 'Lounge', 'Coaching'],
    pricing: {
      basePrice: 2800,
      peakHourMultiplier: 1.4,
      offPeakDiscount: 0.85
    },
    operatingHours: {
      open: '07:00',
      close: '23:00'
    },
    images: ['https://example.com/padel1.jpg'],
    isActive: true,
    rating: 4.6,
    reviewCount: 23,
    sport: 'Padel',
    pricePerHour: 2800,
    time: '7 AM to 11 PM (All Days)',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Arena Futsal Complex',
    description: 'Indoor futsal courts with professional flooring and equipment.',
    location: {
      address: 'DHA Phase 3, Lahore',
      city: 'Lahore',
      area: 'DHA Phase 3',
      coordinates: {
        latitude: 31.4520,
        longitude: 74.4044
      }
    },
    sports: ['Futsal'],
    facilities: ['Indoor Court', 'Equipment Rental', 'Changing Room', 'Parking'],
    pricing: {
      basePrice: 1800,
      peakHourMultiplier: 1.3,
      offPeakDiscount: 0.9
    },
    operatingHours: {
      open: '06:00',
      close: '24:00'
    },
    images: ['https://example.com/futsal1.jpg'],
    isActive: true,
    rating: 4.3,
    reviewCount: 35,
    sport: 'Futsal',
    pricePerHour: 1800,
    time: '6 AM to 12 AM (All Days)',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

const sampleChallenges = [
  {
    title: 'Friday Night Football Challenge',
    teamName: 'Thunder FC',
    sport: 'Football',
    type: 'open',
    proposedDateTime: new Date('2026-02-01T19:00:00'),
    venue: 'DHA Sports Complex',
    maxGroundFee: '2500',
    status: 'open',
    teamWins: 12,
    teamLosses: 3,
    teamElo: 1450,
    fairPlayScore: 4.2,
    timeAgo: '2 hours ago',
    isWinnerTakesAll: true,
    createdAt: new Date()
  },
  {
    title: 'Weekend Cricket Match',
    teamName: 'Royal Strikers',
    sport: 'Cricket',
    type: 'open',
    proposedDateTime: new Date('2026-02-02T16:00:00'),
    venue: 'Model Town Cricket Ground',
    maxGroundFee: '3000',
    status: 'open',
    teamWins: 8,
    teamLosses: 5,
    teamElo: 1320,
    fairPlayScore: 4.5,
    timeAgo: '5 hours ago',
    isWinnerTakesAll: false,
    createdAt: new Date()
  },
  {
    title: 'Padel Tournament - 8 Teams',
    teamName: 'Ace Padel Club',
    sport: 'Padel',
    type: 'tournament',
    proposedDateTime: new Date('2026-02-03T10:00:00'),
    venue: 'Elite Padel Courts',
    maxGroundFee: '4000',
    status: 'open',
    teamWins: 15,
    teamLosses: 2,
    teamElo: 1580,
    fairPlayScore: 4.8,
    timeAgo: '1 day ago',
    maxParticipants: 8,
    participants: 3,
    isWinnerTakesAll: true,
    createdAt: new Date()
  }
];

const sampleUsers = [
  {
    fullName: 'Ahmed Ali',
    phoneNumber: '+923001234567',
    email: 'ahmed.ali@example.com',
    isVerified: true,
    city: 'Lahore',
    area: 'DHA Phase 5',
    createdAt: new Date(),
    isActive: true
  },
  {
    fullName: 'Sara Khan',
    phoneNumber: '+923007654321',
    email: 'sara.khan@example.com',
    isVerified: true,
    city: 'Lahore',
    area: 'Gulberg',
    createdAt: new Date(),
    isActive: true
  },
  {
    fullName: 'Hassan Ahmed',
    phoneNumber: '+923009876543',
    email: 'hassan.ahmed@example.com',
    isVerified: true,
    city: 'Lahore',
    area: 'Model Town',
    createdAt: new Date(),
    isActive: true
  }
];

// Clear existing data
const clearCollection = async (collectionName) => {
  try {
    const collectionRef = collection(db, collectionName);
    const snapshot = await getDocs(collectionRef);
    
    const batch = writeBatch(db);
    snapshot.docs.forEach((docSnapshot) => {
      batch.delete(docSnapshot.ref);
    });
    
    if (snapshot.docs.length > 0) {
      await batch.commit();
    }
    console.log(`✅ Cleared ${collectionName} collection (${snapshot.docs.length} documents)`);
  } catch (error) {
    console.log(`⚠️  Could not clear ${collectionName}:`, error.message);
  }
};

// Seed function
const seedFirestore = async () => {
  try {
    console.log('🌱 Starting Firestore seeding...');
    console.log('📍 Project:', firebaseConfig.projectId);

    // Clear existing data
    await clearCollection('turfs');
    await clearCollection('challenges');
    await clearCollection('bookings');
    await clearCollection('users');

    // Add turfs
    console.log('🏟️  Adding turfs...');
    const turfsRef = collection(db, 'turfs');
    for (const turf of sampleTurfs) {
      await addDoc(turfsRef, turf);
    }
    console.log(`✅ Created ${sampleTurfs.length} turfs`);

    // Add challenges
    console.log('⚔️  Adding challenges...');
    const challengesRef = collection(db, 'challenges');
    for (const challenge of sampleChallenges) {
      await addDoc(challengesRef, challenge);
    }
    console.log(`✅ Created ${sampleChallenges.length} challenges`);

    // Add users
    console.log('👥 Adding users...');
    const usersRef = collection(db, 'users');
    for (const user of sampleUsers) {
      await addDoc(usersRef, user);
    }
    console.log(`✅ Created ${sampleUsers.length} users`);

    // Add sample bookings
    console.log('📅 Adding sample bookings...');
    const bookingsRef = collection(db, 'bookings');
    const sampleBookings = [
      {
        customerName: 'Ahmed Ali',
        customerPhone: '+923001234567',
        customerEmail: 'ahmed.ali@example.com',
        turfName: 'Elite Football Arena',
        turfArea: 'DHA Phase 5, Lahore',
        sport: 'Football',
        startTime: new Date('2026-02-01T18:00:00'),
        endTime: new Date('2026-02-01T19:00:00'),
        duration: 1,
        totalAmount: 2200,
        status: 'confirmed',
        paymentStatus: 'paid',
        bookingReference: 'PIT001234',
        createdAt: new Date()
      },
      {
        customerName: 'Sara Khan',
        customerPhone: '+923007654321',
        customerEmail: 'sara.khan@example.com',
        turfName: 'Champions Cricket Ground',
        turfArea: 'Model Town, Lahore',
        sport: 'Cricket',
        startTime: new Date('2026-02-02T16:00:00'),
        endTime: new Date('2026-02-02T18:00:00'),
        duration: 2,
        totalAmount: 3000,
        status: 'confirmed',
        paymentStatus: 'paid',
        bookingReference: 'PIT001235',
        createdAt: new Date()
      },
      {
        customerName: 'Hassan Ahmed',
        customerPhone: '+923009876543',
        customerEmail: 'hassan.ahmed@example.com',
        turfName: 'Pro Padel Club',
        turfArea: 'Johar Town, Lahore',
        sport: 'Padel',
        startTime: new Date('2026-02-03T10:00:00'),
        endTime: new Date('2026-02-03T11:00:00'),
        duration: 1,
        totalAmount: 2800,
        status: 'pending',
        paymentStatus: 'pending',
        bookingReference: 'PIT001236',
        createdAt: new Date()
      }
    ];

    for (const booking of sampleBookings) {
      await addDoc(bookingsRef, booking);
    }
    console.log(`✅ Created ${sampleBookings.length} bookings`);

    console.log('\n🎉 Firestore seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   Turfs: ${sampleTurfs.length}`);
    console.log(`   Challenges: ${sampleChallenges.length}`);
    console.log(`   Users: ${sampleUsers.length}`);
    console.log(`   Bookings: ${sampleBookings.length}`);
    console.log('\n🚀 Your app is now ready with sample data!');
    console.log('   Start your mobile app: npx react-native start');
    console.log('   Start admin panel: cd admin-web && npm start');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
  }
};

// Run seeding
seedFirestore().then(() => {
  console.log('\n✅ Seeding process completed');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Seeding process failed:', error);
  process.exit(1);
});