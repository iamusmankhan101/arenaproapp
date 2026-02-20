import React, { useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
  StatusBar,
  Platform
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFavorites, toggleFavorite } from '../../store/slices/turfSlice';
import { Icon } from '../../components/Icons';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2; // 2 columns with padding
const CARD_HEIGHT = CARD_WIDTH * 1.4; // Aspect ratio similar to book covers

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
  const { favorites, loading } = useSelector(state => state.turf);

  useEffect(() => {
    dispatch(fetchFavorites());
  }, [dispatch]);

  const handleRemoveFavorite = async (venue) => {
    try {
      await dispatch(toggleFavorite(venue)).unwrap();
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  const handleVenuePress = (venue) => {
    navigation.navigate('TurfDetail', { turfId: venue.id });
  };

  const renderFavoriteItem = ({ item, index }) => (
    <View style={[
      styles.cardWrapper,
      index % 2 === 0 ? styles.cardLeft : styles.cardRight
    ]}>
      <TouchableOpacity
        style={styles.card}
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
          {/* Gradient Overlay for better text readability */}
          <View style={styles.gradientOverlay} />
        </View>

        {/* Venue Info */}
        <View style={styles.venueInfo}>
          <Text style={styles.venueName} numberOfLines={2}>
            {item.name}
          </Text>
          <Text style={styles.venueAuthor} numberOfLines={1}>
            {typeof item.location === 'string'
              ? item.location
              : item.location?.city
                ? item.location.city
                : 'Location not specified'
            }
          </Text>
        </View>

        {/* Download/Bookmark Button */}
        <TouchableOpacity
          style={styles.downloadButton}
          onPress={(e) => {
            e.stopPropagation();
            handleRemoveFavorite(item);
          }}
          activeOpacity={0.7}
        >
          <Icon name="favorite" size={16} color="#004d43" />
        </TouchableOpacity>
      </TouchableOpacity>
    </View>
  );

  if (favorites.length === 0 && !loading) {
    return (
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Favorites</Text>
          <TouchableOpacity style={styles.headerButton}>
            <Icon name="search" size={24} color="#000" />
          </TouchableOpacity>
        </View>

        {/* Empty State */}
        <View style={styles.emptyContainer}>
          <Icon name="favorite-border" size={80} color="#ccc" />
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
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Favorites</Text>
        <TouchableOpacity style={styles.headerButton}>
          <Icon name="search" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Grid List */}
      <FlatList
        data={favorites}
        renderItem={renderFavoriteItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={[
          styles.listContainer,
          { paddingBottom: Platform.OS === 'android' ? 20 + insets.bottom + 60 : 20 }
        ]}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={styles.row}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    letterSpacing: 0.3,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 20,
  },
  row: {
    justifyContent: 'space-between',
  },
  cardWrapper: {
    marginBottom: 20,
  },
  cardLeft: {
    marginRight: 8,
  },
  cardRight: {
    marginLeft: 8,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  imageContainer: {
    width: '100%',
    height: CARD_HEIGHT * 0.75,
    position: 'relative',
  },
  venueImage: {
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '40%',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  venueInfo: {
    padding: 12,
    paddingBottom: 8,
    paddingRight: 48, // Extra padding to avoid overlap with favorite button
  },
  venueName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
    lineHeight: 18,
  },
  venueAuthor: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
  downloadButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e8ee26',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
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
    color: '#000',
    marginTop: 24,
    marginBottom: 12,
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 280,
  },
});