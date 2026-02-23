import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
  FlatList,
  Platform,
  StatusBar
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, Searchbar, Chip } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { MaterialIcons } from '@expo/vector-icons';
import { Icon } from '../../components/Icons';
import { fetchNearbyTurfs, toggleFavorite } from '../../store/slices/turfSlice';
import SkeletonLoader from '../../components/SkeletonLoader';
import FilterModal from '../../components/FilterModal';

const { width } = Dimensions.get('window');

export default function VenueListScreen({ navigation, route }) {
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredVenues, setFilteredVenues] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const { nearbyTurfs, loading, filters: reduxFilters, favorites } = useSelector(state => state.turf);
  const [showFilters, setShowFilters] = useState(false);

  const sportCategories = ['All', 'Football', 'Cricket', 'Padel', 'Futsal', 'Basketball'];

  const handleFavoriteToggle = async (venue, e) => {
    if (e) e.stopPropagation();
    try {
      await dispatch(toggleFavorite({
        id: venue.id,
        name: venue.name,
        location: venue.area && venue.city ? `${venue.area}, ${venue.city}` : venue.location,
        pricePerHour: venue.pricePerHour || venue.price,
        rating: venue.rating,
        imageType: venue.sport?.toLowerCase() || 'football',
        images: venue.images,
        image: venue.image
      })).unwrap();
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  // Load venues on component mount
  useEffect(() => {
    // Fetch all active venues (no location filtering)
    dispatch(fetchNearbyTurfs({ latitude: 0, longitude: 0, radius: 0 })); // Dummy values since location filtering is removed
  }, [dispatch]);

  // Get initial filter from navigation params
  useEffect(() => {
    if (route.params?.searchQuery) {
      setSearchQuery(route.params.searchQuery);
    }
  }, [route.params]);

  // Filter venues based on search and Redux filters
  useEffect(() => {
    let filtered = nearbyTurfs;

    // Filter by selected category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(venue =>
        venue.sports && venue.sports.some(s => s === selectedCategory) ||
        venue.sport === selectedCategory
      );
    }

    // Filter by additional Redux filters (from modal)
    if (!reduxFilters.sports.includes('All')) {
      filtered = filtered.filter(venue =>
        venue.sports && venue.sports.some(s => reduxFilters.sports.includes(s))
      );
    }

    // Price range filter
    filtered = filtered.filter(venue => {
      const venuePrice = venue.pricePerHour || venue.basePrice || 0;
      return venuePrice >= reduxFilters.priceRange[0] && venuePrice <= reduxFilters.priceRange[1];
    });

    // Rating filter
    filtered = filtered.filter(venue => {
      const venueRating = venue.rating || 5;
      return venueRating >= reduxFilters.minRating;
    });

    // Filter by search query
    if (searchQuery.trim() !== '') {
      filtered = filtered.filter(venue =>
        venue.area?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        venue.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        venue.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (Array.isArray(venue.sports) ? venue.sports.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())) :
          typeof venue.sports === 'string' ? venue.sports.toLowerCase().includes(searchQuery.toLowerCase()) :
            venue.sport?.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Sorting logic
    if (reduxFilters.sortBy === 'Popular') {
      filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (reduxFilters.sortBy === 'Price Low to High') {
      filtered.sort((a, b) => (a.pricePerHour || 0) - (b.pricePerHour || 0));
    }

    setFilteredVenues(filtered);
  }, [searchQuery, nearbyTurfs, reduxFilters, selectedCategory]);

  // Helper function to get default image based on sport
  const getDefaultImage = (sport) => {
    const images = {
      'Cricket': require('../../images/cricket.jpg'),
      'Football': require('../../images/football.jpg'),
      'Padel': require('../../images/padel.jpg'),
      'Futsal': require('../../images/football.jpg')
    };
    return images[sport] || require('../../images/football.jpg');
  };

  const renderVenueCardSkeleton = () => (
    <View style={styles.venueCard}>
      <View style={styles.venueImageContainer}>
        <SkeletonLoader width="100%" height={120} borderRadius={0} />
      </View>
      <View style={styles.venueInfo}>
        <SkeletonLoader width="80%" height={14} borderRadius={4} style={{ marginBottom: 4 }} />
        <SkeletonLoader width="60%" height={11} borderRadius={4} style={{ marginBottom: 4 }} />
        <SkeletonLoader width="50%" height={10} borderRadius={4} style={{ marginBottom: 8 }} />
        <View style={styles.venueFooter}>
          <SkeletonLoader width={60} height={14} borderRadius={4} />
          <SkeletonLoader width={50} height={20} borderRadius={6} />
        </View>
      </View>
    </View>
  );

  const renderSkeletonGrid = () => {
    const skeletonData = Array.from({ length: 6 }, (_, index) => ({ id: `skeleton-${index}` }));
    return (
      <FlatList
        data={skeletonData}
        renderItem={renderVenueCardSkeleton}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.venuesList}
        showsVerticalScrollIndicator={false}
      />
    );
  };

  const renderVenueCard = ({ item }) => (
    <TouchableOpacity
      style={styles.venueCard}
      onPress={() => navigation.navigate('TurfDetail', { turfId: item.id })}
      activeOpacity={0.8}
    >
      <View style={styles.venueImageContainer}>
        <Image
          source={
            (item.images && item.images.length > 0)
              ? (typeof item.images[0] === 'string' ? { uri: item.images[0] } : item.images[0])
              : (typeof item.image === 'string' ? { uri: item.image } : (item.image || getDefaultImage(item.sport)))
          }
          style={styles.venueImage}
          resizeMode="cover"
        />
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={(e) => handleFavoriteToggle(item, e)}
          activeOpacity={0.7}
        >
          <MaterialIcons 
            name={favorites.some(fav => fav.id === item.id) ? "favorite" : "favorite-border"} 
            size={20} 
            color={favorites.some(fav => fav.id === item.id) ? "#F44336" : "#FFF"} 
          />
        </TouchableOpacity>
        <View style={styles.ratingBadge}>
          <Icon name="star" size={16} color="#004d43" />
          <Text style={styles.ratingText}>{item.rating || 0}</Text>
        </View>
        <View style={styles.sportBadge}>
          <Text style={styles.sportBadgeText}>
            {Array.isArray(item.sports) ? item.sports[0] :
              typeof item.sports === 'string' && item.sports.trim() ? item.sports.split(',')[0].trim() :
                item.sport || 'Sport'}
          </Text>
        </View>
      </View>
      <View style={styles.venueInfo}>
        <Text style={styles.venueName}>{item.name}</Text>
        <View style={styles.venueLocationRow}>
          <Icon name="location-on" size={14} color="#666" />
          <Text style={styles.venueLocation}>{item.area}, {item.city}</Text>
        </View>

        <View style={styles.venueFooter}>
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>PKR </Text>
            <Text style={styles.priceAmount}>{(item.price || item.pricePerHour || 0).toLocaleString()}</Text>
            <Text style={styles.priceUnit}>/hour</Text>
          </View>
          {item.bookable && (
            <TouchableOpacity style={styles.bookableButton}>
              <Text style={styles.bookableText}>Book Now</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingBottom: Platform.OS === 'android' ? insets.bottom + 60 : 0 }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Home')}
        >
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>All Venues</Text>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(true)}
        >
          <Icon name="tune" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchSection}>
        <Searchbar
          placeholder="Search venues, areas, sports..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
          iconColor="#004d43"
          inputStyle={styles.searchInput}
        />
      </View>

      {/* Category Filter */}
      <View style={styles.categorySection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
          {sportCategories.map((category) => (
            <Chip
              key={category}
              mode={selectedCategory === category ? 'flat' : 'outlined'}
              selected={selectedCategory === category}
              onPress={() => setSelectedCategory(category)}
              style={[
                styles.categoryChip,
                selectedCategory === category && styles.selectedCategoryChip
              ]}
              textStyle={[
                styles.categoryChipText,
                selectedCategory === category && styles.selectedCategoryChipText
              ]}
            >
              {category}
            </Chip>
          ))}
        </ScrollView>
      </View>

      {/* Results Count */}
      <View style={styles.resultsSection}>
        <Text style={styles.resultsText}>
          {loading ? 'Loading venues...' : `${filteredVenues.length} venues found`}
        </Text>
      </View>

      <FilterModal
        visible={showFilters}
        onDismiss={() => setShowFilters(false)}
      />

      {/* Venues List */}
      {loading ? (
        renderSkeletonGrid()
      ) : (
        <FlatList
          data={filteredVenues}
          renderItem={renderVenueCard}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.venuesList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (
            <View style={styles.noResultsContainer}>
              <Icon name="search-off" size={48} color="#ccc" />
              <Text style={styles.noResultsText}>No venues found</Text>
              <Text style={styles.noResultsSubtext}>Try adjusting your search or filters</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    backgroundColor: 'white',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'Montserrat_600SemiBold',
  },
  filterButton: {
    padding: 8,
  },
  searchSection: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
  },
  searchbar: {
    elevation: 0,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
  },
  searchInput: {
    fontFamily: 'Montserrat_400Regular',
  },
  categorySection: {
    paddingVertical: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  categoryScroll: {
    paddingHorizontal: 20,
  },
  categoryChip: {
    marginRight: 10,
    backgroundColor: 'white',
    borderColor: '#E0E0E0',
  },
  selectedCategoryChip: {
    backgroundColor: '#004d43',
    borderColor: '#004d43',
  },
  categoryChipText: {
    color: '#666',
    fontFamily: 'Montserrat_500Medium',
  },
  selectedCategoryChipText: {
    color: 'white',
  },
  resultsSection: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  resultsText: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Montserrat_500Medium',
  },
  venuesList: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  venueCard: {
    width: (width - 50) / 2,
    backgroundColor: 'white',
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
    marginBottom: 15,
  },
  venueImageContainer: {
    height: 120,
    width: '100%',
    position: 'relative',
  },
  venueImage: {
    width: '100%',
    height: '100%',
  },
  ratingBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#e8ee26',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
  },
  ratingText: {
    fontSize: 11,
    color: '#004d43',
    marginLeft: 2,
    fontFamily: 'Montserrat_600SemiBold',
  },
  sportBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#004d43',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  sportBadgeText: {
    fontSize: 10,
    color: 'white',
    fontFamily: 'Montserrat_600SemiBold',
  },
  favoriteButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  venueInfo: {
    padding: 12,
  },
  venueName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
    fontFamily: 'Montserrat_600SemiBold',
  },
  venueLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  venueLocation: {
    fontSize: 11,
    color: '#666',
    marginLeft: 2,
    fontFamily: 'Montserrat_400Regular',
  },
  venueTime: {
    fontSize: 10,
    color: '#666',
    marginBottom: 8,
    fontFamily: 'Montserrat_400Regular',
  },
  venueFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceLabel: {
    fontSize: 10,
    color: '#004d43',
    fontFamily: 'Montserrat_500Medium',
  },
  priceAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#004d43',
    fontFamily: 'Montserrat_700Bold',
  },
  priceUnit: {
    fontSize: 10,
    color: '#666',
    fontFamily: 'Montserrat_400Regular',
  },
  bookableButton: {
    backgroundColor: '#004d43',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  bookableText: {
    fontSize: 10,
    color: 'white',
    fontFamily: 'Montserrat_600SemiBold',
  },
  noResultsContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    width: width - 40,
  },
  noResultsText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
    fontFamily: 'Montserrat_600SemiBold',
  },
  noResultsSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
    fontFamily: 'Montserrat_400Regular',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    fontFamily: 'Montserrat_400Regular',
  },
});