import React, { useState } from 'react';
import { View, StyleSheet, Alert, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button, Surface, Checkbox } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function AdminLoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    // Simple admin credentials check (in production, this should be secure)
    if (email === 'admin@pitchit.com' && password === 'admin123') {
      setLoading(true);
      
      // Simulate API call
      setTimeout(() => {
        setLoading(false);
        navigation.replace('AdminPanel');
      }, 1000);
    } else {
      Alert.alert('Error', 'Invalid admin credentials');
    }
  };

  const handleForgotPassword = () => {
    Alert.alert(
      'Reset Password',
      'Please contact the system administrator to reset your admin password.',
      [{ text: 'OK' }]
    );
  };

  return (
    <LinearGradient
      colors={['#004d43', '#006b5c', '#008975']}
      style={styles.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo and Header Section */}
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <MaterialIcons name="admin-panel-settings" size={56} color="#FFFFFF" />
            </View>
          </View>

          {/* Welcome Text */}
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeTitle}>Welcome back!</Text>
            <Text style={styles.welcomeSubtitle}>Admin Portal Access</Text>
          </View>

          {/* Login Form Card */}
          <Surface style={styles.formCard} elevation={8}>
            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Your email address</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                mode="flat"
                style={styles.input}
                placeholder="admin@pitchit.com"
                placeholderTextColor="#999"
                keyboardType="email-address"
                autoCapitalize="none"
                underlineColor="transparent"
                activeUnderlineColor="transparent"
                theme={{
                  colors: {
                    primary: '#004d43',
                    background: '#f5f5f5',
                  },
                }}
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  mode="flat"
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="#999"
                  secureTextEntry={!showPassword}
                  underlineColor="transparent"
                  activeUnderlineColor="transparent"
                  theme={{
                    colors: {
                      primary: '#004d43',
                      background: '#f5f5f5',
                    },
                  }}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <MaterialIcons
                    name={showPassword ? 'visibility-off' : 'visibility'}
                    size={24}
                    color="#004d43"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Remember Me & Forgot Password */}
            <View style={styles.optionsRow}>
              <TouchableOpacity
                style={styles.rememberMeContainer}
                onPress={() => setRememberMe(!rememberMe)}
              >
                <Checkbox
                  status={rememberMe ? 'checked' : 'unchecked'}
                  onPress={() => setRememberMe(!rememberMe)}
                  color="#004d43"
                />
                <Text style={styles.rememberMeText}>Remember me</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleForgotPassword}>
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            {/* Sign In Button */}
            <TouchableOpacity
              style={[styles.signInButton, loading && styles.signInButtonDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <Text style={styles.signInButtonText}>Signing in...</Text>
              ) : (
                <Text style={styles.signInButtonText}>Sign in</Text>
              )}
            </TouchableOpacity>

            {/* Demo Credentials Info */}
            <View style={styles.demoInfoContainer}>
              <MaterialIcons name="info-outline" size={16} color="#666" />
              <Text style={styles.demoInfoText}>
                Demo: admin@pitchit.com / admin123
              </Text>
            </View>
          </Surface>

          {/* Create Account Link */}
          <View style={styles.createAccountContainer}>
            <Text style={styles.createAccountText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => Alert.alert('Info', 'Contact system administrator for admin access')}>
              <Text style={styles.createAccountLink}>Contact Admin</Text>
            </TouchableOpacity>
          </View>

          {/* Back to App Button */}
          <TouchableOpacity
            style={styles.backToAppButton}
            onPress={() => {
              if (navigation.canGoBack()) {
                navigation.goBack();
              } else {
                navigation.navigate('SignIn');
              }
            }}
          >
            <MaterialIcons name="arrow-back" size={20} color="#FFFFFF" />
            <Text style={styles.backToAppText}>Back to App</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    fontFamily: 'Montserrat_700Bold',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
    fontFamily: 'Montserrat_400Regular',
  },
  formContainer: {
    padding: 24,
    borderRadius: 16,
    backgroundColor: 'white',
    marginBottom: 20,
  },
  input: {
    marginBottom: 16,
    backgroundColor: 'white',
  },
  loginButton: {
    marginTop: 8,
    paddingVertical: 8,
    borderRadius: 12,
  },
  credentialsHint: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#e8f5e8',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  hintTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    fontFamily: 'Montserrat_700Bold',
  },
  hintText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'Montserrat_400Regular',
    marginBottom: 2,
  },
  backButton: {
    alignSelf: 'center',
  },
});