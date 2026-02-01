import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Chip, Button } from 'react-native-paper';
import { Rating } from 'react-native-ratings';
import { MaterialIcons } from '@expo/vector-icons';
import { SportsIcon, SportsIconList } from './SportsIcons';

export default function TurfCard({ turf, onPress }) {
  const getPriceColor = (pricePerHour) => {
    if (pricePerHour < 2000) return '#388E3C'; // Green for cheap
    if (pricePerHour < 3500) return '#F57C00'; // Orange for medium
    return '#D32F2F'; // Red for expensive
  };

  const getCurrentTimeSlot = () => {
    const hour = new Date().getHours();
    if (hour >= 20 || hour <= 1) return 'Prime Time';
    if (hour >= 16 && hour < 20) return 'Happy Hours';
    return 'Regular';
  };

  return (
    <Card style={styles.card} onPress={onPress}>
      <Card.Content>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Text variant="titleMedium" style={styles.name}>
              {turf.name}
            </Text>
            <Text style={[styles.price, { color: getPriceColor(turf.pricePerHour) }]}>
              Rs. {turf.pricePerHour}/hr
            </Text>
          </View>
          
          <View style={styles.ratingRow}>
            <Rating
              type="star"
              ratingCount={5}
              imageSize={16}
              readonly
              startingValue={turf.rating}
            />
            <Text style={styles.ratingText}>
              {turf.rating} ({turf.reviewCount} reviews)
            </Text>
          </View>
        </View>

        <View style={styles.details}>
          <View style={styles.detailRow}>
            <MaterialIcons name="location-on" size={16} color="#666" />
            <Text style={styles.detailText}>
              {turf.distance}km away • {turf.area}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <MaterialIcons name="sports-cricket" size={16} color="#666" />
            <Text style={styles.detailText}>
              {turf.surfaceType} • {turf.size}
            </Text>
          </View>

          {/* Sports Icons Row */}
          {turf.sports && turf.sports.length > 0 && (
            <View style={styles.detailRow}>
              <SportsIconList 
                sports={turf.sports} 
                size={20} 
                maxIcons={4}
                style={styles.sportsIcons}
              />
              <Text style={styles.detailText}>
                {turf.sports.join(', ')}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.features}>
          {turf.hasFloodlights && (
            <Chip icon="lightbulb" compact style={styles.featureChip}>
              Floodlights
            </Chip>
          )}
          {turf.hasGenerator && (
            <Chip icon="flash" compact style={styles.featureChip}>
              Generator
            </Chip>
          )}
          {turf.hasParking && (
            <Chip icon="local-parking" compact style={styles.featureChip}>
              Parking
            </Chip>
          )}
        </View>

        <View style={styles.footer}>
          <Chip 
            style={[styles.timeChip, { 
              backgroundColor: getCurrentTimeSlot() === 'Prime Time' ? '#FFE0B2' : '#E8F5E8' 
            }]}
            compact
          >
            {getCurrentTimeSlot()}
          </Chip>
          
          <Button 
            mode="contained" 
            compact 
            onPress={onPress}
            style={styles.bookButton}
          >
            Book Now
          </Button>
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 15,
    elevation: 3,
  },
  header: {
    marginBottom: 10,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  name: {
    fontWeight: 'bold',
    flex: 1,
  },
  price: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: 8,
    color: '#666',
    fontSize: 12,
  },
  details: {
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailText: {
    marginLeft: 8,
    color: '#666',
    fontSize: 14,
  },
  sportsIcons: {
    marginRight: 8,
  },
  features: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  featureChip: {
    marginRight: 8,
    marginBottom: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeChip: {
    flex: 1,
    marginRight: 10,
  },
  bookButton: {
    minWidth: 100,
  },
});