import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  Image,
  Platform,
  StatusBar,
  Modal,
  Linking
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, Avatar } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../theme/theme';

export default function ProfileScreen({ navigation }) {
  const dispatch = useDispatch();
  const { user, loading } = useSelector(state => state.auth);
  const insets = useSafeAreaInsets();
  const [supportModalVisible, setSupportModalVisible] = useState(false);

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text>Loading...</Text>
      </View>
    );
  }

  // Normalize user data to handle different field names
  const userData = user ? {
    fullName: user.fullName || user.displayName || 'User',
    email: user.email || 'Not set',
    phoneNumber: user.phoneNumber || user.phone || null,
    city: user.city || null,
    photoURL: user.photoURL || user.profilePicture || null,
    uid: user.uid
  } : {
    fullName: 'Guest User',
    email: 'guest@example.com',
    phoneNumber: null,
    city: null
  };

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: () => dispatch(logout())
        }
      ]
    );
  };

  const handleContactSupport = (method) => {
    setSupportModalVisible(false);
    
    switch (method) {
      case 'email':
        Linking.openURL('mailto:support@arenapro.pk');
        break;
      case 'phone':
        Linking.openURL('tel:+923390078965');
        break;
      case 'whatsapp':
        Linking.openURL('whatsapp://send?phone=923390078965');
        break;
      default:
        break;
    }
  };

  const MenuItem = ({ icon, title, onPress, showChevron = true, isLogout = false }) => (
    <TouchableOpacity
      style={[styles.menuItem, isLogout && styles.logoutItem]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.menuLeft}>
        <View style={[styles.menuIconContainer, isLogout && styles.logoutIconContainer]}>
          <MaterialIcons
            name={icon}
            size={22}
            color={isLogout ? '#FF3B30' : theme.colors.primary}
          />
        </View>
        <Text style={[styles.menuTitle, isLogout && styles.logoutTitle]}>{String(title)}</Text>
      </View>
      {showChevron && (
        <MaterialIcons name="chevron-right" size={24} color="#C7C7CC" />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Platform.OS === 'android' ? 40 + insets.bottom + 60 : 40 }
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialIcons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={styles.headerRight} />
        </View>

        {/* Profile Avatar & Name */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            {userData?.photoURL ? (
              <Image
                source={{ uri: userData.photoURL }}
                style={styles.avatarImage}
              />
            ) : (
              <Avatar.Text
                size={120}
                label={userData?.fullName?.charAt(0) || 'U'}
                style={styles.avatar}
                labelStyle={styles.avatarLabel}
                color={theme.colors.secondary}
              />
            )}
            <TouchableOpacity
              style={styles.editAvatarButton}
              onPress={() => navigation.navigate('ManageProfile')}
            >
              <MaterialIcons name="edit" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>{String(userData.fullName)}</Text>
        </View>

        {/* Personal Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Info</Text>
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <View style={styles.infoLeft}>
                <MaterialIcons name="person" size={20} color={theme.colors.textSecondary} />
                <Text style={styles.infoLabel}>Name</Text>
              </View>
              <Text style={styles.infoValue}>{String(userData.fullName)}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <View style={styles.infoLeft}>
                <MaterialIcons name="email" size={20} color={theme.colors.textSecondary} />
                <Text style={styles.infoLabel}>Email</Text>
              </View>
              <Text style={styles.infoValue} numberOfLines={1}>
                {userData.email}
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <View style={styles.infoLeft}>
                <MaterialIcons name="phone" size={20} color={theme.colors.textSecondary} />
                <Text style={styles.infoLabel}>Phone</Text>
              </View>
              <Text style={styles.infoValue}>
                {userData.phoneNumber || 'Not set'}
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <View style={styles.infoLeft}>
                <MaterialIcons name="location-city" size={20} color={theme.colors.textSecondary} />
                <Text style={styles.infoLabel}>City</Text>
              </View>
              <Text style={styles.infoValue}>
                {userData.city || 'Not set'}
              </Text>
            </View>
          </View>
        </View>

        {/* Account Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Info</Text>
          <View style={styles.card}>
            <MenuItem
              icon="person"
              title="Edit Profile"
              onPress={() => navigation.navigate('ManageProfile')}
            />

            <View style={styles.divider} />

            <MenuItem
              icon="favorite"
              title="My Favorites"
              onPress={() => navigation.navigate('Favorites')}
            />

            <View style={styles.divider} />

            <MenuItem
              icon="lock"
              title="Password & Security"
              onPress={() => navigation.navigate('PasswordSecurity')}
            />

            <View style={styles.divider} />

            <MenuItem
              icon="support-agent"
              title="Contact Support"
              onPress={() => setSupportModalVisible(true)}
            />
          </View>
        </View>

        {/* Log Out */}
        <View style={styles.section}>
          <View style={styles.card}>
            <MenuItem
              icon="logout"
              title="Log Out"
              onPress={handleLogout}
              showChevron={false}
              isLogout={true}
            />
          </View>
        </View>
      </ScrollView>

      {/* Contact Support Modal */}
      <Modal
        visible={supportModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSupportModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <MaterialIcons name="support-agent" size={48} color={theme.colors.primary} />
              <Text style={styles.modalTitle}>Contact Support</Text>
              <Text style={styles.modalSubtitle}>
                How would you like to reach us?
              </Text>
            </View>

            <View style={styles.contactOptions}>
              <TouchableOpacity
                style={styles.contactOption}
                onPress={() => handleContactSupport('email')}
                activeOpacity={0.7}
              >
                <View style={styles.contactIconContainer}>
                  <MaterialIcons name="email" size={24} color={theme.colors.primary} />
                </View>
                <View style={styles.contactInfo}>
                  <Text style={styles.contactLabel}>Email</Text>
                  <Text style={styles.contactValue}>support@arenapro.pk</Text>
                </View>
                <MaterialIcons name="chevron-right" size={24} color="#C7C7CC" />
              </TouchableOpacity>

              <View style={styles.contactDivider} />

              <TouchableOpacity
                style={styles.contactOption}
                onPress={() => handleContactSupport('phone')}
                activeOpacity={0.7}
              >
                <View style={styles.contactIconContainer}>
                  <MaterialIcons name="phone" size={24} color={theme.colors.primary} />
                </View>
                <View style={styles.contactInfo}>
                  <Text style={styles.contactLabel}>Phone</Text>
                  <Text style={styles.contactValue}>+92 339 0078965</Text>
                </View>
                <MaterialIcons name="chevron-right" size={24} color="#C7C7CC" />
              </TouchableOpacity>

              <View style={styles.contactDivider} />

              <TouchableOpacity
                style={styles.contactOption}
                onPress={() => handleContactSupport('whatsapp')}
                activeOpacity={0.7}
              >
                <View style={styles.contactIconContainer}>
                  <MaterialIcons name="chat" size={24} color={theme.colors.primary} />
                </View>
                <View style={styles.contactInfo}>
                  <Text style={styles.contactLabel}>WhatsApp</Text>
                  <Text style={styles.contactValue}>+92 339 0078965</Text>
                </View>
                <MaterialIcons name="chevron-right" size={24} color="#C7C7CC" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setSupportModalVisible(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
    fontFamily: 'ClashDisplay-Medium',
  },
  headerRight: {
    width: 40,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    backgroundColor: theme.colors.primary,
  },
  avatarImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  avatarLabel: {
    fontSize: 48,
    fontWeight: '700',
    fontFamily: 'ClashDisplay-Medium',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: theme.colors.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: theme.colors.background,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
    fontFamily: 'ClashDisplay-Medium',
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 12,
    fontFamily: 'ClashDisplay-Medium',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  infoLabel: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    marginLeft: 12,
    fontFamily: 'Montserrat_500Medium',
  },
  infoValue: {
    fontSize: 15,
    color: theme.colors.text,
    fontFamily: 'Montserrat_500Medium',
    textAlign: 'right',
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: `${theme.colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuTitle: {
    fontSize: 15,
    color: theme.colors.text,
    fontFamily: 'Montserrat_500Medium',
  },
  logoutItem: {
    paddingVertical: 12,
  },
  logoutIconContainer: {
    backgroundColor: '#FF3B3015',
  },
  logoutTitle: {
    color: '#FF3B30',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.colors.text,
    marginTop: 16,
    marginBottom: 8,
    fontFamily: 'ClashDisplay-Medium',
  },
  modalSubtitle: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    fontFamily: 'Montserrat_400Regular',
  },
  contactOptions: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 8,
    marginBottom: 20,
  },
  contactOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  contactIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${theme.colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  contactInfo: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
    fontFamily: 'Montserrat_600SemiBold',
  },
  contactValue: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontFamily: 'Montserrat_400Regular',
  },
  contactDivider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 12,
  },
  modalCloseButton: {
    paddingVertical: 16,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  modalCloseText: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.secondary,
    fontFamily: 'ClashDisplay-Medium',
  },
});
