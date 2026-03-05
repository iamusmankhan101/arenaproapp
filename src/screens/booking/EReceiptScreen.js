import React, { useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  Share,
  Platform,
} from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../theme/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export default function EReceiptScreen({ navigation, route }) {
  const { booking } = route.params || {};
  const insets = useSafeAreaInsets();

  if (!booking) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text>No booking data available</Text>
      </View>
    );
  }

  const formatDate = (dateTime) => {
    if (!dateTime) return 'N/A';
    const date = new Date(dateTime);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (dateTime) => {
    if (!dateTime) return 'N/A';
    const date = new Date(dateTime);
    if (isNaN(date.getTime())) return 'Invalid Time';
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatBookingDate = (dateTime) => {
    if (!dateTime) return 'N/A';
    const date = new Date(dateTime);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }) + ' | ' + date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const handleDownload = async () => {
    try {
      // Generate receipt text content
      const receiptContent = `
═══════════════════════════════════════
           ARENA PRO E-RECEIPT
═══════════════════════════════════════

Venue: ${booking.turfName || 'N/A'}

───────────────────────────────────────
BOOKING DETAILS
───────────────────────────────────────
Booking Date: ${formatBookingDate(booking.createdAt || booking.dateTime)}
Check In: ${formatDate(booking.dateTime)}
Time: ${formatTime(booking.dateTime)}
Duration: ${booking.duration || '1 Hour'}

───────────────────────────────────────
PAYMENT DETAILS
───────────────────────────────────────
Amount:          PKR ${String((booking.amount || booking.totalAmount || 0).toLocaleString())}
Tax & Fees:      PKR ${String((booking.taxFees || 0).toLocaleString())}
                 ─────────────────────
Total:           PKR ${String((booking.totalAmount || 0).toLocaleString())}

───────────────────────────────────────
CUSTOMER DETAILS
───────────────────────────────────────
Name: ${booking.userName || 'N/A'}
Phone: ${booking.userPhone || 'N/A'}
Transaction ID: ${booking.bookingReference || booking.id || 'N/A'}

═══════════════════════════════════════
Thank you for booking with Arena Pro!
═══════════════════════════════════════
      `.trim();

      // Create file name with timestamp
      const timestamp = new Date().getTime();
      const fileName = `ArenaPro_Receipt_${booking.bookingReference || booking.id || timestamp}.txt`;
      const fileUri = FileSystem.documentDirectory + fileName;

      // Write content to file
      await FileSystem.writeAsStringAsync(fileUri, receiptContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      // Check if sharing is available
      const isAvailable = await Sharing.isAvailableAsync();
      
      if (isAvailable) {
        // Share/download the file
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/plain',
          dialogTitle: 'Download E-Receipt',
          UTI: 'public.plain-text',
        });
        
        Alert.alert('Success', 'Receipt downloaded successfully!');
      } else {
        Alert.alert('Error', 'Sharing is not available on this device');
      }
    } catch (error) {
      console.error('Download error:', error);
      Alert.alert('Error', 'Failed to download receipt. Please try again.');
    }
  };

  const handleShare = async () => {
    try {
      const message = `
E-Receipt - Arena Pro

Venue: ${booking.turfName || 'N/A'}
Booking Date: ${formatBookingDate(booking.createdAt || booking.dateTime)}
Date: ${formatDate(booking.dateTime)}
Time: ${formatTime(booking.dateTime)}
Duration: ${booking.duration || '1 Hour'}

Amount: PKR ${String((booking.amount || booking.totalAmount || 0))}
Tax & Fees: PKR ${String((booking.taxFees || 0))}
Total: PKR ${String((booking.totalAmount || 0))}

Customer: ${booking.userName || 'N/A'}
Phone: ${booking.userPhone || 'N/A'}
Transaction ID: ${booking.bookingReference || booking.id || 'N/A'}
      `.trim();

      await Share.share({
        message: message,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share receipt');
    }
  };

  const ReceiptRow = ({ label, value, bold = false }) => (
    <View style={styles.receiptRow}>
      <Text style={styles.receiptLabel}>{String(label)}</Text>
      <Text style={[styles.receiptValue, bold && styles.receiptValueBold]}>
        {String(value)}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 40 + insets.bottom }
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialIcons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>E-Receipt</Text>
          <TouchableOpacity
            style={styles.shareButton}
            onPress={handleShare}
          >
            <MaterialIcons name="share" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        {/* Receipt Card */}
        <View style={styles.receiptCard}>
          {/* Barcode Section */}
          <View style={styles.barcodeSection}>
            <View style={styles.barcodeContainer}>
              {/* Simulated barcode using vertical lines */}
              <View style={styles.barcode}>
                {[...Array(40)].map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.barcodeLine,
                      { width: Math.random() > 0.5 ? 3 : 2 }
                    ]}
                  />
                ))}
              </View>
            </View>
          </View>

          {/* Venue Name */}
          <View style={styles.venueSection}>
            <Text style={styles.venueLabel}>Venue Name</Text>
            <Text style={styles.venueName}>{String(booking.turfName || 'N/A')}</Text>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Booking Details */}
          <View style={styles.detailsSection}>
            <ReceiptRow 
              label="Booking Date" 
              value={formatBookingDate(booking.createdAt || booking.dateTime)} 
            />
            <ReceiptRow 
              label="Check In" 
              value={formatDate(booking.dateTime)} 
            />
            <ReceiptRow 
              label="Time" 
              value={formatTime(booking.dateTime)} 
            />
            <ReceiptRow 
              label="Duration" 
              value={booking.duration || '1 Hour'} 
            />
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Payment Details */}
          <View style={styles.paymentSection}>
            <ReceiptRow 
              label="Amount" 
              value={`PKR ${String((booking.amount || booking.totalAmount || 0).toLocaleString())}`} 
            />
            <ReceiptRow 
              label="Tax & Fees" 
              value={`PKR ${String((booking.taxFees || 0).toLocaleString())}`} 
            />
            
            <View style={styles.totalDivider} />
            
            <ReceiptRow 
              label="Total" 
              value={`PKR ${String((booking.totalAmount || 0).toLocaleString())}`}
              bold={true}
            />
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Customer Details */}
          <View style={styles.customerSection}>
            <ReceiptRow 
              label="Name" 
              value={booking.userName || 'N/A'} 
            />
            <ReceiptRow 
              label="Phone Number" 
              value={booking.userPhone || 'N/A'} 
            />
            <ReceiptRow 
              label="Transaction ID" 
              value={booking.bookingReference || booking.id || 'N/A'} 
            />
          </View>
        </View>

        {/* Download Button */}
        <TouchableOpacity
          style={styles.downloadButton}
          onPress={handleDownload}
          activeOpacity={0.7}
        >
          <MaterialIcons name="download" size={20} color={theme.colors.secondary} />
          <Text style={styles.downloadButtonText}>Download E-Receipt</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
    fontFamily: 'ClashDisplay-Medium',
  },
  shareButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  receiptCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  barcodeSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  barcodeContainer: {
    width: '100%',
    height: 80,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  barcode: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
    gap: 2,
  },
  barcodeLine: {
    height: '100%',
    backgroundColor: '#000000',
  },
  venueSection: {
    marginBottom: 24,
  },
  venueLabel: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginBottom: 8,
    fontFamily: 'Montserrat_400Regular',
  },
  venueName: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
    fontFamily: 'ClashDisplay-Medium',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 20,
  },
  detailsSection: {
    gap: 16,
  },
  paymentSection: {
    gap: 16,
  },
  customerSection: {
    gap: 16,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  receiptLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontFamily: 'Montserrat_400Regular',
    flex: 1,
  },
  receiptValue: {
    fontSize: 14,
    color: theme.colors.text,
    fontFamily: 'Montserrat_500Medium',
    textAlign: 'right',
    flex: 1,
  },
  receiptValueBold: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.primary,
    fontFamily: 'Montserrat_700Bold',
  },
  totalDivider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 8,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    marginHorizontal: 20,
    marginTop: 24,
    paddingVertical: 16,
    borderRadius: 28,
    elevation: 2,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  downloadButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.secondary,
    marginLeft: 8,
    fontFamily: 'ClashDisplay-Medium',
  },
});
