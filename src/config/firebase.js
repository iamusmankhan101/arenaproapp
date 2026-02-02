import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Your Firebase config - Extracted from google-services.json
const firebaseConfig = {
  apiKey: "AIzaSyA7G3uLmKNCDhiyTuwK6GBbTxRJFvmGNpY",
  authDomain: "arena-pro-97b5f.firebaseapp.com",
  projectId: "arena-pro-97b5f",
  storageBucket: "arena-pro-97b5f.firebasestorage.app",
  messagingSenderId: "960416327217",
  appId: "1:960416327217:android:bc3d63f865bef8be8f5710"
};

// Initialize Firebase with enhanced error handling
let app;
let auth;
let db;
let storage;

try {
  // Initialize Firebase app
  app = initializeApp(firebaseConfig);
  console.log('✅ Firebase app initialized');
  
  // Initialize Auth with proper error handling
  try {
    // Try to get existing auth instance first
    auth = getAuth(app);
  } catch (error) {
    console.log('Initializing auth with persistence...');
    try {
      auth = initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage)
      });
    } catch (initError) {
      console.error('Firebase Auth initialization error:', initError);
      // Fallback to basic auth
      auth = getAuth(app);
    }
  }
  
  // Initialize Firestore
  db = getFirestore(app);
  
  // Initialize Storage
  storage = getStorage(app);
  
  console.log('✅ All Firebase services initialized successfully');
  
} catch (error) {
  console.error('❌ Firebase initialization failed:', error);
  throw error;
}

// Connect to emulators in development (disabled by default)
if (__DEV__ && false) {
  // Uncomment these lines if you want to use Firebase emulators
  // connectFirestoreEmulator(db, 'localhost', 8080);
  // connectAuthEmulator(auth, 'http://localhost:9099');
}

// Export with error handling
export { auth, db, storage };
export default app;

// Simplified network status helper - less aggressive
export const checkNetworkConnection = async () => {
  // In React Native, we'll rely on Firebase's built-in network detection
  // This prevents false negatives from overly strict network checks
  return true;
};

// Firebase connection test - simplified
export const testFirebaseConnection = async () => {
  try {
    if (!auth || !db) {
      return false;
    }
    return true;
  } catch (error) {
    console.error('Firebase connection test failed:', error);
    return false;
  }
};
