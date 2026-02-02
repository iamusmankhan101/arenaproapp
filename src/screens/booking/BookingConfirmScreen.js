import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  Alert, 
  Animated, 
  Dimensions,
  TouchableOpacity,
  StatusBar,
  SafeAreaView
} from 'react-native';
import { 
  Text, 
  Card, 
  Button, 
  RadioButton, 
  Divider, 
  Chip,
  Surface,
  Portal,
  Modal
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { createBooking } from '../../store/slices/bookingSlice';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../theme/theme';

const { width, height } = Dimensions.get('window');

export default function BookingConfirmScreen({ route, navigation }) {
  const { turf, slot, date } = route.params;
  const [paymentMethod, setPaymentMethod] = useState('jazzcash');
  const [isBooking, setIsBooking] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));
  
  const dispatch = useDispatch();

  useEffect(() => {
    // Animate cards on mount
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const calculateTotal = () => {
    const basePrice = slot.price;
    return {
      basePrice,
      total: basePrice
    };
  };

  const pricing = calculateTotal();

  const handleConfirmBooking = async () => {
    setIsBooking(true);
    
    try {
      const bookingData = {
        turfId: turf.id,
        date: date,
        startTime: slot.startTime,
        endTime: slot.endTime,
        totalAmount: pricing.total,
        paymentMethod: paymentMethod,
        slotType: slot.priceType,
      };

      const result = await dispatch(createBooking(bookingData)).unwrap();
      
      // Handle different booking responses
      if (result.requiresSignIn) {
        // Guest booking created, but requires sign in
        Alert.alert(
          'Booking Created!',
          result.message || 'Your booking has been created. Please sign in to complete your booking.',
          [
            {
              text: 'Sign In Now',
              onPress: () => navigation.navigate('SignIn')
            },
            {
              text: 'Later',
              style: 'cancel',
              onPress: () => navigation.navigate('MainTabs', { screen: 'Home' })
            }
          ]
        );
      } else {
        // Authenticated booking confirmed
        setShowSuccessModal(true);
      }
      
    } catch (error) {
      Alert.alert(
        'Booking Failed',
        error.message || 'The slot may have been taken by someone else. Please try another slot.',
        [
          {
            text: 'Try Again',
            onPress: () => {
              if (navigation.canGoBack()) {
                navigation.goBack();
              } else {
                navigation.navigate('MainTabs');
              }
            }
          }
        ]
      );
    } finally {
      setIsBooking(false);
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    navigation.navigate('MainTabs', { screen: 'Bookings' });
  };

  const formatDateTime = () => {
    const bookingDate = new Date(date);
    return {
      date: bookingDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      time: `${slot.startTime} - ${slot.endTime}`
    };
  };

  const getPaymentIcon = (method) => {
    switch (method) {
      case 'jazzcash': return 'account-balance-wallet';
      case 'easypaisa': return 'payment';
      case 'card': return 'credit-card';
      case 'cash': return 'money';
      default: return 'payment';
    }
  };

  const getPaymentColor = (method) => {
    switch (method) {
      case 'jazzcash': return '#FF6B35';
      case 'easypaisa': return '#00A651';
      case 'card': return '#1976D2';
      case 'cash': return '#795548';
      default: return '#666';
    }
  };

  const { date: formattedDate, time } = formatDateTime();

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={theme.colors.primary} barStyle="light-content" />
      
      {/* Custom Header */}
      <SafeAreaView style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => {
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              navigation.navigate('MainTabs');
            }
          }}
          >
            <MaterialIcons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Confirm Booking</Text>
          <View style={styles.headerRight} />
        </View>
      </SafeAreaView>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Venue Summary Card */}
        <Animated.View 
          style={[
            styles.animatedCard,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <Surface style={styles.summaryCard} elevation={2}>
            <View style={styles.summaryHeader}>
              <View style={[styles.venueIcon, { backgroundColor: `${theme.colors.secondary}30` }]}>
                <MaterialIcons name="sports-soccer" size={24} color={theme.colors.primary} />
              </View>
              <View style={styles.venueInfo}>
                <Text style={styles.venueName}>{turf.name}</Text>
                <Text style={styles.venueAddress}>{turf.address}</Text>
              </View>
              <Chip 
                mode="outlined" 
                style={[styles.priceChip, { backgroundColor: `${theme.colors.secondary}30`, borderColor: theme.colors.primary }]}
                textStyle={[styles.priceChipText, { color: theme.colors.primary }]}
              >
                PKR {pricing.total.toLocaleString()}
              </Chip>
            </View>
            
            <View style={styles.bookingDetails}>
              <View style={styles.detailItem}>
                <MaterialIcons name="event" size={18} color="#666" />
                <Text style={styles.detailText}>{formattedDate}</Text>
              </View>
              <View style={styles.detailItem}>
                <MaterialIcons name="schedule" size={18} color="#666" />
                <Text style={styles.detailText}>{time}</Text>
              </View>
              <View style={styles.detailItem}>
                <MaterialIcons name="wb-sunny" size={18} color="#666" />
                <Text style={styles.detailText}>{slot.priceType} Slot</Text>
              </View>
            </View>
          </Surface>
        </Animated.View>

        {/* Pricing Breakdown */}
        <Animated.View 
          style={[
            styles.animatedCard,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <Surface style={styles.pricingCard} elevation={1}>
            <Text style={styles.sectionTitle}>Pricing Details</Text>
            
            <View style={styles.priceBreakdown}>
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Ground Fee ({slot.priceType})</Text>
                <Text style={styles.priceValue}>PKR {pricing.basePrice.toLocaleString()}</Text>
              </View>
              
              <Divider style={styles.priceDivider} />
              
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total Amount</Text>
                <Text style={[styles.totalValue, { color: theme.colors.primary }]}>PKR {pricing.total.toLocaleString()}</Text>
              </View>
            </View>
          </Surface>
        </Animated.View>

        {/* Payment Methods */}
        <Animated.View 
          style={[
            styles.animatedCard,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <Surface style={styles.paymentCard} elevation={1}>
            <Text style={styles.sectionTitle}>Choose Payment Method</Text>
            
            <RadioButton.Group 
              onValueChange={setPaymentMethod} 
              value={paymentMethod}
            >
              {[
                { value: 'jazzcash', name: 'JazzCash', desc: 'Mobile wallet payment' },
                { value: 'easypaisa', name: 'EasyPaisa', desc: 'Mobile wallet payment' },
                { value: 'card', name: 'Debit/Credit Card', desc: 'Secure card payment' },
                { value: 'cash', name: 'Pay at Venue', desc: 'Cash payment on arrival' }
              ].map((method) => (
                <TouchableOpacity
                  key={method.value}
                  style={[
                    styles.paymentOption,
                    paymentMethod === method.value && [styles.selectedPaymentOption, { 
                      borderColor: theme.colors.primary, 
                      backgroundColor: `${theme.colors.secondary}20` 
                    }]
                  ]}
                  onPress={() => setPaymentMethod(method.value)}
                >
                  <View style={styles.paymentLeft}>
                    <View style={[
                      styles.paymentIconContainer,
                      { backgroundColor: getPaymentColor(method.value) + '15' }
                    ]}>
                      <MaterialIcons 
                        name={getPaymentIcon(method.value)} 
                        size={20} 
                        color={getPaymentColor(method.value)} 
                      />
                    </View>
                    <View style={styles.paymentInfo}>
                      <Text style={styles.paymentName}>{method.name}</Text>
                      <Text style={styles.paymentDesc}>{method.desc}</Text>
                    </View>
                  </View>
                  <RadioButton value={method.value} color={theme.colors.primary} />
                </TouchableOpacity>
              ))}
            </RadioButton.Group>
          </Surface>
        </Animated.View>

        {/* Important Information */}
        <Animated.View 
          style={[
            styles.animatedCard,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <Surface style={styles.infoCard} elevation={1}>
            <Text style={styles.sectionTitle}>Important Information</Text>
            
            <View style={styles.infoList}>
              <View style={styles.infoItem}>
                <MaterialIcons name="access-time" size={16} color="#FF9800" />
                <Text style={styles.infoText}>Arrive 10 minutes before your slot</Text>
              </View>
              
              <View style={styles.infoItem}>
                <MaterialIcons name="cancel" size={16} color="#F44336" />
                <Text style={styles.infoText}>Free cancellation up to 2 hours before</Text>
              </View>
              
              <View style={styles.infoItem}>
                <MaterialIcons name="phone" size={16} color={theme.colors.primary} />
                <Text style={styles.infoText}>Contact: {turf.phoneNumber}</Text>
              </View>
              
              <View style={styles.infoItem}>
                <MaterialIcons name="verified" size={16} color="#2196F3" />
                <Text style={styles.infoText}>Booking confirmation via SMS</Text>
              </View>
            </View>
          </Surface>
        </Animated.View>
      </ScrollView>

      {/* Bottom Action */}
      <View style={styles.bottomAction}>
        <View style={styles.totalSummary}>
          <Text style={styles.totalSummaryLabel}>Total Amount</Text>
          <Text style={[styles.totalSummaryValue, { color: theme.colors.primary }]}>PKR {pricing.total.toLocaleString()}</Text>
        </View>
        <Button
          mode="contained"
          onPress={handleConfirmBooking}
          loading={isBooking}
          disabled={isBooking}
          style={[styles.confirmButton, { backgroundColor: theme.colors.primary }]}
          contentStyle={styles.confirmButtonContent}
          labelStyle={[styles.confirmButtonLabel, { color: theme.colors.secondary }]}
        >
          {isBooking ? 'Processing...' : 'Confirm & Pay'}
        </Button>
      </View>

      {/* Success Modal */}
      <Portal>
        <Modal 
          visible={showSuccessModal} 
          onDismiss={handleSuccessModalClose}
          contentContainerStyle={styles.modalContainer}
        >
          <Surface style={styles.successModal} elevation={4}>
            <View style={styles.successIcon}>
              <MaterialIcons name="check-circle" size={64} color="#4CAF50" />
            </View>
            <Text style={styles.successTitle}>Booking Confirmed!</Text>
            <Text style={styles.successMessage}>
              Your ground has been booked successfully. You will receive a confirmation SMS shortly.
            </Text>
            <Button
              mode="contained"
              onPress={handleSuccessModalClose}
              style={[styles.successButton, { backgroundColor: theme.colors.primary }]}
              contentStyle={styles.successButtonContent}
              labelStyle={{ color: theme.colors.secondary }}
            >
              View My Bookings
            </Button>
          </Surface>
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    fontFamily: 'Montserrat_700Bold',
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  animatedCard: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  summaryCard: {
    borderRadius: 16,
    padding: 20,
    backgroundColor: 'white',
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  venueIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  venueInfo: {
    flex: 1,
  },
  venueName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'Montserrat_700Bold',
  },
  venueAddress: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
    fontFamily: 'Montserrat_400Regular',
  },
  priceChip: {
    // backgroundColor and borderColor set dynamically
  },
  priceChipText: {
    fontWeight: 'bold',
    fontFamily: 'Montserrat_600SemiBold',
  },
  bookingDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  detailText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 6,
    fontFamily: 'Montserrat_500Medium',
  },
  pricingCard: {
    borderRadius: 16,
    padding: 20,
    backgroundColor: 'white',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    fontFamily: 'Montserrat_700Bold',
  },
  priceBreakdown: {
    gap: 12,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Montserrat_400Regular',
  },
  priceValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    fontFamily: 'Montserrat_500Medium',
  },
  priceDivider: {
    marginVertical: 8,
    backgroundColor: '#E0E0E0',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'Montserrat_700Bold',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Montserrat_700Bold',
  },
  paymentCard: {
    borderRadius: 16,
    padding: 20,
    backgroundColor: 'white',
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FAFAFA',
  },
  selectedPaymentOption: {
    // borderColor and backgroundColor set dynamically
  },
  paymentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    fontFamily: 'Montserrat_600SemiBold',
  },
  paymentDesc: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
    fontFamily: 'Montserrat_400Regular',
  },
  infoCard: {
    borderRadius: 16,
    padding: 20,
    backgroundColor: 'white',
  },
  infoList: {
    gap: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 12,
    flex: 1,
    fontFamily: 'Montserrat_400Regular',
  },
  bottomAction: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  totalSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  totalSummaryLabel: {
    fontSize: 16,
    color: '#666',
    fontFamily: 'Montserrat_500Medium',
  },
  totalSummaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'Montserrat_700Bold',
  },
  confirmButton: {
    borderRadius: 12,
    elevation: 2,
  },
  confirmButtonContent: {
    paddingVertical: 12,
  },
  confirmButtonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Montserrat_700Bold',
  },
  modalContainer: {
    margin: 20,
    justifyContent: 'center',
  },
  successModal: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
  },
  successIcon: {
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
    fontFamily: 'Montserrat_700Bold',
  },
  successMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
    fontFamily: 'Montserrat_400Regular',
  },
  successButton: {
    borderRadius: 12,
    minWidth: 200,
  },
  successButtonContent: {
    paddingVertical: 8,
  },
});