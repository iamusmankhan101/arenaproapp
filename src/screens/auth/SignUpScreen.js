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
  ActivityIndicator
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { signUp, clearError, googleSignIn } from '../../store/slices/authSlice';
import { MaterialIcons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { makeRedirectUri } from 'expo-auth-session';

WebBrowser.maybeCompleteAuthSession();

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

  // Focus states to prevent keyboard closing
  const [firstNameFocused, setFirstNameFocused] = useState(false);
  const [lastNameFocused, setLastNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [phoneNumberFocused, setPhoneNumberFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);

  const dispatch = useDispatch();
  const { loading, error, emailVerificationSent } = useSelector(state => state.auth);

  // Google Sign-In configuration
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    // Web client ID - used for Expo Go and web
    clientId: '960416327217-0evmllr420e5b8s2lpkb6rgt9a04kr39.apps.googleusercontent.com',
    // Android client ID - used in standalone Android builds
    androidClientId: '960416327217-87m8l6b8cjti5jg9mejv87v9eo652v6h.apps.googleusercontent.com',
    // iOS client ID - used in standalone iOS builds
    iosClientId: '960416327217-0evmllr420e5b8s2lpkb6rgt9a04kr39.apps.googleusercontent.com',
    // Required for Expo Go to work with Google Auth
    redirectUri: makeRedirectUri({
      scheme: 'arenapropk.online',
      useProxy: true,
    }),
  });

  // Handle Google Sign-In Response
  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      dispatch(googleSignIn(id_token));
    } else if (response?.type === 'error') {
      Alert.alert('Sign Up Error', 'Google sign-up failed. Please try again.');
    }
  }, [response, dispatch]);

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
        errorMessage = 'Having trouble connecting. Please check your internet connection and try again.';
        buttons = [{ text: 'OK', onPress: () => dispatch(clearError()) }];
      } else if (error.includes('configuration-not-found') || error.includes('Firebase configuration')) {
        errorTitle = 'Setup Required';
        errorMessage = 'Firebase needs to be configured. Please contact support.';
        buttons = [{ text: 'OK', onPress: () => dispatch(clearError()) }];
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
      const fullName = `${firstName.trim()} ${lastName.trim()}`;

      dispatch(signUp({
        email: email.trim().toLowerCase(),
        password,
        fullName,
        phoneNumber: phoneNumber.trim(),
        city: selectedCity
      }));
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      await promptAsync();
    } catch (error) {
      Alert.alert('Error', 'Failed to initiate Google sign-up. Please try again.');
    }
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
            <View style={[styles.inputWrapper, (firstNameFocused || firstName) && styles.inputWrapperFocused]}>
              <MaterialIcons name="person" size={20} color="#999" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="First Name"
                placeholderTextColor="#999"
                value={firstName}
                onChangeText={setFirstName}
                onFocus={() => setFirstNameFocused(true)}
                onBlur={() => setFirstNameFocused(false)}
                autoCapitalize="words"
                autoCorrect={false}
                returnKeyType="next"
                selectionColor="#004d43"
                underlineColorAndroid="transparent"
                textContentType="givenName"
              />
            </View>
          </View>

          {/* Last Name */}
          <View style={styles.inputContainer}>
            <View style={[styles.inputWrapper, (lastNameFocused || lastName) && styles.inputWrapperFocused]}>
              <MaterialIcons name="person" size={20} color="#999" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="Last Name"
                placeholderTextColor="#999"
                value={lastName}
                onChangeText={setLastName}
                onFocus={() => setLastNameFocused(true)}
                onBlur={() => setLastNameFocused(false)}
                autoCapitalize="words"
                autoCorrect={false}
                returnKeyType="next"
                selectionColor="#004d43"
                underlineColorAndroid="transparent"
                textContentType="familyName"
              />
            </View>
          </View>

          {/* Email */}
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
            <View style={[styles.inputWrapper, (phoneNumberFocused || phoneNumber) && styles.inputWrapperFocused]}>
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
                onFocus={() => setPhoneNumberFocused(true)}
                onBlur={() => setPhoneNumberFocused(false)}
                keyboardType="phone-pad"
                autoCorrect={false}
                returnKeyType="next"
                selectionColor="#004d43"
                underlineColorAndroid="transparent"
                textContentType="telephoneNumber"
              />
            </View>
          </View>

          {/* Password */}
          <View style={styles.inputContainer}>
            <View style={[styles.inputWrapper, (passwordFocused || password) && styles.inputWrapperFocused]}>
              <MaterialIcons name="lock" size={20} color="#999" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="Password (min 6 characters)"
                placeholderTextColor="#999"
                value={password}
                onChangeText={setPassword}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                secureTextEntry={!showPassword}
                autoCorrect={false}
                returnKeyType="next"
                selectionColor="#004d43"
                underlineColorAndroid="transparent"
                textContentType="newPassword"
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
            <View style={[styles.inputWrapper, (confirmPasswordFocused || confirmPassword) && styles.inputWrapperFocused]}>
              <MaterialIcons name="lock" size={20} color="#999" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="Confirm Password"
                placeholderTextColor="#999"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                onFocus={() => setConfirmPasswordFocused(true)}
                onBlur={() => setConfirmPasswordFocused(false)}
                secureTextEntry={!showConfirmPassword}
                autoCorrect={false}
                returnKeyType="done"
                selectionColor="#004d43"
                underlineColorAndroid="transparent"
                textContentType="newPassword"
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
            {!loading && <MaterialIcons name="arrow-forward" size={20} color="#e8ee26" style={styles.buttonIcon} />}
            {loading && <ActivityIndicator color="#e8ee26" size="small" />}
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
            <Image
              source={require('../../images/2a5758d6-4edb-4047-87bb-e6b94dbbbab0-cover.png')}
              style={styles.googleIcon}
            />
            <Text style={styles.googleButtonText}>Continue with Google</Text>
          </TouchableOpacity>

          {/* Sign In Link */}
          <View style={styles.signInContainer}>
            <Text style={styles.signInText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
              <Text style={styles.signInLink}>Sign in</Text>
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
    color: '#e8ee26',
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
  googleIcon: {
    width: 24,
    height: 24,
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
});