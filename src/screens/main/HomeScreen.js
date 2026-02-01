import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Text, Searchbar } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { MaterialIcons } from '@expo/vector-icons';
import { fetchNearbyTurfs } from '../../store/slices/turfSlice';
import { fetchChallenges } from '../../store/slices/teamSlice';
import RealtimeNotification from '../../components/RealtimeNotification';
import realtimeSyncService from '../../services/realtimeSync';
import { SportsIcon } from '../../components/SportsIcons';

const { width } = Dimensions.get('window');

// Header slider images
const headerImages = [
  require('../../images/football.jpg'),
  require('../../images/cricket.jpg'),
  require('../../images/padel.jpg'),
];

// Default venue images by sport
const getVenueImageBySport = (sport) => {
  const sportImages = {
    'Cricket': require('../../images/cricket.jpg'),
    'Football': require('../../images/football.jpg'),
    'Futsal': require('../../images/football.jpg'),
    'Padel': require('../../images/padel.jpg'),
    'Basketball': require('../../images/football.jpg'), // fallback
    'Tennis': require('../../images/padel.jpg'), // fallback
  };
  return sportImages[sport] || require('../../images/football.jpg'); // default fallback
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
  }
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
  
  const { user } = useSelector(state => state.auth);
  const { nearbyTurfs, loading: turfsLoading } = useSelector(state => state.turf);
  const { challenges, loading: challengesLoading } = useSelector(state => state.team);
  
  // Load data on component mount
  useEffect(() => {
    // Fetch nearby turfs using Karachi coordinates (where venues are located)
    dispatch(fetchNearbyTurfs({ latitude: 24.8607, longitude: 67.0011, radius: 50 })); // Karachi coordinates with larger radius
    
    // Fetch recent challenges
    dispatch(fetchChallenges());
    
    // Setup notification callback for real-time sync
    realtimeSyncService.setNotificationCallback((message, type) => {
      setNotification({ message, type });
    });
  }, [dispatch]);
  
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
        venue.sport?.toLowerCase().includes(searchQuery.toLowerCase())
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

  const renderSportCategory = (sport) => (
    <TouchableOpacity
      key={sport.id}
      style={styles.sportCard}
      onPress={() => handleSportPress(sport)}
      activeOpacity={0.8}
    >
      <View style={[styles.sportIconContainer, { backgroundColor: sport.color }]}>
        <SportsIcon sport={sport.name} size={32} style={styles.sportIconImage} />
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
          source={venue.image || getVenueImageBySport(venue.sport)} 
          style={styles.venueImage}
          resizeMode="cover"
        />
        <View style={styles.ratingBadge}>
          <MaterialIcons name="star" size={16} color="white" />
          <Text style={styles.ratingText}>{venue.rating || '4.0'}</Text>
        </View>
      </View>
      <View style={styles.venueInfo}>
        <Text style={styles.venueName}>{venue.name || 'Unnamed Venue'}</Text>
        <View style={styles.venueLocationRow}>
          <MaterialIcons name="location-on" size={14} color="#666" />
          <Text style={styles.venueLocation}>{venue.area || 'Unknown Area'}, {venue.city || 'Unknown City'}</Text>
        </View>
        <Text style={styles.venueTime}>{venue.time || 'Hours not specified'}</Text>
        <View style={styles.venueFooter}>
          <View style={styles.venueIcons}>
            <Text style={styles.venueIconText}>
              {venue.sport === 'Cricket' ? '🏏' : venue.sport === 'Football' ? '⚽' : venue.sport === 'Padel' ? '🏓' : '⚽'}
            </Text>
          </View>
          <TouchableOpacity style={styles.bookableButton}>
            <Text style={styles.bookableText}>Bookable</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Group venues by sport
  const getVenuesBySport = (sport) => {
    return nearbyTurfs.filter(venue => venue.sport === sport);
  };

  const cricketVenues = getVenuesBySport('Cricket');
  const footballVenues = getVenuesBySport('Football');
  const padelVenues = getVenuesBySport('Padel');
  const futsalVenues = getVenuesBySport('Futsal');

  const renderSportSection = (sportName, venues, icon) => {
    if (venues.length === 0) return null;
    
    return (
      <View key={sportName} style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <Text style={styles.sectionIcon}>{icon}</Text>
            <Text style={styles.sectionTitle}>{sportName} Venues</Text>
          </View>
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

  const renderChallengeCard = (challenge) => (
    <TouchableOpacity
      key={challenge.id}
      style={styles.challengeCard}
      onPress={() => navigation.navigate('ChallengeDetail', { challengeId: challenge.id })}
      activeOpacity={0.8}
    >
      <View style={styles.challengeHeader}>
        <View style={styles.challengeTypeContainer}>
          {challenge.type === 'tournament' ? (
            <MaterialIcons name="emoji-events" size={16} color="#229a60" />
          ) : challenge.type === 'private' ? (
            <MaterialIcons name="lock" size={16} color="#229a60" />
          ) : (
            <MaterialIcons name="people" size={16} color="#229a60" />
          )}
          <Text style={styles.challengeType}>
            {challenge.type === 'tournament' ? 'Tournament' : 
             challenge.type === 'private' ? 'Private' : 'Open'}
          </Text>
        </View>
        <View style={styles.sportBadge}>
          <Text style={styles.sportBadgeText}>{challenge.sport}</Text>
        </View>
      </View>
      
      <Text style={styles.challengeTitle} numberOfLines={2}>
        {challenge.title}
      </Text>
      
      <View style={styles.challengeTeamInfo}>
        <Text style={styles.challengeTeamName}>by {challenge.teamName}</Text>
        <View style={styles.challengeStats}>
          <Text style={styles.challengeStatText}>
            {challenge.teamWins}W-{challenge.teamLosses}L
          </Text>
          <Text style={styles.challengeStatText}>
            ELO: {challenge.teamElo}
          </Text>
        </View>
      </View>
      
      <View style={styles.challengeDetails}>
        <View style={styles.challengeDetailRow}>
          <MaterialIcons name="event" size={14} color="#666" />
          <Text style={styles.challengeDetailText}>
            {new Date(challenge.proposedDateTime).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Text>
        </View>
        <View style={styles.challengeDetailRow}>
          <MaterialIcons name="monetization-on" size={14} color="#666" />
          <Text style={styles.challengeDetailText}>
            PKR {challenge.maxGroundFee}
          </Text>
        </View>
      </View>
      
      {challenge.type === 'tournament' && (
        <View style={styles.tournamentProgress}>
          <Text style={styles.tournamentProgressText}>
            {challenge.participants}/{challenge.maxParticipants} teams
          </Text>
        </View>
      )}
      
      <View style={styles.challengeFooter}>
        <Text style={styles.challengeTimeAgo}>{challenge.timeAgo}</Text>
        <View style={styles.challengeActionButton}>
          <Text style={styles.challengeActionText}>Join</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
      {/* Header Section with Full-Width Image Slider */}
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
              <Text style={styles.tagline}>Plan Your Sports</Text>
              <Text style={styles.tagline}>Activates to be</Text>
              <View style={styles.bestContainer}>
                <Text style={styles.bestText}>the </Text>
                <Text style={styles.bestHighlight}>Best</Text>
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

      {/* Search Section */}
      <View style={styles.searchSection}>
        <Searchbar
          placeholder="Search areas, venues, sports..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
          iconColor="#229a60"
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

      {/* Sports Categories - Hide when searching */}
      {!showSearchResults && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sports</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sportsScroll}>
            {sportCategories.map(renderSportCategory)}
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
            <Text style={styles.loadingText}>Searching venues...</Text>
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
      ) : turfsLoading ? (
        <View style={styles.section}>
          <Text style={styles.loadingText}>Loading venues...</Text>
        </View>
      ) : (
        <>
          {/* Cricket Venues Section */}
          {renderSportSection('Cricket', cricketVenues, '🏏')}
          
          {/* Futsal Venues Section */}
          {renderSportSection('Futsal', futsalVenues, '⚽')}
          
          {/* Padel Venues Section */}
          {renderSportSection('Padel', padelVenues, '🏓')}
          
          {/* Football Venues Section */}
          {renderSportSection('Football', footballVenues, '🏈')}
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
            <Text style={styles.loadingText}>Loading challenges...</Text>
          ) : challenges.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.challengesScroll}>
              {challenges.slice(0, 4).map(renderChallengeCard)}
            </ScrollView>
          ) : (
            <Text style={styles.noDataText}>No challenges available</Text>
          )}
          
          <TouchableOpacity 
            style={styles.createChallengeButton}
            onPress={() => navigation.navigate('Lalkaar')}
          >
            <MaterialIcons name="add" size={24} color="#cdec6a" />
            <Text style={styles.createChallengeText}>Create Your Challenge</Text>
          </TouchableOpacity>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  headerContainer: {
    height: 250,
    position: 'relative',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
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
    backgroundColor: 'rgba(34, 154, 96, 0.7)',
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
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    fontFamily: 'Montserrat_600SemiBold',
  },
  tagline: {
    fontSize: 18,
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
    fontSize: 18,
    color: 'rgba(255,255,255,0.9)',
    fontFamily: 'Montserrat_400Regular',
  },
  bestHighlight: {
    fontSize: 18,
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
    elevation: 2,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    fontFamily: 'Montserrat_600SemiBold',
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
    color: '#FF8C00',
    fontWeight: '500',
    fontFamily: 'Montserrat_500Medium',
  },
  sportsScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  sportCard: {
    alignItems: 'center',
    marginRight: 20,
    width: 70,
  },
  sportIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
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
    width: 280,
    marginRight: 15,
    backgroundColor: 'white',
    borderRadius: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  venueImageContainer: {
    height: 160,
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
    backgroundColor: '#FF8C00',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingText: {
    fontSize: 12,
    color: 'white',
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
    backgroundColor: '#229a60',
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
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  challengeCard: {
    width: 280,
    marginRight: 15,
    backgroundColor: 'white',
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
    padding: 15,
  },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  challengeTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  challengeType: {
    fontSize: 12,
    color: '#229a60',
    marginLeft: 4,
    fontFamily: 'Montserrat_600SemiBold',
  },
  sportBadge: {
    backgroundColor: 'rgba(34, 154, 96, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  sportBadgeText: {
    fontSize: 11,
    color: '#229a60',
    fontFamily: 'Montserrat_600SemiBold',
  },
  challengeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    fontFamily: 'Montserrat_600SemiBold',
  },
  challengeTeamInfo: {
    marginBottom: 12,
  },
  challengeTeamName: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    fontFamily: 'Montserrat_400Regular',
  },
  challengeStats: {
    flexDirection: 'row',
  },
  challengeStatText: {
    fontSize: 11,
    color: '#666',
    marginRight: 12,
    fontFamily: 'Montserrat_400Regular',
  },
  challengeDetails: {
    marginBottom: 12,
  },
  challengeDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  challengeDetailText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 6,
    fontFamily: 'Montserrat_400Regular',
  },
  tournamentProgress: {
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 12,
  },
  tournamentProgressText: {
    fontSize: 11,
    color: '#FF9800',
    textAlign: 'center',
    fontFamily: 'Montserrat_600SemiBold',
  },
  challengeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  challengeTimeAgo: {
    fontSize: 11,
    color: '#999',
    fontFamily: 'Montserrat_400Regular',
  },
  challengeActionButton: {
    backgroundColor: '#229a60',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  challengeActionText: {
    fontSize: 12,
    color: 'white',
    fontFamily: 'Montserrat_600SemiBold',
  },
  createChallengeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#004d43',
    paddingVertical: 15,
    borderRadius: 12,
    marginTop: 15,
  },
  createChallengeText: {
    fontSize: 16,
    color: '#cdec6a',
    marginLeft: 8,
    fontFamily: 'Montserrat_600SemiBold',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    paddingVertical: 20,
    fontFamily: 'Montserrat_400Regular',
  },
  noDataText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingVertical: 20,
    fontFamily: 'Montserrat_400Regular',
  },
});