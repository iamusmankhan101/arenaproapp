import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
  StatusBar,
  Platform,
  Modal
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, ActivityIndicator } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFavorites, toggleFavorite } from '../../store/slices/turfSlice';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../theme/theme';
import { TurfCardSkeleton } from '../../components/SkeletonLoader';

const { width } = Dimensions.get('window');

// Image mapping
const getVenueImage = (imageType) => {
  const imageMap = {
    padel: require('../../images/padel.jpg'),
    cricket: require('../../images/cricket.jpg'),
    football: require('../../images/football.jpg'),
  };
  return imageMap[imageType] || imageMap.football;
};

export default function FavoritesScreen({ navigation }) {
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const { favorites, loading } = useSelector(state => state.turf);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [removeModalVisible, setRemoveModalVisible] = useState(false);
  const [venueToRemove, setVenueToRemove] = useState(null);

  useEffect(() => {
    // Fetch favorites immediately on mount
    dispatch(fetchFavorites());
  }, [dispatch]);

  const handleRemoveFavorite = async () => {
    if (!venueToRemove) return;

    try {
      await dispatch(toggleFavorite(venueToRemove)).unwrap();
      setRemoveModalVisible(false);
      setVenueToRemove(null);
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  const handleFavoritePress = (venue) => {
    setVenueToRemove(venue);
    setRemoveModalVisible(true);
  };

  const handleVenuePress = (venue) => {
    navigation.navigate('TurfDetail', { turfId: venue.id });
  };

  const categories = ['All', 'Recommended', 'Popular', 'Nearby'];

  const renderCategoryButton = (category) => {
    const isSelected = selectedCategory === category;
    return (
      <TouchableOpacity
        key={category}
        style={[
          styles.categoryButton,
          isSelected && styles.categoryButtonActive
        ]}
        onPress={() => setSelectedCategory(category)}
        activeOpacity={0.7}
      >
        <Text style={[
          styles.categoryText,
          isSelected && styles.categoryTextActive
        ]}>
          {category}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderFavoriteItem = ({ item }) => (
    <TouchableOpacity
      style={styles.venueCard}
      onPress={() => handleVenuePress(item)}
      activeOpacity={0.9}
    >
      {/* Venue Image */}
      <View style={styles.imageContainer}>
        <Image
          source={
            (item.images && item.images.length > 0)
              ? (typeof item.images[0] === 'string' ? { uri: item.images[0] } : item.images[0])
              : (typeof item.image === 'string' ? { uri: item.image } : (item.image || getVenueImage(item.imageType)))
          }
          style={styles.venueImage}
          resizeMode="cover"
        />

        {/* Favorite Button */}
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={(e) => {
            e.stopPropagation();
            handleFavoritePress(item);
          }}
          activeOpacity={0.7}
        >
          <MaterialIcons name="favorite" size={20} color={theme.colors.primary} />
        </TouchableOpacity>

        {/* Discount Badge */}
        {item.discount ? (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{String(item.discount)}% Off</Text>
          </View>
        ) : null}
      </View>

      {/* Venue Info */}
      <View style={styles.venueInfo}>
        <View style={styles.venueHeader}>
          <Text style={styles.venueName} numberOfLines={1}>
            {item.name}
          </Text>
          <View style={styles.ratingContainer}>
            <MaterialIcons name="star" size={16} color="#FFA500" />
            <Text style={styles.ratingText}>{String(item.rating || '4.8')}</Text>
          </View>
        </View>

        <View style={styles.locationRow}>
          <MaterialIcons name="location-on" size={14} color="#666" />
          <Text style={styles.locationText} numberOfLines={1}>
            {typeof item.location === 'string'
              ? item.location
              : item.location?.city
                ? `${item.location.city}, ${item.location.country || 'Pakistan'}`
                : item.area || 'Location not specified'
            }
          </Text>
        </View>

        <View style={styles.priceRow}>
          <Text style={styles.priceText}>
            PKR {String(item.pricing?.basePrice || item.pricePerHour || '150')}
          </Text>
          <Text style={styles.priceUnit}>/hour</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (favorites.length === 0 && !loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

        {/* Header */}
        <View style={[styles.header, { paddingTop: Platform.OS === 'ios' ? insets.top + 10 : 16 }]}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialIcons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Favorite</Text>
          <TouchableOpacity style={styles.headerButton}>
            <MaterialIcons name="search" size={24} color="#000" />
          </TouchableOpacity>
        </View>

        {/* Empty State */}
        <View style={styles.emptyContainer}>
          <MaterialIcons name="favorite-border" size={80} color="#ccc" />
          <Text style={styles.emptyTitle}>No Favorites Yet</Text>
          <Text style={styles.emptySubtitle}>
            Start adding venues to your favorites by tapping the heart icon
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: Platform.OS === 'ios' ? insets.top + 10 : 16 }]}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Favorite</Text>
        <TouchableOpacity style={styles.headerButton}>
          <MaterialIcons name="search" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Category Tabs */}
      <View style={styles.categoryContainer}>
        {categories.map(renderCategoryButton)}
      </View>

      {/* Venues List */}
      {loading ? (
        <View style={styles.listContainer}>
          {[1, 2, 3].map(i => (
            <TurfCardSkeleton key={i} />
          ))}
        </View>
      ) : (
        <FlatList
          data={favorites}
          renderItem={renderFavoriteItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.listContainer,
            { paddingBottom: Platform.OS === 'android' ? 20 + insets.bottom : 20 }
          ]}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Remove Confirmation Modal */}
      <Modal
        visible={removeModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setRemoveModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Remove from Favorites?</Text>

            {venueToRemove && (
              <View style={styles.modalVenueCard}>
                <Image
                  source={
                    (venueToRemove.images && venueToRemove.images.length > 0)
                      ? (typeof venueToRemove.images[0] === 'string' ? { uri: venueToRemove.images[0] } : venueToRemove.images[0])
                      : (typeof venueToRemove.image === 'string' ? { uri: venueToRemove.image } : (venueToRemove.image || getVenueImage(venueToRemove.imageType)))
                  }
                  style={styles.modalVenueImage}
                  resizeMode="cover"
                />

                <View style={styles.modalVenueInfo}>
                  {venueToRemove.discount ? (
                    <View style={styles.modalDiscountBadge}>
                      <Text style={styles.modalDiscountText}>{String(venueToRemove.discount)}% Off</Text>
                    </View>
                  ) : null}

                  <View style={styles.modalVenueHeader}>
                    <Text style={styles.modalVenueName} numberOfLines={1}>
                      {venueToRemove.name}
                    </Text>
                    <View style={styles.modalRatingContainer}>
                      <MaterialIcons name="star" size={14} color="#FFA500" />
                      <Text style={styles.modalRatingText}>{String(venueToRemove.rating || '4.8')}</Text>
                    </View>
                  </View>

                  <View style={styles.modalLocationRow}>
                    <MaterialIcons name="location-on" size={12} color="#999" />
                    <Text style={styles.modalLocationText} numberOfLines={1}>
                      {typeof venueToRemove.location === 'string'
                        ? venueToRemove.location
                        : venueToRemove.location?.city
                          ? `${venueToRemove.location.city}, ${venueToRemove.location.country || 'Pakistan'}`
                          : venueToRemove.area || 'Location not specified'
                      }
                    </Text>
                  </View>

                  <View style={styles.modalPriceRow}>
                    <Text style={styles.modalPriceText}>
                      PKR {String(venueToRemove.pricing?.basePrice || venueToRemove.pricePerHour || '150')}
                    </Text>
                    <Text style={styles.modalPriceUnit}>/hour</Text>
                  </View>
                </View>
              </View>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setRemoveModalVisible(false);
                  setVenueToRemove(null);
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.removeButton}
                onPress={handleRemoveFavorite}
                activeOpacity={0.7}
              >
                <Text style={styles.removeButtonText}>Yes, Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  headerButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    backgroundColor: '#F5F5F5',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
    fontFamily: 'ClashDisplay-Medium',
  },
  categoryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    gap: 12,
  },
  categoryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: '#F0F0F0',
  },
  categoryButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    fontFamily: 'Montserrat_500Medium',
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  venueCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  imageContainer: {
    width: '100%',
    height: 180,
    position: 'relative',
  },
  venueImage: {
    width: '100%',
    height: '100%',
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
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
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(33, 150, 243, 0.9)',
  },
  discountText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Montserrat_600SemiBold',
  },
  venueInfo: {
    padding: 16,
  },
  venueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  venueName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    fontFamily: 'ClashDisplay-Medium',
    marginRight: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    fontFamily: 'Montserrat_600SemiBold',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 4,
  },
  locationText: {
    flex: 1,
    fontSize: 13,
    color: '#666',
    fontFamily: 'Montserrat_400Regular',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceText: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.primary,
    fontFamily: 'ClashDisplay-Medium',
  },
  priceUnit: {
    fontSize: 13,
    color: '#999',
    marginLeft: 4,
    fontFamily: 'Montserrat_400Regular',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A1A',
    marginTop: 24,
    marginBottom: 12,
    fontFamily: 'ClashDisplay-Medium',
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 280,
    fontFamily: 'Montserrat_400Regular',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 24,
    fontFamily: 'ClashDisplay-Medium',
  },
  modalVenueCard: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
  },
  modalVenueImage: {
    width: 120,
    height: 140,
  },
  modalVenueInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  modalDiscountBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(33, 150, 243, 0.9)',
    marginBottom: 8,
  },
  modalDiscountText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Montserrat_600SemiBold',
  },
  modalVenueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  modalVenueName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    fontFamily: 'ClashDisplay-Medium',
    marginRight: 8,
  },
  modalRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  modalRatingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1A1A1A',
    fontFamily: 'Montserrat_600SemiBold',
  },
  modalLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 2,
  },
  modalLocationText: {
    flex: 1,
    fontSize: 11,
    color: '#999',
    fontFamily: 'Montserrat_400Regular',
  },
  modalPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  modalPriceText: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.primary,
    fontFamily: 'ClashDisplay-Medium',
  },
  modalPriceUnit: {
    fontSize: 11,
    color: '#999',
    marginLeft: 4,
    fontFamily: 'Montserrat_400Regular',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 28,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    fontFamily: 'Montserrat_600SemiBold',
  },
  removeButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  removeButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'ClashDisplay-Medium',
  },
});