import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Platform
} from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme } from '../../theme/theme';

const NOTIFICATIONS_STORAGE_KEY = '@notifications_state';

// Initial notifications data
const initialNotifications = [
    {
      id: 1,
      type: 'booking',
      icon: 'event-available',
      title: 'Booking Confirmed',
      message: 'Your booking at Arena Sports Complex has been confirmed for tomorrow at 6:00 PM.',
      time: '30m',
      isRead: false,
      section: 'today'
    },
    {
      id: 2,
      type: 'challenge',
      icon: 'emoji-events',
      title: 'Challenge Accepted',
      message: 'Team Warriors accepted your challenge! Match scheduled for Saturday at 5:00 PM.',
      time: '1h',
      isRead: false,
      section: 'today'
    },
    {
      id: 3,
      type: 'challenge',
      icon: 'sports-soccer',
      title: 'New Challenge Created',
      message: 'You created a challenge for Football at Green Field Arena. Waiting for opponents.',
      time: '2h',
      isRead: false,
      section: 'today'
    },
    {
      id: 4,
      type: 'challenge',
      icon: 'group-add',
      title: 'Challenge Request',
      message: 'Team Thunder challenged you to a Cricket match. Accept or decline the challenge.',
      time: '3h',
      isRead: false,
      section: 'today'
    },
    {
      id: 5,
      type: 'booking',
      icon: 'schedule',
      title: 'Booking Reminder',
      message: 'Your booking at City Sports Complex starts in 2 hours. Don\'t forget!',
      time: '4h',
      isRead: false,
      section: 'today'
    },
    {
      id: 6,
      type: 'offer',
      icon: 'local-offer',
      title: 'Exclusive Offers Inside',
      message: 'Get 20% off on your next booking at selected venues. Limited time offer!',
      time: '5h',
      isRead: false,
      section: 'today'
    },
    {
      id: 7,
      type: 'review',
      icon: 'star',
      title: 'Review Request',
      message: 'How was your experience at Green Field Arena? Share your feedback and help others.',
      time: '6h',
      isRead: false,
      section: 'today'
    },
    {
      id: 8,
      type: 'booking',
      icon: 'check-circle',
      title: 'Booking Completed',
      message: 'Thank you for using Arena Pro. Your booking at City Sports Complex is complete.',
      time: '1d',
      isRead: true,
      section: 'yesterday'
    },
    {
      id: 9,
      type: 'payment',
      icon: 'payment',
      title: 'Payment Successful',
      message: 'Your payment of PKR 2,500 has been processed successfully for Arena Sports Complex.',
      time: '1d',
      isRead: true,
      section: 'yesterday'
    },
    {
      id: 10,
      type: 'challenge',
      icon: 'emoji-events',
      title: 'Challenge Won!',
      message: 'Congratulations! Your team won the challenge against Team Strikers. Great game!',
      time: '1d',
      isRead: true,
      section: 'yesterday'
    },
    {
      id: 11,
      type: 'booking',
      icon: 'cancel',
      title: 'Booking Cancelled',
      message: 'Your booking at Paradise Arena has been cancelled. Refund will be processed in 3-5 days.',
      time: '1d',
      isRead: true,
      section: 'yesterday'
    },
    {
      id: 12,
      type: 'challenge',
      icon: 'sports-cricket',
      title: 'Challenge Declined',
      message: 'Team Eagles declined your challenge request. Try challenging another team.',
      time: '2d',
      isRead: true,
      section: 'yesterday'
    },
    {
      id: 13,
      type: 'system',
      icon: 'notifications-active',
      title: 'Welcome to Arena Pro',
      message: 'Start booking your favorite sports venues and join challenges with other teams!',
      time: '2d',
      isRead: true,
      section: 'yesterday'
    }
  ];

