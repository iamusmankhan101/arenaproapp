import React from 'react';
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Card, Text, Chip, Button, Surface, Badge } from 'react-native-paper';
import { Rating } from 'react-native-ratings';
import { MaterialIcons } from '@expo/vector-icons';
import { SportsIconList } from './SportsIcons';

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

  const getAvailabilityStatus = () => {
    if (!turf.openNow) return { text: 'Closed', color: '#F44336' };
    if (turf.availableSlots === 0) return { text: 'Fully Booked', color: '#F44336' };
    if (turf.availableSlots > 5) return { text: 'Available', color: '#4CAF50' };
    if (turf.availableSlots > 2) return { text: 'Limited Slots', color: '#FF9800' };
    return { text: `${turf.availableSlots} slots left`, color: '#F44336' };
  };

  const availability = getAvailabilityStatus();

  return (
    <Card style={styles.card} onPress={onPress}>
      <View style={styles.cardContent}>
        {/* Venue Image */}
        <View style={styles.imageContainer}>
          <Image
            source={
              turf.images && turf.images.length > 0
                ? { uri: turf.images[0] }
                : turf.image
                  ? { uri: turf.image }
                  : require('../images/football.jpg') // Default image
            }
            style={styles.venueImage}
            defaultSource={require('../images/football.jpg')}
          />

          {/* Status Badge */}
          <View style={[styles.statusBadge, { backgroundColor: availability.color }]}>
            <Text style={styles.statusBadgeText}>
              {turf.openNow && turf.availableSlots > 0 ? 'OPEN' : 'CLOSED'}
            </Text>
          </View>

          {/* Price Badge */}
          <View style={styles.priceBadge}>
            <Text style={styles.priceBadgeText}>
              Rs. {turf.pricePerHour}/hr
            </Text>
          </View>

          {/* Sports Icons Overlay */}
          <View style={styles.sportsOverlay}>
            {turf.sports?.slice(0, 3).map((sport, index) => (
              <View key={sport} style={styles.sportIconOverlay}>
                <MaterialIcons
                  name={
                    sport.toLowerCase() === 'football' ? 'sports-soccer' :
                      sport.toLowerCase() === 'cricket' ? 'sports-cricket' :
                        sport.toLowerCase() === 'padel' ? 'sports-tennis' :
                          sport.toLowerCase() === 'tennis' ? 'sports-tennis' :
                            'sports'
                  }
                  size={14}
                  color="white"
                />
              </View>
            ))}
          </View>
        </View>

        {/* Content */}
        <Card.Content style={styles.contentArea}>
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Text variant="titleMedium" style={styles.name} numberOfLines={1}>
                {turf.name}
              </Text>

              <View style={styles.ratingContainer}>
                <MaterialIcons name="star" size={16} color="#FFD700" />
                <Text style={styles.ratingText}>
                  {turf.rating || '4.0'}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.details}>
            <View style={styles.detailRow}>
              <MaterialIcons name="location-on" size={16} color="#666" />
              <Text style={styles.detailText} numberOfLines={1}>
                {turf.area} • {turf.size || 'Standard Size'}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <MaterialIcons name="sports" size={16} color="#666" />
              <Text style={styles.detailText} numberOfLines={1}>
                {turf.surfaceType || 'Artificial Turf'} • {turf.size || 'Full Size'}
              </Text>
            </View>

            {/* Distance if available */}
            {turf.distance && (
              <View style={styles.detailRow}>
                <MaterialIcons name="near-me" size={16} color="#666" />
                <Text style={styles.detailText}>
                  {turf.distance} away
                </Text>
              </View>
            )}
          </View>

          {/* Availability Status */}
          <View style={styles.availabilityRow}>
            <View style={[styles.availabilityChip, { backgroundColor: `${availability.color}20` }]}>
              <MaterialIcons
                name={turf.openNow && turf.availableSlots > 0 ? 'schedule' : 'schedule'}
                size={14}
                color={availability.color}
              />
              <Text style={[styles.availabilityText, { color: availability.color }]}>
                {availability.text}
              </Text>
            </View>

            <Chip
              style={[styles.timeChip, {
                backgroundColor: getCurrentTimeSlot() === 'Prime Time' ? '#FFE0B2' : '#E8F5E8'
              }]}
              compact
            >
              {getCurrentTimeSlot()}
            </Chip>
          </View>

          {/* Features */}
          <View style={styles.features}>
            {turf.hasFloodlights && (
              <Chip icon="lightbulb" compact style={styles.featureChip}>
                Lights
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

          {/* Sports Tags */}
          {turf.sports && (
            <View style={styles.sportsContainer}>
              {(Array.isArray(turf.sports) ? turf.sports : turf.sports.split(', ')).slice(0, 3).map((sport, index) => (
                <View key={sport} style={styles.sportTag}>
                  <Text style={styles.sportTagText}>{sport.trim()}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Action Button */}
          <TouchableOpacity
            style={styles.bookButton}
            onPress={onPress}
            activeOpacity={0.8}
          >
            <Text style={styles.bookButtonText}>View Details & Book</Text>
            <MaterialIcons name="arrow-forward" size={16} color="white" />
          </TouchableOpacity>
        </Card.Content>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    elevation: 4,
    borderRadius: 16,
    backgroundColor: 'white',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardContent: {
    flex: 1,
  },
  imageContainer: {
    height: 180,
    position: 'relative',
    backgroundColor: '#F0F0F0',
  },
  venueImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F0F0F0',
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    fontFamily: 'Montserrat_700Bold',
  },
  priceBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  priceBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'Montserrat_700Bold',
  },
  sportsOverlay: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    flexDirection: 'row',
    gap: 6,
  },
  sportIconOverlay: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentArea: {
    padding: 16,
  },
  header: {
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontWeight: 'bold',
    flex: 1,
    marginRight: 12,
    color: '#333',
    fontFamily: 'Montserrat_700Bold',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingText: {
    marginLeft: 4,
    color: '#F57C00',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Montserrat_600SemiBold',
  },
  details: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    marginLeft: 8,
    color: '#666',
    fontSize: 13,
    flex: 1,
    fontFamily: 'Montserrat_400Regular',
  },
  availabilityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  availabilityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    flex: 1,
    marginRight: 8,
  },
  availabilityText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
    fontFamily: 'Montserrat_600SemiBold',
  },
  timeChip: {
    minWidth: 80,
  },
  features: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
    gap: 6,
  },
  featureChip: {
    backgroundColor: '#F0F8FF',
    borderColor: '#E3F2FD',
  },
  sportsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 16,
  },
  sportTag: {
    backgroundColor: '#F0F8FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E3F2FD',
  },
  sportTagText: {
    fontSize: 10,
    color: '#1976D2',
    fontWeight: '500',
    fontFamily: 'Montserrat_500Medium',
  },
  bookButton: {
    backgroundColor: '#004d43',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 25,
    gap: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  bookButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Montserrat_600SemiBold',
  },
});