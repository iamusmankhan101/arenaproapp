import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Text, Button, Chip, Avatar } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';

export default function ChallengeCard({ challenge, onAccept, onViewDetails, userTeam }) {
  const isOwnChallenge = userTeam && challenge.teamId === userTeam.id;
  const isAccepted = challenge.status === 'accepted';
  const canAccept = !isOwnChallenge && !isAccepted && challenge.status === 'open';

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return '#229a60';
      case 'accepted': return '#FF9800';
      case 'completed': return '#2196F3';
      case 'cancelled': return '#F44336';
      default: return '#9E9E9E';
    }
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
    switch (sport.toLowerCase()) {
      case 'cricket': return 'sports-cricket';
      case 'football': return 'sports-soccer';
      case 'padel': return 'sports-tennis';
      case 'badminton': return 'sports-tennis';
      default: return 'sports';
    }
  };

  const formatDateTime = (dateTime) => {
    const date = new Date(dateTime);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <TouchableOpacity onPress={onViewDetails} activeOpacity={0.8}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            <View style={styles.teamInfo}>
              <Avatar.Text 
                size={36} 
                label={challenge.teamName?.charAt(0) || 'T'} 
                style={styles.avatar}
              />
              <View style={styles.teamDetails}>
                <View style={styles.titleRow}>
                  <Text variant="titleMedium" style={styles.challengeTitle}>
                    {challenge.title || challenge.message}
                  </Text>
                  <View style={styles.badges}>
                    <MaterialIcons 
                      name={getChallengeTypeIcon(challenge.type)} 
                      size={16} 
                      color="#666" 
                      style={styles.typeIcon}
                    />
                    <MaterialIcons 
                      name={getSportIcon(challenge.sport)} 
                      size={16} 
                      color="#229a60" 
                    />
                  </View>
                </View>
                <Text style={styles.teamName}>by {challenge.teamName}</Text>
                <View style={styles.teamStats}>
                  <Text style={styles.statText}>
                    {challenge.teamWins || 0}W-{challenge.teamLosses || 0}L
                  </Text>
                  <Text style={styles.statText}>
                    ELO: {challenge.teamElo || 1200}
                  </Text>
                  <View style={styles.fairPlayBadge}>
                    <MaterialIcons name="star" size={12} color="#FFD700" />
                    <Text style={styles.fairPlayText}>
                      {(challenge.fairPlayScore || 4).toFixed(1)}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
            
            <Chip 
              style={[styles.statusChip, { backgroundColor: getStatusColor(challenge.status) }]}
              textStyle={{ color: 'white', fontSize: 10 }}
            >
              {challenge.status?.toUpperCase() || 'OPEN'}
            </Chip>
          </View>

          {challenge.description && (
            <Text variant="bodyMedium" style={styles.description}>
              {challenge.description}
            </Text>
          )}

          <View style={styles.details}>
            <View style={styles.detailRow}>
              <MaterialIcons name="event" size={16} color="#666" />
              <Text style={styles.detailText}>
                {formatDateTime(challenge.proposedDateTime)}
              </Text>
            </View>
            
            {challenge.venue && (
              <View style={styles.detailRow}>
                <MaterialIcons name="location-on" size={16} color="#666" />
                <Text style={styles.detailText}>
                  {challenge.venue}
                </Text>
              </View>
            )}
            
            {challenge.maxGroundFee && (
              <View style={styles.detailRow}>
                <MaterialIcons name="monetization-on" size={16} color="#666" />
                <Text style={styles.detailText}>
                  Max Fee: PKR {challenge.maxGroundFee}
                  {challenge.isWinnerTakesAll ? ' (Loser Pays All)' : ' (Split)'}
                </Text>
              </View>
            )}

            {challenge.rules && (
              <View style={styles.detailRow}>
                <MaterialIcons name="rule" size={16} color="#666" />
                <Text style={styles.detailText}>
                  {challenge.rules}
                </Text>
              </View>
            )}
          </View>

          {challenge.acceptedBy && (
            <View style={styles.acceptedInfo}>
              <Text style={styles.acceptedText}>
                ✅ Accepted by: {challenge.acceptedTeamName}
              </Text>
              <Text style={styles.acceptedStats}>
                {challenge.acceptedTeamWins || 0}W-{challenge.acceptedTeamLosses || 0}L • ELO: {challenge.acceptedTeamElo || 1200}
              </Text>
            </View>
          )}

          <View style={styles.footer}>
            <View style={styles.footerLeft}>
              <Text style={styles.timeAgo}>
                {challenge.timeAgo || 'Just now'}
              </Text>
              {challenge.type === 'tournament' && (
                <Chip 
                  icon="emoji-events" 
                  style={styles.tournamentChip}
                  textStyle={styles.tournamentChipText}
                >
                  {challenge.participants || 1}/{challenge.maxParticipants || 8}
                </Chip>
              )}
            </View>
            
            <View style={styles.footerRight}>
              {canAccept && (
                <Button 
                  mode="contained" 
                  onPress={(e) => {
                    e.stopPropagation();
                    onAccept();
                  }}
                  style={styles.acceptButton}
                  buttonColor="#229a60"
                  compact
                >
                  Accept
                </Button>
              )}
              
              {isOwnChallenge && challenge.status === 'open' && (
                <Chip 
                  icon="edit" 
                  style={styles.ownChallengeChip}
                  textStyle={styles.ownChallengeText}
                >
                  Your Challenge
                </Chip>
              )}
            </View>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    elevation: 3,
    borderRadius: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  teamInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  avatar: {
    backgroundColor: '#229a60',
  },
  teamDetails: {
    marginLeft: 10,
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 3,
  },
  challengeTitle: {
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 8,
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 14,
  },
  badges: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeIcon: {
    marginRight: 4,
  },
  teamName: {
    fontSize: 11,
    color: '#666',
    marginBottom: 3,
    fontFamily: 'Montserrat_400Regular',
  },
  teamStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 10,
    color: '#666',
    marginRight: 12,
    fontFamily: 'Montserrat_400Regular',
  },
  fairPlayBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fairPlayText: {
    fontSize: 10,
    color: '#666',
    marginLeft: 2,
    fontFamily: 'Montserrat_400Regular',
  },
  statusChip: {
    height: 24,
  },
  description: {
    color: '#333',
    marginBottom: 10,
    backgroundColor: '#F8F9FA',
    padding: 10,
    borderRadius: 8,
    fontFamily: 'Montserrat_400Regular',
    fontSize: 12,
  },
  details: {
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  detailText: {
    marginLeft: 8,
    color: '#666',
    fontSize: 12,
    flex: 1,
    fontFamily: 'Montserrat_400Regular',
  },
  acceptedInfo: {
    backgroundColor: 'rgba(34, 154, 96, 0.1)',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  acceptedText: {
    fontWeight: 'bold',
    color: '#229a60',
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 12,
  },
  acceptedStats: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
    fontFamily: 'Montserrat_400Regular',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  footerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeAgo: {
    fontSize: 11,
    color: '#999',
    marginRight: 8,
    fontFamily: 'Montserrat_400Regular',
  },
  tournamentChip: {
    backgroundColor: '#FF9800',
    height: 24,
  },
  tournamentChipText: {
    color: 'white',
    fontSize: 9,
  },
  acceptButton: {
    backgroundColor: '#229a60',
  },
  ownChallengeChip: {
    backgroundColor: 'rgba(34, 154, 96, 0.1)',
    height: 24,
  },
  ownChallengeText: {
    color: '#229a60',
    fontSize: 9,
  },
});