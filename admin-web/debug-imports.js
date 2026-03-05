// Debug script to test imports
console.log('🔍 Debugging admin-web imports...');
console.log('📁 Current working directory:', process.cwd());
console.log('📁 __dirname:', __dirname);

try {
  console.log('✅ Testing adminApi import...');
  const { adminApi } = require('./src/services/adminApi');
  console.log('✅ adminApi imported successfully:', typeof adminApi);
} catch (error) {
  console.error('❌ Failed to import adminApi:', error.message);
}

try {
  console.log('✅ Testing React import...');
  const React = require('react');
  console.log('✅ React imported successfully:', React.version);
} catch (error) {
  console.error('❌ Failed to import React:', error.message);
}

console.log('🏁 Debug complete!');