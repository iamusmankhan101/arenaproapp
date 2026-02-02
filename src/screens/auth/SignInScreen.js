import React, { useState, useEffect } from 'react';
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
  Button, 
  Switch,
  ActivityIndicator,
  Snackbar
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { signIn, googleSignIn, devBypassAuth, clearError } from '../../store/slices/authSlice';
import { MaterialIcons } from '@expo/vector-icons';

export default function SignInScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const dispatch = useDispatch();
  const { loading, error } = useSelector(state => state.auth);

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

  const handleSignIn = () => {
    if (validateForm()) {
      dispatch(signIn({ email: email.trim().toLowerCase(), password }));
    }
  };

  const handleGoogleSignIn = () => {
    // For now, we'll use dev bypass for Google sign in
    // In production, you would integrate with Google Sign-In SDK
    Alert.alert(
      'Google Sign In',
      'Google Sign In will be available in the next update. Would you like to continue as guest?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Continue as Guest', onPress: handleGuestLogin }
      ]
    );
  };

  const handleGuestLogin = () => {
    dispatch(devBypassAuth());
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
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo Section */}
        <View style={styles.logoContainer}>
          <View style={styles.logoWrapper}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoText}>A</Text>
            </View>
            <Text style={styles.brandName}>Arena Pro</Text>
            <Text style={styles.tagline}>Your Sports Booking Platform</Text>
          </View>
        </View>

        {/* Sign In Form */}
        <View style={styles.formContainer}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to continue</Text>
          
          {/* Email Input */}
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

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <View style={[styles.inputWrapper, password && styles.inputWrapperFocused]}>
              <MaterialIcons name="lock" size={20} color="#999" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="Password"
                placeholderTextColor="#999"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoComplete="password"
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

          {/* Remember Me & Forgot Password */}
          <View style={styles.optionsRow}>
            <View style={styles.rememberMeContainer}>
              <Switch
                value={rememberMe}
                onValueChange={setRememberMe}
                color="#004d43"
                style={styles.switch}
              />
              <Text style={styles.rememberMeText}>Remember Me</Text>
            </View>
            
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
            textColor="#cdec6a"
            contentStyle={styles.signInButtonContent}
            labelStyle={styles.signInButtonText}
            disabled={loading}
            icon={loading ? undefined : () => <MaterialIcons name="arrow-forward" size={20} color="#cdec6a" />}
          >
            {loading ? <ActivityIndicator color="#cdec6a" size="small" /> : 'SIGN IN'}
          </Button>

          {/* Guest Login */}
          <TouchableOpacity 
            onPress={handleGuestLogin}
            style={styles.guestButton}
            disabled={loading}
          >
            <Text style={styles.guestButtonText}>Continue as Guest</Text>
          </TouchableOpacity>

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
            disabled={loading}
          >
            <MaterialIcons name="account-circle" size={24} color="#4285F4" />
            <Text style={styles.googleButtonText}>Continue with Google</Text>
          </TouchableOpacity>

          {/* Sign Up Link */}
          <View style={styles.signUpContainer}>
            <Text style={styles.signUpText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
              <Text style={styles.signUpLink}>Sign up</Text>
            </TouchableOpacity>
          </View>

          {/* Development Helper */}
          {__DEV__ && (
            <View style={styles.devHelper}>
              <Text style={styles.devHelperTitle}>Development Helper</Text>
              <TouchableOpacity 
                style={styles.devButton}
                onPress={() => {
                  setEmail('test@example.com');
                  setPassword('password123');
                }}
              >
                <Text style={styles.devButtonText}>Fill Test Credentials</Text>
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
    backgroundColor: '#cdec6a',
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
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  switch: {
    transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
  },
  rememberMeText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 8,
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
  guestButton: {
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 24,
  },
  guestButtonText: {
    fontSize: 16,
    color: '#666',
    textDecorationLine: 'underline',
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
});