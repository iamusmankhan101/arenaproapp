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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
  const [selectedTimeSlots, setSelectedTimeSlots] = useState([]);
  const insets = useSafeAreaInsets();

  // Review states
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [reviews, setReviews] = useState([]);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [activeTab, setActiveTab] = useState('About'); // New Tab state


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
      const fetchedReviews = snapshot.docs
        .map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            // Convert Firestore timestamp to JS Date, fallback to now if missing
            date: data.date?.toDate() || new Date(),
          };
        })
        .filter(review => !review.status || review.status === 'approved'); // Only show approved or legacy reviews

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

  // Normalize sports data before transforming venue with safe checks
  let normalizedSports = [];
  const sportsData = rawVenue.sports || rawVenue.availableSports;
  
  if (sportsData) {
    if (typeof sportsData === 'string' && sportsData.trim()) {
      // Only split if it's a non-empty string
      normalizedSports = sportsData.split(',').map(s => s?.trim()).filter(Boolean);
    } else if (Array.isArray(sportsData)) {
      // Ensure array items are valid strings
      normalizedSports = sportsData.filter(s => s && (typeof s === 'string' || (s && s.name)));
    }
  }

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
    availableSports: normalizedSports.map(sport => {
      if (!sport) return null; // Skip null/undefined
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
    }).filter(Boolean), // Remove null values

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

    // Handle images - transform string URLs to { uri: url } objects
    images: (rawVenue.images && rawVenue.images.length > 0
      ? rawVenue.images
      : [getDefaultImage(rawVenue.sports?.[0] || 'Football')]
    ).map(img => typeof img === 'string' ? { uri: img } : img)
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
      'Cricket': require('../../images/cricket_icon.png'),
      'Football': require('../../images/game.png'),
      'Futsal': require('../../images/game.png'),
      'Padel': require('../../images/padel_icon.png'),
      'Basketball': require('../../images/game.png'),
      'Tennis': require('../../images/padel_icon.png')
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
    ).filter(Boolean); // Remove undefined/null values

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
    setSelectedTimeSlots([]);
    setShowTimeSlots(true);
  };

  const handleTimeSlotSelect = (slot) => {
    if (!slot.available) return;

    setSelectedTimeSlots(prev => {
      const exists = prev.find(s => s.id === slot.id);
      if (exists) {
        // Deselect
        return prev.filter(s => s.id !== slot.id);
      } else {
        // Select and sort by start time
        const newSelection = [...prev, slot].sort((a, b) => {
          return a.startTime.localeCompare(b.startTime);
        });
        return newSelection;
      }
    });
  };

  const handleConfirmBooking = () => {
    if (selectedTimeSlots.length === 0) {
      Alert.alert('Error', 'Please select at least one time slot');
      return;
    }

    // Validate continuity
    // Assuming slots are already sorted by time in state update
    const isContiguous = selectedTimeSlots.every((slot, index) => {
      if (index === 0) return true;
      const prevSlot = selectedTimeSlots[index - 1];
      // Simple check: current start should equal prev end
      // Note: This assumes standard formatting logic. 
      // If end time is "06:00" and next start is "06:00", it matches.
      return slot.startTime === prevSlot.endTime;
    });

    if (!isContiguous) {
      Alert.alert('Invalid Selection', 'Please select consecutive time slots for a single booking.');
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
    console.log('🔍 DEBUG: TurfDetail - selectedDate object:', selectedDate);
    console.log('🔍 DEBUG: TurfDetail - safeDateString result:', dateString);

    if (!dateString) {
      console.error('❌ TurfDetailScreen: Could not get date string from selectedDate:', selectedDate);
      Alert.alert('Error', 'Invalid date selected');
      return;
    }

    console.log('🎯 TurfDetailScreen: Date string for booking:', dateString);

    // Merge slots for the next screen
    const firstSlot = selectedTimeSlots[0];
    const lastSlot = selectedTimeSlots[selectedTimeSlots.length - 1];
    const totalPrice = selectedTimeSlots.reduce((sum, s) => sum + s.price, 0);

    // Determine mixed price type if applicable
    const uniquePriceTypes = [...new Set(selectedTimeSlots.map(s => getPriceType(s.time || s.startTime)))];
    const combinedPriceType = uniquePriceTypes.join(' / ');

    const mergedSlot = {
      ...firstSlot,
      startTime: firstSlot.time || firstSlot.startTime,
      endTime: lastSlot.endTime,
      price: totalPrice,
      priceType: combinedPriceType, // e.g. "Day / Evening"
      originalSlots: selectedTimeSlots
    };

    const bookingData = {
      turf: {
        id: venue.id,
        name: venue.name,
        address: venue.location,
        phoneNumber: '03390078965'
      },
      slot: mergedSlot,
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

    setIsSubmittingReview(true);

    try {
      // 1. Add the new review to the subcollection
      const reviewsRef = collection(db, 'venues', turfId, 'reviews');
      await addDoc(reviewsRef, {
        userName: user?.fullName || user?.displayName || user?.name || 'Anonymous User',
        userId: user?.uid || 'anonymous',
        rating: userRating,
        comment: reviewText.trim(),
        date: serverTimestamp(),
        status: 'pending' // New reviews are pending approval
      });

      // 2. Calculate new average rating and review count
      // Note: We normally wouldn't update stats for pending reviews, but to keep it simple for now
      // we will still update the stats. If strict moderation is needed, this should be moved to a backend trigger.
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

      // Update alert to inform user about approval process
      Alert.alert(
        'Review Submitted',
        'Thank you! Your review has been submitted and will be visible after approval.'
      );

      // Force refresh data
      dispatch(fetchTurfDetails(turfId));
    } catch (error) {
      console.error('Error submitting review:', error);
      Alert.alert('Error', 'Failed to submit review. Please try again.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  const formatReviewDate = (date) => {
    if (!date) return '';

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
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;

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
        <>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Modern Header Image */}
            <View style={styles.imageContainer}>
              <Image
                source={venue.images[currentImageIndex]}
                style={styles.headerImage}
                resizeMode="cover"
              />

              {/* Top Navigation Buttons */}
              <View style={styles.topNav}>
                <TouchableOpacity
                  style={styles.circularButton}
                  onPress={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Home')}
                >
                  <MaterialIcons name="arrow-back" size={22} color="#000" />
                </TouchableOpacity>

                <View style={styles.headerRightActions}>
                  <TouchableOpacity style={styles.circularButton}>
                    <MaterialIcons name="share" size={20} color="#000" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.circularButton, { marginLeft: 12 }]}
                    onPress={handleFavoriteToggle}
                  >
                    <MaterialIcons
                      name={isFavorite ? "favorite" : "favorite-border"}
                      size={20}
                      color={isFavorite ? "#F44336" : "#000"}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Gallery Glimpse Over Image */}
              <View style={styles.galleryGlimpse}>
                {venue.images.slice(0, 5).map((img, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => setCurrentImageIndex(index)}
                    style={[
                      styles.glimpseThumbContainer,
                      currentImageIndex === index && styles.activeGlimpse
                    ]}
                  >
                    <Image source={img} style={styles.glimpseThumb} />
                  </TouchableOpacity>
                ))}
                {venue.images.length > 5 && (
                  <TouchableOpacity
                    style={styles.glimpseMore}
                    onPress={() => setActiveTab('Gallery')}
                  >
                    <Text style={styles.glimpseMoreText}>+{venue.images.length - 5}</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Content Container */}
            <View style={styles.contentContainer}>
              {/* Discount Badge & Rating */}
              <View style={styles.venueHeaderSection}>
                <View style={styles.badgeRow}>
                  <View style={styles.discountBadge}>
                    <Text style={styles.discountText}>20% Off</Text>
                  </View>
                  <View style={styles.ratingBadge}>
                    <MaterialIcons name="star" size={14} color="#FFD700" />
                    <Text style={styles.ratingValue}>{calculateAverageRating()}</Text>
                    <Text style={styles.reviewCount}>({reviews.length} reviews)</Text>
                  </View>
                </View>

                <View style={styles.titleRow}>
                  <View style={styles.titleContent}>
                    <Text style={styles.venueName}>{venue.name}</Text>
                    <Text style={styles.addressText}>{typeof venue.location === 'string' ? venue.location : venue.location?.address}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.floatingDirectionBtn}
                    onPress={() => {
                      let lat = venue.coordinates?.latitude || venue.location?.latitude || rawVenue.coordinates?.latitude || rawVenue.location?.latitude || selectedTurf?.coordinates?.latitude || selectedTurf?.location?.latitude;
                      let lng = venue.coordinates?.longitude || venue.location?.longitude || rawVenue.coordinates?.longitude || rawVenue.location?.longitude || selectedTurf?.coordinates?.longitude || selectedTurf?.location?.longitude || selectedTurf?.longitude;

                      if (lat && lng) {
                        const url = Platform.select({
                          ios: `maps:0,0?q=${lat},${lng}`,
                          android: `geo:0,0?q=${lat},${lng}(${venue.name})`
                        });
                        Linking.openURL(url);
                      } else {
                        Alert.alert('Location Error', 'Venue coordinates are not available.');
                      }
                    }}
                  >
                    <MaterialIcons name="near-me" size={24} color="#FFF" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Tabs Navigation */}
              <View style={styles.tabsContainer}>
                {['About', 'Gallery', 'Review'].map((tab) => (
                  <TouchableOpacity
                    key={tab}
                    style={[styles.tabItem, activeTab === tab && styles.activeTabItem]}
                    onPress={() => setActiveTab(tab)}
                  >
                    <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Tab Content Rendering */}
              {activeTab === 'About' && (
                <View style={styles.tabContent}>
                  {/* Description */}
                  <View style={styles.infoSection}>
                    <Text style={styles.infoTitle}>About Venue</Text>
                    <Text style={styles.descriptionText}>{venue.description}</Text>
                  </View>

                  {/* Available Sports */}
                  {venue.availableSports && venue.availableSports.length > 0 && (
                    <View style={styles.infoSection}>
                      <Text style={styles.infoTitle}>Sports Available</Text>
                      <View style={styles.sportsGrid}>
                        {venue.availableSports.map((sport, index) => (
                          <View key={index} style={styles.sportCard}>
                            <View style={styles.sportIconCircle}>
                              <Image source={sport.image} style={styles.sportIconImg} />
                            </View>
                            <Text style={styles.sportLabel}>{sport.name}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}

                  {/* Facilities */}
                  {venue.facilities && venue.facilities.length > 0 && (
                    <View style={styles.infoSection}>
                      <Text style={styles.infoTitle}>Facilities</Text>
                      <View style={styles.facilitiesGrid}>
                        {venue.facilities.map((facility, index) => (
                          <View key={index} style={styles.facilityCard}>
                            <View style={styles.facilityIconCircle}>
                              <MaterialIcons name={facility.icon} size={18} color="#004d43" />
                            </View>
                            <Text style={styles.facilityLabel}>{facility.name}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}
                </View>
              )}

              {activeTab === 'Gallery' && (
                <View style={styles.tabContent}>
                  <View style={styles.galleryHeader}>
                    <Text style={styles.galleryTitle}>Gallery ({venue.images.length})</Text>
                  </View>
                  <View style={styles.galleryGrid}>
                    {venue.images.map((img, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.galleryImageContainer}
                        onPress={() => setCurrentImageIndex(index)}
                      >
                        <Image source={img} style={styles.galleryImage} />
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {activeTab === 'Review' && (
                <View style={styles.tabContent}>
                  <View style={styles.reviewHeaderRow}>
                    <Text style={styles.reviewTitle}>Guest Reviews ({reviews.length})</Text>
                    <TouchableOpacity
                      style={styles.writeFab}
                      onPress={() => setShowReviewModal(true)}
                    >
                      <MaterialIcons name="edit" size={16} color="#004d43" />
                      <Text style={styles.writeFabText}>Write</Text>
                    </TouchableOpacity>
                  </View>

                  {reviews.length === 0 ? (
                    <View style={styles.emptyReviews}>
                      <Text style={styles.emptyText}>No reviews yet. Be the first!</Text>
                    </View>
                  ) : (
                    reviews.map((review) => (
                      <View key={review.id} style={styles.reviewItem}>
                        <View style={styles.reviewTop}>
                          <View style={styles.reviewerAvatar}>
                            <Text style={styles.avatarChar}>{review.userName.charAt(0)}</Text>
                          </View>
                          <View style={styles.reviewMeta}>
                            <Text style={styles.reviewerName}>{review.userName}</Text>
                            <View style={styles.starsRow}>
                              {renderReviewStars(review.rating, 12)}
                              <Text style={styles.reviewDate}>{formatReviewDate(review.date)}</Text>
                            </View>
                          </View>
                        </View>
                        <Text style={styles.reviewComment}>{review.comment}</Text>
                      </View>
                    ))
                  )}
                </View>
              )}
            </View>
          </ScrollView>

          {/* Sticky Bottom Container */}
          <View style={[styles.stickyBottom, { paddingBottom: insets.bottom || 20 }]}>
            <View style={styles.priceContainer}>
              <Text style={styles.bottomPriceLabel}>Total Price</Text>
              <View style={styles.priceRow}>
                <Text style={styles.bottomPriceAmount}>PKR {venue.priceFrom.toLocaleString()}</Text>
                <Text style={styles.bottomPriceUnit}> /hour</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.bookNowBtn}
              onPress={handleBooking}
            >
              <Text style={styles.bookNowText}>Book Now</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* Time Slot Selection Modal */}
      <Portal>
        <Modal
          visible={showTimeSlots}
          onDismiss={() => setShowTimeSlots(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <View style={[styles.modalContent, { height: height * 0.8 }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Time Slot</Text>
              <TouchableOpacity
                onPress={() => setShowTimeSlots(false)}
                style={styles.closeButton}
              >
                <MaterialIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={{ flex: 1 }}>
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20, paddingHorizontal: 20 }}
              >
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
                {slotsLoading ? (
                  <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Loading time slots...</Text>
                  </View>
                ) : (
                  <View style={styles.timeSlotsGrid}>
                    {(availableSlots || []).map((slot) => {
                      const isSelected = selectedTimeSlots.some(s => s.id === slot.id);
                      return (
                        <TouchableOpacity
                          key={slot.id}
                          style={[
                            styles.timeSlotCard,
                            !slot.available && styles.unavailableSlot,
                            isSelected && styles.selectedSlot
                          ]}
                          onPress={() => handleTimeSlotSelect(slot)}
                          disabled={!slot.available}
                        >
                          <Text style={[
                            styles.timeSlotTime,
                            isSelected && styles.selectedSlotText
                          ]}>
                            {slot.time || slot.startTime} - {slot.endTime}
                          </Text>
                          <Text style={[
                            styles.timeSlotPrice,
                            isSelected && styles.selectedSlotPrice
                          ]}>
                            PKR {slot.price.toLocaleString()} /hour
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </ScrollView>
            </View>

            <View style={styles.modalActions}>
              <Button
                mode="contained"
                onPress={handleConfirmBooking}
                style={[styles.confirmButton, { backgroundColor: selectedTimeSlots.length === 0 ? '#ccc' : '#004d43' }]}
                disabled={selectedTimeSlots.length === 0}
              >
                Confirm Booking
              </Button>
            </View>
          </View>
        </Modal>

        {/* Review Modal */}
        <Modal
          visible={showReviewModal}
          onDismiss={() => setShowReviewModal(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Card style={styles.reviewModalCard}>
            <Card.Content>
              <Text style={styles.modalTitle}>Write a Review</Text>
              <View style={styles.ratingSection}>
                {renderReviewStars(userRating, 40, true, setUserRating)}
              </View>
              <TextInput
                style={styles.reviewTextInput}
                placeholder="Share your experience..."
                multiline
                numberOfLines={4}
                value={reviewText}
                onChangeText={setReviewText}
              />
              <View style={styles.reviewModalActions}>
                <Button onPress={() => setShowReviewModal(false)}>Cancel</Button>
                <Button
                  mode="contained"
                  onPress={handleSubmitReview}
                  loading={isSubmittingReview}
                >
                  Submit
                </Button>
              </View>
            </Card.Content>
          </Card>
        </Modal>
      </Portal>
    </View >
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  imageContainer: {
    height: height * 0.45,
    position: 'relative',
    backgroundColor: '#f0f0f0',
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  topNav: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  circularButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerRightActions: {
    flexDirection: 'row',
  },
  galleryGlimpse: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  glimpseThumbContainer: {
    width: 50,
    height: 50,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
    marginRight: 10,
    backgroundColor: '#fff',
  },
  activeGlimpse: {
    borderColor: '#e8ee26',
  },
  glimpseThumb: {
    width: '100%',
    height: '100%',
  },
  glimpseMore: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  glimpseMoreText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  contentContainer: {
    flex: 1,
    marginTop: -20,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 24,
  },
  venueHeaderSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  discountBadge: {
    backgroundColor: '#e8ee26',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  discountText: {
    color: '#004d43',
    fontSize: 12,
    fontFamily: 'Montserrat_700Bold',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingValue: {
    fontSize: 14,
    fontFamily: 'Montserrat_700Bold',
    color: '#333',
  },
  reviewCount: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'Montserrat_400Regular',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleContent: {
    flex: 1,
    marginRight: 10,
  },
  venueName: {
    fontSize: 24,
    fontFamily: 'Montserrat_700Bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Montserrat_400Regular',
  },
  floatingDirectionBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#004d43',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    marginBottom: 20,
  },
  tabItem: {
    paddingVertical: 12,
    marginRight: 24,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTabItem: {
    borderBottomColor: '#004d43',
  },
  tabText: {
    fontSize: 15,
    fontFamily: 'Montserrat_600SemiBold',
    color: '#999',
  },
  activeTabText: {
    color: '#004d43',
  },
  tabContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  infoSection: {
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 18,
    fontFamily: 'Montserrat_700Bold',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 14,
    color: '#444',
    lineHeight: 22,
    fontFamily: 'Montserrat_400Regular',
  },
  sportsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  sportCard: {
    width: (width - 64) / 3,
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  sportIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  sportIconImg: {
    width: 24,
    height: 24,
  },
  sportLabel: {
    fontSize: 12,
    fontFamily: 'Montserrat_600SemiBold',
    color: '#333',
  },
  facilitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  facilityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    gap: 8,
  },
  facilityIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 77, 67, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  facilityLabel: {
    fontSize: 13,
    fontFamily: 'Montserrat_500Medium',
    color: '#444',
  },
  galleryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  galleryTitle: {
    fontSize: 18,
    fontFamily: 'Montserrat_700Bold',
    color: '#1a1a1a',
  },
  addPhotoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addPhotoText: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Montserrat_500Medium',
  },
  galleryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  galleryImageContainer: {
    width: (width - 50) / 2,
    height: 120,
    borderRadius: 12,
    overflow: 'hidden',
  },
  galleryImage: {
    width: '100%',
    height: '100%',
  },
  reviewHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  reviewTitle: {
    fontSize: 18,
    fontFamily: 'Montserrat_700Bold',
    color: '#1a1a1a',
  },
  writeFab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8ee26',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  writeFabText: {
    fontSize: 12,
    fontFamily: 'Montserrat_700Bold',
    color: '#004d43',
  },
  emptyReviews: {
    alignItems: 'center',
    paddingTop: 40,
  },
  emptyText: {
    color: '#999',
    fontFamily: 'Montserrat_400Regular',
  },
  reviewItem: {
    marginBottom: 24,
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 16,
  },
  reviewTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  reviewerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#004d43',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarChar: {
    color: '#e8ee26',
    fontSize: 18,
    fontFamily: 'Montserrat_700Bold',
  },
  reviewMeta: {
    flex: 1,
  },
  reviewerName: {
    fontSize: 15,
    fontFamily: 'Montserrat_700Bold',
    color: '#333',
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  reviewDate: {
    fontSize: 12,
    color: '#999',
    marginLeft: 8,
    fontFamily: 'Montserrat_400Regular',
  },
  reviewComment: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    fontFamily: 'Montserrat_400Regular',
  },
  stickyBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 20,
  },
  priceContainer: {
    flex: 1,
  },
  bottomPriceLabel: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'Montserrat_500Medium',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  bottomPriceAmount: {
    fontSize: 20,
    fontFamily: 'Montserrat_700Bold',
    color: '#1a1a1a',
  },
  bottomPriceUnit: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Montserrat_400Regular',
  },
  bookNowBtn: {
    backgroundColor: '#004d43',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 16,
    elevation: 4,
  },
  bookNowText: {
    color: '#e8ee26',
    fontSize: 16,
    fontFamily: 'Montserrat_700Bold',
  },
  modalContainer: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Montserrat_700Bold',
    color: '#333',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionLabel: {
    fontSize: 16,
    fontFamily: 'Montserrat_700Bold',
    color: '#333',
    marginBottom: 16,
    marginTop: 10,
  },
  dateScroll: {
    marginBottom: 24,
    marginLeft: -4,
  },
  dateOption: {
    minWidth: 70,
    height: 90,
    borderRadius: 20,
    backgroundColor: '#f8f8f8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  selectedDateOption: {
    backgroundColor: '#004d43',
    borderColor: '#004d43',
  },
  dateOptionText: {
    fontSize: 12,
    fontFamily: 'Montserrat_500Medium',
    color: '#666',
    marginBottom: 4,
  },
  selectedDateOptionText: {
    color: 'rgba(232, 230, 38, 0.8)',
  },
  dateOptionDay: {
    fontSize: 20,
    fontFamily: 'Montserrat_700Bold',
    color: '#333',
  },
  selectedDateOptionDay: {
    color: '#e8ee26',
  },
  timeSlotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  timeSlotCard: {
    width: (width - 52) / 2,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#f0f0f0',
  },
  selectedSlot: {
    backgroundColor: 'rgba(0, 77, 67, 0.05)',
    borderColor: '#004d43',
  },
  unavailableSlot: {
    backgroundColor: '#f5f5f5',
    borderColor: '#eee',
    opacity: 0.6,
  },
  timeSlotTime: {
    fontSize: 14,
    fontFamily: 'Montserrat_700Bold',
    color: '#333',
    marginBottom: 4,
  },
  selectedSlotText: {
    color: '#004d43',
  },
  timeSlotPrice: {
    fontSize: 13,
    fontFamily: 'Montserrat_600SemiBold',
    color: '#004d43',
  },
  selectedSlotPrice: {
    color: '#004d43',
  },
  modalActions: {
    padding: 24,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  confirmButton: {
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
  },
  reviewModalCard: {
    margin: 20,
    borderRadius: 24,
    backgroundColor: '#fff',
  },
  ratingSection: {
    alignItems: 'center',
    marginVertical: 20,
  },
  reviewTextInput: {
    backgroundColor: '#f9f9f9',
    borderRadius: 16,
    padding: 16,
    minHeight: 120,
    fontFamily: 'Montserrat_400Regular',
    fontSize: 15,
    color: '#333',
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  reviewModalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
});
