import React, { useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFavorites, toggleFavorite } from '../../store/slices/turfSlice';
import { MaterialIcons } from '@expo/vector-icons';
import { Icon } from '../../components/Icons';

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

  const renderFavoriteItem = ({ item }) => (
    <Card style={styles.favoriteCard}>
      <TouchableOpacity onPress={() => handleVenuePress(item)}>
        <View style={styles.cardContent}>
          <Image source={getVenueImage(item.imageType)} style={styles.venueImage} />
          <View style={styles.venueInfo}>
            <Text style={styles.venueName}>{item.name}</Text>
            <View style={styles.locationRow}>
              <Icon name="location-on" size={14} color="#666" />
              <Text style={styles.locationText}>{item.location}</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceText}>From PKR {item.priceFrom}</Text>
              <View style={styles.ratingRow}>
                <Icon name="star" size={14} color="#FFD700" />
                <Text style={styles.ratingText}>{item.rating}</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.favoriteButton}
            onPress={() => handleRemoveFavorite(item)}
          >
            <Icon name="favorite" size={20} color="#F44336" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Card>
  );

  if (favorites.length === 0 && !loading) {
    return (
      <View style={styles.emptyContainer}>
        <Icon name="favorite-border" size={64} color="#ccc" />
        <Text style={styles.emptyTitle}>No Favorites Yet</Text>
        <Text style={styles.emptySubtitle}>
          Start adding venues to your favorites by tapping the heart icon
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Favorites</Text>
      <FlatList
        data={favorites}
        renderItem={renderFavoriteItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    margin: 20,
    marginBottom: 10,
  },
  listContainer: {
    padding: 15,
  },
  favoriteCard: {
    marginBottom: 15,
    borderRadius: 12,
  },
  cardContent: {
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
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  locationText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#229a60',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 2,
  },
  favoriteButton: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});