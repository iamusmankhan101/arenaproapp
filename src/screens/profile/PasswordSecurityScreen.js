import { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import { ArrowLeft } from '../../components/LucideIcons';
import { MaterialIcons } from '@expo/vector-icons';

// Mock biometric authentication functions
const mockBiometricAuth = {
  isAvailable: async () => {
    // Simulate biometric availability check
    return Platform.OS === 'ios' || Platform.OS === 'android';
  },

  authenticate: async () => {
    return new Promise((resolve) => {
      // Simulate biometric authentication
      setTimeout(() => {
        // Simulate 80% success rate
        const success = Math.random() > 0.2;
        resolve({
          success,
          error: success ? null : 'Authentication failed'
        });
      }, 1500);
    });
  },

  getSupportedBiometrics: async () => {
    // Mock supported biometric types
    if (Platform.OS === 'ios') {
      return ['FaceID', 'TouchID'];
    } else {
      return ['Fingerprint', 'Face'];
    }
  }
};

export default function PasswordSecurityScreen({ navigation }) {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  useEffect(() => {
    // Component initialization if needed
  }, []);

  const handlePasswordChange = () => {
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      Alert.alert('Error', 'Please fill in all password fields');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    if (formData.newPassword.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters long');
      return;
    }

    // Here you would dispatch an action to change password
    Alert.alert(
      'Password Changed',
      'Your password has been updated successfully!',
      [{
        text: 'OK',
        onPress: () => {
          setFormData({
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          });
        }
      }]
    );
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Password & Security</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Change Password Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Change Password</Text>
          <View style={styles.card}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Current Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  value={formData.currentPassword}
                  onChangeText={(text) => setFormData({ ...formData, currentPassword: text })}
                  style={styles.passwordInput}
                  mode="outlined"
                  secureTextEntry={!showPasswords.current}
                  outlineColor="#E0E0E0"
                  activeOutlineColor="#229a60"
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => togglePasswordVisibility('current')}
                >
                  <MaterialIcons
                    name={showPasswords.current ? "visibility_off" : "visibility"}
                    size={20}
                    color="#666"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>New Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  value={formData.newPassword}
                  onChangeText={(text) => setFormData({ ...formData, newPassword: text })}
                  style={styles.passwordInput}
                  mode="outlined"
                  secureTextEntry={!showPasswords.new}
                  outlineColor="#E0E0E0"
                  activeOutlineColor="#229a60"
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => togglePasswordVisibility('new')}
                >
                  <MaterialIcons
                    name={showPasswords.new ? "visibility_off" : "visibility"}
                    size={20}
                    color="#666"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Confirm New Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  value={formData.confirmPassword}
                  onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
                  style={styles.passwordInput}
                  mode="outlined"
                  secureTextEntry={!showPasswords.confirm}
                  outlineColor="#E0E0E0"
                  activeOutlineColor="#229a60"
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => togglePasswordVisibility('confirm')}
                >
                  <MaterialIcons
                    name={showPasswords.confirm ? "visibility_off" : "visibility"}
                    size={20}
                    color="#666"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <Button
              mode="contained"
              onPress={handlePasswordChange}
              style={styles.changePasswordButton}
              buttonColor="#004d43"
              textColor="#e8ee26"
            >
              Change Password
            </Button>
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#F5F5F5',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    backgroundColor: 'white',
    paddingRight: 50,
  },
  eyeButton: {
    position: 'absolute',
    right: 15,
    top: 15,
    padding: 5,
  },
  changePasswordButton: {
    borderRadius: 12,
    paddingVertical: 4,
    marginTop: 10,
  },
  bottomSpacing: {
    height: 100,
  },
});