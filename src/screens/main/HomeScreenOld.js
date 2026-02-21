import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, Modal, Alert, Share, Platform, Dimensions, Animated, Easing } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import { Text, Searchbar } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { fetchUserProfile, updateProfile } from '../../store/slices/authSlice';
import { MaterialIcons } from '@expo/vector-icons';
import { safeFormatDate } from '../../utils/dateUtils';
import { useFocusEffect } from '@react-navigation/native';
import { fetchNearbyTurfs } from '../../store/slices/turfSlice';
import { fetchChallenges, acceptChallenge, setUserTeam } from '../../store/slices/teamSlice';
import RealtimeNotification from '../../components/RealtimeNotification';
import realtimeSyncService from '../../services/realtimeSync';
import { SportsIcon } from '../../components/SportsIcons';
import {
  HeaderSkeleton,
  SearchBarSkeleton,
  SportCategorySkeleton,
  VenueCardSkeleton,
  ChallengeCardSkeleton
} from '../../components/SkeletonLoader';
import ChallengeCard from '../../components/ChallengeCard';
import { generateReferralCode } from '../../utils/referralUtils';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';

// Header slider images
const headerImages = [
  require('../../images/football.jpg'),
  require('../../images/cricket.jpg'),
  require('../../images/padel.jpg'),
];

// Default venue images by sport
const getVenueImageBySport = (venue) => {
  // Get the first sport from the venue data
  let primarySport = 'Football'; // default

  if (Array.isArray(venue.sports) && venue.sports.length > 0) {
    primarySport = venue.sports[0];
  } else if (typeof venue.sports === 'string' && venue.sports.trim()) {
    primarySport = venue.sports.split(',')[0].trim();
  } else if (venue.sport) {
    primarySport = venue.sport;
  }

  const sportImages = {
    'Cricket': require('../../images/cricket.jpg'),
    'Football': require('../../images/football.jpg'),
    'Futsal': require('../../images/football.jpg'),
    'Padel': require('../../images/padel.jpg'),
    'Basketball': require('../../images/football.jpg'), // fallback
    'Tennis': require('../../images/padel.jpg'), // fallback
  };
  return sportImages[primarySport] || require('../../images/football.jpg'); // default fallback
};

const sportCategories = [
  {
    id: 1,
    name: 'Cricket',
    color: '#004d43',
  },
  {
    id: 2,
    name: 'Futsal',
    color: '#004d43',
  },
  {
    id: 3,
    name: 'Padel',
    color: '#004d43',
  },


];

// Venues will be loaded from Redux store

// Challenges will be loaded from Redux store

