// Simple test to verify adminApi import works
console.log('Testing adminApi import...');

try {
  const { adminApi } = require('./services/adminApi');
  console.log('✅ adminApi imported successfully:', typeof adminApi);
  console.log('✅ adminApi methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(adminApi)));
} catch (error) {
  console.error('❌ Failed to import adminApi:', error.message);
  console.error('❌ Error stack:', error.stack);
}

// Test ES6 import syntax
try {
  import('./services/adminApi').then(({ adminApi }) => {
    console.log('✅ ES6 import successful:', typeof adminApi);
  }).catch(error => {
    console.error('❌ ES6 import failed:', error.message);
  });
} catch (error) {
  console.error('❌ ES6 import syntax error:', error.message);
}