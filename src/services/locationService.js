import * as Location from 'expo-location';
import { Alert } from 'react-native';

export const locationService = {
  // Request location permissions with user-friendly prompts
  requestLocationPermission: async () => {
    try {
      console.log('📍 Requesting location permission...');
      
      // Check current permission status
      const { status: existingStatus } = await Location.getForegroundPermissionsAsync();
      
      if (existingStatus === 'granted') {
        console.log('📍 Location permission already granted');
        return { granted: true, location: await locationService.getCurrentLocation() };
      }
      
      // Request permission with user-friendly explanation
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status === 'granted') {
        console.log('📍 Location permission granted');
        const location = await locationService.getCurrentLocation();
        return { granted: true, location };
      } else {
        console.log('📍 Location permission denied');
        return { granted: false, location: null };
      }
    } catch (error) {
      console.error('📍 Error requesting location permission:', error);
      return { granted: false, location: null, error: error.message };
    }
  },

  // Get current location
  getCurrentLocation: async () => {
    try {
      console.log('📍 Getting current location...');
      
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeout: 10000,
      });
      
      console.log('📍 Location obtained:', {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      
      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
        timestamp: location.timestamp,
      };
    } catch (error) {
      console.error('📍 Error getting location:', error);
      throw error;
    }
  },

  // Show location permission dialog with explanation
  showLocationPermissionDialog: () => {
    return new Promise((resolve) => {
      Alert.alert(
        '📍 Enable Location Access',
        'Arena Pro uses your location to:\n\n• Find nearby sports venues\n• Show accurate distances\n• Provide better recommendations\n\nYour location data is kept private and secure.',
        [
          {
            text: 'Not Now',
            style: 'cancel',
            onPress: () => resolve(false),
          },
          {
            text: 'Enable Location',
            onPress: () => resolve(true),
          },
        ],
        { cancelable: false }
      );
    });
  },

  // Handle location permission flow with user education
  handleLocationPermissionFlow: async () => {
    try {
      // First, show explanation dialog
      const userWantsLocation = await locationService.showLocationPermissionDialog();
      
      if (!userWantsLocation) {
        console.log('📍 User declined location access');
        return { granted: false, location: null, userDeclined: true };
      }
      
      // User agreed, now request actual permission
      const result = await locationService.requestLocationPermission();
      
      if (!result.granted) {
        // Show additional help if permission was denied
        Alert.alert(
          'Location Access Needed',
          'To find venues near you, please enable location access in your device settings.\n\nGo to Settings > Privacy > Location Services > Arena Pro',
          [{ text: 'OK' }]
        );
      }
      
      return result;
    } catch (error) {
      console.error('📍 Error in location permission flow:', error);
      return { granted: false, location: null, error: error.message };
    }
  },

  // Check if location services are enabled
  isLocationEnabled: async () => {
    try {
      const enabled = await Location.hasServicesEnabledAsync();
      console.log('📍 Location services enabled:', enabled);
      return enabled;
    } catch (error) {
      console.error('📍 Error checking location services:', error);
      return false;
    }
  },
};