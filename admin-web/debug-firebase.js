// Debug Firebase configuration
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyA7G3uLmKNCDhiyTuwK6GBbTxRJFvmGNpY",
  authDomain: "arena-pro-97b5f.firebaseapp.com",
  projectId: "arena-pro-97b5f",
  storageBucket: "arena-pro-97b5f.firebasestorage.app",
  messagingSenderId: "960416327217",
  appId: "1:960416327217:android:bc3d63f865bef8be8f5710"
};

console.log('🔥 Debug: Testing Firebase configuration...');

try {
  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  console.log('✅ Firebase app initialized:', app);
  
  // Initialize Firestore
  const db = getFirestore(app);
  console.log('✅ Firestore initialized:', db);
  console.log('🔍 DB type:', typeof db);
  console.log('🔍 DB constructor:', db.constructor.name);
  
  // Test collection reference
  const turfsRef = collection(db, 'turfs');
  console.log('✅ Collection reference created:', turfsRef);
  
  // Test reading data
  getDocs(turfsRef).then(snapshot => {
    console.log('✅ Successfully read from Firestore');
    console.log('📊 Documents found:', snapshot.size);
  }).catch(error => {
    console.error('❌ Error reading from Firestore:', error);
  });
  
} catch (error) {
  console.error('❌ Firebase initialization failed:', error);
}

console.log('🔍 Debug complete - check console for results');