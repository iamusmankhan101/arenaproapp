import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Alert, TouchableOpacity, Dimensions, Image } from 'react-native';
import { Text, Card, FAB, Searchbar, Chip } from 'react-native-paper';
import MapView, { Marker, PROVIDER_GOOGLE, Callout } from 'react-native-maps';
import * as Location from 'expo-location';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNearbyTurfs } from '../../store/slices/turfSlice';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../theme/theme';

const { width } = Dimensions.get('window');

export default function MapScreen({ navigation }) {
  const [location, setLocation] = useState(null);
  const [region, setRegion] = useState({
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
  
  const mapRef = useRef(null);
  const dispatch = useDispatch();
  const { nearbyTurfs } = useSelector(state => state.turf);
  const theme = useTheme();

  const sportFilters = ['All', 'Football', 'Cricket', 'Padel', 'Tennis'];

  useEffect(() => {
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
  }, [searchQuery, selectedSport, nearbyTurfs]);

  // Helper function to get full address from venue data
  const getVenueAddress = (venue) => {
    const addressParts = [];
    if (venue.address) addressParts.push(venue.address);
    if (venue.area && venue.area !== venue.address) addressParts.push(venue.area);
    if (venue.city) addressParts.push(venue.city);
    return addressParts.join(', ') || 'Address not available';
  };

  // Helper function to get venue coordinates with fallback
  const getVenueCoordinates = (venue) => {
    // Use main coordinates if available
    if (venue.latitude && venue.longitude) {
      return {
        latitude: venue.latitude,
        longitude: venue.longitude
      };
    }
    
    // Fallback to location object coordinates if main coordinates are missing
    if (venue.location && venue.location.latitude && venue.location.longitude) {
      return {
        latitude: venue.location.latitude,
        longitude: venue.location.longitude
      };
    }
    
    // Default fallback coordinates (Karachi center)
    return {
      latitude: 24.8607,
      longitude: 67.0011
    };
  };

  const filterVenues = () => {
    let filtered = nearbyTurfs;

    if (searchQuery) {
      filtered = filtered.filter(venue => {
        const nameMatch = venue.name.toLowerCase().includes(searchQuery.toLowerCase());
        const sportsMatch = venue.sports && venue.sports.some(sport => 
          sport.toLowerCase().includes(searchQuery.toLowerCase())
        );
        const addressMatch = getVenueAddress(venue).toLowerCase().includes(searchQuery.toLowerCase());
        return nameMatch || sportsMatch || addressMatch;
      });
    }

    if (selectedSport !== 'All') {
      filtered = filtered.filter(venue => 
        venue.sports && venue.sports.includes(selectedSport)
      );
    }

    setFilteredVenues(filtered);
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required to show nearby venues');
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      const newRegion = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };
      
      setLocation(currentLocation.coords);
      setRegion(newRegion);
      
      // Animate to user location
      if (mapRef.current) {
        mapRef.current.animateToRegion(newRegion, 1000);
      }
      
      dispatch(fetchNearbyTurfs({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        radius: 10
      }));
    } catch (error) {
      Alert.alert('Error', 'Could not get current location');
    }
  };

  const handleMarkerPress = (venue) => {
    setSelectedVenue(venue);
    // Center map on selected venue
    if (mapRef.current) {
      const coordinates = getVenueCoordinates(venue);
      mapRef.current.animateToRegion({
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 1000);
    }
  };

  const handleVenueSelect = (venue) => {
    navigation.navigate('TurfDetail', { turfId: venue.id });
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

  const zoomToFitMarkers = () => {
    if (mapRef.current && filteredVenues.length > 0) {
      mapRef.current.fitToCoordinates(
        filteredVenues.map(venue => getVenueCoordinates(venue)),
        {
          edgePadding: { top: 100, right: 50, bottom: 100, left: 50 },
          animated: true,
        }
      );
    }
  };

  return (
    <View style={styles.container}>
      {/* Search and Filter Header */}
      <View style={styles.headerContainer}>
        <Searchbar
          placeholder="Search venues or sports..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          inputStyle={styles.searchInput}
          iconColor="#666"
        />
        
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <MaterialIcons name="filter-list" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Sport Filters */}
      {showFilters && (
        <View style={styles.filtersContainer}>
          <Text style={styles.filterTitle}>Filter by Sport:</Text>
          <View style={styles.chipContainer}>
            {sportFilters.map((sport) => (
                <Chip
                  key={sport}
                  selected={selectedSport === sport}
                  onPress={() => setSelectedSport(sport)}
                  style={[
                    styles.sportChip,
                    selectedSport === sport && { backgroundColor: theme.colors.primary }
                  ]}
                  textStyle={[
                    styles.chipText,
                    selectedSport === sport && styles.selectedChipText
                  ]}
                >
                  {sport}
                </Chip>
            ))}
          </View>
        </View>
      )}

      {/* Map */}
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        region={region}
        onRegionChangeComplete={setRegion}
        showsUserLocation={true}
        showsMyLocationButton={false}
        mapType="standard"
      >
        {filteredVenues.map((venue) => {
          const coordinates = getVenueCoordinates(venue);
          return (
            <Marker
              key={venue.id}
              coordinate={coordinates}
              pinColor={getMarkerColor(venue)}
              onPress={() => handleMarkerPress(venue)}
            >
              <Callout onPress={() => handleVenueSelect(venue)}>
                <View style={styles.calloutContainer}>
                  <Text style={styles.calloutTitle}>{venue.name}</Text>
                  <Text style={styles.calloutAddress}>{getVenueAddress(venue)}</Text>
                  <Text style={styles.calloutPrice}>PKR {venue.pricePerHour || venue.basePrice || 'N/A'}/hr</Text>
                  <View style={styles.calloutRating}>
                    <MaterialIcons name="star" size={14} color="#FFD700" />
                    <Text style={styles.calloutRatingText}>{venue.rating || '4.0'}</Text>
                  </View>
                  <Text style={[
                    styles.calloutAvailability,
                    { color: venue.openNow && venue.availableSlots > 0 ? '#4CAF50' : '#F44336' }
                  ]}>
                    {getAvailabilityText(venue)}
                  </Text>
                  <Text style={styles.calloutSports}>
                    {venue.sports ? venue.sports.join(' • ') : 'Sports info not available'}
                  </Text>
                </View>
              </Callout>
            </Marker>
          );
        })}
      </MapView>

      {/* Selected Venue Card */}
      {selectedVenue && (
        <Card style={styles.venueCard}>
          <TouchableOpacity onPress={() => handleVenueSelect(selectedVenue)}>
            <View style={styles.venueCardContent}>
              <Image source={selectedVenue.image} style={styles.venueImage} />
              <View style={styles.venueInfo}>
                <Text style={styles.venueName}>{selectedVenue.name}</Text>
                <Text style={styles.venueAddress}>{getVenueAddress(selectedVenue)}</Text>
                <View style={styles.venueDetails}>
                  <View style={styles.venueRating}>
                    <MaterialIcons name="star" size={16} color="#FFD700" />
                    <Text style={styles.venueRatingText}>{selectedVenue.rating || '4.0'}</Text>
                  </View>
                  <Text style={styles.venueDistance}>{selectedVenue.distance || 'Distance N/A'}</Text>
                </View>
                <Text style={styles.venuePrice}>PKR {selectedVenue.pricePerHour || selectedVenue.basePrice || 'N/A'}/hr</Text>
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
                <MaterialIcons name="close" size={20} color="#666" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Card>
      )}

      {/* Action Buttons */}
      <FAB
        icon="target"
        style={[styles.locationFab, { backgroundColor: theme.colors.primary }]}
        onPress={getCurrentLocation}
      />

      <FAB
        icon="fullscreen"
        style={styles.zoomFab}
        onPress={zoomToFitMarkers}
      />

      <FAB
        icon="menu"
        style={styles.listFab}
        onPress={() => navigation.navigate('VenueList')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: 60,
    paddingBottom: 10,
    backgroundColor: 'white',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchBar: {
    flex: 1,
    marginRight: 10,
    elevation: 0,
    backgroundColor: '#F5F5F5',
  },
  searchInput: {
    fontSize: 14,
  },
  filterButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
  },
  filtersContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 15,
    paddingBottom: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  filterTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sportChip: {
    backgroundColor: '#F5F5F5',
    marginRight: 0,
  },
  selectedChip: {
    backgroundColor: '#004d43',
  },
  chipText: {
    color: '#666',
    fontSize: 12,
  },
  selectedChipText: {
    color: 'white',
  },
  map: {
    flex: 1,
  },
  calloutContainer: {
    width: 220,
    padding: 12,
  },
  calloutTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  calloutAddress: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
    fontStyle: 'italic',
  },
  calloutPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#004d43',
    marginBottom: 4,
  },
  calloutRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  calloutRatingText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  calloutAvailability: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  calloutSports: {
    fontSize: 11,
    color: '#666',
  },
  venueCard: {
    position: 'absolute',
    bottom: 20,
    left: 15,
    right: 15,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  venueCardContent: {
    flexDirection: 'row',
    padding: 15,
    alignItems: 'center',
  },
  venueImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 15,
  },
  venueInfo: {
    flex: 1,
  },
  venueName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  venueAddress: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    fontStyle: 'italic',
  },
  venueDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  venueRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  venueRatingText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  venueDistance: {
    fontSize: 12,
    color: '#666',
  },
  venuePrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#004d43',
    marginBottom: 2,
  },
  venueAvailability: {
    fontSize: 12,
    fontWeight: '500',
  },
  closeButton: {
    padding: 8,
  },
  locationFab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 160,
  },
  zoomFab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 100,
    backgroundColor: '#1976D2',
  },
  listFab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 40,
    backgroundColor: '#FF9800',
  },
});