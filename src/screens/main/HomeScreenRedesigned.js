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
import { fetchNearbyTurfs } from '../../store/slices/turfSlice';
import { theme } from '../../theme/theme';
import TurfCard from '../../components/TurfCard';

const { width } = Dimensions.get('window');

// Sports categories with icons
const sportsCategories = [
  { id: 1, name: 'Cricket', icon: 'sports-cricket' },
  { id: 2, name: 'Futsal', icon: 'sports-soccer' },
  { id: 3, name: 'Padel', icon: 'sports-tennis' },
  { id: 4, name: 'Basketball', icon: 'sports-basketball' },
];

export default function HomeScreen({ navigation }) {
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSport, setSelectedSport] = useState(null);
  const [userLocation, setUserLocation] = useState('Lahore, Pakistan');
  
  const { nearbyTurfs, loading } = useSelector(state => state.turf);
  const { user } = useSelector(state => state.auth);

  // Load venues on screen focus
  useFocusEffect(
    React.useCallback(() => {
      dispatch(fetchNearbyTurfs({
        latitude: 31.5204,
        longitude: 74.3587,
        radius: 50000
      }));
    }, [dispatch])
  );

  // Filter venues by selected sport
  const getFilteredVenues = () => {
    if (!selectedSport) return nearbyTurfs;
    
    return nearbyTurfs.filter(venue => {
      const venueSports = Array.isArray(venue.sports) 
        ? venue.sports 
        : typeof venue.sports === 'string' 
          ? venue.sports.split(',').map(s => s.trim())
          : [];
      return venueSports.includes(selectedSport);
    });
  };

  const filteredVenues = getFilteredVenues();
  const recommendedVenues = filteredVenues.slice(0, 5);
  const nearbyVenues = filteredVenues.slice(5, 10);

  const handleSportSelect = (sportName) => {
    setSelectedSport(selectedSport === sportName ? null : sportName);
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigation.navigate('VenueList', { searchQuery });
    }
  };

  const handleVenuePress = (venue) => {
    navigation.navigate('TurfDetail', { turf: venue });
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
            <Text style={styles.locationLabel}>Location</Text>
            <TouchableOpacity 
              style={styles.locationButton}
              onPress={() => navigation.navigate('ManualLocation')}
            >
              <MaterialIcons 
                name="location-on" 
                size={20} 
                color={theme.colors.primary} 
              />
              <Text style={styles.locationText}>{userLocation}</Text>
              <MaterialIcons 
                name="keyboard-arrow-down" 
                size={20} 
                color={theme.colors.text} 
              />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            style={styles.notificationButton}
            onPress={() => {/* Handle notifications */}}
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
          <View style={styles.searchWrapper}>
            <MaterialIcons 
              name="search" 
              size={24} 
              color={theme.colors.textSecondary} 
              style={styles.searchIcon}
            />
            <Searchbar
              placeholder="Search venues..."
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={styles.searchBar}
              inputStyle={styles.searchInput}
              onSubmitEditing={handleSearch}
              elevation={0}
            />
          </View>
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => {/* Open filter modal */}}
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
          <Text style={styles.sectionTitle}>Sports Categories</Text>
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
                    color={selectedSport === sport.name ? theme.colors.secondary : theme.colors.primary} 
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
              {recommendedVenues.map((venue) => (
                <TouchableOpacity
                  key={venue.id}
                  style={styles.venueCard}
                  onPress={() => handleVenuePress(venue)}
                >
                  <Image 
                    source={{ uri: venue.images?.[0] || 'https://via.placeholder.com/300x200' }}
                    style={styles.venueImage}
                    resizeMode="cover"
                  />
                  <TouchableOpacity style={styles.favoriteButton}>
                    <MaterialIcons name="favorite-border" size={20} color={theme.colors.primary} />
                  </TouchableOpacity>
                  
                  {venue.discount && (
                    <View style={styles.discountBadge}>
                      <Text style={styles.discountText}>{venue.discount}% Off</Text>
                    </View>
                  )}

                  <View style={styles.venueInfo}>
                    <View style={styles.venueHeader}>
                      <View style={styles.ratingContainer}>
                        <MaterialIcons name="star" size={16} color="#FFD700" />
                        <Text style={styles.ratingText}>{venue.rating || 4.5}</Text>
                      </View>
                    </View>
                    
                    <Text style={styles.venueName} numberOfLines={1}>
                      {venue.name}
                    </Text>
                    
                    <View style={styles.venueLocation}>
                      <MaterialIcons 
                        name="location-on" 
                        size={14} 
                        color={theme.colors.textSecondary} 
                      />
                      <Text style={styles.venueLocationText} numberOfLines={1}>
                        {venue.city || 'Lahore'}, Pakistan
                      </Text>
                    </View>
                    
                    <Text style={styles.venuePrice}>
                      PKR {venue.pricePerHour || venue.pricing?.basePrice || 1500}
                      <Text style={styles.priceUnit}> /hour</Text>
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
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
            <Text style={styles.sectionTitle}>Nearby Venues</Text>
            <TouchableOpacity onPress={() => navigation.navigate('VenueList')}>
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          </View>

          {nearbyVenues.length > 0 ? (
            nearbyVenues.map((venue) => (
              <TouchableOpacity
                key={venue.id}
                style={styles.nearbyVenueCard}
                onPress={() => handleVenuePress(venue)}
              >
                <Image 
                  source={{ uri: venue.images?.[0] || 'https://via.placeholder.com/150x150' }}
                  style={styles.nearbyVenueImage}
                  resizeMode="cover"
                />
                
                <View style={styles.nearbyVenueInfo}>
                  {venue.discount && (
                    <View style={styles.nearbyDiscountBadge}>
                      <Text style={styles.nearbyDiscountText}>{venue.discount}% Off</Text>
                    </View>
                  )}
                  
                  <Text style={styles.nearbyVenueName} numberOfLines={1}>
                    {venue.name}
                  </Text>
                  
                  <View style={styles.nearbyVenueLocation}>
                    <MaterialIcons 
                      name="location-on" 
                      size={14} 
                      color={theme.colors.textSecondary} 
                    />
                    <Text style={styles.nearbyVenueLocationText} numberOfLines={1}>
                      {venue.city || 'Lahore'}, Pakistan
                    </Text>
                  </View>
                  
                  <Text style={styles.nearbyVenuePrice}>
                    PKR {venue.pricePerHour || venue.pricing?.basePrice || 1500}
                    <Text style={styles.priceUnit}> /hour</Text>
                  </Text>
                </View>

                <View style={styles.nearbyVenueRating}>
                  <MaterialIcons name="star" size={16} color="#FFD700" />
                  <Text style={styles.nearbyRatingText}>{venue.rating || 4.5}</Text>
                </View>

                <TouchableOpacity style={styles.nearbyFavoriteButton}>
                  <MaterialIcons name="favorite-border" size={20} color={theme.colors.primary} />
                </TouchableOpacity>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No nearby venues found</Text>
            </View>
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
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
  locationLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontFamily: 'Montserrat_400Regular',
    marginBottom: 4,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    fontFamily: 'Montserrat_600SemiBold',
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
  },
  searchWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    paddingLeft: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchBar: {
    flex: 1,
    backgroundColor: 'transparent',
    elevation: 0,
  },
  searchInput: {
    fontSize: 14,
    fontFamily: 'Montserrat_400Regular',
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
    fontFamily: 'Montserrat_700Bold',
    paddingHorizontal: 20,
    marginBottom: 16,
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
    backgroundColor: `${theme.colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryIconContainerActive: {
    backgroundColor: theme.colors.primary,
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
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    marginRight: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  venueImage: {
    width: '100%',
    height: 180,
    backgroundColor: '#f0f0f0',
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.surface,
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
    fontFamily: 'Montserrat_700Bold',
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
    fontFamily: 'Montserrat_700Bold',
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
  venuePrice: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.primary,
    fontFamily: 'Montserrat_700Bold',
  },
  priceUnit: {
    fontSize: 12,
    fontWeight: '400',
    color: theme.colors.textSecondary,
  },
  nearbyVenueCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
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
    fontFamily: 'Montserrat_700Bold',
  },
  nearbyVenueName: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.text,
    fontFamily: 'Montserrat_700Bold',
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
  nearbyVenuePrice: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.primary,
    fontFamily: 'Montserrat_700Bold',
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
    backgroundColor: theme.colors.surface,
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
});
