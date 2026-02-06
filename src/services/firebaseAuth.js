import {
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
  increment,
  Timestamp
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Simplified retry configuration
const RETRY_CONFIG = {
  maxRetries: 2,
  retryDelay: 1500,
  timeoutMs: 15000
};

// Comprehensive function to convert any Firebase timestamp to serializable format
const convertFirebaseTimestamp = (value) => {
  // Handle null/undefined
  if (!value) return new Date().toISOString();

  // If it's already a string, return as is
  if (typeof value === 'string') return value;

  // If it's a Date object
  if (value instanceof Date) return value.toISOString();

  // If it's a Firebase Timestamp object (has seconds and nanoseconds)
  if (value && typeof value === 'object' &&
    (value.seconds !== undefined || value.nanoseconds !== undefined)) {
    try {
      // Convert Firebase Timestamp to Date
      const timestamp = new Timestamp(value.seconds || 0, value.nanoseconds || 0);
      return timestamp.toDate().toISOString();
    } catch (error) {
      console.log('Error converting Firebase timestamp:', error);
      return new Date().toISOString();
    }
  }

  // If it's a Firebase Timestamp instance
  if (value && typeof value.toDate === 'function') {
    try {
      return value.toDate().toISOString();
    } catch (error) {
      console.log('Error converting Firebase timestamp instance:', error);
      return new Date().toISOString();
    }
  }

  // If it's a serverTimestamp placeholder
  if (value && value._methodName === 'serverTimestamp') {
    return new Date().toISOString();
  }

  // If it's an object with type "firestore/timestamp/"
  if (value && typeof value === 'object' && value.type === 'firestore/timestamp/') {
    try {
      const timestamp = new Timestamp(value.seconds || 0, value.nanoseconds || 0);
      return timestamp.toDate().toISOString();
    } catch (error) {
      console.log('Error converting firestore timestamp type:', error);
      return new Date().toISOString();
    }
  }

  // Fallback to current time
  return new Date().toISOString();
};

// Deep clean function to remove all non-serializable values from an object
const deepCleanForRedux = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map(item => deepCleanForRedux(item));
  }

  const cleaned = {};

  for (const [key, value] of Object.entries(obj)) {
    if (value === null || value === undefined) {
      cleaned[key] = value;
    } else if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      cleaned[key] = value;
    } else if (Array.isArray(value)) {
      cleaned[key] = deepCleanForRedux(value);
    } else if (typeof value === 'object') {
      // Check if it's a timestamp-like object
      if (value.seconds !== undefined || value.nanoseconds !== undefined ||
        value._methodName === 'serverTimestamp' ||
        value.type === 'firestore/timestamp/' ||
        (value.toDate && typeof value.toDate === 'function')) {
        cleaned[key] = convertFirebaseTimestamp(value);
      } else {
        // Recursively clean nested objects
        cleaned[key] = deepCleanForRedux(value);
      }
    } else {
      // For any other type, try to convert to string or use fallback
      cleaned[key] = String(value);
    }
  }

  return cleaned;
};

