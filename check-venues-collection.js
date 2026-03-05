// Script to check what's in the 'venues' collection
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

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

async function checkVenuesCollection() {
  try {
    console.log('🔍 Checking venues collection...');
    
    // Get all documents from venues collection
    const venuesRef = collection(db, 'venues');
    const snapshot = await getDocs(venuesRef);
    
    console.log(`📊 Found ${snapshot.size} documents in 'venues' collection`);
    
    if (snapshot.empty) {
      console.log('❌ No venues found in venues collection');
      return;
    }
    
    console.log('\n🏟️ Venues in collection:');
    snapshot.forEach((doc, index) => {
      const data = doc.data();
      console.log(`${index + 1}. ${data.name || 'Unnamed'} (ID: ${doc.id})`);
      console.log(`   Area: ${data.area || 'Unknown'}`);
      console.log(`   Sports: ${data.sports?.join(', ') || 'Unknown'}`);
      console.log(`   Active: ${data.isActive}`);
      console.log(`   Location: ${JSON.stringify(data.location || {})}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error checking venues collection:', error);
  }
}

// Run the check
checkVenuesCollection();