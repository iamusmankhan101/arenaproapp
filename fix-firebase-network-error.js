// Firebase Network Error Fix for React Native
// This script will update Firebase configuration and authentication service to handle network issues

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing Firebase Network Error...\n');

// 1. Update Firebase configuration with better error handling
const firebaseConfigContent = `import { initializeApp } from 'firebase/app';
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
`;

// Write the updated Firebase config
fs.writeFileSync(path.join(__dirname, 'src/config/firebase.js'), firebaseConfigContent);
console.log('✅ Updated Firebase configuration with network error handling');

// 2. Update Firebase Auth service with better network handling
const authServiceContent = `import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithCredential,
  sendEmailVerification,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  onAuthStateChanged
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  serverTimestamp,
  increment
} from 'firebase/firestore';
import { auth, db, checkNetworkConnection, testFirebaseConnection } from '../config/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Network retry configuration
const RETRY_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000, // 1 second
  timeoutMs: 10000  // 10 seconds
};

// Network-aware wrapper for Firebase operations
const withNetworkRetry = async (operation, operationName = 'Firebase operation') => {
  let lastError;
  
  for (let attempt = 1; attempt <= RETRY_CONFIG.maxRetries; attempt++) {
    try {
      console.log(\`🔄 Attempting \${operationName} (attempt \${attempt}/\${RETRY_CONFIG.maxRetries})\`);
      
      // Check network connection first
      const hasNetwork = await checkNetworkConnection();
      if (!hasNetwork) {
        throw new Error('No internet connection detected');
      }
      
      // Test Firebase connection
      const firebaseConnected = await testFirebaseConnection();
      if (!firebaseConnected && attempt === 1) {
        console.log('⚠️ Firebase connection test failed, but continuing...');
      }
      
      // Execute the operation with timeout
      const result = await Promise.race([
        operation(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Operation timeout')), RETRY_CONFIG.timeoutMs)
        )
      ]);
      
      console.log(\`✅ \${operationName} succeeded on attempt \${attempt}\`);
      return result;
      
    } catch (error) {
      lastError = error;
      console.log(\`❌ \${operationName} failed on attempt \${attempt}:\`, error.message);
      
      // Don't retry for certain errors
      if (error.code === 'auth/user-not-found' || 
          error.code === 'auth/wrong-password' ||
          error.code === 'auth/email-already-in-use' ||
          error.code === 'auth/weak-password' ||
          error.code === 'auth/invalid-email') {
        throw error;
      }
      
      // Wait before retry (except on last attempt)
      if (attempt < RETRY_CONFIG.maxRetries) {
        console.log(\`⏳ Waiting \${RETRY_CONFIG.retryDelay}ms before retry...\`);
        await new Promise(resolve => setTimeout(resolve, RETRY_CONFIG.retryDelay));
      }
    }
  }
  
  // All retries failed
  throw new Error(\`\${operationName} failed after \${RETRY_CONFIG.maxRetries} attempts: \${lastError.message}\`);
};

// User data structure for Firestore
const createUserDocument = (user, additionalData = {}) => ({
  uid: user.uid,
  email: user.email,
  displayName: user.displayName || additionalData.fullName || '',
  fullName: additionalData.fullName || user.displayName || '',
  phoneNumber: additionalData.phoneNumber || '',
  city: additionalData.city || '',
  area: additionalData.area || '',
  profilePicture: user.photoURL || '',
  isEmailVerified: user.emailVerified,
  isPhoneVerified: false,
  accountStatus: 'active',
  userType: 'customer',
  preferences: {
    notifications: {
      email: true,
      push: true,
      sms: false
    },
    privacy: {
      showProfile: true,
      showBookingHistory: false
    }
  },
  stats: {
    totalBookings: 0,
    totalSpent: 0,
    favoriteVenues: [],
    joinedChallenges: 0
  },
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
  lastLoginAt: serverTimestamp(),
  ...additionalData
});

// Enhanced Firebase Auth API with network retry
export const firebaseAuthAPI = {
  // Initialize auth state listener with network handling
  initializeAuthListener: (callback) => {
    return withNetworkRetry(async () => {
      return onAuthStateChanged(auth, async (user) => {
        try {
          if (user) {
            // Update last login time
            await updateDoc(doc(db, 'users', user.uid), {
              lastLoginAt: serverTimestamp()
            });
            
            // Get complete user data from Firestore
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            const userData = userDoc.exists() ? userDoc.data() : {};
            
            const completeUser = {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
              emailVerified: user.emailVerified,
              photoURL: user.photoURL,
              ...userData
            };
            
            callback({ user: completeUser, token: await user.getIdToken() });
          } else {
            callback({ user: null, token: null });
          }
        } catch (error) {
          console.error('Error in auth state listener:', error);
          callback({ user: null, token: null });
        }
      });
    }, 'Initialize auth listener').catch(error => {
      console.error('Failed to initialize auth listener:', error);
      // Return a dummy unsubscribe function
      return () => {};
    });
  },

  // Enhanced sign in with network retry
  signIn: async (email, password) => {
    return withNetworkRetry(async () => {
      // Verify Firebase is properly initialized
      if (!auth) {
        throw new Error('Firebase authentication is not properly initialized');
      }

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update last login time
      await updateDoc(doc(db, 'users', user.uid), {
        lastLoginAt: serverTimestamp()
      });
      
      // Get additional user data from Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.exists() ? userDoc.data() : {};
      
      const token = await user.getIdToken();
      
      // Store in AsyncStorage
      await AsyncStorage.setItem('authToken', token);
      await AsyncStorage.setItem('user', JSON.stringify({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        ...userData
      }));
      
      return {
        data: {
          user: {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            emailVerified: user.emailVerified,
            ...userData
          },
          token
        }
      };
    }, 'Sign in');
  },

  // Enhanced sign up with network retry
  signUp: async (email, password, fullName, phoneNumber = '', city = '') => {
    return withNetworkRetry(async () => {
      // Verify Firebase is properly initialized
      if (!auth) {
        throw new Error('Firebase authentication is not properly initialized');
      }

      // Check if email already exists
      const existingUsers = await getDocs(
        query(collection(db, 'users'), where('email', '==', email))
      );
      
      if (!existingUsers.empty) {
        throw new Error('An account with this email already exists');
      }
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update Firebase Auth profile
      await updateProfile(user, { displayName: fullName });
      
      // Send email verification
      await sendEmailVerification(user);
      
      // Create comprehensive user document in Firestore
      const userData = createUserDocument(user, {
        fullName,
        phoneNumber,
        city,
        registrationMethod: 'email'
      });
      
      await setDoc(doc(db, 'users', user.uid), userData);
      
      const token = await user.getIdToken();
      
      // Store in AsyncStorage
      await AsyncStorage.setItem('authToken', token);
      await AsyncStorage.setItem('user', JSON.stringify({
        uid: user.uid,
        email: user.email,
        displayName: fullName,
        ...userData
      }));
      
      return {
        data: {
          user: {
            uid: user.uid,
            email: user.email,
            displayName: fullName,
            emailVerified: user.emailVerified,
            ...userData
          },
          token,
          message: 'Account created successfully! Please check your email for verification.'
        }
      };
    }, 'Sign up');
  },

  // Enhanced forgot password with network retry
  forgotPassword: async (email) => {
    return withNetworkRetry(async () => {
      await sendPasswordResetEmail(auth, email);
      return { data: { message: 'Password reset email sent successfully' } };
    }, 'Forgot password');
  },

  // Enhanced sign out
  signOut: async () => {
    return withNetworkRetry(async () => {
      await signOut(auth);
      await AsyncStorage.multiRemove(['authToken', 'user']);
      return { data: { message: 'Signed out successfully' } };
    }, 'Sign out');
  },

  // Verify token with network retry
  verifyToken: async (token) => {
    return withNetworkRetry(async () => {
      const user = auth.currentUser;
      if (!user) {
        return { data: null };
      }
      
      // Verify token is still valid
      const currentToken = await user.getIdToken(true);
      
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.exists() ? userDoc.data() : {};
      
      return {
        data: {
          user: {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            emailVerified: user.emailVerified,
            ...userData
          },
          token: currentToken
        }
      };
    }, 'Verify token').catch(error => {
      console.error('Verify token error:', error);
      return { data: null };
    });
  },

  // Helper function to get user-friendly error messages
  getErrorMessage: (errorCode) => {
    const errorMessages = {
      'auth/network-request-failed': 'Network error. Please check your internet connection and try again.',
      'auth/too-many-requests': 'Too many failed attempts. Please wait a few minutes and try again.',
      'auth/user-not-found': 'No account found with this email address',
      'auth/wrong-password': 'Incorrect password',
      'auth/email-already-in-use': 'An account with this email already exists',
      'auth/weak-password': 'Password should be at least 6 characters long',
      'auth/invalid-email': 'Please enter a valid email address',
      'auth/user-disabled': 'This account has been disabled',
      'auth/invalid-credential': 'Invalid credentials provided',
      'auth/operation-not-allowed': 'This operation is not allowed. Please contact support.',
      'auth/configuration-not-found': 'Firebase configuration error. Please check your setup.',
      'auth/invalid-api-key': 'Invalid Firebase API key. Please check your configuration.',
      'auth/app-not-authorized': 'This app is not authorized to use Firebase Authentication.',
      'auth/invalid-user-token': 'User token is invalid. Please sign in again.',
      'auth/user-token-expired': 'User token has expired. Please sign in again.'
    };
    
    return errorMessages[errorCode] || \`Authentication error: \${errorCode || 'Network or connection issue'}. Please check your internet connection and try again.\`;
  }
};

// Export current user helper
export const getCurrentUser = () => auth?.currentUser || null;

// Export auth state listener
export const onAuthStateChange = (callback) => {
  if (!auth) {
    console.error('Auth not initialized');
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
};
`;

// Write the updated auth service
fs.writeFileSync(path.join(__dirname, 'src/services/firebaseAuth.js'), authServiceContent);
console.log('✅ Updated Firebase Auth service with network retry logic');

console.log('\n🎉 Firebase network error fix completed!');
console.log('\n📋 Changes made:');
console.log('1. Enhanced Firebase configuration with better error handling');
console.log('2. Added network connectivity checks');
console.log('3. Implemented retry logic for network operations');
console.log('4. Added timeout handling for Firebase operations');
console.log('5. Improved error messages for network issues');

console.log('\n🔧 Next steps:');
console.log('1. Restart your React Native development server');
console.log('2. Clear app cache if needed');
console.log('3. Test authentication with the improved error handling');