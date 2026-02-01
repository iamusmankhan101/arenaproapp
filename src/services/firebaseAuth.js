import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithCredential
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

export const firebaseAuthAPI = {
  // Sign in with email/password
  signIn: async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Get additional user data from Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.exists() ? userDoc.data() : {};
      
      return {
        data: {
          user: {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            ...userData
          },
          token: await user.getIdToken()
        }
      };
    } catch (error) {
      throw new Error(error.message);
    }
  },

  // Sign up with email/password
  signUp: async (email, password, fullName, phoneNumber) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update profile
      await updateProfile(user, { displayName: fullName });
      
      // Save additional user data to Firestore
      await setDoc(doc(db, 'users', user.uid), {
        fullName,
        email,
        phoneNumber,
        createdAt: new Date(),
        isVerified: true,
        city: '',
        area: ''
      });
      
      return {
        data: {
          user: {
            uid: user.uid,
            email: user.email,
            displayName: fullName,
            fullName,
            phoneNumber
          },
          token: await user.getIdToken()
        }
      };
    } catch (error) {
      throw new Error(error.message);
    }
  },

  // Google Sign In
  googleSignIn: async (googleToken) => {
    try {
      const credential = GoogleAuthProvider.credential(googleToken);
      const userCredential = await signInWithCredential(auth, credential);
      const user = userCredential.user;
      
      // Check if user document exists, create if not
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', user.uid), {
          fullName: user.displayName,
          email: user.email,
          createdAt: new Date(),
          isVerified: true,
          city: '',
          area: ''
        });
      }
      
      return {
        data: {
          user: {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            ...userDoc.data()
          },
          token: await user.getIdToken()
        }
      };
    } catch (error) {
      throw new Error(error.message);
    }
  },

  // Sign out
  signOut: async () => {
    try {
      await signOut(auth);
      return { data: { message: 'Signed out successfully' } };
    } catch (error) {
      throw new Error(error.message);
    }
  },

  // Forgot password
  forgotPassword: async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { data: { message: 'Password reset email sent' } };
    } catch (error) {
      throw new Error(error.message);
    }
  },

  // Update profile
  updateProfile: async (userData) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No authenticated user');
      
      // Update Firebase Auth profile
      if (userData.displayName) {
        await updateProfile(user, { displayName: userData.displayName });
      }
      
      // Update Firestore document
      await updateDoc(doc(db, 'users', user.uid), {
        ...userData,
        updatedAt: new Date()
      });
      
      return { data: { message: 'Profile updated successfully' } };
    } catch (error) {
      throw new Error(error.message);
    }
  },

  // Verify token
  verifyToken: async (token) => {
    try {
      // Firebase handles token verification automatically
      const user = auth.currentUser;
      if (!user) throw new Error('No authenticated user');
      
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.exists() ? userDoc.data() : {};
      
      return {
        data: {
          user: {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            ...userData
          }
        }
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }
};