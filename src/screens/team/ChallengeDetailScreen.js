import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
  Share,
  ActivityIndicator,
  Linking
} from 'react-native';
import { Text, Card, Button, Chip, Avatar, Divider } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { acceptChallenge, joinTournament, deleteChallenge, setUserTeam } from '../../store/slices/teamSlice';
import { MaterialIcons } from '@expo/vector-icons';
import { safeDate, safeFormatDate } from '../../utils/dateUtils';
import { challengeService } from '../../services/challengeService';
import { emailService } from '../../services/emailService';

const { width } = Dimensions.get('window');

export default function ChallengeDetailScreen({ route, navigation }) {
  const { challengeId } = route.params;
  const [challenge, setChallenge] = useState(null);
  const dispatch = useDispatch();
  const { userTeam } = useSelector(state => state.team);
  const { user } = useSelector(state => state.auth);

  // Mock challenge data - in real app, this would come from API

  useEffect(() => {
    if (!challengeId) return;

    // Set up real-time listener for challenge updates
    const { doc, onSnapshot } = require('firebase/firestore');
    const { db } = require('../../config/firebase');
    
    const challengeRef = doc(db, 'challenges', challengeId);
    
    const unsubscribe = onSnapshot(challengeRef, async (docSnap) => {
      if (docSnap.exists()) {
        const data = { id: docSnap.id, ...docSnap.data() };
        
        // Normalize challenge data - auto-fix legacy challenges
        let normalizedData = data;
        
        // If challenge is accepted but acceptedUser is missing, try to fetch user data
        if (data.status === 'accepted' && !data.acceptedUser && data.opponentId) {
          console.log('🔧 Legacy challenge detected, fetching opponent user data...');
          try {
            const { doc: docRef, getDoc } = require('firebase/firestore');
            
            const userDoc = await getDoc(docRef(db, 'users', data.opponentId));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              normalizedData = {
                ...data,
                acceptedUser: {
                  id: data.opponentId,
                  name: userData.displayName || userData.fullName || userData.email || data.opponentName || 'Opponent',
                  photoURL: userData.photoURL || userData.photoUrl || null,
                }
              };
              console.log('✅ Fetched opponent data:', normalizedData.acceptedUser);
            } else {
              // Fallback to basic data from challenge
              normalizedData = {
                ...data,
                acceptedUser: {
                  id: data.opponentId,
                  name: data.opponentName || 'Opponent',
                  photoURL: null,
                }
              };
            }
          } catch (fetchError) {
            console.error('❌ Error fetching opponent user data:', fetchError);
            // Fallback to basic data
            normalizedData = {
              ...data,
              acceptedUser: {
                id: data.opponentId,
                name: data.opponentName || 'Opponent',
                photoURL: null,
              }
            };
          }
        }
        
        console.log('📋 Challenge data loaded (real-time):', {
          id: normalizedData.id,
          title: normalizedData.title,
          participants: normalizedData.participants,
          participantsCount: normalizedData.participants?.length || 0,
          participantsDetails: normalizedData.participants?.map(p => ({
            id: p.id,
            name: p.name,
            phoneNumber: p.phoneNumber,
            hasPhone: !!p.phoneNumber
          })),
          creatorTeam: normalizedData.creatorTeam,
          creatorPhoneNumber: normalizedData.creatorPhoneNumber,
          challengerId: normalizedData.challengerId
        });
        
        setChallenge(normalizedData);
      } else {
        Alert.alert('Error', 'Challenge not found');
        navigation.goBack();
      }
    }, (error) => {
      console.error('Error loading challenge:', error);
      Alert.alert('Error', 'Failed to load challenge details');
    });

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, [challengeId, navigation]);

  if (!challenge) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#004d43" />
      </View>
    );
  }

  const handleAcceptChallenge = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to accept challenges.');
      return;
    }

    // Check if this is a team challenge
    const isTeamChallenge = challenge.creatorTeam?.isIndividual === false;

    const alertMessage = isTeamChallenge 
      ? `This is a team challenge. Your team will compete against ${challenge.creatorTeam.name}. ${challenge.isWinnerTakesAll ? 'The loser will pay the entire ground fee.' : 'Ground fee will be split equally.'}`
      : `Are you sure you want to accept this challenge? ${challenge.isWinnerTakesAll ? 'The loser will pay the entire ground fee.' : 'Ground fee will be split equally.'}`;

    Alert.alert(
      isTeamChallenge ? 'Accept Team Challenge' : 'Accept Challenge',
      alertMessage,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: isTeamChallenge ? 'Accept as Team' : 'Accept Challenge',
          onPress: async () => {
            // Fetch complete user data from Firestore
            const { doc, getDoc } = require('firebase/firestore');
            const { db } = require('../../config/firebase');
            
            let userData = {
              photoURL: user.photoURL || user.photoUrl || null,
              email: user.email || null,
              displayName: user.displayName || null,
              phoneNumber: user.phoneNumber || null,
            };

            // Try to get more complete data from Firestore
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

            let dispatchData = {
              challengeId,
              opponentId: user.uid,
              opponentName: userData.displayName || user.displayName || user.email,
              opponentData: userData,
              acceptAsTeam: isTeamChallenge,
              teamData: null
            };

            // If team challenge, get or create team
            if (isTeamChallenge) {
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
              dispatchData.teamData = currentTeam;
            }

            console.log('🎯 Accepting challenge:', {
              ...dispatchData,
              isTeamChallenge
            });

            dispatch(acceptChallenge(dispatchData));

            // --- SEND EMAIL NOTIFICATIONS ---
            try {
              // 1. Notify Creator
              if (challenge.creator) {
                await emailService.sendChallengeAcceptanceToCreator(challenge, userTeam, challenge.creator);
              }

              // 2. Notify Acceptor (Self)
              if (user) {
                await emailService.sendChallengeJoinConfirmation(challenge, user);
              }
            } catch (emailError) {
              console.log('⚠️ Failed to send challenge emails:', emailError);
            }

            // Check if venue is already set
            if (challenge.venue && challenge.venue !== 'TBD' && challenge.venue !== 'No venue specified') {
              Alert.alert(
                'Challenge Accepted!',
                `${isTeamChallenge ? 'Your team has' : 'You have'} accepted the challenge at ${challenge.venue}. Good luck!`,
                [{ text: 'OK', onPress: () => navigation.goBack() }]
              );
            } else {
              Alert.alert(
                'Challenge Accepted!',
                `${isTeamChallenge ? 'Your team has' : 'You have'} accepted the challenge. Please book a venue to confirm.`,
                [
                  {
                    text: 'Book Now',
                    onPress: () => navigation.navigate('Main', {
                      screen: 'VenueList',
                      params: { searchQuery: challenge.venue, sport: challenge.sport }
                    })
                  },
                  { text: 'Later', style: 'cancel', onPress: () => navigation.goBack() }
                ]
              );
            }
          }
        }
      ]
    );
  };

  const handleDeleteChallenge = () => {
    Alert.alert(
      'Delete Challenge',
      'Are you sure you want to delete this challenge? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            dispatch(deleteChallenge(challengeId));
            navigation.goBack();
          }
        }
      ]
    );

  };

  const handleJoinTournament = () => {
    Alert.alert(
      'Join Tournament',
      `Join this ${challenge.sport} tournament? You'll be competing against ${challenge.participants - 1} other teams.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Join Tournament',
          onPress: () => {
            dispatch(joinTournament(challengeId));
            Alert.alert('Success', 'Joined tournament! Check your team dashboard for updates.');
            navigation.goBack();
          }
        }
      ]
    );
  };

  const handleShareChallenge = async () => {
    try {
      const formattedDate = safeFormatDate(challenge.proposedDateTime, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }, 'a future date');

      await Share.share({
        message: `Check out this ${challenge.sport} challenge: "${challenge.title}" on ${formattedDate}. Join the competition!`,
        title: challenge.title
      });
    } catch (error) {
      console.log('Error sharing:', error);
    }
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) {
      return {
        date: 'Invalid Date',
        time: 'Invalid Time'
      };
    }

    const date = safeDate(dateTime);
    return {
      date: safeFormatDate(date, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }, 'Invalid Date'),
      time: safeFormatDate(date, {
        hour: '2-digit',
        minute: '2-digit'
      }, 'Invalid Time')
    };
  };

  const getChallengeTypeIcon = (type) => {
    switch (type) {
      case 'open': return 'public';
      case 'private': return 'lock';
      case 'tournament': return 'emoji-events';
      default: return 'sports-soccer';
    }
  };

  const getSportIcon = (sport) => {
    switch (sport?.toLowerCase()) {
      case 'cricket': return 'sports-cricket';
      case 'football': return 'sports-soccer';
      case 'padel': return 'sports-tennis';
      case 'badminton': return 'sports-tennis';
      default: return 'sports';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return '#229a60';
      case 'accepted': return '#FF9800';
      case 'completed': return '#2196F3';
      case 'cancelled': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  // Robust check for own challenge
  const isOwnChallenge = (user && String(challenge?.challengerId) === String(user.uid)) ||
    (userTeam && (String(challenge?.challengerId) === String(userTeam.id) ||
      String(challenge?.creatorTeam?.id) === String(userTeam.id)));

  const canJoin = !isOwnChallenge && challenge?.status === 'open';
  const isTournament = challenge?.type === 'tournament';

  // Calculate if there are spots available for individual challenges
  const hasAvailableSpots = () => {
    if (isTournament) return true;
    if (challenge.creatorTeam?.isIndividual === false) {
      // Team challenge - can only accept if not already accepted
      return challenge.status === 'open';
    }
    
    // Individual challenge - check if spots are available
    let neededPlayers = 1;
    
    // First check if custom player counts are specified (takes priority)
    const hasCustomCounts = challenge.currentPlayers || challenge.needPlayers;
    
    if (hasCustomCounts) {
      neededPlayers = parseInt(challenge.needPlayers) || 0;
    } else if (challenge.sport === 'Padel' && challenge.format) {
      // Use Padel format defaults only if no custom counts
      if (challenge.format === '1v1') neededPlayers = 1;
      else if (challenge.format === '2v2') neededPlayers = 2;
    }
    
    const participants = challenge.participants || [];
    const availableSpots = neededPlayers - participants.length;
    return availableSpots > 0;
  };

  // Check if current user has already joined this challenge
  const hasUserJoined = () => {
    if (!user) return false;
    const participants = challenge.participants || [];
    return participants.some(p => String(p.id).toLowerCase().trim() === String(user.uid).toLowerCase().trim());
  };

  const showAcceptButton = canJoin && hasAvailableSpots() && !hasUserJoined();

  console.log('🔍 DEBUG: isOwnChallenge:', isOwnChallenge, {
    currentUserId: user?.uid,
    userTeamId: userTeam?.id,
    challengeChallengerId: challenge?.challengerId,
    challengeCreatorTeamId: challenge?.creatorTeam?.id
  });

  if (!challenge) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const dateTime = formatDateTime(challenge.proposedDateTime);

  return (
    <View style={styles.container}>
      {/* Clean Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
          <MaterialIcons name="arrow-back" size={24} color="#004d43" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Challenge Details</Text>
        <TouchableOpacity onPress={handleShareChallenge} style={styles.iconButton}>
          <MaterialIcons name="share" size={24} color="#004d43" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Status Banner */}
        <View style={styles.bannerContainer}>
          <Chip
            mode="flat"
            style={[styles.statusChip, { backgroundColor: getStatusColor(challenge.status) + '20' }]} // 20% opacity
            textStyle={{ color: getStatusColor(challenge.status), fontWeight: 'bold' }}
            icon={() => <MaterialIcons name={challenge.status === 'open' ? 'lock-open' : 'lock'} size={16} color={getStatusColor(challenge.status)} />}
          >
            {challenge.status.toUpperCase()}
          </Chip>
          <Text style={styles.sportLabel}>{String(challenge.sport || 'Sport').toUpperCase()}</Text>
        </View>

        {/* Title */}
        <Text style={styles.mainTitle}>{String(challenge.title || 'Challenge')}</Text>

        {/* VS Matchup Section */}
        {isTournament ? (
          <View style={styles.tournamentHeader}>
            <View style={{
              width: 100,
              height: 100,
              borderRadius: 50,
              backgroundColor: '#fff8e1',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 16,
              borderWidth: 4,
              borderColor: '#ffecb3'
            }}>
              <MaterialIcons name="emoji-events" size={60} color="#ffa000" />
            </View>
            <Text style={styles.tournamentTitle}>Tournament Challenge</Text>
            <Text style={styles.tournamentSub}>
              {String(challenge.participants?.length || 0)} / {String(challenge.maxParticipants || 0)} Teams Joined
            </Text>
            <Chip icon="information" style={{ marginTop: 10, backgroundColor: '#e0f2f1' }} textStyle={{ color: '#004d43' }}>
              Knockout Format
            </Chip>
          </View>
        ) : (
          <View style={styles.matchupContainer}>
            {/* Team A - Creator */}
            <View style={styles.teamColumn}>
              <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 10 }}>
                {(() => {
                  let count = 1;
                  if (challenge.sport === 'Padel') {
                    if (challenge.format === '2v2') count = 2;
                    else if (challenge.format === '4v4') count = 4;
                  }
                  const avatarSize = count > 2 ? 40 : 64;
                  const overlap = -(avatarSize / 2.5);

                  return Array.from({ length: Math.max(1, count) }).map((_, index) => {
                    const isCaptain = index === 0;
                    return (
                      <View key={`creator-${index}`} style={{
                        marginLeft: index === 0 ? 0 : overlap,
                        zIndex: count - index,
                        elevation: count - index,
                        borderRadius: avatarSize,
                        borderWidth: 2,
                        borderColor: '#fff'
                      }}>
                        {isCaptain && challenge.creatorTeam?.avatar && challenge.creatorTeam.avatar.length > 2 ? (
                          <Avatar.Image
                            size={avatarSize}
                            source={{ uri: challenge.creatorTeam.avatar }}
                            style={{ backgroundColor: '#004d43' }}
                          />
                        ) : (
                          <Avatar.Text
                            size={avatarSize}
                            label={isCaptain ? (challenge.creatorTeam.name?.charAt(0) || 'T') : '+'}
                            style={{ backgroundColor: isCaptain ? '#004d43' : '#e0e0e0' }}
                            color={isCaptain ? '#e8ee26' : '#757575'}
                            labelStyle={{ fontWeight: 'bold' }}
                          />
                        )}
                      </View>
                    );
                  });
                })()}
              </View>
              <Text style={styles.teamName} numberOfLines={2}>
                {String(challenge.creatorTeam.name || 'Team')}
                {challenge.creatorTeam.isIndividual && (
                  <Text style={{ fontSize: 10, color: '#999' }}> (Individual)</Text>
                )}
              </Text>
              <Text style={styles.teamStat}>{String(challenge.creatorTeam.wins || 0)} Wins</Text>
            </View>

            {/* VS */}
            <View style={styles.vsColumn}>
              <View style={styles.vsCircle}>
                <Text style={styles.vsText}>
                  {challenge.sport === 'Padel' && challenge.format ? challenge.format : 'VS'}
                </Text>
              </View>
            </View>

            {/* Team B - Opponent */}
            <View style={styles.teamColumn}>
              <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 10 }}>
                {(() => {
                  // For individual challenges, show participants
                  if (challenge.creatorTeam?.isIndividual && challenge.participants && challenge.participants.length > 0) {
                    const participants = challenge.participants.slice(0, 3);
                    const avatarSize = participants.length > 1 ? 40 : 64;
                    const overlap = -(avatarSize / 2.5);

                    return participants.map((participant, index) => (
                      <View key={participant.id || index} style={{
                        marginLeft: index === 0 ? 0 : overlap,
                        zIndex: participants.length - index,
                        elevation: participants.length - index,
                        borderRadius: avatarSize,
                        borderWidth: 2,
                        borderColor: '#fff'
                      }}>
                        {participant.photoURL && participant.photoURL.length > 2 ? (
                          <Avatar.Image
                            size={avatarSize}
                            source={{ uri: participant.photoURL }}
                            style={{ backgroundColor: '#fff3e0' }}
                          />
                        ) : (
                          <Avatar.Text
                            size={avatarSize}
                            label={participant.name?.charAt(0) || 'P'}
                            style={{ backgroundColor: '#fff3e0' }}
                            color="#e65100"
                            labelStyle={{ fontWeight: 'bold' }}
                          />
                        )}
                      </View>
                    ));
                  }

                  // For team challenges or no participants yet
                  let count = 1;
                  if (challenge.sport === 'Padel') {
                    if (challenge.format === '2v2') count = 2;
                    else if (challenge.format === '4v4') count = 4;
                  }
                  const avatarSize = count > 2 ? 40 : 64;
                  const overlap = -(avatarSize / 2.5);

                  // Check if opponent exists - prioritize acceptedUser
                  const hasOpponent = !!(challenge.acceptedUser || challenge.acceptedBy || challenge.acceptedTeam || (challenge.status === 'accepted' && challenge.opponentId));

                  return Array.from({ length: Math.max(1, count) }).map((_, index) => {
                    const isCaptain = index === 0;
                    return (
                      <View key={`opponent-${index}`} style={{
                        marginLeft: index === 0 ? 0 : overlap,
                        zIndex: count - index,
                        elevation: count - index,
                        borderRadius: avatarSize,
                        borderWidth: 2,
                        borderColor: '#fff'
                      }}>
                        {hasOpponent && isCaptain ? (
                          (challenge.acceptedUser?.photoURL || challenge.acceptedTeam?.avatar) && (challenge.acceptedUser?.photoURL || challenge.acceptedTeam.avatar).length > 2 ? (
                            <Avatar.Image
                              size={avatarSize}
                              source={{ uri: challenge.acceptedUser?.photoURL || challenge.acceptedTeam.avatar }}
                              style={{ backgroundColor: '#fff3e0' }}
                            />
                          ) : (
                            <Avatar.Text
                              size={avatarSize}
                              label={(challenge.acceptedUser?.name || challenge.acceptedTeam?.name || challenge.opponentName)?.charAt(0) || 'O'}
                              style={{ backgroundColor: '#fff3e0' }}
                              color="#e65100"
                              labelStyle={{ fontWeight: 'bold' }}
                            />
                          )
                        ) : (
                          // Placeholder or extra player
                          <View style={[styles.emptyAvatar, {
                            width: avatarSize,
                            height: avatarSize,
                            borderRadius: avatarSize / 2,
                            marginBottom: 0,
                            backgroundColor: hasOpponent ? '#f5f5f5' : '#fafafa'
                          }]}>
                            <MaterialIcons
                              name={hasOpponent ? "person" : "person-outline"}
                              size={avatarSize * 0.5}
                              color={hasOpponent ? "#bdbdbd" : "#e0e0e0"}
                            />
                          </View>
                        )}
                      </View>
                    );
                  });
                })()}
              </View>
              {challenge.creatorTeam?.isIndividual && challenge.participants && challenge.participants.length > 0 ? (
                <>
                  <Text style={styles.teamName} numberOfLines={2}>
                    {challenge.participants.length === 1 
                      ? String(challenge.participants[0].name || 'Player')
                      : String(challenge.participants.length + ' Players')}
                  </Text>
                  <Text style={styles.teamStat}>{String(challenge.participants.length + ' Joined')}</Text>
                </>
              ) : challenge.acceptedUser || challenge.acceptedBy || challenge.acceptedTeam || (challenge.status === 'accepted' && challenge.opponentId) ? (
                <>
                  <Text style={styles.teamName} numberOfLines={2}>
                    {challenge.acceptedUser?.name || challenge.opponentName || challenge.acceptedTeam?.name || challenge.opponentTeamName || 'Opponent'}
                  </Text>
                  <Text style={styles.teamStat}>{String((challenge.acceptedTeam?.wins || 0) + ' Wins')}</Text>
                </>
              ) : (
                <Text style={styles.waitingText}>Waiting for{'\n'}Opponent</Text>
              )}
            </View>
          </View>
        )}

        <Divider style={styles.divider} />

        {/* Details List */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionHeader}>MATCH DETAILS</Text>

          <View style={styles.infoRow}>
            <View style={styles.iconCircle}>
              <MaterialIcons name="calendar-today" size={20} color="#e8ee26" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Date & Time</Text>
              <Text style={styles.infoValue}>{String(dateTime.date + ' • ' + dateTime.time)}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.iconCircle}>
              <MaterialIcons name="location-on" size={20} color="#e8ee26" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Venue</Text>
              <Text style={styles.infoValue}>{String(challenge.venue || 'No venue specified')}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.iconCircle}>
              <MaterialIcons name={isTournament ? "emoji-events" : "payments"} size={20} color="#e8ee26" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>{String(isTournament ? "Winning Prize" : "Ground Fee")}</Text>
              <Text style={styles.infoValue}>
                {String('PKR ' + Number(isTournament ? (challenge.winningPrize || 50000) : challenge.maxGroundFee).toLocaleString())}
              </Text>
              <Text style={styles.infoSub}>{String(isTournament ? 'Total Pool' : (challenge.isWinnerTakesAll ? 'Winner takes all' : 'Split equally'))}</Text>
            </View>
          </View>
        </View>

        <Divider style={styles.divider} />

        {/* Specs */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionHeader}>SPECIFICATIONS</Text>
          <View style={styles.specsRow}>
            {!!challenge.format && <Chip style={styles.specChip} textStyle={{ color: '#e8ee26' }}>{String(challenge.format)}</Chip>}
            {!!challenge.overs && <Chip style={styles.specChip} textStyle={{ color: '#e8ee26' }}>{String(challenge.overs)} Overs</Chip>}
            {!!challenge.ballType && <Chip style={styles.specChip} textStyle={{ color: '#e8ee26' }}>{String(challenge.ballType)} Ball</Chip>}
            <Chip style={styles.specChip} textStyle={{ color: '#e8ee26' }}>{challenge.type === 'private' ? 'Private' : 'Public'}</Chip>
          </View>

          {!!challenge.description && (
            <View style={styles.noteBox}>
              <Text style={styles.noteText}>{String(challenge.description)}</Text>
            </View>
          )}
        </View>

        {isTournament && (
          <View style={styles.infoSection}>
            <Text style={styles.sectionHeader}>PARTICIPANTS ({String(challenge.participants?.length || 0)}/{String(challenge.maxParticipants || 0)})</Text>
            {challenge.participants && challenge.participants.map((participant, index) => (
              <View key={participant.id || index} style={styles.participantRow}>
                {participant.avatar ? (
                  <Avatar.Image size={32} source={{ uri: participant.avatar }} style={{ marginRight: 10 }} />
                ) : (
                  <Avatar.Text
                    size={32}
                    label={participant.name ? participant.name.charAt(0).toUpperCase() : 'T'}
                    style={{ marginRight: 10, backgroundColor: '#e8f5f3' }}
                    color="#004d43"
                  />
                )}
                <View>
                  <Text style={styles.participantName}>{String(participant.name || 'Participant')}</Text>
                  {!!participant.joinedAt && (
                    <Text style={styles.participantJoined}>Joined {String(safeFormatDate(participant.joinedAt))}</Text>
                  )}
                </View>
              </View>
            ))}
            {(!challenge.participants || challenge.participants.length === 0) && (
              <Text style={styles.noParticipantsText}>No teams have joined properly yet.</Text>
            )}
          </View>
        )}

        {/* Participants Section for Regular Challenges */}
        {!isTournament && !challenge.creatorTeam?.isIndividual && (
          <View style={styles.infoSection}>
            <Text style={styles.sectionHeader}>TEAM MATCH</Text>
            <View style={styles.noteBox}>
              <MaterialIcons name="info-outline" size={20} color="#004d43" style={{ marginRight: 8 }} />
              <Text style={styles.noteText}>
                This is a team vs team challenge. The entire team will compete.
              </Text>
            </View>
          </View>
        )}

        {/* Participants Section for Individual Challenges */}
        {!isTournament && challenge.creatorTeam?.isIndividual && (
          <View style={styles.infoSection}>
            <Text style={styles.sectionHeader}>
              PLAYERS JOINED ({String(challenge.participants?.length || 0)})
            </Text>
            
            {(() => {
              console.log('🎨 Rendering participants section:', {
                hasParticipants: !!challenge.participants,
                participantsLength: challenge.participants?.length || 0,
                participants: challenge.participants
              });
              return null;
            })()}
            
            {challenge.participants && challenge.participants.length > 0 ? (
              challenge.participants.map((participant, index) => {
                console.log(`👤 Rendering participant ${index + 1}:`, {
                  id: participant.id,
                  name: participant.name,
                  hasPhone: !!participant.phoneNumber,
                  phoneNumber: participant.phoneNumber
                });
                
                return (
                  <View key={participant.id || index} style={styles.participantRow}>
                    {participant.photoURL ? (
                      <Avatar.Image size={40} source={{ uri: participant.photoURL }} style={{ marginRight: 12 }} />
                    ) : (
                      <Avatar.Text
                        size={40}
                        label={participant.name ? participant.name.charAt(0).toUpperCase() : 'P'}
                        style={{ marginRight: 12, backgroundColor: '#e8f5f3' }}
                        color="#004d43"
                      />
                    )}
                    <View style={{ flex: 1 }}>
                      <Text style={styles.participantName}>{String(participant.name || 'Player')}</Text>
                      {participant.phoneNumber ? (
                        <TouchableOpacity 
                          onPress={() => Linking.openURL(`tel:${participant.phoneNumber}`)}
                          style={styles.phoneButton}
                        >
                          <MaterialIcons name="phone" size={14} color="#004d43" />
                          <Text style={styles.phoneText}>{String(participant.phoneNumber)}</Text>
                        </TouchableOpacity>
                      ) : (
                        <Text style={styles.participantJoined}>No phone number</Text>
                      )}
                      {participant.joinedAt && (
                        <Text style={styles.participantJoined}>Joined {String(safeFormatDate(participant.joinedAt))}</Text>
                      )}
                    </View>
                    {participant.phoneNumber && (
                      <TouchableOpacity 
                        style={styles.callButton}
                        onPress={() => Linking.openURL(`tel:${participant.phoneNumber}`)}
                      >
                        <MaterialIcons name="phone" size={20} color="#fff" />
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })
            ) : (
              <Text style={styles.noParticipantsText}>No players have joined yet</Text>
            )}
          </View>
        )}

        {/* Creator Contact Info - Always show for non-tournament challenges */}
        {!isTournament && challenge.creatorTeam && (
          <View style={styles.infoSection}>
            <Text style={styles.sectionHeader}>CHALLENGE CREATOR</Text>
            <View style={styles.participantRow}>
              {challenge.creatorTeam.avatar ? (
                <Avatar.Image size={40} source={{ uri: challenge.creatorTeam.avatar }} style={{ marginRight: 12 }} />
              ) : (
                <Avatar.Text
                  size={40}
                  label={challenge.creatorTeam.name ? challenge.creatorTeam.name.charAt(0).toUpperCase() : 'C'}
                  style={{ marginRight: 12, backgroundColor: '#e8f5f3' }}
                  color="#004d43"
                />
              )}
              <View style={{ flex: 1 }}>
                <Text style={styles.participantName}>{String(challenge.creatorTeam.name || challenge.teamName || 'Creator')}</Text>
                {challenge.creatorPhoneNumber ? (
                  <TouchableOpacity 
                    onPress={() => Linking.openURL(`tel:${challenge.creatorPhoneNumber}`)}
                    style={styles.phoneButton}
                  >
                    <MaterialIcons name="phone" size={14} color="#004d43" />
                    <Text style={styles.phoneText}>{String(challenge.creatorPhoneNumber)}</Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={styles.participantJoined}>No phone number</Text>
                )}
              </View>
              {challenge.creatorPhoneNumber && (
                <TouchableOpacity 
                  style={styles.callButton}
                  onPress={() => Linking.openURL(`tel:${challenge.creatorPhoneNumber}`)}
                >
                  <MaterialIcons name="phone" size={20} color="#fff" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

      </ScrollView>

      {/* Action Button */}
      {showAcceptButton && (
        <View style={styles.bottomBar}>
          <Button
            mode="contained"
            onPress={isTournament ? handleJoinTournament : handleAcceptChallenge}
            style={styles.actionButton}
            contentStyle={{ height: 50 }}
            labelStyle={{ fontSize: 16, fontWeight: 'bold' }}
          >
            {isTournament ? 'Join Tournament' : 'Accept Challenge'}
          </Button>
        </View>
      )}

      {isOwnChallenge && (
        <View style={styles.bottomBar}>
          <Button
            mode="outlined"
            onPress={handleDeleteChallenge}
            style={{ borderColor: '#F44336' }}
            textColor="#F44336"
            icon="delete"
          >
            Delete Challenge
          </Button>
          <Text style={[styles.ownChallengeNote, { marginTop: 10 }]}>You created this challenge</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff', // Clean white background
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 10,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#004d43',
  },
  iconButton: {
    padding: 8,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  bannerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 20,
  },
  statusChip: {
    height: 28,
  },
  sportLabel: {
    fontWeight: 'bold',
    color: '#888',
    letterSpacing: 1,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#222',
    marginVertical: 20,
    paddingHorizontal: 20,
  },
  matchupContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  teamColumn: {
    alignItems: 'center',
    flex: 1,
  },
  vsColumn: {
    width: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vsCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#004d43', // Primary Brand Color
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  vsText: {
    fontSize: 14,
    color: '#e8ee26',
    fontWeight: '900',
  },
  teamName: {
    marginTop: 10,
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
    color: '#333',
    height: 40, // Fixed height to prevent alignment shifts
  },
  teamStat: {
    fontSize: 12,
    color: '#888',
  },
  emptyAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
    borderStyle: 'dashed',
  },
  waitingText: {
    marginTop: 10,
    fontSize: 12,
    color: '#aaa',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  divider: {
    height: 8,
    backgroundColor: '#f8f9fa',
    marginVertical: 10,
  },
  infoSection: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#999',
    marginBottom: 15,
    letterSpacing: 1,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#004d43', // Primary Brand Color
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: '#004d43',
    fontWeight: '600',
  },
  infoSub: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  specsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  specChip: {
    backgroundColor: '#004d43', // Primary Brand Color
  },
  noteBox: {
    marginTop: 15,
    padding: 15,
    backgroundColor: '#f0f4c3', // Light secondary tint
    borderRadius: 12,
  },
  noteText: {
    fontSize: 14,
    color: '#004d43',
    fontStyle: 'italic',
  },
  participantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  participantName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  participantJoined: {
    fontSize: 10,
    color: '#999',
    marginTop: 2,
  },
  phoneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  phoneText: {
    fontSize: 12,
    color: '#004d43',
    fontWeight: '500',
  },
  callButton: {
    backgroundColor: '#004d43',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noParticipantsText: {
    fontSize: 13,
    color: '#888',
    fontStyle: 'italic',
    paddingVertical: 10,
  },
  bottomBar: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  actionButton: {
    borderRadius: 12,
    backgroundColor: '#004d43',
  },
  ownChallengeNote: {
    textAlign: 'center',
    color: '#999',
    fontStyle: 'italic',
  },
  tournamentHeader: {
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#fff',
  },
  tournamentTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#004d43',
    marginTop: 10,
  },
  tournamentSub: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  contactCard: {
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0f2fe',
  },
  contactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#004d43',
  },
  contactDescription: {
    fontSize: 13,
    color: '#666',
    marginBottom: 16,
    lineHeight: 18,
  },
  contactActions: {
    gap: 10,
    marginBottom: 12,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#25D366',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  contactButtonSecondary: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#004d43',
  },
  contactButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#004d43',
  },
  infoBoxText: {
    fontSize: 11,
    color: '#666',
    flex: 1,
    lineHeight: 16,
  },
});