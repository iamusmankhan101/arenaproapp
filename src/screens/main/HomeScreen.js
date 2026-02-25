import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  StatusBar,
  SafeAreaView,
  Platform
} from 'react-native';
import { Text, Searchbar } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import * as Location from 'expo-location';
import { fetchNearbyTurfs } from '../../store/slices/turfSlice';
import { theme } from '../../theme/theme';
import TurfCard from '../../components/TurfCard';
import FilterModal from '../../components/FilterModal';
import ReferralModal from '../../components/ReferralModal';

const { width } = Dimensions.get('window');

// Default venue images by sport
const getVenueImageBySport = (venue) => {
  let primarySport = 'Football'; // default

  if (Array.isArray(venue.sports) && venue.sports.length > 0) {
    primarySport = venue.sports[0];
  } else if (typeof venue.sports === 'string' && venue.sports.trim()) {
    primarySport = venue.sports.split(',')[0].trim();
  } else if (venue.sport) {
    primarySport = venue.sport;
  }

  console.log(`🖼️ getVenueImageBySport for ${venue.name}: sports=${JSON.stringify(venue.sports)}, primarySport=${primarySport}`);

  const sportImages = {
    'Cricket': require('../../images/cricket.jpg'),
    'Football': require('../../images/football.jpg'),
    'Futsal': require('../../images/football.jpg'),
    'Padel': require('../../images/padel.jpg'),
    'Basketball': require('../../images/football.jpg'),
    'Tennis': require('../../images/padel.jpg'),
  };
  return sportImages[primarySport] || require('../../images/football.jpg');
};

// Sports categories with icons
const sportsCategories = [
  { id: 1, name: 'Cricket', icon: 'sports-cricket' },
  { id: 2, name: 'Futsal', icon: 'sports-soccer' },
  { id: 3, name: 'Padel', icon: 'sports-tennis' },
];

