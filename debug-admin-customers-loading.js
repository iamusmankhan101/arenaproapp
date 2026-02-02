#!/usr/bin/env node

/**
 * Debug Admin Customers Loading Issue
 * 
 * This script tests the admin customers API directly to identify
 * why customers are not loading in the admin panel.
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, orderBy } = require('firebase/firestore');

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyA7G3uLmKNCDhiyTuwK6GBbTxRJFvmGNpY",
  authDomain: "arena-pro-97b5f.firebaseapp.com",
  projectId: "arena-pro-97b5f",
  storageBucket: "arena-pro-97b5f.firebasestorage.app",
  messagingSenderId: "960416327217",
  appId: "1:960416327217:android:bc3d63f865bef8be8f5710"
};

async function debugCustomersLoading() {
  console.log('🔍 Debug: Admin Customers Loading Issue\n');
  
  try {
    // Initialize Firebase
    console.log('🔥 Initializing Firebase...');
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    console.log('✅ Firebase initialized successfully\n');
    
    // Test 1: Check if users collection exists
    console.log('👥 Test 1: Checking users collection...');
    try {
      const usersRef = collection(db, 'users');
      const usersSnapshot = await getDocs(usersRef);
      
      console.log(`📊 Users collection found: ${usersSnapshot.size} documents`);
      
      if (usersSnapshot.size === 0) {
        console.log('⚠️ Users collection is empty - this is the issue!');
        console.log('💡 Solution: Add test users to the database\n');
        return;
      }
      
      // Show sample user data
      console.log('\n📋 Sample user documents:');
      let count = 0;
      usersSnapshot.forEach((doc) => {
        if (count < 3) {
          const userData = doc.data();
          console.log(`   User ${count + 1}:`, {
            id: doc.id,
            name: userData.fullName || userData.displayName || userData.name || 'No name',
            email: userData.email || 'No email',
            phone: userData.phoneNumber || userData.phone || 'No phone',
            createdAt: userData.createdAt ? 'Has timestamp' : 'No timestamp'
          });
          count++;
        }
      });
      
    } catch (usersError) {
      console.log('❌ Error accessing users collection:', usersError.message);
      console.log('💡 This might be a permissions issue or the collection doesn\'t exist\n');
      return;
    }
    
    // Test 2: Check bookings collection for customer stats
    console.log('\n📅 Test 2: Checking bookings collection for customer stats...');
    try {
      const bookingsRef = collection(db, 'bookings');
      const bookingsSnapshot = await getDocs(bookingsRef);
      
      console.log(`📊 Bookings collection found: ${bookingsSnapshot.size} documents`);
      
      if (bookingsSnapshot.size === 0) {
        console.log('⚠️ No bookings found - customer stats will be empty');
      } else {
        // Analyze bookings by user
        const userBookings = {};
        bookingsSnapshot.forEach((doc) => {
          const booking = doc.data();
          const userId = booking.userId;
          
          if (userId) {
            if (!userBookings[userId]) {
              userBookings[userId] = { count: 0, totalSpent: 0 };
            }
            userBookings[userId].count++;
            userBookings[userId].totalSpent += booking.totalAmount || 0;
          }
        });
        
        console.log(`📈 Found bookings for ${Object.keys(userBookings).length} unique users`);
        console.log('   Sample booking stats:', Object.entries(userBookings).slice(0, 3));
      }
      
    } catch (bookingsError) {
      console.log('❌ Error accessing bookings collection:', bookingsError.message);
    }
    
    // Test 3: Simulate the admin API call
    console.log('\n🔧 Test 3: Simulating admin getCustomers API call...');
    try {
      const usersRef = collection(db, 'users');
      let usersQuery = usersRef;
      
      // Try to add ordering
      try {
        usersQuery = query(usersRef, orderBy('createdAt', 'desc'));
        console.log('✅ Successfully created ordered query');
      } catch (orderError) {
        console.log('⚠️ Could not order by createdAt, using simple query');
        usersQuery = usersRef;
      }
      
      const querySnapshot = await getDocs(usersQuery);
      const customers = [];
      
      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        const transformedCustomer = {
          id: doc.id,
          name: userData.fullName || userData.displayName || userData.name || 'Unknown User',
          email: userData.email || 'N/A',
          phone: userData.phoneNumber || userData.phone || 'N/A',
          joinDate: userData.createdAt?.toDate?.() || new Date(),
          status: userData.isActive !== false ? 'active' : 'inactive',
          totalBookings: 0, // Will be calculated from bookings
          totalSpent: 0,
          lastBooking: userData.createdAt?.toDate?.() || new Date(),
          preferredSports: ['Football'],
          rating: (4 + Math.random()).toFixed(1),
          isVip: false
        };
        customers.push(transformedCustomer);
      });
      
      console.log(`✅ Successfully processed ${customers.length} customers`);
      console.log('📋 Sample processed customers:');
      customers.slice(0, 2).forEach((customer, index) => {
        console.log(`   Customer ${index + 1}:`, {
          id: customer.id,
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          status: customer.status
        });
      });
      
      // Test the result structure
      const result = {
        data: customers,
        total: customers.length,
        page: 0,
        pageSize: 25
      };
      
      console.log('\n📊 Final API result structure:');
      console.log(`   data: Array(${result.data.length})`);
      console.log(`   total: ${result.total}`);
      console.log(`   page: ${result.page}`);
      console.log(`   pageSize: ${result.pageSize}`);
      
      if (result.data.length === 0) {
        console.log('\n❌ ISSUE IDENTIFIED: No customer data in result');
        console.log('💡 Possible causes:');
        console.log('   1. Users collection is empty');
        console.log('   2. User documents have unexpected structure');
        console.log('   3. Firestore permissions issue');
      } else {
        console.log('\n✅ API simulation successful - customers should load');
      }
      
    } catch (apiError) {
      console.log('❌ Error simulating API call:', apiError.message);
    }
    
    // Test 4: Check admin panel state flow
    console.log('\n🔄 Test 4: Checking admin panel state flow...');
    console.log('Expected flow:');
    console.log('   1. CustomersPage dispatches fetchCustomers');
    console.log('   2. Redux calls workingAdminAPI.getCustomers');
    console.log('   3. API returns { data: [...], total: N }');
    console.log('   4. Redux updates customers state');
    console.log('   5. DataGrid displays customers');
    
    console.log('\n🔍 Check browser console for:');
    console.log('   - "👥 Admin: Fetching customers..." (API call started)');
    console.log('   - "✅ Admin: Customers fetched: X/Y customers" (API success)');
    console.log('   - "✅ Redux: fetchCustomers.fulfilled" (Redux success)');
    console.log('   - DataGrid state changes');
    
  } catch (error) {
    console.error('❌ Debug script error:', error);
  }
}

// Run the debug
debugCustomersLoading().then(() => {
  console.log('\n' + '='.repeat(50));
  console.log('🔍 Debug Complete');
  console.log('='.repeat(50));
}).catch(console.error);