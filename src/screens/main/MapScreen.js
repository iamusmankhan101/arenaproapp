import { useEffect, useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  StatusBar,
  ScrollView,
  Dimensions,
  Image,
} from 'react-native';
import {
  Text,
  Card,
  FAB,
  Searchbar,
  ActivityIndicator,
} from 'react-native-paper';
import { WebView } from 'react-native-webview';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNearbyTurfs } from '../../store/slices/turfSlice';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../theme/theme';
import FilterModal from '../../components/FilterModal';

const { width } = Dimensions.get('window');

export default function MapScreen({ navigation }) {
  const [location, setLocation] = useState(null);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filteredVenues, setFilteredVenues] = useState([]);
  const { filters: reduxFilters } = useSelector(state => state.turf);
  const [venuesWithValidCoords, setVenuesWithValidCoords] = useState([]);
  const [mapReady, setMapReady] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const insets = useSafeAreaInsets();

  const webViewRef = useRef(null);
  const scrollViewRef = useRef(null);
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
    console.log('🔄 MapScreen: useEffect triggered');
    console.log('   - nearbyTurfs.length:', nearbyTurfs.length);
    console.log('   - location:', location ? 'Available' : 'Not available');
    console.log('   - mapReady:', mapReady);

    if (nearbyTurfs.length > 0) {
      console.log('📍 MapScreen: Processing', nearbyTurfs.length, 'venues for map display');
      console.log('   First venue sample:', nearbyTurfs[0]);
      
      const validVenues = processVenuesCoordinates(nearbyTurfs);
      console.log('✅ MapScreen: Found', validVenues.length, 'venues with valid coordinates');
      
      if (validVenues.length > 0) {
        console.log('   First valid venue:', validVenues[0]);
      }
      
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

      console.log('📊 MapScreen: Setting venuesWithValidCoords:', venuesWithDistances.length);
      console.log('📊 MapScreen: Setting filteredVenues:', venuesWithDistances.length);
      
      setVenuesWithValidCoords(venuesWithDistances);
      setFilteredVenues(venuesWithDistances);

      // Update map markers
      if (webViewRef.current && venuesWithDistances.length > 0 && mapReady) {
        const markersData = venuesWithDistances.map(v => ({
          id: v.id,
          lat: v.coordinates.latitude,
          lng: v.coordinates.longitude,
          name: v.name,
          rating: v.rating || 0,
          price: v.pricePerHour || v.pricing?.basePrice || 0
        }));

        console.log('🗺️ MapScreen: Sending', markersData.length, 'markers to map');
        console.log('   First marker sample:', markersData[0]);

        // Small delay to ensure WebView is ready
        setTimeout(() => {
          if (webViewRef.current) {
            webViewRef.current.injectJavaScript(`
              if (typeof updateMarkers === 'function') {
                updateMarkers(${JSON.stringify(markersData)});
              } else {
                console.log('updateMarkers function not ready yet');
              }
              true;
            `);
          }
        }, 1000);
      }
    } else {
      console.log('⚠️ MapScreen: No venues in nearbyTurfs array');
    }
  }, [nearbyTurfs, location, mapReady]);

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
        const venueIndex = filteredVenues.findIndex(v => v.id === data.venueId);
        if (venueIndex !== -1) {
          // Scroll to the corresponding card
          scrollToCard(venueIndex);
          setCurrentCardIndex(venueIndex);
        }
      }
    } catch (error) {
      console.error('Error handling message:', error);
    }
  };

  const handleVenueCardPress = (venue) => {
    if (!venue || !venue.id) {
      console.error('❌ Cannot navigate: venue or venue.id is undefined', venue);
      return;
    }
    console.log('📍 Navigating to venue:', venue.id, venue.name);
    navigation.navigate('TurfDetail', { turfId: venue.id });
  };

  const handleFavoritePress = (venue) => {
    console.log('❤️ Favorite pressed for:', venue.name);
    // TODO: Implement favorite toggle
  };

  // Handle scroll to sync with map
  const handleScroll = (event) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const cardWidth = 280 + 16; // card width + margin
    const index = Math.round(scrollPosition / cardWidth);
    
    if (index !== currentCardIndex && index >= 0 && index < filteredVenues.length) {
      setCurrentCardIndex(index);
      const venue = filteredVenues[index];
      
      // Center map on the venue
      if (webViewRef.current && venue.coordinates && mapReady) {
        console.log('📍 Centering map on:', venue.name);
        webViewRef.current.injectJavaScript(`
          if (map) {
            map.setView([${venue.coordinates.latitude}, ${venue.coordinates.longitude}], 15, {
              animate: true,
              duration: 0.5
            });
          }
          true;
        `);
      }
    }
  };

  // Scroll to specific card
  const scrollToCard = (index) => {
    if (scrollViewRef.current && index >= 0 && index < filteredVenues.length) {
      const cardWidth = 280 + 16;
      scrollViewRef.current.scrollTo({
        x: index * cardWidth,
        animated: true
      });
    }
  };

  // Generate Leaflet HTML
  const generateMapHTML = () => {
    const userLat = location?.latitude || 31.5204;
    const userLng = location?.longitude || 74.3587;

    console.log('🗺️ MapScreen: Generating map HTML with center:', userLat, userLng);

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
    var map = L.map('map', {
      zoomControl: false
    }).setView([${userLat}, ${userLng}], 13);
    
    // Using CartoDB Voyager for English labels (free, no API key required)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(map);

    var markers = {};
    var userMarker = null;
    var radiusCircle = null;

    ${location ? `
    // Add radius circle with Arena Pro primary color
    radiusCircle = L.circle([${location.latitude}, ${location.longitude}], {
      color: '#004d43',
      fillColor: '#004d43',
      fillOpacity: 0.1,
      radius: 2000,
      weight: 2
    }).addTo(map);

    // Add user location marker with Arena Pro primary color
    userMarker = L.marker([${location.latitude}, ${location.longitude}], {
      icon: L.divIcon({
        className: 'user-location-marker',
        html: '<div style="background: #004d43; width: 20px; height: 20px; border-radius: 50%; border: 4px solid white; box-shadow: 0 2px 8px rgba(0,77,67,0.4); position: relative;"><div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 8px; height: 8px; background: white; border-radius: 50%;"></div></div>',
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      })
    }).addTo(map);
    ` : ''}

    function updateMarkers(venuesData) {
      console.log('Updating markers with', venuesData.length, 'venues');
      
      // Clear existing markers
      Object.values(markers).forEach(marker => map.removeLayer(marker));
      markers = {};

      // Add new markers with Arena Pro brand colors
      venuesData.forEach(venue => {
        console.log('Adding marker for:', venue.name, 'at', venue.lat, venue.lng);
        
        var marker = L.marker([venue.lat, venue.lng], {
          icon: L.divIcon({
            className: 'venue-marker',
            html: '<div style="background: #004d43; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid #e8ee26; box-shadow: 0 3px 12px rgba(0,77,67,0.5); position: relative;"><div style="width: 12px; height: 12px; background: #e8ee26; border-radius: 50%;"></div></div>',
            iconSize: [38, 38],
            iconAnchor: [19, 38]
          })
        }).addTo(map);

        marker.bindPopup(\`
          <div style="min-width: 200px; padding: 10px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            <h3 style="margin: 0 0 12px 0; color: #004d43; font-size: 17px; font-weight: 700;">\${venue.name}</h3>
            <p style="margin: 8px 0; font-size: 14px; color: #666;"><strong>Rating:</strong> ⭐ \${venue.rating ? venue.rating.toFixed(1) : 'New'}</p>
            <p style="margin: 8px 0; font-size: 14px; color: #666;"><strong>Price:</strong> Rs. \${venue.price}/hr</p>
            <p style="margin: 10px 0 0 0; font-size: 12px; color: #999;">Tap marker to view details</p>
          </div>
        \`, {
          maxWidth: 260,
          closeButton: true,
          className: 'custom-popup'
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
        ${location ? `bounds.extend([${location.latitude}, ${location.longitude}]);` : ''}
        map.fitBounds(bounds, { padding: [60, 60], maxZoom: 14 });
      }
    }
  </script>
</body>
</html>
    `;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Search Bar with Filter Button */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search Venues"
          onChangeText={handleSearchChange}
          value={searchQuery}
          style={styles.searchBar}
          inputStyle={styles.searchInput}
          iconColor="#999"
          placeholderTextColor="#999"
          icon="magnify"
        />
        <TouchableOpacity
          style={styles.filterIconButton}
          onPress={() => setShowFilters(true)}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="tune-variant" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Leaflet Map */}
      <WebView
        ref={webViewRef}
        source={{ html: generateMapHTML() }}
        style={styles.map}
        onMessage={handleMessage}
        onLoad={() => {
          console.log('✅ MapScreen: WebView loaded');
          setMapReady(true);
        }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
      />

      {/* FAB - Center on User Location */}
      {hasLocationPermission && location && (
        <FAB
          icon="crosshairs-gps"
          style={[styles.locationFab, { bottom: insets.bottom + 245 }]}
          onPress={centerOnUserLocation}
          color={theme.colors.secondary}
          size="small"
        />
      )}

      {/* Horizontal Scrollable Venue List - Recommended Style */}
      {filteredVenues.length > 0 && (
        <View style={[styles.venueListContainer, { bottom: insets.bottom - 30 }]}>
          <ScrollView
            ref={scrollViewRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.venueListContent}
            pagingEnabled={false}
            decelerationRate="fast"
            snapToInterval={296} // 280 (card width) + 16 (margin)
            snapToAlignment="start"
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            {filteredVenues.map((venue, index) => (
              <TouchableOpacity
                key={venue.id}
                style={[
                  styles.venueCard,
                  currentCardIndex === index && styles.venueCardActive
                ]}
                onPress={() => handleVenueCardPress(venue)}
                activeOpacity={0.9}
              >
                <Image
                  source={
                    venue.images?.[0]
                      ? { uri: venue.images[0] }
                      : require('../../images/football.jpg')
                  }
                  style={styles.venueImage}
                  resizeMode="cover"
                />

                {/* Glass overlay for info */}
                <View style={styles.venueInfoGlass}>
                  {/* Blur simulation layer */}
                  <View style={styles.blurLayer} />
                  <View style={styles.venueInfo}>
                    <View style={styles.venueHeader}>
                      <View style={styles.ratingContainer}>
                        <MaterialIcons name="star" size={16} color="#FFD700" />
                        <Text style={styles.ratingText}>
                          {venue.rating ? venue.rating.toFixed(1) : 'New'}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.venueName} numberOfLines={1}>
                      {venue.name}
                    </Text>

                    <View style={styles.venueLocation}>
                      <MaterialIcons
                        name="location-on"
                        size={14}
                        color="#999"
                      />
                      <Text style={styles.venueLocationText} numberOfLines={1}>
                        {venue.city || venue.area || 'Lahore'}, Pakistan
                      </Text>
                      {venue.distance && (
                        <Text style={styles.venueDistance}>
                          • {venue.distance}
                        </Text>
                      )}
                    </View>

                    <View style={styles.venuePriceContainer}>
                      {(venue.discount || venue.discountPercentage) && (
                        <Text style={styles.venueOriginalPrice}>
                          PKR {venue.pricePerHour || venue.pricing?.basePrice || 1500}
                        </Text>
                      )}
                      <Text style={styles.venuePrice}>
                        PKR {(venue.discount || venue.discountPercentage)
                          ? Math.round((venue.pricePerHour || venue.pricing?.basePrice || 1500) * (1 - (venue.discount || venue.discountPercentage) / 100))
                          : (venue.pricePerHour || venue.pricing?.basePrice || 1500)}
                        <Text style={styles.priceUnit}> /hour</Text>
                      </Text>
                    </View>
                  </View>
                </View>

                <TouchableOpacity 
                  style={styles.favoriteButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    handleFavoritePress(venue);
                  }}
                >
                  <MaterialIcons 
                    name={venue.isFavorite ? "favorite" : "favorite-border"} 
                    size={20} 
                    color={theme.colors.primary} 
                  />
                </TouchableOpacity>

                {(venue.discount || venue.discountPercentage) && (
                  <View style={styles.discountBadge}>
                    <Text style={styles.discountText}>
                      {venue.discount || venue.discountPercentage}% Off
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Selected Venue Popup Card (if needed) */}
      {selectedVenue && (
        <Animated.View
          style={[
            styles.popupCard,
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
                  <Text style={styles.selectedVenueName}>{selectedVenue.name}</Text>
                  <TouchableOpacity onPress={() => setSelectedVenue(null)}>
                    <MaterialIcons name="close" size={24} color="#666" />
                  </TouchableOpacity>
                </View>

                <View style={styles.selectedVenueInfo}>
                  <MaterialIcons name="location-on" size={16} color="#666" />
                  <Text style={styles.selectedVenueAddress} numberOfLines={1}>
                    {getVenueAddress(selectedVenue)}
                  </Text>
                </View>

                {selectedVenue.distance && (
                  <View style={styles.selectedVenueInfo}>
                    <MaterialIcons name="directions" size={16} color="#666" />
                    <Text style={styles.selectedVenueDistance}>{selectedVenue.distance} away</Text>
                  </View>
                )}

                <View style={styles.selectedVenueFooter}>
                  <View style={styles.rating}>
                    <MaterialIcons name="star" size={16} color="#FFD700" />
                    <Text style={styles.ratingText}>
                      {selectedVenue.rating ? selectedVenue.rating.toFixed(1) : 'New'}
                    </Text>
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
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingTop: 16,
  },
  searchContainer: {
    position: 'absolute',
    top: 56,
    left: 16,
    right: 16,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchBar: {
    flex: 1,
    elevation: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    height: 50,
  },
  searchInput: {
    fontSize: 15,
    color: '#333',
  },
  filterIconButton: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  map: {
    flex: 1,
  },
  locationFab: {
    position: 'absolute',
    right: 16,
    backgroundColor: theme.colors.primary,
    elevation: 4,
    zIndex: 10,
  },
  venueListContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    paddingVertical: 16,
    paddingBottom: 25,
  },
  venueListContent: {
    paddingHorizontal: 16,
  },
  venueCard: {
    width: 280,
    height: 200,
    borderRadius: 16,
    marginRight: 16,
    overflow: 'hidden',
    backgroundColor: '#FFF',
    elevation: 4,
    
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    marginBottom:9,
  },
  venueCardActive: {
    elevation: 8,
    shadowOpacity: 0.2,
    shadowRadius: 12,
    transform: [{ scale: 1.02 }],
  },
  venueImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  venueInfoGlass: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 130,
    overflow: 'hidden',
  },
  blurLayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    backdropFilter: 'blur(10px)',
  },
  venueInfo: {
    padding: 10,
    position: 'relative',
    zIndex: 1,
  },
  venueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    fontFamily: 'Montserrat_600SemiBold',
  },
  venueName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 4,
    fontFamily: 'Montserrat_700Bold',
  },
  venueLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  venueLocationText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
    flex: 1,
    fontFamily: 'Montserrat_400Regular',
  },
  venueDistance: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
    fontFamily: 'Montserrat_400Regular',
  },
  venuePriceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  venueOriginalPrice: {
    fontSize: 12,
    color: '#999',
    textDecorationLine: 'line-through',
    fontFamily: 'Montserrat_400Regular',
  },
  venuePrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.primary,
    fontFamily: 'Montserrat_700Bold',
  },
  priceUnit: {
    fontSize: 12,
    fontWeight: 'normal',
    color: '#666',
    fontFamily: 'Montserrat_400Regular',
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  discountBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  discountText: {
    color: theme.colors.secondary,
    fontSize: 11,
    fontWeight: 'bold',
    fontFamily: 'ClashDisplay-Medium',
  },
  popupCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  card: {
    elevation: 8,
    borderRadius: 16,
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
  selectedVenueName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.primary,
    flex: 1,
  },
  selectedVenueInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  selectedVenueAddress: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
    flex: 1,
  },
  selectedVenueDistance: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  selectedVenueFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
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
