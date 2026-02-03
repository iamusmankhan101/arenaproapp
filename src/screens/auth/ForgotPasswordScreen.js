import { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  Alert, 
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { 
  Text, 
  TextInput, 
  Button,
  ActivityIndicator 
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { forgotPassword, clearError } from '../../store/slices/authSlice';
import { MaterialIcons } from '@expo/vector-icons';

export default function ForgotPasswordScreen({ navigation, route }) {
  const [email, setEmail] = useState(route.params?.email || '');
  
  const dispatch = useDispatch();
  const { loading, error, passwordResetSent } = useSelector(state => state.auth);

  // Clear error when component mounts
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Show error alert
  useEffect(() => {
    if (error) {
      Alert.alert('Error', error, [
        { text: 'OK', onPress: () => dispatch(clearError()) }
      ]);
    }
  }, [error, dispatch]);

  // Show success message
  useEffect(() => {
    if (passwordResetSent) {
      Alert.alert(
        'Email Sent!',
        'Password reset instructions have been sent to your email address. Please check your inbox and follow the instructions to reset your password.',
        [
          { 
            text: 'OK', 
            onPress: () => navigation.navigate('SignIn')
          }
        ]
      );
    }
  }, [passwordResetSent, navigation]);

  const validateEmail = () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return false;
    }
    
    if (!email.includes('@') || !email.includes('.')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }
    
    return true;
  };

  const handleResetPassword = () => {
    if (validateEmail()) {
      dispatch(forgotPassword(email.trim().toLowerCase()));
    }
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

        {/* Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <MaterialIcons name="lock-reset" size={48} color="#004d43" />
          </View>
        </View>

        {/* Title and Description */}
        <View style={styles.contentContainer}>
          <Text style={styles.title}>Forgot Password?</Text>
          <Text style={styles.description}>
            Don't worry! Enter your email address and we'll send you instructions to reset your password.
          </Text>

          {/* Email Input */}
          <View style={styles.inputContainer}>
            <View style={[styles.inputWrapper, email && styles.inputWrapperFocused]}>
              <MaterialIcons name="email" size={20} color="#999" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="Enter your email address"
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

          {/* Reset Button */}
          <Button
            mode="contained"
            onPress={handleResetPassword}
            style={styles.resetButton}
            buttonColor="#004d43"
            textColor="#e8ee26"
            contentStyle={styles.resetButtonContent}
            labelStyle={styles.resetButtonText}
            disabled={loading}
            icon={loading ? undefined : () => <MaterialIcons name="send" size={20} color="#e8ee26" />}
          >
            {loading ? <ActivityIndicator color="#e8ee26" size="small" /> : 'SEND RESET EMAIL'}
          </Button>

          {/* Help Text */}
          <View style={styles.helpContainer}>
            <Text style={styles.helpText}>
              Remember your password?{' '}
              <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
                <Text style={styles.helpLink}>Sign in</Text>
              </TouchableOpacity>
            </Text>
          </View>

          {/* Additional Help */}
          <View style={styles.additionalHelp}>
            <Text style={styles.additionalHelpTitle}>Need more help?</Text>
            <Text style={styles.additionalHelpText}>
              • Check your spam/junk folder for the reset email{'\n'}
              • Make sure you entered the correct email address{'\n'}
              • Contact support if you don't receive the email within 10 minutes
            </Text>
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
    marginBottom: 40,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F0F8FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E3F2FD',
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  inputContainer: {
    marginBottom: 32,
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
  resetButton: {
    borderRadius: 12,
    marginBottom: 32,
    elevation: 2,
  },
  resetButtonContent: {
    height: 56,
    flexDirection: 'row-reverse',
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  helpContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  helpText: {
    fontSize: 16,
    color: '#666',
  },
  helpLink: {
    fontSize: 16,
    color: '#004d43',
    fontWeight: '600',
  },
  additionalHelp: {
    backgroundColor: '#F8F9FA',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  additionalHelpTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  additionalHelpText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});