// Simplified network-aware wrapper
const withRetry = async (operation, operationName = 'Firebase operation') => {
  let lastError;

  for (let attempt = 1; attempt <= RETRY_CONFIG.maxRetries; attempt++) {
    try {
      console.log(`🔄 ${operationName} (attempt ${attempt}/${RETRY_CONFIG.maxRetries})`);

      const result = await Promise.race([
        operation(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Operation timeout')), RETRY_CONFIG.timeoutMs)
        )
      ]);

      console.log(`✅ ${operationName} succeeded`);
      return result;

    } catch (error) {
      lastError = error;
      console.log(`❌ ${operationName} failed on attempt ${attempt}:`, error.message);

      // Don't retry for certain errors
      if (error.code === 'auth/user-not-found' ||
        error.code === 'auth/wrong-password' ||
        error.code === 'auth/email-already-in-use' ||
        error.code === 'auth/weak-password' ||
        error.code === 'auth/invalid-email' ||
        error.code === 'auth/invalid-credential') {
        throw error;
      }

      if (attempt < RETRY_CONFIG.maxRetries) {
        console.log(`⏳ Waiting ${RETRY_CONFIG.retryDelay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, RETRY_CONFIG.retryDelay));
      }
    }
  }

  throw lastError;
};

// User data structure for Firestore (with serverTimestamp for Firestore)
const createUserDocumentForFirestore = (user, additionalData = {}) => ({
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

// Enhanced Firebase Auth API
export const firebaseAuthAPI = {
  // Initialize auth state listener with comprehensive timestamp cleaning
  initializeAuthListener: (callback) => {
    try {
      return onAuthStateChanged(auth, async (user) => {
        try {
          if (user) {
            console.log('Auth state changed - user signed in:', user.uid);

            const userDocRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);

            let rawFirestoreData = {};

            if (userDoc.exists()) {
              rawFirestoreData = userDoc.data();
              try {
                await updateDoc(userDocRef, {
                  lastLoginAt: serverTimestamp()
                });
                console.log('✅ Updated lastLoginAt for existing user');
              } catch (updateError) {
                console.log('⚠️ Failed to update lastLoginAt:', updateError.message);
              }
            } else {
              console.log('📝 Creating new user document for:', user.uid);
              const firestoreUserData = createUserDocumentForFirestore(user, {
                registrationMethod: 'existing_auth'
              });

              try {
                await setDoc(userDocRef, firestoreUserData);
                console.log('✅ Created new user document');
                rawFirestoreData = firestoreUserData;
              } catch (createError) {
                console.log('⚠️ Failed to create user document:', createError.message);
                rawFirestoreData = {
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                  lastLoginAt: new Date().toISOString()
                };
              }
            }

            // Create base user data from Firebase Auth
            const baseUserData = {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
              emailVerified: user.emailVerified,
              photoURL: user.photoURL
            };

            // Merge with cleaned Firestore data
            const completeUserData = {
              ...baseUserData,
              ...deepCleanForRedux(rawFirestoreData)
            };

            // Get token safely
            let token = null;
            try {
              token = await user.getIdToken();
            } catch (tokenError) {
              console.log('⚠️ Failed to get ID token:', tokenError.message);
            }

            callback({ user: completeUserData, token });
          } else {
            console.log('Auth state changed - user signed out');
            callback({ user: null, token: null });
          }
        } catch (error) {
          console.error('Error in auth state listener:', error);
          if (user) {
            const fallbackUser = {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
              emailVerified: user.emailVerified,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              lastLoginAt: new Date().toISOString()
            };
            callback({ user: fallbackUser, token: null });
          } else {
            callback({ user: null, token: null });
          }
        }
      });
    } catch (error) {
      console.error('Failed to initialize auth listener:', error);
      return () => { };
    }
  },

  // Enhanced sign in
  signIn: async (email, password) => {
    return withRetry(async () => {
      console.log('🔍 FIREBASE DEBUG: signIn called with:', { email, passwordLength: password.length });

      if (!auth) {
        console.log('🔍 FIREBASE DEBUG: Auth not initialized');
        throw new Error('Firebase authentication is not properly initialized');
      }

      // Normalize email to lowercase
      const normalizedEmail = email.toLowerCase().trim();
      console.log('🔍 FIREBASE DEBUG: Normalized email:', normalizedEmail);

      try {
        console.log('🔍 FIREBASE DEBUG: Calling signInWithEmailAndPassword...');
        const userCredential = await signInWithEmailAndPassword(auth, normalizedEmail, password);
        console.log('🔍 FIREBASE DEBUG: signInWithEmailAndPassword successful');
        const user = userCredential.user;
        console.log('🔍 FIREBASE DEBUG: User object:', {
          uid: user.uid,
          email: user.email,
          emailVerified: user.emailVerified
        });

        const userDocRef = doc(db, 'users', user.uid);
        console.log('🔍 FIREBASE DEBUG: Getting user document...');
        const userDoc = await getDoc(userDocRef);

        let rawFirestoreData = {};

        if (userDoc.exists()) {
          console.log('🔍 FIREBASE DEBUG: User document exists');
          rawFirestoreData = userDoc.data();
          try {
            await updateDoc(userDocRef, {
              lastLoginAt: serverTimestamp()
            });
            console.log('🔍 FIREBASE DEBUG: Updated lastLoginAt');
          } catch (updateError) {
            console.log('🔍 FIREBASE DEBUG: Could not update lastLoginAt:', updateError.message);
          }
        } else {
          console.log('🔍 FIREBASE DEBUG: User document does not exist, creating...');
          const firestoreUserData = createUserDocumentForFirestore(user, {
            registrationMethod: 'sign_in'
          });

          try {
            await setDoc(userDocRef, firestoreUserData);
            console.log('🔍 FIREBASE DEBUG: Created user document during sign in');
            rawFirestoreData = firestoreUserData;
          } catch (createError) {
            console.log('🔍 FIREBASE DEBUG: Could not create user document:', createError.message);
            rawFirestoreData = {
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              lastLoginAt: new Date().toISOString()
            };
          }
        }

        console.log('🔍 FIREBASE DEBUG: Getting ID token...');
        const token = await user.getIdToken();
        console.log('🔍 FIREBASE DEBUG: Got ID token');

        // Create clean user data for Redux
        const baseUserData = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          emailVerified: user.emailVerified
        };

        const cleanUserData = {
          ...baseUserData,
          ...deepCleanForRedux(rawFirestoreData)
        };

        console.log('🔍 FIREBASE DEBUG: Clean user data:', cleanUserData);

        // Store in AsyncStorage
        console.log('🔍 FIREBASE DEBUG: Storing in AsyncStorage...');
        await AsyncStorage.setItem('authToken', token);
        await AsyncStorage.setItem('user', JSON.stringify(cleanUserData));
        console.log('🔍 FIREBASE DEBUG: Stored in AsyncStorage');

        console.log('🔍 FIREBASE DEBUG: Sign-in process completed successfully');
        return {
          data: {
            user: cleanUserData,
            token
          }
        };
      } catch (firebaseError) {
        console.log('🔍 FIREBASE DEBUG: Firebase error occurred:', firebaseError);
        console.log('🔍 FIREBASE DEBUG: Firebase error code:', firebaseError.code);
        console.log('🔍 FIREBASE DEBUG: Firebase error message:', firebaseError.message);
        throw firebaseError;
      }
    }, 'Sign in');
  },

  // Enhanced sign up
  signUp: async (email, password, fullName, phoneNumber = '', city = '', referralCode = '') => {
    return withRetry(async () => {
      if (!auth) {
        throw new Error('Firebase authentication is not properly initialized');
      }

      // Normalize email to lowercase
      const normalizedEmail = email.toLowerCase().trim();

      const existingUsers = await getDocs(
        query(collection(db, 'users'), where('email', '==', normalizedEmail))
      );

      if (!existingUsers.empty) {
        throw new Error('An account with this email already exists');
      }

      // Verify referral code if provided
      let referrerId = null;
      let referrerName = null;
      if (referralCode && referralCode.trim()) {
        const { verifyReferralCode } = require('./referralService');
        const verification = await verifyReferralCode(referralCode.trim());
        if (!verification.valid) {
          throw new Error('Invalid referral code');
        }
        referrerId = verification.referrerId;
        referrerName = verification.referrerName;
        console.log('✅ Valid referral code applied:', referralCode, 'Referrer:', referrerName);
      }

      const userCredential = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: fullName });
      await sendEmailVerification(user);

      // Generate unique referral code for new user
      const { generateReferralCode } = require('../utils/referralUtils');
      let myReferralCode;
      let codeIsUnique = false;
      let attempts = 0;
      const maxAttempts = 5;

      // Ensure referral code is unique
      while (!codeIsUnique && attempts < maxAttempts) {
        myReferralCode = generateReferralCode(fullName);
        const codeQuery = query(collection(db, 'users'), where('myReferralCode', '==', myReferralCode));
        const codeSnapshot = await getDocs(codeQuery);
        codeIsUnique = codeSnapshot.empty;
        attempts++;
      }

      if (!codeIsUnique) {
        // Fallback: add timestamp to ensure uniqueness
        myReferralCode = generateReferralCode(fullName) + '-' + Date.now().toString().slice(-3);
      }

      console.log('✅ Generated unique referral code:', myReferralCode);

      const firestoreUserData = createUserDocumentForFirestore(user, {
        fullName,
        phoneNumber,
        city,
        registrationMethod: 'email',
        // Referral system fields
        myReferralCode,
        referredBy: referrerId,
        referralStatus: referrerId ? 'PENDING' : null,
        walletBalance: 0,
        hasCompletedFirstBooking: false,
        referralHistory: [],
      });

      await setDoc(doc(db, 'users', user.uid), firestoreUserData);

      const token = await user.getIdToken();

      // Create clean user data for Redux
      const baseUserData = {
        uid: user.uid,
        email: normalizedEmail,
        displayName: fullName,
        emailVerified: user.emailVerified
      };

      const cleanUserData = {
        ...baseUserData,
        ...deepCleanForRedux(firestoreUserData),
        fullName,
        phoneNumber,
        city
      };

      await AsyncStorage.setItem('authToken', token);
      await AsyncStorage.setItem('user', JSON.stringify(cleanUserData));

      let message = 'Account created successfully! Please check your email for verification.';
      if (referrerId) {
        message += ` You have Rs. 300 off your first booking!`;
      }

      return {
        data: {
          user: cleanUserData,
          token,
          message
        }
      };
    }, 'Sign up');
  },

  // Google Sign In
  googleSignIn: async (googleToken) => {
    return withRetry(async () => {
      const credential = GoogleAuthProvider.credential(googleToken);
      const userCredential = await signInWithCredential(auth, credential);
      const user = userCredential.user;

      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      let rawFirestoreData;

      if (!userDoc.exists()) {
        rawFirestoreData = createUserDocumentForFirestore(user, {
          registrationMethod: 'google',
          isEmailVerified: user.emailVerified
        });
        await setDoc(userDocRef, rawFirestoreData);
      } else {
        rawFirestoreData = userDoc.data();
        try {
          await updateDoc(userDocRef, {
            lastLoginAt: serverTimestamp(),
            profilePicture: user.photoURL || rawFirestoreData.profilePicture
          });
        } catch (updateError) {
          console.log('⚠️ Could not update user data:', updateError.message);
        }
      }

      const token = await user.getIdToken();

      const baseUserData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        emailVerified: user.emailVerified,
        photoURL: user.photoURL
      };

      const cleanUserData = {
        ...baseUserData,
        ...deepCleanForRedux(rawFirestoreData)
      };

      await AsyncStorage.setItem('authToken', token);
      await AsyncStorage.setItem('user', JSON.stringify(cleanUserData));

      return {
        data: {
          user: cleanUserData,
          token
        }
      };
    }, 'Google sign in');
  },

  // Enhanced sign out
  signOut: async () => {
    try {
      await signOut(auth);
      await AsyncStorage.multiRemove(['authToken', 'user']);
      return { data: { message: 'Signed out successfully' } };
    } catch (error) {
      console.error('Sign out error:', error);
      throw new Error('Failed to sign out');
    }
  },

  // Enhanced forgot password
  forgotPassword: async (email) => {
    return withRetry(async () => {
      // Normalize email to lowercase
      const normalizedEmail = email.toLowerCase().trim();
      await sendPasswordResetEmail(auth, normalizedEmail);
      return { data: { message: 'Password reset email sent successfully' } };
    }, 'Forgot password');
  },

  // Enhanced profile update
  updateProfile: async (userData) => {
    return withRetry(async () => {
      const user = auth.currentUser;
      if (!user) throw new Error('No authenticated user');

      if (userData.displayName && userData.displayName !== user.displayName) {
        await updateProfile(user, { displayName: userData.displayName });
      }

      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const updateData = {
          ...userData,
          updatedAt: serverTimestamp()
        };
        await updateDoc(userDocRef, updateData);
      } else {
        const newUserData = createUserDocumentForFirestore(user, userData);
        await setDoc(userDocRef, newUserData);
      }

      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        const updatedUser = deepCleanForRedux({
          ...parsedUser,
          ...userData,
          updatedAt: new Date().toISOString()
        });
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      }

      return { data: { message: 'Profile updated successfully' } };
    }, 'Update profile');
  },

  // Change password
  changePassword: async (currentPassword, newPassword) => {
    return withRetry(async () => {
      const user = auth.currentUser;
      if (!user) throw new Error('No authenticated user');

      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);

      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        try {
          await updateDoc(userDocRef, {
            updatedAt: serverTimestamp()
          });
        } catch (updateError) {
          console.log('⚠️ Could not update user document after password change');
        }
      }

      return { data: { message: 'Password changed successfully' } };
    }, 'Change password');
  },

  // Resend email verification
  resendEmailVerification: async () => {
    return withRetry(async () => {
      const user = auth.currentUser;
      if (!user) throw new Error('No authenticated user');

      await sendEmailVerification(user);
      return { data: { message: 'Verification email sent successfully' } };
    }, 'Resend verification');
  },

  // Verify token
  verifyToken: async (token) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        return { data: null };
      }

      const currentToken = await user.getIdToken(true);

      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      const rawFirestoreData = userDoc.exists() ? userDoc.data() : {};

      const baseUserData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        emailVerified: user.emailVerified
      };

      const cleanUserData = {
        ...baseUserData,
        ...deepCleanForRedux(rawFirestoreData)
      };

      return {
        data: {
          user: cleanUserData,
          token: currentToken
        }
      };
    } catch (error) {
      console.error('Verify token error:', error);
      return { data: null };
    }
  },

  // Get user profile
  getUserProfile: async (uid) => {
    return withRetry(async () => {
      const userDocRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        throw new Error('User document not found');
      }

      const rawFirestoreData = userDoc.data();
      const cleanUserData = deepCleanForRedux(rawFirestoreData);

      return { data: cleanUserData };
    }, 'Get user profile');
  },

  // Helper function to get user-friendly error messages
  getErrorMessage: (errorCode) => {
    const errorMessages = {
      'auth/network-request-failed': 'Please check your internet connection and try again.',
      'auth/too-many-requests': 'Too many attempts. Please wait a few minutes and try again.',
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

    return errorMessages[errorCode] || `Authentication error: ${errorCode || 'Unknown error'}. Please try again.`;
  }
};

// Export current user helper
export const getCurrentUser = () => auth?.currentUser || null;

// Export auth state listener
export const onAuthStateChange = (callback) => {
  if (!auth) {
    console.error('Auth not initialized');
    return () => { };
  }
  return onAuthStateChanged(auth, callback);
};
