import { View, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { Text, Avatar } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { MaterialIcons } from '@expo/vector-icons';
import { User, Lock, Heart, Phone } from '../../components/LucideIcons';

export default function ProfileScreen({ navigation }) {
  // Updated Profile Screen with modern UI design
  const dispatch = useDispatch();
  const { user, isAuthenticated, loading } = useSelector(state => state.auth);

  // Show loading state if auth is still initializing
  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text>Loading...</Text>
      </View>
    );
  }

  // Fallback user data if not authenticated or user data is missing
  const userData = user || {
    fullName: 'Guest User',
    email: 'guest@example.com'
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

  const menuItems = [
    {
      id: 'manage-profile',
      title: 'Manage Profile',
      icon: User,
      onPress: () => navigation.navigate('ManageProfile')
    },
    {
      id: 'password-security',
      title: 'Password & Security',
      icon: Lock,
      onPress: () => navigation.navigate('PasswordSecurity')
    },
    {
      id: 'favorites',
      title: 'My Favourites',
      icon: Heart,
      onPress: () => navigation.navigate('Favorites')
    },
    {
      id: 'contact-us',
      title: 'Contact Us',
      icon: Phone,
      onPress: () => console.log('Contact Us')
    }
  ];

  const renderMenuItem = (item, index) => (
    <TouchableOpacity
      key={item.id}
      style={[
        styles.menuItem,
        index === menuItems.length - 1 && styles.lastMenuItem
      ]}
      onPress={item.onPress}
      activeOpacity={0.7}
    >
      <View style={styles.menuItemLeft}>
        <item.icon size={24} color="#666" />
        <Text style={styles.menuItemText}>{item.title}</Text>
      </View>
      <MaterialIcons name="chevron-right" size={24} color="#ccc" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* User Profile Card */}
        <View style={styles.profileCard}>
          <Avatar.Text 
            size={80} 
            label={userData?.fullName?.charAt(0) || 'U'} 
            style={styles.avatar}
            labelStyle={styles.avatarLabel}
          />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>
              {userData?.fullName || 'Guest User'}
            </Text>
            <Text style={styles.userEmail}>
              {userData?.email || 'guest@example.com'}
            </Text>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => renderMenuItem(item, index))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <MaterialIcons name="logout" size={24} color="#ffffffff" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

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
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  profileCard: {
    backgroundColor: '#004d43',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatar: {
    backgroundColor: '#cdec6a', // Primary brand color
    marginRight: 16,
  },
  avatarLabel: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#004d43', // Primary color text on secondary background
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white', // White text for contrast
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)', // Semi-transparent white for email
  },
  menuContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  lastMenuItem: {
    borderBottomWidth: 0,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 16,
    fontWeight: '500',
  },
  logoutButton: {
    backgroundColor: '#ed0000',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  logoutText: {
    fontSize: 16,
    color: '#ffffffff',
    marginLeft: 12,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 100,
  },
});