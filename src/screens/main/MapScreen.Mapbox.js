import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Dimensions,
  Image,
  Animated,
  StatusBar,
  SafeAreaView,
  Platform,
  ScrollView,
  Linking,
} from 'react-native';
import {
  Text,
  Card,
  FAB,
  Searchbar,
  Chip,
  Surface,
  Badge,
  ActivityIndicator
} from 'react-native-paper';
import Mapbox from '@rnmapbox/maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNearbyTurfs, toggleFavorite, searchTurfs } from '../../store/slices/turfSlice';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../theme/theme';
import SkeletonLoader from '../../components/SkeletonLoader';
import FilterModal from '../../components/FilterModal';

// Initialize Mapbox
Mapbox.setAccessToken('pk.eyJ1IjoiaW11c21hbmtoYW4iLCJhIjoiY2xsdWp0dWxxMW1qczNldGgxbzR6NHY4ZSJ9.9cNv0ZCv2V_5oTEeg82Htg');
Mapbox.setTelemetryEnabled(false);

const { width, height } = Dimensions.get('window');

export default function MapScreen({ navigation }) {
  const [location, setLocation] = useState(null);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(true);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filteredVenues, setFilteredVenues] = useState([]);
  const { filters: reduxFilters } = useSelector(state => state.turf);
  const [isLoading, setIsLoading] = useState(false);
  const [venuesWithValidCoords, setVenuesWithValidCoords] = useState([]);
  const insets = useSafeAreaInsets();

  const cameraRef = useRef(null);
  const mapRef = useRef(null);
  const flatListRef = useRef(null);
  const dispatch = useDispatch();
  const { nearbyTurfs, loading } = useSelector(state => state.turf);
  const themeColors = theme;

  // Animation values
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const cardSlideAnim = useRef(new Animated.Value(300)).current;

  useEffect(() => {
    // Animate header on mount
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Initialize map screen
    const initializeMapScreen = async () => {
      console.log('🚀 MapScreen: Initializing with Mapbox...');

      // Load venues first
      console.log('📍 MapScreen: Loading all venues...');
      try {
        const result = await dispatch(fetchNearbyTurfs({
          latitude: 31.5204, // Lahore
          longitude: 74.3587,
          radius: 50000
        }));
        console.log('✅ MapScreen: Venues loaded successfully:', result);
      } catch (error) {
        console.error('❌ MapScreen: Failed to load venues:', error);
      }

      // Then try to get user location
      try {
        console.log('📍 MapScreen: Requesting location access...');
        await requestLocationAccess();
      } catch (error) {
        console.log('⚠️ MapScreen: Location access denied or failed, continuing without location');
      }
    };

    initializeMapScreen();
  }, []);

  const requestLocationAccess = async () => {
    try {
      console.log('📍 Checking location permissions...');
      setIsGettingLocation(true);

      let { status } = await Location.requestForegroundPermissionsAsync();

      if (status === 'granted') {
        console.log('✅ Location permission granted');
        setHasLocationPermission(true);
        await getCurrentLocation();
      } else {
        console.log('❌ Location permission denied');
        setHasLocationPermission(false);
        setIsGettingLocation(false);

        Alert.alert(
          'Location Access Required',
          'We need your location to show nearby venues and calculate distances. Please enable it in your device settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Open Settings',
              onPress: () => Linking.openSettings()
            }
          ]
        );
      }
    } catch (error) {
      console.error('📍 Location request error:', error);
      setIsGettingLocation(false);
    }
  };

  useEffect(() => {
    if (selectedVenue) {
      Animated.spring(cardSlideAnim, {
        toValue: 0,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(cardSlideAnim, {
        toValue: 300,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [selectedVenue]);

  const getVenueAddress = (venue) => {
    const addressParts = [];
    if (venue.address) addressParts.push(venue.address);
    if (venue.area && venue.area !== venue.address) addressParts.push(venue.area);
    if (venue.city) addressParts.push(venue.city);
    return addressParts.join(', ') || 'Address not available';
  };

  const isValidCoordinate = (lat, lng) => {
    return (
      lat && lng &&
      typeof lat === 'number' && typeof lng === 'number' &&
      lat >= -90 && lat <= 90 &&
      lng >= -180 && lng <= 180 &&
      !(lat === 0 && lng === 0)
    );
  };

  const getVenueCoordinatesSync = (venue) => {
    if (isValidCoordinate(venue.latitude, venue.longitude)) {
      return {
        latitude: venue.latitude,
        longitude: venue.longitude,
        isValid: true,
        source: 'direct'
      };
    }

    if (venue.location && isValidCoordinate(venue.location.latitude, venue.location.longitude)) {
      return {
        latitude: venue.location.latitude,
        longitude: venue.location.longitude,
        isValid: true,
        source: 'location'
      };
    }

    return {
      latitude: null,
      longitude: null,
      isValid: false,
      source: 'none'
    };
  };

  const processVenuesCoordinates = async (venues) => {
    const processedVenues = [];
    const coordinateMap = new Map();

    console.log(`🗺️ Processing coordinates for ${venues.length} venues...`);

    for (let i = 0; i < venues.length; i++) {
      const venue = venues[i];
      const coords = getVenueCoordinatesSync(venue);

      if (coords.isValid) {
        let finalCoords = { ...coords };

        const coordKey = `${coords.latitude.toFixed(4)},${coords.longitude.toFixed(4)}`;
        if (coordinateMap.has(coordKey)) {
          const duplicateCount = coordinateMap.get(coordKey);
          const angle = (duplicateCount * 60) * (Math.PI / 180);
          const offset = 0.002;

          finalCoords = {
            latitude: coords.latitude + (Math.cos(angle) * offset),
            longitude: coords.longitude + (Math.sin(angle) * offset),
            isValid: true,
            source: `${coords.source}-spread-${duplicateCount}`
          };

          coordinateMap.set(coordKey, duplicateCount + 1);
        } else {
          coordinateMap.set(coordKey, 1);
        }

        processedVenues.push({
          ...venue,
          coordinates: finalCoords
        });
      }
    }

    console.log(`📊 Coordinate processing complete: ${processedVenues.length}/${venues.length} venues have valid coordinates`);
    return processedVenues;
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const formatDistance = (distanceKm) => {
    if (distanceKm === null || distanceKm === undefined || isNaN(distanceKm)) return '';
    if (distanceKm < 1) {
      return `${Math.round(distanceKm * 1000)}m`;
    } else if (distanceKm < 10) {
      return `${distanceKm.toFixed(1)}km`;
    } else {
      return `${Math.round(distanceKm)}km`;
    }
  };

  const calculateVenueDistances = (venues, location) => {
    if (!location) {
      return venues.map(venue => ({
        ...venue,
        distance: 'Unknown',
        distanceKm: null
      }));
    }

    return venues.map(venue => {
      const coords = venue.coordinates || getVenueCoordinatesSync(venue);

      if (!coords.isValid) {
        return {
          ...venue,
          distance: 'Unknown',
          distanceKm: null
        };
      }

      const distanceKm = calculateDistance(
        location.latitude,
        location.longitude,
        coords.latitude,
        coords.longitude
      );

      return {
        ...venue,
        distance: formatDistance(distanceKm),
        distanceKm: distanceKm
      };
    });
  };

  useEffect(() => {
    const updateVenuesWithCoordsAndDistances = async () => {
      if (nearbyTurfs.length > 0) {
        const validVenues = await processVenuesCoordinates(nearbyTurfs);
        const venuesWithDistances = calculateVenueDistances(validVenues, location);

        if (location) {
          venuesWithDistances.sort((a, b) => {
            if (a.distanceKm === null) return 1;
            if (b.distanceKm === null) return -1;
            return a.distanceKm - b.distanceKm;
          });
        }

        setVenuesWithValidCoords(venuesWithDistances);
        setFilteredVenues(venuesWithDistances);
      }
    };

    updateVenuesWithCoordsAndDistances();
  }, [nearbyTurfs, location]);

  const filterVenues = () => {
    const hasNoFilters = !searchQuery.trim() &&
      (reduxFilters.sports.includes('All') || reduxFilters.sports.length === 0) &&
      reduxFilters.sortBy === 'All' &&
      reduxFilters.minRating === 0 &&
      reduxFilters.priceRange[0] === 0 &&
      reduxFilters.priceRange[1] === 10000;

    if (hasNoFilters) {
      setFilteredVenues(venuesWithValidCoords);
      return;
    }

    let filtered = venuesWithValidCoords.filter(venue => {
      let matches = true;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const nameMatch = venue.name.toLowerCase().includes(query);
        const addressMatch = getVenueAddress(venue).toLowerCase().includes(query);
        matches = matches && (nameMatch || addressMatch);
      }

      if (!reduxFilters.sports.includes('All') && reduxFilters.sports.length > 0) {
        const venueSports = Array.isArray(venue.sports) ? venue.sports : [];
        matches = matches && venueSports.some(s => reduxFilters.sports.includes(s));
      }

      const venuePrice = venue.pricePerHour || venue.pricing?.basePrice || 0;
      matches = matches && venuePrice >= reduxFilters.priceRange[0] && venuePrice <= reduxFilters.priceRange[1];

      const venueRating = venue.rating || 5;
      matches = matches && venueRating >= reduxFilters.minRating;

      return matches;
    });

    if (reduxFilters.sortBy === 'Popular') {
      filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (reduxFilters.sortBy === 'Near by' && location) {
      filtered.sort((a, b) => {
        if (a.distanceKm === null) return 1;
        if (b.distanceKm === null) return -1;
        return a.distanceKm - b.distanceKm;
      });
    }

    setFilteredVenues(filtered);
  };

  useEffect(() => {
    filterVenues();
  }, [searchQuery, reduxFilters, venuesWithValidCoords]);

  const handleSearchChange = (query) => {
    setSearchQuery(query);
    filterVenues();
  };

  const centerOnUserLocation = () => {
    if (location && cameraRef.current) {
      cameraRef.current.setCamera({
        centerCoordinate: [location.longitude, location.latitude],
        zoomLevel: 13,
        animationDuration: 1000,
      });
    }
  };

  const getCurrentLocation = async () => {
    setIsLoading(true);
    try {
      let currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setLocation(currentLocation.coords);

      if (cameraRef.current) {
        cameraRef.current.setCamera({
          centerCoordinate: [currentLocation.coords.longitude, currentLocation.coords.latitude],
          zoomLevel: 13,
          animationDuration: 1500,
        });
      }

      dispatch(fetchNearbyTurfs({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        radius: 10000
      }));

    } catch (error) {
      Alert.alert('Location Error', 'Unable to get your current location. Please try again.');
      console.error('❌ Location error:', error);
    } finally {
      setIsLoading(false);
      setIsGettingLocation(false);
    }
  };

  const handleMarkerPress = (venue) => {
    setSelectedVenue(venue);
  };

  const handleVenueCardPress = (venue) => {
    navigation.navigate('TurfDetail', { turf: venue });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <Animated.View
        style={[
          styles.header,
          {
            paddingTop: insets.top,
            transform: [{ translateY: slideAnim }],
            opacity: fadeAnim,
          },
        ]}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Map View</Text>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowFilters(true)}
          >
            <MaterialIcons name="tune" size={24} color={themeColors.colors.primary} />
          </TouchableOpacity>
        </View>

        <Searchbar
          placeholder="Search venues..."
          onChangeText={handleSearchChange}
          value={searchQuery}
          style={styles.searchBar}
          iconColor={themeColors.colors.primary}
        />
      </Animated.View>

      {/* Mapbox Map */}
      <Mapbox.MapView
        ref={mapRef}
        style={styles.map}
        styleURL={Mapbox.StyleURL.Street}
        logoEnabled={false}
        attributionEnabled={false}
      >
        <Mapbox.Camera
          ref={cameraRef}
          zoomLevel={12}
          centerCoordinate={[74.3587, 31.5204]} // Lahore [longitude, latitude]
          animationMode="flyTo"
          animationDuration={1000}
        />

        {/* User Location */}
        {location && (
          <Mapbox.PointAnnotation
            id="userLocation"
            coordinate={[location.longitude, location.latitude]}
          >
            <View style={styles.userLocationMarker}>
              <View style={styles.userLocationDot} />
            </View>
          </Mapbox.PointAnnotation>
        )}

        {/* Venue Markers */}
        {filteredVenues.map((venue) => {
          const coords = venue.coordinates || getVenueCoordinatesSync(venue);
          if (!coords.isValid) return null;

          return (
            <Mapbox.PointAnnotation
              key={venue.id}
              id={`venue-${venue.id}`}
              coordinate={[coords.longitude, coords.latitude]}
              onSelected={() => handleMarkerPress(venue)}
            >
              <View style={[
                styles.markerContainer,
                selectedVenue?.id === venue.id && styles.markerContainerSelected
              ]}>
                <MaterialIcons
                  name="sports-soccer"
                  size={24}
                  color={selectedVenue?.id === venue.id ? themeColors.colors.secondary : themeColors.colors.primary}
                />
              </View>
            </Mapbox.PointAnnotation>
          );
        })}
      </Mapbox.MapView>

      {/* FAB - Center on User Location */}
      {hasLocationPermission && location && (
        <FAB
          icon="my-location"
          style={[styles.fab, { bottom: selectedVenue ? 280 : 100 }]}
          onPress={centerOnUserLocation}
          color="#FFFFFF"
        />
      )}

      {/* Selected Venue Card */}
      {selectedVenue && (
        <Animated.View
          style={[
            styles.venueCard,
            {
              transform: [{ translateY: cardSlideAnim }],
            },
          ]}
        >
          <Card style={styles.card}>
            <TouchableOpacity onPress={() => handleVenueCardPress(selectedVenue)}>
              <Card.Cover
                source={{ uri: selectedVenue.images?.[0] || 'https://via.placeholder.com/400x200' }}
                style={styles.cardImage}
              />
              <Card.Content style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <Text style={styles.venueName}>{selectedVenue.name}</Text>
                  <TouchableOpacity onPress={() => setSelectedVenue(null)}>
                    <MaterialIcons name="close" size={24} color="#666" />
                  </TouchableOpacity>
                </View>

                <View style={styles.venueInfo}>
                  <MaterialIcons name="location-on" size={16} color="#666" />
                  <Text style={styles.venueAddress} numberOfLines={1}>
                    {getVenueAddress(selectedVenue)}
                  </Text>
                </View>

                {selectedVenue.distance && (
                  <View style={styles.venueInfo}>
                    <MaterialIcons name="directions" size={16} color="#666" />
                    <Text style={styles.venueDistance}>{selectedVenue.distance} away</Text>
                  </View>
                )}

                <View style={styles.venueFooter}>
                  <View style={styles.rating}>
                    <MaterialIcons name="star" size={16} color="#FFD700" />
                    <Text style={styles.ratingText}>{selectedVenue.rating || 5.0}</Text>
                  </View>
                  <Text style={styles.price}>Rs. {selectedVenue.pricePerHour || selectedVenue.pricing?.basePrice || 0}/hr</Text>
                </View>
              </Card.Content>
            </TouchableOpacity>
          </Card>
        </Animated.View>
      )}

      {/* Filter Modal */}
      <FilterModal
        visible={showFilters}
        onDismiss={() => setShowFilters(false)}
      />

      {/* Loading Indicator */}
      {(loading || isLoading) && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={themeColors.colors.primary} />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    zIndex: 10,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  filterButton: {
    padding: 8,
  },
  searchBar: {
    elevation: 0,
    backgroundColor: '#F5F5F5',
  },
  map: {
    flex: 1,
  },
  userLocationMarker: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userLocationDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: theme.colors.primary,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  markerContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  markerContainerSelected: {
    borderColor: theme.colors.secondary,
    backgroundColor: '#FFF8E1',
  },
  fab: {
    position: 'absolute',
    right: 16,
    backgroundColor: theme.colors.primary,
  },
  venueCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  card: {
    elevation: 8,
  },
  cardImage: {
    height: 150,
  },
  cardContent: {
    padding: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  venueName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.primary,
    flex: 1,
  },
  venueInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  venueAddress: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
    flex: 1,
  },
  venueDistance: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  venueFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.secondary,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
