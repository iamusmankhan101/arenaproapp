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
  increment
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  accountStatus: 'active', // active, suspended, pending
  userType: 'customer', // customer, admin, venue_owner
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
  // Initialize auth state listener
  initializeAuthListener: (callback) => {
    return onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
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
        } catch (error) {
          console.error('Error updating user login:', error);
          callback({ user: null, token: null });
        }
      } else {
        callback({ user: null, token: null });
      }
    });
  },

  // Enhanced sign in with email/password
  signIn: async (email, password) => {
    try {
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
    } catch (error) {
      console.error('Sign in error:', error);
      const errorMessage = error?.code ? 
        firebaseAuthAPI.getErrorMessage(error.code) : 
        error?.message || 'Failed to sign in. Please try again.';
      throw new Error(errorMessage);
    }
  },

  // Enhanced sign up with email/password
  signUp: async (email, password, fullName, phoneNumber = '', city = '') => {
    try {
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
    } catch (error) {
      console.error('Sign up error:', error);
      const errorMessage = error?.code ? 
        firebaseAuthAPI.getErrorMessage(error.code) : 
        error?.message || 'Failed to create account. Please try again.';
      throw new Error(errorMessage);
    }
  },

  // Google Sign In with enhanced user data
  googleSignIn: async (googleToken) => {
    try {
      const credential = GoogleAuthProvider.credential(googleToken);
      const userCredential = await signInWithCredential(auth, credential);
      const user = userCredential.user;
      
      // Check if user document exists
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      let userData;
      
      if (!userDoc.exists()) {
        // Create new user document for Google sign-in
        userData = createUserDocument(user, {
          registrationMethod: 'google',
          isEmailVerified: user.emailVerified
        });
        await setDoc(doc(db, 'users', user.uid), userData);
      } else {
        // Update existing user data
        userData = userDoc.data();
        await updateDoc(doc(db, 'users', user.uid), {
          lastLoginAt: serverTimestamp(),
          profilePicture: user.photoURL || userData.profilePicture
        });
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
    } catch (error) {
      console.error('Google sign in error:', error);
      const errorMessage = error?.code ? 
        firebaseAuthAPI.getErrorMessage(error.code) : 
        error?.message || 'Failed to sign in with Google. Please try again.';
      throw new Error(errorMessage);
    }
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
    try {
      await sendPasswordResetEmail(auth, email);
      return { data: { message: 'Password reset email sent successfully' } };
    } catch (error) {
      console.error('Forgot password error:', error);
      const errorMessage = error?.code ? 
        firebaseAuthAPI.getErrorMessage(error.code) : 
        error?.message || 'Failed to send password reset email. Please try again.';
      throw new Error(errorMessage);
    }
  },

  // Enhanced profile update
  updateProfile: async (userData) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No authenticated user');
      
      // Update Firebase Auth profile if display name changed
      if (userData.displayName && userData.displayName !== user.displayName) {
        await updateProfile(user, { displayName: userData.displayName });
      }
      
      // Update Firestore document
      const updateData = {
        ...userData,
        updatedAt: serverTimestamp()
      };
      
      await updateDoc(doc(db, 'users', user.uid), updateData);
      
      // Update AsyncStorage
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        const updatedUser = { ...parsedUser, ...userData };
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      }
      
      return { data: { message: 'Profile updated successfully' } };
    } catch (error) {
      console.error('Update profile error:', error);
      throw new Error('Failed to update profile');
    }
  },

  // Change password
  changePassword: async (currentPassword, newPassword) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No authenticated user');
      
      // Re-authenticate user
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      
      // Update password
      await updatePassword(user, newPassword);
      
      // Update user document
      await updateDoc(doc(db, 'users', user.uid), {
        updatedAt: serverTimestamp()
      });
      
      return { data: { message: 'Password changed successfully' } };
    } catch (error) {
      console.error('Change password error:', error);
      const errorMessage = error?.code ? 
        firebaseAuthAPI.getErrorMessage(error.code) : 
        error?.message || 'Failed to change password. Please try again.';
      throw new Error(errorMessage);
    }
  },

  // Resend email verification
  resendEmailVerification: async () => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No authenticated user');
      
      await sendEmailVerification(user);
      return { data: { message: 'Verification email sent successfully' } };
    } catch (error) {
      console.error('Resend verification error:', error);
      throw new Error('Failed to send verification email');
    }
  },

  // Update user stats (for bookings, challenges, etc.)
  updateUserStats: async (userId, statsUpdate) => {
    try {
      const userRef = doc(db, 'users', userId);
      const updates = {};
      
      // Handle increment operations
      Object.keys(statsUpdate).forEach(key => {
        if (typeof statsUpdate[key] === 'number') {
          updates[`stats.${key}`] = increment(statsUpdate[key]);
        } else {
          updates[`stats.${key}`] = statsUpdate[key];
        }
      });
      
      updates.updatedAt = serverTimestamp();
      
      await updateDoc(userRef, updates);
      return { data: { message: 'User stats updated successfully' } };
    } catch (error) {
      console.error('Update user stats error:', error);
      throw new Error('Failed to update user stats');
    }
  },

  // Get user by ID (for admin purposes)
  getUserById: async (userId) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (!userDoc.exists()) {
        throw new Error('User not found');
      }
      
      return { data: { user: userDoc.data() } };
    } catch (error) {
      console.error('Get user error:', error);
      throw new Error('Failed to get user data');
    }
  },

  // Verify token and get user data
  verifyToken: async (token) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No authenticated user');
      
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
    } catch (error) {
      console.error('Verify token error:', error);
      throw new Error('Invalid or expired token');
    }
  },

  // Helper function to get user-friendly error messages
  getErrorMessage: (errorCode) => {
    const errorMessages = {
      'auth/user-not-found': 'No account found with this email address',
      'auth/wrong-password': 'Incorrect password',
      'auth/email-already-in-use': 'An account with this email already exists',
      'auth/weak-password': 'Password should be at least 6 characters long',
      'auth/invalid-email': 'Please enter a valid email address',
      'auth/user-disabled': 'This account has been disabled',
      'auth/too-many-requests': 'Too many failed attempts. Please try again later',
      'auth/network-request-failed': 'Network error. Please check your connection',
      'auth/requires-recent-login': 'Please sign in again to complete this action',
      'auth/invalid-credential': 'Invalid credentials provided',
      'auth/operation-not-allowed': 'This operation is not allowed. Please contact support.',
      'auth/popup-closed-by-user': 'Sign-in popup was closed before completion',
      'auth/cancelled-popup-request': 'Sign-in was cancelled',
      'auth/popup-blocked': 'Sign-in popup was blocked by the browser',
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
export const getCurrentUser = () => auth.currentUser;

// Export auth state listener
export const onAuthStateChange = (callback) => onAuthStateChanged(auth, callback);