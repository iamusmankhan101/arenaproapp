import { useState } from 'react';
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
import { signUp, googleSignIn } from '../../store/slices/authSlice';
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
  const { loading } = useSelector(state => state.auth);

  const cities = [
    'Lahore',
    'Karachi', 
    'Islamabad',
    'Rawalpindi',
    'Faisalabad',
    'Multan',
    'Peshawar',
    'Quetta'
  ];

  const handleSignUp = () => {
    // Validation
    if (!firstName.trim()) {
      Alert.alert('Error', 'Please enter your first name');
      return;
    }
    if (!lastName.trim()) {
      Alert.alert('Error', 'Please enter your last name');
      return;
    }
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }
    if (!selectedCity) {
      Alert.alert('Error', 'Please select your city');
      return;
    }
    if (!phoneNumber.trim()) {
      Alert.alert('Error', 'Please enter your phone number');
      return;
    }
    if (!password.trim()) {
      Alert.alert('Error', 'Please enter a password');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    const fullName = `${firstName.trim()} ${lastName.trim()}`;
    dispatch(signUp({ 
      fullName, 
      email: email.trim(), 
      phoneNumber: phoneNumber.trim(),
      city: selectedCity,
      password 
    }));
  };

  const handleGoogleSignUp = () => {
    dispatch(googleSignIn());
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
            onPress={() => navigation.goBack()}
          >
            <MaterialIcons name="arrow-back" size={24} color="#000000" />
          </TouchableOpacity>
        </View>

        {/* Title */}
        <Text style={styles.title}>Sign up</Text>

        {/* Form */}
        <View style={styles.formContainer}>
          {/* First Name */}
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <MaterialIcons name="person" size={20} color="#999" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="First Name"
                placeholderTextColor="#999"
                value={firstName}
                onChangeText={setFirstName}
                autoCapitalize="words"
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

          {/* Last Name */}
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <MaterialIcons name="person" size={20} color="#999" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="Last Name"
                placeholderTextColor="#999"
                value={lastName}
                onChangeText={setLastName}
                autoCapitalize="words"
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

          {/* Email */}
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <MaterialIcons name="email" size={20} color="#999" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="username@email.com"
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

          {/* City Selector */}
          <View style={styles.inputContainer}>
            <TouchableOpacity 
              style={styles.inputWrapper}
              onPress={() => setShowCityDropdown(!showCityDropdown)}
            >
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
              </View>
            )}
          </View>

          {/* Phone Number */}
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
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

          {/* Password */}
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <MaterialIcons name="lock" size={20} color="#999" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="Password"
                placeholderTextColor="#999"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
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

          {/* Confirm Password */}
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <MaterialIcons name="lock" size={20} color="#999" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="Confirm Password"
                placeholderTextColor="#999"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
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

          {/* Sign Up Button */}
          <TouchableOpacity
            style={[styles.signUpButton, loading && styles.signUpButtonDisabled]}
            onPress={handleSignUp}
            disabled={loading}
          >
            <Text style={styles.signUpButtonText}>SIGN UP</Text>
            {!loading && <MaterialIcons name="arrow-forward" size={20} color="#cdec6a" style={styles.buttonIcon} />}
            {loading && <ActivityIndicator color="white" size="small" />}
          </TouchableOpacity>

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
              resizeMode="contain"
            />
            <Text style={styles.googleButtonText}>Sign up with Google</Text>
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
    marginBottom: 40,
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
  phoneInput: {
    flex: 1,
    backgroundColor: 'transparent',
    fontSize: 16,
    color: '#333',
    paddingHorizontal: 0,
    paddingVertical: 0,
    height: 56,
    marginLeft: 12,
  },
  inputContent: {
    paddingHorizontal: 0,
    paddingVertical: 0,
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
  signUpButton: {
    backgroundColor: '#004d43',
    borderRadius: 12,
    marginTop: 24,
    marginBottom: 24,
    height: 56,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
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
    color: '#229a60',
    fontWeight: '600',
  },
});