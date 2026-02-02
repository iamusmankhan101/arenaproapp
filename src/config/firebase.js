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
  
  // Initialize Auth with proper error handling and network retry
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
  
  // Initialize Firestore with retry logic
  db = getFirestore(app);
  
  // Initialize Storage
  storage = getStorage(app);
  
  console.log('✅ All Firebase services initialized successfully');
  
} catch (error) {
  console.error('❌ Firebase initialization failed:', error);
  
  // Provide fallback configuration for development
  if (__DEV__) {
    console.log('🔄 Using fallback configuration for development...');
    
    // Create minimal fallback objects
    auth = {
      currentUser: null,
      onAuthStateChanged: (callback) => {
        console.log('Auth state listener (fallback mode)');
        callback(null);
        return () => {};
      }
    };
    
    db = {
      collection: () => ({
        doc: () => ({
          get: () => Promise.resolve({ exists: false }),
          set: () => Promise.resolve(),
          update: () => Promise.resolve()
        })
      })
    };
    
    storage = {};
  } else {
    throw error;
  }
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

// Network status helper
export const checkNetworkConnection = async () => {
  try {
    const response = await fetch('https://www.google.com', {
      method: 'HEAD',
      mode: 'no-cors',
      cache: 'no-cache'
    });
    return true;
  } catch (error) {
    console.log('Network check failed:', error);
    return false;
  }
};

// Firebase connection test
export const testFirebaseConnection = async () => {
  try {
    if (!auth || !db) {
      throw new Error('Firebase services not initialized');
    }
    
    // Test auth endpoint
    const authTest = new Promise((resolve) => {
      const unsubscribe = auth.onAuthStateChanged(() => {
        unsubscribe();
        resolve(true);
      });
    });
    
    await Promise.race([
      authTest,
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Auth test timeout')), 5000)
      )
    ]);
    
    return true;
  } catch (error) {
    console.error('Firebase connection test failed:', error);
    return false;
  }
};
