import React from 'react';
import { View, StyleSheet, TouchableOpacity, Share } from 'react-native';
import { Card, Text, Button, Chip, Avatar } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';

export default function ChallengeCard({ challenge, onAccept, onViewDetails, onDelete, userTeam, currentUserId }) {
  const [normalizedChallenge, setNormalizedChallenge] = React.useState(challenge);

  // Normalize challenge data on mount and when challenge changes
  React.useEffect(() => {
    const normalizeChallenge = async () => {
      if (!challenge) {
        setNormalizedChallenge(null);
        return;
      }

      // If challenge is accepted but acceptedUser is missing, try to fetch user data
      if (actualChallenge.status === 'accepted' && !actualChallenge.acceptedUser && actualChallenge.opponentId) {
        console.log('🔧 ChallengeCard: Legacy challenge detected, fetching opponent user data...');
        try {
          const { doc, getDoc } = require('firebase/firestore');
          const { db } = require('../config/firebase');
          
          const userDoc = await getDoc(doc(db, 'users', actualChallenge.opponentId));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setNormalizedChallenge({
              ...challenge,
              acceptedUser: {
                id: actualChallenge.opponentId,
                name: userData.displayName || userData.fullName || userData.email || actualChallenge.opponentName || 'Opponent',
                photoURL: userData.photoURL || userData.photoUrl || null,
              }
            });
            console.log('✅ ChallengeCard: Fetched opponent data');
            return;
          }
        } catch (fetchError) {
          console.error('❌ ChallengeCard: Error fetching opponent user data:', fetchError);
        }
        
        // Fallback to basic data
        setNormalizedChallenge({
          ...challenge,
          acceptedUser: {
            id: actualChallenge.opponentId,
            name: actualChallenge.opponentName || 'Opponent',
            photoURL: null,
          }
        });
      } else {
        setNormalizedChallenge(challenge);
      }
    };

    normalizeChallenge();
  }, [challenge]);

  if (!normalizedChallenge) return null;

  // Use normalizedChallenge instead of challenge for all logic below
  const actualChallenge = normalizedChallenge;

  const isOwnChallenge = React.useMemo(() => {
    if (!actualChallenge) return false;
    const normalizedCreatorId = String(actualChallenge.creatorTeam?.id || actualChallenge.challengerId || '').toLowerCase();
    const normalizedUserId = String(currentUserId || '').toLowerCase();
    const normalizedTeamId = String(userTeam?.id || '').toLowerCase();

    return (normalizedUserId && normalizedCreatorId === normalizedUserId) ||
      (normalizedTeamId && normalizedCreatorId === normalizedTeamId) ||
      (normalizedUserId && String(actualChallenge.challengerId).toLowerCase() === normalizedUserId);
  }, [actualChallenge, currentUserId, userTeam]);

  const isAccepted = actualChallenge.status === 'accepted';
  const canAccept = !isOwnChallenge && !isAccepted && actualChallenge.status === 'open';

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return '#e8ee26'; // Lime Green (Brand Secondary)
      case 'accepted': return '#e8ee26'; // Lime Green (Brand Secondary) - Matched
      case 'completed': return '#2196F3'; // Blue
      case 'cancelled': return '#F44336'; // Red
      default: return '#9E9E9E'; // Grey
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
    switch (sport?.toLowerCase()) {
      case 'cricket': return 'sports-cricket';
      case 'football': return 'sports-soccer';
      case 'padel': return 'sports-tennis';
      case 'badminton': return 'sports-tennis';
      default: return 'sports';
    }
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return 'TBD';
    const date = new Date(dateTime);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };



  const handleShare = async () => {
    try {
      const result = await Share.share({
        title: 'Arena Pro Challenge',
        message: `Join my match on Arena Pro! \n\nChallenge: ${actualChallenge.title} vs ${actualChallenge.teamName}\nType: ${actualChallenge.type.toUpperCase()}\nVenue: ${actualChallenge.venue || 'TBD'}\n\nCheck it out here: https://arenapro.pk/challenge/${actualChallenge.id}`,
        url: `https://arenapro.pk/challenge/${actualChallenge.id}`
      });
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleDelete = () => {
    // If onDelete prop is provided, use it.
    if (onDelete) {
      onDelete();
    }
  };

  return (
    <TouchableOpacity onPress={onViewDetails} activeOpacity={0.9}>
      <Card style={styles.card}>
        {/* Brand Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <MaterialIcons name={getSportIcon(actualChallenge.sport)} size={18} color="#e8ee26" style={styles.sportIcon} />
            <Text numberOfLines={1} style={styles.challengeTitle}>
              {actualChallenge.title || 'Challenge Match'}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(actualChallenge.status) }]}>
            <Text style={[styles.statusText, { color: (actualChallenge.status === 'open' || actualChallenge.status === 'accepted') ? '#004d43' : '#fff' }]}>
              {actualChallenge.status?.toUpperCase() || 'OPEN'}
            </Text>
          </View>
        </View>

        <Card.Content style={styles.content}>
          {/* Teams Section */}
          <View style={styles.teamsContainer}>
            {/* Challenger Team */}
            <View style={styles.teamBlock}>
              <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 8 }}>
                {(() => {
                  let count = 1;
                  if (actualChallenge.sport === 'Padel') {
                    if (actualChallenge.format === '2v2') count = 2;
                    else if (actualChallenge.format === '4v4') count = 4;
                  }

                  const avatarSize = count > 2 ? 32 : 44; // Smaller for 4v4
                  const overlap = -(avatarSize / 2.5);

                  return Array.from({ length: Math.max(1, count || 1) }).map((_, index) => {
                    const isCaptain = index === 0;
                    return (
                      <View key={`challenger-${index}`} style={{
                        marginLeft: index === 0 ? 0 : overlap,
                        zIndex: count - index,
                        elevation: count - index,
                        borderRadius: avatarSize,
                        borderWidth: 2,
                        borderColor: '#fff'
                      }}>
                        {isCaptain && actualChallenge.creatorTeam?.avatar && actualChallenge.creatorTeam.avatar.length > 2 ? (
                          <Avatar.Image
                            size={avatarSize}
                            source={{ uri: actualChallenge.creatorTeam.avatar }}
                            style={{ backgroundColor: '#e8f5f3' }}
                          />
                        ) : (
                          <Avatar.Text
                            size={avatarSize}
                            label={isCaptain ? ((actualChallenge.teamName || actualChallenge.creatorTeam?.name)?.charAt(0) || 'T') : '+'}
                            style={{ backgroundColor: isCaptain ? '#e8f5f3' : '#f0f0f0' }}
                            color={isCaptain ? '#004d43' : '#999'}
                            labelStyle={{ fontWeight: 'bold' }}
                          />
                        )}
                      </View>
                    );
                  });
                })()}
              </View>

              <Text numberOfLines={1} style={styles.teamName}>{String(actualChallenge.teamName || 'Team')}</Text>
              <View style={styles.statBadge}>
                <MaterialIcons name="emoji-events" size={12} color="#fbc02d" />
                <Text style={styles.statText}>{String((actualChallenge.teamWins || 0) + ' Wins')}</Text>
              </View>
            </View>

            {/* VS Indicator */}
            <View style={styles.vsContainer}>
              <Text style={styles.vsText}>
                {actualChallenge.type === 'tournament' ? '' :
                  actualChallenge.sport === 'Padel' && actualChallenge.format ? actualChallenge.format : 'VS'}
              </Text>
            </View>

            {/* Opponent Team or Tournament Info */}
            <View style={styles.teamBlock}>
              {actualChallenge.type === 'tournament' ? (
                actualChallenge.participants && actualChallenge.participants.length > 0 ? (
                  <>
                    <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 6 }}>
                      {actualChallenge.participants.slice(0, 3).map((p, i) => (
                        <View key={i} style={{
                          marginLeft: i === 0 ? 0 : -12,
                          zIndex: 3 - i,
                          borderRadius: 16,
                          borderWidth: 2,
                          borderColor: '#fff'
                        }}>
                          {p.avatar ? (
                            <Avatar.Image size={32} source={{ uri: p.avatar }} />
                          ) : (
                            <Avatar.Text size={32} label={p.name?.charAt(0) || 'T'} style={{ backgroundColor: '#fff3e0' }} color="#e65100" />
                          )}
                        </View>
                      ))}
                    </View>
                    <Text style={styles.teamName}>{String(actualChallenge.participants.length)} Joined</Text>
                    <Text style={styles.waitingTeamName}>{String(actualChallenge.maxParticipants ? actualChallenge.maxParticipants + ' Spots' : 'Open')}</Text>
                  </>
                ) : (
                  <>
                    <View style={[styles.avatar, { backgroundColor: '#fff3e0', borderColor: '#ffb74d' }]}>
                      <MaterialIcons name="emoji-events" size={24} color="#f57c00" />
                    </View>
                    <Text style={styles.teamName}>Tournament</Text>
                    <Text style={styles.waitingTeamName}>Open Entry</Text>
                  </>
                )
              ) : (actualChallenge.acceptedUser || actualChallenge.acceptedBy || actualChallenge.acceptedTeam || actualChallenge.status === 'accepted') ? (
                <>
                  <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 8 }}>
                    {(() => {
                      let count = 1;
                      if (actualChallenge.sport === 'Padel') {
                        if (actualChallenge.format === '2v2') count = 2;
                        else if (actualChallenge.format === '4v4') count = 4;
                      }

                      const avatarSize = count > 2 ? 32 : 44;
                      const overlap = -(avatarSize / 2.5);

                      return Array.from({ length: count }).map((_, index) => {
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
                            {isCaptain && (actualChallenge.acceptedUser?.photoURL || actualChallenge.acceptedTeam?.avatar || actualChallenge.acceptedTeamAvatar) ? (
                              <Avatar.Image
                                size={avatarSize}
                                source={{ uri: actualChallenge.acceptedUser?.photoURL || actualChallenge.acceptedTeam?.avatar || actualChallenge.acceptedTeamAvatar }}
                                style={{ backgroundColor: '#fff3e0' }}
                              />
                            ) : (
                              <Avatar.Text
                                size={avatarSize}
                                label={isCaptain ? ((actualChallenge.acceptedUser?.name || actualChallenge.acceptedTeam?.name || actualChallenge.acceptedTeamName || actualChallenge.opponentName || actualChallenge.opponentTeamName)?.charAt(0) || 'O') : '+'}
                                style={{ backgroundColor: isCaptain ? '#fff3e0' : '#f0f0f0' }}
                                color={isCaptain ? '#e65100' : '#999'}
                                labelStyle={{ fontWeight: 'bold' }}
                              />
                            )}
                          </View>
                        );
                      });
                    })()}
                  </View>
                  <Text numberOfLines={1} style={styles.teamName}>{String(actualChallenge.acceptedUser?.name || actualChallenge.acceptedTeam?.name || actualChallenge.acceptedTeamName || actualChallenge.opponentName || actualChallenge.opponentTeamName || 'Opponent')}</Text>
                  <View style={styles.statBadge}>
                    <MaterialIcons name="emoji-events" size={12} color="#fbc02d" />
                    <Text style={styles.statText}>{String((actualChallenge.acceptedTeam?.wins || actualChallenge.acceptedTeamWins || 0) + ' Wins')}</Text>
                  </View>
                </>
              ) : (
                <>
                  <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 8 }}>
                    {(() => {
                      let count = 1;
                      if (actualChallenge.sport === 'Padel') {
                        if (actualChallenge.format === '2v2') count = 2;
                        else if (actualChallenge.format === '4v4') count = 4;
                      }

                      const avatarSize = count > 2 ? 32 : 44;
                      const overlap = -(avatarSize / 2.5);

                      return Array.from({ length: count }).map((_, index) => (
                        <View key={`empty-${index}`} style={{
                          marginLeft: index === 0 ? 0 : overlap,
                          zIndex: count - index,
                          elevation: count - index,
                          borderRadius: avatarSize,
                          borderWidth: 2,
                          borderColor: '#fff'
                        }}>
                          <View style={[styles.emptyAvatar, { width: avatarSize, height: avatarSize, marginBottom: 0 }]}>
                            <MaterialIcons name="person-add" size={avatarSize * 0.4} color="#004d43" style={{ opacity: 0.5 }} />
                          </View>
                        </View>
                      ));
                    })()}
                  </View>
                  <Text style={styles.waitingTeamName}>Opponent</Text>
                </>
              )}
            </View>
          </View>

          {/* Description Snippet (optional) */}
          {!!actualChallenge.description && (
            <Text numberOfLines={2} style={styles.description}>
              "{actualChallenge.description}"
            </Text>
          )}

          {/* Details Section */}
          <View style={styles.detailsContainer}>
            {/* Row 1: Date & Time */}
            <View style={styles.detailRow}>
              <MaterialIcons name="event" size={16} color="#004d43" style={styles.detailIcon} />
              <Text style={styles.detailText}>{String(formatDateTime(actualChallenge.proposedDateTime))}</Text>
            </View>

            {/* Row 2: Venue */}
            <View style={styles.detailRow}>
              <MaterialIcons name="place" size={16} color="#004d43" style={styles.detailIcon} />
              <Text numberOfLines={1} style={styles.detailText}>{String(actualChallenge.venue || 'Any Venue')}</Text>
            </View>

            {/* Row 3: Fee & Type */}
            {/* Row 3: Fee/Prize & Entry Fee */}
            <View style={styles.detailRowDual}>
              <View style={styles.detailItemHalf}>
                {actualChallenge.winningPrize ? (
                  <>
                    <MaterialIcons name="emoji-events" size={16} color="#fbc02d" style={styles.detailIcon} />
                    <Text style={styles.detailText}>
                      Prize: {Number(actualChallenge.winningPrize).toLocaleString()}
                    </Text>
                  </>
                ) : actualChallenge.maxGroundFee ? (
                  <>
                    <MaterialIcons name="payments" size={16} color="#004d43" style={styles.detailIcon} />
                    <Text style={styles.detailText}>
                      PKR {Number(actualChallenge.maxGroundFee).toLocaleString()}
                    </Text>
                  </>
                ) : null}
              </View>

              <View style={styles.detailItemHalf}>
                {actualChallenge.type === 'tournament' && actualChallenge.entryFee ? (
                  <>
                    <MaterialIcons name="attach-money" size={16} color="#004d43" style={styles.detailIcon} />
                    <Text style={styles.detailText}>Entry: {Number(actualChallenge.entryFee).toLocaleString()}</Text>
                  </>
                ) : (
                  <>
                    <MaterialIcons name={getChallengeTypeIcon(actualChallenge.type)} size={16} color="#004d43" style={styles.detailIcon} />
                    <Text style={styles.detailText}>
                      {actualChallenge.type === 'open' ? 'Public' : actualChallenge.type === 'private' ? 'Private' : 'Tournament'}
                    </Text>
                  </>
                )}
              </View>
            </View>

            {/* Row 4: Tournament Participants */}
            {actualChallenge.type === 'tournament' && !!actualChallenge.maxParticipants && (
              <View style={[styles.detailRow, { marginTop: 4 }]}>
                <MaterialIcons name="groups" size={16} color="#004d43" style={styles.detailIcon} />
                <Text style={styles.detailText}>{String(actualChallenge.maxParticipants + ' Teams Participating')}</Text>
              </View>
            )}
          </View>

          {/* Tags */}
          {(!!actualChallenge.format || !!actualChallenge.overs || !!actualChallenge.ballType || !!actualChallenge.tournamentFormat) && (
            <View style={styles.chipContainer}>
              {!!actualChallenge.format && <Chip style={styles.specChip} textStyle={styles.specText}>{String(actualChallenge.format)}</Chip>}
              {!!actualChallenge.tournamentFormat && <Chip style={styles.specChip} textStyle={styles.specText}>{String(actualChallenge.tournamentFormat)}</Chip>}
              {!!actualChallenge.overs && <Chip style={styles.specChip} textStyle={styles.specText}>{String(actualChallenge.overs)} Overs</Chip>}
              {!!actualChallenge.ballType && <Chip style={styles.specChip} textStyle={styles.specText}>{String(actualChallenge.ballType)}</Chip>}
            </View>
          )}

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.timeAgo}>{String(actualChallenge.timeAgo || 'Just now')}</Text>

            <View style={styles.actionsRight}>
              {actualChallenge.type === 'private' && (
                <Button
                  mode="outlined"
                  onPress={handleShare}
                  style={{ marginRight: 6, borderColor: '#004d43', borderRadius: 8 }}
                  icon={({ size, color }) => (
                    <MaterialIcons name="share" size={size} color={color} />
                  )}
                  textColor="#004d43"
                  labelStyle={{ fontSize: 11, fontWeight: '600', marginVertical: 0 }}
                  contentStyle={{ height: 32, paddingHorizontal: 8, gap: 8 }}
                >
                  Invite
                </Button>
              )}

              {canAccept ? (
                <Button
                  mode="contained"
                  onPress={(e) => { e.stopPropagation(); onAccept(); }}
                  style={styles.acceptButton}
                  labelStyle={{ fontSize: 11, fontWeight: 'bold', marginVertical: 0, marginHorizontal: 8 }}
                  contentStyle={{ height: 32, paddingHorizontal: 4 }}
                >
                  Accept Match
                </Button>
              ) : isOwnChallenge ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Button
                    mode="outlined"
                    onPress={handleDelete}
                    style={{ borderColor: '#F44336', borderRadius: 8 }}
                    contentStyle={{ height: 32, paddingHorizontal: 0 }}
                    labelStyle={{ fontSize: 11, fontWeight: 'bold', marginVertical: 0, marginHorizontal: 8, color: '#F44336' }}
                    compact
                  >
                    Delete
                  </Button>
                  <View style={[styles.ownBadge]}>
                    <Text style={styles.ownBadgeText}>YOUR TEAM</Text>
                  </View>
                </View>
              ) : (
                <Button mode="text" compact disabled textColor="#999">
                  {actualChallenge.status === 'accepted' ? 'Match Set' : 'View Details'}
                </Button>
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
    marginBottom: 16,
    borderRadius: 16,
    backgroundColor: '#fff',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#004d43', // Brand Primary
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sportIcon: {
    marginRight: 8,
  },
  challengeTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
    fontFamily: 'Montserrat_700Bold',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    fontFamily: 'Montserrat_700Bold',
    textTransform: 'uppercase',
  },
  content: {
    padding: 16,
  },
  teamsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  teamBlock: {
    alignItems: 'center',
    flex: 1,
    maxWidth: '35%',
  },
  avatar: {
    marginBottom: 8,
    elevation: 3,
    borderWidth: 2,
    borderColor: '#fff',
  },
  emptyAvatar: {
    backgroundColor: '#f5f5f5',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
    marginBottom: 8,
  },
  teamName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    fontFamily: 'Montserrat_600SemiBold',
    marginBottom: 4,
  },
  waitingTeamName: {
    fontSize: 12,
    color: '#bdbdbd',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#004d43',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 4,
  },
  statText: {
    fontSize: 10,
    color: '#e8ee26',
    fontWeight: '600',
  },
  vsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  vsText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#004d43', // Brand Primary
    fontFamily: 'Montserrat_700Bold',
    opacity: 0.2,
  },
  detailsContainer: {
    marginBottom: 16,
    backgroundColor: '#fafafa',
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  detailRowDual: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  detailItemHalf: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  detailIcon: {
    marginRight: 8,
    width: 20, // Check alignment
    textAlign: 'center',
  },
  detailText: {
    fontSize: 12,
    color: '#333',
    fontFamily: 'Montserrat_500Medium',
    flex: 1,
  },
  description: {
    fontSize: 13,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 16,
    fontFamily: 'Montserrat_400Regular',
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#e8ee26', // Brand Secondary
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  specChip: {
    backgroundColor: '#004d43', // Brand primary
    borderColor: '#004d43',
    marginRight: 4,
    height: 28,
  },
  specText: {
    fontSize: 10,
    color: '#e8ee26',
    fontWeight: '600',
    lineHeight: 14,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  timeAgo: {
    fontSize: 11,
    color: '#999',
    fontFamily: 'Montserrat_400Regular',
  },
  acceptButton: {
    backgroundColor: '#004d43', // Brand Primary
    borderRadius: 8,
  },
  ownBadge: {
    backgroundColor: '#e8ee26', // Brand Secondary
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  ownBadgeText: {
    color: '#004d43',
    fontSize: 11,
    fontWeight: '700',
    fontFamily: 'Montserrat_700Bold',
  },
  actionsRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
