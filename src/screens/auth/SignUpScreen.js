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
  StatusBar,
  Dimensions
} from 'react-native';
import {
  Text,
  ActivityIndicator
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { signUp, clearError } from '../../store/slices/authSlice';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function SignUpScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [nameFocused, setNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [phoneFocused, setPhoneFocused] = useState(false);
  const [referralFocused, setReferralFocused] = useState(false);
  const insets = useSafeAreaInsets();

  const dispatch = useDispatch();
  const { loading, error, emailVerificationSent } = useSelector(state => state.auth);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      let errorTitle = 'Sign Up Error';
      let errorMessage = error;
      let buttons = [{ text: 'OK', onPress: () => dispatch(clearError()) }];

      if (error.includes('network') || error.includes('connection') || error.includes('internet')) {
        errorTitle = 'Network Issue';
        errorMessage = 'Having trouble connecting. Please check your internet connection and try again.';
      } else if (error.includes('configuration-not-found') || error.includes('Firebase configuration')) {
        errorTitle = 'Setup Required';
        errorMessage = 'Firebase needs to be configured. Please contact support.';
      }

      Alert.alert(errorTitle, errorMessage, buttons);
    }
  }, [error, dispatch]);

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
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your name');
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
    if (!agreeToTerms) {
      Alert.alert('Error', 'Please agree to the Terms & Conditions');
      return false;
    }
    return true;
  };

  const handleSignUp = () => {
    if (validateForm()) {
      dispatch(signUp({
        email: email.trim().toLowerCase(),
        password,
        fullName: name.trim(),
        phoneNumber: phoneNumber.trim(),
        city: 'Lahore',
        referralCode: referralCode.trim().toUpperCase() || ''
      }));
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#004d43" />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Top Branding Section */}
          <LinearGradient
            colors={['#004d43', '#006b5c', '#008975']}
            style={styles.brandingSection}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.brandingContent}>
              <MaterialIcons name="sports-soccer" size={80} color="#D4E157" />
              <Text style={styles.brandingTitle}>Join Arena Pro</Text>
              <Text style={styles.brandingSubtitle}>
                Create your account and start your football journey today
              </Text>
            </View>
          </LinearGradient>

          {/* Form Section */}
          <View style={styles.formSection}>
            {/* Back Button */}
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
              <MaterialIcons name="arrow-back" size={24} color="#004d43" />
            </TouchableOpacity>

            <View style={styles.formContent}>
              <Text style={styles.formTitle}>Sign Up</Text>
              <Text style={styles.formSubtitle}>Create your account to get started</Text>

              {/* Name Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Name</Text>
                <View style={[
                  styles.inputWrapper,
                  (nameFocused || name) && styles.inputWrapperFocused
                ]}>
                  <TextInput
                    style={styles.textInput}
                    value={name}
                    onChangeText={setName}
                    onFocus={() => setNameFocused(true)}
                    onBlur={() => setNameFocused(false)}
                    placeholder="Your full name"
                    placeholderTextColor="#999"
                    autoCapitalize="words"
                    autoCorrect={false}
                    selectionColor="#004d43"
                  />
                </View>
              </View>

              {/* Email Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Email</Text>
                <View style={[
                  styles.inputWrapper,
                  (emailFocused || email) && styles.inputWrapperFocused
                ]}>
                  <TextInput
                    style={styles.textInput}
                    value={email}
                    onChangeText={setEmail}
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                    placeholder="your.email@example.com"
                    placeholderTextColor="#999"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    selectionColor="#004d43"
                  />
                </View>
              </View>

              {/* Phone Number Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Phone Number</Text>
                <View style={[
                  styles.inputWrapper,
                  (phoneFocused || phoneNumber) && styles.inputWrapperFocused
                ]}>
                  <MaterialIcons name="phone" size={20} color="#004d43" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    onFocus={() => setPhoneFocused(true)}
                    onBlur={() => setPhoneFocused(false)}
                    placeholder="+92 300 1234567"
                    placeholderTextColor="#999"
                    keyboardType="phone-pad"
                    autoCorrect={false}
                    maxLength={15}
                    selectionColor="#004d43"
                  />
                </View>
              </View>

              {/* Password Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Password</Text>
                <View style={[
                  styles.inputWrapper,
                  (passwordFocused || password) && styles.inputWrapperFocused
                ]}>
                  <TextInput
                    style={styles.textInput}
                    value={password}
                    onChangeText={setPassword}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                    placeholder="Create a strong password"
                    placeholderTextColor="#999"
                    secureTextEntry={!showPassword}
                    autoCorrect={false}
                    selectionColor="#004d43"
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeIcon}
                  >
                    <MaterialIcons
                      name={showPassword ? "visibility" : "visibility-off"}
                      size={22}
                      color="#004d43"
                    />
                  </TouchableOpacity>
                </View>
                <Text style={styles.helperText}>
                  Use 8 or more characters with a mix of letters, numbers & symbols
                </Text>
              </View>

              {/* Referral Code (Optional) */}
              <View style={styles.inputContainer}>
                <View style={styles.labelRow}>
                  <Text style={styles.inputLabel}>Referral Code</Text>
                  <Text style={styles.optionalLabel}>(Optional)</Text>
                </View>
                <View style={[
                  styles.inputWrapper,
                  (referralFocused || referralCode) && styles.inputWrapperFocused
                ]}>
                  <MaterialIcons name="card-giftcard" size={20} color="#004d43" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    value={referralCode}
                    onChangeText={(text) => setReferralCode(text.toUpperCase())}
                    onFocus={() => setReferralFocused(true)}
                    onBlur={() => setReferralFocused(false)}
                    placeholder="Enter code"
                    placeholderTextColor="#999"
                    autoCapitalize="characters"
                    autoCorrect={false}
                    maxLength={8}
                    selectionColor="#004d43"
                  />
                  {referralCode.length > 0 && (
                    <TouchableOpacity
                      onPress={() => setReferralCode('')}
                      style={styles.clearIcon}
                    >
                      <MaterialIcons name="close" size={18} color="#666" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {/* Terms & Conditions */}
              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => setAgreeToTerms(!agreeToTerms)}
                activeOpacity={0.7}
              >
                <View style={[
                  styles.customCheckbox,
                  agreeToTerms && styles.customCheckboxChecked
                ]}>
                  {agreeToTerms && (
                    <MaterialIcons name="check" size={18} color="#FFFFFF" />
                  )}
                </View>
                <Text style={styles.checkboxText}>
                  I accept the{' '}
                  <Text style={styles.termsLink}>Terms & Conditions</Text>
                </Text>
              </TouchableOpacity>

              {/* Sign Up Button */}
              <TouchableOpacity
                style={[styles.signUpButton, loading && styles.signUpButtonDisabled]}
                onPress={handleSignUp}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator color="#004d43" size="small" />
                ) : (
                  <Text style={styles.signUpButtonText}>Sign Up</Text>
                )}
              </TouchableOpacity>

              {/* Sign In Link */}
              <View style={styles.signInContainer}>
                <Text style={styles.signInText}>Already have an account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
                  <Text style={styles.signInLink}>Sign In</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  brandingSection: {
    minHeight: 280,
    paddingHorizontal: 32,
    paddingVertical: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandingContent: {
    alignItems: 'center',
    maxWidth: 400,
  },
  brandingTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 24,
    marginBottom: 16,
    fontFamily: 'Montserrat_700Bold',
    textAlign: 'center',
  },
  brandingSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 24,
    fontFamily: 'Montserrat_400Regular',
  },
  formSection: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -32,
    paddingTop: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    marginLeft: 24,
    marginTop: 8,
  },
  formContent: {
    paddingHorizontal: 32,
    paddingTop: 16,
    paddingBottom: 40,
  },
  formTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
    fontFamily: 'Montserrat_700Bold',
  },
  formSubtitle: {
    fontSize: 15,
    color: '#666',
    marginBottom: 32,
    fontFamily: 'Montserrat_400Regular',
    lineHeight: 22,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
    fontFamily: 'Montserrat_600SemiBold',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingHorizontal: 16,
    height: 56,
  },
  inputWrapperFocused: {
    borderColor: '#004d43',
    backgroundColor: '#FFFFFF',
  },
  textInput: {
    flex: 1,
    backgroundColor: 'transparent',
    fontSize: 15,
    color: '#1a1a1a',
    paddingHorizontal: 0,
    paddingVertical: 16,
    height: 56,
    fontFamily: 'Montserrat_400Regular',
  },
  eyeIcon: {
    padding: 8,
    marginLeft: 8,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  optionalLabel: {
    fontSize: 12,
    color: '#999',
    marginLeft: 6,
    fontFamily: 'Montserrat_400Regular',
    fontStyle: 'italic',
  },
  inputIcon: {
    marginRight: 12,
  },
  clearIcon: {
    padding: 8,
    marginLeft: 8,
  },
  helperText: {
    fontSize: 12,
    color: '#666',
    marginTop: 6,
    fontFamily: 'Montserrat_400Regular',
    lineHeight: 16,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
    marginTop: 4,
  },
  customCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#999',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  customCheckboxChecked: {
    backgroundColor: '#004d43',
    borderColor: '#004d43',
  },
  checkboxText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
    fontFamily: 'Montserrat_400Regular',
  },
  termsLink: {
    color: '#004d43',
    fontFamily: 'Montserrat_600SemiBold',
  },
  signUpButton: {
    backgroundColor: '#D4E157',
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#D4E157',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  signUpButtonDisabled: {
    opacity: 0.6,
  },
  signUpButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#004d43',
    fontFamily: 'Montserrat_700Bold',
  },
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  signInText: {
    fontSize: 15,
    color: '#666',
    fontFamily: 'Montserrat_400Regular',
  },
  signInLink: {
    fontSize: 15,
    color: '#004d43',
    fontFamily: 'Montserrat_700Bold',
  },
});
