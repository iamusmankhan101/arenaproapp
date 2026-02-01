import { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { Text, TextInput, Button, Switch } from 'react-native-paper';
import { ArrowLeft, Fingerprint, ChevronRight, History, Smartphone, LogOut } from '../../components/LucideIcons';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    biometricLogin: false,
    loginNotifications: true,
    deviceTracking: false
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [supportedBiometrics, setSupportedBiometrics] = useState([]);

  useEffect(() => {
    checkBiometricAvailability();
    loadSecuritySettings();
  }, []);

  const checkBiometricAvailability = async () => {
    try {
      const available = await mockBiometricAuth.isAvailable();
      const supported = await mockBiometricAuth.getSupportedBiometrics();
      
      setBiometricAvailable(available);
      setSupportedBiometrics(supported);
    } catch (error) {
      console.error('Error checking biometric availability:', error);
      setBiometricAvailable(false);
    }
  };

  const loadSecuritySettings = async () => {
    try {
      const settings = await AsyncStorage.getItem('securitySettings');
      if (settings) {
        setSecuritySettings(JSON.parse(settings));
      }
    } catch (error) {
      console.error('Error loading security settings:', error);
    }
  };

  const saveSecuritySettings = async (newSettings) => {
    try {
      await AsyncStorage.setItem('securitySettings', JSON.stringify(newSettings));
    } catch (error) {
      console.error('Error saving security settings:', error);
    }
  };

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

  const toggleSecuritySetting = async (setting) => {
    if (setting === 'biometricLogin') {
      await handleBiometricToggle();
    } else {
      const newSettings = {
        ...securitySettings,
        [setting]: !securitySettings[setting]
      };
      setSecuritySettings(newSettings);
      await saveSecuritySettings(newSettings);
      
      Alert.alert(
        'Settings Updated',
        `${getSettingDisplayName(setting)} has been ${newSettings[setting] ? 'enabled' : 'disabled'}.`
      );
    }
  };

  const handleBiometricToggle = async () => {
    if (!biometricAvailable) {
      Alert.alert(
        'Biometric Not Available',
        'Biometric authentication is not available on this device.',
        [{ text: 'OK' }]
      );
      return;
    }

    if (!securitySettings.biometricLogin) {
      // Enabling biometric login
      Alert.alert(
        'Enable Biometric Login',
        `Use ${supportedBiometrics.join(' or ')} to login to your account?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Enable', 
            onPress: async () => {
              try {
                const result = await mockBiometricAuth.authenticate();
                
                if (result.success) {
                  const newSettings = {
                    ...securitySettings,
                    biometricLogin: true
                  };
                  setSecuritySettings(newSettings);
                  await saveSecuritySettings(newSettings);
                  
                  Alert.alert(
                    'Biometric Login Enabled',
                    'You can now use biometric authentication to login.',
                    [{ text: 'OK' }]
                  );
                } else {
                  Alert.alert(
                    'Authentication Failed',
                    result.error || 'Could not verify your identity.',
                    [{ text: 'Try Again' }]
                  );
                }
              } catch (error) {
                Alert.alert(
                  'Error',
                  'An error occurred while setting up biometric authentication.',
                  [{ text: 'OK' }]
                );
              }
            }
          }
        ]
      );
    } else {
      // Disabling biometric login
      Alert.alert(
        'Disable Biometric Login',
        'Are you sure you want to disable biometric login?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Disable', 
            style: 'destructive',
            onPress: async () => {
              const newSettings = {
                ...securitySettings,
                biometricLogin: false
              };
              setSecuritySettings(newSettings);
              await saveSecuritySettings(newSettings);
              
              Alert.alert(
                'Biometric Login Disabled',
                'Biometric authentication has been disabled.',
                [{ text: 'OK' }]
              );
            }
          }
        ]
      );
    }
  };

  const getSettingDisplayName = (setting) => {
    const names = {
      twoFactorAuth: 'Two-Factor Authentication',
      biometricLogin: 'Biometric Login',
      loginNotifications: 'Login Notifications',
      deviceTracking: 'Device Tracking'
    };
    return names[setting] || setting;
  };

  const testBiometricAuth = async () => {
    if (!biometricAvailable) {
      Alert.alert('Biometric Not Available', 'Biometric authentication is not available on this device.');
      return;
    }

    try {
      const result = await mockBiometricAuth.authenticate();
      
      if (result.success) {
        Alert.alert(
          'Authentication Successful',
          'Biometric authentication completed successfully!',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Authentication Failed',
          result.error || 'Could not verify your identity.',
          [{ text: 'Try Again' }]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred during authentication.');
    }
  };

  const securityOptions = [
    {
      id: 'twoFactorAuth',
      title: 'Two-Factor Authentication',
      description: 'Add an extra layer of security to your account',
      icon: 'security',
      value: securitySettings.twoFactorAuth
    },
    {
      id: 'biometricLogin',
      title: 'Biometric Login',
      description: biometricAvailable 
        ? `Use ${supportedBiometrics.join(' or ')} to login`
        : 'Not available on this device',
      icon: 'fingerprint',
      value: securitySettings.biometricLogin,
      disabled: !biometricAvailable
    },
    {
      id: 'loginNotifications',
      title: 'Login Notifications',
      description: 'Get notified when someone logs into your account',
      icon: 'notifications',
      value: securitySettings.loginNotifications
    },
    {
      id: 'deviceTracking',
      title: 'Device Tracking',
      description: 'Track devices that have accessed your account',
      icon: 'devices',
      value: securitySettings.deviceTracking
    }
  ];

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
                  onChangeText={(text) => setFormData({...formData, currentPassword: text})}
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
                  onChangeText={(text) => setFormData({...formData, newPassword: text})}
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
                  onChangeText={(text) => setFormData({...formData, confirmPassword: text})}
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
              buttonColor="#229a60"
            >
              Change Password
            </Button>
          </View>
        </View>

        {/* Security Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security Settings</Text>
          <View style={styles.card}>
            {securityOptions.map((option) => (
              <View key={option.id} style={[
                styles.securityOption,
                option.disabled && styles.disabledOption
              ]}>
                <View style={styles.securityOptionLeft}>
                  <MaterialIcons 
                    name={option.icon} 
                    size={24} 
                    color={option.disabled ? "#ccc" : "#666"} 
                  />
                  <View style={styles.securityOptionText}>
                    <Text style={[
                      styles.securityOptionTitle,
                      option.disabled && styles.disabledText
                    ]}>
                      {option.title}
                    </Text>
                    <Text style={[
                      styles.securityOptionDescription,
                      option.disabled && styles.disabledText
                    ]}>
                      {option.description}
                    </Text>
                  </View>
                </View>
                <Switch
                  value={option.value}
                  onValueChange={() => toggleSecuritySetting(option.id)}
                  color="#229a60"
                  disabled={option.disabled}
                />
              </View>
            ))}
          </View>
        </View>

        {/* Additional Security Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Actions</Text>
          <View style={styles.card}>
            {biometricAvailable && (
              <>
                <TouchableOpacity style={styles.actionItem} onPress={testBiometricAuth}>
                  <View style={styles.actionLeft}>
                    <Fingerprint size={24} color="#229a60" />
                    <Text style={[styles.actionText, { color: '#229a60' }]}>Test Biometric Auth</Text>
                  </View>
                  <ChevronRight size={24} color="#ccc" />
                </TouchableOpacity>
              </>
            )}

            <TouchableOpacity style={styles.actionItem}>
              <View style={styles.actionLeft}>
                <History size={24} color="#666" />
                <Text style={styles.actionText}>Login History</Text>
              </View>
              <ChevronRight size={24} color="#ccc" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionItem}>
              <View style={styles.actionLeft}>
                <Smartphone size={24} color="#666" />
                <Text style={styles.actionText}>Manage Devices</Text>
              </View>
              <ChevronRight size={24} color="#ccc" />
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionItem, styles.lastActionItem]}>
              <View style={styles.actionLeft}>
                <LogOut size={24} color="#F44336" />
                <Text style={[styles.actionText, { color: '#F44336' }]}>Sign Out All Devices</Text>
              </View>
              <ChevronRight size={24} color="#ccc" />
            </TouchableOpacity>
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
  securityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  disabledOption: {
    opacity: 0.5,
  },
  disabledText: {
    color: '#ccc',
  },
  securityOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  securityOptionText: {
    marginLeft: 15,
    flex: 1,
  },
  securityOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  securityOptionDescription: {
    fontSize: 12,
    color: '#666',
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  lastActionItem: {
    borderBottomWidth: 0,
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 15,
    fontWeight: '500',
  },
  bottomSpacing: {
    height: 100,
  },
});