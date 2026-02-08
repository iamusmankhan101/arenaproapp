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
  SafeAreaView,
  Image,
  Linking
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
import { fetchUserProfile } from '../../store/slices/authSlice';
import { createBooking, fetchUserBookings } from '../../store/slices/bookingSlice';
import { MaterialIcons } from '@expo/vector-icons';
import { safeDate, safeFormatDate } from '../../utils/dateUtils';
import { theme } from '../../theme/theme';
import * as ImagePicker from 'expo-image-picker';
import { turfAPI } from '../../services/firebaseAPI'; // Import API directly for upload
import { REFERRAL_CONSTANTS, calculateDiscountedTotal } from '../../utils/referralUtils';

const { width, height } = Dimensions.get('window');

export default function BookingConfirmScreen({ route, navigation }) {
  const { turf, slot, date } = route.params;
  console.log('🔍 DEBUG: BookingConfirm - Received date param:', date);
  const [paymentMethod, setPaymentMethod] = useState('jazzcash');
  const [isBooking, setIsBooking] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showPaymentInstructions, setShowPaymentInstructions] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));
  const [screenshot, setScreenshot] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [paymentMode, setPaymentMode] = useState('advance'); // 'venue' or 'advance'
  const [confirmBookingId, setConfirmBookingId] = useState(null); // To store booking ID for WhatsApp notification

  const paymentDetails = {
    jazzcash: { name: 'JazzCash', accountName: 'Muhammad Usman Khan', accountNumber: '03058562523' },
    easypaisa: { name: 'EasyPaisa', accountName: 'Muhammad Usman Khan', accountNumber: '03058562523' },
    card: { name: 'Bank Transfer', accountName: 'Muhammad Usman Khan', accountNumber: '56565002675200', bankName: 'Bank Alfalah' }
  };

  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);

  useEffect(() => {
    // Refresh user profile to get latest referral eligibility status
    dispatch(fetchUserProfile());
  }, [dispatch]);

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
    let finalTotal = basePrice;
    let referralDiscount = 0;

    // Check for referral eligibility (User has "Rs 300 off next booking")
    const isReferralEligible = user?.referralDiscountEligible;

    if (isReferralEligible) {
      // Apply 300 Rs discount
      const result = calculateDiscountedTotal(basePrice, REFERRAL_CONSTANTS.REFERRER_REWARD);
      referralDiscount = result.discountApplied;
      // We apply this BEFORE the payment mode discount to give maximum benefit?
      // Or after? Usually flat discounts are applied first or last.
      // Let's apply it to the base price first.

      // Actually, let's keep it simple.
      // If we apply 300 off, the new "Base" for percentage calculation is smaller?
      // Or is the percentage discount on the original price?
      // Let's stick to: Total = (Base - %Discount) - FlatDiscount
    }

    if (paymentMode === 'venue') {
      // Venue payment mode - 5% discount
      const percentageDiscount = basePrice * 0.05;

      let totalAfterPercentage = basePrice - percentageDiscount;

      // Apply referral discount if eligible
      if (isReferralEligible) {
        const result = calculateDiscountedTotal(totalAfterPercentage, REFERRAL_CONSTANTS.REFERRER_REWARD);
        referralDiscount = result.discountApplied;
        finalTotal = result.finalTotal;
      } else {
        finalTotal = totalAfterPercentage;
      }

      return {
        basePrice,
        total: finalTotal,
        discount: percentageDiscount, // This is just the percentage discount amount
        referralDiscount,
        advance: 0,
        remaining: finalTotal
      };
    } else {
      // Advance payment mode - 10% discount
      const percentageDiscount = basePrice * 0.10;

      let totalAfterPercentage = basePrice - percentageDiscount;

      // Apply referral discount if eligible
      if (isReferralEligible) {
        const result = calculateDiscountedTotal(totalAfterPercentage, REFERRAL_CONSTANTS.REFERRER_REWARD);
        referralDiscount = result.discountApplied;
        finalTotal = result.finalTotal;
      } else {
        finalTotal = totalAfterPercentage;
      }

      const ADVANCE_AMOUNT = 500;

      return {
        basePrice,
        total: finalTotal,
        discount: percentageDiscount,
        referralDiscount,
        advance: ADVANCE_AMOUNT,
        remaining: Math.max(0, finalTotal - ADVANCE_AMOUNT)
      };
    }
  };

  const pricing = calculateTotal();

  const handleInitialConfirm = () => {
    if (paymentMode === 'venue') {
      // Direct confirm for venue payment
      handleFinalConfirm();
    } else {
      // Show instructions for advance payment
      setShowPaymentInstructions(true);
    }
  };

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
    });

    console.log(result);

    if (!result.canceled) {
      setScreenshot(result.assets[0].uri);
    }
  };

  const handleFinalConfirm = async () => {
    if (paymentMode === 'advance') {
      setUploading(true);
    }
    // don't close modal yet, wait for upload

    try {
      let screenshotUrl = null;
      if (paymentMode === 'advance' && screenshot) {
        const filename = screenshot.substring(screenshot.lastIndexOf('/') + 1);
        const uploadPath = `payment_proofs/${Date.now()}_${filename}`;
        screenshotUrl = await turfAPI.uploadImage(screenshot, uploadPath);
      }

      setShowPaymentInstructions(false); // Close modal after upload success
      setIsBooking(true);

      const bookingData = {
        turfId: turf.id,
        date: date,
        startTime: slot.startTime,
        endTime: slot.endTime,
        totalAmount: pricing.total,
        advancePaid: pricing.advance,
        remainingAmount: pricing.remaining,
        paymentMethod: paymentMode === 'advance' ? paymentMethod : 'cash_at_venue', // Online payment method for the advance
        slotType: slot.priceType,
        paymentStatus: paymentMode === 'advance' ? 'partial' : 'pending', // Initial status is partial (advance paid)
        paymentScreenshot: screenshotUrl,
        referralDiscountApplied: pricing.referralDiscount > 0,
        referralDiscountAmount: pricing.referralDiscount
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
              onPress: () => navigation.navigate('Home')
            }
          ]
        );
      } else {
        // Authenticated booking confirmed
        setConfirmBookingId(result.bookingId); // Store booking ID
        setShowSuccessModal(true);
      }

    } catch (error) {
      console.error("Booking Error:", error);
      Alert.alert(
        'Booking Failed',
        error.message || 'Details could not be uploaded or slot taken. Please try again.',
        [
          { text: 'OK' }
        ]
      );
    } finally {
      setIsBooking(false);
      setUploading(false);
    }
  };

  const handleWhatsAppNotification = (bookingId) => {
    if (!slot || !bookingId) return;

    // Use turf phone number or a default fallback if missing
    const rawPhone = turf?.phoneNumber || '923001234567';

    // Sanitize phone number: remove '+' and non-numeric characters
    const turfPhone = rawPhone.replace(/\D/g, '').replace(/^0+/, '');

    console.log('📱 WhatsApp: Opening chat with', turfPhone);

    // Message for Ground Owner
    // Manually parse YYYY-MM-DD for message too
    const [year, month, day] = date.split('-').map(Number);
    const msgDate = new Date(year, month - 1, day).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const message = `Hello, I just booked ${turf.name || 'your venue'}.

📅 Date: ${msgDate}
⏰ Time: ${slot.startTime} - ${slot.endTime}
🆔 Booking ID: ${bookingId}
💰 Amount: PKR ${pricing.total}

Please confirm my booking.`;

    const url = `whatsapp://send?phone=${turfPhone}&text=${encodeURIComponent(message)}`;

    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        console.log('❌ WhatsApp: Not supported/installed');
        Alert.alert('Error', 'WhatsApp is not installed on this device');
      }
    }).catch(err => {
      console.error('❌ WhatsApp: Linking error:', err);
      Alert.alert('Error', 'Could not open WhatsApp');
    });
    // Note: To send to "My Whatsapp" (the user), we would need a separate action because we can't open two chats at once.
    // We can add a second button or just rely on the user sharing the booking details from the "My Bookings" screen later.
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    // Refresh bookings data before navigating
    dispatch(fetchUserBookings());
    // Refresh user profile to update booking count and unlock referral code
    dispatch(fetchUserProfile());
    navigation.navigate('Bookings');
  };

  const formatDateTime = () => {
    try {
      if (!date) return { date: 'Invalid Date', time: `${slot.startTime} - ${slot.endTime}` };

      // Manually parse YYYY-MM-DD to avoid timezone issues
      const [year, month, day] = date.split('-').map(Number);
      const bookingDate = new Date(year, month - 1, day);

      const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      };

      return {
        date: bookingDate.toLocaleDateString('en-US', options),
        time: `${slot.startTime} - ${slot.endTime}`
      };
    } catch (error) {
      console.error('❌ BookingConfirmScreen: Error formatting date:', error);
      return {
        date: 'Invalid Date',
        time: `${slot.startTime} - ${slot.endTime}`
      };
    }
  };

  const getPaymentIcon = (method) => {
    switch (method) {
      case 'jazzcash': return 'account-balance-wallet';
      case 'easypaisa': return 'payment';
      case 'card': return 'account-balance'; // Changed icon for Bank Transfer
      default: return 'payment';
    }
  };

  const getPaymentColor = (method) => {
    switch (method) {
      case 'jazzcash': return '#FF6B35';
      case 'easypaisa': return '#00A651';
      case 'card': return '#1976D2';
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

            <View style={[styles.bookingDetails, { flexDirection: 'column', alignItems: 'flex-start', gap: 12 }]}>
              <View style={[styles.detailItem, { flex: 0, width: '100%' }]}>
                <MaterialIcons name="event" size={18} color="#666" />
                <Text style={[styles.detailText, { fontSize: 14 }]}>{formattedDate}</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
                <View style={[styles.detailItem, { justifyContent: 'flex-start' }]}>
                  <MaterialIcons name="schedule" size={18} color="#666" />
                  <Text style={styles.detailText}>{time}</Text>
                </View>
                <View style={[styles.detailItem, { justifyContent: 'flex-end' }]}>
                  <MaterialIcons name="wb-sunny" size={18} color="#666" />
                  <Text style={styles.detailText}>{slot.priceType}</Text>
                </View>
              </View>
            </View>
          </Surface>
        </Animated.View>

        {/* Payment Options Selection */}
        <View
          style={[
            styles.animatedCard,
            {
              // Temporary debug style/removal of animation


            }
          ]}
        >
          <Surface style={styles.paymentCard} elevation={1}>
            <Text style={styles.sectionTitle}>Choose Payment Option</Text>

            <TouchableOpacity
              style={[
                styles.paymentOption,
                paymentMode === 'advance' && [styles.selectedPaymentOption, { borderColor: theme.colors.primary, backgroundColor: `${theme.colors.secondary}20` }]
              ]}
              onPress={() => setPaymentMode('advance')}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <MaterialIcons name="local-offer" size={24} color={theme.colors.primary} style={{ marginRight: 12 }} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.paymentName, { color: theme.colors.primary }]}>Pay Advance & Save 10%</Text>
                  <Text style={styles.paymentDesc}>Pay PKR 500 now, get discounted total</Text>
                </View>
                <Chip textStyle={{ fontSize: 10, height: 12, lineHeight: 12 }} style={{ backgroundColor: '#E8F5E9' }}>Save 10%</Chip>
              </View>
              <RadioButton value="advance" status={paymentMode === 'advance' ? 'checked' : 'unchecked'} color={theme.colors.primary} onPress={() => setPaymentMode('advance')} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.paymentOption,
                paymentMode === 'venue' && [styles.selectedPaymentOption, { borderColor: theme.colors.primary, backgroundColor: `${theme.colors.secondary}20` }]
              ]}
              onPress={() => setPaymentMode('venue')}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <MaterialIcons name="storefront" size={24} color="#666" style={{ marginRight: 12 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.paymentName}>Pay Full at Venue</Text>
                  <Text style={styles.paymentDesc}>No advance payment required</Text>
                </View>
                <Chip textStyle={{ fontSize: 10, height: 12, lineHeight: 12 }} style={{ backgroundColor: '#E8F5E9', marginLeft: 8 }}>Save 5%</Chip>

              </View>
              <RadioButton value="venue" status={paymentMode === 'venue' ? 'checked' : 'unchecked'} color={theme.colors.primary} onPress={() => setPaymentMode('venue')} />
            </TouchableOpacity>
          </Surface>
        </View>

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
                <Text style={styles.priceLabel}>Slot Price</Text>
                <Text style={[styles.priceValue, { textDecorationLine: paymentMode === 'advance' ? 'line-through' : 'none', color: paymentMode === 'advance' ? '#999' : '#333' }]}>
                  PKR {pricing.basePrice.toLocaleString()}
                </Text>
              </View>

              <View style={styles.priceRow}>
                <Text style={[styles.priceLabel, { color: '#4CAF50' }]}>
                  Discount ({paymentMode === 'advance' ? '10%' : '5%'})
                </Text>
                <Text style={[styles.priceValue, { color: '#4CAF50' }]}>- PKR {pricing.discount.toLocaleString()}</Text>
              </View>

              <View style={[styles.priceRow, { marginTop: 4 }]}>
                <Text style={[styles.priceLabel, { fontWeight: 'bold', color: '#333' }]}>Total Amount</Text>
                <Text style={[styles.priceValue, { fontWeight: 'bold', color: '#333' }]}>PKR {pricing.total.toLocaleString()}</Text>
              </View>

              <Divider style={styles.priceDivider} />

              {paymentMode === 'advance' ? (
                <>
                  <View style={[styles.priceRow, { marginTop: 4 }]}>
                    <Text style={[styles.priceLabel, { color: theme.colors.primary, fontWeight: '600' }]}>Advance Payment</Text>
                    <Text style={[styles.priceValue, { color: theme.colors.primary, fontWeight: '700' }]}>PKR {pricing.advance.toLocaleString()}</Text>
                  </View>

                  <View style={styles.priceRow}>
                    <Text style={styles.priceLabel}>Balance Payable at Venue</Text>
                    <Text style={styles.priceValue}>PKR {pricing.remaining.toLocaleString()}</Text>
                  </View>
                </>
              ) : (
                <View style={[styles.priceRow, { marginTop: 4 }]}>
                  <Text style={[styles.priceLabel, { color: theme.colors.primary, fontWeight: '600' }]}>Payable at Venue</Text>
                  <Text style={[styles.priceValue, { color: theme.colors.primary, fontWeight: '700' }]}>PKR {pricing.total.toLocaleString()}</Text>
                </View>
              )}

              {pricing.referralDiscount > 0 && (
                <View style={[styles.priceRow, { marginTop: 4, backgroundColor: '#E8F5E9', padding: 4, borderRadius: 4 }]}>
                  <Text style={[styles.priceLabel, { color: '#2E7D32', fontWeight: 'bold' }]}>
                    Referral Reward Applies!
                  </Text>
                  <Text style={[styles.priceValue, { color: '#2E7D32', fontWeight: 'bold' }]}>
                    - PKR {pricing.referralDiscount}
                  </Text>
                </View>
              )}

            </View>
          </Surface>
        </Animated.View>

        {/* Payment Methods - Only show if Advance Mode */}
        {paymentMode === 'advance' && (
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
              <Text style={styles.sectionTitle}>Pay Advance With</Text>
              <Text style={{ fontSize: 12, color: '#666', marginBottom: 10, fontStyle: 'italic' }}>Select a payment method to view account details</Text>

              <RadioButton.Group
                onValueChange={setPaymentMethod}
                value={paymentMethod}
              >
                {[
                  { value: 'jazzcash', name: 'JazzCash', desc: 'Mobile wallet payment' },
                  { value: 'easypaisa', name: 'EasyPaisa', desc: 'Mobile wallet payment' },
                  { value: 'card', name: 'Bank Transfer', desc: 'Direct Bank Transfer' },
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
                        {method.value === 'jazzcash' ? (
                          <Image
                            source={require('../../images/lg-691c164eec616-JazzCash.webp')}
                            style={{ width: 24, height: 24, resizeMode: 'contain' }}
                          />
                        ) : method.value === 'easypaisa' ? (
                          <Image
                            source={require('../../images/easypaisa-pay-logo-11685340011w1ndm8dzgj.png')}
                            style={{ width: 24, height: 24, resizeMode: 'contain' }}
                          />
                        ) : (
                          <MaterialIcons
                            name={getPaymentIcon(method.value)}
                            size={20}
                            color={getPaymentColor(method.value)}
                          />
                        )}
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
        )}

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
              {paymentMode === 'advance' && (
                <View style={styles.infoItem}>
                  <MaterialIcons name="info" size={16} color={theme.colors.primary} />
                  <Text style={styles.infoText}>Advance payment of PKR {pricing.advance} is non-refundable if cancelled within 2 hours of slot.</Text>
                </View>
              )}

              <View style={styles.infoItem}>
                <MaterialIcons name="check-circle" size={16} color="#4CAF50" />
                <Text style={styles.infoText}>
                  {paymentMode === 'advance'
                    ? `Remaining PKR ${pricing.remaining} to be paid at the venue.`
                    : `Full amount based on venue rates to be paid at the venue.`}
                </Text>
              </View>

              <View style={styles.infoItem}>
                <MaterialIcons name="access-time" size={16} color="#FF9800" />
                <Text style={styles.infoText}>Arrive 10 minutes before your slot</Text>
              </View>

              <View style={styles.infoItem}>
                <MaterialIcons name="phone" size={16} color={theme.colors.primary} />
                <Text style={styles.infoText}>Contact: {turf.phoneNumber}</Text>
              </View>
            </View>
          </Surface>
        </Animated.View>
      </ScrollView>

      {/* Bottom Action */}
      <View style={styles.bottomAction}>
        <View style={styles.totalSummary}>
          <Text style={styles.totalSummaryLabel}>{paymentMode === 'advance' ? 'Advance Payable' : 'Payable at Venue'}</Text>
          <Text style={[styles.totalSummaryValue, { color: theme.colors.primary }]}>
            PKR {paymentMode === 'advance' ? pricing.advance.toLocaleString() : pricing.total.toLocaleString()}
          </Text>
        </View>
        <Button
          mode="contained"
          onPress={handleInitialConfirm}
          loading={isBooking}
          disabled={isBooking}
          style={[styles.confirmButton, { backgroundColor: theme.colors.primary }]}
          contentStyle={styles.confirmButtonContent}
          labelStyle={[styles.confirmButtonLabel, { color: theme.colors.secondary }]}
        >
          {isBooking ? 'Processing...' : (paymentMode === 'advance' ? `Pay ${pricing.advance} & Confirm` : 'Confirm Booking')}
        </Button>
      </View>

      {/* Payment Instructions Modal */}
      <Portal>
        <Modal
          visible={showPaymentInstructions}
          onDismiss={() => setShowPaymentInstructions(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Surface style={styles.successModal} elevation={4}>
            <Text style={styles.successTitle}>Payment Instructions</Text>
            <Text style={[styles.successMessage, { marginBottom: 10 }]}>
              Please send <Text style={{ fontWeight: 'bold' }}>PKR {pricing.advance}</Text> to the following account:
            </Text>

            <View style={{
              backgroundColor: '#F5F5F5',
              padding: 16,
              borderRadius: 12,
              width: '100%',
              marginBottom: 24,
              borderWidth: 1,
              borderColor: '#E0E0E0'
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                {paymentMethod === 'jazzcash' ? (
                  <Image
                    source={require('../../images/lg-691c164eec616-JazzCash.webp')}
                    style={{ width: 40, height: 40, resizeMode: 'contain', marginRight: 12 }}
                  />
                ) : paymentMethod === 'easypaisa' ? (
                  <Image
                    source={require('../../images/easypaisa-pay-logo-11685340011w1ndm8dzgj.png')}
                    style={{ width: 40, height: 40, resizeMode: 'contain', marginRight: 12 }}
                  />
                ) : (
                  <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#E3F2FD', justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
                    <MaterialIcons name="account-balance" size={24} color="#1976D2" />
                  </View>
                )}
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#333' }}>{paymentDetails[paymentMethod]?.name}</Text>
              </View>

              <View style={{ marginBottom: 8 }}>
                <Text style={{ fontSize: 12, color: '#666' }}>Account Title</Text>
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#333' }}>{paymentDetails[paymentMethod]?.accountName}</Text>
              </View>

              {paymentDetails[paymentMethod]?.bankName && (
                <View style={{ marginBottom: 8 }}>
                  <Text style={{ fontSize: 12, color: '#666' }}>Bank Name</Text>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: '#333' }}>{paymentDetails[paymentMethod]?.bankName}</Text>
                </View>
              )}

              <View>
                <Text style={{ fontSize: 12, color: '#666' }}>Account Number</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.colors.primary, letterSpacing: 1 }}>
                    {paymentDetails[paymentMethod]?.accountNumber}
                  </Text>
                </View>
              </View>
            </View>

            {/* Screenshot Upload Section */}
            <View style={{ width: '100%', marginBottom: 24 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 8 }}>Upload Payment Proof (Optional)</Text>
              <TouchableOpacity
                onPress={pickImage}
                style={{
                  height: 120,
                  backgroundColor: '#F5F5F5',
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: '#E0E0E0',
                  borderStyle: 'dashed',
                  justifyContent: 'center',
                  alignItems: 'center',
                  overflow: 'hidden'
                }}
              >
                {screenshot ? (
                  <Image source={{ uri: screenshot }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                ) : (
                  <View style={{ alignItems: 'center' }}>
                    <MaterialIcons name="cloud-upload" size={32} color="#999" />
                    <Text style={{ color: '#666', marginTop: 8 }}>Tap to upload screenshot</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            <View style={{ width: '100%', gap: 10 }}>
              <Button
                mode="contained"
                onPress={handleFinalConfirm}
                style={[styles.successButton, { backgroundColor: theme.colors.primary, width: '100%' }]}
                contentStyle={{ paddingVertical: 8 }}
                labelStyle={{ color: theme.colors.secondary, fontSize: 16, fontWeight: 'bold' }}
              >
                I have sent the payment
              </Button>

              <Button
                mode="text"
                onPress={() => setShowPaymentInstructions(false)}
                color="#666"
              >
                Cancel
              </Button>
            </View>
          </Surface>
        </Modal>
      </Portal>

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
              {paymentMode === 'advance'
                ? `Your advance payment was successful. Please pay the remaining PKR ${pricing.remaining} at the venue.`
                : `Booking confirmed! Please pay PKR ${pricing.total} at the venue.`}
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