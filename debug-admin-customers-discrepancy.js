// Debug the discrepancy between dashboard customer count and customers page
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

async function debugCustomersDiscrepancy() {
  console.log('🔍 Debugging Admin Customers Discrepancy...\n');
  
  try {
    // Test 1: Simple count (like dashboard does)
    console.log('1. 📊 Dashboard-style customer count...');
    const usersRef = collection(db, 'users');
    const usersSnapshot = await getDocs(usersRef);
    const totalCustomers = usersSnapshot.size;
    
    console.log(`   ✅ Dashboard count: ${totalCustomers} customers`);
    
    // Test 2: Ordered query (like customers page does)
    console.log('\n2. 📋 Customers page-style query...');
    try {
      let usersQuery = collection(db, 'users');
      usersQuery = query(usersQuery, orderBy('createdAt', 'desc'));
      
      const orderedSnapshot = await getDocs(usersQuery);
      console.log(`   ✅ Ordered query count: ${orderedSnapshot.size} customers`);
      
      // Process customers like the API does
      const customers = [];
      orderedSnapshot.forEach((doc) => {
        const userData = doc.data();
        customers.push({
          id: doc.id,
          name: userData.fullName || userData.displayName || userData.name || 'Unknown User',
          email: userData.email || 'N/A',
          phone: userData.phoneNumber || userData.phone || 'N/A',
          joinDate: userData.createdAt?.toDate?.() || new Date(),
          status: userData.isActive !== false ? 'active' : 'inactive',
          // Add other fields...
        });
      });
      
      console.log(`   ✅ Processed customers: ${customers.length}`);
      
      if (customers.length > 0) {
        console.log('   📋 Sample processed customers:');
        customers.slice(0, 3).forEach((customer, index) => {
          console.log(`   ${index + 1}. ${customer.name} (${customer.email}) - ${customer.status}`);
        });
      }
      
    } catch (orderError) {
      console.log('   ❌ Ordered query failed:', orderError.message);
      console.log('   💡 This might be the issue - index not ready or missing');
      
      // Try without ordering
      console.log('\n   🔄 Trying without ordering...');
      const simpleSnapshot = await getDocs(usersRef);
      console.log(`   ✅ Simple query count: ${simpleSnapshot.size} customers`);
    }
    
    // Test 3: Check individual user documents
    console.log('\n3. 🔍 Checking individual user documents...');
    const allUsers = [];
    usersSnapshot.forEach((doc) => {
      const data = doc.data();
      allUsers.push({
        id: doc.id,
        fullName: data.fullName,
        email: data.email,
        createdAt: data.createdAt,
        hasCreatedAt: !!data.createdAt
      });
    });
    
    console.log('   📊 User document analysis:');
    console.log(`   - Total users: ${allUsers.length}`);
    console.log(`   - Users with createdAt: ${allUsers.filter(u => u.hasCreatedAt).length}`);
    console.log(`   - Users without createdAt: ${allUsers.filter(u => !u.hasCreatedAt).length}`);
    
    // Test 4: Check if there are any filters being applied
    console.log('\n4. 🎯 Testing potential filtering issues...');
    
    const activeUsers = allUsers.filter(user => {
      // Simulate the filtering logic from the API
      return true; // No specific filter in the basic query
    });
    
    console.log(`   ✅ After filtering: ${activeUsers.length} customers`);
    
    // Test 5: Check pagination
    console.log('\n5. 📄 Testing pagination...');
    const pageSize = 25;
    const page = 0;
    const startIndex = page * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedUsers = allUsers.slice(startIndex, endIndex);
    
    console.log(`   📊 Pagination result: ${paginatedUsers.length} customers (page ${page}, size ${pageSize})`);
    
    // Test 6: Final API simulation
    console.log('\n6. 🧪 Simulating complete API response...');
    const apiResponse = {
      data: paginatedUsers.map(user => ({
        id: user.id,
        name: user.fullName || 'Unknown User',
        email: user.email || 'N/A',
        phone: 'N/A',
        joinDate: user.createdAt?.toDate?.() || new Date(),
        status: 'active',
        totalBookings: Math.floor(Math.random() * 10) + 1,
        totalSpent: Math.floor(Math.random() * 50000) + 5000,
        lastBooking: new Date(),
        preferredSports: ['Football'],
        rating: '4.5',
        isVip: false
      })),
      total: allUsers.length,
      page: 0,
      pageSize: 25
    };
    
    console.log(`   ✅ API response: ${apiResponse.data.length} customers in data array`);
    console.log(`   📊 Total: ${apiResponse.total}, Page: ${apiResponse.page}, PageSize: ${apiResponse.pageSize}`);
    
    // Conclusions
    console.log('\n🎯 ANALYSIS RESULTS:');
    
    if (totalCustomers === 0) {
      console.log('❌ PROBLEM: No users in database');
      console.log('💡 SOLUTION: Add users to the database');
    } else if (apiResponse.data.length === 0) {
      console.log('❌ PROBLEM: API processing is filtering out all users');
      console.log('💡 SOLUTION: Check API filtering logic');
    } else if (apiResponse.data.length !== totalCustomers) {
      console.log('⚠️ PROBLEM: Discrepancy between count and processed data');
      console.log(`Dashboard shows: ${totalCustomers}, API returns: ${apiResponse.data.length}`);
      console.log('💡 SOLUTION: Check API processing and filtering');
    } else {
      console.log('✅ DATA LOOKS CORRECT: API should return customers');
      console.log('💡 ISSUE MIGHT BE: Frontend not displaying the data properly');
    }
    
    console.log('\n🔧 NEXT STEPS:');
    console.log('1. Check browser console for JavaScript errors');
    console.log('2. Check Redux DevTools for customer data');
    console.log('3. Verify the customers page is calling the correct API');
    console.log('4. Check if there are any network errors');
    
  } catch (error) {
    console.error('❌ Error debugging customers discrepancy:', error);
  }
}

// Run the debug
debugCustomersDiscrepancy().then(() => {
  console.log('\n✅ Debug completed');
  process.exit(0);
}).catch(error => {
  console.error('❌ Debug failed:', error);
  process.exit(1);
});