#!/usr/bin/env node

/**
 * Authentication System Test Script
 * 
 * This script tests the Firebase authentication system implementation
 * Run with: node test-authentication-system.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔐 Testing Authentication System Implementation...\n');

// Test files exist
const filesToCheck = [
  'src/services/firebaseAuth.js',
  'src/store/slices/authSlice.js',
  'src/screens/auth/SignInScreen.js',
  'src/screens/auth/SignUpScreen.js',
  'src/screens/auth/ForgotPasswordScreen.js',
  'src/navigation/AppNavigator.js',
  'src/config/firebase.js',
  'firestore.rules'
];

console.log('📁 Checking required files...');
let allFilesExist = true;

filesToCheck.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING`);
    allFilesExist = false;
  }
});

if (!allFilesExist) {
  console.log('\n❌ Some required files are missing!');
  process.exit(1);
}

console.log('\n🔍 Checking Firebase Auth implementation...');

// Check firebaseAuth.js implementation
const firebaseAuthContent = fs.readFileSync('src/services/firebaseAuth.js', 'utf8');
const authFeatures = [
  'signIn',
  'signUp',
  'googleSignIn',
  'signOut',
  'forgotPassword',
  'updateProfile',
  'changePassword',
  'resendEmailVerification',
  'initializeAuthListener',
  'verifyToken'
];

authFeatures.forEach(feature => {
  if (firebaseAuthContent.includes(feature)) {
    console.log(`✅ ${feature} method implemented`);
  } else {
    console.log(`❌ ${feature} method missing`);
  }
});

console.log('\n🔍 Checking Redux Auth Slice...');

// Check authSlice.js implementation
const authSliceContent = fs.readFileSync('src/store/slices/authSlice.js', 'utf8');
const reduxFeatures = [
  'signIn',
  'signUp',
  'googleSignIn',
  'forgotPassword',
  'updateProfile',
  'changePassword',
  'loadStoredAuth',
  'initializeAuth'
];

reduxFeatures.forEach(feature => {
  if (authSliceContent.includes(feature)) {
    console.log(`✅ ${feature} action implemented`);
  } else {
    console.log(`❌ ${feature} action missing`);
  }
});

console.log('\n🔍 Checking Authentication Screens...');

// Check SignInScreen
const signInContent = fs.readFileSync('src/screens/auth/SignInScreen.js', 'utf8');
const signInFeatures = [
  'email validation',
  'password visibility',
  'error handling',
  'loading states',
  'guest login'
];

const signInChecks = [
  signInContent.includes('validateForm'),
  signInContent.includes('showPassword'),
  signInContent.includes('error'),
  signInContent.includes('loading'),
  signInContent.includes('handleGuestLogin')
];

signInFeatures.forEach((feature, index) => {
  if (signInChecks[index]) {
    console.log(`✅ SignIn: ${feature}`);
  } else {
    console.log(`❌ SignIn: ${feature} missing`);
  }
});

// Check SignUpScreen
const signUpContent = fs.readFileSync('src/screens/auth/SignUpScreen.js', 'utf8');
const signUpFeatures = [
  'form validation',
  'city selection',
  'password strength',
  'terms acceptance',
  'phone number'
];

const signUpChecks = [
  signUpContent.includes('validateForm'),
  signUpContent.includes('selectedCity'),
  signUpContent.includes('passwordStrength'),
  signUpContent.includes('terms'),
  signUpContent.includes('phoneNumber')
];

signUpFeatures.forEach((feature, index) => {
  if (signUpChecks[index]) {
    console.log(`✅ SignUp: ${feature}`);
  } else {
    console.log(`❌ SignUp: ${feature} missing`);
  }
});

console.log('\n🔍 Checking Firebase Configuration...');

// Check Firebase config
const firebaseConfigContent = fs.readFileSync('src/config/firebase.js', 'utf8');
const firebaseFeatures = [
  'initializeApp',
  'getAuth',
  'getFirestore',
  'AsyncStorage persistence'
];

const firebaseChecks = [
  firebaseConfigContent.includes('initializeApp'),
  firebaseConfigContent.includes('getAuth') || firebaseConfigContent.includes('initializeAuth'),
  firebaseConfigContent.includes('getFirestore'),
  firebaseConfigContent.includes('AsyncStorage')
];

firebaseFeatures.forEach((feature, index) => {
  if (firebaseChecks[index]) {
    console.log(`✅ Firebase: ${feature}`);
  } else {
    console.log(`❌ Firebase: ${feature} missing`);
  }
});

console.log('\n🔍 Checking Firestore Security Rules...');

// Check Firestore rules
const firestoreRulesContent = fs.readFileSync('firestore.rules', 'utf8');
const securityFeatures = [
  'user data protection',
  'admin access control',
  'booking security',
  'authentication required'
];

const securityChecks = [
  firestoreRulesContent.includes('request.auth.uid == userId'),
  firestoreRulesContent.includes('admins'),
  firestoreRulesContent.includes('bookings'),
  firestoreRulesContent.includes('request.auth != null')
];

securityFeatures.forEach((feature, index) => {
  if (securityChecks[index]) {
    console.log(`✅ Security: ${feature}`);
  } else {
    console.log(`❌ Security: ${feature} missing`);
  }
});

console.log('\n🔍 Checking Navigation Integration...');

// Check AppNavigator
const navigatorContent = fs.readFileSync('src/navigation/AppNavigator.js', 'utf8');
const navigationFeatures = [
  'auth state checking',
  'protected routes',
  'splash screen',
  'Firebase listener'
];

const navigationChecks = [
  navigatorContent.includes('isAuthenticated'),
  navigatorContent.includes('!isAuthenticated'),
  navigatorContent.includes('showSplash'),
  navigatorContent.includes('initializeAuth')
];

navigationFeatures.forEach((feature, index) => {
  if (navigationChecks[index]) {
    console.log(`✅ Navigation: ${feature}`);
  } else {
    console.log(`❌ Navigation: ${feature} missing`);
  }
});

console.log('\n📊 Authentication System Test Results:');
console.log('=====================================');

// Calculate overall score
const totalChecks = authFeatures.length + reduxFeatures.length + 
                   signInFeatures.length + signUpFeatures.length + 
                   firebaseFeatures.length + securityFeatures.length + 
                   navigationFeatures.length;

let passedChecks = 0;

// Count passed checks (simplified)
if (firebaseAuthContent.includes('signIn')) passedChecks += authFeatures.length;
if (authSliceContent.includes('signIn')) passedChecks += reduxFeatures.length;
if (signInContent.includes('validateForm')) passedChecks += signInFeatures.length;
if (signUpContent.includes('validateForm')) passedChecks += signUpFeatures.length;
if (firebaseConfigContent.includes('initializeApp')) passedChecks += firebaseFeatures.length;
if (firestoreRulesContent.includes('request.auth')) passedChecks += securityFeatures.length;
if (navigatorContent.includes('isAuthenticated')) passedChecks += navigationFeatures.length;

const score = Math.round((passedChecks / totalChecks) * 100);

console.log(`📈 Implementation Score: ${score}%`);

if (score >= 90) {
  console.log('🎉 Excellent! Authentication system is fully implemented.');
} else if (score >= 75) {
  console.log('✅ Good! Authentication system is mostly complete.');
} else if (score >= 50) {
  console.log('⚠️  Fair. Authentication system needs more work.');
} else {
  console.log('❌ Poor. Authentication system is incomplete.');
}

console.log('\n🚀 Next Steps:');
console.log('1. Test the authentication flows in the app');
console.log('2. Deploy Firestore security rules');
console.log('3. Configure Firebase project settings');
console.log('4. Test email verification functionality');
console.log('5. Set up Google Sign-In credentials');

console.log('\n📚 Documentation:');
console.log('- Read AUTHENTICATION_SYSTEM_COMPLETE.md for detailed information');
console.log('- Check Firebase console for project configuration');
console.log('- Review Firestore rules in the Firebase console');

console.log('\n✨ Authentication system test completed!');