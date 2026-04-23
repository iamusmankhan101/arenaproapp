import { useState } from 'react';
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
import { MaterialIcons } from '@expo/vector-icons';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { theme } from '../../theme/theme';
import { LightStatusBar } from '../../components/AppStatusBar';

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const validateEmail = () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }
    
    return true;
  };

  const handleSendCode = async () => {
    if (!validateEmail()) return;

    setLoading(true);
    try {
      // Configure action code settings for deep linking
      const actionCodeSettings = {
        // URL to redirect to after email link is clicked
        // This will be handled by the app's deep linking
        url: 'https://arenapro.pk/reset-password',
        handleCodeInApp: true,
        iOS: {
          bundleId: 'arenapropk.online',
        },
        android: {
          packageName: 'arenapropk.online',
          installApp: true,
          minimumVersion: '1',
        },
      };

      await sendPasswordResetEmail(auth, email.trim().toLowerCase(), actionCodeSettings);
      
      Alert.alert(
        'Email Sent!',
        'We\'ve sent a password reset link to your email. Please check your inbox and tap the link to reset your password in the app.',
        [
          { 
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      console.error('Password reset error:', error);
      let errorMessage = 'Failed to send reset email. Please try again.';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address format.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many attempts. Please try again later.';
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LightStatusBar />
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Back Button */}
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>

        {/* Title */}
        <Text style={styles.title}>Forgot Password</Text>
        <Text style={styles.subtitle}>
          Enter your email address and we'll send you a link to reset your password
        </Text>

        {/* Email Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              placeholder="Enter your email"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              mode="flat"
              underlineColor="transparent"
              activeUnderlineColor="transparent"
              theme={{
                colors: {
                  primary: theme.colors.primary,
                  background: '#F5F5F5',
                  onSurface: '#333',
                }
              }}
            />
          </View>
        </View>

        {/* Send Reset Link Button */}
        <Button
          mode="contained"
          onPress={handleSendCode}
          style={styles.sendButton}
          buttonColor={theme.colors.primary}
          textColor={theme.colors.secondary}
          contentStyle={styles.sendButtonContent}
          labelStyle={styles.sendButtonText}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color={theme.colors.secondary} size="small" /> : 'Send Reset Link'}
        </Button>
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
    paddingBottom: 40,
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
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
    fontFamily: 'Montserrat_700Bold',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
    lineHeight: 24,
    fontFamily: 'Montserrat_400Regular',
  },
  inputContainer: {
    marginBottom: 32,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    fontFamily: 'Montserrat_600SemiBold',
  },
  inputWrapper: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    overflow: 'hidden',
  },
  textInput: {
    backgroundColor: '#F5F5F5',
    fontSize: 16,
    color: '#333',
    paddingHorizontal: 16,
    height: 56,
    fontFamily: 'Montserrat_400Regular',
  },
  sendButton: {
    borderRadius: 28,
    elevation: 2,
  },
  sendButtonContent: {
    height: 56,
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Montserrat_700Bold',
  },
});