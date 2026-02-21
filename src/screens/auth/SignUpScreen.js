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
  Image,
  StatusBar
} from 'react-native';
import {
  Text,
  ActivityIndicator,
  Checkbox
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { signUp, clearError, googleSignIn } from '../../store/slices/authSlice';
import { MaterialIcons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import * as AuthSession from 'expo-auth-session';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../../theme/theme';

WebBrowser.maybeCompleteAuthSession();

export default function SignUpScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [nameFocused, setNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const insets = useSafeAreaInsets();

  const dispatch = useDispatch();
  const { loading, error, emailVerificationSent } = useSelector(state => state.auth);

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: '960416327217-0evmllr420e5b8s2lpkb6rgt9a04kr39.apps.googleusercontent.com',
    androidClientId: '960416327217-87m8l6b8cjti5jg9mejv87v9eo652v6h.apps.googleusercontent.com',
    iosClientId: '960416327217-0evmllr420e5b8s2lpkb6rgt9a04kr39.apps.googleusercontent.com',
    redirectUri: AuthSession.makeRedirectUri({
      scheme: 'arenapropk.online',
      useProxy: true,
    }),
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      dispatch(googleSignIn(id_token));
    } else if (response?.type === 'error') {
      Alert.alert('Sign Up Error', 'Google sign-up failed. Please try again.');
    }
  }, [response, dispatch]);

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
        phoneNumber: '',
        city: 'Lahore',
        referralCode: ''
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
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Platform.OS === 'android' ? 40 + insets.bottom : 40 }
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
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
            <MaterialIcons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>

          {/* Title */}
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Fill your information below or register with your social account.</Text>

          {/* Form */}
          <View style={styles.formContainer}>
            {/* Name */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Name</Text>
              <View style={[styles.inputWrapper, (nameFocused || name) && styles.inputWrapperFocused]}>
                <TextInput
                  style={styles.textInput}
                  placeholder="John Doe"
                  placeholderTextColor="#999"
                  value={name}
                  onChangeText={setName}
                  onFocus={() => setNameFocused(true)}
                  onBlur={() => setNameFocused(false)}
                  autoCapitalize="words"
                  autoCorrect={false}
                  selectionColor={theme.colors.primary}
                />
              </View>
            </View>

            {/* Email */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <View style={[styles.inputWrapper, (emailFocused || email) && styles.inputWrapperFocused]}>
                <TextInput
                  style={styles.textInput}
                  placeholder="example@gmail.com"
                  placeholderTextColor="#999"
                  value={email}
                  onChangeText={setEmail}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  selectionColor={theme.colors.primary}
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <View style={[styles.inputWrapper, (passwordFocused || password) && styles.inputWrapperFocused]}>
                <TextInput
                  style={styles.textInput}
                  placeholder="••••••••••••••••"
                  placeholderTextColor="#999"
                  value={password}
                  onChangeText={setPassword}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  secureTextEntry={!showPassword}
                  autoCorrect={false}
                  selectionColor={theme.colors.primary}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  <MaterialIcons
                    name={showPassword ? "visibility" : "visibility-off"}
                    size={20}
                    color="#666"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Terms & Conditions */}
            <View style={styles.checkboxContainer}>
              <Checkbox
                status={agreeToTerms ? 'checked' : 'unchecked'}
                onPress={() => setAgreeToTerms(!agreeToTerms)}
                color={theme.colors.primary}
                uncheckedColor="#666"
              />
              <TouchableOpacity 
                onPress={() => setAgreeToTerms(!agreeToTerms)}
                activeOpacity={0.7}
                style={{ flex: 1 }}
              >
                <Text style={styles.checkboxText}>
                  Agree with{' '}
                  <Text style={styles.termsLink}>Terms & Condition</Text>
                </Text>
              </TouchableOpacity>
            </View>

            {/* Sign Up Button */}
            <TouchableOpacity
              style={[styles.signUpButton, loading && styles.signUpButtonDisabled]}
              onPress={handleSignUp}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={theme.colors.secondary} size="small" />
              ) : (
                <Text style={styles.signUpButtonText}>Sign Up</Text>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Or sign up with</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Google Sign Up */}
            <TouchableOpacity
              style={styles.googleButton}
              onPress={handleGoogleSignUp}
              disabled={loading}
            >
              <Image
                source={require('../../images/google_cover_image.png')}
                style={styles.googleIcon}
              />
            </TouchableOpacity>

            {/* Sign In Link */}
            <View style={styles.signInContainer}>
              <Text style={styles.signInText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
                <Text style={styles.signInLink}>Sign In</Text>
              </TouchableOpacity>
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
    backgroundColor: theme.colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 8,
    fontFamily: 'ClashDisplay-Medium',
  },
  subtitle: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    marginBottom: 40,
    fontFamily: 'Montserrat_400Regular',
    lineHeight: 22,
  },
  formContainer: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: theme.colors.text,
    marginBottom: 8,
    fontFamily: 'Montserrat_500Medium',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 16,
    height: 56,
  },
  inputWrapperFocused: {
    borderColor: theme.colors.primary,
    backgroundColor: '#FFFFFF',
  },
  textInput: {
    flex: 1,
    backgroundColor: 'transparent',
    fontSize: 16,
    color: theme.colors.text,
    paddingHorizontal: 0,
    paddingVertical: 16,
    height: 56,
    fontFamily: 'Montserrat_400Regular',
  },
  eyeIcon: {
    padding: 8,
    marginLeft: 8,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
    marginLeft: 0,
  },
  checkboxText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginLeft: 8,
    fontFamily: 'Montserrat_400Regular',
  },
  termsLink: {
    color: theme.colors.primary,
    fontFamily: 'Montserrat_500Medium',
  },
  signUpButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 28,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    elevation: 2,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  signUpButtonDisabled: {
    opacity: 0.6,
  },
  signUpButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.secondary,
    fontFamily: 'ClashDisplay-Medium',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  dividerText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginHorizontal: 16,
    fontFamily: 'Montserrat_400Regular',
  },
  googleButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 32,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  googleIcon: {
    width: 32,
    height: 32,
  },
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  signInText: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    fontFamily: 'Montserrat_400Regular',
  },
  signInLink: {
    fontSize: 15,
    color: theme.colors.primary,
    fontFamily: 'Montserrat_600SemiBold',
  },
});
