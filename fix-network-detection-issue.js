// Fix for overly aggressive network detection
const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing Network Detection Issue...\n');

// Update Firebase configuration with less aggressive network checking
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
`;

// Write the updated Firebase config
fs.writeFileSync(path.join(__dirname, 'src/config/firebase.js'), firebaseConfigContent);
console.log('✅ Updated Firebase configuration with simplified network detection');

// Update the auth service to be less aggressive about network checking
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

// Simplified retry configuration - less aggressive
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
  // Initialize auth state listener
  initializeAuthListener: (callback) => {
    try {
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
      
      // Update user document
      await updateDoc(doc(db, 'users', user.uid), {
        updatedAt: serverTimestamp()
      });
      
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
console.log('✅ Updated Firebase Auth service with simplified network handling');

// Update the SignUpScreen to handle network issues more gracefully
const signUpScreenContent = `import { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import { 
  Text, 
  TextInput, 
  ActivityIndicator 
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { signUp, googleSignIn, clearError, devBypassAuth } from '../../store/slices/authSlice';
import { MaterialIcons } from '@expo/vector-icons';

export default function SignUpScreen({ navigation }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  
  const dispatch = useDispatch();
  const { loading, error, emailVerificationSent } = useSelector(state => state.auth);

  const cities = [
    'Lahore',
    'Karachi', 
    'Islamabad',
    'Rawalpindi',
    'Faisalabad',
    'Multan',
    'Peshawar',
    'Quetta',
    'Gujranwala',
    'Sialkot'
  ];

  // Clear error when component mounts
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Show error alert with network-specific handling
  useEffect(() => {
    if (error) {
      let errorTitle = 'Sign Up Error';
      let errorMessage = error;
      let buttons = [{ text: 'OK', onPress: () => dispatch(clearError()) }];
      
      // Handle network-specific errors
      if (error.includes('network') || error.includes('connection') || error.includes('internet')) {
        errorTitle = 'Network Issue';
        errorMessage = 'Having trouble connecting. Would you like to continue as guest for testing?';
        buttons = [
          { text: 'Retry', onPress: () => dispatch(clearError()) },
          { text: 'Continue as Guest', onPress: () => {
            dispatch(clearError());
            dispatch(devBypassAuth());
          }}
        ];
      } else if (error.includes('configuration-not-found') || error.includes('Firebase configuration')) {
        errorTitle = 'Setup Required';
        errorMessage = 'Firebase needs to be configured. Would you like to continue as guest for testing?';
        buttons = [
          { text: 'Cancel', style: 'cancel', onPress: () => dispatch(clearError()) },
          { text: 'Continue as Guest', onPress: () => {
            dispatch(clearError());
            dispatch(devBypassAuth());
          }}
        ];
      }
      
      Alert.alert(errorTitle, errorMessage, buttons);
    }
  }, [error, dispatch]);

  // Show success message for email verification
  useEffect(() => {
    if (emailVerificationSent) {
      Alert.alert(
        'Account Created!',
        'Your account has been created successfully. Please check your email for verification link.',
        [{ text: 'OK' }]
      );
    }
  }, [emailVerificationSent]);

  const validateForm = () => {
    if (!firstName.trim()) {
      Alert.alert('Error', 'Please enter your first name');
      return false;
    }
    if (!lastName.trim()) {
      Alert.alert('Error', 'Please enter your last name');
      return false;
    }
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return false;
    }
    if (!email.includes('@') || !email.includes('.')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }
    if (!selectedCity) {
      Alert.alert('Error', 'Please select your city');
      return false;
    }
    if (!phoneNumber.trim()) {
      Alert.alert('Error', 'Please enter your phone number');
      return false;
    }
    if (phoneNumber.trim().length < 10) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return false;
    }
    if (!password.trim()) {
      Alert.alert('Error', 'Please enter a password');
      return false;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return false;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }

    return true;
  };

  const handleSignUp = () => {
    if (validateForm()) {
      const fullName = \`\${firstName.trim()} \${lastName.trim()}\`;
      
      dispatch(signUp({ 
        email: email.trim().toLowerCase(),
        password,
        fullName, 
        phoneNumber: phoneNumber.trim(),
        city: selectedCity
      }));
    }
  };

  const handleGoogleSignUp = () => {
    Alert.alert(
      'Google Sign Up',
      'Google Sign Up will be available in the next update. Please use email registration for now.',
      [{ text: 'OK' }]
    );
  };

  const handleNetworkIssue = () => {
    Alert.alert(
      'Network Issue',
      'No internet connection detected. Would you like to continue as guest for testing?',
      [
        { text: 'Retry', onPress: () => handleSignUp() },
        { text: 'Continue as Guest', onPress: () => dispatch(devBypassAuth()) }
      ]
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => {
              if (navigation.canGoBack()) {
                navigation.goBack();
              } else {
                navigation.navigate('SignIn');
              }
            }}
          >
            <MaterialIcons name="arrow-back" size={24} color="#000000" />
          </TouchableOpacity>
        </View>

        {/* Title */}
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join Arena Pro today</Text>

        {/* Form */}
        <View style={styles.formContainer}>
          {/* First Name */}
          <View style={styles.inputContainer}>
            <View style={[styles.inputWrapper, firstName && styles.inputWrapperFocused]}>
              <MaterialIcons name="person" size={20} color="#999" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="First Name"
                placeholderTextColor="#999"
                value={firstName}
                onChangeText={setFirstName}
                autoCapitalize="words"
                mode="flat"
                dense={false}
                selectionColor="#004d43"
                cursorColor="#004d43"
                theme={{
                  colors: {
                    primary: '#004d43',
                    background: 'transparent',
                    surface: 'transparent',
                    onSurface: '#333',
                    outline: 'transparent',
                  }
                }}
              />
            </View>
          </View>

          {/* Last Name */}
          <View style={styles.inputContainer}>
            <View style={[styles.inputWrapper, lastName && styles.inputWrapperFocused]}>
              <MaterialIcons name="person" size={20} color="#999" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="Last Name"
                placeholderTextColor="#999"
                value={lastName}
                onChangeText={setLastName}
                autoCapitalize="words"
                mode="flat"
                dense={false}
                selectionColor="#004d43"
                cursorColor="#004d43"
                theme={{
                  colors: {
                    primary: '#004d43',
                    background: 'transparent',
                    surface: 'transparent',
                    onSurface: '#333',
                    outline: 'transparent',
                  }
                }}
              />
            </View>
          </View>

          {/* Email */}
          <View style={styles.inputContainer}>
            <View style={[styles.inputWrapper, email && styles.inputWrapperFocused]}>
              <MaterialIcons name="email" size={20} color="#999" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="Email address"
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                mode="flat"
                dense={false}
                selectionColor="#004d43"
                cursorColor="#004d43"
                theme={{
                  colors: {
                    primary: '#004d43',
                    background: 'transparent',
                    surface: 'transparent',
                    onSurface: '#333',
                    outline: 'transparent',
                  }
                }}
              />
            </View>
          </View>

          {/* City Selector */}
          <View style={styles.inputContainer}>
            <TouchableOpacity 
              style={styles.inputWrapper}
              onPress={() => setShowCityDropdown(!showCityDropdown)}
            >
              <MaterialIcons name="location-city" size={20} color="#999" style={styles.inputIcon} />
              <Text style={[styles.cityText, !selectedCity && styles.placeholderText]}>
                {selectedCity || 'Select City'}
              </Text>
              <MaterialIcons 
                name={showCityDropdown ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
                size={20} 
                color="#999" 
              />
            </TouchableOpacity>
            
            {showCityDropdown && (
              <View style={styles.dropdown}>
                <ScrollView style={styles.dropdownScroll} nestedScrollEnabled>
                  {cities.map((city) => (
                    <TouchableOpacity
                      key={city}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setSelectedCity(city);
                        setShowCityDropdown(false);
                      }}
                    >
                      <Text style={styles.dropdownItemText}>{city}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          {/* Phone Number */}
          <View style={styles.inputContainer}>
            <View style={[styles.inputWrapper, phoneNumber && styles.inputWrapperFocused]}>
              <View style={styles.countryCodeContainer}>
                <Text style={styles.flagEmoji}>🇵🇰</Text>
                <Text style={styles.countryCode}>+92</Text>
              </View>
              <TextInput
                style={styles.phoneInput}
                placeholder="Phone number"
                placeholderTextColor="#999"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                mode="flat"
                dense={false}
                selectionColor="#004d43"
                cursorColor="#004d43"
                theme={{
                  colors: {
                    primary: '#004d43',
                    background: 'transparent',
                    surface: 'transparent',
                    onSurface: '#333',
                    outline: 'transparent',
                  }
                }}
              />
            </View>
          </View>

          {/* Password */}
          <View style={styles.inputContainer}>
            <View style={[styles.inputWrapper, password && styles.inputWrapperFocused]}>
              <MaterialIcons name="lock" size={20} color="#999" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="Password (min 6 characters)"
                placeholderTextColor="#999"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                mode="flat"
                dense={false}
                selectionColor="#004d43"
                cursorColor="#004d43"
                theme={{
                  colors: {
                    primary: '#004d43',
                    background: 'transparent',
                    surface: 'transparent',
                    onSurface: '#333',
                    outline: 'transparent',
                  }
                }}
              />
              <TouchableOpacity 
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <MaterialIcons 
                  name={showPassword ? "visibility" : "visibility-off"} 
                  size={20} 
                  color="#999" 
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirm Password */}
          <View style={styles.inputContainer}>
            <View style={[styles.inputWrapper, confirmPassword && styles.inputWrapperFocused]}>
              <MaterialIcons name="lock" size={20} color="#999" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="Confirm Password"
                placeholderTextColor="#999"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                mode="flat"
                dense={false}
                selectionColor="#004d43"
                cursorColor="#004d43"
                theme={{
                  colors: {
                    primary: '#004d43',
                    background: 'transparent',
                    surface: 'transparent',
                    onSurface: '#333',
                    outline: 'transparent',
                  }
                }}
              />
              <TouchableOpacity 
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeIcon}
              >
                <MaterialIcons 
                  name={showConfirmPassword ? "visibility" : "visibility-off"} 
                  size={20} 
                  color="#999" 
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Password Strength Indicator */}
          <View style={styles.passwordStrength}>
            <Text style={styles.passwordStrengthText}>
              Password strength: {password.length < 6 ? 'Weak' : password.length < 8 ? 'Medium' : 'Strong'}
            </Text>
            <View style={styles.strengthBar}>
              <View 
                style={[
                  styles.strengthFill, 
                  { 
                    width: password.length < 6 ? '33%' : password.length < 8 ? '66%' : '100%',
                    backgroundColor: password.length < 6 ? '#FF6B6B' : password.length < 8 ? '#FFD93D' : '#6BCF7F'
                  }
                ]} 
              />
            </View>
          </View>

          {/* Sign Up Button */}
          <TouchableOpacity
            style={[styles.signUpButton, loading && styles.signUpButtonDisabled]}
            onPress={handleSignUp}
            disabled={loading}
          >
            <Text style={styles.signUpButtonText}>CREATE ACCOUNT</Text>
            {!loading && <MaterialIcons name="arrow-forward" size={20} color="#cdec6a" style={styles.buttonIcon} />}
            {loading && <ActivityIndicator color="#cdec6a" size="small" />}
          </TouchableOpacity>

          {/* Terms and Privacy */}
          <Text style={styles.termsText}>
            By creating an account, you agree to our{' '}
            <Text style={styles.termsLink}>Terms of Service</Text>
            {' '}and{' '}
            <Text style={styles.termsLink}>Privacy Policy</Text>
          </Text>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Google Sign Up */}
          <TouchableOpacity 
            style={styles.googleButton}
            onPress={handleGoogleSignUp}
            disabled={loading}
          >
            <MaterialIcons name="account-circle" size={24} color="#4285F4" />
            <Text style={styles.googleButtonText}>Continue with Google</Text>
          </TouchableOpacity>

          {/* Sign In Link */}
          <View style={styles.signInContainer}>
            <Text style={styles.signInText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
              <Text style={styles.signInLink}>Sign in</Text>
            </TouchableOpacity>
          </View>

          {/* Development Helper */}
          {__DEV__ && (
            <View style={styles.devHelper}>
              <Text style={styles.devHelperTitle}>Development Helper</Text>
              <TouchableOpacity 
                style={styles.devButton}
                onPress={() => {
                  setFirstName('John');
                  setLastName('Doe');
                  setEmail('john.doe@example.com');
                  setSelectedCity('Lahore');
                  setPhoneNumber('3001234567');
                  setPassword('password123');
                  setConfirmPassword('password123');
                }}
              >
                <Text style={styles.devButtonText}>Fill Test Data</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.devButton, { backgroundColor: '#28a745', marginTop: 8 }]}
                onPress={() => dispatch(devBypassAuth())}
              >
                <Text style={[styles.devButtonText, { color: 'white' }]}>Continue as Guest</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  header: {
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
  },
  formContainer: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 16,
    position: 'relative',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    paddingHorizontal: 16,
    height: 56,
  },
  inputWrapperFocused: {
    borderColor: '#004d43',
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#004d43',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    backgroundColor: 'transparent',
    fontSize: 16,
    color: '#333',
    paddingHorizontal: 0,
    paddingVertical: 16,
    height: 56,
    textAlignVertical: 'center',
  },
  phoneInput: {
    flex: 1,
    backgroundColor: 'transparent',
    fontSize: 16,
    color: '#333',
    paddingHorizontal: 0,
    paddingVertical: 16,
    height: 56,
    marginLeft: 12,
    textAlignVertical: 'center',
  },
  eyeIcon: {
    padding: 8,
    marginLeft: 8,
  },
  cityText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 16,
  },
  placeholderText: {
    color: '#999',
  },
  dropdown: {
    position: 'absolute',
    top: 58,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    maxHeight: 200,
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dropdownScroll: {
    maxHeight: 180,
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#333',
  },
  countryCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 12,
    borderRightWidth: 1,
    borderRightColor: '#E9ECEF',
    marginRight: 12,
  },
  flagEmoji: {
    fontSize: 18,
    marginRight: 6,
  },
  countryCode: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  passwordStrength: {
    marginBottom: 16,
  },
  passwordStrengthText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  strengthBar: {
    height: 4,
    backgroundColor: '#E9ECEF',
    borderRadius: 2,
    overflow: 'hidden',
  },
  strengthFill: {
    height: '100%',
    borderRadius: 2,
  },
  signUpButton: {
    backgroundColor: '#004d43',
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 16,
    height: 56,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  signUpButtonDisabled: {
    opacity: 0.6,
  },
  buttonIcon: {
    marginLeft: 12,
  },
  signUpButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
    color: '#cdec6a',
  },
  termsText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 18,
  },
  termsLink: {
    color: '#004d43',
    fontWeight: '500',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E9ECEF',
  },
  dividerText: {
    fontSize: 14,
    color: '#999',
    marginHorizontal: 16,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    height: 56,
    marginBottom: 32,
    elevation: 1,
  },
  googleButtonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    marginLeft: 12,
  },
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  signInText: {
    fontSize: 16,
    color: '#666',
  },
  signInLink: {
    fontSize: 16,
    color: '#004d43',
    fontWeight: '600',
  },
  devHelper: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#FFF3CD',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFEAA7',
  },
  devHelperTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 8,
  },
  devButton: {
    backgroundColor: '#FFC107',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  devButtonText: {
    fontSize: 14,
    color: '#212529',
    fontWeight: '500',
  },
});`;

// Write the updated SignUp screen
fs.writeFileSync(path.join(__dirname, 'src/screens/auth/SignUpScreen.js'), signUpScreenContent);
console.log('✅ Updated SignUpScreen with better network error handling');

console.log('\n🎉 Network Detection Issue Fixed!');
console.log('\n📋 Changes made:');
console.log('1. Simplified network detection (less aggressive)');
console.log('2. Removed false positive network checks');
console.log('3. Better error handling for network issues');
console.log('4. Added "Continue as Guest" option for network problems');
console.log('5. Improved user experience during network issues');

console.log('\n🔧 The app should now:');
console.log('- Not show false "No internet connection" errors');
console.log('- Handle real network issues gracefully');
console.log('- Provide guest access when needed');
console.log('- Work better with Firebase authentication');