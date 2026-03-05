const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, doc, getDoc } = require('firebase/firestore');

// Firebase config from your project
const firebaseConfig = {
  apiKey: "AIzaSyA7G3uLmKNCDhiyTuwK6GBbTxRJFvmGNpY",
  authDomain: "arena-pro-97b5f.firebaseapp.com",
  projectId: "arena-pro-97b5f",
  storageBucket: "arena-pro-97b5f.firebasestorage.app",
  messagingSenderId: "960416327217",
  appId: "1:960416327217:android:bc3d63f865bef8be8f5710"
};

async function debugFirebaseConnection() {
  console.log('🔍 Starting Firebase Network Diagnostics...\n');
  
  try {
    // Step 1: Initialize Firebase
    console.log('1️⃣ Initializing Firebase...');
    const app = initializeApp(firebaseConfig);
    console.log('✅ Firebase app initialized successfully');
    
    // Step 2: Test Auth initialization
    console.log('\n2️⃣ Testing Firebase Auth...');
    const auth = getAuth(app);
    console.log('✅ Firebase Auth initialized');
    
    // Step 3: Test Firestore initialization
    console.log('\n3️⃣ Testing Firestore...');
    const db = getFirestore(app);
    console.log('✅ Firestore initialized');
    
    // Step 4: Test network connectivity to Firebase
    console.log('\n4️⃣ Testing network connectivity...');
    
    // Test Auth endpoint
    try {
      await signInWithEmailAndPassword(auth, 'test@nonexistent.com', 'wrongpassword');
    } catch (error) {
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-email') {
        console.log('✅ Auth endpoint reachable (expected auth error)');
      } else if (error.code === 'auth/network-request-failed') {
        console.log('❌ Network request failed - Firebase Auth unreachable');
        console.log('Error details:', error.message);
        return false;
      } else {
        console.log('⚠️ Unexpected auth error:', error.code, error.message);
      }
    }
    
    // Test Firestore endpoint
    try {
      await getDoc(doc(db, 'test', 'connection'));
      console.log('✅ Firestore endpoint reachable');
    } catch (error) {
      if (error.code === 'permission-denied') {
        console.log('✅ Firestore endpoint reachable (expected permission error)');
      } else if (error.code === 'unavailable') {
        console.log('❌ Firestore unavailable - network issue');
        console.log('Error details:', error.message);
        return false;
      } else {
        console.log('⚠️ Unexpected Firestore error:', error.code, error.message);
      }
    }
    
    // Step 5: Test specific configuration issues
    console.log('\n5️⃣ Testing Firebase configuration...');
    
    // Check if API key is valid format
    if (!firebaseConfig.apiKey || !firebaseConfig.apiKey.startsWith('AIza')) {
      console.log('❌ Invalid API key format');
      return false;
    }
    console.log('✅ API key format valid');
    
    // Check project ID
    if (!firebaseConfig.projectId) {
      console.log('❌ Missing project ID');
      return false;
    }
    console.log('✅ Project ID present');
    
    // Check auth domain
    if (!firebaseConfig.authDomain || !firebaseConfig.authDomain.includes('firebaseapp.com')) {
      console.log('❌ Invalid auth domain');
      return false;
    }
    console.log('✅ Auth domain valid');
    
    console.log('\n🎉 Firebase connection test completed successfully!');
    console.log('\n📋 Summary:');
    console.log('- Firebase initialization: ✅');
    console.log('- Auth service: ✅');
    console.log('- Firestore service: ✅');
    console.log('- Network connectivity: ✅');
    console.log('- Configuration: ✅');
    
    return true;
    
  } catch (error) {
    console.log('\n❌ Firebase connection test failed!');
    console.log('Error type:', error.constructor.name);
    console.log('Error code:', error.code);
    console.log('Error message:', error.message);
    
    // Provide specific troubleshooting steps
    console.log('\n🔧 Troubleshooting steps:');
    
    if (error.message.includes('network')) {
      console.log('1. Check your internet connection');
      console.log('2. Try disabling VPN if using one');
      console.log('3. Check if firewall is blocking Firebase domains');
      console.log('4. Try running: ping firebaseapp.com');
    }
    
    if (error.code === 'auth/invalid-api-key') {
      console.log('1. Verify API key in Firebase Console');
      console.log('2. Check if project is active');
      console.log('3. Regenerate API key if needed');
    }
    
    if (error.code === 'auth/app-not-authorized') {
      console.log('1. Enable Authentication in Firebase Console');
      console.log('2. Add your domain to authorized domains');
      console.log('3. Check OAuth settings');
    }
    
    return false;
  }
}

// Run the diagnostic
debugFirebaseConnection().then(success => {
  if (success) {
    console.log('\n✅ Firebase is properly configured and reachable');
  } else {
    console.log('\n❌ Firebase connection issues detected');
  }
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('\n💥 Diagnostic script failed:', error);
  process.exit(1);
});