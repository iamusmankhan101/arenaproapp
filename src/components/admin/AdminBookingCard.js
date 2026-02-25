import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Button, Surface, Chip, Menu } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';

export default function AdminBookingCard({ booking, onAction, onPress }) {
  const [menuVisible, setMenuVisible] = React.useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return '#4CAF50';
      case 'pending': return '#FF9800';
      case 'cancelled': return '#F44336';
      case 'completed': return '#2196F3';
      default: return '#9E9E9E';
    }
  };

  const getStatusBgColor = (status) => {
    switch (status) {
      case 'confirmed': return 'rgba(76, 175, 80, 0.1)';
      case 'pending': return 'rgba(255, 152, 0, 0.1)';
      case 'cancelled': return 'rgba(244, 67, 54, 0.1)';
      case 'completed': return 'rgba(33, 150, 243, 0.1)';
      default: return 'rgba(158, 158, 158, 0.1)';
    }
  };

  const getSportIcon = (sport) => {
    switch (sport?.toLowerCase()) {
      case 'cricket': return 'sports-cricket';
      case 'football': return 'sports-soccer';
      case 'padel': return 'sports-tennis';
      default: return 'sports';
    }
  };

  const formatDateTime = (dateTime) => {
    const date = new Date(dateTime);
    const dateStr = date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
    const timeStr = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    return { date: dateStr, time: timeStr };
  };

  const { date, time } = formatDateTime(booking.dateTime);

  return (
    <Surface style={styles.card} elevation={2}>
      <TouchableOpacity onPress={onPress} style={styles.cardContent}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.bookingInfo}>
            <Text style={styles.bookingId}>{String('#' + booking.bookingId)}</Text>
            <Text style={styles.customerName}>{String(booking.customerName)}</Text>
          </View>
          
          <View style={styles.headerActions}>
            <Chip
              style={[styles.statusChip, { backgroundColor: getStatusBgColor(booking.status) }]}
              textStyle={[styles.statusText, { color: getStatusColor(booking.status) }]}
            >
              {String(booking.status.toUpperCase())}
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
              {booking.status === 'pending' && (
                <Menu.Item 
                  onPress={() => {
                    setMenuVisible(false);
                    onAction(booking.id, 'confirm');
                  }} 
                  title="Confirm Booking" 
                />
              )}
              <Menu.Item 
                onPress={() => {
                  setMenuVisible(false);
                  onAction(booking.id, 'cancel');
                }} 
                title="Cancel Booking" 
              />
              <Menu.Item 
                onPress={() => {
                  setMenuVisible(false);
                  onAction(booking.id, 'contact');
                }} 
                title="Contact Customer" 
              />
            </Menu>
          </View>
        </View>

        {/* Venue Info */}
        <View style={styles.venueSection}>
          <View style={styles.sportIconContainer}>
            <MaterialIcons 
              name={getSportIcon(booking.sport)} 
              size={16} 
              color="#4CAF50" 
            />
          </View>
          <View style={styles.venueDetails}>
            <Text style={styles.venueName}>{String(booking.turfName)}</Text>
            <Text style={styles.venueLocation}>{String(booking.turfArea)}</Text>
          </View>
        </View>

        {/* Booking Details */}
        <View style={styles.detailsGrid}>
          <View style={styles.detailItem}>
            <MaterialIcons name="event" size={14} color="#666" />
            <Text style={styles.detailText}>{String(date)}</Text>
          </View>
          <View style={styles.detailItem}>
            <MaterialIcons name="schedule" size={14} color="#666" />
            <Text style={styles.detailText}>{String(time)}</Text>
          </View>
          <View style={styles.detailItem}>
            <MaterialIcons name="timer" size={14} color="#666" />
            <Text style={styles.detailText}>{String(booking.duration + 'h')}</Text>
          </View>
          <View style={styles.detailItem}>
            <MaterialIcons name="payments" size={14} color="#666" />
            <Text style={styles.detailText}>{String('PKR ' + booking.totalAmount.toLocaleString())}</Text>
          </View>
        </View>

        {/* Customer Contact */}
        <View style={styles.contactSection}>
          <MaterialIcons name="phone" size={14} color="#666" />
          <Text style={styles.contactText}>{String(booking.customerPhone)}</Text>
          
          {booking.paymentStatus === 'pending' && (
            <View style={styles.paymentWarning}>
              <MaterialIcons name="warning" size={14} color="#FF9800" />
              <Text style={styles.paymentWarningText}>Payment Pending</Text>
            </View>
          )}
        </View>

        {/* Quick Actions */}
        {booking.status === 'pending' && (
          <View style={styles.actionsContainer}>
            <Button
              mode="contained"
              buttonColor="#4CAF50"
              compact
              style={styles.actionButton}
              onPress={() => onAction(booking.id, 'confirm')}
            >
              Confirm
            </Button>
            <Button
              mode="outlined"
              textColor="#F44336"
              compact
              style={styles.actionButton}
              onPress={() => onAction(booking.id, 'cancel')}
            >
              Cancel
            </Button>
          </View>
        )}
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
  bookingInfo: {
    flex: 1,
  },
  bookingId: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'Montserrat_500Medium',
  },
  customerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 2,
    fontFamily: 'Montserrat_700Bold',
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
  venueSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sportIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  venueDetails: {
    flex: 1,
  },
  venueName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    fontFamily: 'Montserrat_600SemiBold',
  },
  venueLocation: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
    fontFamily: 'Montserrat_400Regular',
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: '45%',
  },
  detailText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 6,
    fontFamily: 'Montserrat_400Regular',
  },
  contactSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  contactText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 6,
    flex: 1,
    fontFamily: 'Montserrat_400Regular',
  },
  paymentWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  paymentWarningText: {
    fontSize: 10,
    color: '#FF9800',
    marginLeft: 4,
    fontFamily: 'Montserrat_600SemiBold',
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