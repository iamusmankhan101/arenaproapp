import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Text, Searchbar, Chip, FAB, Menu, Button } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { fetchVenues, updateVenueStatus } from '../../store/slices/adminSlice';
import AdminVenueCard from '../../components/admin/AdminVenueCard';

export default function AdminVenuesScreen({ navigation }) {
  const dispatch = useDispatch();
  const { venues, venuesLoading, venuesError } = useSelector(state => state.admin);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'active', label: 'Active' },
    { key: 'inactive', label: 'Inactive' },
    { key: 'football', label: 'Football' },
    { key: 'cricket', label: 'Cricket' },
    { key: 'padel', label: 'Padel' },
  ];

  useEffect(() => {
    loadVenues();
  }, [selectedFilter, searchQuery]);

  const loadVenues = () => {
    dispatch(fetchVenues({ 
      filter: selectedFilter, 
      search: searchQuery 
    }));
  };

  const onRefresh = () => {
    setRefreshing(true);
    dispatch(fetchVenues({ 
      filter: selectedFilter, 
      search: searchQuery 
    })).finally(() => {
      setRefreshing(false);
    });
  };

  const handleVenueAction = (venueId, action) => {
    if (action === 'edit') {
      navigation.navigate('EditVenue', { venueId });
    } else if (action === 'toggle') {
      const venue = venues.find(v => v.id === venueId);
      const newStatus = venue.status === 'active' ? 'inactive' : 'active';
      dispatch(updateVenueStatus({ venueId, status: newStatus }));
    } else if (action === 'analytics') {
      console.log('View analytics for venue:', venueId);
    }
  };

  const renderVenue = ({ item }) => (
    <AdminVenueCard
      venue={item}
      onAction={handleVenueAction}
      onPress={() => navigation.navigate('VenueDetail', { venueId: item.id })}
    />
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search venues..."
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
              icon="more-vert"
              style={styles.menuButton}
            >
              More
            </Button>
          }
        >
          <Menu.Item onPress={() => {}} title="Export Data" />
          <Menu.Item onPress={() => {}} title="Bulk Actions" />
          <Menu.Item onPress={() => {}} title="Analytics" />
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
              {item.label}
            </Chip>
          )}
        />
      </View>

      {/* Stats Summary */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{String(venues.length)}</Text>
          <Text style={styles.statLabel}>Total Venues</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {venues.filter(v => v.status === 'active').length}
          </Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {venues.reduce((sum, v) => sum + (v.bookedSlots || 0), 0)}
          </Text>
          <Text style={styles.statLabel}>Booked Slots</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            PKR {(venues.reduce((sum, v) => sum + (v.revenue || 0), 0) / 1000).toFixed(0)}K
          </Text>
          <Text style={styles.statLabel}>Revenue</Text>
        </View>
      </View>

      {/* Venues List */}
      <FlatList
        data={venues}
        renderItem={renderVenue}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="location-off" size={64} color="#ccc" />
            <Text style={styles.emptyText}>
              {venuesLoading ? 'Loading venues...' : 'No venues found'}
            </Text>
          </View>
        }
      />

      {/* FAB for adding venue */}
      <FAB
        icon="add"
        style={styles.fab}
        onPress={() => navigation.navigate('AddVenue')}
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
  menuButton: {
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
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingVertical: 16,
    marginBottom: 8,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'Montserrat_700Bold',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    fontFamily: 'Montserrat_400Regular',
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