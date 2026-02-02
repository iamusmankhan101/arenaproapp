#!/usr/bin/env node

/**
 * Firebase Configuration Test
 * 
 * This script tests the Firebase configuration and connection
 * Run with: node test-firebase-config.js
 */

const fs = require('fs');

console.log('🔥 Testing Firebase Configuration...\n');

// Check if Firebase config file exists
console.log('📁 Checking Firebase configuration file...');
if (fs.existsSync('src/config/firebase.js')) {
  console.log('✅ Firebase config file found');
  
  const configContent = fs.readFileSync('src/config/firebase.js', 'utf8');
  
  // Check for required configuration elements
  const requiredElements = [
    'apiKey',
    'authDomain',
    'projectId',
    'storageBucket',
    'messagingSenderId',
    'appId'
  ];
  
  console.log('\n🔍 Checking configuration elements...');
  requiredElements.forEach(element => {
    if (configContent.includes(element)) {
      console.log(`✅ ${element} found`);
    } else {
      console.log(`❌ ${element} missing`);
    }
  });
  
  // Check for proper initialization
  console.log('\n🔍 Checking Firebase initialization...');
  const initChecks = [
    'initializeApp',
    'getAuth',
    'getFirestore',
    'getStorage'
  ];
  
  initChecks.forEach(check => {
    if (configContent.includes(check)) {
      console.log(`✅ ${check} found`);
    } else {
      console.log(`❌ ${check} missing`);
    }
  });
  
  // Check for error handling
  if (configContent.includes('try') && configContent.includes('catch')) {
    console.log('✅ Error handling implemented');
  } else {
    console.log('❌ Error handling missing');
  }
  
} else {
  console.log('❌ Firebase config file not found');
}

// Check if google-services.json exists
console.log('\n📁 Checking google-services.json...');
if (fs.existsSync('google-services.json')) {
  console.log('✅ google-services.json found');
} else {
  console.log('❌ google-services.json not found');
}

// Check Firebase Auth service
console.log('\n📁 Checking Firebase Auth service...');
if (fs.existsSync('src/services/firebaseAuth.js')) {
  console.log('✅ Firebase Auth service found');
  
  const authContent = fs.readFileSync('src/services/firebaseAuth.js', 'utf8');
  
  // Check for configuration error handling
  if (authContent.includes('configuration-not-found')) {
    console.log('✅ Configuration error handling added');
  } else {
    console.log('❌ Configuration error handling missing');
  }
  
  // Check for Firebase initialization check
  if (authContent.includes('Firebase authentication is not properly initialized')) {
    console.log('✅ Firebase initialization check added');
  } else {
    console.log('❌ Firebase initialization check missing');
  }
  
} else {
  console.log('❌ Firebase Auth service not found');
}

console.log('\n📊 Configuration Test Results:');
console.log('================================');

console.log('\n🔧 Common Solutions for Configuration Issues:');
console.log('1. Ensure google-services.json is in the project root');
console.log('2. Verify Firebase project settings in Firebase Console');
console.log('3. Check that Authentication is enabled in Firebase Console');
console.log('4. Ensure the app is properly registered in Firebase project');
console.log('5. Verify API keys and project IDs are correct');

console.log('\n🚀 Next Steps:');
console.log('1. Check Firebase Console for project status');
console.log('2. Verify Authentication providers are enabled');
console.log('3. Test the app again after configuration fixes');

console.log('\n✨ Firebase configuration test completed!');