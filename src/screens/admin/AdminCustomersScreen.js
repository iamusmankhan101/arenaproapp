import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Text, Searchbar, Chip, Menu, Button } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import AdminCustomerCard from '../../components/admin/AdminCustomerCard';

export default function AdminCustomersScreen({ navigation }) {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'active', label: 'Active' },
    { key: 'inactive', label: 'Inactive' },
    { key: 'vip', label: 'VIP' },
    { key: 'new', label: 'New' },
  ];

  const mockCustomers = [
    {
      id: 'C001',
      name: 'Ahmed Ali',
      email: 'ahmed.ali@email.com',
      phone: '+92 300 1234567',
      joinDate: '2023-12-15',
      status: 'active',
      totalBookings: 15,
      totalSpent: 45000,
      lastBooking: '2024-01-28',
      favoriteVenues: ['Elite Football Arena', 'Sports Complex'],
      preferredSports: ['football'],
      rating: 4.8,
      isVip: false,
      avatar: null,
    },
    {
      id: 'C002',
      name: 'Sara Khan',
      email: 'sara.khan@email.com',
      phone: '+92 301 9876543',
      joinDate: '2024-01-20',
      status: 'active',
      totalBookings: 3,
      totalSpent: 8500,
      lastBooking: '2024-02-01',
      favoriteVenues: ['Sports Complex'],
      preferredSports: ['cricket'],
      rating: 4.5,
      isVip: false,
      avatar: null,
    },
  ];

  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(() => {
    filterCustomers();
  }, [customers, selectedFilter, searchQuery]);

  const loadCustomers = () => {
    setRefreshing(true);
    setTimeout(() => {
      setCustomers(mockCustomers);
      setRefreshing(false);
    }, 1000);
  };

  const filterCustomers = () => {
    let filtered = [...customers];

    if (selectedFilter !== 'all') {
      if (selectedFilter === 'vip') {
        filtered = filtered.filter(customer => customer.isVip);
      } else if (selectedFilter === 'new') {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        filtered = filtered.filter(customer => 
          new Date(customer.joinDate) > thirtyDaysAgo
        );
      } else {
        filtered = filtered.filter(customer => customer.status === selectedFilter);
      }
    }

    if (searchQuery) {
      filtered = filtered.filter(customer =>
        customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.phone.includes(searchQuery)
      );
    }

    setFilteredCustomers(filtered);
  };

  const handleCustomerAction = (customerId, action) => {
    console.log(`${action} customer:`, customerId);
    if (action === 'view') {
      navigation.navigate('CustomerDetail', { customerId });
    } else if (action === 'block') {
      setCustomers(prev => prev.map(customer => 
        customer.id === customerId 
          ? { ...customer, status: customer.status === 'active' ? 'inactive' : 'active' }
          : customer
      ));
    }
  };

  const renderCustomer = ({ item }) => (
    <AdminCustomerCard
      customer={item}
      onAction={handleCustomerAction}
      onPress={() => navigation.navigate('CustomerDetail', { customerId: item.id })}
    />
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search customers..."
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
          <Menu.Item onPress={() => {}} title="Send Notification" />
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
          <Text style={styles.statValue}>{customers.length}</Text>
          <Text style={styles.statLabel}>Total Customers</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {customers.filter(c => c.status === 'active').length}
          </Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {customers.filter(c => c.isVip).length}
          </Text>
          <Text style={styles.statLabel}>VIP</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            PKR {(customers.reduce((sum, c) => sum + c.totalSpent, 0) / 1000).toFixed(0)}K
          </Text>
          <Text style={styles.statLabel}>Total Revenue</Text>
        </View>
      </View>

      {/* Customers List */}
      <FlatList
        data={filteredCustomers}
        renderItem={renderCustomer}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={loadCustomers} />
        }
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="people-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No customers found</Text>
          </View>
        }
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
});