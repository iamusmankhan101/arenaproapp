// Add test bookings for customers to show realistic stats in admin panel
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs } from 'firebase/firestore';

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

async function addTestBookingsForCustomers() {
  console.log('📅 Adding test bookings for customers...\n');
  
  try {
    // Get users and venues first
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const venuesSnapshot = await getDocs(collection(db, 'venues'));
    
    const users = [];
    const venues = [];
    
    usersSnapshot.forEach(doc => {
      users.push({ id: doc.id, ...doc.data() });
    });
    
    venuesSnapshot.forEach(doc => {
      venues.push({ id: doc.id, ...doc.data() });
    });
    
    console.log(`📊 Found ${users.length} users and ${venues.length} venues`);
    
    if (users.length === 0 || venues.length === 0) {
      console.log('❌ Need both users and venues to create bookings');
      return;
    }
    
    const bookingsRef = collection(db, 'bookings');
    let bookingsAdded = 0;
    
    // Create multiple bookings for each user
    for (const user of users) {
      const numBookings = Math.floor(Math.random() * 5) + 1; // 1-5 bookings per user
      
      for (let i = 0; i < numBookings; i++) {
        const randomVenue = venues[Math.floor(Math.random() * venues.length)];
        const randomSport = randomVenue.sports?.[0] || 'Football';
        const bookingDate = new Date(Date.now() - Math.floor(Math.random() * 60) * 24 * 60 * 60 * 1000); // Random date in last 60 days
        const amount = Math.floor(Math.random() * 3000) + 1000; // 1000-4000 PKR
        
        const booking = {
          userId: user.id,
          turfId: randomVenue.id,
          customerName: user.fullName,
          customerEmail: user.email,
          customerPhone: user.phoneNumber,
          turfName: randomVenue.name,
          turfArea: randomVenue.area || 'Lahore',
          sport: randomSport,
          date: bookingDate,
          timeSlot: `${Math.floor(Math.random() * 12) + 8}:00`, // 8:00 to 19:00
          duration: 1,
          totalAmount: amount,
          status: Math.random() > 0.1 ? 'confirmed' : 'pending', // 90% confirmed
          paymentStatus: Math.random() > 0.1 ? 'paid' : 'pending',
          bookingReference: `PIT${Date.now().toString().slice(-6)}${i}`,
          createdAt: bookingDate,
          updatedAt: bookingDate,
          userType: 'authenticated'
        };
        
        await addDoc(bookingsRef, booking);
        bookingsAdded++;
        
        console.log(`📅 Added booking ${bookingsAdded}: ${user.fullName} → ${randomVenue.name} (PKR ${amount})`);
      }
    }
    
    console.log(`\n✅ Successfully added ${bookingsAdded} test bookings!`);
    console.log('\n🎯 CUSTOMER STATS WILL NOW SHOW:');
    console.log('- Total bookings per customer');
    console.log('- Total amount spent');
    console.log('- Last booking date');
    console.log('- Preferred sports');
    console.log('- VIP status based on spending');
    
    console.log('\n📊 NEXT STEPS:');
    console.log('1. Refresh the admin panel customers page');
    console.log('2. Customer stats should now be realistic');
    console.log('3. Check the bookings page to see all bookings');
    console.log('4. Test customer filtering and search');
    
  } catch (error) {
    console.error('❌ Error adding test bookings:', error);
  }
}

// Run the function
addTestBookingsForCustomers().then(() => {
  console.log('\n✅ Test bookings addition completed');
  process.exit(0);
}).catch(error => {
  console.error('❌ Failed to add test bookings:', error);
  process.exit(1);
});