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
import { confirmPasswordReset } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { theme } from '../../theme/theme';
import { LightStatusBar } from '../../components/AppStatusBar';

export default function NewPasswordScreen({ navigation, route }) {
  // Extract oobCode from route params (comes from deep link)
  const oobCode = route.params?.oobCode;
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // If no oobCode, show error and go back
  if (!oobCode) {
    Alert.alert(
      'Invalid Link',
      'This password reset link is invalid or has expired. Please request a new one.',
      [{ text: 'OK', onPress: () => navigation.navigate('SignIn') }]
    );
    return null;
  }

  const validatePassword = () => {
    if (!password.trim()) {
      Alert.alert('Error', 'Please enter a new password');
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

  const handleResetPassword = async () => {
    if (!validatePassword()) return;

    setLoading(true);
    try {
      // Use Firebase's confirmPasswordReset with the oobCode from deep link
      await confirmPasswordReset(auth, oobCode, password);
      
      Alert.alert(
        'Success!',
        'Your password has been reset successfully. Please sign in with your new password.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Navigate back to sign in screen
              navigation.reset({
                index: 0,
                routes: [{ name: 'SignIn' }],
              });
            }
          }
        ]
      );
    } catch (error) {
      console.error('Password reset error:', error);
      let errorMessage = 'Failed to reset password. Please try again.';
      
      if (error.code === 'auth/invalid-action-code') {
        errorMessage = 'Invalid or expired reset code. Please request a new one.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please use a stronger password.';
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
        <Text style={styles.title}>New Password</Text>
        <Text style={styles.subtitle}>
          Please enter your new password
        </Text>

        {/* Password Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Password</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              placeholder="Enter new password"
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              mode="flat"
              underlineColor="transparent"
              activeUnderlineColor="transparent"
              right={
                <TextInput.Icon
                  icon={showPassword ? "eye-off" : "eye"}
                  onPress={() => setShowPassword(!showPassword)}
                  color="#666"
                />
              }
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

        {/* Confirm Password Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Confirm Password</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              placeholder="Re-enter new password"
              placeholderTextColor="#999"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
              mode="flat"
              underlineColor="transparent"
              activeUnderlineColor="transparent"
              right={
                <TextInput.Icon
                  icon={showConfirmPassword ? "eye-off" : "eye"}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  color="#666"
                />
              }
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

        {/* Password Requirements */}
        <View style={styles.requirementsContainer}>
          <Text style={styles.requirementsTitle}>Password must contain:</Text>
          <View style={styles.requirementItem}>
            <MaterialIcons 
              name={password.length >= 6 ? "check-circle" : "radio-button-unchecked"} 
              size={16} 
              color={password.length >= 6 ? theme.colors.primary : "#999"} 
            />
            <Text style={[
              styles.requirementText,
              password.length >= 6 && styles.requirementMet
            ]}>
              At least 6 characters
            </Text>
          </View>
          <View style={styles.requirementItem}>
            <MaterialIcons 
              name={password === confirmPassword && password.length > 0 ? "check-circle" : "radio-button-unchecked"} 
              size={16} 
              color={password === confirmPassword && password.length > 0 ? theme.colors.primary : "#999"} 
            />
            <Text style={[
              styles.requirementText,
              password === confirmPassword && password.length > 0 && styles.requirementMet
            ]}>
              Passwords match
            </Text>
          </View>
        </View>

        {/* Reset Password Button */}
        <Button
          mode="contained"
          onPress={handleResetPassword}
          style={styles.resetButton}
          buttonColor={theme.colors.primary}
          textColor={theme.colors.secondary}
          contentStyle={styles.resetButtonContent}
          labelStyle={styles.resetButtonText}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color={theme.colors.secondary} size="small" /> : 'Reset Password'}
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
    marginBottom: 24,
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
  requirementsContainer: {
    marginBottom: 32,
    padding: 16,
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    fontFamily: 'Montserrat_600SemiBold',
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  requirementText: {
    fontSize: 14,
    color: '#999',
    marginLeft: 8,
    fontFamily: 'Montserrat_400Regular',
  },
  requirementMet: {
    color: theme.colors.primary,
  },
  resetButton: {
    borderRadius: 28,
    elevation: 2,
  },
  resetButtonContent: {
    height: 56,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Montserrat_700Bold',
  },
});