export default function HomeScreen({ navigation }) {
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSport, setSelectedSport] = useState(null);
  const [userLocation, setUserLocation] = useState('Lahore, Pakistan');
  const [userCoords, setUserCoords] = useState({ latitude: 31.5204, longitude: 74.3587 });
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [referralModalVisible, setReferralModalVisible] = useState(false);
  
  const { nearbyTurfs, loading } = useSelector(state => state.turf);
  const { user } = useSelector(state => state.auth);
  const { userBookings } = useSelector(state => state.booking);

  // Get user location on mount
  useEffect(() => {
    const getUserLocation = async () => {
      try {
        const { status } = await Location.getForegroundPermissionsAsync();
        if (status === 'granted') {
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          setUserCoords({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
        }
      } catch (error) {
        console.log('Error getting location:', error);
      }
    };
    getUserLocation();
  }, []);

  // Load venues and bookings on screen focus
  useFocusEffect(
    React.useCallback(() => {
      dispatch(fetchNearbyTurfs({
        latitude: userCoords.latitude,
        longitude: userCoords.longitude,
        radius: 50000 // 50km to get all venues, then filter by distance
      }));
      
      // Fetch user bookings to check eligibility for referral
      if (user) {
        const { fetchUserBookings } = require('../../store/slices/bookingSlice');
        dispatch(fetchUserBookings());
      }
    }, [dispatch, userCoords, user])
  );

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers
  };

  // Get venue coordinates
  const getVenueCoords = (venue) => {
    if (venue.latitude && venue.longitude) {
      return { latitude: venue.latitude, longitude: venue.longitude };
    }
    if (venue.location?.latitude && venue.location?.longitude) {
      return { latitude: venue.location.latitude, longitude: venue.location.longitude };
    }
    return null;
  };

  // Filter venues by selected sport and calculate distances
  const getFilteredVenues = () => {
    let filtered = nearbyTurfs;

    // Filter by sport if selected
    if (selectedSport) {
      filtered = filtered.filter(venue => {
        const venueSports = Array.isArray(venue.sports) 
          ? venue.sports 
          : typeof venue.sports === 'string' && venue.sports.trim()
            ? venue.sports.split(',').map(s => s.trim())
            : [];
        return venueSports.includes(selectedSport);
      });
    }

    // Calculate distances and add to venue objects
    const venuesWithDistance = filtered.map(venue => {
      const coords = getVenueCoords(venue);
      if (coords) {
        const distance = calculateDistance(
          userCoords.latitude,
          userCoords.longitude,
          coords.latitude,
          coords.longitude
        );
        return { ...venue, distance, distanceKm: distance };
      }
      return { ...venue, distance: null, distanceKm: null };
    });

    // Sort by distance
    venuesWithDistance.sort((a, b) => {
      if (a.distanceKm === null) return 1;
      if (b.distanceKm === null) return -1;
      return a.distanceKm - b.distanceKm;
    });

    return venuesWithDistance;
  };

  const filteredVenues = getFilteredVenues();
  const recommendedVenues = filteredVenues.slice(0, 5);
  
  // Filter nearby venues to only show those within 10km
  const nearbyVenues = filteredVenues
    .filter(venue => venue.distanceKm !== null && venue.distanceKm <= 10)
    .slice(0, 10);

  // Format distance for display
  const formatDistance = (distanceKm) => {
    if (distanceKm === null || distanceKm === undefined) return '';
    if (distanceKm < 1) {
      return `${Math.round(distanceKm * 1000)}m`;
    }
    return `${distanceKm.toFixed(1)}km`;
  };

  const handleSportSelect = (sportName) => {
    setSelectedSport(selectedSport === sportName ? null : sportName);
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigation.navigate('VenueList', { searchQuery });
    }
  };

  const handleVenuePress = (venue) => {
    navigation.navigate('TurfDetail', { turfId: venue.id });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header with Location */}
        <View style={styles.header}>
          <View style={styles.locationContainer}>
            <Text style={styles.greetingText}>
              Hi, {String(user?.name || user?.displayName || 'Guest')}
            </Text>
            <Text style={styles.welcomeBackText}>Welcome back to Arena Pro</Text>
            <TouchableOpacity 
              style={styles.locationButton}
              onPress={() => navigation.navigate('ManualLocation')}
            >
              <MaterialIcons 
                name="location-on" 
                size={16} 
                color={theme.colors.primary} 
              />
              <Text style={styles.locationText}>{String(userLocation)}</Text>
              <MaterialIcons 
                name="keyboard-arrow-down" 
                size={16} 
                color={theme.colors.text} 
              />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            style={styles.notificationButton}
            onPress={() => navigation.navigate('Notification')}
          >
            <MaterialIcons 
              name="notifications-none" 
              size={28} 
              color={theme.colors.text} 
            />
            <View style={styles.notificationBadge} />
          </TouchableOpacity>
        </View>

        {/* Search Bar with Filter */}
        <View style={styles.searchContainer}>
          <Searchbar
            placeholder="Search venues..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
            inputStyle={styles.searchInput}
            onSubmitEditing={handleSearch}
            elevation={0}
            icon="magnify"
            iconColor={theme.colors.textSecondary}
          />
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => setFilterModalVisible(true)}
          >
            <MaterialIcons 
              name="tune" 
              size={24} 
              color={theme.colors.secondary} 
            />
          </TouchableOpacity>
        </View>

        {/* Sports Categories */}
        <View style={styles.categoriesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Sports Categories</Text>
          </View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesScroll}
          >
            {sportsCategories.map((sport) => (
              <TouchableOpacity
                key={sport.id}
                style={[
                  styles.categoryCard,
                  selectedSport === sport.name && styles.categoryCardActive
                ]}
                onPress={() => handleSportSelect(sport.name)}
              >
                <View style={[
                  styles.categoryIconContainer,
                  selectedSport === sport.name && styles.categoryIconContainerActive
                ]}>
                  <MaterialIcons 
                    name={sport.icon} 
                    size={32} 
                    color={selectedSport === sport.name ? theme.colors.primary : theme.colors.secondary} 
                  />
                </View>
                <Text style={[
                  styles.categoryName,
                  selectedSport === sport.name && styles.categoryNameActive
                ]}>
                  {sport.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Recommended Venues */}
        <View style={styles.venuesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recommended Venues</Text>
            <TouchableOpacity onPress={() => navigation.navigate('VenueList')}>
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading venues...</Text>
            </View>
          ) : recommendedVenues.length > 0 ? (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.venuesScroll}
            >
              {recommendedVenues.map((venue) => {
                const imageSource = venue.images?.[0] ? { uri: venue.images[0] } : getVenueImageBySport(venue);
                
                return (
                  <TouchableOpacity
                    key={venue.id}
                    style={styles.venueCard}
                    onPress={() => handleVenuePress(venue)}
                  >
                    <Image 
                      source={imageSource}
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
                            <Text style={styles.ratingText}>{String(venue.rating || 4.5)}</Text>
                          </View>
                        </View>
                        
                        <Text style={styles.venueName} numberOfLines={1}>
                          {String(venue.name || 'Venue')}
                        </Text>
                        
                        <View style={styles.venueLocation}>
                          <MaterialIcons 
                            name="location-on" 
                            size={14} 
                            color={theme.colors.textSecondary} 
                          />
                          <Text style={styles.venueLocationText} numberOfLines={1}>
                            {String(venue.city || 'Lahore')}, Pakistan
                          </Text>
                          {venue.distanceKm !== null && venue.distanceKm !== undefined && (
                            <Text style={styles.venueDistance}>
                              • {String(formatDistance(venue.distanceKm))}
                            </Text>
                          )}
                        </View>
                        
                        <View style={styles.venuePriceContainer}>
                          {(venue.discount || venue.discountPercentage) && (
                            <Text style={styles.venueOriginalPrice}>
                              PKR {String(venue.pricePerHour || venue.pricing?.basePrice || 1500)}
                            </Text>
                          )}
                          <Text style={styles.venuePrice}>
                            PKR {String((venue.discount || venue.discountPercentage) 
                              ? Math.round((venue.pricePerHour || venue.pricing?.basePrice || 1500) * (1 - (venue.discount || venue.discountPercentage) / 100))
                              : (venue.pricePerHour || venue.pricing?.basePrice || 1500))}
                            <Text style={styles.priceUnit}> /hour</Text>
                          </Text>
                        </View>
                      </View>
                    </View>

                    <TouchableOpacity style={styles.favoriteButton}>
                      <MaterialIcons name="favorite-border" size={20} color={theme.colors.primary} />
                    </TouchableOpacity>
                    
                    {(venue.discount || venue.discountPercentage) && (
                      <View style={styles.discountBadge}>
                        <Text style={styles.discountText}>{String(venue.discount || venue.discountPercentage)}% Off</Text>
                      </View>
                    )}
                </TouchableOpacity>
                );
              })}
            </ScrollView>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No venues found</Text>
            </View>
          )}
        </View>

        {/* Nearby Venues */}
        <View style={styles.venuesSection}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Text style={styles.sectionTitle}>Nearby Venues</Text>
              <Text style={styles.sectionSubtitle}>Within 10km radius</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('VenueList')}>
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          </View>

          {nearbyVenues.length > 0 ? (
            nearbyVenues.map((venue) => {
              const imageSource = venue.images?.[0] ? { uri: venue.images[0] } : getVenueImageBySport(venue);
              
              return (
                <TouchableOpacity
                  key={venue.id}
                  style={styles.nearbyVenueCard}
                  onPress={() => handleVenuePress(venue)}
                >
                  <Image 
                    source={imageSource}
                    style={styles.nearbyVenueImage}
                    resizeMode="cover"
                  />
                  
                  <View style={styles.nearbyVenueInfo}>
                  {(venue.discount || venue.discountPercentage) && (
                    <View style={styles.nearbyDiscountBadge}>
                      <Text style={styles.nearbyDiscountText}>{String(venue.discount || venue.discountPercentage)}% Off</Text>
                    </View>
                  )}
                  
                  <Text style={styles.nearbyVenueName} numberOfLines={1}>
                    {String(venue.name || 'Venue')}
                  </Text>
                  
                  <View style={styles.nearbyVenueLocation}>
                    <MaterialIcons 
                      name="location-on" 
                      size={14} 
                      color={theme.colors.textSecondary} 
                    />
                    <Text style={styles.nearbyVenueLocationText} numberOfLines={1}>
                      {String(venue.city || 'Lahore')}, Pakistan
                    </Text>
                    {venue.distanceKm !== null && venue.distanceKm !== undefined && (
                      <Text style={styles.nearbyVenueDistance}>
                        • {String(formatDistance(venue.distanceKm))}
                      </Text>
                    )}
                  </View>
                  
                  <View style={styles.nearbyVenuePriceContainer}>
                    {(venue.discount || venue.discountPercentage) && (
                      <Text style={styles.nearbyVenueOriginalPrice}>
                        PKR {String(venue.pricePerHour || venue.pricing?.basePrice || 1500)}
                      </Text>
                    )}
                    <Text style={styles.nearbyVenuePrice}>
                      PKR {String((venue.discount || venue.discountPercentage) 
                        ? Math.round((venue.pricePerHour || venue.pricing?.basePrice || 1500) * (1 - (venue.discount || venue.discountPercentage) / 100))
                        : (venue.pricePerHour || venue.pricing?.basePrice || 1500))}
                      <Text style={styles.priceUnit}> /hour</Text>
                    </Text>
                  </View>
                </View>

                <View style={styles.nearbyVenueRating}>
                  <MaterialIcons name="star" size={16} color="#FFD700" />
                  <Text style={styles.nearbyRatingText}>{String(venue.rating || 4.5)}</Text>
                </View>

                <TouchableOpacity style={styles.nearbyFavoriteButton}>
                  <MaterialIcons name="favorite-border" size={20} color={theme.colors.primary} />
                </TouchableOpacity>
              </TouchableOpacity>
              );
            })
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No nearby venues found</Text>
            </View>
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Filter Modal */}
      <FilterModal
        visible={filterModalVisible}
        onDismiss={() => setFilterModalVisible(false)}
      />

      {/* Referral Modal */}
      <ReferralModal
        visible={referralModalVisible}
        onDismiss={() => setReferralModalVisible(false)}
        user={user}
        hasCompletedBooking={userBookings && userBookings.length > 0}
      />

      {/* Referral Floating Action Button - Show for all authenticated users */}
      {user && (
        <TouchableOpacity
          style={styles.referralFAB}
          onPress={() => setReferralModalVisible(true)}
          activeOpacity={0.8}
        >
          <View style={styles.referralFABContent}>
            <MaterialIcons name="card-giftcard" size={24} color={theme.colors.secondary} />
            <Text style={styles.referralFABText}>Refer & Earn</Text>
          </View>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 10 : 20,
    paddingBottom: 16,
  },
  locationContainer: {
    flex: 1,
  },
  greetingText: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
    fontFamily: 'ClashDisplay-Medium',
    marginBottom: 4,
  },
  welcomeBackText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontFamily: 'Montserrat_400Regular',
    marginBottom: 12,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 13,
    fontWeight: '500',
    color: theme.colors.text,
    fontFamily: 'Montserrat_500Medium',
  },
  notificationButton: {
    padding: 8,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF3B30',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 12,
    alignItems: 'center',
  },
  searchBar: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    height: 48,
    elevation: 0,
  },
  searchInput: {
    fontSize: 14,
    fontFamily: 'Montserrat_400Regular',
    minHeight: 48,
  },
  filterButton: {
    width: 48,
    height: 48,
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoriesSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    fontFamily: 'ClashDisplay-Medium',
    marginBottom: 4,
    textAlign: 'left',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontFamily: 'Montserrat_400Regular',
    textAlign: 'left',
  },
  categoriesScroll: {
    paddingHorizontal: 20,
    gap: 12,
  },
  categoryCard: {
    alignItems: 'center',
    marginRight: 12,
  },
  categoryCardActive: {
    // Active state handled by icon container
  },
  categoryIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 16,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryIconContainerActive: {
    backgroundColor: theme.colors.secondary,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.text,
    fontFamily: 'Montserrat_600SemiBold',
  },
  categoryNameActive: {
    color: theme.colors.primary,
  },
  venuesSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitleContainer: {
    flex: 1,
    alignItems: 'flex-start',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
    fontFamily: 'Montserrat_600SemiBold',
  },
  venuesScroll: {
    paddingHorizontal: 20,
    gap: 16,
  },
  venueCard: {
    width: width * 0.7,
    borderRadius: 16,
    overflow: 'hidden',
    marginRight: 16,
    backgroundColor: '#fff',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  venueImage: {
    width: '100%',
    height: 240,
    backgroundColor: '#f0f0f0',
  },
  venueInfoGlass: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    backdropFilter: 'blur(20px)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    borderBottomWidth: 0,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  blurLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
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
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  discountText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.secondary,
    fontFamily: 'ClashDisplay-Medium',
  },
  venueInfo: {
    padding: 12,
  },
  venueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    fontFamily: 'Montserrat_600SemiBold',
  },
  venueName: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
    fontFamily: 'ClashDisplay-Medium',
    marginBottom: 4,
  },
  venueLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  venueLocationText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontFamily: 'Montserrat_400Regular',
    flex: 1,
  },
  venueDistance: {
    fontSize: 12,
    color: theme.colors.primary,
    fontFamily: 'Montserrat_600SemiBold',
    marginLeft: 4,
  },
  venuePriceContainer: {
    marginTop: 4,
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.secondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  venueOriginalPrice: {
    fontSize: 12,
    color: '#999',
    textDecorationLine: 'line-through',
    textDecorationStyle: 'solid',
    fontFamily: 'Montserrat_400Regular',
    marginBottom: 2,
  },
  venuePrice: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.primary,
    fontFamily: 'ClashDisplay-Medium',
  },
  priceUnit: {
    fontSize: 12,
    fontWeight: '400',
    color: theme.colors.textSecondary,
  },
  nearbyVenueCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    backdropFilter: 'blur(20px)',
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  nearbyVenueImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
  },
  nearbyVenueInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  nearbyDiscountBadge: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 4,
  },
  nearbyDiscountText: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.secondary,
    fontFamily: 'ClashDisplay-Medium',
  },
  nearbyVenueName: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.text,
    fontFamily: 'ClashDisplay-Medium',
    marginBottom: 4,
  },
  nearbyVenueLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  nearbyVenueLocationText: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    fontFamily: 'Montserrat_400Regular',
    flex: 1,
  },
  nearbyVenueDistance: {
    fontSize: 11,
    color: theme.colors.primary,
    fontFamily: 'Montserrat_600SemiBold',
    marginLeft: 4,
  },
  nearbyVenuePriceContainer: {
    marginTop: 4,
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.secondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  nearbyVenueOriginalPrice: {
    fontSize: 11,
    color: '#999',
    textDecorationLine: 'line-through',
    textDecorationStyle: 'solid',
    fontFamily: 'Montserrat_400Regular',
    marginBottom: 2,
  },
  nearbyVenuePrice: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.primary,
    fontFamily: 'ClashDisplay-Medium',
  },
  nearbyVenueRating: {
    position: 'absolute',
    top: 12,
    right: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  nearbyRatingText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.text,
    fontFamily: 'Montserrat_600SemiBold',
  },
  nearbyFavoriteButton: {
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
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontFamily: 'Montserrat_400Regular',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontFamily: 'Montserrat_400Regular',
  },
  referralFAB: {
    position: 'absolute',
    bottom: 105,
    right: 20,
    backgroundColor: theme.colors.primary,
    borderRadius: 30,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  referralFABContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
  },
  referralFABText: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.secondary,
    fontFamily: 'Montserrat_700Bold',
  },
});
