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
  Linking,
  Platform
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
import { uploadToCloudinary } from '../../services/cloudinaryService';
import { emailService } from '../../services/emailService';
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
  const insets = useSafeAreaInsets();

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

    try {
      let screenshotUrl = null;
      if (paymentMode === 'advance' && screenshot) {
        try {
          console.log('📤 Uploading payment screenshot to Cloudinary...');
          screenshotUrl = await uploadToCloudinary(screenshot, 'payment_proofs');
          console.log('✅ Payment screenshot uploaded successfully:', screenshotUrl);
        } catch (uploadError) {
          console.error('⚠️ Failed to upload payment screenshot:', uploadError);
          // Continue with booking even if screenshot upload fails
          Alert.alert(
            'Upload Warning',
            'Payment screenshot could not be uploaded, but your booking will still be created. You can contact the venue directly with proof of payment.',
            [{ text: 'Continue', onPress: () => {} }]
          );
        }
      }

      setShowPaymentInstructions(false);
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
        referralDiscountAmount: pricing.referralDiscount,
        // Pass Redux user data as fallback for auth race conditions
        userId: user?.uid,
        userEmail: user?.email,
        userName: user?.fullName || user?.displayName
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

        // Send Email Confirmation via EmailJS
        if (user && user.email) {
          try {
            const bookingDetailsForEmail = {
              bookingId: result.bookingId,
              turfName: turf.name,
              date: formattedDate,
              timeSlot: `${slot.startTime} - ${slot.endTime}`,
              totalAmount: pricing.total.toString(),
              turfAddress: turf.address
            };
            await emailService.sendBookingConfirmation(bookingDetailsForEmail, user);
          } catch (emailError) {
            console.log('⚠️ Failed to send booking email:', emailError);
          }
        }
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
    
    // Navigate to success screen
    navigation.navigate('BookingSuccess', {
      bookingDetails: {
        venueName: turf?.name || 'Venue',
        date: date,
        slot: slot,
      }
    });
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
      <StatusBar backgroundColor="transparent" barStyle="dark-content" translucent />

      {/* Modern Clean Header */}
      <View style={[styles.whiteHeader, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity
          style={styles.circularBackButton}
          onPress={() => {
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              navigation.navigate('MainTabs');
            }
          }}
        >
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.centeredTitle}>Confirm Booking</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Venue Summary Card - Enhanced */}
        <Animated.View
          style={[
            styles.animatedCard,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <View style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <View style={[styles.venueIconCircle, { backgroundColor: theme.colors.primary }]}>
                <MaterialIcons name="sports-soccer" size={28} color={theme.colors.secondary} />
              </View>
              <View style={styles.venueInfo}>
                <Text style={styles.venueName}>{turf.name}</Text>
                <View style={styles.addressRow}>
                  <MaterialIcons name="location-on" size={14} color="#999" />
                  <Text style={styles.venueAddress}>{turf.address}</Text>
                </View>
              </View>
            </View>

            <View style={styles.bookingDetailsGrid}>
              <View style={styles.detailBox}>
                <View style={[styles.detailIconCircle, { backgroundColor: '#E8F5E9' }]}>
                  <MaterialIcons name="event" size={20} color="#4CAF50" />
                </View>
                <Text style={styles.detailLabel}>Date</Text>
                <Text style={styles.detailValue}>{formattedDate}</Text>
              </View>

              <View style={styles.detailBox}>
                <View style={[styles.detailIconCircle, { backgroundColor: '#E3F2FD' }]}>
                  <MaterialIcons name="schedule" size={20} color="#2196F3" />
                </View>
                <Text style={styles.detailLabel}>Time</Text>
                <Text style={styles.detailValue}>{time}</Text>
              </View>

              <View style={styles.detailBox}>
                <View style={[styles.detailIconCircle, { backgroundColor: '#FFF3E0' }]}>
                  <MaterialIcons name="wb-sunny" size={20} color="#FF9800" />
                </View>
                <Text style={styles.detailLabel}>Slot Type</Text>
                <Text style={styles.detailValue}>{slot.priceType}</Text>
              </View>
            </View>

            <View style={styles.totalPriceRow}>
              <Text style={styles.totalPriceLabel}>Total Amount</Text>
              <Text style={[styles.totalPriceValue, { color: theme.colors.primary }]}>
                PKR {pricing.total.toLocaleString()}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Payment Options Selection - Enhanced */}
        <View style={styles.animatedCard}>
          <View style={styles.paymentCard}>
            <Text style={styles.sectionTitle}>Choose Payment Option</Text>

            <TouchableOpacity
              style={[
                styles.modernPaymentOption,
                paymentMode === 'advance' && [styles.selectedModernPaymentOption, { borderColor: theme.colors.primary }]
              ]}
              onPress={() => setPaymentMode('advance')}
            >
              <View style={[styles.paymentIconBox, { backgroundColor: `${theme.colors.primary}15` }]}>
                <MaterialIcons name="local-offer" size={28} color={theme.colors.primary} />
              </View>
              <View style={styles.paymentContent}>
                <View style={styles.paymentTitleRow}>
                  <Text style={[styles.modernPaymentName, { color: theme.colors.primary }]}>Pay Advance & Save 10%</Text>
                  <View style={[styles.saveBadge, { backgroundColor: '#E8F5E9' }]}>
                    <Text style={[styles.saveBadgeText, { color: '#4CAF50' }]}>Save 10%</Text>
                  </View>
                </View>
                <Text style={styles.modernPaymentDesc}>Pay PKR 500 now, get discounted total</Text>
              </View>
              <View style={[
                styles.radioCircle,
                paymentMode === 'advance' && [styles.radioCircleSelected, { borderColor: theme.colors.primary }]
              ]}>
                {paymentMode === 'advance' && (
                  <View style={[styles.radioInner, { backgroundColor: theme.colors.primary }]} />
                )}
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.modernPaymentOption,
                paymentMode === 'venue' && [styles.selectedModernPaymentOption, { borderColor: theme.colors.primary }]
              ]}
              onPress={() => setPaymentMode('venue')}
            >
              <View style={[styles.paymentIconBox, { backgroundColor: '#F5F5F5' }]}>
                <MaterialIcons name="storefront" size={28} color="#666" />
              </View>
              <View style={styles.paymentContent}>
                <View style={styles.paymentTitleRow}>
                  <Text style={styles.modernPaymentName}>Pay Full at Venue</Text>
                  <View style={[styles.saveBadge, { backgroundColor: '#E8F5E9' }]}>
                    <Text style={[styles.saveBadgeText, { color: '#4CAF50' }]}>Save 5%</Text>
                  </View>
                </View>
                <Text style={styles.modernPaymentDesc}>No advance payment required</Text>
              </View>
              <View style={[
                styles.radioCircle,
                paymentMode === 'venue' && [styles.radioCircleSelected, { borderColor: theme.colors.primary }]
              ]}>
                {paymentMode === 'venue' && (
                  <View style={[styles.radioInner, { backgroundColor: theme.colors.primary }]} />
                )}
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Pricing Breakdown - Enhanced */}
        <Animated.View
          style={[
            styles.animatedCard,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <View style={styles.pricingCard}>
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

              {pricing.referralDiscount > 0 && (
                <View style={styles.priceRow}>
                  <Text style={[styles.priceLabel, { color: '#2E7D32' }]}>
                    Referral Reward
                  </Text>
                  <Text style={[styles.priceValue, { color: '#2E7D32' }]}>
                    - PKR {pricing.referralDiscount}
                  </Text>
                </View>
              )}

              <View style={styles.priceDivider} />

              <View style={styles.priceRow}>
                <Text style={[styles.priceLabel, { fontWeight: '700', fontSize: 16, color: '#333', fontFamily: 'Montserrat_700Bold' }]}>Total Amount</Text>
                <Text style={[styles.priceValue, { fontWeight: '700', fontSize: 18, color: theme.colors.primary, fontFamily: 'Montserrat_700Bold' }]}>PKR {pricing.total.toLocaleString()}</Text>
              </View>

              {paymentMode === 'advance' ? (
                <>
                  <View style={styles.priceDivider} />
                  <View style={[styles.priceRow, { backgroundColor: `${theme.colors.primary}08`, padding: 12, borderRadius: 8, marginTop: 8 }]}>
                    <Text style={[styles.priceLabel, { color: theme.colors.primary, fontWeight: '600', fontFamily: 'Montserrat_600SemiBold' }]}>Advance Payment</Text>
                    <Text style={[styles.priceValue, { color: theme.colors.primary, fontWeight: '700', fontSize: 16, fontFamily: 'Montserrat_700Bold' }]}>PKR {pricing.advance.toLocaleString()}</Text>
                  </View>

                  <View style={styles.priceRow}>
                    <Text style={styles.priceLabel}>Balance Payable at Venue</Text>
                    <Text style={styles.priceValue}>PKR {pricing.remaining.toLocaleString()}</Text>
                  </View>
                </>
              ) : (
                <>
                  <View style={styles.priceDivider} />
                  <View style={[styles.priceRow, { backgroundColor: `${theme.colors.primary}08`, padding: 12, borderRadius: 8, marginTop: 8 }]}>
                    <Text style={[styles.priceLabel, { color: theme.colors.primary, fontWeight: '600', fontFamily: 'Montserrat_600SemiBold' }]}>Payable at Venue</Text>
                    <Text style={[styles.priceValue, { color: theme.colors.primary, fontWeight: '700', fontSize: 16, fontFamily: 'Montserrat_700Bold' }]}>PKR {pricing.total.toLocaleString()}</Text>
                  </View>
                </>
              )}
            </View>
          </View>
        </Animated.View>

        {/* Payment Methods - Only show if Advance Mode - Enhanced */}
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
            <View style={styles.paymentCard}>
              <Text style={styles.sectionTitle}>Pay Advance With</Text>
              <Text style={styles.sectionSubtitle}>Select a payment method to view account details</Text>

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
                      styles.modernPaymentMethodOption,
                      paymentMethod === method.value && [styles.selectedModernPaymentOption, {
                        borderColor: theme.colors.primary
                      }]
                    ]}
                    onPress={() => setPaymentMethod(method.value)}
                  >
                    <View style={styles.paymentMethodLeft}>
                      <View style={[
                        styles.paymentMethodIconContainer,
                        { backgroundColor: getPaymentColor(method.value) + '15' }
                      ]}>
                        {method.value === 'jazzcash' ? (
                          <Image
                            source={require('../../images/lg-691c164eec616-JazzCash.webp')}
                            style={{ width: 28, height: 28, resizeMode: 'contain' }}
                          />
                        ) : method.value === 'easypaisa' ? (
                          <Image
                            source={require('../../images/easypaisa-pay-logo-11685340011w1ndm8dzgj.png')}
                            style={{ width: 28, height: 28, resizeMode: 'contain' }}
                          />
                        ) : (
                          <MaterialIcons
                            name={getPaymentIcon(method.value)}
                            size={24}
                            color={getPaymentColor(method.value)}
                          />
                        )}
                      </View>
                      <View style={styles.paymentMethodInfo}>
                        <Text style={styles.modernPaymentName}>{method.name}</Text>
                        <Text style={styles.modernPaymentDesc}>{method.desc}</Text>
                      </View>
                    </View>
                    <View style={[
                      styles.radioCircle,
                      paymentMethod === method.value && [styles.radioCircleSelected, { borderColor: theme.colors.primary }]
                    ]}>
                      {paymentMethod === method.value && (
                        <View style={[styles.radioInner, { backgroundColor: theme.colors.primary }]} />
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </RadioButton.Group>
            </View>
          </Animated.View>
        )}

        {/* Important Information - Enhanced */}
        <Animated.View
          style={[
            styles.animatedCard,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <View style={styles.infoCard}>
            <Text style={styles.sectionTitle}>Important Information</Text>

            <View style={styles.infoList}>
              {paymentMode === 'advance' && (
                <View style={styles.modernInfoItem}>
                  <View style={[styles.infoIconCircle, { backgroundColor: `${theme.colors.primary}15` }]}>
                    <MaterialIcons name="info" size={18} color={theme.colors.primary} />
                  </View>
                  <Text style={styles.infoText}>Advance payment of PKR {pricing.advance} is non-refundable if cancelled within 2 hours of slot.</Text>
                </View>
              )}

              <View style={styles.modernInfoItem}>
                <View style={[styles.infoIconCircle, { backgroundColor: '#E8F5E9' }]}>
                  <MaterialIcons name="check-circle" size={18} color="#4CAF50" />
                </View>
                <Text style={styles.infoText}>
                  {paymentMode === 'advance'
                    ? `Remaining PKR ${pricing.remaining} to be paid at the venue.`
                    : `Full amount based on venue rates to be paid at the venue.`}
                </Text>
              </View>

              <View style={styles.modernInfoItem}>
                <View style={[styles.infoIconCircle, { backgroundColor: '#FFF3E0' }]}>
                  <MaterialIcons name="access-time" size={18} color="#FF9800" />
                </View>
                <Text style={styles.infoText}>Arrive 10 minutes before your slot</Text>
              </View>

              <View style={styles.modernInfoItem}>
                <View style={[styles.infoIconCircle, { backgroundColor: '#E3F2FD' }]}>
                  <MaterialIcons name="phone" size={18} color="#2196F3" />
                </View>
                <Text style={styles.infoText}>Contact: {turf.phoneNumber}</Text>
              </View>
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Bottom Action */}
      <View style={[styles.bottomAction, { paddingBottom: Platform.OS === 'android' ? 20 + insets.bottom : 20 }]}>
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

              {!!paymentDetails[paymentMethod]?.bankName && (
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
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 4 }}>Upload Payment Proof (Optional)</Text>
              <Text style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>You can share the screenshot with the venue via WhatsApp after booking</Text>
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
                    <Text style={{ color: '#666', marginTop: 8 }}>Tap to select screenshot</Text>
                    <Text style={{ color: '#999', fontSize: 11, marginTop: 4 }}>(Optional)</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            <View style={{ width: '100%', gap: 10 }}>
              <Button
                mode="contained"
                onPress={handleFinalConfirm}
                loading={isBooking}
                disabled={isBooking}
                style={[styles.successButton, { backgroundColor: theme.colors.primary, width: '100%' }]}
                contentStyle={{ paddingVertical: 8 }}
                labelStyle={{ color: theme.colors.secondary, fontSize: 16, fontWeight: 'bold' }}
              >
                {isBooking ? 'Creating Booking...' : 'Confirm Booking'}
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
  whiteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    backgroundColor: 'white',
    paddingBottom: 16,
  },
  circularBackButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  centeredTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    fontFamily: 'Montserrat_700Bold',
    flex: 1,
    textAlign: 'center',
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
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  venueIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  venueInfo: {
    flex: 1,
  },
  venueName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    fontFamily: 'Montserrat_700Bold',
    marginBottom: 4,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  venueAddress: {
    fontSize: 13,
    color: '#666',
    marginLeft: 4,
    fontFamily: 'Montserrat_400Regular',
    flex: 1,
  },
  bookingDetailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  detailBox: {
    flex: 1,
    alignItems: 'center',
  },
  detailIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 11,
    color: '#999',
    fontFamily: 'Montserrat_500Medium',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 12,
    color: '#333',
    fontFamily: 'Montserrat_600SemiBold',
    textAlign: 'center',
  },
  totalPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  totalPriceLabel: {
    fontSize: 16,
    color: '#666',
    fontFamily: 'Montserrat_600SemiBold',
  },
  totalPriceValue: {
    fontSize: 22,
    fontWeight: '700',
    fontFamily: 'Montserrat_700Bold',
  },
  pricingCard: {
    borderRadius: 16,
    padding: 20,
    backgroundColor: 'white',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
    fontFamily: 'Montserrat_700Bold',
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#999',
    marginBottom: 16,
    fontFamily: 'Montserrat_400Regular',
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
    fontFamily: 'Montserrat_500Medium',
  },
  priceValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
    fontFamily: 'Montserrat_600SemiBold',
  },
  priceDivider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 8,
  },
  paymentCard: {
    borderRadius: 16,
    padding: 20,
    backgroundColor: 'white',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  modernPaymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    backgroundColor: 'white',
  },
  selectedModernPaymentOption: {
    backgroundColor: '#F8FFF8',
  },
  paymentIconBox: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  paymentContent: {
    flex: 1,
  },
  paymentTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  modernPaymentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    fontFamily: 'Montserrat_600SemiBold',
    flex: 1,
  },
  modernPaymentDesc: {
    fontSize: 13,
    color: '#999',
    fontFamily: 'Montserrat_400Regular',
  },
  saveBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 8,
  },
  saveBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: 'Montserrat_600SemiBold',
  },
  radioCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCircleSelected: {
    borderWidth: 2,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  modernPaymentMethodOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    backgroundColor: 'white',
  },
  paymentMethodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentMethodIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  paymentMethodInfo: {
    flex: 1,
  },
  infoCard: {
    borderRadius: 16,
    padding: 20,
    backgroundColor: 'white',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  infoList: {
    gap: 16,
  },
  modernInfoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
    fontFamily: 'Montserrat_400Regular',
    lineHeight: 20,
    paddingTop: 8,
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
    fontFamily: 'Montserrat_600SemiBold',
  },
  totalSummaryValue: {
    fontSize: 22,
    fontWeight: '700',
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
    fontWeight: '700',
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
    fontWeight: '700',
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