import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  Alert
} from 'react-native';
import { Text, TextInput, ActivityIndicator } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { theme } from '../../theme/theme';

export default function ManualLocationScreen({ navigation }) {
  const [city, setCity] = useState('');
  const [area, setArea] = useState('');
  const [loading, setLoading] = useState(false);
  const [cityFocused, setCityFocused] = useState(false);
  const [areaFocused, setAreaFocused] = useState(false);

  const handleSubmit = async () => {
    if (!city.trim()) {
      Alert.alert('Required', 'Please enter your city');
      return;
    }

    setLoading(true);
    try {
      // Try to geocode the location
      const searchQuery = area.trim() 
        ? `${area}, ${city}, Pakistan` 
        : `${city}, Pakistan`;
      
      const geocodeResult = await Location.geocodeAsync(searchQuery);

      if (geocodeResult && geocodeResult.length > 0) {
        const { latitude, longitude } = geocodeResult[0];
        
        // Navigate to main app with geocoded location
        navigation.replace('MainTabs', {
          location: {
            latitude,
            longitude,
            city: city.trim(),
            area: area.trim(),
            manual: true
          }
        });
      } else {
        // If geocoding fails, use default coordinates for the city
        Alert.alert(
          'Location Not Found',
          'Could not find exact coordinates. Using city center.',
          [
            { 
              text: 'OK', 
              onPress: () => {
                // Default to Lahore coordinates if geocoding fails
                navigation.replace('MainTabs', {
                  location: {
                    latitude: 31.5204,
                    longitude: 74.3587,
                    city: city.trim(),
                    area: area.trim(),
                    manual: true
                  }
                });
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      Alert.alert(
        'Error',
        'Failed to process location. Using default location.',
        [
          { 
            text: 'OK', 
            onPress: () => {
              navigation.replace('MainTabs', {
                location: {
                  latitude: 31.5204,
                  longitude: 74.3587,
                  city: city.trim(),
                  area: area.trim(),
                  manual: true
                }
              });
            }
          }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    navigation.replace('MainTabs');
  };

  const popularCities = ['Lahore', 'Karachi', 'Islamabad', 'Rawalpindi', 'Faisalabad'];

  const handleCitySelect = (selectedCity) => {
    setCity(selectedCity);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={theme.colors.background}
      />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <MaterialIcons 
                name="arrow-back" 
                size={24} 
                color={theme.colors.text} 
              />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.skipButton}
              onPress={handleSkip}
            >
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
          </View>

          {/* Icon */}
          <View style={styles.iconContainer}>
            <View style={styles.iconCircle}>
              <MaterialIcons 
                name="edit-location" 
                size={60} 
                color={theme.colors.primary} 
              />
            </View>
          </View>

          {/* Title */}
          <Text style={styles.title}>Enter Your Location</Text>
          <Text style={styles.subtitle}>
            Help us find venues near you
          </Text>

          {/* Form */}
          <View style={styles.form}>
            {/* City Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>City *</Text>
              <View style={[
                styles.inputWrapper,
                cityFocused && styles.inputWrapperFocused
              ]}>
                <MaterialIcons 
                  name="location-city" 
                  size={20} 
                  color={cityFocused ? theme.colors.primary : theme.colors.textSecondary} 
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  value={city}
                  onChangeText={setCity}
                  placeholder="Enter your city"
                  placeholderTextColor={theme.colors.textSecondary}
                  onFocus={() => setCityFocused(true)}
                  onBlur={() => setCityFocused(false)}
                  underlineColor="transparent"
                  activeUnderlineColor="transparent"
                  mode="flat"
                />
              </View>
            </View>

            {/* Popular Cities */}
            <View style={styles.popularCitiesContainer}>
              <Text style={styles.popularLabel}>Popular Cities:</Text>
              <View style={styles.citiesRow}>
                {popularCities.map((popularCity) => (
                  <TouchableOpacity
                    key={popularCity}
                    style={[
                      styles.cityChip,
                      city === popularCity && styles.cityChipActive
                    ]}
                    onPress={() => handleCitySelect(popularCity)}
                  >
                    <Text style={[
                      styles.cityChipText,
                      city === popularCity && styles.cityChipTextActive
                    ]}>
                      {popularCity}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Area Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Area (Optional)</Text>
              <View style={[
                styles.inputWrapper,
                areaFocused && styles.inputWrapperFocused
              ]}>
                <MaterialIcons 
                  name="place" 
                  size={20} 
                  color={areaFocused ? theme.colors.primary : theme.colors.textSecondary} 
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  value={area}
                  onChangeText={setArea}
                  placeholder="Enter your area or neighborhood"
                  placeholderTextColor={theme.colors.textSecondary}
                  onFocus={() => setAreaFocused(true)}
                  onBlur={() => setAreaFocused(false)}
                  underlineColor="transparent"
                  activeUnderlineColor="transparent"
                  mode="flat"
                />
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[
                styles.submitButton,
                (!city.trim() || loading) && styles.submitButtonDisabled
              ]}
              onPress={handleSubmit}
              disabled={!city.trim() || loading}
            >
              {loading ? (
                <ActivityIndicator color={theme.colors.secondary} />
              ) : (
                <>
                  <Text style={styles.submitButtonText}>Continue</Text>
                  <MaterialIcons 
                    name="arrow-forward" 
                    size={24} 
                    color={theme.colors.secondary} 
                  />
                </>
              )}
            </TouchableOpacity>

            {/* Info Text */}
            <Text style={styles.infoText}>
              We'll use this information to show you nearby venues and calculate distances.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 10 : 20,
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  skipButton: {
    padding: 8,
  },
  skipText: {
    fontSize: 16,
    color: theme.colors.text,
    fontFamily: 'Montserrat_600SemiBold',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
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
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    fontFamily: 'Montserrat_400Regular',
    textAlign: 'center',
    marginBottom: 32,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    fontFamily: 'Montserrat_600SemiBold',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    paddingHorizontal: 16,
    height: 56,
  },
  inputWrapperFocused: {
    borderColor: theme.colors.primary,
    backgroundColor: `${theme.colors.primary}08`,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    backgroundColor: 'transparent',
    fontSize: 16,
    fontFamily: 'Montserrat_400Regular',
    color: theme.colors.text,
    height: 56,
  },
  popularCitiesContainer: {
    marginBottom: 24,
  },
  popularLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    fontFamily: 'Montserrat_600SemiBold',
    marginBottom: 12,
  },
  citiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  cityChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cityChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  cityChipText: {
    fontSize: 14,
    color: theme.colors.text,
    fontFamily: 'Montserrat_500Medium',
  },
  cityChipTextActive: {
    color: theme.colors.secondary,
    fontFamily: 'Montserrat_600SemiBold',
  },
  submitButton: {
    width: '100%',
    height: 56,
    backgroundColor: theme.colors.primary,
    borderRadius: 28,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  submitButtonDisabled: {
    backgroundColor: theme.colors.disabled,
    elevation: 0,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.secondary,
    fontFamily: 'Montserrat_700Bold',
  },
  infoText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontFamily: 'Montserrat_400Regular',
    textAlign: 'center',
    lineHeight: 18,
  },
});
