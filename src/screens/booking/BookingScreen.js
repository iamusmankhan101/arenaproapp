import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  RefreshControl,
  Platform
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Text,
  Chip,
  Button,
  SegmentedButtons,
  Searchbar,
  Surface
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserBookings } from '../../store/slices/bookingSlice';
import BookingCard from '../../components/BookingCard';
import { MaterialIcons } from '@expo/vector-icons';
import { safeDate } from '../../utils/dateUtils';
import { theme } from '../../theme/theme';
import { useFocusEffect } from '@react-navigation/native';

export default function BookingScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [selectedTab, setSelectedTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const dispatch = useDispatch();
  const { userBookings, loading } = useSelector(state => state.booking);

  useEffect(() => {
    console.log('📱 BOOKING_SCREEN: Component mounted, fetching user bookings...');
    dispatch(fetchUserBookings());
  }, [dispatch]);

  // Refresh bookings when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      console.log('📱 BOOKING_SCREEN: Screen focused, refreshing bookings...');
      dispatch(fetchUserBookings());
    }, [dispatch])
  );

  const onRefresh = async () => {
    console.log('📱 BOOKING_SCREEN: Pull-to-refresh triggered');
    setRefreshing(true);
    await dispatch(fetchUserBookings());
    setRefreshing(false);
    console.log('📱 BOOKING_SCREEN: Pull-to-refresh completed');
  };

  useEffect(() => {
    dispatch(fetchUserBookings());
  }, [dispatch]);

  const filterBookings = (bookings, filter) => {
    console.log('📱 BOOKING_SCREEN: Filtering bookings...', {
      totalBookings: bookings.length,
      selectedTab: filter,
      searchQuery,
      sampleBooking: bookings[0] ? {
        id: bookings[0].id,
        dateTime: bookings[0].dateTime,
        status: bookings[0].status,
        turfName: bookings[0].turfName
      } : 'No bookings'
    });

    const now = new Date();
    try {
      console.log('📱 BOOKING_SCREEN: Current time for filtering:', now.toISOString());
    } catch (error) {
      console.error('❌ BookingScreen: Error getting current time ISO string:', error);
    }

    let filtered = [];
    switch (filter) {
      case 'upcoming':
        filtered = bookings.filter(booking => {
          // Handle both dateTime and separate date/time fields
          let bookingDate;
          if (booking.dateTime) {
            bookingDate = safeDate(booking.dateTime);
          } else if (booking.date && booking.startTime) {
            bookingDate = safeDate(`${booking.date}T${booking.startTime}:00`);
          } else {
            console.warn('📱 BOOKING_SCREEN: Booking missing date/time info:', booking);
            return false;
          }

          const isUpcoming = bookingDate > now && booking.status !== 'cancelled';
          console.log('📱 BOOKING_SCREEN: Checking upcoming booking:', {
            id: booking.id,
            dateTime: booking.dateTime,
            calculatedDate: bookingDate.toISOString(),
            status: booking.status,
            isUpcoming,
            timeDiff: (bookingDate - now) / (1000 * 60 * 60) // hours
          });
          return isUpcoming;
        });
        break;
      case 'past':
        filtered = bookings.filter(booking => {
          // Handle both dateTime and separate date/time fields
          let bookingDate;
          if (booking.dateTime) {
            bookingDate = safeDate(booking.dateTime);
          } else if (booking.date && booking.startTime) {
            bookingDate = safeDate(`${booking.date}T${booking.startTime}:00`);
          } else {
            console.warn('📱 BOOKING_SCREEN: Booking missing date/time info:', booking);
            return true; // Show in past if we can't determine time
          }

          const isPast = bookingDate <= now || booking.status === 'completed';
          console.log('📱 BOOKING_SCREEN: Checking past booking:', {
            id: booking.id,
            dateTime: booking.dateTime,
            calculatedDate: bookingDate.toISOString(),
            status: booking.status,
            isPast,
            timeDiff: (bookingDate - now) / (1000 * 60 * 60) // hours
          });
          return isPast;
        });
        break;
      case 'cancelled':
        filtered = bookings.filter(booking => {
          const isCancelled = booking.status === 'cancelled';
          console.log('📱 BOOKING_SCREEN: Checking cancelled booking:', {
            id: booking.id,
            status: booking.status,
            isCancelled
          });
          return isCancelled;
        });
        break;
      default:
        filtered = bookings;
    }

    // Apply search filter
    if (searchQuery.trim()) {
      console.log('📱 BOOKING_SCREEN: Applying search filter:', searchQuery);
      filtered = filtered.filter(booking => {
        const matchesSearch = booking.turfName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          booking.turfArea?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          booking.sport?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          booking.bookingId?.toLowerCase().includes(searchQuery.toLowerCase());

        console.log('📱 BOOKING_SCREEN: Search match for booking:', {
          id: booking.id,
          turfName: booking.turfName,
          matchesSearch
        });

        return matchesSearch;
      });
    }

    console.log('📱 BOOKING_SCREEN: Final filtered bookings:', {
      filteredCount: filtered.length,
      bookings: filtered.map(b => ({
        id: b.id,
        turfName: b.turfName,
        dateTime: b.dateTime,
        status: b.status
      }))
    });

    return filtered;
  };

  const filteredBookings = React.useMemo(() => {
    console.log('📱 BOOKING_SCREEN: Calculating filteredBookings...', {
      userBookingsCount: userBookings.length,
      selectedTab,
      searchQuery
    });

    const result = filterBookings(userBookings, selectedTab);

    console.log('📱 BOOKING_SCREEN: filteredBookings result:', {
      count: result.length,
      bookings: result.map(b => ({ id: b.id, turfName: b.turfName }))
    });

    return result;
  }, [userBookings, selectedTab, searchQuery]);

  const getBookingStats = () => {
    const total = userBookings.length;
    const upcoming = userBookings.filter(b => {
      if (!b.dateTime) return false; // Skip bookings without dateTime
      const bookingDate = safeDate(b.dateTime);
      const now = safeDate();
      return bookingDate > now && b.status !== 'cancelled';
    }).length;
    const completed = userBookings.filter(b => b.status === 'completed').length;
    const totalSpent = userBookings
      .filter(b => b.paymentStatus === 'paid')
      .reduce((sum, b) => sum + b.totalAmount, 0);

    return { total, upcoming, completed, totalSpent };
  };

  const stats = getBookingStats();

  const renderBooking = ({ item }) => (
    <BookingCard booking={item} />
  );

  const getEmptyMessage = () => {
    if (searchQuery.trim()) {
      return `No bookings found for "${searchQuery}"`;
    }

    switch (selectedTab) {
      case 'all':
        return 'No bookings yet. Time to book a ground!';
      case 'upcoming':
        return 'No upcoming bookings. Time to book a ground!';
      case 'past':
        return 'No past bookings yet.';
      case 'cancelled':
        return 'No cancelled bookings.';
      default:
        return 'No bookings found.';
    }
  };

  return (
    <View style={[styles.container, { paddingBottom: Platform.OS === 'android' ? insets.bottom + 60 : 0 }]}>
      <StatusBar backgroundColor={theme.colors.primary} barStyle="light-content" />

      {/* Enhanced Header with Gradient */}
      <SafeAreaView style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>My Bookings</Text>
          <Text style={styles.subtitle}>Manage your ground reservations</Text>
        </View>

        {/* Simplified Quick Stats */}
        <View style={styles.quickStats}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.upcoming}</Text>
            <Text style={styles.statLabel}>Upcoming</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>₨{stats.totalSpent.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Spent</Text>
          </View>
        </View>
      </SafeAreaView>

      <View style={styles.content}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Searchbar
            placeholder="Search bookings..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchbar}
            iconColor={theme.colors.primary}
            inputStyle={styles.searchInput}
            elevation={0}
          />
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <SegmentedButtons
            value={selectedTab}
            onValueChange={setSelectedTab}
            buttons={[
              {
                value: 'all',
                label: 'All',
                icon: () => <MaterialIcons name="list" size={18} color={selectedTab === 'all' ? theme.colors.primary : '#666'} />
              },
              {
                value: 'upcoming',
                label: 'Upcoming',
                icon: () => <MaterialIcons name="schedule" size={18} color={selectedTab === 'upcoming' ? theme.colors.primary : '#666'} />
              },
              {
                value: 'past',
                label: 'Past',
                icon: () => <MaterialIcons name="history" size={18} color={selectedTab === 'past' ? theme.colors.primary : '#666'} />
              },
              {
                value: 'cancelled',
                label: 'Cancelled',
                icon: () => <MaterialIcons name="cancel" size={18} color={selectedTab === 'cancelled' ? theme.colors.primary : '#666'} />
              },
            ]}
            style={styles.segmentedButtons}
          />
        </View>

        {/* Results Count */}
        {filteredBookings.length > 0 && (
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsText}>
              {filteredBookings.length} booking{filteredBookings.length !== 1 ? 's' : ''} found
            </Text>
          </View>
        )}

        {/* Bookings List */}
        <FlatList
          data={filteredBookings}
          renderItem={renderBooking}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing || loading}
              onRefresh={onRefresh}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          }
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <MaterialIcons name="event-busy" size={80} color="#ccc" style={{ marginBottom: 20 }} />
              <Text style={styles.emptyTitle}>
                {getEmptyMessage()}
              </Text>
              <Text style={styles.emptySubtitle}>
                {selectedTab === 'upcoming' || selectedTab === 'all'
                  ? 'Discover amazing sports venues near you'
                  : 'Your booking history will appear here'}
              </Text>
              {(selectedTab === 'upcoming' || selectedTab === 'all') && !searchQuery.trim() && (
                <Button
                  mode="contained"
                  style={[styles.bookNowButton, { backgroundColor: theme.colors.primary }]}
                  contentStyle={styles.bookNowButtonContent}
                  labelStyle={{ color: theme.colors.secondary, fontFamily: 'Montserrat_700Bold' }}
                  onPress={() => navigation.navigate('VenueList')}
                >
                  Book a Ground
                </Button>
              )}
            </View>
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    paddingBottom: 24,
    paddingHorizontal: 20,
    paddingLeft: 32,
  },
  headerContent: {
    marginBottom: 20,
    paddingLeft: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    fontFamily: 'Montserrat_700Bold',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
    fontFamily: 'Montserrat_400Regular',
  },
  quickStats: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    fontFamily: 'Montserrat_700Bold',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
    fontFamily: 'Montserrat_500Medium',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 8,
  },
  content: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  searchbar: {
    backgroundColor: 'white',
    borderRadius: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  searchInput: {
    fontFamily: 'Montserrat_400Regular',
  },
  tabContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  segmentedButtons: {
    backgroundColor: 'white',
    borderRadius: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  resultsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  resultsText: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Montserrat_500Medium',
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
    marginBottom: 12,
    fontFamily: 'Montserrat_600SemiBold',
    lineHeight: 24,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    fontFamily: 'Montserrat_400Regular',
    lineHeight: 20,
  },
  bookNowButton: {
    borderRadius: 12,
    paddingHorizontal: 32,
  },
  bookNowButtonContent: {
    paddingVertical: 10,
  },
});