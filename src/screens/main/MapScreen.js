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
import MapView, { Marker, PROVIDER_GOOGLE, Callout, Circle } from 'react-native-maps';
import * as Location from 'expo-location';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNearbyTurfs } from '../../store/slices/turfSlice';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../theme/theme';

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
    latitude: 24.8607, // Karachi default
    longitude: 67.0011,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [initialRegion, setInitialRegion] = useState({
    latitude: 24.8607, // Karachi default
    longitude: 67.0011,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
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

    getCurrentLocation();
    // Load nearby turfs when component mounts
    dispatch(fetchNearbyTurfs({
      latitude: region.latitude,
      longitude: region.longitude,
      radius: 10000 // 10km radius
    }));
  }, []);

  useEffect(() => {
    // Update filtered venues when nearbyTurfs changes
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

  // Simplified coordinate validation and processing
  const isValidCoordinate = (lat, lng) => {
    return (
      lat && lng &&
      typeof lat === 'number' && typeof lng === 'number' &&
      lat >= -90 && lat <= 90 &&
      lng >= -180 && lng <= 180 &&
      !(lat === 0 && lng === 0) // Exclude null island
    );
  };

  // Simplified function to get venue coordinates (synchronous version)
  const getVenueCoordinatesSync = (venue) => {
    // Check if we have valid direct coordinates
    if (isValidCoordinate(venue.latitude, venue.longitude)) {
      return {
        latitude: venue.latitude,
        longitude: venue.longitude,
        isValid: true
      };
    }
    
    // Check location object coordinates
    if (venue.location && isValidCoordinate(venue.location.latitude, venue.location.longitude)) {
      return {
        latitude: venue.location.latitude,
        longitude: venue.location.longitude,
        isValid: true
      };
    }

    // Return invalid coordinates - this venue won't be shown on map
    return {
      latitude: null,
      longitude: null,
      isValid: false
    };
  };

  // Simplified function to get venue coordinates (async version for processing)
  const getVenueCoordinates = async (venue) => {
    return getVenueCoordinatesSync(venue);
  };

  // Process venues to ensure they have valid coordinates
  const processVenuesCoordinates = async (venues) => {
    const processedVenues = [];
    
    for (const venue of venues) {
      const coords = await getVenueCoordinates(venue);
      if (coords.isValid) {
        processedVenues.push({
          ...venue,
          coordinates: coords
        });
      }
    }
    
    return processedVenues;
  };

  // Update venues with valid coordinates when nearbyTurfs changes
  useEffect(() => {
    const updateVenuesWithCoords = async () => {
      if (nearbyTurfs.length > 0) {
        const validVenues = await processVenuesCoordinates(nearbyTurfs);
        setVenuesWithValidCoords(validVenues);
        setFilteredVenues(validVenues);
      }
    };
    
    updateVenuesWithCoords();
  }, [nearbyTurfs]);
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
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Location Permission Required',
          'Please enable location access to find nearby venues and get accurate directions.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Settings', onPress: () => Location.requestForegroundPermissionsAsync() }
          ]
        );
        setIsLoading(false);
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      
      const newRegion = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };
      
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
      
    } catch (error) {
      Alert.alert('Location Error', 'Unable to get your current location. Please try again.');
      console.error('Location error:', error);
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

  // Debug function to log venues with missing coordinates
  const logVenuesWithMissingCoords = () => {
    const missingCoords = nearbyTurfs.filter(venue => {
      const coords = getVenueCoordinatesSync(venue);
      return !coords.isValid;
    });
    
    if (missingCoords.length > 0) {
      console.log('Venues with missing/invalid coordinates:', missingCoords.map(v => ({
        id: v.id,
        name: v.name,
        address: getVenueAddress(v),
        latitude: v.latitude,
        longitude: v.longitude,
        location: v.location
      })));
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

            {/* Results Counter */}
            <View style={styles.resultsContainer}>
              <Text style={styles.resultsText}>
                {filteredVenues.length} venue{filteredVenues.length !== 1 ? 's' : ''} found
                {venuesWithValidCoords.length !== nearbyTurfs.length && (
                  <Text style={styles.hiddenVenuesText}>
                    {' '}({nearbyTurfs.length - venuesWithValidCoords.length} hidden - no location data)
                  </Text>
                )}
              </Text>
              {loading && (
                <ActivityIndicator 
                  size="small" 
                  color={themeColors.colors.primary} 
                  style={styles.loadingIndicator}
                />
              )}
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

        {/* Enhanced Markers */}
        {filteredVenues.map((venue) => {
          const coordinates = venue.coordinates || getVenueCoordinatesSync(venue);
          
          // Only render markers for venues with valid coordinates
          if (!coordinates.isValid) {
            return null;
          }

          return (
            <Marker
              key={venue.id}
              coordinate={{
                latitude: coordinates.latitude,
                longitude: coordinates.longitude
              }}
              onPress={() => handleMarkerPress(venue)}
            >
              <View style={[
                styles.customMarker,
                { 
                  backgroundColor: getMarkerColor(venue),
                  borderColor: selectedVenue?.id === venue.id ? themeColors.colors.secondary : 'white',
                  borderWidth: selectedVenue?.id === venue.id ? 3 : 2,
                }
              ]}>
                <MaterialIcons 
                  name="sports-soccer" 
                  size={16} 
                  color="white" 
                />
                {venue.availableSlots > 0 && (
                  <View style={styles.slotsBadge}>
                    <Text style={styles.slotsBadgeText}>{venue.availableSlots}</Text>
                  </View>
                )}
              </View>

              <Callout onPress={() => handleVenueSelect(venue)} tooltip>
                <Surface style={styles.calloutContainer} elevation={4}>
                  <View style={styles.calloutContent}>
                    <Text style={styles.calloutTitle}>{venue.name}</Text>
                    <Text style={styles.calloutAddress}>{getVenueAddress(venue)}</Text>
                    
                    <View style={styles.calloutDetails}>
                      <View style={styles.calloutRating}>
                        <MaterialIcons name="star" size={14} color="#FFD700" />
                        <Text style={styles.calloutRatingText}>{venue.rating || '4.0'}</Text>
                      </View>
                      <Text style={styles.calloutPrice}>
                        PKR {venue.pricePerHour || venue.basePrice || 'N/A'}/hr
                      </Text>
                    </View>
                    
                    <Text style={[
                      styles.calloutAvailability,
                      { color: venue.openNow && venue.availableSlots > 0 ? '#4CAF50' : '#F44336' }
                    ]}>
                      {getAvailabilityText(venue)}
                    </Text>
                    
                    <View style={styles.calloutSports}>
                      {venue.sports?.slice(0, 3).map((sport, index) => (
                        <Chip 
                          key={sport} 
                          style={styles.sportTag}
                          textStyle={styles.sportTagText}
                          compact
                        >
                          {sport}
                        </Chip>
                      ))}
                    </View>
                  </View>
                </Surface>
              </Callout>
            </Marker>
          );
        })}
      </MapView>

      {/* Enhanced Selected Venue Card */}
      {selectedVenue && (
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
                <Image 
                  source={selectedVenue.image || { uri: 'https://via.placeholder.com/80x80' }} 
                  style={styles.venueImage} 
                />
                <View style={styles.venueInfo}>
                  <Text style={styles.venueName}>{selectedVenue.name}</Text>
                  <Text style={styles.venueAddress}>{getVenueAddress(selectedVenue)}</Text>
                  
                  <View style={styles.venueDetails}>
                    <View style={styles.venueRating}>
                      <MaterialIcons name="star" size={16} color="#FFD700" />
                      <Text style={styles.venueRatingText}>{selectedVenue.rating || '4.0'}</Text>
                    </View>
                    <Text style={styles.venueDistance}>{selectedVenue.distance || '2.5 km'}</Text>
                  </View>
                  
                  <Text style={styles.venuePrice}>
                    PKR {selectedVenue.pricePerHour || selectedVenue.basePrice || 'N/A'}/hr
                  </Text>
                  
                  <Text style={[
                    styles.venueAvailability,
                    { color: selectedVenue.openNow && selectedVenue.availableSlots > 0 ? '#4CAF50' : '#F44336' }
                  ]}>
                    {getAvailabilityText(selectedVenue)}
                  </Text>
                </View>
                
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={() => setSelectedVenue(null)}
                >
                  <MaterialIcons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </Surface>
        </Animated.View>
      )}

      {/* Enhanced Action Buttons */}
      <View style={styles.fabContainer}>
        <FAB
          icon={isLoading ? "hourglass-empty" : "my-location"}
          style={[styles.locationFab, { backgroundColor: themeColors.colors.primary }]}
          onPress={getCurrentLocation}
          disabled={isLoading}
          size="medium"
        />

        <FAB
          icon="fullscreen"
          style={styles.zoomFab}
          onPress={zoomToFitMarkers}
          size="small"
        />

        <FAB
          icon="view-list"
          style={styles.listFab}
          onPress={() => navigation.navigate('VenueList')}
          size="small"
        />
      </View>
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
    justifyContent: 'flex-end',
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
  calloutContainer: {
    width: 260,
    borderRadius: 12,
    backgroundColor: 'white',
  },
  calloutContent: {
    padding: 16,
  },
  calloutTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
    fontFamily: 'Montserrat_700Bold',
  },
  calloutAddress: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    fontFamily: 'Montserrat_400Regular',
  },
  calloutDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  calloutRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  calloutRatingText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
    fontFamily: 'Montserrat_500Medium',
  },
  calloutPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#004d43',
    fontFamily: 'Montserrat_600SemiBold',
  },
  calloutAvailability: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 8,
    fontFamily: 'Montserrat_500Medium',
  },
  calloutSports: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
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
    borderRadius: 16,
    backgroundColor: 'white',
  },
  venueCardContent: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  venueImage: {
    width: 70,
    height: 70,
    borderRadius: 12,
    marginRight: 16,
    backgroundColor: '#F0F0F0',
  },
  venueInfo: {
    flex: 1,
  },
  venueName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
    fontFamily: 'Montserrat_700Bold',
  },
  venueAddress: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
    fontFamily: 'Montserrat_400Regular',
  },
  venueDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  venueRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  venueRatingText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
    fontFamily: 'Montserrat_500Medium',
  },
  venueDistance: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'Montserrat_400Regular',
  },
  venuePrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#004d43',
    marginBottom: 4,
    fontFamily: 'Montserrat_600SemiBold',
  },
  venueAvailability: {
    fontSize: 12,
    fontWeight: '500',
    fontFamily: 'Montserrat_500Medium',
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
  },
  fabContainer: {
    position: 'absolute',
    right: 16,
    bottom: 100,
    gap: 12,
  },
  locationFab: {
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  zoomFab: {
    backgroundColor: '#1976D2',
    elevation: 4,
  },
  listFab: {
    backgroundColor: '#FF9800',
    elevation: 4,
  },
});