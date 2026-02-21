import React, { useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../theme/theme';
import { CommonActions } from '@react-navigation/native';

export default function BookingSuccessScreen({ navigation, route }) {
  const { bookingDetails } = route.params || {};

  // Auto navigate to home after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      handleGoHome();
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleGoHome = () => {
    // Reset navigation to Home screen
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      })
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      
      {/* Back button */}
      <TouchableOpacity 
        style={styles.backButton}
        onPress={handleGoHome}
      >
        <MaterialIcons name="arrow-back" size={24} color={theme.colors.text} />
      </TouchableOpacity>

      {/* Success Icon */}
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <MaterialIcons name="check" size={80} color={theme.colors.background} />
        </View>

        {/* Success Message */}
        <Text style={styles.title}>Congratulations!</Text>
        <Text style={styles.subtitle}>
          Thank you for booking with Arena Pro
        </Text>

        {/* Booking Details (optional) */}
        {bookingDetails && (
          <View style={styles.detailsContainer}>
            <Text style={styles.detailsText}>
              Your booking has been confirmed
            </Text>
            {bookingDetails.venueName && (
              <Text style={styles.venueText}>{bookingDetails.venueName}</Text>
            )}
          </View>
        )}
      </View>

      {/* OK Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.okButton}
          onPress={handleGoHome}
        >
          <Text style={styles.okButtonText}>OK</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: 'ClashDisplay-Medium',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    fontFamily: 'Montserrat_400Regular',
    paddingHorizontal: 20,
  },
  detailsContainer: {
    marginTop: 32,
    alignItems: 'center',
  },
  detailsText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: 'Montserrat_400Regular',
  },
  venueText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.primary,
    textAlign: 'center',
    fontFamily: 'Montserrat_600SemiBold',
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  okButton: {
    backgroundColor: theme.colors.primary,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  okButtonText: {
    color: theme.colors.secondary,
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'ClashDisplay-Medium',
  },
});
