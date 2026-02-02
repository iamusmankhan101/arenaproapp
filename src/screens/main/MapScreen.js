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
  Platform
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
import MapView, { Marker, PROVIDER_GOOGLE, Circle } from 'react-native-maps';
import * as Location from 'expo-location';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNearbyTurfs } from '../../store/slices/turfSlice';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../theme/theme';
import SkeletonLoader from '../../components/SkeletonLoader';

const { width, height } = Dimensions.get('window');

// Custom map style for better branding
const customMapStyle = [
  {
    featureType: 'poi',
    elementType: 'labels',
    stylers: [{ visibility: 'off' }]
  },
  {
    featureType: 'transit',
    elementType: 'labels',
    stylers: [{ visibility: 'off' }]
  }
];

export default function MapScreen({ navigation }) {
  const [location, setLocation] = useState(null);
  const [region, setRegion] = useState({
    latitude: 31.5204, // Lahore coordinates where venues are located
    longitude: 74.3587,
    latitudeDelta: 0.05, // Smaller delta for closer zoom
    longitudeDelta: 0.05,
  });
  const [initialRegion, setInitialRegion] = useState({
    latitude: 31.5204, // Lahore coordinates where venues are located
    longitude: 74.3587,
    latitudeDelta: 0.05, // Smaller delta for closer zoom
    longitudeDelta: 0.05,
  });
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSport, setSelectedSport] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const [filteredVenues, setFilteredVenues] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mapType, setMapType] = useState('standard');
  const [showRadius, setShowRadius] = useState(false);
  const [geocodedCoordinates, setGeocodedCoordinates] = useState(new Map());
  const [isMapReady, setIsMapReady] = useState(false);
  const [venuesWithValidCoords, setVenuesWithValidCoords] = useState([]);
  
  const mapRef = useRef(null);
  const dispatch = useDispatch();
  const { nearbyTurfs, loading } = useSelector(state => state.turf);
  const themeColors = theme;



  // Animation values
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const cardSlideAnim = useRef(new Animated.Value(300)).current;

  const sportFilters = ['All', 'Football', 'Cricket', 'Padel', 'Tennis', 'Basketball'];
  const mapTypes = [
    { key: 'standard', label: 'Standard', icon: 'map' },
    { key: 'satellite', label: 'Satellite', icon: 'satellite' },
    { key: 'hybrid', label: 'Hybrid', icon: 'layers' }
  ];

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

    // Proactively request location and load venues
    const initializeMapScreen = async () => {
      console.log('🚀 MapScreen: Initializing...');
      
      // Always load venues first (regardless of location)
      console.log('📍 MapScreen: Loading all venues...');
      try {
        const result = await dispatch(fetchNearbyTurfs({
          latitude: region.latitude,
          longitude: region.longitude,
          radius: 50000 // Large radius to get all venues
        }));
        console.log('✅ MapScreen: Venues loaded successfully:', result);
      } catch (error) {
        console.error('❌ MapScreen: Failed to load venues:', error);
      }
      
      // Then try to get user location for distance calculations
      try {
        console.log('📍 MapScreen: Requesting location access...');
        await requestLocationAccess();
      } catch (error) {
        console.log('⚠️ MapScreen: Location access denied or failed, continuing without location');
        // App continues to work without location
      }
    };

    initializeMapScreen();
  }, []);

  // Enhanced location access request function
  const requestLocationAccess = async () => {
    try {
      console.log('📍 Checking location permissions...');
      
      // Request permission first
      let { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status === 'granted') {
        console.log('✅ Location permission granted');
        await getCurrentLocation();
      } else {
        console.log('❌ Location permission denied');
        // Show user-friendly message but don't block the app
        Alert.alert(
          'Location Access',
          'Location access will help us show nearby venues and calculate distances. You can still browse all venues without it.',
          [
            { text: 'Maybe Later', style: 'cancel' },
            { 
              text: 'Enable Location', 
              onPress: async () => {
                const { status: newStatus } = await Location.requestForegroundPermissionsAsync();
                if (newStatus === 'granted') {
                  await getCurrentLocation();
                }
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error('📍 Location request error:', error);
      // Continue without location
    }
  };

  useEffect(() => {
    // Update filtered venues when nearbyTurfs changes
    console.log('🔄 MapScreen: nearbyTurfs updated, count:', nearbyTurfs.length);
    if (nearbyTurfs.length > 0) {
      console.log('📊 MapScreen: Sample venues:', nearbyTurfs.slice(0, 2).map(v => ({ name: v.name, id: v.id })));
      
      // Auto-zoom to fit venues after a short delay
      setTimeout(() => {
        if (mapRef.current && isMapReady) {
          console.log('🔍 MapScreen: Auto-zooming to fit venues');
          zoomToFitMarkers(nearbyTurfs);
        }
      }, 1000);
    }
    setFilteredVenues(nearbyTurfs);
  }, [nearbyTurfs]);

  useEffect(() => {
    filterVenues();
  }, [searchQuery, selectedSport, venuesWithValidCoords]);

  useEffect(() => {
    // Animate venue card
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

  // Helper function to get full address from venue data
  const getVenueAddress = (venue) => {
    const addressParts = [];
    if (venue.address) addressParts.push(venue.address);
    if (venue.area && venue.area !== venue.address) addressParts.push(venue.area);
    if (venue.city) addressParts.push(venue.city);
    return addressParts.join(', ') || 'Address not available';
  };

  // Enhanced coordinate validation and processing with priority system
  const isValidCoordinate = (lat, lng) => {
    return (
      lat && lng &&
      typeof lat === 'number' && typeof lng === 'number' &&
      lat >= -90 && lat <= 90 &&
      lng >= -180 && lng <= 180 &&
      !(lat === 0 && lng === 0) // Exclude null island
    );
  };

  // Enhanced function to get venue coordinates with priority system
  const getVenueCoordinatesSync = (venue) => {
    // Priority 1: Check direct coordinates (latitude/longitude fields)
    if (isValidCoordinate(venue.latitude, venue.longitude)) {
      console.log(`📍 Using direct coordinates for ${venue.name}: ${venue.latitude}, ${venue.longitude}`);
      return {
        latitude: venue.latitude,
        longitude: venue.longitude,
        isValid: true,
        source: 'direct'
      };
    }
    
    // Priority 2: Check location object coordinates
    if (venue.location && isValidCoordinate(venue.location.latitude, venue.location.longitude)) {
      console.log(`📍 Using location object coordinates for ${venue.name}: ${venue.location.latitude}, ${venue.location.longitude}`);
      return {
        latitude: venue.location.latitude,
        longitude: venue.location.longitude,
        isValid: true,
        source: 'location'
      };
    }

    // Priority 3: Log venues without valid coordinates for debugging
    console.warn(`⚠️ No valid coordinates found for venue ${venue.name}:`, {
      directLat: venue.latitude,
      directLng: venue.longitude,
      locationLat: venue.location?.latitude,
      locationLng: venue.location?.longitude,
      address: getVenueAddress(venue)
    });

    // Return invalid coordinates - this venue won't be shown on map
    return {
      latitude: null,
      longitude: null,
      isValid: false,
      source: 'none'
    };
  };

  // Enhanced function to get venue coordinates (async version for processing)
  const getVenueCoordinates = async (venue) => {
    return getVenueCoordinatesSync(venue);
  };

  // Enhanced venue coordinate processing with detailed logging and coordinate spreading
  const processVenuesCoordinates = async (venues) => {
    const processedVenues = [];
    const invalidVenues = [];
    const coordinateMap = new Map(); // Track duplicate coordinates
    
    console.log(`🗺️ Processing coordinates for ${venues.length} venues...`);
    
    for (let i = 0; i < venues.length; i++) {
      const venue = venues[i];
      const coords = getVenueCoordinatesSync(venue);
      
      if (coords.isValid) {
        let finalCoords = { ...coords };
        
        // Check for duplicate coordinates and spread them out slightly
        const coordKey = `${coords.latitude.toFixed(4)},${coords.longitude.toFixed(4)}`;
        if (coordinateMap.has(coordKey)) {
          const duplicateCount = coordinateMap.get(coordKey);
          // Spread duplicates in a small circle around the original point
          const angle = (duplicateCount * 60) * (Math.PI / 180); // 60 degrees apart
          const offset = 0.002; // Small offset (~200m)
          
          finalCoords = {
            latitude: coords.latitude + (Math.cos(angle) * offset),
            longitude: coords.longitude + (Math.sin(angle) * offset),
            isValid: true,
            source: `${coords.source}-spread-${duplicateCount}`
          };
          
          coordinateMap.set(coordKey, duplicateCount + 1);
          console.log(`📍 Spread venue "${venue.name}" to avoid overlap: ${finalCoords.latitude}, ${finalCoords.longitude}`);
        } else {
          coordinateMap.set(coordKey, 1);
        }
        
        processedVenues.push({
          ...venue,
          coordinates: finalCoords
        });
        console.log(`✅ ${venue.name}: Valid coordinates (${finalCoords.source}) - ${finalCoords.latitude}, ${finalCoords.longitude}`);
      } else {
        invalidVenues.push({
          name: venue.name,
          address: getVenueAddress(venue),
          directCoords: { lat: venue.latitude, lng: venue.longitude },
          locationCoords: { lat: venue.location?.latitude, lng: venue.location?.longitude }
        });
        console.warn(`❌ ${venue.name}: Invalid coordinates - will not appear on map`);
      }
    }
    
    console.log(`📊 Coordinate processing complete: ${processedVenues.length}/${venues.length} venues have valid coordinates`);
    
    if (invalidVenues.length > 0) {
      console.warn(`⚠️ ${invalidVenues.length} venues without valid coordinates:`, invalidVenues);
    }
    
    return processedVenues;
  };

  // Enhanced distance calculation function using Haversine formula
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in kilometers
  };

  // Format distance for display
  const formatDistance = (distanceKm) => {
    if (distanceKm < 1) {
      return `${Math.round(distanceKm * 1000)}m`;
    } else if (distanceKm < 10) {
      return `${distanceKm.toFixed(1)}km`;
    } else {
      return `${Math.round(distanceKm)}km`;
    }
  };

  // Calculate distances from user location to venues
  const calculateVenueDistances = (venues, userLocation) => {
    if (!userLocation) {
      console.log('📍 No user location available, using default distances');
      return venues.map(venue => ({
        ...venue,
        distance: 'Unknown',
        distanceKm: null
      }));
    }

    console.log(`📏 Calculating distances from user location: ${userLocation.latitude}, ${userLocation.longitude}`);
    
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
        userLocation.latitude,
        userLocation.longitude,
        coords.latitude,
        coords.longitude
      );

      const formattedDistance = formatDistance(distanceKm);
      
      console.log(`📏 ${venue.name}: ${formattedDistance} away`);
      
      return {
        ...venue,
        distance: formattedDistance,
        distanceKm: distanceKm
      };
    });
  };

  // Update venues with valid coordinates and distances when nearbyTurfs or location changes
  useEffect(() => {
    const updateVenuesWithCoordsAndDistances = async () => {
      console.log('🔄 MapScreen: Processing venues with coordinates and distances...');
      console.log('📊 MapScreen: nearbyTurfs count:', nearbyTurfs.length);
      
      if (nearbyTurfs.length > 0) {
        console.log('🔄 Processing venues with coordinates and distances...');
        
        // First, process coordinates
        const validVenues = await processVenuesCoordinates(nearbyTurfs);
        console.log('✅ MapScreen: Valid venues after coordinate processing:', validVenues.length);
        
        // If no venues have valid coordinates, show all venues with default coordinates
        if (validVenues.length === 0) {
          console.warn('⚠️ MapScreen: No venues with valid coordinates found, showing all venues with default locations');
          const venuesWithDefaults = nearbyTurfs.map((venue, index) => ({
            ...venue,
            coordinates: {
              latitude: 31.5204 + (index * 0.01), // Spread venues around Lahore
              longitude: 74.3587 + (index * 0.01),
              isValid: true,
              source: 'default'
            }
          }));
          setVenuesWithValidCoords(venuesWithDefaults);
          setFilteredVenues(venuesWithDefaults);
          console.log(`✅ MapScreen: Showing ${venuesWithDefaults.length} venues with default coordinates`);
          return;
        }
        
        // Then, calculate distances from user location
        const venuesWithDistances = calculateVenueDistances(validVenues, location);
        
        // Sort by distance if user location is available
        if (location) {
          venuesWithDistances.sort((a, b) => {
            if (a.distanceKm === null) return 1;
            if (b.distanceKm === null) return -1;
            return a.distanceKm - b.distanceKm;
          });
          console.log('📊 MapScreen: Venues sorted by distance from user location');
        }
        
        setVenuesWithValidCoords(venuesWithDistances);
        setFilteredVenues(venuesWithDistances);
        
        console.log(`✅ MapScreen: Updated ${venuesWithDistances.length} venues with coordinates and distances`);
      } else {
        console.log('⚠️ MapScreen: No venues found in nearbyTurfs array');
        // Force a reload if no venues are found
        console.log('🔄 MapScreen: Attempting to reload venues...');
        dispatch(fetchNearbyTurfs({
          latitude: region.latitude,
          longitude: region.longitude,
          radius: 50000
        }));
      }
    };
    
    updateVenuesWithCoordsAndDistances();
  }, [nearbyTurfs, location]);
  const filterVenues = () => {
    if (!searchQuery.trim() && selectedSport === 'All') {
      setFilteredVenues(venuesWithValidCoords);
      return;
    }

    let filtered = venuesWithValidCoords.filter(venue => {
      let matches = true;

      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const nameMatch = venue.name.toLowerCase().includes(query);
        const addressMatch = getVenueAddress(venue).toLowerCase().includes(query);
        const areaMatch = venue.area && venue.area.toLowerCase().includes(query);
        const cityMatch = venue.city && venue.city.toLowerCase().includes(query);
        const sportsMatch = venue.sports && venue.sports.some(sport => 
          sport.toLowerCase().includes(query)
        );
        matches = matches && (nameMatch || addressMatch || areaMatch || cityMatch || sportsMatch);
      }

      // Sport filter
      if (selectedSport !== 'All') {
        matches = matches && venue.sports && venue.sports.includes(selectedSport);
      }

      return matches;
    });

    setFilteredVenues(filtered);

    // Zoom to fit filtered venues if they're different from all venues
    if (filtered.length > 0 && filtered.length < venuesWithValidCoords.length) {
      setTimeout(() => zoomToFitMarkers(filtered), 500);
    }
  };

  const handleSearchChange = (query) => {
    setSearchQuery(query);
    
    // If the query looks like a location (contains common location words), 
    // try to search by location after a delay
    if (query.trim() && (
      query.toLowerCase().includes('area') || 
      query.toLowerCase().includes('sector') ||
      query.toLowerCase().includes('town') ||
      query.toLowerCase().includes('city') ||
      query.length > 10 // Longer queries might be addresses
    )) {
      // Debounce location search
      setTimeout(() => {
        searchByLocation(query);
      }, 1000);
    }
    
    // Always do immediate local filtering
    filterVenues();
  };

  const searchByLocation = async (locationQuery) => {
    try {
      setIsLoading(true);
      
      // Try to geocode the search query to get coordinates
      const geocodeResult = await Location.geocodeAsync(locationQuery);
      
      if (geocodeResult && geocodeResult.length > 0) {
        const { latitude, longitude } = geocodeResult[0];
        
        // Update map region to show the searched location
        const newRegion = {
          latitude,
          longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        };

        if (mapRef.current && isMapReady) {
          mapRef.current.animateToRegion(newRegion, 1000);
        }

        // Fetch venues near the searched location
        dispatch(fetchNearbyTurfs({
          latitude,
          longitude,
          radius: 10000 // 10km radius
        }));
      }
    } catch (error) {
      console.log('Location search failed:', error);
      // If geocoding fails, continue with local search only
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
    // Add haptic feedback if available
    if (Platform.OS === 'ios') {
      // Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const toggleMapType = () => {
    const currentIndex = mapTypes.findIndex(type => type.key === mapType);
    const nextIndex = (currentIndex + 1) % mapTypes.length;
    setMapType(mapTypes[nextIndex].key);
  };

  const getCurrentLocation = async () => {
    setIsLoading(true);
    try {
      console.log('📍 Requesting location permissions...');
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Location Permission Required',
          'Please enable location access to find nearby venues and get accurate distances.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Settings', onPress: () => Location.requestForegroundPermissionsAsync() }
          ]
        );
        setIsLoading(false);
        return;
      }

      console.log('📍 Getting current location...');
      let currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      
      const newRegion = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };
      
      console.log(`📍 User location obtained: ${currentLocation.coords.latitude}, ${currentLocation.coords.longitude}`);
      
      setLocation(currentLocation.coords);
      setInitialRegion(newRegion);
      
      // Animate to user location with smooth transition
      if (mapRef.current && isMapReady) {
        mapRef.current.animateToRegion(newRegion, 1500);
      }
      
      // Fetch nearby venues based on current location
      dispatch(fetchNearbyTurfs({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        radius: 10000 // 10km radius
      }));
      
      console.log('✅ Location updated successfully, distances will be recalculated');
      
    } catch (error) {
      Alert.alert('Location Error', 'Unable to get your current location. Please try again.');
      console.error('❌ Location error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegionChangeComplete = (newRegion) => {
    // Only update region state, don't trigger re-renders
    setRegion(newRegion);
  };

  const handleMapReady = () => {
    setIsMapReady(true);
  };

  const handleMarkerPress = (venue) => {
    setSelectedVenue(venue);
    // Center map on selected venue with smooth animation
    if (mapRef.current && isMapReady) {
      const coordinates = venue.coordinates || getVenueCoordinatesSync(venue);
      if (coordinates.isValid) {
        mapRef.current.animateToRegion({
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
          latitudeDelta: 0.008,
          longitudeDelta: 0.008,
        }, 1200);
      }
    }
  };

  // Enhanced debug function to log venues with missing coordinates
  const logVenuesWithMissingCoords = () => {
    const missingCoords = nearbyTurfs.filter(venue => {
      const coords = getVenueCoordinatesSync(venue);
      return !coords.isValid;
    });
    
    if (missingCoords.length > 0) {
      console.group('🗺️ Venues with missing/invalid coordinates:');
      missingCoords.forEach(venue => {
        console.log(`❌ ${venue.name}:`, {
          id: venue.id,
          address: getVenueAddress(venue),
          directCoordinates: {
            latitude: venue.latitude,
            longitude: venue.longitude,
            valid: isValidCoordinate(venue.latitude, venue.longitude)
          },
          locationObject: {
            latitude: venue.location?.latitude,
            longitude: venue.location?.longitude,
            valid: venue.location ? isValidCoordinate(venue.location.latitude, venue.location.longitude) : false
          },
          recommendation: venue.latitude && venue.longitude ? 
            'Direct coordinates exist but may be invalid' : 
            'No coordinates found - needs geocoding'
        });
      });
      console.groupEnd();
      
      // Provide actionable recommendations
      console.log(`💡 Recommendations for ${missingCoords.length} venues without coordinates:`);
      console.log('1. Update venue coordinates in Firebase admin panel');
      console.log('2. Use geocoding service to convert addresses to coordinates');
      console.log('3. Verify coordinate accuracy for existing venues');
    } else {
      console.log('✅ All venues have valid coordinates!');
    }
  };

  // Call debug function when venues change (only in development)
  useEffect(() => {
    if (__DEV__ && nearbyTurfs.length > 0) {
      logVenuesWithMissingCoords();
    }
  }, [nearbyTurfs]);

  const handleVenueSelect = (venue) => {
    navigation.navigate('TurfDetail', { turfId: venue.id });
  };

  const zoomToFitMarkers = (venues = filteredVenues) => {
    if (mapRef.current && venues.length > 0 && isMapReady) {
      const coordinates = venues
        .map(venue => {
          const coords = venue.coordinates || getVenueCoordinatesSync(venue);
          return coords.isValid ? {
            latitude: coords.latitude,
            longitude: coords.longitude
          } : null;
        })
        .filter(coord => coord !== null); // Remove invalid coordinates

      if (coordinates.length > 0) {
        mapRef.current.fitToCoordinates(coordinates, {
          edgePadding: { top: 200, right: 50, bottom: 200, left: 50 },
          animated: true,
        });
      }
    }
  };

  const getMarkerColor = (venue) => {
    if (!venue.openNow) return '#9E9E9E'; // Gray for closed
    if (venue.availableSlots > 5) return '#4CAF50'; // Green for high availability
    if (venue.availableSlots > 2) return '#FF9800'; // Orange for moderate
    if (venue.availableSlots > 0) return '#F44336'; // Red for limited
    return '#9E9E9E'; // Gray for no slots
  };

  const getAvailabilityText = (venue) => {
    if (!venue.openNow) return 'Closed';
    if (venue.availableSlots === 0) return 'Fully Booked';
    if (venue.availableSlots === 1) return '1 slot available';
    return `${venue.availableSlots} slots available`;
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={themeColors.colors.primary} barStyle="light-content" />
      
      {/* Enhanced Header with Animation */}
      <Animated.View 
        style={[
          styles.headerContainer,
          {
            transform: [{ translateY: slideAnim }],
            opacity: fadeAnim,
          }
        ]}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.headerContent}>
            <View style={styles.searchContainer}>
              <Searchbar
                placeholder="Search venues, sports, or areas..."
                onChangeText={handleSearchChange}
                value={searchQuery}
                style={styles.searchBar}
                inputStyle={styles.searchInput}
                iconColor={themeColors.colors.primary}
                placeholderTextColor="#999"
                elevation={2}
              />
              
              <TouchableOpacity 
                style={[styles.actionButton, styles.filterButton]}
                onPress={toggleFilters}
              >
                <MaterialIcons 
                  name="tune" 
                  size={22} 
                  color={showFilters ? themeColors.colors.primary : '#666'} 
                />
                {filteredVenues.length !== nearbyTurfs.length && (
                  <Badge size={8} style={styles.filterBadge} />
                )}
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.actionButton, styles.mapTypeButton]}
                onPress={toggleMapType}
              >
                <MaterialIcons 
                  name={mapTypes.find(type => type.key === mapType)?.icon || 'map'} 
                  size={22} 
                  color="#666" 
                />
              </TouchableOpacity>
            </View>

            {/* Enhanced Results Counter with Debug Info */}
            <View style={styles.resultsContainer}>
              <Text style={styles.resultsText}>
                {filteredVenues.length} venue{filteredVenues.length !== 1 ? 's' : ''} found
                {venuesWithValidCoords.length !== nearbyTurfs.length && (
                  <Text style={styles.hiddenVenuesText}>
                    {' '}({nearbyTurfs.length - venuesWithValidCoords.length} hidden - missing coordinates)
                  </Text>
                )}
              </Text>
              <View style={styles.resultsActions}>
                {loading && (
                  <ActivityIndicator 
                    size="small" 
                    color={themeColors.colors.primary} 
                    style={styles.loadingIndicator}
                  />
                )}
                <TouchableOpacity 
                  style={styles.debugButton}
                  onPress={() => {
                    console.log('🔍 MapScreen DEBUG INFO:');
                    console.log('nearbyTurfs:', nearbyTurfs.length);
                    console.log('venuesWithValidCoords:', venuesWithValidCoords.length);
                    console.log('filteredVenues:', filteredVenues.length);
                    console.log('location:', location);
                    console.log('loading:', loading);
                    console.log('isMapReady:', isMapReady);
                    console.log('Sample venues:', nearbyTurfs.slice(0, 2));
                    
                    // Force reload venues
                    console.log('🔄 Force reloading venues...');
                    dispatch(fetchNearbyTurfs({
                      latitude: region.latitude,
                      longitude: region.longitude,
                      radius: 50000
                    }));
                    
                    Alert.alert('Debug Info', 
                      `Total: ${nearbyTurfs.length} venues\n` +
                      `Valid: ${venuesWithValidCoords.length} venues\n` +
                      `Filtered: ${filteredVenues.length} venues\n` +
                      `Location: ${location ? 'Yes' : 'No'}\n` +
                      `Loading: ${loading ? 'Yes' : 'No'}\n` +
                      `Map Ready: ${isMapReady ? 'Yes' : 'No'}\n\n` +
                      `Check console for detailed logs.`
                    );
                  }}
                >
                  <MaterialIcons name="bug-report" size={16} color="#666" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </Animated.View>

      {/* Enhanced Sport Filters */}
      {showFilters && (
        <Animated.View 
          style={[
            styles.filtersContainer,
            {
              opacity: fadeAnim,
            }
          ]}
        >
          <Surface style={styles.filtersSurface} elevation={2}>
            <Text style={styles.filterTitle}>Filter by Sport</Text>
            <View style={styles.chipContainer}>
              {sportFilters.map((sport) => (
                <Chip
                  key={sport}
                  selected={selectedSport === sport}
                  onPress={() => setSelectedSport(sport)}
                  style={[
                    styles.sportChip,
                    selectedSport === sport && { 
                      backgroundColor: themeColors.colors.primary,
                      borderColor: themeColors.colors.primary,
                    }
                  ]}
                  textStyle={[
                    styles.chipText,
                    selectedSport === sport && styles.selectedChipText
                  ]}
                  mode={selectedSport === sport ? 'flat' : 'outlined'}
                >
                  {sport}
                </Chip>
              ))}
            </View>
            
            <View style={styles.filterActions}>
              <TouchableOpacity 
                style={styles.toggleRadiusButton}
                onPress={() => setShowRadius(!showRadius)}
              >
                <MaterialIcons 
                  name={showRadius ? 'visibility-off' : 'visibility'} 
                  size={18} 
                  color={themeColors.colors.primary} 
                />
                <Text style={styles.toggleRadiusText}>
                  {showRadius ? 'Hide' : 'Show'} Search Radius
                </Text>
              </TouchableOpacity>
              
              {location && (
                <TouchableOpacity 
                  style={styles.sortByDistanceButton}
                  onPress={() => {
                    const sorted = [...filteredVenues].sort((a, b) => {
                      if (a.distanceKm === null) return 1;
                      if (b.distanceKm === null) return -1;
                      return a.distanceKm - b.distanceKm;
                    });
                    setFilteredVenues(sorted);
                    console.log('📊 Venues sorted by distance');
                  }}
                >
                  <MaterialIcons 
                    name="sort" 
                    size={18} 
                    color={themeColors.colors.primary} 
                  />
                  <Text style={styles.sortByDistanceText}>
                    Sort by Distance
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </Surface>
        </Animated.View>
      )}

      {/* Enhanced Map */}
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={initialRegion}
        onRegionChangeComplete={handleRegionChangeComplete}
        onMapReady={handleMapReady}
        showsUserLocation={true}
        showsMyLocationButton={false}
        mapType={mapType}
        showsCompass={true}
        showsScale={true}
        loadingEnabled={true}
        loadingIndicatorColor={themeColors.colors.primary}
        customMapStyle={mapType === 'standard' ? customMapStyle : undefined}
        moveOnMarkerPress={false}
        showsPointsOfInterest={false}
      >
        {/* Search Radius Circle */}
        {showRadius && location && (
          <Circle
            center={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
            radius={10000} // 10km
            strokeColor={themeColors.colors.primary}
            strokeWidth={2}
            fillColor={`${themeColors.colors.primary}20`}
          />
        )}

        {/* Enhanced Markers - STABLE VERSION */}
        {filteredVenues.length > 0 ? (
          filteredVenues.map((venue, index) => {
            const coordinates = venue.coordinates || getVenueCoordinatesSync(venue);
            
            // Only render markers for venues with valid coordinates
            if (!coordinates.isValid) {
              console.warn(`⚠️ MapScreen: Skipping venue ${venue.name} - invalid coordinates`);
              return null;
            }

            // Ensure coordinates are numbers
            const lat = Number(coordinates.latitude);
            const lng = Number(coordinates.longitude);
            
            if (isNaN(lat) || isNaN(lng)) {
              console.warn(`⚠️ MapScreen: Invalid coordinate numbers for ${venue.name}: ${lat}, ${lng}`);
              return null;
            }

            console.log(`📍 MapScreen: Rendering marker ${index + 1} for ${venue.name} at ${lat}, ${lng}`);

            return (
              <Marker
                key={`venue-${venue.id}-${index}`} // Stable unique key
                coordinate={{
                  latitude: lat,
                  longitude: lng
                }}
                onPress={() => handleMarkerPress(venue)}
                title={venue.name}
                description={`${venue.sports?.join(', ') || 'Sports'} - PKR ${venue.pricePerHour || venue.basePrice || 'N/A'}/hr`}
              >
                {/* Simplified, stable marker design */}
                <View style={[
                  styles.customMarker,
                  { 
                    backgroundColor: '#FF4444', // Bright red for visibility
                    borderColor: selectedVenue?.id === venue.id ? '#FFD700' : 'white',
                    borderWidth: selectedVenue?.id === venue.id ? 3 : 2,
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                  }
                ]}>
                  <MaterialIcons 
                    name="place" 
                    size={20} 
                    color="white" 
                  />
                  {/* Venue number for debugging */}
                  <View style={[styles.slotsBadge, { 
                    backgroundColor: '#000',
                    top: -6,
                    right: -6,
                    minWidth: 18,
                    height: 18,
                    borderRadius: 9
                  }]}>
                    <Text style={[styles.slotsBadgeText, { fontSize: 10 }]}>{index + 1}</Text>
                  </View>
                </View>
              </Marker>
            );
          })
        ) : (
          // Show a message when no venues are found
          console.log('⚠️ MapScreen: No venues to display on map')
        )}
      </MapView>

      {/* Enhanced Selected Venue Card with Image */}
      {loading && !selectedVenue ? (
        <Animated.View
          style={[
            styles.venueCardContainer,
            { transform: [{ translateY: cardSlideAnim }] }
          ]}
        >
          <Surface style={styles.venueCard} elevation={8}>
            <View style={styles.venueImageContainer}>
              <SkeletonLoader width="100%" height={120} borderRadius={0} />
            </View>
            <View style={styles.venueContent}>
              <View style={styles.venueHeader}>
                <SkeletonLoader width="70%" height={18} borderRadius={4} />
                <SkeletonLoader width={50} height={16} borderRadius={8} />
              </View>
              <SkeletonLoader width="90%" height={14} borderRadius={4} style={{ marginVertical: 8 }} />
              <View style={styles.venueDetails}>
                <SkeletonLoader width="40%" height={12} borderRadius={4} />
                <SkeletonLoader width="30%" height={12} borderRadius={4} />
              </View>
              <View style={styles.venueAvailabilityContainer}>
                <SkeletonLoader width="50%" height={14} borderRadius={4} />
                <SkeletonLoader width="60%" height={12} borderRadius={4} />
              </View>
              <View style={styles.sportsContainer}>
                <SkeletonLoader width={60} height={20} borderRadius={10} style={{ marginRight: 8 }} />
                <SkeletonLoader width={50} height={20} borderRadius={10} style={{ marginRight: 8 }} />
                <SkeletonLoader width={40} height={20} borderRadius={10} />
              </View>
            </View>
            <SkeletonLoader width="100%" height={40} borderRadius={20} style={{ margin: 16 }} />
          </Surface>
        </Animated.View>
      ) : selectedVenue && (
        <Animated.View
          style={[
            styles.venueCardContainer,
            {
              transform: [{ translateY: cardSlideAnim }],
            }
          ]}
        >
          <Surface style={styles.venueCard} elevation={8}>
            <TouchableOpacity 
              onPress={() => handleVenueSelect(selectedVenue)}
              activeOpacity={0.9}
            >
              <View style={styles.venueCardContent}>
                {/* Venue Image */}
                <View style={styles.venueImageContainer}>
                  <Image 
                    source={
                      selectedVenue.images && selectedVenue.images.length > 0 
                        ? { uri: selectedVenue.images[0] }
                        : selectedVenue.image 
                        ? { uri: selectedVenue.image }
                        : require('../../images/indoor-football-court-turf.jpeg') // Default image
                    }
                    style={styles.venueImage} 
                    defaultSource={require('../../images/indoor-football-court-turf.jpeg')}
                  />
                  
                  {/* Status Badge */}
                  <View style={[
                    styles.statusBadge,
                    { 
                      backgroundColor: selectedVenue.openNow && selectedVenue.availableSlots > 0 
                        ? '#4CAF50' 
                        : '#F44336' 
                    }
                  ]}>
                    <Text style={styles.statusBadgeText}>
                      {selectedVenue.openNow && selectedVenue.availableSlots > 0 ? 'OPEN' : 'CLOSED'}
                    </Text>
                  </View>

                  {/* Sports Icons Overlay */}
                  <View style={styles.sportsOverlay}>
                    {selectedVenue.sports?.slice(0, 3).map((sport, index) => (
                      <View key={sport} style={styles.sportIcon}>
                        <MaterialIcons 
                          name={
                            sport.toLowerCase() === 'football' ? 'sports-soccer' :
                            sport.toLowerCase() === 'cricket' ? 'sports-cricket' :
                            sport.toLowerCase() === 'padel' ? 'sports-tennis' :
                            sport.toLowerCase() === 'tennis' ? 'sports-tennis' :
                            'sports'
                          } 
                          size={16} 
                          color="white" 
                        />
                      </View>
                    ))}
                  </View>
                </View>
                
                {/* Venue Info */}
                <View style={styles.venueInfo}>
                  <View style={styles.venueHeader}>
                    <Text style={styles.venueName} numberOfLines={1}>
                      {selectedVenue.name}
                    </Text>
                    <View style={styles.venueRating}>
                      <MaterialIcons name="star" size={16} color="#FFD700" />
                      <Text style={styles.venueRatingText}>{selectedVenue.rating || '4.0'}</Text>
                    </View>
                  </View>
                  
                  <Text style={styles.venueAddress} numberOfLines={1}>
                    {getVenueAddress(selectedVenue)}
                  </Text>
                  
                  <View style={styles.venueDetails}>
                    <View style={styles.venueDistance}>
                      <MaterialIcons name="location-on" size={14} color="#666" />
                      <Text style={styles.venueDistanceText}>{selectedVenue.distance || 'Distance unknown'}</Text>
                    </View>
                    
                    <Text style={styles.venuePrice}>
                      PKR {selectedVenue.pricePerHour || selectedVenue.basePrice || 'N/A'}/hr
                    </Text>
                  </View>
                  
                  {/* Availability and Slots */}
                  <View style={styles.availabilityContainer}>
                    <Text style={[
                      styles.venueAvailability,
                      { color: selectedVenue.openNow && selectedVenue.availableSlots > 0 ? '#4CAF50' : '#F44336' }
                    ]}>
                      {getAvailabilityText(selectedVenue)}
                    </Text>
                    
                    {selectedVenue.availableSlots > 0 && (
                      <View style={styles.slotsIndicator}>
                        <MaterialIcons name="schedule" size={14} color="#4CAF50" />
                        <Text style={styles.slotsText}>
                          {selectedVenue.availableSlots} slots available
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Sports Tags */}
                  <View style={styles.sportsContainer}>
                    {selectedVenue.sports?.slice(0, 3).map((sport, index) => (
                      <View key={sport} style={styles.sportTag}>
                        <Text style={styles.sportTagText}>{sport}</Text>
                      </View>
                    ))}
                  </View>
                </View>
                
                {/* Close Button */}
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={() => setSelectedVenue(null)}
                >
                  <MaterialIcons name="close" size={20} color="#666" />
                </TouchableOpacity>
              </View>

              {/* Action Button */}
              <View style={styles.cardActions}>
                <TouchableOpacity 
                  style={styles.viewDetailsButton}
                  onPress={() => handleVenueSelect(selectedVenue)}
                >
                  <Text style={styles.viewDetailsText}>View Details & Book</Text>
                  <MaterialIcons name="arrow-forward" size={16} color="white" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </Surface>
        </Animated.View>
      )}

      {/* Enhanced Action Buttons with Location Prompt */}
      <View style={styles.fabContainer}>
        <TouchableOpacity
          style={[
            styles.fabButton,
            styles.locationFab, 
            { 
              backgroundColor: themeColors.colors.primary
            }
          ]}
          onPress={requestLocationAccess}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          <MaterialIcons 
            name={isLoading ? "hourglass-empty" : location ? "my-location" : "location-off"} 
            size={24} 
            color={themeColors.colors.secondary} 
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.fabButton, styles.listFab, { backgroundColor: themeColors.colors.primary }]}
          onPress={() => navigation.navigate('VenueList')}
          activeOpacity={0.8}
        >
          <MaterialIcons name="view-list" size={20} color={themeColors.colors.secondary} />
        </TouchableOpacity>
      </View>

      {/* Location Permission Prompt */}
      {!location && (
        <View style={styles.locationPrompt}>
          <Surface style={styles.locationPromptCard} elevation={4}>
            <View style={styles.locationPromptContent}>
              <MaterialIcons name="location-on" size={24} color={themeColors.colors.primary} />
              <View style={styles.locationPromptText}>
                <Text style={styles.locationPromptTitle}>Enable Location</Text>
                <Text style={styles.locationPromptSubtitle}>
                  Get accurate distances and find nearby venues
                </Text>
              </View>
              <TouchableOpacity 
                style={styles.locationPromptButton}
                onPress={requestLocationAccess}
              >
                <Text style={styles.locationPromptButtonText}>Enable</Text>
              </TouchableOpacity>
            </View>
          </Surface>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: 'white',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  safeArea: {
    backgroundColor: 'transparent',
  },
  headerContent: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  searchBar: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    elevation: 0,
  },
  searchInput: {
    fontSize: 14,
    fontFamily: 'Montserrat_400Regular',
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  filterButton: {
    position: 'relative',
  },
  mapTypeButton: {
    // Additional styles if needed
  },
  filterBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#FF4444',
  },
  resultsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  resultsText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'Montserrat_500Medium',
    flex: 1,
  },
  resultsActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  debugButton: {
    padding: 4,
    borderRadius: 4,
    backgroundColor: '#F0F0F0',
  },
  hiddenVenuesText: {
    fontSize: 11,
    color: '#999',
    fontStyle: 'italic',
    fontFamily: 'Montserrat_400Regular',
  },
  loadingIndicator: {
    marginLeft: 8,
  },
  filtersContainer: {
    position: 'absolute',
    top: 140,
    left: 0,
    right: 0,
    zIndex: 999,
    paddingHorizontal: 16,
  },
  filtersSurface: {
    borderRadius: 16,
    padding: 16,
    backgroundColor: 'white',
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    fontFamily: 'Montserrat_600SemiBold',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  sportChip: {
    backgroundColor: '#F8F9FA',
    borderColor: '#E0E0E0',
  },
  chipText: {
    color: '#666',
    fontSize: 12,
    fontFamily: 'Montserrat_500Medium',
  },
  selectedChipText: {
    color: 'white',
    fontFamily: 'Montserrat_600SemiBold',
  },
  filterActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  toggleRadiusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F8F9FA',
  },
  toggleRadiusText: {
    fontSize: 12,
    color: '#004d43',
    marginLeft: 6,
    fontFamily: 'Montserrat_500Medium',
  },
  sortByDistanceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F0F8FF',
    borderWidth: 1,
    borderColor: '#004d43',
  },
  sortByDistanceText: {
    fontSize: 12,
    color: '#004d43',
    marginLeft: 6,
    fontFamily: 'Montserrat_500Medium',
  },
  map: {
    flex: 1,
  },
  customMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  slotsBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF4444',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'white',
  },
  slotsBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    fontFamily: 'Montserrat_700Bold',
  },
  sportTag: {
    backgroundColor: '#F0F0F0',
    height: 24,
  },
  sportTagText: {
    fontSize: 10,
    color: '#666',
    fontFamily: 'Montserrat_500Medium',
  },
  venueCardContainer: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
  },
  venueCard: {
    borderRadius: 20,
    backgroundColor: 'white',
    overflow: 'hidden',
  },
  venueCardContent: {
    flexDirection: 'row',
    position: 'relative',
  },
  venueImageContainer: {
    width: 120,
    height: 140,
    position: 'relative',
  },
  venueImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F0F0F0',
  },
  statusBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    fontFamily: 'Montserrat_700Bold',
  },
  sportsOverlay: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    flexDirection: 'row',
    gap: 4,
  },
  sportIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  venueInfo: {
    flex: 1,
    padding: 16,
    paddingRight: 40, // Space for close button
  },
  venueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  venueName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 8,
    fontFamily: 'Montserrat_700Bold',
  },
  venueAddress: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
    fontFamily: 'Montserrat_400Regular',
  },
  venueDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  venueRating: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  venueRatingText: {
    fontSize: 12,
    color: '#F57C00',
    marginLeft: 4,
    fontWeight: '600',
    fontFamily: 'Montserrat_600SemiBold',
  },
  venueDistance: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  venueDistanceText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
    fontFamily: 'Montserrat_500Medium',
  },
  venuePrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#004d43',
    fontFamily: 'Montserrat_700Bold',
  },
  availabilityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  venueAvailability: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Montserrat_600SemiBold',
  },
  slotsIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  slotsText: {
    fontSize: 11,
    color: '#4CAF50',
    marginLeft: 4,
    fontWeight: '500',
    fontFamily: 'Montserrat_500Medium',
  },
  sportsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  sportTag: {
    backgroundColor: '#F0F8FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E3F2FD',
  },
  sportTagText: {
    fontSize: 10,
    color: '#1976D2',
    fontWeight: '500',
    fontFamily: 'Montserrat_500Medium',
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  cardActions: {
    padding: 16,
    paddingTop: 0,
  },
  viewDetailsButton: {
    backgroundColor: '#004d43',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    gap: 8,
  },
  viewDetailsText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Montserrat_600SemiBold',
  },
  fabContainer: {
    position: 'absolute',
    right: 16,
    bottom: 100,
    gap: 12,
  },
  fabButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  locationFab: {
    // Additional styles for location FAB if needed
  },
  listFab: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  locationPrompt: {
    position: 'absolute',
    bottom: 180,
    left: 16,
    right: 16,
  },
  locationPromptCard: {
    borderRadius: 12,
    backgroundColor: 'white',
  },
  locationPromptContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  locationPromptText: {
    flex: 1,
    marginLeft: 12,
  },
  locationPromptTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    fontFamily: 'Montserrat_600SemiBold',
  },
  locationPromptSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
    fontFamily: 'Montserrat_400Regular',
  },
  locationPromptButton: {
    backgroundColor: '#004d43',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  locationPromptButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Montserrat_600SemiBold',
  },
});