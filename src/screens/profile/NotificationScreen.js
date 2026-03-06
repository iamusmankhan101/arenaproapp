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
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, writeBatch } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { theme } from '../../theme/theme';
import { NotificationSkeleton } from '../../components/SkeletonLoader';

export default function NotificationScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { user } = useSelector(state => state.auth);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch real-time notifications from Firestore notifications collection + bookings
  useEffect(() => {
    if (!user?.uid) {
      setIsLoading(false);
      return;
    }

    console.log('📬 NotificationScreen: Setting up listeners for user:', user.uid);

    const allNotifications = { fromNotifs: [], fromBookings: [] };

    // 1. Listen to 'notifications' collection for all notification types
    const notifsRef = collection(db, 'notifications');
    const notifsQuery = query(
      notifsRef,
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubNotifs = onSnapshot(notifsQuery, (snapshot) => {
      const notifs = [];
      snapshot.forEach((docSnap) => {
        const data = { id: docSnap.id, ...docSnap.data() };
        const createdAt = data.createdAt?.toDate() || new Date();
        notifs.push({
          id: docSnap.id,
          type: data.type || 'system',
          icon: data.icon || 'notifications',
          title: data.title || 'Notification',
          message: data.message || '',
          time: getTimeAgo(createdAt),
          isRead: data.read || false,
          section: getSection(createdAt),
          createdAt,
          data: data.data || {},
          source: 'notifications',
        });
      });
      allNotifications.fromNotifs = notifs;
      mergeAndSetNotifications(allNotifications);
    }, (error) => {
      console.error('❌ Error fetching notifications:', error);
    });

    // 2. Listen to 'bookings' collection for booking notifications (backward compat)
    const bookingsRef = collection(db, 'bookings');
    const bookingsQuery = query(
      bookingsRef,
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubBookings = onSnapshot(bookingsQuery, (snapshot) => {
      const bookingNotifs = [];
      snapshot.forEach((docSnap) => {
        const booking = { id: docSnap.id, ...docSnap.data() };
        const notification = createBookingNotification(booking);
        if (notification) {
          bookingNotifs.push(notification);
        }
      });
      allNotifications.fromBookings = bookingNotifs;
      mergeAndSetNotifications(allNotifications);
    }, (error) => {
      console.error('❌ Error fetching booking notifications:', error);
    });

    setIsLoading(false);

    return () => {
      unsubNotifs();
      unsubBookings();
    };
  }, [user?.uid]);

  // Merge notifications from both sources, deduplicate by type+id, sort by date
  const mergeAndSetNotifications = (sources) => {
    const all = [...sources.fromNotifs, ...sources.fromBookings];
    // Sort by createdAt desc
    all.sort((a, b) => b.createdAt - a.createdAt);
    setNotifications(all);
  };

  // Create notification object from booking data
  const createBookingNotification = (booking) => {
    if (!booking.createdAt) return null;

    const createdAt = booking.createdAt.toDate ? booking.createdAt.toDate() : new Date(booking.createdAt);
    const timeAgo = getTimeAgo(createdAt);
    const section = getSection(createdAt);

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
        message = String('Your booking at ' + (booking.venueName || 'venue') + ' is pending confirmation.');
        break;
      case 'cancelled':
        type = 'booking';
        icon = 'cancel';
        title = 'Booking Cancelled';
        message = String('Your booking at ' + (booking.venueName || 'venue') + ' has been cancelled.');
        break;
      case 'completed':
        type = 'booking';
        icon = 'check-circle';
        title = 'Booking Completed';
        message = String('Your booking at ' + (booking.venueName || 'venue') + ' is complete.');
        break;
      default:
        type = 'booking';
        icon = 'event-available';
        title = 'New Booking';
        message = String('Your booking at ' + (booking.venueName || 'venue') + ' for ' + formatBookingDate(booking.date) + ' has been created.');
    }

    if (booking.advancePaid > 0) {
      message = String(message + ' Advance: PKR ' + booking.advancePaid + '.');
    }

    return {
      id: 'booking_' + booking.id,
      type,
      icon,
      title,
      message,
      time: timeAgo,
      isRead: booking.notificationRead || false,
      section,
      createdAt,
      data: { bookingId: booking.id },
      source: 'bookings',
    };
  };

  const formatBookingDate = (dateString) => {
    if (!dateString) return 'upcoming date';
    try {
      const [year, month, day] = dateString.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      if (date.toDateString() === today.toDateString()) return 'today';
      if (date.toDateString() === tomorrow.toDateString()) return 'tomorrow';
      return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    } catch (error) {
      return dateString;
    }
  };

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
    const toUpdate = notifications.filter(n => n.section === section && !n.isRead);

    for (const notif of toUpdate) {
      try {
        if (notif.source === 'notifications') {
          const notifRef = doc(db, 'notifications', notif.id);
          await updateDoc(notifRef, { read: true });
        } else if (notif.source === 'bookings') {
          const bookingId = notif.data?.bookingId || notif.id.replace('booking_', '');
          const bookingRef = doc(db, 'bookings', bookingId);
          await updateDoc(bookingRef, { notificationRead: true });
        }
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }

    setNotifications(prev =>
      prev.map(notif =>
        notif.section === section ? { ...notif, isRead: true } : notif
      )
    );
  };

  const markAsRead = async (id) => {
    const notification = notifications.find(n => n.id === id);
    if (!notification || notification.isRead) return;

    try {
      if (notification.source === 'notifications') {
        const notifRef = doc(db, 'notifications', notification.id);
        await updateDoc(notifRef, { read: true });
      } else if (notification.source === 'bookings') {
        const bookingId = notification.data?.bookingId || notification.id.replace('booking_', '');
        const bookingRef = doc(db, 'bookings', bookingId);
        await updateDoc(bookingRef, { notificationRead: true });
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }

    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, isRead: true } : notif
      )
    );
  };

  const getIconColor = (type) => {
    switch (type) {
      case 'booking': return theme.colors.primary;
      case 'challenge': return '#9C27B0';
      case 'squad': return '#FF5722';
      case 'offer': return '#FF9800';
      case 'payment': return '#4CAF50';
      case 'system': return '#2196F3';
      default: return theme.colors.primary;
    }
  };

  const handleNotificationPress = (notification) => {
    markAsRead(notification.id);
    const data = notification.data || {};

    if (notification.type === 'booking') {
      navigation.navigate('MainTabs', { screen: 'Bookings' });
    } else if (notification.type === 'challenge') {
      if (data.challengeId) {
        navigation.navigate('ChallengeDetail', { challengeId: data.challengeId });
      } else {
        navigation.navigate('MainTabs', { screen: 'Lalkaar' });
      }
    } else if (notification.type === 'squad') {
      navigation.navigate('MainTabs', { screen: 'SquadBuilder' });
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
      onPress={() => handleNotificationPress(notification)}
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

  const renderSection = (title, sectionNotifications, sectionKey) => {
    if (sectionNotifications.length === 0) return null;
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{title}</Text>
          {sectionNotifications.some(n => !n.isRead) && (
            <TouchableOpacity onPress={() => markAllAsRead(sectionKey)}>
              <Text style={styles.markAllText}>Mark all as read</Text>
            </TouchableOpacity>
          )}
        </View>
        {sectionNotifications.map(notification => (
          <NotificationCard key={notification.id} notification={notification} />
        ))}
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
        <View style={[styles.header, { paddingTop: Platform.OS === 'ios' ? insets.top : 20 }]}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notification</Text>
        </View>
        <NotificationSkeleton />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />

      <View style={[styles.header, { paddingTop: Platform.OS === 'ios' ? insets.top : 20 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
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
        {renderSection('TODAY', todayNotifications, 'today')}
        {renderSection('YESTERDAY', yesterdayNotifications, 'yesterday')}
        {renderSection('OLDER', olderNotifications, 'older')}

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
    paddingTop: 16,
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
