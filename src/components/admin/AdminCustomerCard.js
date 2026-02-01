import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Button, Surface, Chip, Menu, Avatar } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';

export default function AdminCustomerCard({ customer, onAction, onPress }) {
  const [menuVisible, setMenuVisible] = React.useState(false);

  const getStatusColor = (status) => {
    return status === 'active' ? '#4CAF50' : '#F44336';
  };

  const getStatusBgColor = (status) => {
    return status === 'active' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getCustomerTier = (totalSpent) => {
    if (totalSpent > 50000) return { label: 'VIP', color: '#FFD700' };
    if (totalSpent > 20000) return { label: 'Gold', color: '#FF9800' };
    if (totalSpent > 10000) return { label: 'Silver', color: '#9E9E9E' };
    return { label: 'Bronze', color: '#8D6E63' };
  };

  const tier = getCustomerTier(customer.totalSpent);

  return (
    <Surface style={styles.card} elevation={2}>
      <TouchableOpacity onPress={onPress} style={styles.cardContent}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.customerInfo}>
            <Avatar.Text 
              size={40} 
              label={customer.name.split(' ').map(n => n[0]).join('')}
              style={styles.avatar}
            />
            <View style={styles.customerDetails}>
              <View style={styles.nameRow}>
                <Text style={styles.customerName}>{customer.name}</Text>
                {customer.isVip && (
                  <MaterialIcons name="star" size={16} color="#FFD700" />
                )}
              </View>
              <Text style={styles.customerEmail}>{customer.email}</Text>
            </View>
          </View>
          
          <View style={styles.headerActions}>
            <Chip
              style={[styles.statusChip, { backgroundColor: getStatusBgColor(customer.status) }]}
              textStyle={[styles.statusText, { color: getStatusColor(customer.status) }]}
            >
              {customer.status.toUpperCase()}
            </Chip>
            
            <Menu
              visible={menuVisible}
              onDismiss={() => setMenuVisible(false)}
              anchor={
                <TouchableOpacity
                  onPress={() => setMenuVisible(true)}
                  style={styles.menuButton}
                >
                  <MaterialIcons name="more-vert" size={20} color="#666" />
                </TouchableOpacity>
              }
            >
              <Menu.Item 
                onPress={() => {
                  setMenuVisible(false);
                  onAction(customer.id, 'view');
                }} 
                title="View Details" 
              />
              <Menu.Item 
                onPress={() => {
                  setMenuVisible(false);
                  onAction(customer.id, 'contact');
                }} 
                title="Contact Customer" 
              />
              <Menu.Item 
                onPress={() => {
                  setMenuVisible(false);
                  onAction(customer.id, 'block');
                }} 
                title={customer.status === 'active' ? 'Block Customer' : 'Unblock Customer'} 
              />
            </Menu>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <MaterialIcons name="event" size={16} color="#4CAF50" />
            <Text style={styles.statValue}>{customer.totalBookings}</Text>
            <Text style={styles.statLabel}>Bookings</Text>
          </View>
          <View style={styles.statItem}>
            <MaterialIcons name="payments" size={16} color="#FF9800" />
            <Text style={styles.statValue}>PKR {(customer.totalSpent / 1000).toFixed(0)}K</Text>
            <Text style={styles.statLabel}>Spent</Text>
          </View>
          <View style={styles.statItem}>
            <MaterialIcons name="star" size={16} color="#FFD700" />
            <Text style={styles.statValue}>{customer.rating}</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
          <View style={styles.statItem}>
            <MaterialIcons name="workspace-premium" size={16} color={tier.color} />
            <Text style={[styles.statValue, { color: tier.color }]}>{tier.label}</Text>
            <Text style={styles.statLabel}>Tier</Text>
          </View>
        </View>

        {/* Contact Info */}
        <View style={styles.contactSection}>
          <View style={styles.contactItem}>
            <MaterialIcons name="phone" size={14} color="#666" />
            <Text style={styles.contactText}>{customer.phone}</Text>
          </View>
          <View style={styles.contactItem}>
            <MaterialIcons name="schedule" size={14} color="#666" />
            <Text style={styles.contactText}>Last: {formatDate(customer.lastBooking)}</Text>
          </View>
        </View>

        {/* Preferred Sports */}
        <View style={styles.sportsSection}>
          <Text style={styles.sportsLabel}>Preferred Sports:</Text>
          <View style={styles.sportsContainer}>
            {customer.preferredSports.map((sport, index) => (
              <Chip key={index} style={styles.sportChip} textStyle={styles.sportText}>
                {sport.charAt(0).toUpperCase() + sport.slice(1)}
              </Chip>
            ))}
          </View>
        </View>

        {/* Favorite Venues */}
        <View style={styles.venuesSection}>
          <Text style={styles.venuesLabel}>Favorite Venues:</Text>
          <Text style={styles.venuesText}>
            {customer.favoriteVenues.slice(0, 2).join(', ')}
            {customer.favoriteVenues.length > 2 && ` +${customer.favoriteVenues.length - 2} more`}
          </Text>
        </View>

        {/* Join Date */}
        <View style={styles.joinSection}>
          <MaterialIcons name="person-add" size={14} color="#666" />
          <Text style={styles.joinText}>Joined {formatDate(customer.joinDate)}</Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <Button
            mode="outlined"
            compact
            style={styles.actionButton}
            onPress={() => onAction(customer.id, 'contact')}
          >
            Contact
          </Button>
          <Button
            mode="contained"
            buttonColor={customer.status === 'active' ? '#F44336' : '#4CAF50'}
            compact
            style={styles.actionButton}
            onPress={() => onAction(customer.id, 'block')}
          >
            {customer.status === 'active' ? 'Block' : 'Unblock'}
          </Button>
        </View>
      </TouchableOpacity>
    </Surface>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: 'white',
  },
  cardContent: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    backgroundColor: '#4CAF50',
    marginRight: 12,
  },
  customerDetails: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  customerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'Montserrat_700Bold',
  },
  customerEmail: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
    fontFamily: 'Montserrat_400Regular',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusChip: {
    height: 24,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    fontFamily: 'Montserrat_700Bold',
  },
  menuButton: {
    padding: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statItem: {
    alignItems: 'center',
    gap: 2,
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'Montserrat_700Bold',
  },
  statLabel: {
    fontSize: 10,
    color: '#666',
    fontFamily: 'Montserrat_400Regular',
  },
  contactSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  contactText: {
    fontSize: 11,
    color: '#666',
    fontFamily: 'Montserrat_400Regular',
  },
  sportsSection: {
    marginBottom: 12,
  },
  sportsLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
    fontFamily: 'Montserrat_500Medium',
  },
  sportsContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  sportChip: {
    height: 20,
    backgroundColor: '#e8f5e8',
  },
  sportText: {
    fontSize: 9,
    color: '#4CAF50',
    fontFamily: 'Montserrat_500Medium',
  },
  venuesSection: {
    marginBottom: 12,
  },
  venuesLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    fontFamily: 'Montserrat_500Medium',
  },
  venuesText: {
    fontSize: 11,
    color: '#333',
    fontFamily: 'Montserrat_400Regular',
  },
  joinSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  joinText: {
    fontSize: 11,
    color: '#666',
    fontFamily: 'Montserrat_400Regular',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    borderRadius: 8,
  },
});