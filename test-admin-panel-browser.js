// Test Admin Panel in Browser - Console Script
// Copy and paste this into the browser console on the admin panel bookings page

console.log('🧪 TESTING ADMIN PANEL IN BROWSER');
console.log('==================================');

// Check if Redux store is available
if (window.__REDUX_DEVTOOLS_EXTENSION__) {
  console.log('✅ Redux DevTools available');
} else {
  console.log('⚠️ Redux DevTools not available');
}

// Check current Redux state
try {
  const state = window.store?.getState?.() || {};
  console.log('📊 Current Redux State:');
  console.log('  Admin State:', state.admin);
  console.log('  Bookings:', state.admin?.bookings);
  console.log('  Bookings Loading:', state.admin?.bookingsLoading);
  console.log('  Bookings Error:', state.admin?.bookingsError);
} catch (error) {
  console.log('❌ Could not access Redux state:', error.message);
}

// Check if fetch requests are being made
console.log('🔍 Monitoring network requests...');
const originalFetch = window.fetch;
window.fetch = function(...args) {
  console.log('🌐 Fetch request:', args[0]);
  return originalFetch.apply(this, arguments)
    .then(response => {
      console.log('📡 Fetch response:', response.status, response.url);
      return response;
    })
    .catch(error => {
      console.log('❌ Fetch error:', error);
      throw error;
    });
};

// Check if Firebase is initialized
try {
  if (window.firebase) {
    console.log('✅ Firebase available');
  } else {
    console.log('⚠️ Firebase not available on window');
  }
} catch (error) {
  console.log('❌ Firebase check error:', error.message);
}

// Manual API test
console.log('🧪 Testing manual API call...');
async function testManualAPICall() {
  try {
    // This should match the workingFirebaseAPI.js implementation
    const { initializeApp } = await import('https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js');
    const { getFirestore, collection, getDocs } = await import('https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js');
    
    const firebaseConfig = {
      apiKey: "AIzaSyA7G3uLmKNCDhiyTuwK6GBbTxRJFvmGNpY",
      authDomain: "arena-pro-97b5f.firebaseapp.com",
      projectId: "arena-pro-97b5f",
      storageBucket: "arena-pro-97b5f.firebasestorage.app",
      messagingSenderId: "960416327217",
      appId: "1:960416327217:android:bc3d63f865bef8be8f5710"
    };
    
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    const bookingsRef = collection(db, 'bookings');
    const snapshot = await getDocs(bookingsRef);
    
    console.log('📊 Manual API test result:', snapshot.size, 'bookings found');
    
    snapshot.forEach((doc) => {
      console.log('📋 Booking:', doc.id, doc.data());
    });
    
  } catch (error) {
    console.log('❌ Manual API test failed:', error);
  }
}

// Run manual test
testManualAPICall();

console.log('');
console.log('🔧 TROUBLESHOOTING CHECKLIST:');
console.log('=============================');
console.log('1. Check browser console for errors');
console.log('2. Check Network tab for failed requests');
console.log('3. Try hard refresh (Ctrl+F5)');
console.log('4. Clear browser cache and cookies');
console.log('5. Check if admin panel is using correct API endpoint');
console.log('6. Verify Firebase configuration');
console.log('');
console.log('📋 NEXT STEPS:');
console.log('==============');
console.log('1. Open browser DevTools (F12)');
console.log('2. Go to Console tab');
console.log('3. Paste this script and run it');
console.log('4. Check the output for errors');
console.log('5. Go to Network tab and refresh the page');
console.log('6. Look for API calls to Firebase or admin endpoints');