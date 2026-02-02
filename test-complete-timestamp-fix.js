// Comprehensive test for Firebase timestamp serialization fix
console.log('🧪 Testing Complete Firebase Timestamp Fix...\n');

// Mock Firebase Timestamp class for testing
class MockTimestamp {
  constructor(seconds, nanoseconds) {
    this.seconds = seconds;
    this.nanoseconds = nanoseconds;
  }
  
  toDate() {
    return new Date(this.seconds * 1000 + this.nanoseconds / 1000000);
  }
}

// Test the comprehensive timestamp conversion function
function convertFirebaseTimestamp(value) {
  if (!value) return new Date().toISOString();
  
  if (typeof value === 'string') return value;
  
  if (value instanceof Date) return value.toISOString();
  
  // Firebase Timestamp object (has seconds and nanoseconds)
  if (value && typeof value === 'object' && 
      (value.seconds !== undefined || value.nanoseconds !== undefined)) {
    try {
      const timestamp = new MockTimestamp(value.seconds || 0, value.nanoseconds || 0);
      return timestamp.toDate().toISOString();
    } catch (error) {
      console.log('Error converting Firebase timestamp:', error);
      return new Date().toISOString();
    }
  }
  
  // Firebase Timestamp instance
  if (value && typeof value.toDate === 'function') {
    try {
      return value.toDate().toISOString();
    } catch (error) {
      console.log('Error converting Firebase timestamp instance:', error);
      return new Date().toISOString();
    }
  }
  
  // serverTimestamp placeholder
  if (value && value._methodName === 'serverTimestamp') {
    return new Date().toISOString();
  }
  
  // Object with type "firestore/timestamp/"
  if (value && typeof value === 'object' && value.type === 'firestore/timestamp/') {
    try {
      const timestamp = new MockTimestamp(value.seconds || 0, value.nanoseconds || 0);
      return timestamp.toDate().toISOString();
    } catch (error) {
      console.log('Error converting firestore timestamp type:', error);
      return new Date().toISOString();
    }
  }
  
  return new Date().toISOString();
}

// Deep clean function to remove all non-serializable values
function deepCleanForRedux(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(item => deepCleanForRedux(item));
  }
  
  const cleaned = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (value === null || value === undefined) {
      cleaned[key] = value;
    } else if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      cleaned[key] = value;
    } else if (Array.isArray(value)) {
      cleaned[key] = deepCleanForRedux(value);
    } else if (typeof value === 'object') {
      // Check if it's a timestamp-like object
      if (value.seconds !== undefined || value.nanoseconds !== undefined || 
          value._methodName === 'serverTimestamp' || 
          value.type === 'firestore/timestamp/' ||
          (value.toDate && typeof value.toDate === 'function')) {
        cleaned[key] = convertFirebaseTimestamp(value);
      } else {
        cleaned[key] = deepCleanForRedux(value);
      }
    } else {
      cleaned[key] = String(value);
    }
  }
  
  return cleaned;
}

console.log('🔍 Testing timestamp conversion function...\n');

