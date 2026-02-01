import { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  Image, 
  Dimensions, 
  TouchableOpacity,
  Alert 
} from 'react-native';
import { 
  Text, 
  Button,
  Modal,
  Portal,
  Card
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { toggleFavorite, fetchFavorites, fetchTurfDetails } from '../../store/slices/turfSlice';
import { fetchAvailableSlots } from '../../store/slices/bookingSlice';
import { MaterialIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function TurfDetailScreen({ route, navigation }) {
  const { turfId } = route.params;
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showTimeSlots, setShowTimeSlots] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  
  const dispatch = useDispatch();
  const { favorites, selectedTurf, loading } = useSelector(state => state.turf);
  const { availableSlots, loading: slotsLoading } = useSelector(state => state.booking);
  
  // Check if current venue is in favorites
  const isFavorite = favorites.some(fav => fav.id === turfId);

  // Load turf details and favorites on component mount
  useEffect(() => {
    dispatch(fetchTurfDetails(turfId));
    dispatch(fetchFavorites());
  }, [dispatch, turfId]);

  // Load available slots when date changes
  useEffect(() => {
    if (showTimeSlots && selectedDate) {
      const dateString = selectedDate.toISOString().split('T')[0];
      dispatch(fetchAvailableSlots({ turfId, date: dateString }));
    }
  }, [dispatch, turfId, selectedDate, showTimeSlots]);

  // Default venue data structure for fallback
  const defaultVenue = {
    id: turfId,
    name: 'Loading...',
    location: 'Loading...',
    hours: 'Loading...',
    rating: 0,
    reviewCount: 0,
    priceFrom: 0,
    images: [require('../../images/football.jpg')],
    description: 'Loading venue details...',
    availableSports: [],
    facilities: [],
    timeSlots: []
  };

  // Use selectedTurf from Redux or fallback to default, with proper data transformation
  const rawVenue = selectedTurf || defaultVenue;
  
  // Transform the venue data to match component expectations
  const venue = {
    ...rawVenue,
    // Handle location display
    location: rawVenue.area && rawVenue.city 
      ? `${rawVenue.area}, ${rawVenue.city}` 
      : rawVenue.address || rawVenue.location || 'Location not specified',
    
    // Handle operating hours
    hours: rawVenue.operatingHours 
      ? `${rawVenue.operatingHours.open} - ${rawVenue.operatingHours.close}` 
      : rawVenue.hours || '6:00 AM - 11:00 PM',
    
    // Handle price
    priceFrom: rawVenue.pricing?.basePrice || rawVenue.priceFrom || 2000,
    
    // Handle description
    description: rawVenue.description || 'A great venue for sports activities.',
    
    // Transform sports array to expected format
    availableSports: (rawVenue.sports || rawVenue.availableSports || []).map(sport => {
      if (typeof sport === 'string') {
        return {
          name: sport,
          icon: getSportIcon(sport)
        };
      }
      return sport;
    }),
    
    // Transform facilities array to expected format
    facilities: (rawVenue.facilities || []).map(facility => {
      if (typeof facility === 'string') {
        return {
          name: facility,
          icon: getFacilityIcon(facility)
        };
      }
      return facility;
    }),
    
    // Handle images
    images: rawVenue.images && rawVenue.images.length > 0 
      ? rawVenue.images 
      : [getDefaultImage(rawVenue.sports?.[0] || 'Football')],
    
    // Generate time slots if not available
    timeSlots: rawVenue.timeSlots || generateDefaultTimeSlots(rawVenue.pricing?.basePrice || 2000)
  };

  // Helper functions
  function getSportIcon(sport) {
    const icons = {
      'Football': '⚽',
      'Cricket': '🏏',
      'Padel': '🏓',
      'Futsal': '⚽',
      'Basketball': '🏀',
      'Tennis': '🎾'
    };
    return icons[sport] || '⚽';
  }

  function getFacilityIcon(facility) {
    const icons = {
      'Floodlights': 'lightbulb',
      'Parking': 'local-parking',
      'Changing Room': 'wc',
      'Cafeteria': 'restaurant',
      'Equipment Rental': 'sports-soccer',
      'Air Conditioning': 'ac-unit',
      'Pro Shop': 'store',
      'Lounge': 'weekend',
      'Coaching': 'school',
      'Practice Nets': 'sports-cricket',
      'Scoreboard': 'scoreboard',
      'Pavilion': 'home',
      'Indoor Court': 'sports-tennis'
    };
    return icons[facility] || 'check-circle';
  }

  function getDefaultImage(sport) {
    const images = {
      'Cricket': require('../../images/cricket.jpg'),
      'Football': require('../../images/football.jpg'),
      'Futsal': require('../../images/football.jpg'),
      'Padel': require('../../images/padel.jpg'),
      'Basketball': require('../../images/football.jpg'),
      'Tennis': require('../../images/padel.jpg')
    };
    return images[sport] || require('../../images/football.jpg');
  }

  function generateDefaultTimeSlots(basePrice) {
    const slots = [];
    for (let hour = 6; hour <= 22; hour++) {
      const startTime = `${hour.toString().padStart(2, '0')}:00`;
      const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`;
      
      // Vary pricing based on time
      let price = basePrice;
      if (hour >= 17 && hour <= 21) price = Math.round(basePrice * 1.25); // Peak hours
      if (hour >= 6 && hour <= 8) price = Math.round(basePrice * 0.9); // Morning discount
      
      slots.push({
        id: `slot-${hour}`,
        time: startTime,
        endTime: endTime,
        price: price,
        available: Math.random() > 0.3 // Random availability for demo
      });
    }
    return slots;
  }

  const getVenueImageType = () => {
    // Determine image type based on available sports
    if (!venue.availableSports || venue.availableSports.length === 0) return 'football';
    
    const sports = venue.availableSports.map(sport => 
      typeof sport === 'string' ? sport.toLowerCase() : sport.name?.toLowerCase()
    );
    
    if (sports.includes('padel')) return 'padel';
    if (sports.includes('cricket')) return 'cricket';
    if (sports.includes('football') || sports.includes('futsal')) return 'football';
    return 'football'; // default
  };

  const handleFavoriteToggle = async () => {
    try {
      await dispatch(toggleFavorite({
        id: venue.id,
        name: venue.name,
        location: venue.location,
        priceFrom: venue.priceFrom,
        rating: venue.rating,
        imageType: getVenueImageType()
      })).unwrap();
    } catch (error) {
      Alert.alert('Error', 'Failed to update favorites');
    }
  };

  const handleBooking = () => {
    setShowTimeSlots(true);
  };

  const handleTimeSlotSelect = (slot) => {
    if (slot.available) {
      setSelectedTimeSlot(slot);
    }
  };

  const handleConfirmBooking = () => {
    if (!selectedTimeSlot) {
      Alert.alert('Error', 'Please select a time slot');
      return;
    }

    const bookingData = {
      turf: {
        id: venue.id,
        name: venue.name,
        address: venue.location,
        phoneNumber: '+92 300 1234567'
      },
      slot: {
        startTime: selectedTimeSlot.time,
        endTime: selectedTimeSlot.endTime,
        price: selectedTimeSlot.price,
        priceType: getPriceType(selectedTimeSlot.time)
      },
      date: selectedDate.toISOString()
    };

    setShowTimeSlots(false);
    navigation.navigate('BookingConfirm', bookingData);
  };

  const generateDateOptions = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    
    return dates;
  };

  const getPriceType = (time) => {
    const hour = parseInt(time.split(':')[0]);
    if (hour >= 6 && hour < 9) return 'Morning';
    if (hour >= 9 && hour < 17) return 'Day';
    if (hour >= 17 && hour < 20) return 'Evening';
    return 'Night';
  };

  const formatDateOption = (date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const renderImageDots = () => {
    return (
      <View style={styles.dotsContainer}>
        {venue.images.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              index === currentImageIndex ? styles.activeDot : styles.inactiveDot
            ]}
          />
        ))}
      </View>
    );
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <MaterialIcons key={i} name="star" size={16} color="#FFD700" />
      );
    }
    
    if (hasHalfStar) {
      stars.push(
        <MaterialIcons key="half" name="star-half" size={16} color="#FFD700" />
      );
    }
    
    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(
        <MaterialIcons key={`empty-${i}`} name="star-border" size={16} color="#FFD700" />
      );
    }
    
    return stars;
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Image */}
        <View style={styles.imageContainer}>
          <TouchableOpacity 
            onPress={() => {
              const nextIndex = (currentImageIndex + 1) % venue.images.length;
              setCurrentImageIndex(nextIndex);
            }}
          >
            <Image 
              source={venue.images[currentImageIndex]} 
              style={styles.headerImage}
              resizeMode="cover"
            />
          </TouchableOpacity>
          <View style={styles.imageOverlay}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <MaterialIcons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.favoriteButton}
              onPress={handleFavoriteToggle}
            >
              <MaterialIcons 
                name={isFavorite ? "favorite" : "favorite-border"} 
                size={20} 
                color={isFavorite ? "#F44336" : "black"} 
              />
            </TouchableOpacity>
          </View>
          {renderImageDots()}
        </View>

        {/* Content Container */}
        <View style={styles.contentContainer}>
          {/* Venue Info */}
          <View style={styles.venueInfo}>
            <Text style={styles.venueName}>{venue.name}</Text>
            
            <View style={styles.locationRow}>
              <MaterialIcons name="location-on" size={16} color="#666" />
              <Text style={styles.locationText}>{venue.location}</Text>
              <MaterialIcons name="schedule" size={16} color="#666" style={{ marginLeft: 20 }} />
              <Text style={styles.hoursText}>{venue.hours}</Text>
            </View>
            
            <View style={styles.ratingRow}>
              <View style={styles.starsContainer}>
                {renderStars(venue.rating)}
              </View>
              <Text style={styles.ratingText}>• {venue.reviewCount} reviews</Text>
            </View>
            
            <Text style={styles.priceText}>
              Start From PKR {venue.priceFrom.toLocaleString()}
            </Text>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.descriptionText}>{venue.description}</Text>
          </View>

          {/* Available Sports */}
          {venue.availableSports && venue.availableSports.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Available Sports</Text>
              <View style={styles.sportsContainer}>
                {venue.availableSports.map((sport, index) => (
                  <View key={index} style={styles.sportItem}>
                    <View style={styles.sportIcon}>
                      <Text style={styles.sportEmoji}>{sport.icon}</Text>
                    </View>
                    <Text style={styles.sportName}>{sport.name}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Facilities */}
          {venue.facilities && venue.facilities.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Facilities</Text>
              <View style={styles.facilitiesContainer}>
                {venue.facilities.map((facility, index) => (
                  <View key={index} style={styles.facilityItem}>
                    <View style={styles.facilityIconContainer}>
                      <MaterialIcons name={facility.icon} size={20} color="#229a60" />
                    </View>
                    <Text style={styles.facilityName}>{facility.name}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Book Button */}
      <View style={styles.bottomContainer}>
        <Button
          mode="contained"
          onPress={handleBooking}
          style={styles.bookButton}
          contentStyle={styles.bookButtonContent}
        >
          Book Court
        </Button>
      </View>

      {/* Time Slot Selection Modal */}
      <Portal>
        <Modal 
          visible={showTimeSlots} 
          onDismiss={() => setShowTimeSlots(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Card style={styles.timeSlotsCard}>
            <Card.Content>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Time Slot</Text>
                <TouchableOpacity 
                  onPress={() => setShowTimeSlots(false)}
                  style={styles.closeButton}
                >
                  <MaterialIcons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>

              {/* Date Selection */}
              <Text style={styles.sectionLabel}>Select Date</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateScroll}>
                {generateDateOptions().map((date, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.dateOption,
                      selectedDate.toDateString() === date.toDateString() && styles.selectedDateOption
                    ]}
                    onPress={() => setSelectedDate(date)}
                  >
                    <Text style={[
                      styles.dateOptionText,
                      selectedDate.toDateString() === date.toDateString() && styles.selectedDateOptionText
                    ]}>
                      {formatDateOption(date)}
                    </Text>
                    <Text style={[
                      styles.dateOptionDay,
                      selectedDate.toDateString() === date.toDateString() && styles.selectedDateOptionDay
                    ]}>
                      {date.getDate()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Time Slots Grid */}
              <Text style={styles.sectionLabel}>Available Time Slots</Text>
              <ScrollView style={styles.timeSlotsScroll} showsVerticalScrollIndicator={false}>
                <View style={styles.timeSlotsGrid}>
                  {(venue.timeSlots || []).map((slot) => (
                    <TouchableOpacity
                      key={slot.id}
                      style={[
                        styles.timeSlotCard,
                        !slot.available && styles.unavailableSlot,
                        selectedTimeSlot?.id === slot.id && styles.selectedSlot
                      ]}
                      onPress={() => handleTimeSlotSelect(slot)}
                      disabled={!slot.available}
                    >
                      <Text style={[
                        styles.timeSlotTime,
                        !slot.available && styles.unavailableSlotText,
                        selectedTimeSlot?.id === slot.id && styles.selectedSlotText
                      ]}>
                        {slot.time} - {slot.endTime}
                      </Text>
                      <Text style={[
                        styles.timeSlotPrice,
                        !slot.available && styles.unavailableSlotPrice,
                        selectedTimeSlot?.id === slot.id && styles.selectedSlotPrice
                      ]}>
                        PKR {slot.price.toLocaleString()}
                      </Text>
                      {!slot.available && (
                        <Text style={styles.bookedText}>Booked</Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              {/* Selected Slot Summary */}
              {selectedTimeSlot && (
                <View style={styles.selectedSlotSummary}>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Selected Slot:</Text>
                    <Text style={styles.summaryValue}>
                      {selectedTimeSlot.time} - {selectedTimeSlot.endTime}
                    </Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Date:</Text>
                    <Text style={styles.summaryValue}>
                      {selectedDate.toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Total Price:</Text>
                    <Text style={styles.summaryPrice}>
                      PKR {selectedTimeSlot.price.toLocaleString()}
                    </Text>
                  </View>
                </View>
              )}

              {/* Action Buttons */}
              <View style={styles.modalActions}>
                <Button
                  mode="outlined"
                  onPress={() => setShowTimeSlots(false)}
                  style={styles.cancelButton}
                  textColor="#666"
                >
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  onPress={handleConfirmBooking}
                  style={styles.confirmButton}
                  buttonColor="#229a60"
                  disabled={!selectedTimeSlot}
                >
                  Confirm Booking
                </Button>
              </View>
            </Card.Content>
          </Card>
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  imageContainer: {
    height: height * 0.4,
    position: 'relative',
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageActions: {
    position: 'absolute',
    top: 50,
    right: 20,
    flexDirection: 'row',
  },
  favoriteButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  dotsContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: 'white',
  },
  inactiveDot: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  contentContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
    paddingTop: 20,
    flex: 1,
  },
  venueInfo: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  venueName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    fontFamily: 'Montserrat_700Bold',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
    fontFamily: 'Montserrat_400Regular',
  },
  hoursText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
    fontFamily: 'Montserrat_400Regular',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    fontFamily: 'Montserrat_400Regular',
  },
  priceText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#229a60',
    fontFamily: 'Montserrat_700Bold',
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    fontFamily: 'Montserrat_600SemiBold',
  },
  descriptionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
    fontFamily: 'Montserrat_400Regular',
  },
  sportsContainer: {
    flexDirection: 'row',
  },
  sportItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 30,
  },
  sportIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  sportEmoji: {
    fontSize: 20,
  },
  sportName: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'Montserrat_500Medium',
  },
  facilitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  facilityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    marginBottom: 15,
  },
  facilityIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(34, 154, 96, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  facilityName: {
    fontSize: 14,
    color: '#333',
    flex: 1,
    fontFamily: 'Montserrat_400Regular',
  },
  bottomContainer: {
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  bookButton: {
    backgroundColor: '#229a60',
    borderRadius: 12,
  },
  bookButtonContent: {
    paddingVertical: 8,
  },
  modalContainer: {
    margin: 20,
    maxHeight: height * 0.8,
  },
  timeSlotsCard: {
    borderRadius: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'Montserrat_700Bold',
  },
  closeButton: {
    padding: 4,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    marginTop: 8,
    fontFamily: 'Montserrat_600SemiBold',
  },
  dateScroll: {
    marginBottom: 20,
  },
  dateOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    minWidth: 80,
  },
  selectedDateOption: {
    backgroundColor: '#229a60',
  },
  dateOptionText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'Montserrat_500Medium',
  },
  selectedDateOptionText: {
    color: 'white',
  },
  dateOptionDay: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 4,
    fontFamily: 'Montserrat_700Bold',
  },
  selectedDateOptionDay: {
    color: 'white',
  },
  timeSlotsScroll: {
    maxHeight: 300,
    marginBottom: 20,
  },
  timeSlotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  timeSlotCard: {
    width: (width - 80) / 2,
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  selectedSlot: {
    backgroundColor: '#229a60',
    borderColor: '#229a60',
  },
  unavailableSlot: {
    backgroundColor: '#F0F0F0',
    borderColor: '#E0E0E0',
    opacity: 0.6,
  },
  timeSlotTime: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
    fontFamily: 'Montserrat_600SemiBold',
  },
  selectedSlotText: {
    color: 'white',
  },
  unavailableSlotText: {
    color: '#999',
  },
  timeSlotPrice: {
    fontSize: 12,
    color: '#229a60',
    fontFamily: 'Montserrat_500Medium',
  },
  selectedSlotPrice: {
    color: 'rgba(255,255,255,0.9)',
  },
  unavailableSlotPrice: {
    color: '#999',
  },
  bookedText: {
    fontSize: 10,
    color: '#F44336',
    marginTop: 2,
    fontFamily: 'Montserrat_500Medium',
  },
  selectedSlotSummary: {
    backgroundColor: 'rgba(34, 154, 96, 0.1)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Montserrat_500Medium',
  },
  summaryValue: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'Montserrat_600SemiBold',
  },
  summaryPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#229a60',
    fontFamily: 'Montserrat_700Bold',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    borderColor: '#E0E0E0',
  },
  confirmButton: {
    flex: 1,
  },
});