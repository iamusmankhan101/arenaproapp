import { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  TouchableOpacity,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Linking
} from 'react-native';
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  updateDoc,
  doc
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import {
  Text,
  Button,
  Modal,
  Portal,
  Card
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { toggleFavorite, fetchFavorites, fetchTurfDetails } from '../../store/slices/turfSlice';
import { fetchAvailableSlots, clearAvailableSlots } from '../../store/slices/bookingSlice';
import { MaterialIcons } from '@expo/vector-icons';
import { safeDateString, isValidDate } from '../../utils/dateUtils';
import { theme } from '../../theme/theme';
import { TurfCardSkeleton } from '../../components/SkeletonLoader';

const { width, height } = Dimensions.get('window');

export default function TurfDetailScreen({ route, navigation }) {
  const { turfId } = route.params;
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showTimeSlots, setShowTimeSlots] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    // Ensure we have a valid date
    if (isNaN(today.getTime())) {
      console.error('❌ TurfDetailScreen: Invalid initial date, using fallback');
      return new Date(Date.now()); // Fallback to current timestamp
    }
    return today;
  });
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);

  // Review states
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [reviews, setReviews] = useState([]);


  const dispatch = useDispatch();
  const { favorites, selectedTurf } = useSelector(state => state.turf);
  const { availableSlots, loading: slotsLoading, error: slotsError } = useSelector(state => state.booking);
  const { user } = useSelector(state => state.auth);

  // Debug Redux state
  useEffect(() => {
    console.log('🔍 TurfDetailScreen Redux State:', {
      availableSlots: availableSlots?.length || 0,
      slotsLoading,
      slotsError,
      showTimeSlots
    });
  }, [availableSlots, slotsLoading, slotsError, showTimeSlots]);

  // Check if current venue is in favorites
  const isFavorite = favorites.some(fav => fav.id === turfId);

  // Load turf details and favorites on component mount
  useEffect(() => {
    console.log(`🔄 TurfDetailScreen: Loading details for venue ${turfId}`);
    dispatch(fetchTurfDetails(turfId));
    dispatch(fetchFavorites());
  }, [dispatch, turfId]);

  // Subscribe to real-time reviews
  useEffect(() => {
    if (!turfId) return;

    const reviewsRef = collection(db, 'venues', turfId, 'reviews');
    const q = query(reviewsRef, orderBy('date', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedReviews = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          // Convert Firestore timestamp to JS Date, fallback to now if missing
          date: data.date?.toDate() || new Date(),
        };
      });
      setReviews(fetchedReviews);
    }, (error) => {
      console.error('Error fetching reviews:', error);
    });

    return () => unsubscribe();
  }, [turfId]);

  // Load available slots when date changes
  useEffect(() => {
    if (showTimeSlots && selectedDate) {
      const dateString = safeDateString(selectedDate);
      if (dateString) {
        // Clear previous slots before fetching new ones
        dispatch(clearAvailableSlots());
        dispatch(fetchAvailableSlots({ turfId, date: dateString }));
      } else {
        console.error('❌ TurfDetailScreen: Could not get valid date string from selectedDate:', selectedDate);
      }
    }
  }, [dispatch, turfId, selectedDate, showTimeSlots]);



  // Self-Healing: Sync stats for existing venues that have reviews but no rating on parent doc
  useEffect(() => {
    if (reviews.length > 0 && selectedTurf) {
      // Check if stats are out of sync or missing
      const currentRating = selectedTurf.rating || 0;
      const currentCount = selectedTurf.reviewCount || 0;

      // Calculate actual stats from fetched reviews
      const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
      const calculatedRating = reviews.length > 0 ? (totalRating / reviews.length) : 0;
      const calculatedCount = reviews.length;

      // Allow for small floating point differences in rating (0.1)
      const isRatingDifferent = Math.abs(currentRating - calculatedRating) > 0.1;
      const isCountDifferent = currentCount !== calculatedCount;

      if (isRatingDifferent || isCountDifferent) {
        console.log('🔄 Self-Healing: Syncing venue stats...', {
          old: { rating: currentRating, count: currentCount },
          new: { rating: calculatedRating.toFixed(1), count: calculatedCount }
        });

        const updateStats = async () => {
          try {
            const venueRef = doc(db, 'venues', turfId);
            await updateDoc(venueRef, {
              rating: parseFloat(calculatedRating.toFixed(1)),
              reviewCount: calculatedCount,
              updatedAt: serverTimestamp()
            });
            console.log('✅ Self-Healing: Stats synced successfully');
          } catch (error) {
            console.error('❌ Self-Healing: Failed to sync stats:', error);
          }
        };

        updateStats();
      }
    }
  }, [reviews, selectedTurf, turfId]);

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
    // Handle location display - ensure it's always a string
    location: rawVenue.area && rawVenue.city
      ? `${rawVenue.area}, ${rawVenue.city} `
      : rawVenue.address ||
      (typeof rawVenue.location === 'string' ? rawVenue.location :
        rawVenue.location?.city ? `${rawVenue.location.city} ` :
          'Location not specified'),

    // Handle operating hours
    hours: rawVenue.operatingHours
      ? `${rawVenue.operatingHours.open} - ${rawVenue.operatingHours.close} `
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
          icon: getSportIcon(sport),
          image: getSportImage(sport)
        };
      }
      return {
        ...sport,
        image: getSportImage(sport.name || sport)
      };
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
      : [getDefaultImage(rawVenue.sports?.[0] || 'Football')]
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

  function getSportImage(sport) {
    const images = {
      'Cricket': require('../../images/cricket (1).png'),
      'Football': require('../../images/game.png'),
      'Futsal': require('../../images/game.png'),
      'Padel': require('../../images/padel (1).png'),
      'Basketball': require('../../images/game.png'),
      'Tennis': require('../../images/padel (1).png')
    };
    return images[sport] || require('../../images/game.png');
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
    console.log('🎯 TurfDetailScreen: Opening booking modal, clearing cache');
    // Clear any cached slots and force fresh fetch
    dispatch(clearAvailableSlots());
    setSelectedTimeSlot(null);
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

    // Validate selectedDate using safe utilities
    if (!isValidDate(selectedDate)) {
      console.error('❌ TurfDetailScreen: Invalid selected date:', selectedDate);
      Alert.alert('Error', 'Please select a valid date');
      return;
    }

    // Convert date to YYYY-MM-DD format using safe utility
    const dateString = safeDateString(selectedDate);
    if (!dateString) {
      console.error('❌ TurfDetailScreen: Could not get date string from selectedDate:', selectedDate);
      Alert.alert('Error', 'Invalid date selected');
      return;
    }

    console.log('🎯 TurfDetailScreen: Date string for booking:', dateString);

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
      date: dateString // Use safe date string
    };

    setShowTimeSlots(false);
    navigation.navigate('BookingConfirm', bookingData);
  };

  const generateDateOptions = () => {
    const dates = [];
    const today = new Date();

    // Only show dates for the next 30 days to allow admin to configure them
    for (let i = 0; i < 30; i++) {
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
        <MaterialIcons key={i} name="star" size={16} color={theme.colors.secondary} />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <MaterialIcons key="half" name="star-half" size={16} color={theme.colors.secondary} />
      );
    }

    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(
        <MaterialIcons key={`empty - ${i} `} name="star-border" size={16} color={theme.colors.secondary} />
      );
    }

    return stars;
  };

  // Review functions
  const handleSubmitReview = async () => {
    if (userRating === 0) {
      Alert.alert('Rating Required', 'Please select a star rating before submitting.');
      return;
    }
    if (!reviewText.trim()) {
      Alert.alert('Review Required', 'Please write a review comment.');
      return;
    }

    try {
      // 1. Add the new review to the subcollection
      const reviewsRef = collection(db, 'venues', turfId, 'reviews');
      await addDoc(reviewsRef, {
        userName: user?.displayName || user?.fullName || user?.name || 'Anonymous User',
        userId: user?.uid || 'anonymous',
        rating: userRating,
        comment: reviewText.trim(),
        date: serverTimestamp(),
      });

      // 2. Calculate new average rating and review count
      // We need to include the new rating in the calculation
      const currentReviews = [...reviews, { rating: userRating }];
      const totalRating = currentReviews.reduce((sum, review) => sum + review.rating, 0);
      const newAverageRating = (totalRating / currentReviews.length).toFixed(1);
      const newReviewCount = currentReviews.length;

      console.log('⭐ Updating venue stats:', {
        averageRating: parseFloat(newAverageRating),
        reviewCount: newReviewCount
      });

      // 3. Update the parent venue document
      const venueRef = doc(db, 'venues', turfId);
      await updateDoc(venueRef, {
        rating: parseFloat(newAverageRating),
        reviewCount: newReviewCount,
        updatedAt: serverTimestamp()
      });

      setShowReviewModal(false);
      setUserRating(0);
      setReviewText('');
      Alert.alert('Success', 'Your review has been submitted!');

      // Force refresh data
      dispatch(fetchTurfDetails(turfId));
    } catch (error) {
      console.error('Error submitting review:', error);
      Alert.alert('Error', 'Failed to submit review. Please try again.');
    }
  };

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  const formatReviewDate = (date) => {
    const now = new Date();
    // Reset time to start of day for accurate day comparison
    const nowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const diffTime = nowStart - dateStart;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const renderReviewStars = (rating, size = 20, interactive = false, onPress = null) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity
          key={i}
          onPress={() => interactive && onPress && onPress(i)}
          disabled={!interactive}
        >
          <MaterialIcons
            name={i <= rating ? 'star' : 'star-border'}
            size={size}
            color={i <= rating ? theme.colors.secondary : '#ccc'}
          />
        </TouchableOpacity>
      );
    }
    return <View style={styles.starsRow}>{stars}</View>;
  };

  return (
    <View style={styles.container}>
      {!venue ? (
        <ScrollView showsVerticalScrollIndicator={false}>
          <TurfCardSkeleton />
          <TurfCardSkeleton />
        </ScrollView>
      ) : (
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
                onPress={() => {
                  if (navigation.canGoBack()) {
                    navigation.goBack();
                  } else {
                    // Navigate to Home tab within MainTabs
                    navigation.navigate('Home');
                  }
                }}
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
                <Text style={styles.locationText}>{typeof venue.location === 'string' ? venue.location : `${venue.location?.city || 'Unknown City'} `}</Text>
                <TouchableOpacity
                  style={styles.directionsButton}
                  onPress={() => {
                    // Try multiple possible coordinate locations
                    const coords = venue.coordinates || rawVenue.coordinates || selectedTurf?.coordinates;
                    console.log('🗺️ Directions button pressed:', {
                      venueCoords: venue.coordinates,
                      rawCoords: rawVenue.coordinates,
                      selectedCoords: selectedTurf?.coordinates,
                      finalCoords: coords
                    });

                    if (coords && coords.latitude && coords.longitude) {
                      const lat = coords.latitude;
                      const lng = coords.longitude;
                      const url = Platform.select({
                        ios: `maps:0,0?q=${lat},${lng}`,
                        android: `geo:0,0?q=${lat},${lng}(${venue.name})`
                      });
                      console.log('🗺️ Opening maps with URL:', url);
                      Linking.openURL(url).catch(err => {
                        console.error('❌ Failed to open maps:', err);
                        Alert.alert('Error', 'Unable to open maps');
                      });
                    } else {
                      console.error('❌ No valid coordinates found');
                      Alert.alert('Error', 'Location coordinates not available');
                    }
                  }}
                >
                  <MaterialIcons name="directions" size={18} color={theme.colors.primary} />
                  <Text style={[styles.directionsText, { color: theme.colors.primary }]}>Directions</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.hoursRow}>
                <MaterialIcons name="schedule" size={16} color="#666" />
                <Text style={styles.hoursText}>{venue.hours}</Text>
              </View>

              <View style={styles.ratingRow}>
                <View style={[styles.starsContainer, {
                  backgroundColor: theme.colors.primary,
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 12
                }]}>
                  {renderStars(parseFloat(calculateAverageRating()))}
                </View>
                <Text style={[styles.ratingNumeric, { color: theme.colors.primary }]}>
                  {calculateAverageRating()}
                </Text>
                <Text style={styles.ratingText}>• {reviews.length} reviews</Text>
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
                      <View style={[styles.sportIcon, { backgroundColor: theme.colors.secondary }]}>
                        <Image
                          source={sport.image}
                          style={[styles.sportImage, { tintColor: theme.colors.primary }]}
                          resizeMode="contain"
                        />
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
                        <MaterialIcons name={facility.icon} size={20} color={theme.colors.primary} />
                      </View>
                      <Text style={styles.facilityName}>{facility.name}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Reviews Section */}
            <View style={styles.section}>
              <View style={styles.reviewsHeader}>
                <Text style={styles.sectionTitle}>Reviews</Text>
                <TouchableOpacity
                  style={[styles.writeReviewButton, { backgroundColor: theme.colors.primary }]}
                  onPress={() => setShowReviewModal(true)}
                >
                  <MaterialIcons name="rate-review" size={18} color={theme.colors.secondary} />
                  <Text style={[styles.writeReviewText, { color: theme.colors.secondary }]}>
                    Write Review
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Review Statistics */}
              <View style={styles.reviewStats}>
                <View style={styles.averageRatingContainer}>
                  <Text style={[styles.averageRating, { color: theme.colors.primary }]}>
                    {calculateAverageRating()}
                  </Text>
                  <View style={styles.averageStars}>
                    {renderReviewStars(parseFloat(calculateAverageRating()), 16)}
                  </View>
                  <Text style={styles.totalReviews}>{reviews.length} reviews</Text>
                </View>
              </View>

              {/* Reviews List */}
              <View style={styles.reviewsList}>
                {reviews.slice(0, 3).map((review) => (
                  <View key={review.id} style={styles.reviewItem}>
                    <View style={styles.reviewHeader}>
                      <View style={styles.reviewerInfo}>
                        <View style={[styles.reviewerAvatar, { backgroundColor: theme.colors.secondary }]}>
                          <Text style={[styles.reviewerInitial, { color: theme.colors.primary }]}>
                            {review.userName.charAt(0).toUpperCase()}
                          </Text>
                        </View>
                        <View>
                          <Text style={styles.reviewerName}>{review.userName}</Text>
                          <Text style={styles.reviewDate}>{formatReviewDate(review.date)}</Text>
                        </View>
                      </View>
                      <View style={styles.reviewRatingContainer}>
                        {renderReviewStars(review.rating, 14)}
                      </View>
                    </View>
                    <Text style={styles.reviewComment}>{review.comment}</Text>
                  </View>
                ))}
                {reviews.length > 3 && (
                  <TouchableOpacity style={styles.seeAllReviews}>
                    <Text style={[styles.seeAllText, { color: theme.colors.primary }]}>
                      See all {reviews.length} reviews
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </ScrollView>
      )}

      {/* Bottom Book Button */}
      <View style={styles.bottomContainer}>
        <Button
          mode="contained"
          onPress={handleBooking}
          style={[styles.bookButton, { backgroundColor: theme.colors.primary }]}
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
                      selectedDate.toDateString() === date.toDateString() && { backgroundColor: theme.colors.primary }
                    ]}
                    onPress={() => {
                      // Validate date before setting it using safe utilities
                      if (isValidDate(date)) {
                        setSelectedDate(date);
                      } else {
                        console.error('❌ TurfDetailScreen: Invalid date selected:', date);
                      }
                    }}
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
              {slotsLoading ? (
                <View style={styles.loadingContainer}>
                  <Text style={styles.loadingText}>Loading time slots...</Text>
                </View>
              ) : slotsError ? (
                <View style={styles.noSlotsContainer}>
                  <Text style={styles.noSlotsText}>Error loading time slots</Text>
                  <Text style={styles.noSlotsSubtext}>{slotsError}</Text>
                </View>
              ) : (
                <ScrollView style={styles.timeSlotsScroll} showsVerticalScrollIndicator={false}>
                  <View style={styles.timeSlotsGrid}>
                    {(() => {
                      // Only use admin-configured date-specific slots from Redux - no fallback
                      const slotsToShow = availableSlots || [];
                      console.log(`🕐 TurfDetailScreen: Displaying ${slotsToShow.length} admin - configured time slots`);
                      console.log(`   - Redux availableSlots: ${availableSlots?.length || 0} `);
                      console.log(`   - Using: Admin - configured date - specific slots only`);

                      if (slotsToShow.length === 0) {
                        console.log('⚠️ TurfDetailScreen: No admin-configured slots for this date');
                      }

                      return slotsToShow.map((slot) => (
                        <TouchableOpacity
                          key={slot.id}
                          style={[
                            styles.timeSlotCard,
                            !slot.available && styles.unavailableSlot,
                            selectedTimeSlot?.id === slot.id && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }
                          ]}
                          onPress={() => handleTimeSlotSelect(slot)}
                          disabled={!slot.available}
                        >
                          <Text style={[
                            styles.timeSlotTime,
                            !slot.available && styles.unavailableSlotText,
                            selectedTimeSlot?.id === slot.id && styles.selectedSlotText
                          ]}>
                            {slot.time || slot.startTime} - {slot.endTime}
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
                      ));
                    })()}
                  </View>
                  {(!availableSlots || availableSlots.length === 0) && (
                    <View style={styles.noSlotsContainer}>
                      <Text style={styles.noSlotsText}>No time slots configured for this date</Text>
                      <Text style={styles.noSlotsSubtext}>Admin needs to configure slots for this date in the admin panel</Text>
                    </View>
                  )}
                </ScrollView>
              )}

              {/* Selected Slot Summary */}
              {selectedTimeSlot && (
                <View style={[styles.selectedSlotSummary, { backgroundColor: `${theme.colors.secondary} 20` }]}>
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
                    <Text style={[styles.summaryPrice, { color: theme.colors.primary }]}>
                      PKR {selectedTimeSlot.price.toLocaleString()}
                    </Text>
                  </View>
                </View>
              )}

              {/* Action Buttons */}
              <View style={styles.modalActions}>
                <Button
                  mode="contained"
                  onPress={() => setShowTimeSlots(false)}
                  style={[styles.cancelButton, { backgroundColor: theme.colors.secondary }]}
                  textColor={theme.colors.primary}
                  contentStyle={styles.buttonContent}
                  labelStyle={{ color: theme.colors.primary }}
                >
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  onPress={handleConfirmBooking}
                  style={[
                    styles.confirmButton,
                    {
                      backgroundColor: !selectedTimeSlot
                        ? `${theme.colors.primary} 80` // 50% opacity when disabled
                        : theme.colors.primary
                    }
                  ]}
                  textColor={theme.colors.secondary}
                  contentStyle={styles.buttonContent}
                  labelStyle={{ color: theme.colors.secondary }}
                  disabled={!selectedTimeSlot}
                >
                  Confirm Booking
                </Button>
              </View>
            </Card.Content>
          </Card>
        </Modal>

        {/* Enhanced Review Submission Modal */}
        <Modal
          visible={showReviewModal}
          onDismiss={() => {
            setShowReviewModal(false);
            setUserRating(0);
            setReviewText('');
          }}
          contentContainerStyle={styles.modalContainer}
        >
          <Card style={styles.reviewModalCard}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
            >
              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                <Card.Content>
                  {/* Header with close button */}
                  <View style={styles.modalHeader}>
                    <View>
                      <Text style={styles.modalTitle}>Write a Review</Text>
                      <Text style={styles.modalSubtitle}>{venue.name}</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => {
                        setShowReviewModal(false);
                        setUserRating(0);
                        setReviewText('');
                      }}
                      style={styles.closeButton}
                    >
                      <MaterialIcons name="close" size={24} color="#666" />
                    </TouchableOpacity>
                  </View>

                  {/* Enhanced Star Rating Selector */}
                  <View style={styles.ratingSection}>
                    <Text style={styles.ratingLabel}>How would you rate this venue?</Text>
                    <View style={styles.starsWrapper}>
                      {renderReviewStars(userRating, 40, true, setUserRating)}
                    </View>
                    {userRating > 0 && (
                      <View style={[styles.ratingFeedback, { backgroundColor: `${theme.colors.secondary}20` }]}>
                        <MaterialIcons name="check-circle" size={20} color={theme.colors.primary} />
                        <Text style={[styles.ratingFeedbackText, { color: theme.colors.primary }]}>
                          {userRating === 5 && 'Excellent!'}
                          {userRating === 4 && 'Very Good!'}
                          {userRating === 3 && 'Good'}
                          {userRating === 2 && 'Fair'}
                          {userRating === 1 && 'Poor'}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Enhanced Review Text Input */}
                  <View style={styles.reviewTextSection}>
                    <Text style={styles.reviewTextLabel}>Share your experience</Text>
                    <Text style={styles.reviewTextHint}>
                      Tell others about the facilities, staff, and overall experience
                    </Text>
                    <TextInput
                      style={styles.reviewTextInput}
                      placeholder="Write your review here..."
                      placeholderTextColor="#999"
                      multiline
                      numberOfLines={4}
                      value={reviewText}
                      onChangeText={setReviewText}
                      textAlignVertical="top"
                    />
                    <Text style={styles.characterCount}>
                      {reviewText.length} characters
                    </Text>
                  </View>

                  {/* Enhanced Action Buttons */}
                  <View style={styles.reviewModalActions}>
                    <Button
                      mode="outlined"
                      onPress={() => {
                        setShowReviewModal(false);
                        setUserRating(0);
                        setReviewText('');
                      }}
                      style={[styles.reviewCancelButton, { borderColor: theme.colors.primary }]}
                      textColor={theme.colors.primary}
                      contentStyle={styles.buttonContent}
                      labelStyle={{ fontFamily: 'Montserrat_600SemiBold' }}
                    >
                      Cancel
                    </Button>
                    <Button
                      mode="contained"
                      onPress={handleSubmitReview}
                      style={[styles.reviewSubmitButton, { backgroundColor: theme.colors.primary }]}
                      textColor={theme.colors.secondary}
                      contentStyle={styles.buttonContent}
                      labelStyle={{ fontFamily: 'Montserrat_700Bold' }}
                      icon="send"
                    >
                      Submit Review
                    </Button>
                  </View>
                </Card.Content>
              </ScrollView>
            </KeyboardAvoidingView>
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
  directionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(94, 53, 177, 0.1)',
    marginLeft: 'auto',
  },
  directionsText: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'Montserrat_600SemiBold',
  },
  hoursRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
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
  ratingNumeric: {
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
    fontFamily: 'Montserrat_700Bold',
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
    color: '#004d43',
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
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  sportImage: {
    width: 24,
    height: 24,
    // tintColor will be set dynamically using theme.colors.primary
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
    backgroundColor: 'rgba(0, 77, 67, 0.1)',
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
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 4,
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
    backgroundColor: '#004d43',
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
    backgroundColor: '#004d43',
    borderColor: '#004d43',
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
    backgroundColor: 'rgba(232, 238, 38, 0.2)',
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
    color: '#004d43',
    fontFamily: 'Montserrat_700Bold',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
  },
  confirmButton: {
    flex: 1,
  },
  buttonContent: {
    paddingVertical: 4,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Montserrat_400Regular',
  },
  noSlotsContainer: {
    padding: 40,
    alignItems: 'center',
  },
  noSlotsText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontFamily: 'Montserrat_500Medium',
  },
  noSlotsSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
    fontFamily: 'Montserrat_400Regular',
  },
  // Review styles
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  writeReviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    elevation: 2,
  },
  writeReviewText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Montserrat_600SemiBold',
  },
  reviewStats: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    alignItems: 'center',
  },
  averageRatingContainer: {
    alignItems: 'center',
  },
  averageRating: {
    fontSize: 48,
    fontWeight: '700',
    fontFamily: 'Montserrat_700Bold',
    marginBottom: 8,
  },
  averageStars: {
    marginBottom: 4,
  },
  totalReviews: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Montserrat_400Regular',
  },
  reviewsList: {
    gap: 16,
  },
  reviewItem: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    borderWidth: 0,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  reviewerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  reviewerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    elevation: 2,
  },
  reviewerInitial: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'Montserrat_700Bold',
  },
  reviewerName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
    fontFamily: 'Montserrat_700Bold',
    marginBottom: 2,
    maxWidth: 150,
  },
  reviewDate: {
    fontSize: 12,
    color: '#888',
    fontFamily: 'Montserrat_500Medium',
  },
  reviewRatingContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  reviewComment: {
    fontSize: 14,
    color: '#444',
    lineHeight: 22,
    fontFamily: 'Montserrat_400Regular',
    marginLeft: 4,
  },
  seeAllReviews: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Montserrat_600SemiBold',
  },
  starsRow: {
    flexDirection: 'row',
    gap: 4,
  },
  // Review modal styles
  reviewModalCard: {
    borderRadius: 24,
    maxHeight: '90%',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    fontFamily: 'Montserrat_400Regular',
  },
  ratingSection: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    marginBottom: 4,
  },
  ratingLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
    marginBottom: 18,
    fontFamily: 'Montserrat_600SemiBold',
  },
  starsWrapper: {
    marginVertical: 10,
    paddingHorizontal: 10,
  },
  ratingFeedback: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
    marginTop: 14,
  },
  ratingFeedbackText: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'Montserrat_600SemiBold',
  },
  ratingValue: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 8,
    fontFamily: 'Montserrat_500Medium',
  },
  reviewTextSection: {
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  reviewTextLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
    fontFamily: 'Montserrat_600SemiBold',
  },
  reviewTextHint: {
    fontSize: 13,
    color: '#999',
    marginBottom: 14,
    fontFamily: 'Montserrat_400Regular',
    lineHeight: 19,
  },
  reviewTextInput: {
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    borderRadius: 14,
    padding: 16,
    fontSize: 15,
    minHeight: 110,
    maxHeight: 150,
    fontFamily: 'Montserrat_400Regular',
    color: '#333',
    backgroundColor: '#fafafa',
  },
  characterCount: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
    textAlign: 'right',
    fontFamily: 'Montserrat_400Regular',
  },
  reviewModalActions: {
    flexDirection: 'row',
    gap: 14,
    marginTop: 24,
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  reviewCancelButton: {
    flex: 1,
    borderWidth: 2,
    borderRadius: 14,
  },
  reviewSubmitButton: {
    flex: 1,
    borderRadius: 14,
  },
});