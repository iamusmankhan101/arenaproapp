import React, { useEffect, useState } from 'react';

import { View, StyleSheet, FlatList, Alert, ScrollView, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, Card, Button, FAB, Chip, Searchbar } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { fetchChallenges, createChallenge, acceptChallenge, setUserTeam, deleteChallenge } from '../../store/slices/teamSlice';
import ChallengeCard from '../../components/ChallengeCard';
import CreateChallengeModal from '../../components/CreateChallengeModal';
import { MaterialIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const challengeTypes = ['All', 'Open', 'Private', 'Tournament'];
const sportFilters = ['All Sports', 'Cricket', 'Football', 'Padel'];

export default function ChallengeScreen({ navigation }) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedType, setSelectedType] = useState('All');
  const [selectedSport, setSelectedSport] = useState('All Sports');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('browse'); // browse, my-challenges, invites
  const insets = useSafeAreaInsets();

  const dispatch = useDispatch();
  const { challenges, loading, userTeam, teamStats } = useSelector(state => state.team);

  // Get auth user to check/create team profile
  const { user } = useSelector(state => state.auth);

  useEffect(() => {
    dispatch(fetchChallenges());
  }, [dispatch]);

  // Sync userTeam from Auth if available
  useEffect(() => {
    if (user?.teamProfile && !userTeam) {
      dispatch(setUserTeam(user.teamProfile));
    }
  }, [user, userTeam, dispatch]);

  const handleCreateChallenge = async (challengeData) => {
    let currentTeam = userTeam;

    // Auto-create team if missing
    if (!currentTeam) {
      if (!user) {
        Alert.alert('Error', 'You must be logged in to create a challenge');
        return;
      }

      const newTeam = {
        id: user.uid,
        name: `${user.displayName || 'Player'}'s Team`,
        captain: user.displayName || 'Captain',
        avatar: user.photoURL || null,
        founded: new Date().getFullYear().toString(),
        homeGround: user.city || 'Home Ground',
        wins: 0,
        losses: 0,
        draws: 0,
        eloRating: 1200,
        fairPlayScore: 5.0,
      };

      // Update Redux
      dispatch(setUserTeam(newTeam));
      currentTeam = newTeam;

      // Persist to Auth/Firebase (Fire and forget or await?)
      // We'll dispatch the updateProfile thunk from authSlice
      // We need to import it first, but to avoid adding more imports, we'll rely on the local state update for now
      // Ideally: dispatch(updateProfile({ teamProfile: newTeam }));
    }

    const enhancedData = {
      ...challengeData,
      challengerId: currentTeam.id,
      teamName: currentTeam.name, // Ensure teamName is at root
      teamAvatar: currentTeam.avatar, // Ensure avatar is at root if needed by some components
      creatorTeam: {
        id: currentTeam.id,
        name: currentTeam.name,
        avatar: currentTeam.avatar || currentTeam.name?.charAt(0) || 'T',
        wins: currentTeam.wins || 0,
        losses: currentTeam.losses || 0,
        draws: currentTeam.draws || 0,
        eloRating: currentTeam.eloRating || 1200,
        fairPlayScore: currentTeam.fairPlayScore || 5.0,
        captain: currentTeam.captain || 'Captain',
        founded: currentTeam.founded || '2024',
        homeGround: currentTeam.homeGround || 'N/A'
      }
    };

    dispatch(createChallenge(enhancedData));
    setShowCreateModal(false);
    Alert.alert('Success', 'Challenge created successfully!');
  };

  const handleAcceptChallenge = (challengeId) => {
    if (!userTeam) {
      Alert.alert('Error', 'You must have a team to accept challenges.');
      return;
    }

    const challenge = challenges.find(c => c.id === challengeId);
    if (!challenge) return;

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
                opponentId: userTeam.id,
                opponentTeamName: userTeam.name
              })).unwrap();

              Alert.alert(
                'Challenge Accepted!',
                `You have accepted the challenge. Please book the venue (${challenge.venue || 'Any'}) to confirm.`,
                [
                  {
                    text: 'Book Now',
                    onPress: () => navigation.navigate('VenueList', { // Changed from 'Main', { screen: 'VenueList' ... } assuming VenueList is in the same stack or accessible
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

  const handleDeleteChallenge = (challengeId) => {
    Alert.alert(
      'Delete Challenge',
      'Are you sure you want to delete this challenge?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => dispatch(deleteChallenge(challengeId))
        }
      ]
    );
  };

  const filteredChallenges = challenges.filter(challenge => {
    // Basic Filters
    const matchesType = selectedType === 'All' || challenge.type === selectedType.toLowerCase();
    const matchesSport = selectedSport === 'All Sports' || challenge.sport === selectedSport;
    const matchesSearch = searchQuery === '' ||
      (challenge.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (challenge.teamName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (challenge.venue || '').toLowerCase().includes(searchQuery.toLowerCase());

    // Tab Logic
    const currentUserId = user?.uid;

    if (activeTab === 'browse') {
      // Show only OPEN challenges that are NOT created by the current user
      // Ensure robust ID comparison (handle potential string/number mismatch)
      if (!currentUserId) return matchesType && matchesSport && matchesSearch && challenge.status === 'open';

      const isMyChallenge = String(challenge.challengerId) === String(currentUserId);

      return matchesType && matchesSport && matchesSearch &&
        challenge.status === 'open' &&
        !isMyChallenge;

    } else if (activeTab === 'my-challenges') {
      // Show challenges created by user OR accepted by user
      if (!currentUserId) return false;

      const isCreator = String(challenge.challengerId) === String(currentUserId);
      const isOpponent = String(challenge.opponentId) === String(currentUserId);

      return matchesType && matchesSport && matchesSearch && (isCreator || isOpponent);
    } else if (activeTab === 'invites') {
      // Future: Implement invites logic
      return false;
    }

    return false;
  });

  const renderTabButton = (tab, label, icon) => (
    <TouchableOpacity
      style={[styles.tabButton, activeTab === tab && styles.activeTabButton]}
      onPress={() => setActiveTab(tab)}
    >
      <MaterialIcons name={icon} size={20} color={activeTab === tab ? '#004d43' : '#666'} />
      <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderChallenge = ({ item }) => (
    <View style={{ paddingHorizontal: 20 }}>
      <ChallengeCard
        challenge={item}
        onAccept={() => handleAcceptChallenge(item.id)}
        onViewDetails={() => navigation.navigate('ChallengeDetail', { challengeId: item.id })}
        onDelete={() => handleDeleteChallenge(item.id)}
        userTeam={userTeam}
        currentUserId={user?.uid}
      />
    </View>
  );

  const renderHeader = () => (
    <View>
      {/* Header */}
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>
          Match Challenge
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Turn every booking into a competition
        </Text>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {renderTabButton('browse', 'Browse', 'explore')}
        {renderTabButton('my-challenges', 'My Challenges', 'sports-soccer')}
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActionsContainer}>
        <TouchableOpacity
          style={styles.quickActionCard}
          onPress={() => setShowCreateModal(true)}
        >
          <MaterialIcons name="add-circle" size={32} color="#e8ee26" />
          <Text style={styles.quickActionTitle}>Create Challenge</Text>
          <Text style={styles.quickActionSubtitle}>Start a new match</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickActionCard}
          onPress={() => navigation.navigate('VenueList')}
        >
          <MaterialIcons name="location-on" size={32} color="#e8ee26" />
          <Text style={styles.quickActionTitle}>Find Venue</Text>
          <Text style={styles.quickActionSubtitle}>Book a ground</Text>
        </TouchableOpacity>
      </View>

      {/* Team Stats Card */}


      {/* Search and Filters */}
      <View style={styles.filtersContainer}>
        <Searchbar
          placeholder="Search challenges, teams, venues..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
          iconColor="#004d43" // Primary brand color
        />

        <View style={{ marginBottom: 12 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll}>
            {challengeTypes.map((type) => {
              let icon = 'apps';
              if (type === 'Open') icon = 'earth';
              else if (type === 'Private') icon = 'lock';
              else if (type === 'Tournament') icon = 'trophy';

              return (
                <Chip
                  key={type}
                  mode={selectedType === type ? 'flat' : 'outlined'}
                  selected={selectedType === type}
                  onPress={() => setSelectedType(type)}
                  icon={icon}
                  style={[
                    styles.filterChip,
                    selectedType === type && { backgroundColor: '#e8ee26', borderColor: '#e8ee26' }
                  ]}
                  textStyle={[
                    styles.filterChipText,
                    selectedType === type && { color: '#004d43', fontWeight: 'bold' }
                  ]}
                  showSelectedOverlay
                >
                  {type}
                </Chip>
              );
            })}
          </ScrollView>
        </View>

        <View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll}>
            {sportFilters.map((sport) => {
              let icon = 'trophy-variant-outline';
              if (sport === 'All Sports') icon = 'trophy-variant-outline';
              else if (sport === 'Cricket') icon = 'cricket';
              else if (sport === 'Football') icon = 'soccer';
              else if (sport === 'Padel') icon = 'tennis-ball';

              return (
                <Chip
                  key={sport}
                  mode={selectedSport === sport ? 'flat' : 'outlined'}
                  selected={selectedSport === sport}
                  onPress={() => setSelectedSport(sport)}
                  icon={icon}
                  style={[
                    styles.filterChip,
                    selectedSport === sport && { backgroundColor: '#e8ee26', borderColor: '#e8ee26' }
                  ]}
                  textStyle={[
                    styles.filterChipText,
                    selectedSport === sport && { color: '#004d43', fontWeight: 'bold' }
                  ]}
                  showSelectedOverlay
                >
                  {sport}
                </Chip>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Challenges List with Header */}
      <FlatList
        data={filteredChallenges}
        renderItem={renderChallenge}
        keyExtractor={item => item?.id?.toString() || Math.random().toString()}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={{ paddingBottom: 100 + insets.bottom }}
        refreshing={loading}
        onRefresh={() => dispatch(fetchChallenges())}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialIcons name="sports-soccer" size={64} color="#ccc" />
            <Text variant="bodyLarge" style={styles.emptyText}>
              {activeTab === 'browse' ? 'No challenges available' :
                activeTab === 'my-challenges' ? 'You haven\'t created any challenges yet' :
                  'No pending invites'}
            </Text>
            <Text style={styles.emptySubtext}>
              {activeTab === 'browse' ? 'Be the first to create a challenge!' :
                activeTab === 'my-challenges' ? 'Create your first challenge to get started' :
                  'Check back later for new invitations'}
            </Text>
          </View>
        }
      />

      <CreateChallengeModal
        visible={showCreateModal}
        onDismiss={() => setShowCreateModal(false)}
        onSubmit={handleCreateChallenge}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#004d43', // Primary brand color
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  title: {
    color: 'white',
    fontWeight: 'bold',
    fontFamily: 'Montserrat_700Bold',
    fontSize: 20,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.9)',
    marginTop: 5,
    fontFamily: 'Montserrat_400Regular',
    fontSize: 13,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  activeTabButton: {
    backgroundColor: 'rgba(0, 77, 67, 0.1)', // Primary brand color with transparency
  },
  tabText: {
    marginLeft: 8,
    fontSize: 12,
    color: '#666',
    fontFamily: 'Montserrat_500Medium',
  },
  activeTabText: {
    color: '#004d43', // Primary brand color
    fontWeight: 'bold',
  },
  quickActionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    gap: 15,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: '#004d43',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  quickActionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffffff',
    marginTop: 8,
    fontFamily: 'Montserrat_600SemiBold',
  },
  quickActionSubtitle: {
    fontSize: 11,
    color: '#ffffffff',
    marginTop: 4,
    fontFamily: 'Montserrat_400Regular',
  },
  statsCard: {
    margin: 20,
    marginTop: 0,
    elevation: 3,
    borderRadius: 12,
  },
  teamHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  teamName: {
    fontWeight: 'bold',
    color: '#004d43', // Primary brand color
    fontFamily: 'Montserrat_700Bold',
    fontSize: 16,
  },
  teamRank: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
    fontFamily: 'Montserrat_400Regular',
  },
  winRateContainer: {
    alignItems: 'center',
  },
  winRateValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#004d43', // Primary brand color
    fontFamily: 'Montserrat_700Bold',
  },
  winRateLabel: {
    fontSize: 11,
    color: '#666',
    fontFamily: 'Montserrat_400Regular',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'Montserrat_600SemiBold',
  },
  statLabel: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
    fontFamily: 'Montserrat_400Regular',
  },
  filtersContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  searchbar: {
    elevation: 0,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    marginBottom: 15,
  },
  filtersScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  filterGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 10,
    fontFamily: 'Montserrat_600SemiBold',
  },
  filterChip: {
    marginRight: 8,
    backgroundColor: 'white',
    borderColor: '#E0E0E0',
  },
  selectedFilterChip: {
    backgroundColor: '#004d43', // Primary brand color
    borderColor: '#004d43',
  },
  filterChipText: {
    color: '#666',
    fontFamily: 'Montserrat_500Medium',
    fontSize: 11,
  },
  selectedFilterChipText: {
    color: 'white',
  },
  list: {
    padding: 20,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 50,
    paddingHorizontal: 20,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 16,
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 16,
  },
  emptySubtext: {
    textAlign: 'center',
    color: '#999',
    marginTop: 8,
    fontSize: 13,
    fontFamily: 'Montserrat_400Regular',
  },
});