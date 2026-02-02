// Add test customers to Firebase for admin panel testing
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyA7G3uLmKNCDhiyTuwK6GBbTxRJFvmGNpY",
  authDomain: "arena-pro-97b5f.firebaseapp.com",
  projectId: "arena-pro-97b5f",
  storageBucket: "arena-pro-97b5f.firebasestorage.app",
  messagingSenderId: "960416327217",
  appId: "1:960416327217:android:bc3d63f865bef8be8f5710"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const testCustomers = [
  {
    fullName: 'Ahmed Khan',
    email: 'ahmed.khan@example.com',
    phoneNumber: '+92 300 1234567',
    isActive: true,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    address: 'DHA Phase 5, Lahore',
    dateOfBirth: '1990-05-15',
    preferredSports: ['Football', 'Cricket']
  },
  {
    fullName: 'Sara Ahmed',
    email: 'sara.ahmed@example.com',
    phoneNumber: '+92 301 2345678',
    isActive: true,
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20'),
    address: 'Gulberg III, Lahore',
    dateOfBirth: '1992-08-22',
    preferredSports: ['Padel', 'Tennis']
  },
  {
    fullName: 'Muhammad Ali',
    email: 'muhammad.ali@example.com',
    phoneNumber: '+92 302 3456789',
    isActive: true,
    createdAt: new Date('2024-01-25'),
    updatedAt: new Date('2024-01-25'),
    address: 'Model Town, Lahore',
    dateOfBirth: '1988-12-10',
    preferredSports: ['Football', 'Basketball']
  },
  {
    fullName: 'Fatima Sheikh',
    email: 'fatima.sheikh@example.com',
    phoneNumber: '+92 303 4567890',
    isActive: true,
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01'),
    address: 'Johar Town, Lahore',
    dateOfBirth: '1995-03-18',
    preferredSports: ['Padel']
  },
  {
    fullName: 'Hassan Malik',
    email: 'hassan.malik@example.com',
    phoneNumber: '+92 304 5678901',
    isActive: false, // Inactive customer for testing
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10'),
    address: 'Wapda Town, Lahore',
    dateOfBirth: '1987-07-25',
    preferredSports: ['Cricket']
  }
];

async function addTestCustomers() {
  console.log('👥 Adding test customers to Firebase...\n');
  
  try {
    const usersRef = collection(db, 'users');
    
    for (let i = 0; i < testCustomers.length; i++) {
      const customer = testCustomers[i];
      console.log(`${i + 1}. Adding ${customer.fullName}...`);
      
      const docRef = await addDoc(usersRef, {
        ...customer,
        // Add some additional fields that might be useful
        profileComplete: true,
        emailVerified: true,
        phoneVerified: true,
        lastLogin: new Date(),
        totalBookings: 0,
        totalSpent: 0,
        favoriteVenues: [],
        // Firebase timestamp
        createdAt: customer.createdAt,
        updatedAt: customer.updatedAt
      });
      
      console.log(`   ✅ Added with ID: ${docRef.id}`);
    }
    
    console.log(`\n✅ Successfully added ${testCustomers.length} test customers!`);
    console.log('\n🎯 NEXT STEPS:');
    console.log('1. Refresh the admin panel customers page');
    console.log('2. You should now see 5 customers in the list');
    console.log('3. Test the filtering and search functionality');
    console.log('4. Try updating customer status (active/inactive)');
    
    console.log('\n📊 CUSTOMER SUMMARY:');
    console.log('- 4 active customers');
    console.log('- 1 inactive customer (Hassan Malik)');
    console.log('- Various sports preferences');
    console.log('- Different join dates for testing filters');
    
  } catch (error) {
    console.error('❌ Error adding test customers:', error);
  }
}

// Run the function
addTestCustomers().then(() => {
  console.log('\n✅ Test customers addition completed');
  process.exit(0);
}).catch(error => {
  console.error('❌ Failed to add test customers:', error);
  process.exit(1);
});