export default function HomeScreen({ navigation }) {
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [filteredVenues, setFilteredVenues] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [notification, setNotification] = useState(null);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const insets = useSafeAreaInsets() || { top: 0, bottom: 0, left: 0, right: 0 };
  const bounceValue = useRef(new Animated.Value(0)).current;

  // Banner Floating Animation
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceValue, {
          toValue: -6,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(bounceValue, {
          toValue: 0,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        })
      ])
    ).start();
  }, [bounceValue]);

  const { user } = useSelector(state => state.auth);

  // DEBUG LOGGING
  useEffect(() => {
    if (user) {
      console.log('🔍 HOME DEBUG: User object changed:', {
        uid: user.uid,
        bookingCount: user.bookingCount,
        myReferralCode: user.myReferralCode
      });
    }
  }, [user]);
  const { nearbyTurfs, loading: turfsLoading } = useSelector(state => state.turf);
  const { challenges, loading: challengesLoading, userTeam } = useSelector(state => state.team);

  // Load data on component mount and when screen comes into focus
  useEffect(() => {
    // Fetch all active venues (no location filtering)
    dispatch(fetchNearbyTurfs({ latitude: 0, longitude: 0, radius: 0 })); // Dummy values since location filtering is removed

    // Fetch recent challenges
    dispatch(fetchChallenges());

    // Setup notification callback for real-time sync
    realtimeSyncService.setNotificationCallback((message, type) => {
      setNotification({ message, type });
    });
  }, [dispatch]);

  // Generate referral code for existing users who don't have one
  useEffect(() => {
    const generateMissingReferralCode = async () => {
      // Only generate referral code if user has completed at least 1 booking
      if (user && user.uid && !user.myReferralCode && user.fullName) {
        const bookingCount = user.bookingCount || 0;

        if (bookingCount >= 1) {
          try {
            console.log('🎁 Generating referral code for user with', bookingCount, 'bookings');
            const newReferralCode = generateReferralCode(user.fullName);

            // Update user document in Firestore
            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, {
              myReferralCode: newReferralCode,
            });

            console.log('✅ Referral code generated and saved:', newReferralCode);
          } catch (error) {
            console.error('❌ Error generating referral code:', error);
          }
        } else {
          console.log('ℹ️ User needs to complete at least 1 booking to get a referral code');
        }
      }
    };

    generateMissingReferralCode();
  }, [user]);

  // Reload venues when screen comes into focus (when returning from other screens)
  useFocusEffect(
    React.useCallback(() => {
      if (nearbyTurfs.length === 0) {
        console.log('🔄 HomeScreen: Reloading venues on focus');
        dispatch(fetchNearbyTurfs({ latitude: 0, longitude: 0, radius: 0 })); // Dummy values since location filtering is removed
      }
    }, [dispatch, nearbyTurfs.length])
  );

  // Auto-slide functionality
  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === headerImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 3000); // Change image every 3 seconds

    return () => clearInterval(slideInterval);
  }, []);

  // Search functionality
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredVenues(nearbyTurfs);
      setShowSearchResults(false);
    } else {
      const filtered = nearbyTurfs.filter(venue =>
        venue.area?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        venue.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        venue.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (Array.isArray(venue.sports) ? venue.sports.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())) :
          typeof venue.sports === 'string' ? venue.sports.toLowerCase().includes(searchQuery.toLowerCase()) :
            venue.sport?.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredVenues(filtered);
      setShowSearchResults(true);
    }
  }, [searchQuery, nearbyTurfs]);

  const handleSportPress = (sport) => {
    navigation.navigate('VenueList', { sportType: sport.name.toLowerCase() });
  };

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      setShowSearchResults(true);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setShowSearchResults(false);
    setFilteredVenues(nearbyTurfs);
  };

  const handleCopyReferralCode = async () => {
    if (user?.myReferralCode) {
      await Clipboard.setStringAsync(user.myReferralCode);
      Alert.alert('Copied!', 'Referral code copied to clipboard');
    }
  };

  const handleShareReferralCode = async () => {
    if (user?.myReferralCode) {
      try {
        await Share.share({
          message: `Join Arena Pro and get Rs. 300 off your first booking! Use my referral code: ${user.myReferralCode}\n\nDownload the app now and start booking sports venues easily!`,
          title: 'Join Arena Pro',
        });
      } catch (error) {
        console.error('Error sharing referral code:', error);
      }
    }
  };

  const renderImageDots = () => {
    return (
      <View style={styles.dotsContainer}>
        {headerImages.map((_, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.dot,
              index === currentImageIndex ? styles.activeDot : styles.inactiveDot
            ]}
            onPress={() => setCurrentImageIndex(index)}
          />
        ))}
      </View>
    );
  };

  const renderSportCategory = (sport, index) => (
    <TouchableOpacity
      key={sport.id}
      style={[
        styles.sportCard,
        index === sportCategories.length - 1 && styles.lastSportCard // Add extra margin to last card
      ]}
      onPress={() => handleSportPress(sport)}
      activeOpacity={0.8}
    >
      <View style={[styles.sportIconContainer, { backgroundColor: sport.color }]}>
        <SportsIcon sport={sport.name.toLowerCase()} size={32} style={styles.sportIconImage} />
      </View>
      <Text style={styles.sportName}>{sport.name}</Text>
    </TouchableOpacity>
  );

  const renderRecommendedVenue = (venue) => (
    <TouchableOpacity
      key={venue.id}
      style={styles.venueCard}
      onPress={() => navigation.navigate('TurfDetail', { turfId: venue.id })}
      activeOpacity={0.8}
    >
      <View style={styles.venueImageContainer}>
        <Image
          source={
            (venue.images && venue.images.length > 0)
              ? (typeof venue.images[0] === 'string' ? { uri: venue.images[0] } : venue.images[0])
              : (typeof venue.image === 'string' ? { uri: venue.image } : (venue.image || getVenueImageBySport(venue)))
          }
          style={styles.venueImage}
          resizeMode="cover"
        />
        <View style={styles.ratingBadge}>
          <MaterialIcons name="star" size={16} color="#004d43" />
          <Text style={styles.ratingText}>
            {venue.rating ? venue.rating.toFixed(1) : 'New'}
            {venue.reviewCount ? ` (${venue.reviewCount})` : ''}
          </Text>
        </View>
      </View>
      <View style={styles.venueInfo}>
        <Text style={styles.venueName}>{venue.name || 'Unnamed Venue'}</Text>
        <View style={styles.venueLocationRow}>
          <MaterialIcons name="location-on" size={14} color="#666" />
          <Text style={styles.venueLocation}>{venue.area || 'Unknown Area'}, {venue.city || 'Unknown City'}</Text>
        </View>

        <View style={styles.venueFooter}>
          <View style={styles.venueIcons}>
            {(Array.isArray(venue.sports) && venue.sports.length > 0) ? (
              <MaterialIcons
                name={venue.sports[0] === 'Cricket' ? 'sports-cricket' : venue.sports[0] === 'Football' ? 'sports-soccer' : venue.sports[0] === 'Padel' ? 'sports-tennis' : 'sports-soccer'}
                size={20}
                color="#666"
              />
            ) : typeof venue.sports === 'string' ? (
              <MaterialIcons
                name={venue.sports.includes('Cricket') ? 'sports-cricket' : venue.sports.includes('Football') ? 'sports-soccer' : venue.sports.includes('Padel') ? 'sports-tennis' : 'sports-soccer'}
                size={20}
                color="#666"
              />
            ) : (
              <MaterialIcons
                name={venue.sport === 'Cricket' ? 'sports-cricket' : venue.sport === 'Football' ? 'sports-soccer' : venue.sport === 'Padel' ? 'sports-tennis' : 'sports-soccer'}
                size={20}
                color="#666"
              />
            )}
            <Text style={[styles.venueIconText, { marginLeft: 5, fontSize: 12, color: '#666' }]}>
              {Array.isArray(venue.sports) && venue.sports.length > 0 ? venue.sports[0] :
                typeof venue.sports === 'string' && venue.sports.trim() ? venue.sports.split(',')[0] :
                  venue.sport || 'Sport'}
            </Text>
          </View>
          <TouchableOpacity style={styles.bookableButton}>
            <Text style={styles.bookableText}>Bookable</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Group venues by sport - Fixed to handle different data structures
  const getVenuesBySport = (sport) => {
    return nearbyTurfs.filter(venue => {
      // Handle different sports data structures
      if (Array.isArray(venue.sports)) {
        return venue.sports.some(s => s.toLowerCase().includes(sport.toLowerCase()));
      } else if (typeof venue.sports === 'string') {
        return venue.sports.toLowerCase().includes(sport.toLowerCase());
      } else if (venue.sport) {
        return venue.sport.toLowerCase().includes(sport.toLowerCase());
      }
      return false;
    });
  };

  const cricketVenues = getVenuesBySport('Cricket');
  const footballVenues = getVenuesBySport('Football');
  const padelVenues = getVenuesBySport('Padel');
  const futsalVenues = getVenuesBySport('Futsal');

  const renderSportSection = (sportName, venues) => {
    if (turfsLoading) {
      return (
        <View key={sportName} style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{sportName} Venues</Text>
            <TouchableOpacity onPress={() => navigation.navigate('VenueList', { sport: sportName })}>
              <Text style={styles.seeMoreText}>See all</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.venuesScroll}>
            {[1, 2, 3].map((index) => (
              <VenueCardSkeleton key={index} />
            ))}
          </ScrollView>
        </View>
      );
    }

    if (venues.length === 0) return null;

    return (
      <View key={sportName} style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{sportName} Venues</Text>
          <TouchableOpacity onPress={() => navigation.navigate('VenueList', { sport: sportName })}>
            <Text style={styles.seeMoreText}>See all</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.venuesScroll}>
          {venues.map(renderRecommendedVenue)}
        </ScrollView>
      </View>
    );
  };

  const { width } = Dimensions.get('window');
  const cardWidth = width - 45; // Full width minus padding (20 left + 20 right + 5 margin)

  const handleAcceptChallenge = (challengeId) => {
    const challenge = challenges.find(c => c.id === challengeId);
    if (!challenge) return;

    const performAccept = (teamToUse) => {
      Alert.alert(
        'Accept Challenge',
        `Are you sure you want to accept this challenge? ${challenge.isWinnerTakesAll ? 'The loser will pay the entire ground fee.' : 'Ground fee will be split equally.'}`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Accept',
            onPress: async () => {
              try {
                const result = await dispatch(acceptChallenge({
                  challengeId,
                  opponentId: teamToUse.id,
                  opponentTeamName: teamToUse.name
                })).unwrap();

                Alert.alert(
                  'Challenge Accepted!',
                  `You have accepted the challenge. Please book the venue (${challenge.venue || 'Any'}) to confirm.`,
                  [
                    {
                      text: 'Book Now',
                      onPress: () => navigation.navigate('VenueList', {
                        searchQuery: challenge.venue,
                        sport: challenge.sport
                      })
                    },
                    { text: 'Later', style: 'cancel' }
                  ]
                );
              } catch (error) {
                Alert.alert('Error', error || 'Failed to accept challenge');
              }
            }
          }
        ]
      );
    };

    if (!userTeam) {
      if (!user) {
        Alert.alert('Error', 'You must be logged in to accept challenges.');
        return;
      }

      Alert.alert(
        'Create Team',
        'You need a team profile to accept challenges. Would you like to create one automatically using your profile details?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Create & Continue',
            onPress: () => {
              const newTeam = {
                id: user.uid,
                name: `${user.fullName || 'Player'}'s Team`,
                captain: user.fullName || 'Captain',
                avatar: user.photoURL || null,
                founded: new Date().getFullYear().toString(),
                homeGround: user.city || 'Home Ground',
                wins: 0,
                losses: 0,
                draws: 0,
                eloRating: 1200,
                fairPlayScore: 5.0,
              };

              dispatch(setUserTeam(newTeam));
              dispatch(updateProfile({ teamProfile: newTeam }));

              performAccept(newTeam);
            }
          }
        ]
      );
      return;
    }

    performAccept(userTeam);
  };

  const renderChallengeCard = (challenge) => (
    <View key={challenge.id} style={{ width: cardWidth, maxWidth: 400, marginRight: 15 }}>
      <ChallengeCard
        challenge={challenge}
        onViewDetails={() => navigation.navigate('ChallengeDetail', { challengeId: challenge.id })}
        userTeam={userTeam}
        currentUserId={user?.uid}
        onAccept={() => handleAcceptChallenge(challenge.id)}
      // Pass a prop to indicate it's in a horizontal scroll if needed, 
      // to adjust width/margins, but ChallengeCard seems designed for full width.
      // We wrap it in a View with fixed width for horizontal scrolling.
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Platform.OS === 'android' ? 200 + insets.bottom : 200 }}
      >
        {/* Header Section with Full-Width Image Slider */}
        {turfsLoading ? (
          <HeaderSkeleton />
        ) : (
          <View style={styles.headerContainer}>
            <Image
              source={headerImages[currentImageIndex]}
              style={styles.fullWidthImage}
              resizeMode="cover"
            />
            <View style={styles.headerOverlay}>
              <View style={styles.header}>
                <View style={styles.userSection}>
                  <Text style={styles.greeting}>Hi, {user?.fullName?.split(' ')[0] || 'Eman'}</Text>
                  <Text style={styles.tagline}>Plan Your Sports Activities</Text>

                  <View style={styles.bestContainer}>
                    <Text style={styles.bestText}>with </Text>
                    <Text style={styles.bestHighlight}>Arena Pro</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.favoritesIcon}
                  onPress={() => navigation.navigate('Favorites')}
                >
                  <MaterialIcons name="favorite" size={24} color="white" />
                </TouchableOpacity>
              </View>
              {renderImageDots()}
            </View>
          </View>
        )}

        {/* Search Section */}
        {turfsLoading ? (
          <SearchBarSkeleton />
        ) : (
          <View style={styles.searchSection}>
            <Searchbar
              placeholder="Search areas, venues, sports..."
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={styles.searchbar}
              iconColor="#004d43"
              inputStyle={styles.searchInput}
              onSubmitEditing={handleSearchSubmit}
              right={() => searchQuery ? (
                <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
                  <MaterialIcons name="close" size={20} color="#666" />
                </TouchableOpacity>
              ) : null}
            />
            {showSearchResults && (
              <Text style={styles.searchResultsText}>
                {filteredVenues.length} venues found {searchQuery ? `for "${searchQuery}"` : ''}
              </Text>
            )}
          </View>
        )}

        {/* Sports Categories - Hide when searching */}
        {!showSearchResults && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sports</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sportsScroll}>
              {turfsLoading ? (
                [1, 2, 3, 4].map((index) => (
                  <SportCategorySkeleton key={index} />
                ))
              ) : (
                sportCategories.map(renderSportCategory)
              )}
            </ScrollView>
          </View>
        )}

        {/* Search Results or Sport-Specific Venues Sections */}
        {showSearchResults ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Search Results</Text>
            </View>

            {turfsLoading ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.venuesScroll}>
                {[1, 2, 3].map((index) => (
                  <VenueCardSkeleton key={index} />
                ))}
              </ScrollView>
            ) : filteredVenues.length > 0 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.venuesScroll}>
                {filteredVenues.map(renderRecommendedVenue)}
              </ScrollView>
            ) : (
              <View style={styles.noResultsContainer}>
                <MaterialIcons name="search-off" size={48} color="#ccc" />
                <Text style={styles.noResultsText}>No venues found</Text>
                <Text style={styles.noResultsSubtext}>Try searching for a different area or sport</Text>
              </View>
            )}
          </View>
        ) : (
          <>
            {/* Cricket Venues Section */}
            {renderSportSection('Cricket', cricketVenues)}

            {/* Futsal Venues Section */}
            {renderSportSection('Futsal', futsalVenues)}

            {/* Padel Venues Section */}
            {renderSportSection('Padel', padelVenues)}

            {/* Football Venues Section */}
            {renderSportSection('Football', footballVenues)}
          </>
        )}

        {/* Challenge Section - Only show when not searching */}
        {!showSearchResults && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Latest Challenges</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Lalkaar')}>
                <Text style={styles.seeMoreText}>See all</Text>
              </TouchableOpacity>
            </View>

            {challengesLoading ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.challengesScroll}
                snapToInterval={cardWidth + 15}
                decelerationRate="fast"
                snapToAlignment="start"
                contentContainerStyle={{ paddingHorizontal: 20 }}
              >
                {[1, 2, 3].map((index) => (
                  <ChallengeCardSkeleton key={index} />
                ))}
              </ScrollView>
            ) : challenges.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.challengesScroll}
                snapToInterval={cardWidth + 15}
                decelerationRate="fast"
                snapToAlignment="start"
                contentContainerStyle={{ paddingHorizontal: 20 }}
              >
                {challenges.slice(0, 4).map(renderChallengeCard)}
              </ScrollView>
            ) : (
              <Text style={styles.noDataText}>No challenges available</Text>
            )}


          </View>
        )}
      </ScrollView>

      {/* Real-time Notification */}
      {notification && (
        <RealtimeNotification
          message={notification.message}
          type={notification.type}
          onHide={() => setNotification(null)}
        />
      )}

      {/* Floating Referral Button */}
      {/* Floating Referral Button with Banner */}
      {/* Floating Referral Button with Banner */}
      <View style={styles.floatingButtonContainer}>
        <Animated.View style={[styles.referralBanner, { transform: [{ translateY: bounceValue }] }]}>
          <Text style={styles.referralBannerText}>Earn 300 PKR</Text>
          <View style={styles.referralBannerArrow} />
        </Animated.View>
        <TouchableOpacity
          style={styles.floatingButton}
          onPress={() => setShowReferralModal(true)}
          activeOpacity={0.8}
        >
          <MaterialIcons name="card-giftcard" size={28} color="#e8ee26" />
        </TouchableOpacity>
      </View>

      {/* Referral Modal */}
      <Modal
        visible={showReferralModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowReferralModal(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setShowReferralModal(false)}
          />
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalIconContainer}>
                <MaterialIcons name="card-giftcard" size={40} color="#004d43" />
              </View>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowReferralModal(false)}
              >
                <MaterialIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Modal Body */}
            <View style={styles.modalBody}>
              {(user?.bookingCount || 0) >= 1 ? (
                <>
                  <Text style={styles.modalTitle}>Refer & Earn!</Text>
                  <Text style={styles.modalSubtitle}>
                    Share your referral code with friends! They get Rs. 300 off their 1st booking, and you will get Rs. 300 off your next booking after they complete theirs!
                  </Text>

                  {/* Referral Code Display */}
                  <View style={styles.referralCodeContainer}>
                    <Text style={styles.referralCodeLabel}>Your Referral Code</Text>
                    <View style={styles.referralCodeBox}>
                      {user?.myReferralCode ? (
                        <Text style={styles.referralCodeText}>{user.myReferralCode}</Text>
                      ) : (
                        <Text style={styles.referralCodePlaceholder}>Generating your code...</Text>
                      )}
                    </View>
                  </View>

                  {/* Benefits */}
                  <View style={styles.benefitsContainer}>
                    <View style={styles.benefitItem}>
                      <MaterialIcons name="check-circle" size={20} color="#6BCF7F" />
                      <Text style={styles.benefitText}>Your friend gets Rs. 300 off their 1st booking</Text>
                    </View>
                    <View style={styles.benefitItem}>
                      <MaterialIcons name="check-circle" size={20} color="#6BCF7F" />
                      <Text style={styles.benefitText}>You will get Rs. 300 off your next booking</Text>
                    </View>
                  </View>

                  {/* Action Buttons */}
                  {!!user?.myReferralCode && (
                    <View style={styles.modalActions}>
                      <TouchableOpacity
                        style={styles.copyButton}
                        onPress={handleCopyReferralCode}
                        activeOpacity={0.8}
                      >
                        <MaterialIcons name="content-copy" size={20} color="#004d43" />
                        <Text style={styles.copyButtonText}>Copy Code</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.shareButton}
                        onPress={handleShareReferralCode}
                        activeOpacity={0.8}
                      >
                        <MaterialIcons name="share" size={20} color="#fff" />
                        <Text style={styles.shareButtonText}>Share</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </>
              ) : (
                <>
                  <Text style={styles.modalTitle}>Complete Your First Booking!</Text>
                  <Text style={styles.modalSubtitle}>
                    You need to complete at least 1 booking before you can start referring friends and earning rewards.
                  </Text>

                  {/* Locked State */}
                  <View style={styles.lockedContainer}>
                    <MaterialIcons name="lock" size={60} color="#ccc" />
                    <Text style={styles.lockedText}>Referral Code Locked</Text>
                    <Text style={styles.lockedSubtext}>
                      Complete your first booking to unlock your unique referral code!
                    </Text>
                    {/* Debug Info & Manual Refresh */}
                    <View style={{ marginTop: 20, alignItems: 'center' }}>
                      <Text style={{ color: 'red', fontSize: 12, marginBottom: 10 }}>
                        Debug: Bookings = {user?.bookingCount !== undefined ? user.bookingCount : 'undefined'}
                      </Text>
                      <TouchableOpacity
                        onPress={async () => {
                          try {
                            // Check if action exists
                            if (!fetchUserProfile) {
                              alert('ERROR: fetchUserProfile action is undefined!');
                              return;
                            }

                            alert(`Current Count: ${user?.bookingCount}. Refreshing...`);

                            // Dispatch and wait for result
                            const result = await dispatch(fetchUserProfile());

                            if (fetchUserProfile.fulfilled.match(result)) {
                              alert(`Success! New Count: ${result.payload?.bookingCount}`);
                            } else {
                              alert(`Failed: ${result.payload?.message || result.error?.message}`);
                            }
                          } catch (e) {
                            alert(`CRASH: ${e.message}`);
                            console.error(e);
                          }
                        }}
                        style={{
                          backgroundColor: '#E0E0E0',
                          paddingHorizontal: 16,
                          paddingVertical: 8,
                          borderRadius: 20
                        }}
                      >
                        <Text style={{ fontSize: 12, fontWeight: 'bold' }}>🔄 Force Refresh Status</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* What You'll Get */}
                  <View style={styles.benefitsContainer}>
                    <Text style={styles.benefitsTitle}>What you'll get after unlocking:</Text>
                    <View style={styles.benefitItem}>
                      <MaterialIcons name="card-giftcard" size={20} color="#004d43" />
                      <Text style={styles.benefitText}>Your unique referral code</Text>
                    </View>
                    <View style={styles.benefitItem}>
                      <MaterialIcons name="people" size={20} color="#004d43" />
                      <Text style={styles.benefitText}>Rs. 300 off for your friends</Text>
                    </View>
                    <View style={styles.benefitItem}>
                      <MaterialIcons name="monetization-on" size={20} color="#004d43" />
                      <Text style={styles.benefitText}>Rs. 300 off your next booking</Text>
                    </View>
                  </View>
                </>
              )}
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
  },
  headerContainer: {
    height: 160,
    position: 'relative',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    overflow: 'hidden',
  },
  fullWidthImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, rgba(0,77,67,0.85) 0%, rgba(34,154,96,0.75) 100%)',
    backgroundColor: 'rgba(0,77,67,0.85)', // Fallback for gradient
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    zIndex: 2,
  },
  favoritesIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    padding: 8,
  },
  userSection: {
    flex: 1,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    fontFamily: 'Montserrat_700Bold',
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    fontFamily: 'Montserrat_400Regular',
    marginTop: 4,
  },
  bestContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  bestText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    fontFamily: 'Montserrat_400Regular',
  },
  bestHighlight: {
    fontSize: 14,
    color: 'white',
    fontFamily: 'Montserrat_700Bold',
    textDecorationLine: 'underline',
    textDecorationColor: '#FFD700',
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
  section: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  searchSection: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
  },
  searchbar: {
    elevation: 4,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
  },
  searchInput: {
    fontFamily: 'Montserrat_400Regular',
  },
  clearButton: {
    padding: 8,
  },
  searchResultsText: {
    fontSize: 14,
    color: '#666',
    marginTop: 10,
    fontFamily: 'Montserrat_500Medium',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 15,
    fontFamily: 'Montserrat_700Bold',
    letterSpacing: 0.3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  seeMoreText: {
    fontSize: 14,
    color: '#004d43',
    fontWeight: '600',
    fontFamily: 'Montserrat_600SemiBold',
  },
  sportsScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
    paddingRight: 0, // Remove right padding to eliminate empty space
  },
  sportCard: {
    alignItems: 'center',
    marginRight: 18,
    width: 90,
  },
  lastSportCard: {
    marginRight: 20, // Extra margin for last card to match container padding
  },
  sportIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  sportIcon: {
    fontSize: 24,
    color: 'white',
  },
  sportIconImage: {
    backgroundColor: 'transparent',
  },
  sportName: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
    fontFamily: 'Montserrat_500Medium',
  },
  venuesScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  venueCard: {
    width: 300,
    marginRight: 16,
    backgroundColor: 'white',
    borderRadius: 16,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    overflow: 'hidden',
  },
  venueImageContainer: {
    height: 180,
    width: '100%',
    position: 'relative',
  },
  venueImage: {
    width: '100%',
    height: '100%',
  },
  ratingBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#e8ee26', // Secondary brand color
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingText: {
    fontSize: 12,
    color: '#004d43', // Primary brand color for better contrast on light green background
    marginLeft: 4,
    fontFamily: 'Montserrat_600SemiBold',
  },
  venueInfo: {
    padding: 15,
  },
  venueName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
    fontFamily: 'Montserrat_600SemiBold',
  },
  venueLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  venueLocation: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
    fontFamily: 'Montserrat_400Regular',
  },
  venueTime: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
    fontFamily: 'Montserrat_400Regular',
  },
  venueFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  venueIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  venueIconText: {
    fontSize: 16,
    marginRight: 8,
  },
  bookableButton: {
    backgroundColor: '#004d43', // Primary brand color
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  bookableText: {
    fontSize: 12,
    color: 'white',
    fontFamily: 'Montserrat_600SemiBold',
  },
  noResultsContainer: {
    alignItems: 'center',
    paddingVertical: 40,
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
  challengesScroll: {
    paddingHorizontal: 20,
    marginHorizontal: -20,
  },
  noDataText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 20,
    fontFamily: 'Montserrat_500Medium',
  },
  createChallengeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#004d43',
    padding: 15,
    borderRadius: 12,
    marginTop: 20,
  },
  createChallengeText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 10,
    fontFamily: 'Montserrat_600SemiBold',
  },
  floatingButtonContainer: {
    position: 'absolute',
    bottom: 110,
    right: 20,
    alignItems: 'center',
  },
  referralBanner: {
    backgroundColor: '#e8ee26',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  referralBannerText: {
    color: '#004d43',
    fontWeight: 'bold',
    fontSize: 12,
    fontFamily: 'Montserrat_700Bold',
  },
  referralBannerArrow: {
    position: 'absolute',
    bottom: -6,
    left: '50%',
    marginLeft: -6,
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 6,
    borderStyle: 'solid',
    backgroundColor: 'transparent',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#e8ee26',
  },
  floatingButton: {
    backgroundColor: '#004d43',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  // ... Modal styles remain ...
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E0F2F1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseButton: {
    padding: 5,
  },
  modalBody: {
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#004d43',
    marginBottom: 10,
    fontFamily: 'Montserrat_700Bold',
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'Montserrat_400Regular',
    lineHeight: 20,
  },
  referralCodeContainer: {
    width: '100%',
    marginBottom: 20,
  },
  referralCodeLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    fontFamily: 'Montserrat_600SemiBold',
  },
  referralCodeBox: {
    backgroundColor: '#F5F5F5',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
  },
  referralCodeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#004d43',
    fontFamily: 'Montserrat_700Bold',
    letterSpacing: 2,
  },
  referralCodePlaceholder: {
    fontSize: 16,
    color: '#999',
    fontStyle: 'italic',
  },
  benefitsContainer: {
    width: '100%',
    backgroundColor: '#F9F9F9',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  benefitsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    fontFamily: 'Montserrat_600SemiBold',
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  benefitText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#333',
    fontFamily: 'Montserrat_500Medium',
    flex: 1,
  },
  modalActions: {
    flexDirection: 'row',
    width: '100%',
    gap: 15,
  },
  copyButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E0F2F1',
    padding: 15,
    borderRadius: 12,
  },
  copyButtonText: {
    marginLeft: 8,
    color: '#004d43',
    fontWeight: 'bold',
    fontFamily: 'Montserrat_600SemiBold',
  },
  shareButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#004d43',
    padding: 15,
    borderRadius: 12,
  },
  shareButtonText: {
    marginLeft: 8,
    color: 'white',
    fontWeight: 'bold',
    fontFamily: 'Montserrat_600SemiBold',
  },
  lockedContainer: {
    alignItems: 'center',
    marginBottom: 20,
    padding: 20,
  },
  lockedText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 10,
    marginBottom: 5,
    fontFamily: 'Montserrat_600SemiBold',
  },
  lockedSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    fontFamily: 'Montserrat_400Regular',
  },
});