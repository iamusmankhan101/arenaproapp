import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Platform,
  Alert
} from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { theme } from '../../theme/theme';

export default function LocationPermissionScreen({ navigation }) {
  const [loading, setLoading] = useState(false);

  const handleAllowLocation = async () => {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        
        // Navigate to main app with location
        navigation.replace('MainTabs', {
          location: {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          }
        });
      } else {
        Alert.alert(
          'Permission Denied',
          'Location permission is required to show nearby venues. You can enable it later in settings or enter your location manually.',
          [
            { text: 'Enter Manually', onPress: () => navigation.navigate('ManualLocation') },
            { text: 'Continue Anyway', onPress: () => navigation.replace('MainTabs') }
          ]
        );
      }
    } catch (error) {
      console.error('Location permission error:', error);
      Alert.alert(
        'Error',
        'Failed to get location. Please try again or enter manually.',
        [
          { text: 'Enter Manually', onPress: () => navigation.navigate('ManualLocation') },
          { text: 'Try Again', onPress: handleAllowLocation }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleManualEntry = () => {
    navigation.navigate('ManualLocation');
  };

  const handleSkip = () => {
    navigation.replace('MainTabs');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={theme.colors.background}
      />
      
      {/* Skip Button */}
      <TouchableOpacity 
        style={styles.skipButton}
        onPress={handleSkip}
      >
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        {/* Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <MaterialIcons 
              name="location-on" 
              size={80} 
              color={theme.colors.primary} 
            />
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>What is Your Location?</Text>

        {/* Description */}
        <Text style={styles.description}>
          We need to know your location in order to suggest nearby venues and provide accurate distances.
        </Text>

        {/* Allow Location Button */}
        <TouchableOpacity
          style={styles.allowButton}
          onPress={handleAllowLocation}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={theme.colors.secondary} />
          ) : (
            <>
              <MaterialIcons 
                name="my-location" 
                size={24} 
                color={theme.colors.secondary} 
              />
              <Text style={styles.allowButtonText}>Allow Location Access</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Manual Entry Button */}
        <TouchableOpacity
          style={styles.manualButton}
          onPress={handleManualEntry}
          disabled={loading}
        >
          <Text style={styles.manualButtonText}>Enter Location Manually</Text>
        </TouchableOpacity>

        {/* Info Text */}
        <Text style={styles.infoText}>
          Your location data is only used to show nearby venues and will not be shared with third parties.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  skipButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    right: 20,
    zIndex: 10,
    padding: 10,
  },
  skipText: {
    fontSize: 16,
    color: theme.colors.text,
    fontFamily: 'Montserrat_600SemiBold',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  iconContainer: {
    marginBottom: 40,
  },
  iconCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: `${theme.colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.text,
    fontFamily: 'Montserrat_700Bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    fontFamily: 'Montserrat_400Regular',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  allowButton: {
    width: '100%',
    height: 56,
    backgroundColor: theme.colors.primary,
    borderRadius: 28,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  allowButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.secondary,
    fontFamily: 'Montserrat_700Bold',
  },
  manualButton: {
    width: '100%',
    height: 56,
    backgroundColor: 'transparent',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  manualButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.primary,
    fontFamily: 'Montserrat_600SemiBold',
  },
  infoText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontFamily: 'Montserrat_400Regular',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 20,
  },
});
