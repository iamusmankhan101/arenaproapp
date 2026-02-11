import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
  Share,
  ActivityIndicator
} from 'react-native';
import { Text, Card, Button, Chip, Avatar, Divider } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { acceptChallenge, joinTournament, deleteChallenge } from '../../store/slices/teamSlice';
import { MaterialIcons } from '@expo/vector-icons';
import { safeDate, safeFormatDate } from '../../utils/dateUtils';
import { challengeService } from '../../services/challengeService';

const { width } = Dimensions.get('window');

export default function ChallengeDetailScreen({ route, navigation }) {
  const { challengeId } = route.params;
  const [challenge, setChallenge] = useState(null);
  const dispatch = useDispatch();
  const { userTeam } = useSelector(state => state.team);
  const { user } = useSelector(state => state.auth);

  // Mock challenge data - in real app, this would come from API

  useEffect(() => {
    const fetchChallengeDetails = async () => {
      if (!challengeId) return;

      try {
        const data = await challengeService.getChallengeById(challengeId);
        if (data) {
          setChallenge(data);
        } else {
          Alert.alert('Error', 'Challenge not found');
          navigation.goBack();
        }
      } catch (error) {
        console.error('Error loading challenge:', error);
        Alert.alert('Error', 'Failed to load challenge details');
      }
    };

    fetchChallengeDetails();
  }, [challengeId]);

  if (!challenge) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#004d43" />
      </View>
    );
  }

  const handleAcceptChallenge = () => {
    if (!userTeam) {
      Alert.alert('Error', 'You must have a team to accept challenges.');
      return;
    }

    Alert.alert(
      'Accept Challenge',
      `Are you sure you want to accept this challenge? ${challenge.isWinnerTakesAll ? 'The loser will pay the entire ground fee.' : 'Ground fee will be split equally.'}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept Challenge',
          onPress: () => {
            dispatch(acceptChallenge({
              challengeId,
              opponentId: userTeam.id,
              opponentTeamName: userTeam.name
            }));
            Alert.alert(
              'Challenge Accepted!',
              `You have accepted the challenge. Please book the venue (${challenge.venue}) to confirm.`,
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
          <Text style={styles.sportLabel}>{challenge.sport?.toUpperCase()}</Text>
        </View>

        {/* Title */}
        <Text style={styles.mainTitle}>{challenge.title}</Text>

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
              {challenge.participants?.length || 0} / {challenge.maxParticipants} Teams Joined
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
              <Text style={styles.teamName} numberOfLines={2}>{challenge.creatorTeam.name}</Text>
              <Text style={styles.teamStat}>{challenge.creatorTeam.wins || 0} Wins</Text>
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
                  let count = 1;
                  if (challenge.sport === 'Padel') {
                    if (challenge.format === '2v2') count = 2;
                    else if (challenge.format === '4v4') count = 4;
                  }
                  const avatarSize = count > 2 ? 40 : 64;
                  const overlap = -(avatarSize / 2.5);

                  const hasOpponent = !!challenge.acceptedTeam;

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
                          challenge.acceptedTeam?.avatar && challenge.acceptedTeam.avatar.length > 2 ? (
                            <Avatar.Image
                              size={avatarSize}
                              source={{ uri: challenge.acceptedTeam.avatar }}
                              style={{ backgroundColor: '#fff3e0' }}
                            />
                          ) : (
                            <Avatar.Text
                              size={avatarSize}
                              label={challenge.acceptedTeam.name?.charAt(0) || 'O'}
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
              {challenge.acceptedTeam ? (
                <>
                  <Text style={styles.teamName} numberOfLines={2}>{challenge.acceptedTeam.name}</Text>
                  <Text style={styles.teamStat}>{challenge.acceptedTeam.wins || 0} Wins</Text>
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
              <MaterialIcons name="calendar-today" size={20} color="#004d43" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Date & Time</Text>
              <Text style={styles.infoValue}>{dateTime.date} • {dateTime.time}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.iconCircle}>
              <MaterialIcons name="location-on" size={20} color="#004d43" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Venue</Text>
              <Text style={styles.infoValue}>{challenge.venue || 'No venue specified'}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.iconCircle}>
              <MaterialIcons name={isTournament ? "emoji-events" : "payments"} size={20} color="#004d43" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>{isTournament ? "Winning Prize" : "Ground Fee"}</Text>
              <Text style={styles.infoValue}>
                PKR {Number(isTournament ? (challenge.winningPrize || 50000) : challenge.maxGroundFee).toLocaleString()}
              </Text>
              <Text style={styles.infoSub}>{isTournament ? 'Total Pool' : (challenge.isWinnerTakesAll ? 'Winner takes all' : 'Split equally')}</Text>
            </View>
          </View>
        </View>

        <Divider style={styles.divider} />

        {/* Specs */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionHeader}>SPECIFICATIONS</Text>
          <View style={styles.specsRow}>
            {challenge.format && <Chip style={styles.specChip} textStyle={{ color: '#004d43' }}>{challenge.format}</Chip>}
            {challenge.overs && <Chip style={styles.specChip} textStyle={{ color: '#004d43' }}>{challenge.overs} Overs</Chip>}
            {challenge.ballType && <Chip style={styles.specChip} textStyle={{ color: '#004d43' }}>{challenge.ballType} Ball</Chip>}
            <Chip style={styles.specChip} textStyle={{ color: '#004d43' }}>{challenge.type === 'private' ? 'Private' : 'Public'}</Chip>
          </View>

          {challenge.description && (
            <View style={styles.noteBox}>
              <Text style={styles.noteText}>{challenge.description}</Text>
            </View>
          )}
        </View>

        {isTournament && (
          <View style={styles.infoSection}>
            <Text style={styles.sectionHeader}>PARTICIPANTS ({challenge.participants?.length || 0}/{challenge.maxParticipants})</Text>
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
                  <Text style={styles.participantName}>{participant.name}</Text>
                  {participant.joinedAt && (
                    <Text style={styles.participantJoined}>Joined {safeFormatDate(participant.joinedAt)}</Text>
                  )}
                </View>
              </View>
            ))}
            {(!challenge.participants || challenge.participants.length === 0) && (
              <Text style={styles.noParticipantsText}>No teams have joined properly yet.</Text>
            )}
          </View>
        )}

      </ScrollView>

      {/* Action Button */}
      {canJoin && (
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
    backgroundColor: '#e8ee26', // Secondary Brand Color
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
    color: '#004d43',
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
    backgroundColor: '#e8ee26', // Secondary Brand Color
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
    backgroundColor: '#e8ee26', // Secondary Brand Color
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
});