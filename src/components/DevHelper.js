import React, { useState } from 'react';
import { View, StyleSheet, Modal, ScrollView } from 'react-native';
import { Text, Button, Card, IconButton } from 'react-native-paper';
import { useDispatch } from 'react-redux';
import { getMockUsers } from '../services/mockAuth';
import { devBypassAuth } from '../store/slices/authSlice';
import { DEV_CONFIG } from '../config/devConfig';

export default function DevHelper() {
  const [visible, setVisible] = useState(false);
  const dispatch = useDispatch();
  
  if (!__DEV__) {
    return null; // Don't show in production
  }

  const mockUsers = getMockUsers();

  const handleBypassAuth = async () => {
    try {
      await dispatch(devBypassAuth()).unwrap();
      setVisible(false);
    } catch (error) {
      console.error('Failed to bypass auth:', error);
    }
  };

  return (
    <>
      {/* Floating dev button */}
      <View style={styles.floatingButton}>
        <IconButton
          icon="developer-board"
          size={24}
          iconColor="white"
          style={styles.devButton}
          onPress={() => setVisible(true)}
        />
      </View>

      {/* Dev helper modal */}
      <Modal
        visible={visible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Card style={styles.modalCard}>
            <Card.Title 
              title="Development Helper" 
              subtitle="Mock user credentials for testing"
              right={(props) => (
                <IconButton
                  {...props}
                  icon="close"
                  onPress={() => setVisible(false)}
                />
              )}
            />
            <Card.Content>
              <ScrollView style={styles.scrollView}>
                {/* Quick Bypass Button */}
                <Card style={styles.bypassCard}>
                  <Card.Content>
                    <Text variant="titleMedium" style={styles.bypassTitle}>
                      🚀 Quick Access
                    </Text>
                    <Text variant="bodyMedium" style={styles.bypassDescription}>
                      Skip login and go directly to the dashboard
                    </Text>
                    <Button 
                      mode="contained" 
                      onPress={handleBypassAuth}
                      style={styles.bypassButton}
                      contentStyle={styles.bypassButtonContent}
                    >
                      Bypass Login
                    </Button>
                  </Card.Content>
                </Card>
                
                <Text variant="titleMedium" style={styles.sectionTitle}>
                  Test Users:
                </Text>
                
                {mockUsers.map((user, index) => (
                  <Card key={user.id} style={styles.userCard}>
                    <Card.Content>
                      <Text variant="bodyMedium">
                        <Text style={styles.label}>Name:</Text> {user.fullName}
                      </Text>
                      <Text variant="bodyMedium">
                        <Text style={styles.label}>Phone:</Text> {user.phoneNumber}
                      </Text>
                      <Text variant="bodyMedium">
                        <Text style={styles.label}>Password:</Text> {user.password}
                      </Text>
                    </Card.Content>
                  </Card>
                ))}
                
                <Text variant="titleMedium" style={styles.sectionTitle}>
                  OTP Testing:
                </Text>
                <Text variant="bodyMedium" style={styles.otpInfo}>
                  • OTP codes are logged to console
                  • Any 6-digit code works in development
                  • OTP expires in 5 minutes
                  • Max 3 attempts per OTP
                </Text>
                
                <Text variant="titleMedium" style={styles.sectionTitle}>
                  Development Settings:
                </Text>
                <Text variant="bodyMedium" style={styles.settingsInfo}>
                  • Auto-bypass: {DEV_CONFIG.BYPASS_AUTH ? '✅ Enabled' : '❌ Disabled'}
                  • Mock API: {DEV_CONFIG.LOG_API_CALLS ? '✅ Enabled' : '❌ Disabled'}
                  • Dev Helper: {DEV_CONFIG.SHOW_DEV_HELPER ? '✅ Visible' : '❌ Hidden'}
                </Text>
                
                <Text variant="titleMedium" style={styles.sectionTitle}>
                  Quick Test Numbers:
                </Text>
                <Text variant="bodyMedium">
                  • 03001234567 (existing user)
                  • 03009876543 (existing user)
                  • 03001111111 (for new signups)
                </Text>
              </ScrollView>
            </Card.Content>
            <Card.Actions>
              <Button onPress={() => setVisible(false)}>
                Close
              </Button>
            </Card.Actions>
          </Card>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    top: 100,
    right: 20,
    zIndex: 1000,
  },
  devButton: {
    backgroundColor: '#337f35',
    borderRadius: 25,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxHeight: '80%',
    borderRadius: 12,
  },
  scrollView: {
    maxHeight: 400,
  },
  sectionTitle: {
    marginTop: 16,
    marginBottom: 8,
    color: '#337f35',
    fontWeight: 'bold',
  },
  userCard: {
    marginBottom: 8,
    backgroundColor: '#f5f5f5',
  },
  label: {
    fontWeight: 'bold',
    color: '#333',
  },
  otpInfo: {
    backgroundColor: '#e8f5e8',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  bypassCard: {
    marginBottom: 16,
    backgroundColor: '#e3f2fd',
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  bypassTitle: {
    color: '#1976D2',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  bypassDescription: {
    color: '#424242',
    marginBottom: 12,
  },
  bypassButton: {
    backgroundColor: '#337f35',
  },
  bypassButtonContent: {
    paddingVertical: 4,
  },
  settingsInfo: {
    backgroundColor: '#fff3e0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    fontFamily: 'monospace',
  },
});