export default function NotificationScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [notifications, setNotifications] = useState(initialNotifications);
  const [isLoading, setIsLoading] = useState(true);

  // Load notifications state from AsyncStorage on mount
  useEffect(() => {
    loadNotifications();
  }, []);

  // Save notifications state to AsyncStorage whenever it changes
  useEffect(() => {
    if (!isLoading) {
      saveNotifications();
    }
  }, [notifications, isLoading]);

  const loadNotifications = async () => {
    try {
      const stored = await AsyncStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      if (stored) {
        const parsedNotifications = JSON.parse(stored);
        setNotifications(parsedNotifications);
      }
    } catch (error) {
      console.log('Error loading notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveNotifications = async () => {
    try {
      await AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications));
    } catch (error) {
      console.log('Error saving notifications:', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAllAsRead = (section) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.section === section ? { ...notif, isRead: true } : notif
      )
    );
  };

  const markAsRead = (id) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, isRead: true } : notif
      )
    );
  };

  const getIconColor = (type) => {
    switch (type) {
      case 'booking':
        return theme.colors.primary;
      case 'challenge':
        return '#9C27B0'; // Purple for challenges
      case 'offer':
        return '#FF9800'; // Orange for offers
      case 'review':
        return '#FFD700'; // Gold for reviews
      case 'payment':
        return '#4CAF50'; // Green for payments
      case 'system':
        return '#2196F3'; // Blue for system notifications
      default:
        return theme.colors.primary;
    }
  };

  const todayNotifications = notifications.filter(n => n.section === 'today');
  const yesterdayNotifications = notifications.filter(n => n.section === 'yesterday');

  const NotificationCard = ({ notification }) => (
    <TouchableOpacity
      style={[
        styles.notificationCard,
        !notification.isRead && styles.unreadCard
      ]}
      onPress={() => markAsRead(notification.id)}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: `${getIconColor(notification.type)}15` }]}>
        <MaterialIcons
          name={notification.icon}
          size={24}
          color={getIconColor(notification.type)}
        />
      </View>

      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <Text style={styles.notificationTitle} numberOfLines={1}>
            {notification.title}
          </Text>
          <Text style={styles.notificationTime}>{notification.time}</Text>
        </View>
        <Text style={styles.notificationMessage} numberOfLines={3}>
          {notification.message}
        </Text>
      </View>

      {!notification.isRead && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: Platform.OS === 'ios' ? insets.top : 20 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Notification</Text>

        {unreadCount > 0 && (
          <View style={styles.badgeContainer}>
            <Text style={styles.badgeText}>{unreadCount} NEW</Text>
          </View>
        )}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Platform.OS === 'android' ? 40 + insets.bottom : 40 }
        ]}
      >
        {/* Today Section */}
        {todayNotifications.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>TODAY</Text>
              {todayNotifications.some(n => !n.isRead) && (
                <TouchableOpacity onPress={() => markAllAsRead('today')}>
                  <Text style={styles.markAllText}>Mark all as read</Text>
                </TouchableOpacity>
              )}
            </View>

            {todayNotifications.map(notification => (
              <NotificationCard key={notification.id} notification={notification} />
            ))}
          </View>
        )}

        {/* Yesterday Section */}
        {yesterdayNotifications.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>YESTERDAY</Text>
              {yesterdayNotifications.some(n => !n.isRead) && (
                <TouchableOpacity onPress={() => markAllAsRead('yesterday')}>
                  <Text style={styles.markAllText}>Mark all as read</Text>
                </TouchableOpacity>
              )}
            </View>

            {yesterdayNotifications.map(notification => (
              <NotificationCard key={notification.id} notification={notification} />
            ))}
          </View>
        )}

        {/* Empty State */}
        {notifications.length === 0 && (
          <View style={styles.emptyState}>
            <MaterialIcons name="notifications-none" size={80} color="#E0E0E0" />
            <Text style={styles.emptyTitle}>No Notifications</Text>
            <Text style={styles.emptyMessage}>
              You're all caught up! Check back later for updates.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
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
    flex: 1,
    textAlign: 'center',
    marginRight: 40,
  },
  badgeContainer: {
    position: 'absolute',
    right: 20,
    top: Platform.OS === 'ios' ? 60 : 20,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.secondary,
    fontFamily: 'ClashDisplay-Medium',
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    fontFamily: 'Montserrat_600SemiBold',
    letterSpacing: 0.5,
  },
  markAllText: {
    fontSize: 14,
    color: theme.colors.primary,
    fontFamily: 'Montserrat_500Medium',
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    position: 'relative',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  unreadCard: {
    backgroundColor: `${theme.colors.primary}05`,
    borderWidth: 1,
    borderColor: `${theme.colors.primary}20`,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    fontFamily: 'ClashDisplay-Medium',
    flex: 1,
    marginRight: 8,
  },
  notificationTime: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontFamily: 'Montserrat_400Regular',
  },
  notificationMessage: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
    fontFamily: 'Montserrat_400Regular',
  },
  unreadDot: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
    fontFamily: 'ClashDisplay-Medium',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    fontFamily: 'Montserrat_400Regular',
    paddingHorizontal: 40,
    lineHeight: 20,
  },
});
