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
  Modal
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNearbyTurfs, toggleFavorite, searchTurfs } from '../../store/slices/turfSlice';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../theme/theme';
import SkeletonLoader from '../../components/SkeletonLoader';
import FilterModal from '../../components/FilterModal';

const { width, height } = Dimensions.get('window');

// Custom map style for better branding
// Custom map style for clean, modern look (matching reference)
const customMapStyle = [
  {
    "elementType": "geometry",
    "stylers": [{ "color": "#f5f5f5" }]
  },
  {
    "elementType": "labels.icon",
    "stylers": [{ "visibility": "off" }]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#616161" }]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [{ "color": "#f5f5f5" }]
  },
  {
    "featureType": "administrative.land_parcel",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#bdbdbd" }]
  },
  {
    "featureType": "poi",
    "elementType": "geometry",
    "stylers": [{ "color": "#eeeeee" }]
  },
  {
    "featureType": "poi",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#757575" }]
  },
  {
    "featureType": "poi.park",
    "elementType": "geometry",
    "stylers": [{ "color": "#e5e5e5" }]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#9e9e9e" }]
  },
  {
    "featureType": "road",
    "elementType": "geometry",
    "stylers": [{ "color": "#ffffff" }]
  },
  {
    "featureType": "road.arterial",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#757575" }]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [{ "color": "#dadada" }]
  },
  {
    "featureType": "road.highway",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#616161" }]
  },
  {
    "featureType": "road.local",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#9e9e9e" }]
  },
  {
    "featureType": "transit.line",
    "elementType": "geometry",
    "stylers": [{ "color": "#e5e5e5" }]
  },
  {
    "featureType": "transit.station",
    "elementType": "geometry",
    "stylers": [{ "color": "#eeeeee" }]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [{ "color": "#e9e9e9" }]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#9e9e9e" }]
  }
];

