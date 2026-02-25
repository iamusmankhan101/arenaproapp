import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Platform,
  ActivityIndicator
} from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { theme } from '../../theme/theme';

const NOTIFICATIONS_STORAGE_KEY = '@notifications_state';

export default function NotificationScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { user } = useSelector(state => state.auth);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch real-time notifications from Firestore
  useEffect(() => {
    if (!user?.uid) {
      setIsLoading(false);
      return;
    }

    console.log('📬 NotificationScreen: Setting up real-time listener for user:', user.uid);

    // Subscribe to user's bookings for booking notifications
    const bookingsRef = collection(db, 'bookings');
    const bookingsQuery = query(
      bookingsRef,
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(bookingsQuery, (snapshot) => {
      const bookingNotifications = [];
      
      snapshot.forEach((doc) => {
        const booking = { id: doc.id, ...doc.data() };
        
        // Create notification based on booking status
        const notification = createBookingNotification(booking);
        if (notification) {
          bookingNotifications.push(notification);
        }
      });

      console.log('📬 Loaded booking notifications:', bookingNotifications.length);
      setNotifications(bookingNotifications);
      setIsLoading(false);
    }, (error) => {
      console.error('❌ Error fetching notifications:', error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  // Create notification object from booking data
  const createBookingNotification = (booking) => {
    if (!booking.createdAt) return null;

    const createdAt = booking.createdAt.toDate();
    const timeAgo = getTimeAgo(createdAt);
    const section = getSection(createdAt);

    // Determine notification type and content based on booking status
    let type, icon, title, message;

    switch (booking.status) {
      case 'confirmed':
        type = 'booking';
        icon = 'event-available';
        title = 'Booking Confirmed';
        message = String('Your booking at ' + (booking.venueName || 'venue') + ' has been confirmed for ' + formatBookingDate(booking.date) + ' at ' + booking.startTime + '.');
        break;
      
      case 'pending':
        type = 'booking';
        icon = 'schedule';
        title = 'Booking Pending';
        message = String('Your booking at ' + (booking.venueName || 'venue') + ' is pending confirmation. We\'ll notify you once confirmed.');
        break;
      
      case 'cancelled':
        type = 'booking';
        icon = 'cancel';
        title = 'Booking Cancelled';
        message = String('Your booking at ' + (booking.venueName || 'venue') + ' has been cancelled. ' + (booking.refundStatus ? 'Refund will be processed in 3-5 days.' : ''));
        break;
      
      case 'completed':
        type = 'booking';
        icon = 'check-circle';
        title = 'Booking Completed';
        message = String('Thank you for using Arena Pro. Your booking at ' + (booking.venueName || 'venue') + ' is complete.');
        break;
      
      default:
        // New booking notification
        type = 'booking';
        icon = 'event-available';
        title = 'New Booking Created';
        message = String('Your booking at ' + (booking.venueName || 'venue') + ' for ' + formatBookingDate(booking.date) + ' at ' + booking.startTime + ' has been created.');
    }

    // Add payment notification if payment was made
    if (booking.paymentStatus === 'paid' || booking.paymentStatus === 'partial') {
      // This could be a separate notification, but for now we'll just update the message
      if (booking.advancePaid > 0) {
        message = String(message + ' Advance payment of PKR ' + booking.advancePaid + ' received.');
      }
    }

    return {
      id: booking.id,
      type,
      icon,
      title,
      message,
      time: timeAgo,
      isRead: booking.notificationRead || false,
      section,
      createdAt,
      bookingId: booking.id
    };
  };

  // Format booking date for display
  const formatBookingDate = (dateString) => {
    if (!dateString) return 'upcoming date';
    
    try {
      const [year, month, day] = dateString.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      
      if (date.toDateString() === today.toDateString()) {
        return 'today';
      } else if (date.toDateString() === tomorrow.toDateString()) {
        return 'tomorrow';
      } else {
        return date.toLocaleDateString('en-US', { 
          weekday: 'short', 
          month: 'short', 
          day: 'numeric' 
        });
      }
    } catch (error) {
      return dateString;
    }
  };

  // Calculate time ago from timestamp
  const getTimeAgo = (date) => {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return String(diffMins + 'm');
    if (diffHours < 24) return String(diffHours + 'h');
    if (diffDays < 7) return String(diffDays + 'd');
    return String(Math.floor(diffDays / 7) + 'w');
  };

  // Determine section (today, yesterday, older)
  const getSection = (date) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const notifDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    if (notifDate.getTime() === today.getTime()) return 'today';
    if (notifDate.getTime() === yesterday.getTime()) return 'yesterday';
    return 'older';
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAllAsRead = async (section) => {
    const notificationsToUpdate = notifications.filter(
      n => n.section === section && !n.isRead
    );

    // Update in Firestore
    for (const notif of notificationsToUpdate) {
      try {
        const bookingRef = doc(db, 'bookings', notif.bookingId);
        await updateDoc(bookingRef, {
          notificationRead: true
        });
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }

    // Update local state
    setNotifications(prev =>
      prev.map(notif =>
        notif.section === section ? { ...notif, isRead: true } : notif
      )
    );
  };

  const markAsRead = async (id) => {
    const notification = notifications.find(n => n.id === id);
    if (!notification || notification.isRead) return;

    // Update in Firestore
    try {
      const bookingRef = doc(db, 'bookings', notification.bookingId);
      await updateDoc(bookingRef, {
        notificationRead: true
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }

    // Update local state
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
  const olderNotifications = notifications.filter(n => n.section === 'older');

  const NotificationCard = ({ notification }) => (
    <TouchableOpacity
      style={[
        styles.notificationCard,
        !notification.isRead && styles.unreadCard
      ]}
      onPress={() => {
        markAsRead(notification.id);
        // Navigate to booking details if it's a booking notification
        if (notification.type === 'booking' && notification.bookingId) {
          navigation.navigate('Bookings');
        }
      }}
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
          <Text style={styles.notificationTime}>{String(notification.time)}</Text>
        </View>
        <Text style={styles.notificationMessage} numberOfLines={3}>
          {notification.message}
        </Text>
      </View>

      {!notification.isRead && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );

  // Show loading state
  if (isLoading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
        <View style={[styles.header, { paddingTop: Platform.OS === 'ios' ? insets.top : 20 }]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialIcons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notification</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading notifications...</Text>
        </View>
      </View>
    );
  }

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
            <Text style={styles.badgeText}>{String(unreadCount + ' NEW')}</Text>
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

        {/* Older Section */}
        {olderNotifications.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>OLDER</Text>
              {olderNotifications.some(n => !n.isRead) && (
                <TouchableOpacity onPress={() => markAllAsRead('older')}>
                  <Text style={styles.markAllText}>Mark all as read</Text>
                </TouchableOpacity>
              )}
            </View>

            {olderNotifications.map(notification => (
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontFamily: 'Montserrat_400Regular',
  },
});
