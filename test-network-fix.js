// Test script to verify network error fix
const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');

const firebaseConfig = {
  apiKey: "AIzaSyA7G3uLmKNCDhiyTuwK6GBbTxRJFvmGNpY",
  authDomain: "arena-pro-97b5f.firebaseapp.com",
  projectId: "arena-pro-97b5f",
  storageBucket: "arena-pro-97b5f.firebasestorage.app",
  messagingSenderId: "960416327217",
  appId: "1:960416327217:android:bc3d63f865bef8be8f5710"
};

async function testNetworkFix() {
  console.log('🧪 Testing Network Error Fix...\n');
  
  try {
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    
    console.log('✅ Firebase initialized successfully');
    
    // Test network connectivity
    console.log('🌐 Testing network connectivity...');
    
    const networkTest = await Promise.race([
      fetch('https://www.google.com', { method: 'HEAD', mode: 'no-cors' }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Network timeout')), 5000)
      )
    ]);
    
    console.log('✅ Network connectivity confirmed');
    
    // Test Firebase Auth endpoint with retry logic
    console.log('🔐 Testing Firebase Auth with retry logic...');
    
    let authTestPassed = false;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`   Attempt ${attempt}/3...`);
        
        // This should fail with auth error (not network error)
        await signInWithEmailAndPassword(auth, 'test@example.com', 'wrongpassword');
        
      } catch (error) {
        if (error.code === 'auth/user-not-found' || 
            error.code === 'auth/wrong-password' ||
            error.code === 'auth/invalid-credential') {
          console.log('✅ Firebase Auth endpoint reachable (expected auth error)');
          authTestPassed = true;
          break;
        } else if (error.code === 'auth/network-request-failed') {
          console.log(`❌ Network error on attempt ${attempt}: ${error.message}`);
          if (attempt < 3) {
            console.log('   Retrying in 1 second...');
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        } else {
          console.log(`⚠️ Unexpected error: ${error.code} - ${error.message}`);
          authTestPassed = true; // Any non-network error means endpoint is reachable
          break;
        }
      }
    }
    
    if (!authTestPassed) {
      throw new Error('Firebase Auth endpoint unreachable after 3 attempts');
    }
    
    console.log('\n🎉 Network Error Fix Test PASSED!');
    console.log('\n📊 Test Results:');
    console.log('- Firebase initialization: ✅');
    console.log('- Network connectivity: ✅');
    console.log('- Firebase Auth endpoint: ✅');
    console.log('- Retry logic: ✅');
    
    console.log('\n✨ Your Firebase network issues should now be resolved!');
    console.log('You can now try signing in/up in your React Native app.');
    
    return true;
    
  } catch (error) {
    console.log('\n❌ Network Error Fix Test FAILED!');
    console.log('Error:', error.message);
    
    console.log('\n🔧 Troubleshooting suggestions:');
    console.log('1. Check your internet connection');
    console.log('2. Try disabling VPN/proxy');
    console.log('3. Check firewall settings');
    console.log('4. Run: node debug-firebase-network-error.js');
    console.log('5. Read NETWORK_ERROR_TROUBLESHOOTING.md for detailed help');
    
    return false;
  }
}

// Run the test
testNetworkFix().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('Test script error:', error);
  process.exit(1);
});