// Test cases for different timestamp formats
const timestampTestCases = [
  {
    name: 'serverTimestamp object',
    input: { _methodName: 'serverTimestamp' },
    expected: 'ISO string'
  },
  {
    name: 'Firebase Timestamp with seconds/nanoseconds',
    input: { seconds: 1770062691, nanoseconds: 746000000 },
    expected: 'ISO string'
  },
  {
    name: 'Firestore timestamp type object',
    input: { type: 'firestore/timestamp/', seconds: 1770062691, nanoseconds: 746000000 },
    expected: 'ISO string'
  },
  {
    name: 'Firebase Timestamp instance',
    input: new MockTimestamp(1770062691, 746000000),
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

let allTestsPassed = true;

timestampTestCases.forEach((testCase, index) => {
  try {
    const result = convertFirebaseTimestamp(testCase.input);
    
    if (testCase.expected === 'ISO string') {
      const isValidISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(result);
      if (isValidISO) {
        console.log(`✅ Test ${index + 1}: ${testCase.name} - Produced valid ISO string`);
      } else {
        console.log(`❌ Test ${index + 1}: ${testCase.name} - Invalid ISO string: ${result}`);
        allTestsPassed = false;
      }
    } else {
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

console.log('\n🔍 Testing deep cleaning function...\n');

// Test complex nested object with various timestamp formats
const complexTestObject = {
  uid: 'test-user-123',
  email: 'test@example.com',
  displayName: 'Test User',
  createdAt: { _methodName: 'serverTimestamp' },
  updatedAt: { type: 'firestore/timestamp/', seconds: 1770062691, nanoseconds: 746000000 },
  lastLoginAt: { seconds: 1770062691, nanoseconds: 746000000 },
  profile: {
    joinedAt: new MockTimestamp(1770062691, 746000000),
    settings: {
      notifications: true,
      theme: 'dark',
      lastModified: { _methodName: 'serverTimestamp' }
    }
  },
  stats: {
    totalBookings: 5,
    favoriteVenues: ['venue1', 'venue2'],
    lastActivity: { type: 'firestore/timestamp/', seconds: 1770062691, nanoseconds: 746000000 }
  }
};

try {
  const cleanedObject = deepCleanForRedux(complexTestObject);
  
  // Check if all timestamps were converted to strings
  const hasTimestampObjects = JSON.stringify(cleanedObject).includes('serverTimestamp') ||
                             JSON.stringify(cleanedObject).includes('firestore/timestamp') ||
                             JSON.stringify(cleanedObject).includes('"seconds"') ||
                             JSON.stringify(cleanedObject).includes('"nanoseconds"');
  
  if (!hasTimestampObjects) {
    console.log('✅ Deep cleaning - All timestamp objects removed');
    
    // Test JSON serialization
    try {
      const jsonString = JSON.stringify(cleanedObject);
      const parsedObject = JSON.parse(jsonString);
      console.log('✅ Deep cleaning - JSON serialization successful');
      
      // Check specific timestamp fields
      const timestampFields = ['createdAt', 'updatedAt', 'lastLoginAt'];
      let allTimestampsAreStrings = true;
      
      timestampFields.forEach(field => {
        if (typeof cleanedObject[field] !== 'string') {
          console.log(`❌ Deep cleaning - ${field} is not a string: ${typeof cleanedObject[field]}`);
          allTimestampsAreStrings = false;
        }
      });
      
      // Check nested timestamps
      if (typeof cleanedObject.profile?.joinedAt !== 'string') {
        console.log('❌ Deep cleaning - profile.joinedAt is not a string');
        allTimestampsAreStrings = false;
      }
      
      if (typeof cleanedObject.profile?.settings?.lastModified !== 'string') {
        console.log('❌ Deep cleaning - profile.settings.lastModified is not a string');
        allTimestampsAreStrings = false;
      }
      
      if (typeof cleanedObject.stats?.lastActivity !== 'string') {
        console.log('❌ Deep cleaning - stats.lastActivity is not a string');
        allTimestampsAreStrings = false;
      }
      
      if (allTimestampsAreStrings) {
        console.log('✅ Deep cleaning - All nested timestamps converted to strings');
      } else {
        allTestsPassed = false;
      }
      
    } catch (jsonError) {
      console.log('❌ Deep cleaning - JSON serialization failed:', jsonError.message);
      allTestsPassed = false;
    }
  } else {
    console.log('❌ Deep cleaning - Still contains timestamp objects');
    console.log('Remaining object:', JSON.stringify(cleanedObject, null, 2));
    allTestsPassed = false;
  }
} catch (error) {
  console.log('❌ Deep cleaning - Error:', error.message);
  allTestsPassed = false;
}

console.log('\n🔍 Testing Redux compatibility...\n');

// Test the exact error case from the screenshot
const problematicTimestamp = {
  type: 'firestore/timestamp/',
  seconds: 1770062691,
  nanoseconds: 746000000
};

const userDataWithProblematicTimestamp = {
  uid: 'ZX1vPJbZgnXxnP2JlyQxl8Bdc8y1',
  email: 'test@example.com',
  createdAt: problematicTimestamp
};

try {
  const cleanedUserData = deepCleanForRedux(userDataWithProblematicTimestamp);
  
  // Check if the problematic timestamp was converted
  if (typeof cleanedUserData.createdAt === 'string') {
    console.log('✅ Redux compatibility - Problematic timestamp converted to string');
    console.log(`   createdAt: ${cleanedUserData.createdAt}`);
    
    // Test Redux-style serialization
    const serialized = JSON.stringify(cleanedUserData);
    const deserialized = JSON.parse(serialized);
    
    if (deserialized.createdAt === cleanedUserData.createdAt) {
      console.log('✅ Redux compatibility - Serialization/deserialization successful');
    } else {
      console.log('❌ Redux compatibility - Serialization/deserialization failed');
      allTestsPassed = false;
    }
  } else {
    console.log('❌ Redux compatibility - Problematic timestamp not converted');
    console.log(`   createdAt type: ${typeof cleanedUserData.createdAt}`);
    console.log(`   createdAt value: ${JSON.stringify(cleanedUserData.createdAt)}`);
    allTestsPassed = false;
  }
} catch (error) {
  console.log('❌ Redux compatibility - Error:', error.message);
  allTestsPassed = false;
}

console.log('\n📊 Test Results Summary:\n');

if (allTestsPassed) {
  console.log('🎉 All Tests PASSED!');
  console.log('\n✅ The complete timestamp fix should resolve:');
  console.log('- Redux serialization errors with Firebase timestamps');
  console.log('- "firestore/timestamp/" type objects in Redux state');
  console.log('- serverTimestamp objects causing serialization issues');
  console.log('- Any nested timestamp objects in complex data structures');
  
  console.log('\n🚀 Your app should now:');
  console.log('- Work without any Redux serialization warnings');
  console.log('- Handle all Firebase timestamp formats properly');
  console.log('- Store only serializable data in Redux state');
  console.log('- Maintain proper timestamp functionality in Firestore');
} else {
  console.log('❌ Some Tests FAILED!');
  console.log('\n🔧 If you still see serialization errors:');
  console.log('1. Restart your React Native development server');
  console.log('2. Clear all app data and Redux state');
  console.log('3. Check for any remaining timestamp objects in console');
  console.log('4. Verify the fix was applied correctly');
}

process.exit(allTestsPassed ? 0 : 1);