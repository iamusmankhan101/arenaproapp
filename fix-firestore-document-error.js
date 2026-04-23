// Fix for Firestore document update error in auth state listener
const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing Firestore Document Update Error...\n');

// Update the auth service to handle missing user documents properly
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
import { auth, db } from '../config/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Simplified retry configuration
const RETRY_CONFIG = {
  maxRetries: 2,
  retryDelay: 1500,
  timeoutMs: 15000
};

// Simplified network-aware wrapper
const withRetry = async (operation, operationName = 'Firebase operation') => {
  let lastError;
  
  for (let attempt = 1; attempt <= RETRY_CONFIG.maxRetries; attempt++) {
    try {
      console.log(\`🔄 \${operationName} (attempt \${attempt}/\${RETRY_CONFIG.maxRetries})\`);
      
      // Execute the operation with timeout
      const result = await Promise.race([
        operation(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Operation timeout')), RETRY_CONFIG.timeoutMs)
        )
      ]);
      
      console.log(\`✅ \${operationName} succeeded\`);
      return result;
      
    } catch (error) {
      lastError = error;
      console.log(\`❌ \${operationName} failed on attempt \${attempt}:\`, error.message);
      
      // Don't retry for certain errors
      if (error.code === 'auth/user-not-found' || 
          error.code === 'auth/wrong-password' ||
          error.code === 'auth/email-already-in-use' ||
          error.code === 'auth/weak-password' ||
          error.code === 'auth/invalid-email' ||
          error.code === 'auth/invalid-credential') {
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
  throw lastError;
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

// Enhanced Firebase Auth API
export const firebaseAuthAPI = {
  // Initialize auth state listener with proper document handling
  initializeAuthListener: (callback) => {
    try {
      return onAuthStateChanged(auth, async (user) => {
        try {
          if (user) {
            console.log('Auth state changed - user signed in:', user.uid);
            
            // Check if user document exists first
            const userDocRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);
            
            let userData = {};
            
            if (userDoc.exists()) {
              // Document exists, safe to update
              userData = userDoc.data();
              try {
                await updateDoc(userDocRef, {
                  lastLoginAt: serverTimestamp()
                });
                console.log('✅ Updated lastLoginAt for existing user');
              } catch (updateError) {
                console.log('⚠️ Failed to update lastLoginAt:', updateError.message);
                // Continue without failing - this is not critical
              }
            } else {
              // Document doesn't exist, create it
              console.log('📝 Creating new user document for:', user.uid);
              userData = createUserDocument(user, {
                registrationMethod: 'existing_auth'
              });
              
              try {
                await setDoc(userDocRef, userData);
                console.log('✅ Created new user document');
              } catch (createError) {
                console.log('⚠️ Failed to create user document:', createError.message);
                // Use basic user data if document creation fails
                userData = {
                  uid: user.uid,
                  email: user.email,
                  displayName: user.displayName,
                  fullName: user.displayName || '',
                  createdAt: new Date().toISOString()
                };
              }
            }
            
            const completeUser = {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
              emailVerified: user.emailVerified,
              photoURL: user.photoURL,
              ...userData
            };
            
            // Get token safely
            let token = null;
            try {
              token = await user.getIdToken();
            } catch (tokenError) {
              console.log('⚠️ Failed to get ID token:', tokenError.message);
            }
            
            callback({ user: completeUser, token });
          } else {
            console.log('Auth state changed - user signed out');
            callback({ user: null, token: null });
          }
        } catch (error) {
          console.error('Error in auth state listener:', error);
          // Don't fail completely - provide fallback
          if (user) {
            callback({ 
              user: {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                emailVerified: user.emailVerified
              }, 
              token: null 
            });
          } else {
            callback({ user: null, token: null });
          }
        }
      });
    } catch (error) {
      console.error('Failed to initialize auth listener:', error);
      return () => {};
    }
  },

  // Enhanced sign in
  signIn: async (email, password) => {
    return withRetry(async () => {
      if (!auth) {
        throw new Error('Firebase authentication is not properly initialized');
      }

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Check if user document exists, create if not
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      let userData = {};
      
      if (userDoc.exists()) {
        userData = userDoc.data();
        // Update last login time safely
        try {
          await updateDoc(userDocRef, {
            lastLoginAt: serverTimestamp()
          });
        } catch (updateError) {
          console.log('⚠️ Could not update lastLoginAt:', updateError.message);
        }
      } else {
        // Create user document if it doesn't exist
        userData = createUserDocument(user, {
          registrationMethod: 'sign_in'
        });
        
        try {
          await setDoc(userDocRef, userData);
          console.log('✅ Created user document during sign in');
        } catch (createError) {
          console.log('⚠️ Could not create user document:', createError.message);
          // Use basic data if creation fails
          userData = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            fullName: user.displayName || ''
          };
        }
      }
      
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

  // Enhanced sign up
  signUp: async (email, password, fullName, phoneNumber = '', city = '') => {
    return withRetry(async () => {
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

  // Google Sign In
  googleSignIn: async (googleToken) => {
    return withRetry(async () => {
      const credential = GoogleAuthProvider.credential(googleToken);
      const userCredential = await signInWithCredential(auth, credential);
      const user = userCredential.user;
      
      // Check if user document exists
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      let userData;
      
      if (!userDoc.exists()) {
        // Create new user document for Google sign-in
        userData = createUserDocument(user, {
          registrationMethod: 'google',
          isEmailVerified: user.emailVerified
        });
        await setDoc(userDocRef, userData);
      } else {
        // Update existing user data
        userData = userDoc.data();
        try {
          await updateDoc(userDocRef, {
            lastLoginAt: serverTimestamp(),
            profilePicture: user.photoURL || userData.profilePicture
          });
        } catch (updateError) {
          console.log('⚠️ Could not update user data:', updateError.message);
        }
      }
      
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
            photoURL: user.photoURL,
            ...userData
          },
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
      await sendPasswordResetEmail(auth, email);
      return { data: { message: 'Password reset email sent successfully' } };
    }, 'Forgot password');
  },

  // Enhanced profile update
  updateProfile: async (userData) => {
    return withRetry(async () => {
      const user = auth.currentUser;
      if (!user) throw new Error('No authenticated user');
      
      // Update Firebase Auth profile if display name changed
      if (userData.displayName && userData.displayName !== user.displayName) {
        await updateProfile(user, { displayName: userData.displayName });
      }
      
      // Update Firestore document safely
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        // Document exists, safe to update
        const updateData = {
          ...userData,
          updatedAt: serverTimestamp()
        };
        await updateDoc(userDocRef, updateData);
      } else {
        // Document doesn't exist, create it
        const newUserData = createUserDocument(user, userData);
        await setDoc(userDocRef, newUserData);
      }
      
      // Update AsyncStorage
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        const updatedUser = { ...parsedUser, ...userData };
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
      
      // Re-authenticate user
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      
      // Update password
      await updatePassword(user, newPassword);
      
      // Update user document safely
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
      
      // Verify token is still valid
      const currentToken = await user.getIdToken(true);
      
      // Get user data safely
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
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
    } catch (error) {
      console.error('Verify token error:', error);
      return { data: null };
    }
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
    
    return errorMessages[errorCode] || \`Authentication error: \${errorCode || 'Unknown error'}. Please try again.\`;
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
console.log('✅ Updated Firebase Auth service with proper document handling');

console.log('\n🎉 Firestore Document Error Fixed!');
console.log('\n📋 What was fixed:');
console.log('1. Added proper document existence checks before updates');
console.log('2. Create user documents if they don\'t exist');
console.log('3. Safe error handling for document operations');
console.log('4. Fallback user data if document operations fail');
console.log('5. Proper logging for debugging');

console.log('\n🔧 The error should now be resolved:');
console.log('- No more "No document to update" errors');
console.log('- User documents created automatically when needed');
console.log('- Safe handling of missing documents');
console.log('- Better error recovery and logging');