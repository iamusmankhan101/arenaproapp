import React, { useState } from 'react';

import { View, StyleSheet, ScrollView, Alert, TouchableOpacity, Modal, Image, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, Avatar } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import {
  User,
  Mail,
  Phone,
  Home,
  Edit,
  Settings,
  Lock,
  Heart,
  LogOut,
  ChevronRight
} from '../../components/LucideIcons';

export default function ProfileScreen({ navigation }) {
  const dispatch = useDispatch();
  const { user, loading } = useSelector(state => state.auth);

  const [contactModalVisible, setContactModalVisible] = useState(false);
  const insets = useSafeAreaInsets();

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const userData = user || {
    fullName: 'Guest User',
    email: 'guest@example.com',
    phone: '+1 234 567 890',
    address: '123 Main St, City, Country'
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => dispatch(logout())
        }
      ]
    );
  };

  const InfoRow = ({ icon: IconComponent, label, value }) => (
    <View style={styles.infoRow}>
      <View style={styles.iconContainer}>
        <IconComponent size={24} color="#004d43" />
      </View>
      <View style={styles.infoTextContainer}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value || 'Not set'}</Text>
      </View>
    </View>
  );

  const MenuRow = ({ icon: IconComponent, title, onPress, showChevron = true, color = "#333" }) => (
    <TouchableOpacity style={styles.menuRow} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.menuLeft}>
        <View style={styles.menuIconContainer}>
          <IconComponent size={22} color={color === "#333" ? "#004d43" : color} />
        </View>
        <Text style={[styles.menuTitle, { color }]}>{title}</Text>
      </View>
      {showChevron && <ChevronRight size={20} color="#ccc" />}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Platform.OS === 'android' ? 40 + insets.bottom + 60 : 40 }
        ]}
        showsVerticalScrollIndicator={false}
      >

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>

        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            {userData?.photoURL ? (
              <View style={[styles.avatar, { overflow: 'hidden', borderRadius: 50, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }]}>
                <Image
                  source={{ uri: userData.photoURL }}
                  style={{ width: 100, height: 100 }}
                />
              </View>
            ) : (
              <Avatar.Text
                size={100}
                label={userData?.fullName?.charAt(0) || 'U'}
                style={styles.avatar}
                labelStyle={styles.avatarLabel}
              />
            )}
            <TouchableOpacity style={styles.editAvatarButton}>
              <Edit size={16} color="#004d43" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Personal Info Card */}
        <View style={styles.sectionCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Personal info</Text>
            <TouchableOpacity onPress={() => navigation.navigate('ManageProfile')}>
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.cardContent}>
            <InfoRow
              icon={User}
              label="Name"
              value={userData.fullName}
            />
            <InfoRow
              icon={Mail}
              label="E-mail"
              value={userData.email}
            />
            <InfoRow
              icon={Phone}
              label="Phone number"
              value={userData.phone || user?.phoneNumber}
            />
            <InfoRow
              icon={Home}
              label="Home address"
              value={userData.address}
            />
          </View>
        </View>

        {/* Account Info Card */}
        <View style={styles.sectionCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Account info</Text>
          </View>

          <View style={styles.cardContent}>
            <MenuRow
              icon={Heart}
              title="My Favourites"
              onPress={() => navigation.navigate('Favorites')}
            />
            <MenuRow
              icon={Lock}
              title="Password & Security"
              onPress={() => navigation.navigate('PasswordSecurity')}
            />
            {/* 
              // Removed "Contact Us" to make it cleaner or keep it if needed. 
              // Re-adding it as it was in original.
            */}
            <MenuRow
              icon={Phone}
              title="Contact Us"
              onPress={() => setContactModalVisible(true)}
            />
            <MenuRow
              icon={LogOut}
              title="Logout"
              color="#ff4444"
              showChevron={false}
              onPress={handleLogout}
            />
          </View>
        </View>

        <View style={styles.bottomSpacing} />

        {/* Contact Us Modal */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={contactModalVisible}
          onRequestClose={() => setContactModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Contact Support</Text>
                <TouchableOpacity onPress={() => setContactModalVisible(false)} style={styles.closeButton}>
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.contactItem}>
                <View style={styles.contactIconCircle}>
                  <Phone size={20} color="#004d43" />
                </View>
                <View>
                  <Text style={styles.contactLabel}>Phone</Text>
                  <Text style={styles.contactValue}>03390078965</Text>
                </View>
              </View>

              <View style={styles.contactItem}>
                <View style={styles.contactIconCircle}>
                  <Mail size={20} color="#004d43" />
                </View>
                <View>
                  <Text style={styles.contactLabel}>Email</Text>
                  <Text style={styles.contactValue}>support@arenapro.pk</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setContactModalVisible(false)}
              >
                <Text style={styles.modalCloseBtnText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA', // Light grey background
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    backgroundColor: '#E0E0E0',
  },
  avatarLabel: {
    fontSize: 40,
    fontWeight: '600',
    color: '#555',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'white',
    padding: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionCard: {
    backgroundColor: 'white',
    borderRadius: 24,
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  cardContent: {
    gap: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    alignItems: 'flex-start',
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 2,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 15,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4, // Add a little vertical padding for touch target
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIconContainer: {
    width: 40,
    alignItems: 'flex-start',
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: '500',
  },
  bottomSpacing: {
    height: 80,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#004d43',
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 20,
    color: '#004d43',
    fontWeight: '600',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 16,
  },
  contactIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 77, 67, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  contactLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
    fontWeight: '500',
  },
  contactValue: {
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '600',
  },
  modalCloseBtn: {
    backgroundColor: '#004d43',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  modalCloseBtnText: {
    color: '#e8ee26',
    fontSize: 16,
    fontWeight: '600',
  },
});