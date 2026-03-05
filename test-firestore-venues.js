// Test script to check Firestore venues collection
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';

// Firebase config (same as your app)
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

async function testFirestoreVenues() {
  try {
    console.log('🔍 Checking Firestore venues collection...');
    
    // Get all documents from turfs collection
    const turfsRef = collection(db, 'turfs');
    const snapshot = await getDocs(turfsRef);
    
    console.log(`📊 Found ${snapshot.size} documents in turfs collection`);
    
    if (snapshot.empty) {
      console.log('📝 No venues found. Creating a sample venue...');
      await createSampleVenue();
    } else {
      console.log('🏟️ Existing venues:');
      snapshot.forEach((doc) => {
        const data = doc.data();
        console.log(`- ${data.name || 'Unnamed'} (ID: ${doc.id}, Active: ${data.isActive})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error testing Firestore:', error);
  }
}

async function createSampleVenue() {
  try {
    const turfsRef = collection(db, 'turfs');
    
    const sampleVenue = {
      name: 'Sample Sports Arena',
      description: 'A test venue for development',
      address: '123 Test Street, Karachi',
      city: 'Karachi',
      area: 'DHA Phase 5',
      location: {
        latitude: 24.8607,
        longitude: 67.0011,
        city: 'Karachi'
      },
      sports: ['Football', 'Cricket'],
      facilities: ['Floodlights', 'Parking', 'Changing Room'],
      pricing: {
        basePrice: 2500
      },
      operatingHours: {
        open: '06:00',
        close: '23:00'
      },
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(turfsRef, sampleVenue);
    console.log('✅ Sample venue created with ID:', docRef.id);
    
  } catch (error) {
    console.error('❌ Error creating sample venue:', error);
  }
}

// Run the test
testFirestoreVenues();