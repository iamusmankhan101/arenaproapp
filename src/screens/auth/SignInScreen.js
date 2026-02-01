import React, { useState } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { 
  Text, 
  TextInput, 
  Button, 
  Switch,
  ActivityIndicator 
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { signIn, googleSignIn, devBypassAuth } from '../../store/slices/authSlice';
import { MaterialIcons } from '@expo/vector-icons';

export default function SignInScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const dispatch = useDispatch();
  const { loading } = useSelector(state => state.auth);

  const handleSignIn = () => {
    if (email.trim() && password.trim()) {
      dispatch(signIn({ email: email.trim(), password }));
    }
  };

  const handleGoogleSignIn = () => {
    dispatch(googleSignIn());
  };

  const handleGuestLogin = () => {
    // Use dev bypass for guest login
    dispatch(devBypassAuth());
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
          </View>
        </View>

        {/* Sign In Form */}
        <View style={styles.formContainer}>
          <Text style={styles.title}>Sign in</Text>
          
          {/* Email/Phone Input */}
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <MaterialIcons name="person" size={20} color="#999" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="Email/Phone number"
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                underlineColor="transparent"
                activeUnderlineColor="transparent"
                contentStyle={styles.inputContent}
                theme={{
                  colors: {
                    primary: 'transparent',
                    background: 'transparent',
                  }
                }}
              />
            </View>
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <MaterialIcons name="lock" size={20} color="#999" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="Your password"
                placeholderTextColor="#999"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoComplete="password"
                underlineColor="transparent"
                activeUnderlineColor="transparent"
                contentStyle={styles.inputContent}
                theme={{
                  colors: {
                    primary: 'transparent',
                    background: 'transparent',
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
                color="#229a60"
                style={styles.switch}
              />
              <Text style={styles.rememberMeText}>Remember Me</Text>
            </View>
            
            <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
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
            {loading ? <ActivityIndicator color="white" size="small" /> : 'SIGN IN'}
          </Button>

          {/* Guest Login */}
          <TouchableOpacity 
            onPress={handleGuestLogin}
            style={styles.guestButton}
          >
            <Text style={styles.guestButtonText}>Login as Guest</Text>
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
            <Image 
              source={require('../../images/2a5758d6-4edb-4047-87bb-e6b94dbbbab0-cover.png')}
              style={styles.googleIcon}
              resizeMode="contain"
            />
            <Text style={styles.googleButtonText}>Sign in with Google</Text>
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
    marginBottom: 60,
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
  },
  formContainer: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
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
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    backgroundColor: 'transparent',
    fontSize: 16,
    color: '#333',
    paddingHorizontal: 0,
    paddingVertical: 0,
    height: 56,
  },
  inputContent: {
    paddingHorizontal: 0,
    paddingVertical: 0,
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
    color: '#333',
  },
  signInButton: {
    borderRadius: 12,
    marginBottom: 16,
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
  },
  googleIcon: {
    width: 50,
    height: 50,
    marginRight: 12,
  },
  googleButtonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
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
    color: '#229a60',
    fontWeight: '600',
  },
});