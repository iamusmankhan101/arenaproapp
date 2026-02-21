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
  const [selectedTab, setSelectedTab] = useState('upcoming');
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
      case 'completed':
        filtered = bookings.filter(booking => {
          // Handle both dateTime and separate date/time fields
          let bookingDate;
          if (booking.dateTime) {
            bookingDate = safeDate(booking.dateTime);
          } else if (booking.date && booking.startTime) {
            bookingDate = safeDate(`${booking.date}T${booking.startTime}:00`);
          } else {
            return true;
          }

          const isPast = bookingDate <= now || booking.status === 'completed';
          return isPast && booking.status !== 'cancelled';
        });
        break;
      case 'cancelled':
        filtered = bookings.filter(booking => booking.status === 'cancelled');
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
    <BookingCard booking={item} navigation={navigation} />
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
    <View style={styles.container}>
      <StatusBar backgroundColor="transparent" barStyle="dark-content" translucent />

      {/* New Clean White Header */}
      <View style={[styles.whiteHeader, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity
          style={styles.circularBackButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.centeredTitle}>My Bookings</Text>
        <View style={{ width: 44 }} /> {/* Balance the flex row */}
      </View>

      <View style={styles.content}>
        {/* Horizontal Custom Tab Bar */}
        <View style={styles.customTabBar}>
          {[
            { id: 'upcoming', label: 'Upcoming' },
            { id: 'completed', label: 'Completed' },
            { id: 'cancelled', label: 'Cancelled' }
          ].map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tabItem,
                selectedTab === tab.id && styles.activeTabItem
              ]}
              onPress={() => setSelectedTab(tab.id)}
            >
              <Text style={[
                styles.tabLabel,
                selectedTab === tab.id && styles.activeTabLabel
              ]}>
                {tab.label}
              </Text>
              {selectedTab === tab.id && <View style={styles.activeTabIndicator} />}
            </TouchableOpacity>
          ))}
        </View>

        {/* Separator line like in reference */}
        <View style={styles.tabSeparator} />
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Searchbar
            placeholder="Search venues..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchbar}
            iconColor="#999"
            inputStyle={styles.searchInput}
            elevation={0}
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
  whiteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    backgroundColor: 'white',
    paddingBottom: 16,
  },
  circularBackButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  centeredTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    fontFamily: 'Montserrat_700Bold',
    flex: 1,
    textAlign: 'center',
  },
  customTabBar: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingHorizontal: 10,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    position: 'relative',
  },
  tabLabel: {
    fontSize: 16,
    color: '#757575',
    fontFamily: 'Montserrat_600SemiBold',
  },
  activeTabLabel: {
    color: '#004d43',
    fontFamily: 'Montserrat_700Bold',
  },
  activeTabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: '20%',
    right: '20%',
    height: 3,
    backgroundColor: '#004d43',
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  tabSeparator: {
    height: 1,
    backgroundColor: '#F0F0F0',
    width: '100%',
  },
  content: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  searchbar: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
  },
  searchInput: {
    fontFamily: 'Montserrat_400Regular',
    fontSize: 14,
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