import React from 'react';
import { View, StyleSheet, Alert, TouchableOpacity, Image } from 'react-native';
import { Text, Button, Surface } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { useDispatch } from 'react-redux';
import { cancelUserBooking } from '../store/slices/bookingSlice';
import { theme } from '../theme/theme';

export default function BookingCard({ booking, navigation }) {
  const dispatch = useDispatch();

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return '#004d43';
      case 'pending': return '#F57C00';
      case 'cancelled': return '#D32F2F';
      case 'completed': return '#006b5a';
      default: return '#757575';
    }
  };

  const getStatusBgColor = (status) => {
    switch (status) {
      case 'confirmed': return '#e8ee26';
      case 'pending': return 'rgba(245, 124, 0, 0.1)';
      case 'cancelled': return 'rgba(211, 47, 47, 0.1)';
      case 'completed': return 'rgba(0, 107, 90, 0.1)';
      default: return 'rgba(117, 117, 117, 0.1)';
    }
  };

  const getSportIcon = (sport) => {
    switch (sport?.toLowerCase()) {
      case 'cricket': return 'sports-cricket';
      case 'football': case 'futsal': return 'sports-soccer';
      case 'padel': return 'sports-tennis';
      default: return 'sports';
    }
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return { date: 'Unknown', time: 'Unknown', isToday: false };
    const date = new Date(dateTime);
    if (isNaN(date.getTime())) return { date: 'Invalid', time: 'Invalid', isToday: false };

    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    const isTomorrow = date.toDateString() === tomorrow.toDateString();

    let dateStr;
    if (isToday) dateStr = 'Today';
    else if (isTomorrow) dateStr = 'Tomorrow';
    else dateStr = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

    const timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    return { date: dateStr, time: timeStr, isToday };
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
            dispatch(cancelUserBooking(booking.id))
              .unwrap()
              .then(() => Alert.alert('Success', 'Booking cancelled successfully'))
              .catch((err) => Alert.alert('Error', err || 'Failed to cancel booking'));
          }
        }
      ]
    );
  };

  const { date, time, isToday } = formatDateTime(booking.dateTime);
  const statusColor = getStatusColor(booking.status);
  const statusBg = getStatusBgColor(booking.status);

  return (
    <Surface style={styles.card} elevation={2}>
      {/* Header with Venue Image & Status */}
      <View style={styles.header}>
        <Image
          source={booking.turfImage ? { uri: booking.turfImage } : require('../images/football.jpg')}
          style={styles.turfImage}
          resizeMode="cover"
        />
        <View style={styles.headerOverlay}>
          <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text style={[styles.statusText, { color: statusColor }]}>
              {String(typeof booking.status === 'string' ? booking.status.toUpperCase() : 'PENDING')}
            </Text>
          </View>
          {isToday && booking.status !== 'cancelled' && (
            <View style={styles.todayBadge}>
              <MaterialIcons name="notifications-active" size={12} color="#004d43" />
              <Text style={styles.todayText}>Happening Today</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.cardBody}>
        {/* Venue Info Section */}
        <View style={styles.venueSection}>
          <View style={styles.venueInfo}>
            <Text style={styles.venueName} numberOfLines={1}>
              {String(typeof booking.turfName === 'string' ? booking.turfName : 'Unknown Venue')}
            </Text>
            <View style={styles.locationContainer}>
              <MaterialIcons name="location-on" size={12} color="#666" />
              <Text style={styles.locationText} numberOfLines={1}>
                {String(typeof booking.turfArea === 'string' ? booking.turfArea : 'Unknown Area')}
              </Text>
            </View>
          </View>
          <View style={styles.sportBadge}>
            <MaterialIcons name={getSportIcon(booking.sport)} size={16} color="#004d43" />
          </View>
        </View>

        {/* Ticket Separator */}
        <View style={styles.separatorContainer}>
          <View style={styles.cutoutLeft} />
          <View style={styles.dashedLine} />
          <View style={styles.cutoutRight} />
        </View>

        {/* Booking Details Section */}
        <View style={styles.detailsSection}>
          <View style={styles.detailGrid}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>DATE</Text>
              <Text style={styles.detailValue}>{String(date)}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>TIME</Text>
              <Text style={styles.detailValue}>{String(time)}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>DURATION</Text>
              <Text style={styles.detailValue}>
                {String(typeof booking.duration === 'string' || typeof booking.duration === 'number' 
                  ? booking.duration 
                  : '1 Hour')}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>TOTAL PRICE</Text>
              <Text style={[styles.detailValue, { color: '#004d43', fontFamily: 'Montserrat_700Bold' }]}>
                {String('PKR ' + (typeof booking.totalAmount === 'number' ? booking.totalAmount.toLocaleString() : '0'))}
              </Text>
            </View>
          </View>

          {!!booking.bookingReference && (
            <View style={styles.refRow}>
              <Text style={styles.refLabel}>{String('REF: ' + booking.bookingReference)}</Text>
            </View>
          )}
        </View>

        {/* Payment Warning */}
        {booking.paymentStatus === 'pending' && booking.status !== 'cancelled' && (
          <View style={styles.alertBox}>
            <MaterialIcons name="info-outline" size={14} color="#F57C00" />
            <Text style={styles.alertText}>Payment pending at venue</Text>
          </View>
        )}

        {/* Action Section - Dual Buttons like in reference */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancelBooking}
            disabled={!canCancel()}
          >
            <Text style={[styles.buttonText, { color: canCancel() ? '#757575' : '#ccc' }]}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.receiptButton}
            onPress={() => navigation?.navigate('EReceipt', { booking })}
          >
            <Text style={styles.receiptButtonText}>E-Receipt</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Surface>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 16,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  header: {
    height: 100,
    width: '100%',
    position: 'relative',
  },
  turfImage: {
    width: '100%',
    height: '100%',
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    alignItems: 'flex-start',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 10,
    fontFamily: 'Montserrat_700Bold',
    letterSpacing: 0.5,
  },
  todayBadge: {
    backgroundColor: '#e8ee26',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  todayText: {
    fontSize: 10,
    color: '#004d43',
    marginLeft: 4,
    fontFamily: 'Montserrat_700Bold',
  },
  cardBody: {
    paddingTop: 16,
    paddingBottom: 12,
  },
  venueSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  venueInfo: {
    flex: 1,
  },
  venueName: {
    fontSize: 18,
    fontFamily: 'Montserrat_700Bold',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
    fontFamily: 'Montserrat_400Regular',
  },
  sportBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e8ee26',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  separatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 4,
    position: 'relative',
  },
  cutoutLeft: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#F5F5F5',
    marginLeft: -10,
    zIndex: 2,
  },
  cutoutRight: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#F5F5F5',
    marginRight: -10,
    zIndex: 2,
  },
  dashedLine: {
    flex: 1,
    height: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
    borderRadius: 1,
    marginHorizontal: 4,
  },
  detailsSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  detailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  detailItem: {
    width: '48%',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 9,
    fontFamily: 'Montserrat_600SemiBold',
    color: '#999',
    letterSpacing: 1,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 13,
    fontFamily: 'Montserrat_600SemiBold',
    color: '#333',
  },
  refRow: {
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 8,
  },
  refLabel: {
    fontSize: 10,
    color: '#bbb',
    fontFamily: 'Montserrat_400Regular',
    textAlign: 'right',
  },
  alertBox: {
    backgroundColor: 'rgba(245, 124, 0, 0.05)',
    marginHorizontal: 16,
    padding: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  alertText: {
    fontSize: 11,
    color: '#F57C00',
    marginLeft: 6,
    fontFamily: 'Montserrat_500Medium',
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  receiptButton: {
    flex: 1.5,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#004d43', // Brand Teal
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  buttonText: {
    fontSize: 14,
    fontFamily: 'Montserrat_600SemiBold',
  },
  receiptButtonText: {
    fontSize: 14,
    color: 'white',
    fontFamily: 'Montserrat_700Bold',
  },
});
