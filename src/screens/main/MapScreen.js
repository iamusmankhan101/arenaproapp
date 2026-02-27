import { useEffect, useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  StatusBar,
} from 'react-native';
import {
  Text,
  Card,
  FAB,
  Searchbar,
  ActivityIndicator
} from 'react-native-paper';
import { WebView } from 'react-native-webview';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNearbyTurfs } from '../../store/slices/turfSlice';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../theme/theme';
import FilterModal from '../../components/FilterModal';

export default function MapScreen({ navigation }) {
  const [location, setLocation] = useState(null);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filteredVenues, setFilteredVenues] = useState([]);
  const { filters: reduxFilters } = useSelector(state => state.turf);
  const [venuesWithValidCoords, setVenuesWithValidCoords] = useState([]);
  const insets = useSafeAreaInsets();

  const webViewRef = useRef(null);
  const dispatch = useDispatch();
  const { nearbyTurfs, loading } = useSelector(state => state.turf);
  const themeColors = theme;

  const slideAnim = useRef(new Animated.Value(-100)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const cardSlideAnim = useRef(new Animated.Value(300)).current;

  useEffect(() => {
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

    initializeMapScreen();
  }, []);

  const initializeMapScreen = async () => {
    console.log('🚀 MapScreen: Initializing with Leaflet...');

    try {
      dispatch(fetchNearbyTurfs({
        latitude: 31.5204,
        longitude: 74.3587,
        radius: 50000
      }));
      console.log('✅ MapScreen: Venues loaded successfully');
    } catch (error) {
      console.error('❌ MapScreen: Failed to load venues:', error);
    }

    try {
      await requestLocationAccess();
    } catch (error) {
      console.log('⚠️ MapScreen: Location access denied, continuing without location');
    }
  };

  const requestLocationAccess = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();

      if (status === 'granted') {
        setHasLocationPermission(true);
        await getCurrentLocation();
      } else {
        setHasLocationPermission(false);
      }
    } catch (error) {
      console.error('📍 Location request error:', error);
    }
  };

  const getCurrentLocation = async () => {
    try {
      let currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setLocation(currentLocation.coords);
      
      // Update map center
      if (webViewRef.current) {
        webViewRef.current.injectJavaScript(`
          map.setView([${currentLocation.coords.latitude}, ${currentLocation.coords.longitude}], 13);
          true;
        `);
      }
    } catch (error) {
      console.error('❌ Location error:', error);
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
        isValid: true
      };
    }

    if (venue.location && isValidCoordinate(venue.location.latitude, venue.location.longitude)) {
      return {
        latitude: venue.location.latitude,
        longitude: venue.location.longitude,
        isValid: true
      };
    }

    return { latitude: null, longitude: null, isValid: false };
  };

  const processVenuesCoordinates = (venues) => {
    return venues
      .map(venue => {
        const coords = getVenueCoordinatesSync(venue);
        if (coords.isValid) {
          return {
            ...venue,
            coordinates: coords
          };
        }
        return null;
      })
      .filter(venue => venue !== null);
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

  useEffect(() => {
    if (nearbyTurfs.length > 0) {
      console.log('📍 MapScreen: Processing', nearbyTurfs.length, 'venues for map display');
      const validVenues = processVenuesCoordinates(nearbyTurfs);
      console.log('✅ MapScreen: Found', validVenues.length, 'venues with valid coordinates');
      
      const venuesWithDistances = validVenues.map(venue => {
        if (location) {
          const distanceKm = calculateDistance(
            location.latitude,
            location.longitude,
            venue.coordinates.latitude,
            venue.coordinates.longitude
          );
          return {
            ...venue,
            distance: formatDistance(distanceKm),
            distanceKm: distanceKm
          };
        }
        return { ...venue, distance: 'Unknown', distanceKm: null };
      });

      setVenuesWithValidCoords(venuesWithDistances);
      setFilteredVenues(venuesWithDistances);

      // Update map markers
      if (webViewRef.current && venuesWithDistances.length > 0) {
        const markersData = venuesWithDistances.map(v => ({
          id: v.id,
          lat: v.coordinates.latitude,
          lng: v.coordinates.longitude,
          name: v.name,
          rating: v.rating || 5,
          price: v.pricePerHour || v.pricing?.basePrice || 0
        }));

        console.log('🗺️ MapScreen: Sending', markersData.length, 'markers to map');
        console.log('First marker sample:', markersData[0]);

        // Small delay to ensure WebView is ready
        setTimeout(() => {
          webViewRef.current.injectJavaScript(`
            updateMarkers(${JSON.stringify(markersData)});
            true;
          `);
        }, 500);
      }
    }
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
        matches = matches && (
          venue.name.toLowerCase().includes(query) ||
          getVenueAddress(venue).toLowerCase().includes(query)
        );
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

    setFilteredVenues(filtered);
  };

  useEffect(() => {
    filterVenues();
  }, [searchQuery, reduxFilters, venuesWithValidCoords]);

  const handleSearchChange = (query) => {
    setSearchQuery(query);
  };

  const centerOnUserLocation = () => {
    if (location && webViewRef.current) {
      webViewRef.current.injectJavaScript(`
        map.setView([${location.latitude}, ${location.longitude}], 15);
        true;
      `);
    }
  };

  const handleMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      if (data.type === 'markerClick') {
        const venue = filteredVenues.find(v => v.id === data.venueId);
        if (venue) {
          setSelectedVenue(venue);
        }
      }
    } catch (error) {
      console.error('Error handling message:', error);
    }
  };

  const handleVenueCardPress = (venue) => {
    navigation.navigate('TurfDetail', { turf: venue });
  };

  // Generate Leaflet HTML
  const generateMapHTML = () => {
    const userLat = location?.latitude || 31.5204;
    const userLng = location?.longitude || 74.3587;

    return `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    body { margin: 0; padding: 0; }
    #map { height: 100vh; width: 100vw; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map = L.map('map').setView([${userLat}, ${userLng}], 13);
    
    // Using Stadia Maps Alidade Smooth for English labels
    L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
      maxZoom: 20
    }).addTo(map);

    var markers = {};
    var userMarker = null;

    ${location ? `
    userMarker = L.marker([${location.latitude}, ${location.longitude}], {
      icon: L.divIcon({
        className: 'user-location-marker',
        html: '<div style="background: ${theme.colors.primary}; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.3);"></div>',
        iconSize: [22, 22]
      })
    }).addTo(map);
    ` : ''}

    function updateMarkers(venuesData) {
      console.log('Updating markers with', venuesData.length, 'venues');
      
      // Clear existing markers
      Object.values(markers).forEach(marker => map.removeLayer(marker));
      markers = {};

      // Add new markers
      venuesData.forEach(venue => {
        console.log('Adding marker for:', venue.name, 'at', venue.lat, venue.lng);
        
        var marker = L.marker([venue.lat, venue.lng], {
          icon: L.divIcon({
            className: 'venue-marker',
            html: '<div style="background: ${theme.colors.primary}; color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 3px 10px rgba(0,0,0,0.4); font-size: 18px; font-weight: bold;">📍</div>',
            iconSize: [38, 38],
            iconAnchor: [19, 38]
          })
        }).addTo(map);

        marker.bindPopup(\`
          <div style="min-width: 180px; padding: 8px;">
            <h3 style="margin: 0 0 10px 0; color: ${theme.colors.primary}; font-size: 16px; font-weight: bold;">\${venue.name}</h3>
            <p style="margin: 6px 0; font-size: 14px;"><strong>Rating:</strong> ⭐ \${venue.rating}</p>
            <p style="margin: 6px 0; font-size: 14px;"><strong>Price:</strong> Rs. \${venue.price}/hr</p>
            <p style="margin: 8px 0 0 0; font-size: 12px; color: #666;">Tap marker to view details</p>
          </div>
        \`, {
          maxWidth: 250,
          closeButton: true
        });

        marker.on('click', function() {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'markerClick',
            venueId: venue.id
          }));
        });

        markers[venue.id] = marker;
      });
      
      console.log('Total markers added:', Object.keys(markers).length);
      
      // Fit map to show all markers if there are any
      if (venuesData.length > 0) {
        var bounds = L.latLngBounds(venuesData.map(v => [v.lat, v.lng]));
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
      }
    }
  </script>
</body>
</html>
    `;
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

      {/* Leaflet Map */}
      <WebView
        ref={webViewRef}
        source={{ html: generateMapHTML() }}
        style={styles.map}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
      />

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
      {loading && (
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
