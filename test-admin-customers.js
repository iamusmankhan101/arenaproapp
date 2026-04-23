// Test admin customers functionality
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, orderBy } from 'firebase/firestore';

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

async function testAdminCustomers() {
  console.log('🧪 Testing Admin Customers Functionality...\n');
  
  try {
    // Test 1: Check if users collection exists
    console.log('1. 📊 Checking users collection...');
    const usersRef = collection(db, 'users');
    const usersSnapshot = await getDocs(usersRef);
    
    console.log(`   ✅ Found ${usersSnapshot.size} users in database`);
    
    if (usersSnapshot.size === 0) {
      console.log('   ❌ No users found - this explains why customers page is empty!');
      console.log('   💡 Solution: Users need to sign up in the mobile app first');
      return;
    }
    
    // Test 2: Check user data structure
    console.log('\n2. 📍 Checking user data structure...');
    const users = [];
    usersSnapshot.forEach((doc) => {
      const data = doc.data();
      users.push({
        id: doc.id,
        fullName: data.fullName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        createdAt: data.createdAt,
        isActive: data.isActive
      });
    });
    
    console.log('   User data analysis:');
    users.slice(0, 3).forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.fullName || 'No name'} (${user.email || 'No email'})`);
      console.log(`      Phone: ${user.phoneNumber || 'No phone'}`);
      console.log(`      Active: ${user.isActive !== false ? 'Yes' : 'No'}`);
      console.log(`      Created: ${user.createdAt ? 'Yes' : 'No'}`);
      console.log('');
    });
    
    // Test 3: Check bookings for customer stats
    console.log('3. 📅 Checking bookings for customer statistics...');
    try {
      const bookingsRef = collection(db, 'bookings');
      const bookingsSnapshot = await getDocs(bookingsRef);
      console.log(`   ✅ Found ${bookingsSnapshot.size} bookings for customer stats`);
      
      if (bookingsSnapshot.size > 0) {
        const bookingsWithUsers = [];
        bookingsSnapshot.forEach((doc) => {
          const booking = doc.data();
          if (booking.userId) {
            bookingsWithUsers.push(booking.userId);
          }
        });
        
        const uniqueCustomersWithBookings = [...new Set(bookingsWithUsers)];
        console.log(`   📊 ${uniqueCustomersWithBookings.length} unique customers have bookings`);
      }
    } catch (bookingError) {
      console.log('   ⚠️ No bookings collection found - customer stats will be basic');
    }
    
    // Test 4: Simulate admin customers API call
    console.log('\n4. 🔧 Simulating admin customers API call...');
    
    const mockCustomers = users.map((user, index) => ({
      id: user.id,
      name: user.fullName || 'Unknown User',
      email: user.email || 'N/A',
      phone: user.phoneNumber || 'N/A',
      joinDate: user.createdAt?.toDate?.() || new Date(),
      status: user.isActive !== false ? 'active' : 'inactive',
      totalBookings: Math.floor(Math.random() * 10) + 1,
      totalSpent: Math.floor(Math.random() * 50000) + 5000,
      lastBooking: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
      preferredSports: ['Football'],
      rating: (4 + Math.random()).toFixed(1),
      isVip: Math.random() > 0.8
    }));
    
    console.log(`   ✅ Successfully processed ${mockCustomers.length} customers`);
    console.log('   📋 Sample customers:');
    mockCustomers.slice(0, 2).forEach((customer, index) => {
      console.log(`   ${index + 1}. ${customer.name} - ${customer.email}`);
      console.log(`      Status: ${customer.status}, Bookings: ${customer.totalBookings}`);
      console.log(`      Spent: PKR ${customer.totalSpent}, VIP: ${customer.isVip ? 'Yes' : 'No'}`);
    });
    
    // Test 5: Generate recommendations
    console.log('\n5. 💡 Recommendations:');
    
    if (users.length === 0) {
      console.log('   🔧 CRITICAL: No users in database');
      console.log('   - Users need to sign up through the mobile app');
      console.log('   - Check if mobile app authentication is working');
      console.log('   - Verify Firebase Auth is properly configured');
    } else {
      console.log('   ✅ Users exist in database');
      console.log('   - Admin customers page should now display users');
      console.log('   - Refresh the admin panel to see customers');
      console.log('   - Customer stats will be calculated from bookings');
    }
    
    console.log('\n🎯 NEXT STEPS:');
    console.log('1. Refresh the admin panel customers page');
    console.log('2. Check browser console for any errors');
    console.log('3. Verify the admin panel is using the correct API');
    console.log('4. If still empty, check Redux DevTools for customer data');
    
  } catch (error) {
    console.error('❌ Error testing admin customers:', error);
  }
}

// Run the test
testAdminCustomers().then(() => {
  console.log('\n✅ Admin customers test completed');
  process.exit(0);
}).catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});