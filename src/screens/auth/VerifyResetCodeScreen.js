import { useState, useRef, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  Alert, 
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Text, Button } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { theme } from '../../theme/theme';
import { LightStatusBar } from '../../components/AppStatusBar';

export default function VerifyResetCodeScreen({ navigation, route }) {
  const { email } = route.params;
  const [code, setCode] = useState(['', '', '', '']);
  const [resending, setResending] = useState(false);
  
  const inputRefs = [
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null)
  ];

  useEffect(() => {
    // Focus first input on mount
    inputRefs[0].current?.focus();
  }, []);

  const handleCodeChange = (text, index) => {
    // Only allow numbers
    if (text && !/^\d+$/.test(text)) return;

    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    // Auto-focus next input
    if (text && index < 3) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handleVerify = () => {
    const fullCode = code.join('');
    
    if (fullCode.length !== 4) {
      Alert.alert('Error', 'Please enter the complete 4-digit code');
      return;
    }

    // In a real app, you would verify the code with your backend
    // For Firebase, the reset link is sent via email and handled by Firebase
    // So we'll just navigate to the new password screen
    navigation.navigate('NewPassword', { email, code: fullCode });
  };

  const handleResendCode = async () => {
    setResending(true);
    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert('Code Sent!', 'A new verification code has been sent to your email.');
    } catch (error) {
      console.error('Resend code error:', error);
      Alert.alert('Error', 'Failed to resend code. Please try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LightStatusBar />
      
      {/* Back Button */}
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <MaterialIcons name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>

      <View style={styles.content}>
        {/* Title */}
        <Text style={styles.title}>Verify Code</Text>
        <Text style={styles.subtitle}>
          Please enter the code we just sent to email{'\n'}
          <Text style={styles.email}>{String(email)}</Text>
        </Text>

        {/* Code Input */}
        <View style={styles.codeContainer}>
          {code.map((digit, index) => (
            <TextInput
              key={index}
              ref={inputRefs[index]}
              style={styles.codeInput}
              value={digit}
              onChangeText={(text) => handleCodeChange(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
            />
          ))}
        </View>

        {/* Resend Code */}
        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>Didn't receive OTP?</Text>
          <TouchableOpacity onPress={handleResendCode} disabled={resending}>
            <Text style={styles.resendLink}>
              {resending ? 'Sending...' : 'Resend code'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Verify Button */}
        <Button
          mode="contained"
          onPress={handleVerify}
          style={styles.verifyButton}
          buttonColor={theme.colors.primary}
          textColor={theme.colors.secondary}
          contentStyle={styles.verifyButtonContent}
          labelStyle={styles.verifyButtonText}
          disabled={code.join('').length !== 4}
        >
          Verify
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginBottom: 12,
    fontFamily: 'Montserrat_700Bold',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
    fontFamily: 'Montserrat_400Regular',
  },
  email: {
    color: theme.colors.primary,
    fontWeight: '600',
    fontFamily: 'Montserrat_600SemiBold',
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  codeInput: {
    width: 64,
    height: 64,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    fontFamily: 'Montserrat_700Bold',
  },
  resendContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  resendText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontFamily: 'Montserrat_400Regular',
  },
  resendLink: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '600',
    textDecorationLine: 'underline',
    fontFamily: 'Montserrat_600SemiBold',
  },
  verifyButton: {
    borderRadius: 28,
    elevation: 2,
  },
  verifyButtonContent: {
    height: 56,
  },
  verifyButtonText: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Montserrat_700Bold',
  },
});
