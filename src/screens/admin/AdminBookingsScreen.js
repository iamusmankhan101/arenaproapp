import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Text, Searchbar, Chip, FAB, Menu, Button } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBookings, updateBookingStatus } from '../../store/slices/adminSlice';
import AdminBookingCard from '../../components/admin/AdminBookingCard';

export default function AdminBookingsScreen({ navigation, route }) {
  const dispatch = useDispatch();
  const { bookings, bookingsLoading, bookingsError } = useSelector(state => state.admin);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

  const filters = [
    { key: 'all', label: 'All', count: 0 },
    { key: 'pending', label: 'Pending', count: 0 },
    { key: 'confirmed', label: 'Confirmed', count: 0 },
    { key: 'completed', label: 'Completed', count: 0 },
    { key: 'cancelled', label: 'Cancelled', count: 0 },
    { key: 'today', label: 'Today', count: 0 },
  ];

  useEffect(() => {
    loadBookings();
    if (route.params?.filter) {
      setSelectedFilter(route.params.filter);
    }
  }, [route.params, selectedFilter, searchQuery]);

  const loadBookings = () => {
    dispatch(fetchBookings({ 
      filter: selectedFilter, 
      search: searchQuery 
    }));
  };

  const onRefresh = () => {
    setRefreshing(true);
    dispatch(fetchBookings({ 
      filter: selectedFilter, 
      search: searchQuery 
    })).finally(() => {
      setRefreshing(false);
    });
  };

  const handleBookingAction = (bookingId, action) => {
    if (action === 'confirm') {
      dispatch(updateBookingStatus({ bookingId, status: 'confirmed' }));
    } else if (action === 'cancel') {
      dispatch(updateBookingStatus({ bookingId, status: 'cancelled' }));
    } else {
      console.log(`${action} booking:`, bookingId);
    }
  };

  const renderBooking = ({ item }) => (
    <AdminBookingCard
      booking={item}
      onAction={handleBookingAction}
      onPress={() => navigation.navigate('BookingDetail', { bookingId: item.id })}
    />
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search bookings..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <Button
              mode="outlined"
              onPress={() => setMenuVisible(true)}
              icon="filter-list"
              style={styles.filterButton}
            >
              Filter
            </Button>
          }
        >
          <Menu.Item onPress={() => {}} title="Export Data" />
          <Menu.Item onPress={() => {}} title="Bulk Actions" />
        </Menu>
      </View>

      {/* Filter Chips */}
      <View style={styles.filtersContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={filters}
          keyExtractor={(item) => item.key}
          renderItem={({ item }) => (
            <Chip
              selected={selectedFilter === item.key}
              onPress={() => setSelectedFilter(item.key)}
              style={[
                styles.filterChip,
                selectedFilter === item.key && styles.selectedChip
              ]}
              textStyle={selectedFilter === item.key && styles.selectedChipText}
            >
              {item.label} ({item.key === 'all' ? bookings.length : 
                bookings.filter(b => 
                  item.key === 'today' 
                    ? new Date(b.dateTime).toDateString() === new Date().toDateString()
                    : b.status === item.key
                ).length})
            </Chip>
          )}
        />
      </View>

      {/* Bookings List */}
      <FlatList
        data={bookings}
        renderItem={renderBooking}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="event-busy" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No bookings found</Text>
          </View>
        }
      />

      {/* FAB for adding manual booking */}
      <FAB
        icon="add"
        style={styles.fab}
        onPress={() => navigation.navigate('AddBooking')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: 'white',
  },
  searchbar: {
    flex: 1,
    elevation: 0,
    backgroundColor: '#f5f5f5',
  },
  filterButton: {
    borderColor: '#ddd',
  },
  filtersContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  filterChip: {
    marginRight: 8,
    backgroundColor: '#f5f5f5',
  },
  selectedChip: {
    backgroundColor: '#4CAF50',
  },
  selectedChipText: {
    color: 'white',
  },
  listContainer: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
    fontFamily: 'Montserrat_400Regular',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#4CAF50',
  },
});