export default function MapScreen({ navigation }) {
  const [location, setLocation] = useState(null);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(true); // Track location loading state
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
  const [showFilters, setShowFilters] = useState(false);
  const [filteredVenues, setFilteredVenues] = useState([]);
  const { filters: reduxFilters } = useSelector(state => state.turf);
  const [isLoading, setIsLoading] = useState(false);
  const [mapType, setMapType] = useState('standard');
  const [showRadius, setShowRadius] = useState(true);
  const [geocodedCoordinates, setGeocodedCoordinates] = useState(new Map());
  const [isMapReady, setIsMapReady] = useState(false);
  const [venuesWithValidCoords, setVenuesWithValidCoords] = useState([]);
  const insets = useSafeAreaInsets();

  const mapRef = useRef(null);
  const flatListRef = useRef(null);
  const dispatch = useDispatch();
  const { nearbyTurfs, loading } = useSelector(state => state.turf);
  const themeColors = theme;



  // Animation values
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const cardSlideAnim = useRef(new Animated.Value(300)).current;

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
      setIsGettingLocation(true);

      // Request permission
      let { status, canAskAgain } = await Location.requestForegroundPermissionsAsync();

      if (status === 'granted') {
        console.log('✅ Location permission granted');
        setHasLocationPermission(true);
        await getCurrentLocation();
      } else {
        console.log('❌ Location permission denied');
        setHasLocationPermission(false);
        setIsGettingLocation(false);

        // Custom alert logic
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
      // Continue without location
    }
  };


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
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers
  };

  // Format distance for display
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

  // Calculate distances from user location to venues
  const calculateVenueDistances = (venues, location) => {
    if (!location) {
      console.log('📍 No user location available, using default distances');
      return venues.map(venue => ({
        ...venue,
        distance: 'Unknown',
        distanceKm: null
      }));
    }

    console.log(`📏 Calculating distances from user location: ${location.latitude}, ${location.longitude}`);

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
    // If no filters applied, show all venues
    const hasNoFilters = !searchQuery.trim() &&
      (reduxFilters.sports.includes('All') || reduxFilters.sports.length === 0) &&
      reduxFilters.sortBy === 'All' &&
      reduxFilters.minRating === 0 &&
      reduxFilters.priceRange[0] === 0 &&
      reduxFilters.priceRange[1] === 10000;

    if (hasNoFilters) {
      console.log('📊 MapScreen: No filters applied, showing all venues');
      setFilteredVenues(venuesWithValidCoords);
      return;
    }

    console.log('🔍 MapScreen: Applying filters:', {
      searchQuery,
      sports: reduxFilters.sports,
      sortBy: reduxFilters.sortBy,
      minRating: reduxFilters.minRating,
      priceRange: reduxFilters.priceRange
    });

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
      if (!reduxFilters.sports.includes('All') && reduxFilters.sports.length > 0) {
        const venueSports = Array.isArray(venue.sports) ? venue.sports :
          typeof venue.sports === 'string' && venue.sports.trim() ? venue.sports.split(',').map(s => s.trim()) : [];
        matches = matches && venueSports.some(s => reduxFilters.sports.includes(s));
      }

      // Price range filter
      const venuePrice = venue.pricePerHour || venue.pricing?.basePrice || venue.basePrice || 0;
      matches = matches && venuePrice >= reduxFilters.priceRange[0] && venuePrice <= reduxFilters.priceRange[1];

      // Rating filter
      const venueRating = venue.rating || 5;
      matches = matches && venueRating >= reduxFilters.minRating;

      return matches;
    });

    console.log(`✅ MapScreen: Filtered ${filtered.length} venues from ${venuesWithValidCoords.length} total`);

    // Sorting logic
    if (reduxFilters.sortBy === 'Popular') {
      filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      console.log('📊 MapScreen: Sorted by popularity (rating)');
    } else if (reduxFilters.sortBy === 'Near by' && location) {
      filtered.sort((a, b) => {
        if (a.distanceKm === null) return 1;
        if (b.distanceKm === null) return -1;
        return a.distanceKm - b.distanceKm;
      });
      console.log('📊 MapScreen: Sorted by distance');
    } else if (reduxFilters.sortBy === 'Price Low to High') {
      filtered.sort((a, b) => {
        const priceA = a.pricePerHour || a.pricing?.basePrice || a.basePrice || 0;
        const priceB = b.pricePerHour || b.pricing?.basePrice || b.basePrice || 0;
        return priceA - priceB;
      });
      console.log('📊 MapScreen: Sorted by price (low to high)');
    }

    setFilteredVenues(filtered);
  };

  useEffect(() => {
    filterVenues();
    // Zoom to fit filtered venues if they're different from all venues
    if (filteredVenues.length > 0 && filteredVenues.length < venuesWithValidCoords.length) {
      setTimeout(() => zoomToFitMarkers(filteredVenues), 500);
    }
  }, [searchQuery, reduxFilters, venuesWithValidCoords]);

  // Create a ref to store the search timer for debouncing
  const searchTimerRef = useRef(null);

  const handleSearchChange = (query) => {
    setSearchQuery(query);

    // Immediate local filtering for better UX
    filterVenues();

    // Clear previous timer
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }

    // AJAX Search (Server Side) - Debounced
    if (query.trim()) {
      searchTimerRef.current = setTimeout(() => {
        // If it looks like a location, search by location
        if (
          query.toLowerCase().includes('area') ||
          query.toLowerCase().includes('sector') ||
          query.toLowerCase().includes('town') ||
          query.toLowerCase().includes('city') ||
          query.length > 10
        ) {
          searchByLocation(query);
        } else {
          // Otherwise do a name/sport search
          console.log('🔍 MapScreen: Dispatching searchTurfs thunk for:', query);
          try {
            if (typeof searchTurfs === 'undefined') {
              console.error('❌ searchTurfs is UNDEFINED in MapScreen scope!');
            } else {
              dispatch(searchTurfs({ query, sports: reduxFilters.sports }));
            }
          } catch (e) {
            console.error('❌ Error during searchTurfs dispatch:', e);
          }
        }
      }, 800);
    } else {
      // If cleared, fetch all nearby turfs again
      dispatch(fetchNearbyTurfs({
        latitude: region.latitude,
        longitude: region.longitude,
        radius: 50000
      }));
    }
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

  // Sync selectedVenue with real-time updates
  useEffect(() => {
    if (selectedVenue) {
      // Try to find the venue in the processed list first (which has distances)
      let updatedVenue = venuesWithValidCoords.find(t => t.id === selectedVenue.id);

      // If not in processed list yet (maybe loading), try raw list
      if (!updatedVenue && nearbyTurfs.length > 0) {
        updatedVenue = nearbyTurfs.find(t => t.id === selectedVenue.id);
      }

      if (updatedVenue) {
        // If we pulled from raw list, we might lose distance. Preserve it.
        if (!updatedVenue.distance && selectedVenue.distance) {
          updatedVenue = {
            ...updatedVenue,
            distance: selectedVenue.distance,
            distanceKm: selectedVenue.distanceKm,
            coordinates: selectedVenue.coordinates // Also preserve valid coordinates if raw ones aren't processed yet
          };
        }

        // Only update if there are meaningful changes
        if (JSON.stringify(updatedVenue, (key, value) => {
          // Avoid circular references or huge objects if any
          // Also ignore distance comparison if we just patched it in
          if (key === 'coordinates' || key === 'loading') return undefined;
          return value;
        }) !== JSON.stringify(selectedVenue, (key, value) => {
          if (key === 'coordinates' || key === 'loading') return undefined;
          return value;
        })) {
          console.log('🔄 MapScreen: Syncing selected venue with real-time update');
          setSelectedVenue(updatedVenue);
        }
      }
    }
  }, [nearbyTurfs, venuesWithValidCoords, selectedVenue]);

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

  const centerOnUserLocation = () => {
    if (location && mapRef.current) {
      console.log('📍 Centering map on user location:', location);
      mapRef.current.animateToRegion({
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }, 1000);
    }
  };
  const getCurrentLocation = async () => {
    setIsLoading(true);
    try {
      console.log('📍 Requesting location permissions...');
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setHasLocationPermission(false);
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

    // Sync with FlatList - find index and scroll
    const index = filteredVenues.findIndex(v => v.id === venue.id);
    if (index !== -1 && flatListRef.current) {
      flatListRef.current.scrollToIndex({ index, animated: true });
    }

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
      <StatusBar backgroundColor="transparent" barStyle="dark-content" translucent />

      {/* New Header: Search Bar & Filter */}
      <View style={[styles.newHeaderContainer, { paddingTop: insets.top + 10 }]}>
        <View style={styles.searchRow}>
          <Surface style={styles.newSearchSurface} elevation={2}>
            <MaterialIcons name="search" size={24} color="#7D7D7D" style={styles.newSearchIcon} />
            <Searchbar
              placeholder="Search venues & areas"
              onChangeText={handleSearchChange}
              value={searchQuery}
              style={styles.newSearchInputStyle}
              inputStyle={styles.newTextInput}
              iconColor="transparent" // Hidden as we use custom icon
              placeholderTextColor="#9e9e9e"
              elevation={0}
              clearIcon={() => searchQuery ? <MaterialIcons name="close" size={20} color="#7D7D7D" onPress={() => handleSearchChange('')} /> : null}
            />
          </Surface>

          <TouchableOpacity
            style={[styles.filterSquareButton, { backgroundColor: themeColors.colors.primary }]}
            onPress={toggleFilters}
            activeOpacity={0.8}
          >
            <MaterialIcons name="tune" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <FilterModal
        visible={showFilters}
        onDismiss={toggleFilters}
      />

      {/* Enhanced Map */}
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={initialRegion}
        onRegionChangeComplete={handleRegionChangeComplete}
        onMapReady={handleMapReady}
        showsUserLocation={false}
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
            radius={2000} // Adjusted radius for better visual match
            strokeColor="#e8ee26"
            strokeWidth={2}
            fillColor="rgba(232, 238, 38, 0.15)"
          />
        )}

        {/* Custom User Location Marker with Primary Brand Color */}
        {location && (
          <Marker
            coordinate={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
            anchor={{ x: 0.5, y: 0.5 }}
            tracksViewChanges={false}
          >
            <View style={styles.userLocationMarker}>
              <View style={styles.userLocationDot} />
            </View>
          </Marker>
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



            return (
              <Marker
                key={`venue-${venue.id}-${index}`} // Stable unique key
                coordinate={{
                  latitude: lat,
                  longitude: lng
                }}
                onPress={() => handleMarkerPress(venue)}
                tracksViewChanges={false} // Optimization
              >
                {/* Reference-style Dot Marker */}
                <View style={[
                  styles.dotMarker,
                  selectedVenue?.id === venue.id && styles.selectedMarkerContainer
                ]}>
                  {selectedVenue?.id === venue.id ? (
                    <View style={styles.selectedMarkerOuter}>
                      <View style={styles.selectedMarkerInner}>
                        <MaterialIcons name="navigation" size={16} color="white" style={{ transform: [{ rotate: '45deg' }] }} />
                      </View>
                    </View>
                  ) : (
                    <View style={styles.markerDot} />
                  )}
                </View>
              </Marker>
            );
          })
        ) : (
          null
        )}
      </MapView>

      {/* Enhanced Selected Venue Card with Image */}
      {/* Loading Skeleton for Carousel */}
      {loading && (
        <View style={styles.carouselContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carouselPadding}>
            {[1, 2].map((i) => (
              <View key={i} style={styles.newCarouselCard}>
                <SkeletonLoader width="100%" height="52%" borderRadius={0} />
                <View style={styles.newCardContent}>
                  <View style={styles.newTitleRow}>
                    <SkeletonLoader width="60%" height={22} borderRadius={4} />
                    <SkeletonLoader width="25%" height={20} borderRadius={4} />
                  </View>
                  <SkeletonLoader width="80%" height={16} borderRadius={4} style={{ marginTop: 8 }} />
                  <View style={[styles.newStatsRow, { marginTop: 12 }]}>
                    <SkeletonLoader width="40%" height={18} borderRadius={4} />
                  </View>
                  <View style={styles.newFooterRow}>
                    <SkeletonLoader width="50%" height={16} borderRadius={4} />
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      )}
      {/* New Horizontal Carousel */}
      <View style={styles.carouselContainer}>
        <Animated.FlatList
          ref={flatListRef}
          data={filteredVenues}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          snapToInterval={width * 0.88} // card width + margin
          decelerationRate="fast"
          keyExtractor={(item) => item.id}
          onMomentumScrollEnd={(event) => {
            const index = Math.round(event.nativeEvent.contentOffset.x / (width * 0.88));
            if (filteredVenues[index]) {
              const venue = filteredVenues[index];
              setSelectedVenue(venue);
              // Center map on the venue from carousel swipe
              const coordinates = venue.coordinates || getVenueCoordinatesSync(venue);
              if (coordinates.isValid && mapRef.current) {
                mapRef.current.animateToRegion({
                  latitude: coordinates.latitude,
                  longitude: coordinates.longitude,
                  latitudeDelta: 0.008,
                  longitudeDelta: 0.008,
                }, 1000);
              }
            }
          }}
          renderItem={({ item: venue }) => (
            <Surface style={styles.newCarouselCard} elevation={4}>
              <TouchableOpacity
                onPress={() => handleVenueSelect(venue)}
                activeOpacity={0.9}
                style={styles.newCardInner}
              >
                {/* Image Section */}
                <View style={styles.newImageWrapper}>
                  <Image
                    source={
                      venue.images && venue.images.length > 0
                        ? (typeof venue.images[0] === 'string' ? { uri: venue.images[0] } : venue.images[0])
                        : venue.image
                          ? (typeof venue.image === 'string' ? { uri: venue.image } : venue.image)
                          : require('../../images/football.jpg')
                    }
                    style={styles.newCardImage}
                    resizeMode="cover"
                  />

                  {/* Favorite Button */}
                  <TouchableOpacity
                    style={styles.newFavoriteIcon}
                    onPress={() => dispatch(toggleFavorite(venue))}
                  >
                    <MaterialIcons
                      name={venue.isFavorite ? "favorite" : "favorite-border"}
                      size={22}
                      color={venue.isFavorite ? "#FF6B6B" : "#7D7D7D"}
                    />
                  </TouchableOpacity>
                </View>

                {/* Content Section */}
                <View style={styles.newCardContent}>
                  <View style={styles.newTitleRow}>
                    <Text style={styles.newVenueName} numberOfLines={1}>{String(venue.name)}</Text>
                    <Text style={styles.newPrice}>
                      {String('PKR ' + (venue.pricePerHour || venue.basePrice || 'N/A'))}<Text style={styles.perHour}>/hr</Text>
                    </Text>
                  </View>

                  <View style={styles.newAddressRow}>
                    <MaterialIcons name="location-on" size={14} color="#7D7D7D" />
                    <Text style={styles.newAddressText} numberOfLines={1}>
                      {venue.address || venue.area || 'Lahore'}
                    </Text>
                  </View>

                  <View style={styles.newStatsRow}>
                    <Text style={styles.ratingLabel}>{String(venue.rating?.toFixed(1) || '5.0')}</Text>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <MaterialIcons
                        key={star}
                        name="star"
                        size={16}
                        color={star <= (venue.rating || 5) ? "#FFD700" : "#E0E0E0"}
                      />
                    ))}
                    <Text style={styles.reviewsLabel}>{String('(' + (venue.reviewCount || 0) + ' Reviews)')}</Text>
                  </View>

                  <View style={styles.newFooterRow}>
                    <View style={styles.newTag}>
                      <MaterialIcons name="directions-run" size={14} color="#7D7D7D" />
                      <Text style={styles.newTagText}>{String((venue.distance || '3.5 km') + '/50min')}</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            </Surface>
          )}
          contentContainerStyle={styles.carouselPadding}
        />
      </View>

      {/* Location FAB - Center on User Location */}
      <FAB
        icon={({ size, color }) => (
          <MaterialIcons name="my-location" size={size} color={color} />
        )}
        style={[
          styles.locationFab,
          {
            backgroundColor: themeColors.colors.primary,
            bottom: Platform.OS === 'android' ? 380 : 370
          }
        ]}
        color={themeColors.colors.secondary}
        onPress={() => {
          if (location) {
            centerOnUserLocation();
          } else {
            requestLocationAccess();
          }
        }}
        small
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  map: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  dotMarker: {
    padding: 5,
  },
  markerDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#7D7D7D',
    borderWidth: 2,
    borderColor: 'white',
  },
  userLocationMarker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 77, 67, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userLocationDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#004d43',
    borderWidth: 3,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  selectedMarkerContainer: {
    zIndex: 100,
  },
  selectedMarkerOuter: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(125, 125, 125, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedMarkerInner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#7D7D7D',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  newHeaderContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingHorizontal: 20,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  newSearchSurface: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    height: 56,
    paddingHorizontal: 12,
  },
  newSearchIcon: {
    marginRight: 4,
  },
  newSearchInputStyle: {
    flex: 1,
    backgroundColor: 'transparent',
    height: 56,
  },
  newTextInput: {
    fontSize: 16,
    fontFamily: 'Montserrat_400Regular',
    marginLeft: -10,
  },
  filterSquareButton: {
    width: 56,
    height: 56,
    backgroundColor: '#7D7D7D',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  floatingSearchContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 110 : 90,
    left: 20,
    right: 20,
    zIndex: 999,
  },
  floatingSportsContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  sportsScrollContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  floatingSportChip: {
    marginRight: 8,
    backgroundColor: 'white',
    borderRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  floatingSportChipText: {
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 14,
  },
  searchSurface: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 16, // Softer corners
    height: 54,
    paddingHorizontal: 12,
  },
  searchIconContainer: {
    padding: 8,
  },
  cleanSearchBar: {
    flex: 1,
    backgroundColor: 'transparent',
    height: 50,

  },
  cleanSearchInput: {
    fontSize: 16,
    color: '#333',
    fontFamily: 'Montserrat_400Regular',
    minHeight: 0, // Fix alignment on some devices
  },
  filterIconContainer: {
    padding: 8,
  },
  cardTouchable: {
    flexDirection: 'row',
    padding: 12,
  },
  cleanVenueImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
    marginRight: 16,
    backgroundColor: '#f5f5f5',
  },
  cleanVenueInfo: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 2,
    paddingRight: 52,
  },
  cleanHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cleanVenueName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#212121',
    flex: 1,
    marginRight: 8,
    fontFamily: 'Montserrat_700Bold',
  },
  heartButton: {
    padding: 4,
  },
  cleanAddress: {
    fontSize: 13,
    color: '#757575',
    fontFamily: 'Montserrat_400Regular',
    marginTop: 2,
  },
  cleanRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  cleanRatingText: {
    fontSize: 12,
    color: '#424242',
    marginLeft: 4,
    fontWeight: '600',
    fontFamily: 'Montserrat_600SemiBold',
  },
  cleanFooterRow: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoText: {
    fontSize: 11,
    color: '#424242',
    fontFamily: 'Montserrat_500Medium',
  },
  venueCardContainer: {
    position: 'absolute',
    bottom: 100, // Move up to clear floating nav bar
    left: 20,
    right: 20,
    zIndex: 999,
  },
  venueCard: {
    borderRadius: 16,
    backgroundColor: 'white',
    overflow: 'hidden',
  },
  // Removed unneeded styles for cleaner file
  headerContainer: {},
  safeArea: {},
  headerContent: {},
  searchContainer: {},
  searchBar: {},
  searchInput: {},
  actionButton: {},
  filterButton: {},
  mapTypeButton: {},
  filterBadge: {},
  resultsContainer: {},
  resultsText: {},
  resultsActions: {},
  debugButton: {},
  hiddenVenuesText: {},
  loadingIndicator: {},
  venueCardContent: {},
  venueImageContainer: {},
  venueImage: {},
  statusBadge: {},
  statusBadgeText: {},
  sportsOverlay: {},
  sportIcon: {},
  venueInfo: {},
  venueHeader: {},
  venueName: {},
  venueAddress: {},
  venueDetails: {},
  venueDistance: {},
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
  venueDistance: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  venueDistanceText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
    fontFamily: 'Montserrat_400Regular',
  },
  cleanVenueName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#212121',
    flex: 1,
    marginRight: 8,
    fontFamily: 'Montserrat_700Bold',
  },
  heartButton: {
    padding: 4,
  },
  absoluteHeartButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    zIndex: 10,
  },
  cleanAddress: {
    fontSize: 13,
    color: '#757575',
    fontFamily: 'Montserrat_400Regular',
    marginTop: 2,
  },
  cleanRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  cleanRatingText: {
    fontSize: 12,
    color: '#424242',
    marginLeft: 4,
    fontWeight: '600',
    fontFamily: 'Montserrat_600SemiBold',
  },
  cleanFooterRow: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoText: {
    fontSize: 11,
    color: '#424242',
    fontFamily: 'Montserrat_500Medium',
  },
  // Keep required legacy styles to prevent crash
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
  locationFab: {
    position: 'absolute',
    right: 20,
    bottom: 350, // Positioned above the carousel
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    height: height * 0.85,
    paddingTop: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  closeModalButton: {
    padding: 8,
  },
  modalHeaderTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#212121',
    fontFamily: 'Montserrat_700Bold',
  },
  filterScrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  filterSection: {
    marginBottom: 32,
  },
  filterSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212121',
    fontFamily: 'Montserrat_700Bold',
    marginBottom: 16,
  },
  filterChipsRow: {
    flexDirection: 'row',
    marginHorizontal: -5,
  },
  filterChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    backgroundColor: '#F5F5F5',
    marginHorizontal: 5,
    marginBottom: 10,
  },
  activeFilterChip: {
    backgroundColor: '#3D79F2', // Blue as in the reference
  },
  filterChipText: {
    fontSize: 14,
    color: '#7D7D7D',
    fontFamily: 'Montserrat_600SemiBold',
  },
  activeFilterChipText: {
    color: 'white',
  },
  priceLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  priceRangeLabel: {
    fontSize: 12,
    color: '#7D7D7D',
    fontFamily: 'Montserrat_500Medium',
  },
  priceSimpleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
  },
  priceChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    marginHorizontal: 5,
    marginBottom: 10,
  },
  ratingFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  starsRow: {
    flexDirection: 'row',
    flex: 1,
  },
  ratingFilterText: {
    fontSize: 16,
    color: '#212121',
    fontFamily: 'Montserrat_500Medium',
    marginRight: 12,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#3D79F2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonInner: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#3D79F2',
  },
  sportsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    gap: 15,
  },
  resetFilterButton: {
    flex: 1,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resetFilterText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3D79F2',
    fontFamily: 'Montserrat_600SemiBold',
  },
  applyFilterButton: {
    flex: 1,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3D79F2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyFilterText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    fontFamily: 'Montserrat_600SemiBold',
  },
  carouselContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 40 : 30,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  carouselPadding: {
    paddingHorizontal: 16,
  },
  newCarouselCard: {
    width: width * 0.84,
    height: 310,
    backgroundColor: 'white',
    borderRadius: 20,
    marginHorizontal: width * 0.02,
    overflow: 'hidden',
    marginBottom: 10,
  },
  newCardInner: {
    flex: 1,
  },
  newImageWrapper: {
    width: '100%',
    height: '52%',
    position: 'relative',
  },
  newCardImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F5F5F5',
  },
  newFavoriteIcon: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'white',
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  newCardContent: {
    padding: 16,
    flex: 1,
    justifyContent: 'space-between',
  },
  newTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  newVenueName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212121',
    fontFamily: 'Montserrat_700Bold',
    flex: 1,
    marginRight: 10,
  },
  newPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#424242',
    fontFamily: 'Montserrat_600SemiBold',
  },
  perHour: {
    fontSize: 12,
    color: '#7D7D7D',
    fontWeight: '400',
  },
  newAddressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  newAddressText: {
    fontSize: 14,
    color: '#7D7D7D',
    fontFamily: 'Montserrat_400Regular',
    flex: 1,
  },
  newStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 4,
  },
  ratingLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#212121',
    fontFamily: 'Montserrat_700Bold',
    marginRight: 2,
  },
  reviewsLabel: {
    fontSize: 12,
    color: '#7D7D7D',
    fontFamily: 'Montserrat_400Regular',
    marginLeft: 4,
  },
  newFooterRow: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  newTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  newTagText: {
    fontSize: 13,
    color: '#424242',
    fontFamily: 'Montserrat_500Medium',
  },
});