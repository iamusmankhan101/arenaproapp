import React from 'react';
import { View, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { Text, Button, Chip, Surface } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';

import { useDispatch } from 'react-redux';
import { cancelUserBooking } from '../store/slices/bookingSlice';

export default function BookingCard({ booking }) {
  const dispatch = useDispatch();
  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return '#004d43'; // Brand Primary
      case 'pending': return '#FF9800';
      case 'cancelled': return '#F44336';
      case 'completed': return '#006b5a'; // Tertiary
      default: return '#9E9E9E';
    }
  };

  const getStatusBgColor = (status) => {
    switch (status) {
      case 'confirmed': return 'rgba(0, 77, 67, 0.1)';
      case 'pending': return 'rgba(255, 152, 0, 0.1)';
      case 'cancelled': return 'rgba(244, 67, 54, 0.1)';
      case 'completed': return 'rgba(0, 107, 90, 0.1)';
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

  const getSportColor = (sport) => {
    switch (sport?.toLowerCase()) {
      case 'cricket': return '#004d43';
      case 'football': return '#004d43';
      case 'padel': return '#004d43';
      default: return '#004d43';
    }
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) {
      return { date: 'Unknown', time: 'Unknown' };
    }

    const date = new Date(dateTime);

    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.warn('Invalid dateTime in booking:', dateTime);
      return { date: 'Invalid Date', time: 'Invalid Time' };
    }

    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    const isTomorrow = date.toDateString() === tomorrow.toDateString();

    let dateStr;
    if (isToday) {
      dateStr = 'Today';
    } else if (isTomorrow) {
      dateStr = 'Tomorrow';
    } else {
      dateStr = date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });
    }

    const timeStr = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    return { date: dateStr, time: timeStr };
  };

  const canCancel = () => {
    if (!booking.dateTime) return false;

    const bookingTime = new Date(booking.dateTime);
    if (isNaN(bookingTime.getTime())) return false;

    const now = new Date();
    const hoursUntilBooking = (bookingTime - now) / (1000 * 60 * 60);

    return booking.status === 'confirmed' && hoursUntilBooking > 2;
  };

  const handleCancelBooking = () => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking? Cancellation charges may apply.',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () => {
            console.log('Cancelling booking:', booking.id);
            dispatch(cancelUserBooking(booking.id))
              .unwrap()
              .then(() => {
                Alert.alert('Success', 'Booking cancelled successfully');
              })
              .catch((err) => {
                Alert.alert('Error', err || 'Failed to cancel booking');
              });
          }
        }
      ]
    );
  };

  const { date, time } = formatDateTime(booking.dateTime);

  return (
    <Surface style={styles.card} elevation={1}>
      <View style={styles.cardContent}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.venueInfo}>
            <View style={styles.sportIconContainer}>
              <MaterialIcons
                name={getSportIcon(booking.sport)}
                size={20}
                color={getSportColor(booking.sport)}
              />
            </View>
            <View style={styles.venueDetails}>
              <Text style={styles.venueName}>{booking.turfName || 'Unknown Venue'}</Text>
              <Text style={styles.venueLocation}>{booking.turfArea || 'Unknown Area'}</Text>
            </View>
          </View>

          <View style={[
            styles.statusChip,
            { backgroundColor: getStatusBgColor(booking.status || 'pending') }
          ]}>
            <Text style={[
              styles.statusText,
              { color: getStatusColor(booking.status || 'pending') }
            ]}>
              {(booking.status || 'pending').toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Booking Details */}
        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <MaterialIcons name="event" size={16} color="#666" />
              <Text style={styles.detailText}>{date}</Text>
            </View>
            <View style={styles.detailItem}>
              <MaterialIcons name="schedule" size={16} color="#666" />
              <Text style={styles.detailText}>{time}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <MaterialIcons name="timer" size={16} color="#666" />
              <Text style={styles.detailText}>{booking.duration || '1h'} • {booking.slotType || 'Standard'}</Text>
            </View>
            <View style={styles.detailItem}>
              <MaterialIcons name="payments" size={16} color="#666" />
              <Text style={styles.detailText}>PKR {(booking.totalAmount || 0).toLocaleString()}</Text>
            </View>
          </View>

          {booking.bookingId && (
            <View style={styles.bookingIdRow}>
              <MaterialIcons name="confirmation-number" size={16} color="#666" />
              <Text style={styles.bookingIdText}>ID: {booking.bookingId}</Text>
            </View>
          )}
        </View>



        {/* Payment Status */}
        {booking.paymentStatus === 'pending' && (
          <View style={styles.paymentWarning}>
            <MaterialIcons name="warning" size={16} color="#FF9800" />
            <Text style={styles.paymentWarningText}>Payment Pending</Text>
          </View>
        )}

        {booking.paymentStatus === 'refunded' && (
          <View style={styles.refundInfo}>
            <MaterialIcons name="check-circle" size={16} color="#4CAF50" />
            <Text style={styles.refundText}>Payment Refunded</Text>
          </View>
        )}

        {/* Cancellation Reason */}
        {booking.cancellationReason && (
          <View style={styles.cancellationContainer}>
            <Text style={styles.cancellationTitle}>Cancellation Reason:</Text>
            <Text style={styles.cancellationReason}>{booking.cancellationReason}</Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          {booking.paymentStatus === 'pending' && (
            <Button
              mode="contained"
              style={styles.payButton}
              buttonColor="#004d43"
              textColor="#FFFFFF"
              compact
              onPress={() => console.log('Pay now:', booking.id)}
            >
              Pay Now
            </Button>
          )}

          {canCancel() && (
            <Button
              mode="outlined"
              style={styles.cancelButton}
              textColor="#F44336"
              compact
              onPress={handleCancelBooking}
            >
              Cancel
            </Button>
          )}

          {booking.status === 'completed' && !booking.rated && (
            <Button
              mode="contained"
              style={styles.rateButton}
              buttonColor="#e8ee26"
              textColor="#004d43"
              labelStyle={{ fontWeight: 'bold' }}
              icon={() => <MaterialIcons name="star" size={16} color="#004d43" />}
              compact
              onPress={() => console.log('Rate turf:', booking.turfId)}
            >
              Rate
            </Button>
          )}

          {booking.rated && (
            <View style={styles.ratedContainer}>
              <MaterialIcons name="star" size={16} color="#FFD700" />
              <Text style={styles.ratedText}>Rated</Text>
            </View>
          )}
        </View>
      </View>
    </Surface>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    borderRadius: 16,
    backgroundColor: 'white',
  },
  cardContent: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  venueInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sportIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e8ee26', // Brand Secondary
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 77, 67, 0.1)',
  },
  venueDetails: {
    flex: 1,
  },
  venueName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'Montserrat_700Bold',
  },
  venueLocation: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
    fontFamily: 'Montserrat_400Regular',
  },
  statusChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 11,
    fontWeight: 'bold',
    fontFamily: 'Montserrat_700Bold',
  },
  detailsContainer: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  detailText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 8,
    fontFamily: 'Montserrat_500Medium',
  },
  bookingIdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  bookingIdText: {
    fontSize: 12,
    color: '#999',
    marginLeft: 8,
    fontFamily: 'Montserrat_400Regular',
  },

  paymentWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
    padding: 8,
    borderRadius: 8,
    marginBottom: 12,
  },
  paymentWarningText: {
    fontSize: 12,
    color: '#FF9800',
    marginLeft: 8,
    fontFamily: 'Montserrat_600SemiBold',
  },
  refundInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    padding: 8,
    borderRadius: 8,
    marginBottom: 12,
  },
  refundText: {
    fontSize: 12,
    color: '#4CAF50',
    marginLeft: 8,
    fontFamily: 'Montserrat_600SemiBold',
  },
  cancellationContainer: {
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  cancellationTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#F44336',
    marginBottom: 4,
    fontFamily: 'Montserrat_700Bold',
  },
  cancellationReason: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'Montserrat_400Regular',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  payButton: {
    borderRadius: 8,
  },
  cancelButton: {
    borderColor: '#F44336',
    borderRadius: 8,
  },
  rateButton: {
    borderRadius: 8,
  },
  ratedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8ee26', // Secondary brand color
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  ratedText: {
    fontSize: 12,
    color: '#004d43', // Primary brand color for better contrast
    marginLeft: 4,
    fontFamily: 'Montserrat_600SemiBold',
  },
});