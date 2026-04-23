// Script to add sample venues in Lahore
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, serverTimestamp } = require('firebase/firestore');

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

const lahoreVenues = [
  {
    name: 'Lahore Sports Complex',
    description: 'Premium sports facility in the heart of Lahore',
    address: '123 Mall Road, Lahore',
    city: 'Lahore',
    area: 'Mall Road',
    location: {
      latitude: 31.5204,
      longitude: 74.3587,
      city: 'Lahore'
    },
    sports: ['Football', 'Cricket'],
    facilities: ['Floodlights', 'Parking', 'Changing Room', 'Cafeteria'],
    pricing: {
      basePrice: 2800
    },
    operatingHours: {
      open: '06:00',
      close: '23:00'
    },
    isActive: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    name: 'DHA Sports Arena',
    description: 'Modern football and cricket ground in DHA',
    address: '456 DHA Phase 5, Lahore',
    city: 'Lahore',
    area: 'DHA Phase 5',
    location: {
      latitude: 31.4697,
      longitude: 74.4084,
      city: 'Lahore'
    },
    sports: ['Football'],
    facilities: ['Floodlights', 'Parking', 'Equipment Rental'],
    pricing: {
      basePrice: 3200
    },
    operatingHours: {
      open: '07:00',
      close: '22:00'
    },
    isActive: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    name: 'Gulberg Cricket Ground',
    description: 'Professional cricket facility with practice nets',
    address: '789 Gulberg III, Lahore',
    city: 'Lahore',
    area: 'Gulberg',
    location: {
      latitude: 31.5497,
      longitude: 74.3436,
      city: 'Lahore'
    },
    sports: ['Cricket'],
    facilities: ['Practice Nets', 'Scoreboard', 'Pavilion', 'Coaching'],
    pricing: {
      basePrice: 3800
    },
    operatingHours: {
      open: '06:00',
      close: '20:00'
    },
    isActive: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }
];

async function addLahoreVenues() {
  try {
    console.log('🏟️ Adding Lahore venues to Firestore...');
    
    const turfsRef = collection(db, 'turfs');
    
    for (let i = 0; i < lahoreVenues.length; i++) {
      const venue = lahoreVenues[i];
      console.log(`📝 Adding venue ${i + 1}: ${venue.name}`);
      
      const docRef = await addDoc(turfsRef, venue);
      console.log(`✅ Added venue with ID: ${docRef.id}`);
    }
    
    console.log('🎉 All Lahore venues added successfully!');
    console.log('📱 Users in both Lahore and Karachi should now see venues.');
    
  } catch (error) {
    console.error('❌ Error adding Lahore venues:', error);
  }
}

// Run the script
addLahoreVenues();