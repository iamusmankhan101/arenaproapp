import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Card, Button, Surface, Chip } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { fetchDashboardStats } from '../../store/slices/adminSlice';
import PromoPopup from '../../components/admin/PromoPopup';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

export default function AdminDashboardScreen({ navigation }) {
  const dispatch = useDispatch();
  const { dashboardStats, loading } = useSelector(state => state.admin);
  const { user } = useSelector(state => state.auth);
  const [refreshing, setRefreshing] = useState(false);
  const [promoVisible, setPromoVisible] = useState(false);
  const promoTriggered = useRef(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    dispatch(fetchDashboardStats()).finally(() => {
      setRefreshing(false);
    });
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  useEffect(() => {
    const checkPromo = async () => {
      if (user?.uid && !promoTriggered.current) {
        const promoShown = await AsyncStorage.getItem('pro_promo_shown');
        const isPro = user?.proActive === true;

        if (!isPro && !promoShown) {
          promoTriggered.current = true;
          const timer = setTimeout(() => {
            setPromoVisible(true);
            AsyncStorage.setItem('pro_promo_shown', 'true');
          }, 2000);
          return () => clearTimeout(timer);
        }
      }
    };
    checkPromo();
  }, [user?.uid, user?.proActive]);

  const StatCard = ({ title, value, icon, color, onPress }) => (
    <Card style={styles.statCard} onPress={onPress}>
      <Card.Content style={styles.statContent}>
        <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
          <MaterialIcons name={icon} size={24} color={color} />
        </View>
        <View style={styles.statText}>
          <Text style={styles.statValue}>{String(value)}</Text>
          <Text style={styles.statTitle}>{String(title)}</Text>
        </View>
      </Card.Content>
    </Card>
  );

  const QuickAction = ({ title, icon, color, onPress }) => (
    <Surface style={styles.quickAction} elevation={1}>
      <Button
        mode="contained"
        buttonColor={color}
        contentStyle={styles.quickActionContent}
        onPress={onPress}
      >
        <MaterialIcons name={icon} size={20} color="white" />
      </Button>
      <Text style={styles.quickActionText}>{String(title)}</Text>
    </Surface>
  );

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Admin Dashboard</Text>
        <Text style={styles.subtitle}>Manage your turf booking platform</Text>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <StatCard
          title="Total Bookings"
          value={dashboardStats.totalBookings.toLocaleString()}
          icon="event"
          color="#4CAF50"
          onPress={() => navigation.navigate('AdminBookings')}
        />
        <StatCard
          title="Today's Bookings"
          value={dashboardStats.todayBookings}
          icon="today"
          color="#2196F3"
          onPress={() => navigation.navigate('AdminBookings', { filter: 'today' })}
        />
        <StatCard
          title="Total Revenue"
          value={`PKR ${(dashboardStats.totalRevenue / 1000).toFixed(0)}K`}
          icon="payments"
          color="#FF9800"
          onPress={() => navigation.navigate('AdminRevenue')}
        />
        <StatCard
          title="Active Venues"
          value={dashboardStats.activeVenues}
          icon="location-on"
          color="#9C27B0"
          onPress={() => navigation.navigate('AdminVenues')}
        />
        <StatCard
          title="Total Customers"
          value={dashboardStats.totalCustomers}
          icon="people"
          color="#00BCD4"
          onPress={() => navigation.navigate('AdminCustomers')}
        />
        <StatCard
          title="Pending Bookings"
          value={dashboardStats.pendingBookings}
          icon="pending"
          color="#F44336"
          onPress={() => navigation.navigate('AdminBookings', { filter: 'pending' })}
        />
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          <QuickAction
            title="Add Venue"
            icon="add-location"
            color="#4CAF50"
            onPress={() => navigation.navigate('AddVenue')}
          />
          <QuickAction
            title="View Bookings"
            icon="event-note"
            color="#2196F3"
            onPress={() => navigation.navigate('AdminBookings')}
          />
          <QuickAction
            title="Manage Users"
            icon="people"
            color="#FF9800"
            onPress={() => navigation.navigate('AdminCustomers')}
          />
          <QuickAction
            title="Reports"
            icon="analytics"
            color="#9C27B0"
            onPress={() => navigation.navigate('AdminReports')}
          />
        </View>
      </View>

      {/* Recent Activity */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <Card style={styles.activityCard}>
          <Card.Content>
            <View style={styles.activityItem}>
              <MaterialIcons name="event" size={16} color="#4CAF50" />
              <Text style={styles.activityText}>New booking at Elite Football Arena</Text>
              <Text style={styles.activityTime}>2 min ago</Text>
            </View>
            <View style={styles.activityItem}>
              <MaterialIcons name="person-add" size={16} color="#2196F3" />
              <Text style={styles.activityText}>New customer registered</Text>
              <Text style={styles.activityTime}>15 min ago</Text>
            </View>
            <View style={styles.activityItem}>
              <MaterialIcons name="cancel" size={16} color="#F44336" />
              <Text style={styles.activityText}>Booking cancelled at Sports Complex</Text>
              <Text style={styles.activityTime}>1 hour ago</Text>
            </View>
          </Card.Content>
        </Card>
      </View>

      <PromoPopup
        visible={promoVisible}
        onClose={() => setPromoVisible(false)}
        onExplore={() => {
          setPromoVisible(false);
          Alert.alert("Arena Pro", "Visit the web dashboard to upgrade to Arena Pro and unlock all premium features!");
        }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'Montserrat_700Bold',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    fontFamily: 'Montserrat_400Regular',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  statCard: {
    width: '48%',
    backgroundColor: 'white',
  },
  statContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statText: {
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'Montserrat_700Bold',
  },
  statTitle: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'Montserrat_400Regular',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    fontFamily: 'Montserrat_700Bold',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  quickAction: {
    width: '22%',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'white',
  },
  quickActionContent: {
    width: 48,
    height: 48,
  },
  quickActionText: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    fontFamily: 'Montserrat_500Medium',
  },
  activityCard: {
    backgroundColor: 'white',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  activityText: {
    flex: 1,
    fontSize: 13,
    color: '#333',
    marginLeft: 12,
    fontFamily: 'Montserrat_400Regular',
  },
  activityTime: {
    fontSize: 11,
    color: '#999',
    fontFamily: 'Montserrat_400Regular',
  },
});