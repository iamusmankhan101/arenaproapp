import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Alert, TouchableOpacity, Dimensions, Image } from 'react-native';
import { Text, Card, Button, FAB, Searchbar, Chip } from 'react-native-paper';
import MapView, { Marker, PROVIDER_GOOGLE, Callout } from 'react-native-maps';
import * as Location from 'expo-location';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNearbyTurfs } from '../../store/slices/turfSlice';
import { MaterialIcons } from '@expo/vector-icons';
import { Icon } from '../../components/Icons';

const { width, height } = Dimensions.get('window');

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
  const [venues, setVenues] = useState([]);
  
  const mapRef = useRef(null);
  const dispatch = useDispatch();
  const { nearbyTurfs } = useSelector(state => state.turf);

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
    // Update venues when nearbyTurfs changes
    setVenues(nearbyTurfs);
  }, [nearbyTurfs]);

  useEffect(() => {
    filterVenues();
  }, [searchQuery, selectedSport, venues]);

  const filterVenues = () => {
    let filtered = venues;

    if (searchQuery) {
      filtered = filtered.filter(venue => 
        venue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        venue.sports.some(sport => sport.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (selectedSport !== 'All') {
      filtered = filtered.filter(venue => 
        venue.sports.includes(selectedSport)
      );
    }

    setVenues(filtered);
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
      mapRef.current.animateToRegion({
        latitude: venue.latitude,
        longitude: venue.longitude,
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
    if (mapRef.current && venues.length > 0) {
      mapRef.current.fitToCoordinates(
        venues.map(venue => ({
          latitude: venue.latitude,
          longitude: venue.longitude
        })),
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
          <Icon name="filter-list" size={24} color="#229a60" />
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
                  selectedSport === sport && styles.selectedChip
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
        {venues.map((venue) => (
          <Marker
            key={venue.id}
            coordinate={{
              latitude: venue.latitude,
              longitude: venue.longitude,
            }}
            pinColor={getMarkerColor(venue)}
            onPress={() => handleMarkerPress(venue)}
          >
            <Callout onPress={() => handleVenueSelect(venue)}>
              <View style={styles.calloutContainer}>
                <Text style={styles.calloutTitle}>{venue.name}</Text>
                <Text style={styles.calloutPrice}>PKR {venue.pricePerHour}/hr</Text>
                <View style={styles.calloutRating}>
                  <Icon name="star" size={14} color="#FFD700" />
                  <Text style={styles.calloutRatingText}>{venue.rating}</Text>
                </View>
                <Text style={[
                  styles.calloutAvailability,
                  { color: venue.openNow && venue.availableSlots > 0 ? '#4CAF50' : '#F44336' }
                ]}>
                  {getAvailabilityText(venue)}
                </Text>
                <Text style={styles.calloutSports}>
                  {venue.sports.join(' • ')}
                </Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      {/* Selected Venue Card */}
      {selectedVenue && (
        <Card style={styles.venueCard}>
          <TouchableOpacity onPress={() => handleVenueSelect(selectedVenue)}>
            <View style={styles.venueCardContent}>
              <Image source={selectedVenue.image} style={styles.venueImage} />
              <View style={styles.venueInfo}>
                <Text style={styles.venueName}>{selectedVenue.name}</Text>
                <View style={styles.venueDetails}>
                  <View style={styles.venueRating}>
                    <Icon name="star" size={16} color="#FFD700" />
                    <Text style={styles.venueRatingText}>{selectedVenue.rating}</Text>
                  </View>
                  <Text style={styles.venueDistance}>{selectedVenue.distance}</Text>
                </View>
                <Text style={styles.venuePrice}>PKR {selectedVenue.pricePerHour}/hr</Text>
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
                <Icon name="close" size={20} color="#666" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Card>
      )}

      {/* Action Buttons */}
      <FAB
        icon="target"
        style={styles.locationFab}
        onPress={getCurrentLocation}
        small
      />

      <FAB
        icon="fullscreen"
        style={styles.zoomFab}
        onPress={zoomToFitMarkers}
        small
      />

      <FAB
        icon="menu"
        style={styles.listFab}
        onPress={() => navigation.navigate('VenueList')}
        small
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
    backgroundColor: '#229a60',
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
    width: 200,
    padding: 10,
  },
  calloutTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  calloutPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#229a60',
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
    marginBottom: 4,
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
    color: '#229a60',
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
    backgroundColor: '#229a60',
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