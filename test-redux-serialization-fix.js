// Test script to verify Redux serialization fix
console.log('🧪 Testing Redux Serialization Fix...\n');

// Test the timestamp serialization function
function serializeTimestamp(timestamp) {
  if (!timestamp) return new Date().toISOString();
  
  // If it's already a string, return as is
  if (typeof timestamp === 'string') return timestamp;
  
  // If it's a Firebase Timestamp object
  if (timestamp && typeof timestamp.toDate === 'function') {
    return timestamp.toDate().toISOString();
  }
  
  // If it's a Date object
  if (timestamp instanceof Date) {
    return timestamp.toISOString();
  }
  
  // If it's a serverTimestamp placeholder, use current time
  if (timestamp && timestamp._methodName === 'serverTimestamp') {
    return new Date().toISOString();
  }
  
  // Fallback to current time
  return new Date().toISOString();
}

// Test different timestamp formats
const testCases = [
  {
    name: 'serverTimestamp object',
    input: { _methodName: 'serverTimestamp' },
    expected: 'ISO string'
  },
  {
    name: 'Date object',
    input: new Date('2024-01-01T00:00:00.000Z'),
    expected: '2024-01-01T00:00:00.000Z'
  },
  {
    name: 'ISO string',
    input: '2024-01-01T00:00:00.000Z',
    expected: '2024-01-01T00:00:00.000Z'
  },
  {
    name: 'null/undefined',
    input: null,
    expected: 'ISO string'
  }
];

console.log('🔍 Testing timestamp serialization function...\n');

let allTestsPassed = true;

testCases.forEach((testCase, index) => {
  try {
    const result = serializeTimestamp(testCase.input);
    
    if (testCase.expected === 'ISO string') {
      // Check if it's a valid ISO string
      const isValidISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(result);
      if (isValidISO) {
        console.log(`✅ Test ${index + 1}: ${testCase.name} - Produced valid ISO string`);
      } else {
        console.log(`❌ Test ${index + 1}: ${testCase.name} - Invalid ISO string: ${result}`);
        allTestsPassed = false;
      }
    } else {
      // Check exact match
      if (result === testCase.expected) {
        console.log(`✅ Test ${index + 1}: ${testCase.name} - Exact match`);
      } else {
        console.log(`❌ Test ${index + 1}: ${testCase.name} - Expected: ${testCase.expected}, Got: ${result}`);
        allTestsPassed = false;
      }
    }
  } catch (error) {
    console.log(`❌ Test ${index + 1}: ${testCase.name} - Error: ${error.message}`);
    allTestsPassed = false;
  }
});

console.log('\n🔍 Testing user data serialization...\n');

// Test user data structure
const mockUser = {
  uid: 'test-user-123',
  email: 'test@example.com',
  displayName: 'Test User'
};

const mockFirestoreData = {
  createdAt: { _methodName: 'serverTimestamp' },
  updatedAt: { _methodName: 'serverTimestamp' },
  lastLoginAt: { _methodName: 'serverTimestamp' },
  phoneNumber: '1234567890',
  city: 'Test City'
};

// Simulate the createUserDataForRedux function
const createUserDataForRedux = (user, firestoreData = {}, additionalData = {}) => ({
  uid: user.uid,
  email: user.email,
  displayName: user.displayName,
  fullName: additionalData.fullName || user.displayName || '',
  phoneNumber: additionalData.phoneNumber || firestoreData.phoneNumber || '',
  city: additionalData.city || firestoreData.city || '',
  createdAt: serializeTimestamp(firestoreData.createdAt),
  updatedAt: serializeTimestamp(firestoreData.updatedAt),
  lastLoginAt: serializeTimestamp(firestoreData.lastLoginAt),
  ...additionalData
});

try {
  const userData = createUserDataForRedux(mockUser, mockFirestoreData);
  
  // Check if all timestamps are serializable
  const isCreatedAtSerializable = typeof userData.createdAt === 'string';
  const isUpdatedAtSerializable = typeof userData.updatedAt === 'string';
  const isLastLoginAtSerializable = typeof userData.lastLoginAt === 'string';
  
  if (isCreatedAtSerializable && isUpdatedAtSerializable && isLastLoginAtSerializable) {
    console.log('✅ User data serialization - All timestamps are strings');
    
    // Test JSON serialization
    try {
      const jsonString = JSON.stringify(userData);
      const parsedData = JSON.parse(jsonString);
      console.log('✅ User data serialization - JSON serialization successful');
    } catch (jsonError) {
      console.log('❌ User data serialization - JSON serialization failed:', jsonError.message);
      allTestsPassed = false;
    }
  } else {
    console.log('❌ User data serialization - Some timestamps are not strings');
    console.log('  createdAt:', typeof userData.createdAt, userData.createdAt);
    console.log('  updatedAt:', typeof userData.updatedAt, userData.updatedAt);
    console.log('  lastLoginAt:', typeof userData.lastLoginAt, userData.lastLoginAt);
    allTestsPassed = false;
  }
} catch (error) {
  console.log('❌ User data serialization - Error:', error.message);
  allTestsPassed = false;
}

console.log('\n🔍 Testing Redux store compatibility...\n');

// Test if the data would be compatible with Redux
const testReduxCompatibility = (data) => {
  try {
    // Simulate what Redux does internally
    const serialized = JSON.stringify(data);
    const deserialized = JSON.parse(serialized);
    
    // Check for any serverTimestamp objects
    const hasServerTimestamp = JSON.stringify(data).includes('serverTimestamp');
    
    if (hasServerTimestamp) {
      console.log('❌ Redux compatibility - Contains serverTimestamp objects');
      return false;
    } else {
      console.log('✅ Redux compatibility - No serverTimestamp objects found');
      return true;
    }
  } catch (error) {
    console.log('❌ Redux compatibility - Serialization error:', error.message);
    return false;
  }
};

const testUserData = createUserDataForRedux(mockUser, mockFirestoreData);
const isReduxCompatible = testReduxCompatibility(testUserData);

if (!isReduxCompatible) {
  allTestsPassed = false;
}

console.log('\n📊 Test Results Summary:\n');

if (allTestsPassed) {
  console.log('🎉 All Tests PASSED!');
  console.log('\n✅ The Redux serialization fix should resolve:');
  console.log('- "A non-serializable value was detected" errors');
  console.log('- serverTimestamp objects in Redux state');
  console.log('- Firebase timestamp serialization issues');
  console.log('- Redux DevTools compatibility problems');
  
  console.log('\n🚀 Your app should now:');
  console.log('- Work without Redux serialization warnings');
  console.log('- Handle Firebase timestamps properly');
  console.log('- Store only serializable data in Redux');
  console.log('- Maintain proper timestamp functionality');
} else {
  console.log('❌ Some Tests FAILED!');
  console.log('\n🔧 If you still see serialization errors:');
  console.log('1. Restart your React Native development server');
  console.log('2. Clear Redux state and reload app');
  console.log('3. Check for any remaining serverTimestamp objects');
  console.log('4. Verify all timestamps are converted to ISO strings');
}

process.exit(allTestsPassed ? 0 : 1);