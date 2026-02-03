import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Dimensions, 
  Alert,
  Share 
} from 'react-native';
import { Text, Card, Button, Chip, Avatar, Divider } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { acceptChallenge, joinTournament } from '../../store/slices/teamSlice';
import { MaterialIcons } from '@expo/vector-icons';
import { safeDate, safeFormatDate } from '../../utils/dateUtils';

const { width } = Dimensions.get('window');

export default function ChallengeDetailScreen({ route, navigation }) {
  const { challengeId } = route.params;
  const [challenge, setChallenge] = useState(null);
  const dispatch = useDispatch();
  const { userTeam } = useSelector(state => state.auth);

  // Mock challenge data - in real app, this would come from API
  useEffect(() => {
    // Simulate API call
    const mockChallenge = {
      id: challengeId,
      title: 'Friday Night Football Championship',
      description: 'Looking for competitive teams for an epic Friday night showdown! Winner takes all the glory and the ground fee. Bring your A-game because we\'re not holding back. Professional referee will be arranged.',
      type: 'open',
      sport: 'Football',
      status: 'open',
      createdAt: '2026-01-28T10:00:00Z',
      proposedDateTime: '2026-02-01T19:00:00Z',
      venue: 'DHA Sports Complex',
      venueAddress: 'Phase 5, DHA, Lahore',
      maxGroundFee: '2500',
      isWinnerTakesAll: true,
      rules: 'Standard FIFA rules apply. 90 minutes match with 15-minute halftime. Professional referee required. No slide tackles from behind.',
      maxParticipants: 8,
      participants: 3,
      
      // Creator team info
      creatorTeam: {
        id: 1,
        name: 'Thunder FC',
        avatar: 'T',
        wins: 12,
        losses: 3,
        draws: 2,
        eloRating: 1450,
        fairPlayScore: 4.2,
        captain: 'Ahmed Khan',
        founded: '2023',
        homeGround: 'DHA Sports Complex'
      },
      
      // Participants (for tournaments)
      participantTeams: [
        {
          id: 1,
          name: 'Thunder FC',
          avatar: 'T',
          wins: 12,
          losses: 3,
          eloRating: 1450,
          joinedAt: '2026-01-28T10:00:00Z'
        },
        {
          id: 2,
          name: 'Lightning Bolts',
          avatar: 'L',
          wins: 8,
          losses: 5,
          eloRating: 1320,
          joinedAt: '2026-01-28T14:30:00Z'
        },
        {
          id: 3,
          name: 'Storm Riders',
          avatar: 'S',
          wins: 15,
          losses: 2,
          eloRating: 1580,
          joinedAt: '2026-01-28T16:45:00Z'
        }
      ],
      
      // Match history between teams (if applicable)
      matchHistory: [
        {
          date: '2025-12-15',
          opponent: 'Lightning Bolts',
          result: 'W',
          score: '3-1'
        },
        {
          date: '2025-11-20',
          opponent: 'Storm Riders',
          result: 'L',
          score: '1-2'
        }
      ]
    };
    
    setChallenge(mockChallenge);
  }, [challengeId]);

  const handleAcceptChallenge = () => {
    Alert.alert(
      'Accept Challenge',
      `Are you sure you want to accept this challenge? ${challenge.isWinnerTakesAll ? 'The loser will pay the entire ground fee.' : 'Ground fee will be split equally.'}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Accept Challenge', 
          onPress: () => {
            dispatch(acceptChallenge(challengeId));
            Alert.alert('Success', 'Challenge accepted! You will receive booking details soon.');
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

  const isOwnChallenge = userTeam && challenge?.creatorTeam.id === userTeam.id;
  const canJoin = !isOwnChallenge && challenge?.status === 'open';
  const isTournament = challenge?.type === 'tournament';

  if (!challenge) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading challenge details...</Text>
      </View>
    );
  }

  const dateTime = formatDateTime(challenge.proposedDateTime);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Challenge Details</Text>
        <TouchableOpacity 
          style={styles.shareButton}
          onPress={handleShareChallenge}
        >
          <MaterialIcons name="share" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Challenge Info Card */}
        <Card style={styles.challengeCard}>
          <Card.Content>
            <View style={styles.challengeHeader}>
              <View style={styles.challengeTypeContainer}>
                <MaterialIcons 
                  name={getChallengeTypeIcon(challenge.type)} 
                  size={20} 
                  color="#229a60" 
                />
                <Text style={styles.challengeType}>
                  {challenge.type === 'tournament' ? 'Tournament' : 
                   challenge.type === 'private' ? 'Private Match' : 'Open Challenge'}
                </Text>
              </View>
              <Chip 
                style={[styles.statusChip, { backgroundColor: getStatusColor(challenge.status) }]}
                textStyle={{ color: 'white', fontSize: 12 }}
              >
                {challenge.status.toUpperCase()}
              </Chip>
            </View>

            <Text style={styles.challengeTitle}>{challenge.title}</Text>
            
            <View style={styles.sportContainer}>
              <MaterialIcons name={getSportIcon(challenge.sport)} size={24} color="#229a60" />
              <Text style={styles.sportText}>{challenge.sport}</Text>
            </View>

            <Text style={styles.challengeDescription}>{challenge.description}</Text>
          </Card.Content>
        </Card>

        {/* Match Details */}
        <Card style={styles.detailsCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Match Details</Text>
            
            <View style={styles.detailRow}>
              <MaterialIcons name="event" size={20} color="#666" />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Date & Time</Text>
                <Text style={styles.detailValue}>{dateTime.date}</Text>
                <Text style={styles.detailValue}>{dateTime.time}</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <MaterialIcons name="location-on" size={20} color="#666" />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Venue</Text>
                <Text style={styles.detailValue}>{challenge.venue}</Text>
                <Text style={styles.detailSubValue}>{challenge.venueAddress}</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <MaterialIcons name="attach-money" size={20} color="#666" />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Ground Fee</Text>
                <Text style={styles.detailValue}>PKR {challenge.maxGroundFee}</Text>
                <Text style={styles.detailSubValue}>
                  {challenge.isWinnerTakesAll ? 'Winner takes all (Loser pays)' : 'Split equally'}
                </Text>
              </View>
            </View>

            {challenge.rules && (
              <View style={styles.detailRow}>
                <MaterialIcons name="rule" size={20} color="#666" />
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Rules</Text>
                  <Text style={styles.detailValue}>{challenge.rules}</Text>
                </View>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Creator Team Info */}
        <Card style={styles.teamCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Challenge Creator</Text>
            
            <View style={styles.teamHeader}>
              <Avatar.Text 
                size={50} 
                label={challenge.creatorTeam.avatar} 
                style={styles.teamAvatar}
              />
              <View style={styles.teamInfo}>
                <Text style={styles.teamName}>{challenge.creatorTeam.name}</Text>
                <Text style={styles.teamCaptain}>Captain: {challenge.creatorTeam.captain}</Text>
                <View style={styles.teamStats}>
                  <Text style={styles.teamStatText}>
                    {challenge.creatorTeam.wins}W-{challenge.creatorTeam.losses}L-{challenge.creatorTeam.draws}D
                  </Text>
                  <Text style={styles.teamStatText}>ELO: {challenge.creatorTeam.eloRating}</Text>
                  <View style={styles.fairPlayContainer}>
                    <MaterialIcons name="star" size={14} color="#FFD700" />
                    <Text style={styles.fairPlayText}>{challenge.creatorTeam.fairPlayScore}</Text>
                  </View>
                </View>
              </View>
            </View>

            <Divider style={styles.divider} />

            <View style={styles.teamDetails}>
              <View style={styles.teamDetailItem}>
                <Text style={styles.teamDetailLabel}>Founded</Text>
                <Text style={styles.teamDetailValue}>{challenge.creatorTeam.founded}</Text>
              </View>
              <View style={styles.teamDetailItem}>
                <Text style={styles.teamDetailLabel}>Home Ground</Text>
                <Text style={styles.teamDetailValue}>{challenge.creatorTeam.homeGround}</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Tournament Participants (if tournament) */}
        {isTournament && (
          <Card style={styles.participantsCard}>
            <Card.Content>
              <View style={styles.participantsHeader}>
                <Text style={styles.sectionTitle}>Tournament Participants</Text>
                <Chip 
                  style={styles.participantsChip}
                  textStyle={styles.participantsChipText}
                >
                  {challenge.participants}/{challenge.maxParticipants}
                </Chip>
              </View>

              {challenge.participantTeams.map((team, index) => (
                <View key={team.id} style={styles.participantItem}>
                  <Avatar.Text 
                    size={40} 
                    label={team.avatar} 
                    style={styles.participantAvatar}
                  />
                  <View style={styles.participantInfo}>
                    <Text style={styles.participantName}>{team.name}</Text>
                    <Text style={styles.participantStats}>
                      {team.wins}W-{team.losses}L • ELO: {team.eloRating}
                    </Text>
                  </View>
                  <Text style={styles.participantJoinTime}>
                    {safeFormatDate(team.joinedAt, { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    }, 'Unknown Date')}
                  </Text>
                </View>
              ))}

              {challenge.participants < challenge.maxParticipants && (
                <View style={styles.availableSlots}>
                  <Text style={styles.availableSlotsText}>
                    {challenge.maxParticipants - challenge.participants} slots remaining
                  </Text>
                </View>
              )}
            </Card.Content>
          </Card>
        )}

        {/* Match History (if available) */}
        {challenge.matchHistory && challenge.matchHistory.length > 0 && (
          <Card style={styles.historyCard}>
            <Card.Content>
              <Text style={styles.sectionTitle}>Recent Match History</Text>
              
              {challenge.matchHistory.map((match, index) => (
                <View key={index} style={styles.historyItem}>
                  <View style={styles.historyDate}>
                    <Text style={styles.historyDateText}>
                      {safeFormatDate(match.date, { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      }, 'Unknown Date')}
                    </Text>
                  </View>
                  <View style={styles.historyMatch}>
                    <Text style={styles.historyOpponent}>vs {match.opponent}</Text>
                    <View style={styles.historyResult}>
                      <Text style={[
                        styles.historyResultText,
                        { color: match.result === 'W' ? '#229a60' : 
                                 match.result === 'L' ? '#F44336' : '#FF9800' }
                      ]}>
                        {match.result === 'W' ? 'Won' : match.result === 'L' ? 'Lost' : 'Draw'}
                      </Text>
                      <Text style={styles.historyScore}>{match.score}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </Card.Content>
          </Card>
        )}
      </ScrollView>

      {/* Bottom Action Buttons */}
      {canJoin && (
        <View style={styles.bottomActions}>
          {isTournament ? (
            <Button
              mode="contained"
              onPress={handleJoinTournament}
              style={styles.joinButton}
              buttonColor="#229a60"
              contentStyle={styles.buttonContent}
            >
              Join Tournament
            </Button>
          ) : (
            <Button
              mode="contained"
              onPress={handleAcceptChallenge}
              style={styles.acceptButton}
              buttonColor="#229a60"
              contentStyle={styles.buttonContent}
            >
              Accept Challenge
            </Button>
          )}
        </View>
      )}

      {isOwnChallenge && (
        <View style={styles.bottomActions}>
          <Button
            mode="outlined"
            onPress={() => Alert.alert('Info', 'Edit challenge feature coming soon!')}
            style={styles.editButton}
            textColor="#229a60"
          >
            Edit Challenge
          </Button>
          <Button
            mode="contained"
            onPress={() => Alert.alert('Info', 'Manage participants feature coming soon!')}
            style={styles.manageButton}
            buttonColor="#229a60"
          >
            Manage
          </Button>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
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
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    backgroundColor: '#229a60',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    fontFamily: 'Montserrat_600SemiBold',
  },
  shareButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  challengeCard: {
    marginBottom: 15,
    elevation: 3,
    borderRadius: 12,
  },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  challengeTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  challengeType: {
    fontSize: 14,
    color: '#229a60',
    marginLeft: 8,
    fontFamily: 'Montserrat_600SemiBold',
  },
  statusChip: {
    height: 28,
  },
  challengeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    fontFamily: 'Montserrat_700Bold',
  },
  sportContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  sportText: {
    fontSize: 16,
    color: '#229a60',
    marginLeft: 8,
    fontFamily: 'Montserrat_600SemiBold',
  },
  challengeDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
    fontFamily: 'Montserrat_400Regular',
  },
  detailsCard: {
    marginBottom: 15,
    elevation: 3,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    fontFamily: 'Montserrat_600SemiBold',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  detailContent: {
    marginLeft: 15,
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
    fontFamily: 'Montserrat_500Medium',
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'Montserrat_600SemiBold',
  },
  detailSubValue: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
    fontFamily: 'Montserrat_400Regular',
  },
  teamCard: {
    marginBottom: 15,
    elevation: 3,
    borderRadius: 12,
  },
  teamHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  teamAvatar: {
    backgroundColor: '#229a60',
  },
  teamInfo: {
    marginLeft: 15,
    flex: 1,
  },
  teamName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'Montserrat_700Bold',
  },
  teamCaptain: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
    fontFamily: 'Montserrat_400Regular',
  },
  teamStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  teamStatText: {
    fontSize: 12,
    color: '#666',
    marginRight: 15,
    fontFamily: 'Montserrat_500Medium',
  },
  fairPlayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fairPlayText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
    fontFamily: 'Montserrat_500Medium',
  },
  divider: {
    marginVertical: 15,
  },
  teamDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  teamDetailItem: {
    flex: 1,
  },
  teamDetailLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
    fontFamily: 'Montserrat_500Medium',
  },
  teamDetailValue: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'Montserrat_600SemiBold',
  },
  participantsCard: {
    marginBottom: 15,
    elevation: 3,
    borderRadius: 12,
  },
  participantsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  participantsChip: {
    backgroundColor: '#FF9800',
  },
  participantsChipText: {
    color: 'white',
    fontSize: 12,
  },
  participantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  participantAvatar: {
    backgroundColor: '#229a60',
  },
  participantInfo: {
    marginLeft: 12,
    flex: 1,
  },
  participantName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'Montserrat_600SemiBold',
  },
  participantStats: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
    fontFamily: 'Montserrat_400Regular',
  },
  participantJoinTime: {
    fontSize: 11,
    color: '#999',
    fontFamily: 'Montserrat_400Regular',
  },
  availableSlots: {
    alignItems: 'center',
    paddingVertical: 15,
  },
  availableSlotsText: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Montserrat_500Medium',
  },
  historyCard: {
    marginBottom: 15,
    elevation: 3,
    borderRadius: 12,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 8,
  },
  historyDate: {
    width: 80,
  },
  historyDateText: {
    fontSize: 11,
    color: '#999',
    fontFamily: 'Montserrat_400Regular',
  },
  historyMatch: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyOpponent: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'Montserrat_500Medium',
  },
  historyResult: {
    alignItems: 'flex-end',
  },
  historyResultText: {
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'Montserrat_600SemiBold',
  },
  historyScore: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
    fontFamily: 'Montserrat_400Regular',
  },
  bottomActions: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    gap: 10,
  },
  joinButton: {
    flex: 1,
    borderRadius: 12,
  },
  acceptButton: {
    flex: 1,
    borderRadius: 12,
  },
  editButton: {
    flex: 1,
    borderRadius: 12,
    borderColor: '#229a60',
  },
  manageButton: {
    flex: 1,
    borderRadius: 12,
  },
  buttonContent: {
    paddingVertical: 8,
  },
});