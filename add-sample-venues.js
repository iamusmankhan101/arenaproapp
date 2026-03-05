// Script to add sample venues to Firestore
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

const sampleVenues = [
  {
    name: 'Elite Sports Arena',
    description: 'Premium sports facility with modern amenities',
    address: '123 Sports Complex, DHA Phase 5, Karachi',
    city: 'Karachi',
    area: 'DHA Phase 5',
    location: {
      latitude: 24.8607,
      longitude: 67.0011,
      city: 'Karachi'
    },
    sports: ['Football', 'Cricket'],
    facilities: ['Floodlights', 'Parking', 'Changing Room', 'Cafeteria'],
    pricing: {
      basePrice: 3000
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
    name: 'Champions Football Club',
    description: 'Professional football training ground',
    address: '456 Stadium Road, Gulshan-e-Iqbal, Karachi',
    city: 'Karachi',
    area: 'Gulshan-e-Iqbal',
    location: {
      latitude: 24.9207,
      longitude: 67.0811,
      city: 'Karachi'
    },
    sports: ['Football'],
    facilities: ['Floodlights', 'Parking', 'Changing Room', 'Equipment Rental'],
    pricing: {
      basePrice: 2500
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
    name: 'Urban Cricket Ground',
    description: 'Modern cricket facility with practice nets',
    address: '789 Cricket Lane, Clifton, Karachi',
    city: 'Karachi',
    area: 'Clifton',
    location: {
      latitude: 24.8138,
      longitude: 67.0299,
      city: 'Karachi'
    },
    sports: ['Cricket'],
    facilities: ['Practice Nets', 'Scoreboard', 'Pavilion', 'Parking'],
    pricing: {
      basePrice: 4000
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

async function addSampleVenues() {
  try {
    console.log('🏟️ Adding sample venues to Firestore...');
    
    const turfsRef = collection(db, 'turfs');
    
    for (let i = 0; i < sampleVenues.length; i++) {
      const venue = sampleVenues[i];
      console.log(`📝 Adding venue ${i + 1}: ${venue.name}`);
      
      const docRef = await addDoc(turfsRef, venue);
      console.log(`✅ Added venue with ID: ${docRef.id}`);
    }
    
    console.log('🎉 All sample venues added successfully!');
    console.log('📱 Your app should now be able to sync these venues.');
    
  } catch (error) {
    console.error('❌ Error adding sample venues:', error);
  }
}

// Run the script
addSampleVenues();