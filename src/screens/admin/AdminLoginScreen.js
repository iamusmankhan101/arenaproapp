import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text, TextInput, Button, Surface } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';

export default function AdminLoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MaterialIcons name="admin-panel-settings" size={64} color="#4CAF50" />
        <Text style={styles.title}>Admin Panel</Text>
        <Text style={styles.subtitle}>Sign in to manage your platform</Text>
      </View>

      <Surface style={styles.formContainer} elevation={4}>
        <TextInput
          label="Admin Email"
          value={email}
          onChangeText={setEmail}
          mode="outlined"
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
          left={<TextInput.Icon icon="email" />}
        />

        <TextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          mode="outlined"
          style={styles.input}
          secureTextEntry={!showPassword}
          left={<TextInput.Icon icon="lock" />}
          right={
            <TextInput.Icon 
              icon={showPassword ? "eye-off" : "eye"} 
              onPress={() => setShowPassword(!showPassword)}
            />
          }
        />

        <Button
          mode="contained"
          onPress={handleLogin}
          loading={loading}
          disabled={loading}
          style={styles.loginButton}
          buttonColor="#4CAF50"
        >
          Sign In as Admin
        </Button>

        <View style={styles.credentialsHint}>
          <Text style={styles.hintTitle}>Demo Credentials:</Text>
          <Text style={styles.hintText}>Email: admin@pitchit.com</Text>
          <Text style={styles.hintText}>Password: admin123</Text>
        </View>
      </Surface>

      <Button
        mode="text"
        onPress={() => navigation.goBack()}
        style={styles.backButton}
      >
        Back to App
      </Button>
    </View>
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