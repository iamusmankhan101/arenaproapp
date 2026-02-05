import { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TextInput,
  Image
} from 'react-native';
import {
  Text,
  Button,
  ActivityIndicator
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { signIn, clearError, googleSignIn } from '../../store/slices/authSlice';
import { MaterialIcons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { makeRedirectUri } from 'expo-auth-session';

WebBrowser.maybeCompleteAuthSession();

export default function SignInScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const dispatch = useDispatch();
  const { loading, error } = useSelector(state => state.auth);

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    // Web client ID - used for Expo Go and web
    clientId: '960416327217-0evmllr420e5b8s2lpkb6rgt9a04kr39.apps.googleusercontent.com',
    // Android client ID - used in standalone Android builds
    androidClientId: '960416327217-87m8l6b8cjti5jg9mejv87v9eo652v6h.apps.googleusercontent.com',
    // Use Web client for iOS until you create a proper iOS OAuth client
    iosClientId: '960416327217-0evmllr420e5b8s2lpkb6rgt9a04kr39.apps.googleusercontent.com',
    // Explicit redirect URI for Expo Go
    redirectUri: makeRedirectUri({
      scheme: 'arenapropk.online',
      useProxy: true,
    }),
  });

  // Handle Google Sign In Response
  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      dispatch(googleSignIn(id_token));
    }
  }, [response]);

  // Clear error when component mounts
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Show error alert with network-specific handling
  useEffect(() => {
    if (error) {
      let errorTitle = 'Sign In Error';
      let errorMessage = error;
      let buttons = [{ text: 'OK', onPress: () => dispatch(clearError()) }];

      // Handle network-specific errors
      if (error.includes('network') || error.includes('connection') || error.includes('internet')) {
        errorTitle = 'Network Issue';
        errorMessage = 'Having trouble connecting. Please check your internet connection and try again.';
        buttons = [{ text: 'OK', onPress: () => dispatch(clearError()) }];
      } else if (error.includes('configuration-not-found') || error.includes('Firebase configuration')) {
        errorTitle = 'Setup Required';
        errorMessage = 'Firebase needs to be configured. Please contact support.';
        buttons = [{ text: 'OK', onPress: () => dispatch(clearError()) }];
      } else if (error.includes('Google sign in failed')) {
        errorTitle = 'Google Sign In Error';
        // Keep default message or customize
      }

      Alert.alert(errorTitle, errorMessage, buttons);
    }
  }, [error, dispatch]);

  const validateForm = () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return false;
    }

    if (!email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }

    if (!password.trim()) {
      Alert.alert('Error', 'Please enter your password');
      return false;
    }

    return true;
  };

  const handleSignIn = async () => {
    console.log('🔍 DEBUG: Starting sign-in process...');
    console.log('🔍 DEBUG: Email:', email);
    console.log('🔍 DEBUG: Password length:', password.length);
    console.log('🔍 DEBUG: Normalized email:', email.trim().toLowerCase());

    if (validateForm()) {
      console.log('🔍 DEBUG: Form validation passed');

      try {
        console.log('🔍 DEBUG: Dispatching signIn action...');
        const result = await dispatch(signIn({
          email: email.trim().toLowerCase(),
          password
        })).unwrap();

        console.log('🔍 DEBUG: Sign-in successful!', result);

        // Request location permission after successful sign-in
        console.log('� DEBUG: Requesting location permission...');
        try {
          const { locationService } = await import('../../services/locationService');
          const locationResult = await locationService.handleLocationPermissionFlow();

          if (locationResult.granted) {
            console.log('📍 DEBUG: Location permission granted:', locationResult.location);
          } else {
            console.log('📍 DEBUG: Location permission denied or declined');
          }
        } catch (locationError) {
          console.log('📍 DEBUG: Location permission error:', locationError);
          // Don't block navigation if location fails
        }

        // Force navigation to main app after successful sign-in
        console.log('🔍 DEBUG: Forcing navigation to MainTabs...');
        navigation.reset({
          index: 0,
          routes: [{ name: 'MainTabs' }],
        });

      } catch (error) {
        console.log('🔍 DEBUG: Sign-in failed with error:', error);
        console.log('🔍 DEBUG: Error type:', typeof error);
        console.log('🔍 DEBUG: Error message:', error.message || error);
        console.log('🔍 DEBUG: Full error object:', JSON.stringify(error, null, 2));

        // Check for specific Firebase error codes
        if (error.message) {
          if (error.message.includes('auth/user-not-found')) {
            console.log('🔍 DEBUG: User not found in Firebase Auth');
          } else if (error.message.includes('auth/wrong-password')) {
            console.log('🔍 DEBUG: Wrong password provided');
          } else if (error.message.includes('auth/invalid-email')) {
            console.log('🔍 DEBUG: Invalid email format');
          } else if (error.message.includes('auth/user-disabled')) {
            console.log('🔍 DEBUG: User account is disabled');
          } else if (error.message.includes('auth/too-many-requests')) {
            console.log('🔍 DEBUG: Too many failed attempts');
          }
        }
      }
    } else {
      console.log('🔍 DEBUG: Form validation failed');
    }
  };

  const handleGoogleSignIn = () => {
    promptAsync();
  };

  const handleForgotPassword = () => {
    if (!email.trim()) {
      Alert.alert('Enter Email', 'Please enter your email address first, then tap "Forgot Password?"');
      return;
    }

    if (!email.includes('@')) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return;
    }

    navigation.navigate('ForgotPassword', { email: email.trim().toLowerCase() });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled={false}
        scrollEnabled={true}
      >
        {/* Logo Section */}
        <View style={styles.logoContainer}>
          <View style={styles.logoWrapper}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoText}>A</Text>
            </View>
            <Text style={styles.brandName}>Arena Pro</Text>
            <Text style={styles.tagline}>Play More . Stress Less</Text>
          </View>
        </View>

        {/* Sign In Form */}
        <View style={styles.formContainer}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to continue</Text>

          {/* Email Input */}
          <View style={styles.inputContainer}>
            <View style={[styles.inputWrapper, (emailFocused || email) && styles.inputWrapperFocused]}>
              <MaterialIcons name="email" size={20} color="#999" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="Email address"
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect={false}
                returnKeyType="next"
                selectionColor="#004d43"
                underlineColorAndroid="transparent"
                textContentType="emailAddress"
              />
            </View>
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <View style={[styles.inputWrapper, (passwordFocused || password) && styles.inputWrapperFocused]}>
              <MaterialIcons name="lock" size={20} color="#999" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="Password"
                placeholderTextColor="#999"
                value={password}
                onChangeText={setPassword}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                secureTextEntry={!showPassword}
                autoComplete="password"
                autoCorrect={false}
                returnKeyType="done"
                selectionColor="#004d43"
                underlineColorAndroid="transparent"
                textContentType="password"
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

          {/* Forgot Password */}
          <View style={[styles.optionsRow, { justifyContent: 'flex-end' }]}>
            <TouchableOpacity onPress={handleForgotPassword}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          {/* Sign In Button */}
          <Button
            mode="contained"
            onPress={handleSignIn}
            style={styles.signInButton}
            buttonColor="#004d43"
            textColor="#e8ee26"
            contentStyle={styles.signInButtonContent}
            labelStyle={styles.signInButtonText}
            disabled={loading}
            icon={loading ? undefined : () => <MaterialIcons name="arrow-forward" size={20} color="#e8ee26" />}
          >
            {loading ? <ActivityIndicator color="#e8ee26" size="small" /> : 'SIGN IN'}
          </Button>



          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Google Sign In */}
          <TouchableOpacity
            style={styles.googleButton}
            onPress={handleGoogleSignIn}
            disabled={!request || loading}
          >
            <Image
              source={require('../../images/2a5758d6-4edb-4047-87bb-e6b94dbbbab0-cover.png')}
              style={styles.googleIcon}
            />
            <Text style={styles.googleButtonText}>Continue with Google</Text>
          </TouchableOpacity>

          {/* Sign Up Link */}
          <View style={styles.signUpContainer}>
            <Text style={styles.signUpText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
              <Text style={styles.signUpLink}>Sign up</Text>
            </TouchableOpacity>
          </View>


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
  logoContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  logoWrapper: {
    alignItems: 'center',
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e8ee26',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#004d43',
  },
  brandName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#004d43',
    marginBottom: 4,
  },
  tagline: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  formContainer: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 16,
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
  eyeIcon: {
    padding: 8,
    marginLeft: 8,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 8,
  },
  forgotPasswordText: {
    fontSize: 16,
    color: '#004d43',
    fontWeight: '500',
  },
  signInButton: {
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
  },
  signInButtonContent: {
    height: 56,
    flexDirection: 'row-reverse',
  },
  signInButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
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
  googleIcon: {
    width: 24,
    height: 24,
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  signUpText: {
    fontSize: 16,
    color: '#666',
  },
  signUpLink: {
    fontSize: 16,
    color: '#004d43',
    fontWeight: '600',
  },
});