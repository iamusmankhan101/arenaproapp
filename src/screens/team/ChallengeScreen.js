import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Platform,
  Alert,
  RefreshControl
} from 'react-native';
import { Text, Searchbar } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../../theme/theme';
import { fetchChallenges, createChallenge, acceptChallenge, deleteChallenge, setUserTeam } from '../../store/slices/teamSlice';
import ChallengeCard from '../../components/ChallengeCard';
import CreateChallengeModal from '../../components/CreateChallengeModal';
import { ChallengeCardSkeleton } from '../../components/SkeletonLoader';

export default function ChallengeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // all, my-challenges
  const [refreshing, setRefreshing] = useState(false);

  console.log('🔍 ChallengeScreen: showCreateModal =', showCreateModal);

  const { challenges, loading, userTeam } = useSelector(state => state.team);
  const { user } = useSelector(state => state.auth);

  useEffect(() => {
    dispatch(fetchChallenges());
  }, [dispatch]);

  useEffect(() => {
    // Only set userTeam if it belongs to the current user
    if (user?.teamProfile && !userTeam) {
      // Verify the team belongs to this user
      if (user.teamProfile.id === user.uid) {
        dispatch(setUserTeam(user.teamProfile));
      } else {
        console.warn('⚠️ User teamProfile has incorrect ID, creating new team');
        // Create a new team with correct user ID
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
        dispatch(setUserTeam(newTeam));
      }
    }
  }, [user, userTeam, dispatch]);

  const onRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchChallenges());
    setRefreshing(false);
  };

  const handleCreateChallenge = async (challengeData) => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to create a challenge');
      return;
    }

    // Fetch creator's phone number from Firestore
    let creatorPhoneNumber = user.phoneNumber || null;
    let creatorDisplayName = user.displayName || user.fullName || user.email || 'Player';
    let creatorPhotoURL = user.photoURL || user.photoUrl || null;
    
    try {
      const { doc, getDoc } = require('firebase/firestore');
      const { db } = require('../../config/firebase');
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        creatorPhoneNumber = userData.phoneNumber || userData.phone || creatorPhoneNumber;
        creatorDisplayName = userData.displayName || userData.fullName || creatorDisplayName;
        creatorPhotoURL = userData.photoURL || userData.photoUrl || creatorPhotoURL;
      }
    } catch (error) {
      console.warn('⚠️ Could not fetch creator data:', error);
    }

    let enhancedData;

    // Check if creating as individual or team
    if (challengeData.challengeAs === 'individual') {
      // Create challenge as individual player
      enhancedData = {
        ...challengeData,
        challengerId: user.uid,
        teamName: creatorDisplayName,
        teamAvatar: creatorPhotoURL,
        creatorPhoneNumber: creatorPhoneNumber,
        creatorTeam: {
          id: user.uid,
          name: creatorDisplayName,
          avatar: creatorPhotoURL,
          wins: 0,
          losses: 0,
          draws: 0,
          eloRating: 1200,
          fairPlayScore: 5.0,
          captain: creatorDisplayName,
          founded: new Date().getFullYear().toString(),
          homeGround: user.city || 'N/A',
          isIndividual: true, // Flag to indicate this is an individual player
        }
      };
    } else {
      // Create challenge as team
      let currentTeam = userTeam;

      if (!currentTeam || currentTeam.id !== user?.uid) {
        // Always create team with current user's ID
        const newTeam = {
          id: user.uid,
          name: `${creatorDisplayName}'s Team`,
          captain: creatorDisplayName,
          avatar: creatorPhotoURL,
          founded: new Date().getFullYear().toString(),
          homeGround: user.city || 'Home Ground',
          wins: 0,
          losses: 0,
          draws: 0,
          eloRating: 1200,
          fairPlayScore: 5.0,
        };

        dispatch(setUserTeam(newTeam));
        currentTeam = newTeam;
      }

      enhancedData = {
        ...challengeData,
        challengerId: currentTeam.id,
        teamName: currentTeam.name,
        teamAvatar: currentTeam.avatar,
        creatorPhoneNumber: creatorPhoneNumber,
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
          homeGround: currentTeam.homeGround || 'N/A',
          isIndividual: false,
        }
      };
    }

    try {
      await dispatch(createChallenge(enhancedData)).unwrap();
      setShowCreateModal(false);
      // Refetch challenges to get the complete data from Firestore
      await dispatch(fetchChallenges());
      Alert.alert('Success', 'Challenge created successfully!');
    } catch (error) {
      Alert.alert('Error', error || 'Failed to create challenge');
    }
  };

  const handleAcceptChallenge = async (challengeId) => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to accept challenges');
      return;
    }

    const challenge = challenges.find(c => c.id === challengeId);
    if (!challenge) return;

    // Check if this is a team challenge
    const isTeamChallenge = challenge.creatorTeam?.isIndividual === false;

    if (isTeamChallenge) {
      // Team challenge - must accept as team
      Alert.alert(
        'Accept Team Challenge',
        `This is a team challenge from ${challenge.teamName}. You must accept as a team.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Accept as Team',
            onPress: async () => {
              try {
                // Fetch complete user data from Firestore
                const { doc, getDoc } = require('firebase/firestore');
                const { db } = require('../../config/firebase');
                
                let userData = {
                  photoURL: user.photoURL || user.photoUrl || null,
                  email: user.email || null,
                  displayName: user.displayName || user.fullName || null,
                  phoneNumber: user.phoneNumber || null,
                };

                try {
                  const userDocRef = doc(db, 'users', user.uid);
                  const userDoc = await getDoc(userDocRef);
                  if (userDoc.exists()) {
                    const firestoreData = userDoc.data();
                    userData = {
                      photoURL: firestoreData.photoURL || firestoreData.photoUrl || userData.photoURL,
                      email: firestoreData.email || userData.email,
                      displayName: firestoreData.displayName || firestoreData.fullName || userData.displayName,
                      phoneNumber: firestoreData.phoneNumber || firestoreData.phone || userData.phoneNumber,
                    };
                  }
                } catch (fetchError) {
                  console.warn('⚠️ Could not fetch user data from Firestore:', fetchError);
                }

                // Get or create team
                let currentTeam = userTeam;
                if (!currentTeam || currentTeam.id !== user?.uid) {
                  const newTeam = {
                    id: user.uid,
                    name: `${userData.displayName || 'Player'}'s Team`,
                    captain: userData.displayName || 'Captain',
                    avatar: userData.photoURL || null,
                    founded: new Date().getFullYear().toString(),
                    homeGround: user.city || 'Home Ground',
                    wins: 0,
                    losses: 0,
                    draws: 0,
                    eloRating: 1200,
                    fairPlayScore: 5.0,
                  };
                  dispatch(setUserTeam(newTeam));
                  currentTeam = newTeam;
                }

                console.log('🏆 Accepting team challenge:', {
                  challengeId,
                  opponentId: user.uid,
                  opponentName: userData.displayName || user.displayName || user.fullName || user.email,
                  teamData: currentTeam,
                  phoneNumberFound: !!userData.phoneNumber
                });

                await dispatch(acceptChallenge({
                  challengeId,
                  opponentId: user.uid,
                  opponentName: userData.displayName || user.displayName || user.fullName || user.email,
                  opponentData: userData,
                  acceptAsTeam: true,
                  teamData: currentTeam
                })).unwrap();

                Alert.alert(
                  'Challenge Accepted!',
                  'Your team has accepted the challenge. Book the venue to confirm your match.',
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
    } else {
      // Individual challenge - accept as individual player
      Alert.alert(
        'Accept Challenge',
        `Accept challenge from ${challenge.userName || challenge.teamName}? ${challenge.isWinnerTakesAll ? 'Winner takes all!' : 'Split ground fee.'}`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Accept',
            onPress: async () => {
              try {
                // Fetch complete user data from Firestore
                const { doc, getDoc } = require('firebase/firestore');
                const { db } = require('../../config/firebase');
                
                let userData = {
                  photoURL: user.photoURL || user.photoUrl || null,
                  email: user.email || null,
                  displayName: user.displayName || user.fullName || null,
                  phoneNumber: user.phoneNumber || null,
                };

                try {
                  const userDocRef = doc(db, 'users', user.uid);
                  const userDoc = await getDoc(userDocRef);
                  if (userDoc.exists()) {
                    const firestoreData = userDoc.data();
                    userData = {
                      photoURL: firestoreData.photoURL || firestoreData.photoUrl || userData.photoURL,
                      email: firestoreData.email || userData.email,
                      displayName: firestoreData.displayName || firestoreData.fullName || userData.displayName,
                      phoneNumber: firestoreData.phoneNumber || firestoreData.phone || userData.phoneNumber,
                    };
                  }
                } catch (fetchError) {
                  console.warn('⚠️ Could not fetch user data from Firestore:', fetchError);
                }

                console.log('🎯 Accepting challenge with user data:', {
                  opponentId: user.uid,
                  opponentName: userData.displayName || user.displayName || user.fullName || user.email,
                  opponentData: userData,
                  phoneNumberFound: !!userData.phoneNumber
                });

                await dispatch(acceptChallenge({
                  challengeId,
                  opponentId: user.uid,
                  opponentName: userData.displayName || user.displayName || user.fullName || user.email,
                  opponentData: userData,
                  acceptAsTeam: false,
                  teamData: null
                })).unwrap();

                Alert.alert(
                  'Challenge Accepted!',
                  'Book the venue to confirm your match.',
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
    }
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
          onPress: async () => {
            try {
              await dispatch(deleteChallenge(challengeId)).unwrap();
              Alert.alert('Success', 'Challenge deleted successfully');
            } catch (error) {
              Alert.alert('Error', error || 'Failed to delete challenge');
            }
          }
        }
      ]
    );
  };

  // Filter challenges
  const filteredChallenges = challenges.filter(challenge => {
    const matchesSearch = !searchQuery ||
      challenge.teamName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      challenge.venue?.toLowerCase().includes(searchQuery.toLowerCase());

    // For "My Challenges" tab, only show challenges created by the current user
    const isMyChallenge = activeTab === 'all' ||
      (activeTab === 'my-challenges' && (
        challenge.challengerId === user?.uid
      ));

    return matchesSearch && isMyChallenge;
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: Platform.OS === 'ios' ? insets.top + 10 : insets.top + 20 }]}>
        <Text style={styles.headerTitle}>Challenges</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => {
            console.log('🎯 Create Challenge button pressed');
            setShowCreateModal(true);
          }}
          activeOpacity={0.7}
        >
          <MaterialIcons name="add" size={24} color={theme.colors.secondary} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search challenges..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          inputStyle={styles.searchInput}
          elevation={0}
          icon="magnify"
          iconColor={theme.colors.textSecondary}
        />
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'all' && styles.activeTab]}
          onPress={() => setActiveTab('all')}
        >
          <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>
            All Challenges
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'my-challenges' && styles.activeTab]}
          onPress={() => setActiveTab('my-challenges')}
        >
          <Text style={[styles.tabText, activeTab === 'my-challenges' && styles.activeTabText]}>
            My Challenges
          </Text>
        </TouchableOpacity>
      </View>

      {/* Challenges List */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Platform.OS === 'android' ? 40 + insets.bottom + 60 : 100 } // Reduced since navbar is no longer floating
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      >
        {loading && challenges.length === 0 ? (
          <View style={{ paddingHorizontal: 0 }}>
            {[1, 2, 3].map(i => (
              <ChallengeCardSkeleton key={i} />
            ))}
          </View>
        ) : filteredChallenges.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="emoji-events" size={80} color="#E0E0E0" />
            <Text style={styles.emptyTitle}>No Challenges Found</Text>
            <Text style={styles.emptyMessage}>
              {activeTab === 'my-challenges'
                ? 'Create your first challenge to get started!'
                : 'Be the first to create a challenge!'}
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => setShowCreateModal(true)}
            >
              <Text style={styles.emptyButtonText}>Create Challenge</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredChallenges.map((challenge) => (
            <ChallengeCard
              key={challenge.id}
              challenge={challenge}
              onAccept={() => handleAcceptChallenge(challenge.id)}
              onViewDetails={() => navigation.navigate('ChallengeDetail', { challengeId: challenge.id })}
              onDelete={() => handleDeleteChallenge(challenge.id)}
              currentUserId={user?.uid}
              userTeam={userTeam}
            />
          ))
        )}
      </ScrollView>

      {/* Create Challenge Modal */}
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
    backgroundColor: theme.colors.background,
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.text,
    fontFamily: 'ClashDisplay-Medium',
  },
  createButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchBar: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    elevation: 0,
  },
  searchInput: {
    fontSize: 14,
    fontFamily: 'Montserrat_400Regular',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: theme.colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    fontFamily: 'Montserrat_600SemiBold',
  },
  activeTabText: {
    color: theme.colors.secondary,
  },
  filtersWrapper: {
    height: 60,
    marginBottom: 8,
  },
  filtersContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    gap: 8,
    alignItems: 'center',
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    marginRight: 8,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  filterChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterChipText: {
    fontSize: 14,
    color: theme.colors.secondary,
    fontFamily: 'Montserrat_500Medium',
  },
  filterChipTextActive: {
    color: theme.colors.secondary,
    fontFamily: 'Montserrat_600SemiBold',
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
    fontFamily: 'ClashDisplay-Medium',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    fontFamily: 'Montserrat_400Regular',
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  emptyButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.secondary,
    fontFamily: 'ClashDisplay-Medium',
  },
});
