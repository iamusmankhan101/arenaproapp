// Test the admin customers API directly to see what it returns
import { workingAdminAPI } from './admin-web/src/services/workingFirebaseAPI.js';

async function testAdminCustomersAPIDirect() {
  console.log('🧪 Testing Admin Customers API Directly...\n');
  
  try {
    console.log('1. 📞 Calling workingAdminAPI.getCustomers()...');
    
    const params = {
      page: 0,
      pageSize: 25,
      filter: 'all',
      search: ''
    };
    
    console.log('   Parameters:', params);
    
    const result = await workingAdminAPI.getCustomers(params);
    
    console.log('✅ API Response received:');
    console.log('   Data length:', result.data.length);
    console.log('   Total:', result.total);
    console.log('   Page:', result.page);
    console.log('   PageSize:', result.pageSize);
    
    if (result.data.length > 0) {
      console.log('\n📋 Sample customers from API:');
      result.data.slice(0, 3).forEach((customer, index) => {
        console.log(`   ${index + 1}. ${customer.name} (${customer.email})`);
        console.log(`      Status: ${customer.status}, Phone: ${customer.phone}`);
        console.log(`      Bookings: ${customer.totalBookings}, Spent: PKR ${customer.totalSpent}`);
        console.log(`      Join Date: ${customer.joinDate}`);
        console.log('');
      });
    } else {
      console.log('❌ No customers in API response data array');
    }
    
    // Test with different parameters
    console.log('\n2. 🔄 Testing with different parameters...');
    
    const params2 = {
      page: 0,
      pageSize: 10,
      filter: 'active',
      search: ''
    };
    
    const result2 = await workingAdminAPI.getCustomers(params2);
    console.log(`   Active customers: ${result2.data.length}/${result2.total}`);
    
    // Test search
    console.log('\n3. 🔍 Testing search functionality...');
    
    const params3 = {
      page: 0,
      pageSize: 25,
      filter: 'all',
      search: 'Ahmed'
    };
    
    const result3 = await workingAdminAPI.getCustomers(params3);
    console.log(`   Search "Ahmed": ${result3.data.length} results`);
    
    console.log('\n🎯 CONCLUSION:');
    if (result.data.length === 5) {
      console.log('✅ API is working correctly and returning 5 customers');
      console.log('💡 The issue is likely in the frontend React component');
      console.log('🔧 Check:');
      console.log('   - Browser console for JavaScript errors');
      console.log('   - Redux DevTools for customer state');
      console.log('   - Network tab for failed API calls');
      console.log('   - DataGrid component props and data binding');
    } else {
      console.log('❌ API is not returning the expected data');
      console.log(`Expected: 5 customers, Got: ${result.data.length} customers`);
    }
    
  } catch (error) {
    console.error('❌ Error testing admin customers API:', error);
    console.log('\n💡 This error might be why the customers page is empty');
    console.log('🔧 Check:');
    console.log('   - Firebase connection');
    console.log('   - API import paths');
    console.log('   - Database permissions');
  }
}

// Run the test
testAdminCustomersAPIDirect().then(() => {
  console.log('\n✅ API test completed');
  process.exit(0);
}).catch(error => {
  console.error('❌ API test failed:', error);
  process.exit(1);
});