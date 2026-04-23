import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Platform, Image } from 'react-native';
import { Modal, Portal, Text, TextInput, Button, Card, Chip, Switch, useTheme, Divider, Menu } from 'react-native-paper';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';
import { useSelector, useDispatch } from 'react-redux';
import { fetchNearbyTurfs } from '../store/slices/turfSlice';
import { theme } from '../theme/theme';

const challengeTypes = [
  {
    id: 'private',
    label: 'Private Match',
    description: 'The "Closed Circle" - Invite friends only',
    icon: 'lock-outline'
  },
  {
    id: 'open',
    label: 'Open Challenge',
    description: 'The "Matchmaking" - Find a rival',
    icon: 'public'
  },
  {
    id: 'tournament',
    label: 'Tournament',
    description: 'The "Competitive Mode" - Leagues & Cups',
    icon: 'emoji-events'
  }
];

const sports = ['Cricket', 'Football', 'Padel'];

export default function CreateChallengeModal({ visible, onDismiss, onSubmit }) {
  console.log('🎨 CreateChallengeModal rendered, visible:', visible);
  
  const dispatch = useDispatch();
  const { nearbyTurfs } = useSelector(state => state.turf);
  
  const [challengeAs, setChallengeAs] = useState('individual'); // 'individual' or 'team'
  const [showVenueMenu, setShowVenueMenu] = useState(false);
  const [customVenue, setCustomVenue] = useState('');
  const [isCustomVenue, setIsCustomVenue] = useState(false);

  // Fetch venues when modal opens
  useEffect(() => {
    if (visible) {
      console.log('🎨 CreateChallengeModal: Modal opened, fetching venues');
      console.log('📍 Current nearbyTurfs count:', nearbyTurfs.length);
      
      if (nearbyTurfs.length === 0) {
        console.log('🔄 Fetching venues...');
        dispatch(fetchNearbyTurfs({
          latitude: 31.5204, // Default Lahore coordinates
          longitude: 74.3587,
          radius: 50000
        }));
      }
    }
  }, [visible, dispatch]);

  // Log when venues are loaded
  useEffect(() => {
    console.log('📊 Venues updated, count:', nearbyTurfs.length);
    if (nearbyTurfs.length > 0) {
      console.log('✅ First venue:', nearbyTurfs[0].name);
    }
  }, [nearbyTurfs]);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'private', // Default to Private as per description
    sport: 'Cricket',
    proposedDate: '',
    proposedTime: '',
    venue: '',
    maxGroundFee: '',
    rules: '',
    isWinnerTakesAll: false,
    maxParticipants: '2',
    inviteTeams: [],
    ballType: '',
    overs: '',
    format: '',
    duration: '',
    currentPlayers: '', // Number of players you currently have
    needPlayers: '', // Number of additional players needed

    // New Fields
    minLevel: 'Intermediate', // For Open Challenge
    entryFee: '', // For Tournament
    winningPrize: '', // For Tournament
    tournamentFormat: 'Knockout', // For Tournament
  });

  // Picker State
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [tempTime, setTempTime] = useState({ hour: '12', minute: '00', period: 'PM' });

  const handleDateSelect = (day) => {
    setFormData({ ...formData, proposedDate: day.dateString });
    setShowDatePicker(false);
  };

  const handleTimeConfirm = () => {
    const timeString = `${tempTime.hour}:${tempTime.minute} ${tempTime.period}`;
    setFormData({ ...formData, proposedTime: timeString });
    setShowTimePicker(false);
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.proposedDate || !formData.proposedTime || !formData.sport) {
      // Logic for validation feedback could be added here
      return;
    }

    // Robust Time Parsing
    let hours = 0, minutes = 0;
    const timeRegex = /(\d{1,2}):(\d{2})\s*(AM|PM)/i;
    const match = formData.proposedTime.match(timeRegex);

    if (match) {
      hours = parseInt(match[1], 10);
      minutes = parseInt(match[2], 10);
      const period = match[3].toUpperCase();

      if (period === 'PM' && hours !== 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;
    } else {
      // Fallback or Alert? Assuming safe default or simple split if 24h
      const [h, m] = formData.proposedTime.split(':');
      hours = parseInt(h || 0, 10);
      minutes = parseInt(m || 0, 10);
    }

    // Ensure two digits
    const hoursStr = hours.toString().padStart(2, '0');
    const minutesStr = minutes.toString().padStart(2, '0');

    // Create safe date string
    const dateTimeStr = `${formData.proposedDate}T${hoursStr}:${minutesStr}:00`;

    const challengeData = {
      ...formData,
      proposedDateTime: dateTimeStr,
      createdAt: new Date().toISOString(),
      status: 'open',
      challengeAs: challengeAs, // Add whether it's individual or team
    };

    onSubmit(challengeData);
    resetForm();
  };

  const resetForm = () => {
    setChallengeAs('individual');
    setShowVenueMenu(false);
    setCustomVenue('');
    setIsCustomVenue(false);
    setFormData({
      title: '',
      description: '',
      type: 'private',
      sport: 'Cricket',
      proposedDate: '',
      proposedTime: '',
      venue: '',
      maxGroundFee: '',
      rules: '',
      isWinnerTakesAll: false,
      maxParticipants: '2',
      inviteTeams: [],
      ballType: '',
      overs: '',
      format: '',
      duration: '',
      currentPlayers: '',
      needPlayers: '',

      minLevel: 'Intermediate',
      entryFee: '',
      winningPrize: '',
      tournamentFormat: 'Knockout',
    });
  };

  const handleVenueSelect = (venue) => {
    console.log('🏟️ Venue selected:', venue.name);
    console.log('💰 Venue price:', venue.pricePerHour || venue.pricing?.basePrice);
    
    // Update venue name
    setFormData({ 
      ...formData, 
      venue: venue.name,
      // Auto-fill ground fee from venue pricing
      maxGroundFee: String(venue.pricePerHour || venue.pricing?.basePrice || '')
    });
    setIsCustomVenue(false);
    setShowVenueMenu(false);
  };

  const handleCustomVenueSelect = () => {
    setIsCustomVenue(true);
    setShowVenueMenu(false);
    setFormData({ ...formData, venue: '' });
  };

  // Get venue image by sport
  const getVenueImageBySport = (venue) => {
    let primarySport = 'Football';
    if (Array.isArray(venue.sports) && venue.sports.length > 0) {
      primarySport = venue.sports[0];
    } else if (typeof venue.sports === 'string' && venue.sports.trim()) {
      primarySport = venue.sports.split(',')[0].trim();
    }

    const sportImages = {
      'Cricket': require('../images/cricket.jpg'),
      'Football': require('../images/football.jpg'),
      'Futsal': require('../images/football.jpg'),
      'Padel': require('../images/padel.jpg'),
    };
    return sportImages[primarySport] || require('../images/football.jpg');
  };

  const renderChallengeType = (type) => {
    const isSelected = formData.type === type.id;
    return (
      <TouchableOpacity
        key={type.id}
        style={[
          styles.typeCard,
          isSelected && styles.selectedTypeCard
        ]}
        onPress={() => setFormData({ ...formData, type: type.id })}
        activeOpacity={0.7}
      >
        <View style={[styles.iconContainer, isSelected && styles.selectedIconContainer]}>
          <MaterialIcons
            name={type.icon}
            size={24}
            color={isSelected ? theme.colors.primary : '#757575'}
          />
        </View>
        <Text style={[
          styles.typeLabel,
          isSelected && styles.selectedTypeLabel
        ]}>
          {type.label}
        </Text>
        <Text style={styles.typeDescription} numberOfLines={2}>
          {type.description}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.modalContent}>
        <View style={styles.header}>
          <Text variant="headlineSmall" style={styles.title}>
            New Challenge
          </Text>
          <TouchableOpacity onPress={onDismiss} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#555" />
          </TouchableOpacity>
        </View>

        <Divider style={styles.divider} />

        <ScrollView style={styles.form} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Challenge As Selection - Individual or Team */}
          <View style={styles.challengeAsContainer}>
            <Text style={styles.sectionTitle}>Create Challenge As</Text>
            <View style={styles.challengeAsToggle}>
              <TouchableOpacity
                style={[
                  styles.challengeAsOption,
                  challengeAs === 'individual' && styles.challengeAsOptionActive
                ]}
                onPress={() => setChallengeAs('individual')}
                activeOpacity={0.7}
              >
                <MaterialIcons
                  name="person"
                  size={24}
                  color={challengeAs === 'individual' ? theme.colors.primary : '#757575'}
                />
                <Text style={[
                  styles.challengeAsText,
                  challengeAs === 'individual' && styles.challengeAsTextActive
                ]}>
                  Individual
                </Text>
                <Text style={styles.challengeAsDescription}>
                  Play as yourself
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.challengeAsOption,
                  challengeAs === 'team' && styles.challengeAsOptionActive
                ]}
                onPress={() => setChallengeAs('team')}
                activeOpacity={0.7}
              >
                <MaterialIcons
                  name="groups"
                  size={24}
                  color={challengeAs === 'team' ? theme.colors.primary : '#757575'}
                />
                <Text style={[
                  styles.challengeAsText,
                  challengeAs === 'team' && styles.challengeAsTextActive
                ]}>
                  Team
                </Text>
                <Text style={styles.challengeAsDescription}>
                  Represent your team
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Challenge Type Selection */}
          <Text style={styles.sectionTitle}>Match Mode</Text>
          <View style={styles.typeContainer}>
            {challengeTypes.map(renderChallengeType)}
          </View>

          {/* Type Specific Info */}
          <View style={styles.infoBox}>
            <MaterialIcons name="info-outline" size={20} color={theme.colors.primary} style={{ marginRight: 8 }} />
            <Text style={styles.infoText}>
              {formData.type === 'private' && "Only people with a unique invite link or private code can see this match."}
              {formData.type === 'open' && "Listed on the global 'Challenge Board'. Opponents can apply to join."}
              {formData.type === 'tournament' && "Structured competition with brackets and leaderboards."}
            </Text>
          </View>

          {/* Open Challenge Specifics */}
          {formData.type === 'open' && (
            <View style={styles.sectionContainer}>
              <Text style={styles.fieldLabel}>Opponent Level</Text>
              <View style={styles.chipContainer}>
                {['Beginner', 'Intermediate', 'Advanced', 'Pro'].map((level) => (
                  <Chip
                    key={level}
                    mode="flat"
                    selected={formData.minLevel === level}
                    onPress={() => setFormData({ ...formData, minLevel: level })}
                    style={[
                      styles.sportChip,
                      formData.minLevel === level && styles.selectedSportChip
                    ]}
                    textStyle={[
                      styles.chipText,
                      formData.minLevel === level && styles.selectedChipText
                    ]}
                    showSelectedOverlay
                  >
                    {level}
                  </Chip>
                ))}
              </View>
            </View>
          )}

          {/* Tournament Specifics */}
          {formData.type === 'tournament' && (
            <View style={styles.sectionContainer}>
              <Text style={styles.fieldLabel}>Tournament Structure</Text>
              <View style={styles.chipContainer}>
                {['Knockout', 'Group Stage', 'Round Robin'].map((tFormat) => (
                  <Chip
                    key={tFormat}
                    mode="flat"
                    selected={formData.tournamentFormat === tFormat}
                    onPress={() => setFormData({ ...formData, tournamentFormat: tFormat })}
                    style={[
                      styles.sportChip,
                      formData.tournamentFormat === tFormat && styles.selectedSportChip
                    ]}
                    textStyle={[
                      styles.chipText,
                      formData.tournamentFormat === tFormat && styles.selectedChipText
                    ]}
                    showSelectedOverlay
                  >
                    {tFormat}
                  </Chip>
                ))}
              </View>

              <TextInput
                label="Entry Fee per Team (PKR)"
                value={formData.entryFee}
                onChangeText={(text) => setFormData({ ...formData, entryFee: text })}
                placeholder="5000"
                keyboardType="numeric"
                style={styles.input}
                mode="outlined"
                outlineColor="#E0E0E0"
                activeOutlineColor={theme.colors.primary}
                left={<TextInput.Affix text="Rs." />}
              />
            </View>
          )}

          {/* Basic Information */}
          <Text style={styles.sectionTitle}>Match Details</Text>

          <TextInput
            label="Challenge Title"
            value={formData.title}
            onChangeText={(text) => setFormData({ ...formData, title: text })}
            placeholder="e.g. Friday Night Showdown"
            style={styles.input}
            mode="outlined"
            outlineColor="#E0E0E0"
            activeOutlineColor={theme.colors.primary}
            contentStyle={styles.inputContent}
          />

          <TextInput
            label="Description"
            value={formData.description}
            onChangeText={(text) => setFormData({ ...formData, description: text })}
            placeholder="Add details about the match..."
            multiline
            numberOfLines={3}
            style={[styles.input, styles.textArea]}
            mode="outlined"
            outlineColor="#E0E0E0"
            activeOutlineColor={theme.colors.primary}
          />

          {/* Sport Selection */}
          <Text style={styles.fieldLabel}>Sport Category</Text>
          <View style={styles.chipContainer}>
            {sports.map((sport) => {
              const isSelected = formData.sport === sport;
              return (
                <Chip
                  key={sport}
                  mode="flat"
                  selected={isSelected}
                  onPress={() => setFormData({ ...formData, sport: sport })}
                  style={[
                    styles.sportChip,
                    isSelected && styles.selectedSportChip
                  ]}
                  textStyle={[
                    styles.chipText,
                    isSelected && styles.selectedChipText
                  ]}
                  showSelectedOverlay
                >
                  {sport}
                </Chip>
              );
            })}
          </View>

          {/* Date and Time */}
          <View style={styles.row}>
            <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.halfInput}>
              <TextInput
                label="Date"
                value={formData.proposedDate}
                editable={false}
                placeholder="YYYY-MM-DD"
                style={styles.input}
                contentStyle={formData.proposedDate ? { fontSize: 13 } : {}}
                mode="outlined"
                outlineColor="#E0E0E0"
                activeOutlineColor={theme.colors.primary}
                right={<TextInput.Icon icon="calendar" color="#999" onPress={() => setShowDatePicker(true)} />}
              />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setShowTimePicker(true)} style={styles.halfInput}>
              <TextInput
                label="Time"
                value={formData.proposedTime}
                editable={false}
                placeholder="HH:MM"
                style={styles.input}
                contentStyle={formData.proposedTime ? { fontSize: 13 } : {}}
                mode="outlined"
                outlineColor="#E0E0E0"
                activeOutlineColor={theme.colors.primary}
                right={<TextInput.Icon icon="clock-outline" color="#999" onPress={() => setShowTimePicker(true)} />}
              />
            </TouchableOpacity>
          </View>

          {/* Date Picker Modal */}
          <Portal>
            <Modal visible={showDatePicker} onDismiss={() => setShowDatePicker(false)} contentContainerStyle={styles.pickerModal}>
              <Calendar
                onDayPress={handleDateSelect}
                markedDates={{
                  [formData.proposedDate]: { selected: true, selectedColor: theme.colors.primary }
                }}
                theme={{
                  todayTextColor: theme.colors.primary,
                  arrowColor: theme.colors.primary,
                  selectedDayBackgroundColor: theme.colors.primary,
                }}
              />
            </Modal>
          </Portal>

          {/* Time Picker Modal */}
          <Portal>
            <Modal visible={showTimePicker} onDismiss={() => setShowTimePicker(false)} contentContainerStyle={styles.pickerModal}>
              <Text style={styles.pickerTitle}>Select Time</Text>
              <View style={styles.timePickerContainer}>

                {/* Hour */}
                <ScrollView style={styles.timeColumn} showsVerticalScrollIndicator={false}>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                    <TouchableOpacity
                      key={h}
                      style={[styles.timeItem, tempTime.hour == h && styles.selectedTimeItem]}
                      onPress={() => setTempTime({ ...tempTime, hour: h.toString() })}
                    >
                      <Text style={[styles.timeText, tempTime.hour == h && styles.selectedTimeText]}>{String(h)}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <Text style={styles.colon}>:</Text>

                {/* Minute */}
                <ScrollView style={styles.timeColumn} showsVerticalScrollIndicator={false}>
                  {['00', '15', '30', '45'].map((m) => (
                    <TouchableOpacity
                      key={m}
                      style={[styles.timeItem, tempTime.minute == m && styles.selectedTimeItem]}
                      onPress={() => setTempTime({ ...tempTime, minute: m })}
                    >
                      <Text style={[styles.timeText, tempTime.minute == m && styles.selectedTimeText]}>{String(m)}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {/* AM/PM */}
                <ScrollView style={styles.timeColumn} showsVerticalScrollIndicator={false}>
                  {['AM', 'PM'].map((p) => (
                    <TouchableOpacity
                      key={p}
                      style={[styles.timeItem, tempTime.period == p && styles.selectedTimeItem]}
                      onPress={() => setTempTime({ ...tempTime, period: p })}
                    >
                      <Text style={[styles.timeText, tempTime.period == p && styles.selectedTimeText]}>{String(p)}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

              </View>
              <Button mode="contained" onPress={handleTimeConfirm} style={styles.confirmButton}>
                Confirm Time
              </Button>
            </Modal>
          </Portal>

          {/* Venue and Fee */}
          <Text style={styles.fieldLabel}>Preferred Venue (Optional)</Text>
          {isCustomVenue ? (
            <View style={styles.customVenueContainer}>
              <TextInput
                label="Enter Venue Name"
                value={formData.venue}
                onChangeText={(text) => setFormData({ ...formData, venue: text })}
                placeholder="Type venue name..."
                style={styles.input}
                mode="outlined"
                outlineColor="#E0E0E0"
                activeOutlineColor={theme.colors.primary}
                left={<TextInput.Icon icon="map-marker" color="#999" />}
              />
              <TouchableOpacity
                style={styles.backToDropdownButton}
                onPress={() => {
                  setIsCustomVenue(false);
                  setFormData({ ...formData, venue: '' });
                }}
              >
                <Text style={styles.backToDropdownText}>← Choose from list</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.venueSelectionContainer}>
              <TouchableOpacity
                style={styles.venueDropdownButton}
                onPress={() => setShowVenueMenu(true)}
              >
                <View style={styles.venueDropdownContent}>
                  <MaterialIcons name="location-on" size={20} color={theme.colors.primary} />
                  <Text style={[
                    styles.venueDropdownText,
                    !formData.venue && styles.venueDropdownPlaceholder
                  ]}>
                    {formData.venue || 'Select a venue'}
                  </Text>
                </View>
                <MaterialIcons name="keyboard-arrow-down" size={24} color="#666" />
              </TouchableOpacity>

              {/* Modern Venue Dropdown Modal */}
              <Portal>
                <Modal
                  visible={showVenueMenu}
                  onDismiss={() => setShowVenueMenu(false)}
                  contentContainerStyle={styles.venueModalContent}
                >
                  <View style={styles.venueModalHeader}>
                    <Text style={styles.venueModalTitle}>Select Venue</Text>
                    <TouchableOpacity onPress={() => setShowVenueMenu(false)}>
                      <Ionicons name="close" size={24} color="#555" />
                    </TouchableOpacity>
                  </View>

                  <ScrollView style={styles.venueListScroll} showsVerticalScrollIndicator={false}>
                    {nearbyTurfs && nearbyTurfs.length > 0 ? (
                      <>
                        {nearbyTurfs.map((venue) => {
                          const imageSource = venue.images?.[0] 
                            ? { uri: venue.images[0] } 
                            : getVenueImageBySport(venue);
                          
                          return (
                            <TouchableOpacity
                              key={venue.id}
                              style={styles.venueListItem}
                              onPress={() => handleVenueSelect(venue)}
                              activeOpacity={0.7}
                            >
                              <Image
                                source={imageSource}
                                style={styles.venueThumbnail}
                                resizeMode="cover"
                              />
                              <View style={styles.venueListItemInfo}>
                                <Text style={styles.venueListItemName} numberOfLines={1}>
                                  {String(venue.name)}
                                </Text>
                                <View style={styles.venueListItemLocation}>
                                  <MaterialIcons name="location-on" size={14} color="#666" />
                                  <Text style={styles.venueListItemLocationText} numberOfLines={1}>
                                    {String(venue.address || `${venue.city || 'Lahore'}, Pakistan`)}
                                  </Text>
                                </View>
                                {venue.sports && (
                                  <View style={styles.venueListItemSports}>
                                    {(Array.isArray(venue.sports) ? venue.sports : String(venue.sports).split(',')).slice(0, 2).map((sport, idx) => (
                                      <View key={idx} style={styles.sportBadge}>
                                        <Text style={styles.sportBadgeText}>{String(sport).trim()}</Text>
                                      </View>
                                    ))}
                                  </View>
                                )}
                              </View>
                              <MaterialIcons name="chevron-right" size={24} color="#CCC" />
                            </TouchableOpacity>
                          );
                        })}
                        
                        <Divider style={styles.venueDivider} />
                      </>
                    ) : (
                      <View style={styles.emptyVenueContainer}>
                        <MaterialIcons name="location-off" size={48} color="#CCC" />
                        <Text style={styles.emptyVenueText}>
                          Loading venues...
                        </Text>
                      </View>
                    )}

                    {/* Custom Venue Option */}
                    <TouchableOpacity
                      style={styles.customVenueOption}
                      onPress={handleCustomVenueSelect}
                      activeOpacity={0.7}
                    >
                      <View style={styles.customVenueIconContainer}>
                        <MaterialIcons name="edit-location" size={24} color={theme.colors.primary} />
                      </View>
                      <View style={styles.customVenueOptionInfo}>
                        <Text style={styles.customVenueOptionTitle}>Enter Custom Venue</Text>
                        <Text style={styles.customVenueOptionSubtitle}>Type your own venue name</Text>
                      </View>
                      <MaterialIcons name="chevron-right" size={24} color={theme.colors.primary} />
                    </TouchableOpacity>
                  </ScrollView>
                </Modal>
              </Portal>
            </View>
          )}

          {formData.type === 'tournament' ? (
            <TextInput
              label="Winning Prize (PKR)"
              value={formData.winningPrize}
              onChangeText={(text) => setFormData({ ...formData, winningPrize: text })}
              placeholder="50000"
              keyboardType="numeric"
              style={styles.input}
              mode="outlined"
              outlineColor="#E0E0E0"
              activeOutlineColor={theme.colors.primary}
              left={<TextInput.Affix text="Rs." />}
            />
          ) : (
            <TextInput
              label="Max Ground Fee (PKR)"
              value={formData.maxGroundFee}
              onChangeText={(text) => setFormData({ ...formData, maxGroundFee: text })}
              placeholder="0"
              keyboardType="numeric"
              style={styles.input}
              mode="outlined"
              outlineColor="#E0E0E0"
              activeOutlineColor={theme.colors.primary}
              left={<TextInput.Affix text="Rs." />}
            />
          )}

          {/* Rules and Settings */}
          <Text style={styles.sectionTitle}>Rules & Settings</Text>

          <View style={styles.switchContainer}>
            <View style={styles.switchRow}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={styles.switchLabel}>Winner Takes All</Text>
                <Text style={styles.switchDescription}>
                  {formData.isWinnerTakesAll ? 'Loser pays entire ground fee' : 'Split ground fee equally'}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setFormData({ ...formData, isWinnerTakesAll: !formData.isWinnerTakesAll })}
                activeOpacity={0.8}
              >
                <MaterialIcons
                  name={formData.isWinnerTakesAll ? 'toggle-on' : 'toggle-off'}
                  size={40}
                  color={formData.isWinnerTakesAll ? theme.colors.secondary : '#CCC'}
                />
              </TouchableOpacity>
            </View>
          </View>

          <TextInput
            label="Special Rules"
            value={formData.rules}
            onChangeText={(text) => setFormData({ ...formData, rules: text })}
            placeholder="Any specific rules..."
            multiline
            numberOfLines={2}
            style={[styles.input, styles.textArea]}
            mode="outlined"
            outlineColor="#E0E0E0"
            activeOutlineColor={theme.colors.primary}
          />

          {formData.type === 'tournament' && (
            <TextInput
              label="Max Participants"
              value={formData.maxParticipants}
              onChangeText={(text) => setFormData({ ...formData, maxParticipants: text })}
              placeholder="e.g. 8 Teams"
              keyboardType="numeric"
              style={styles.input}
              mode="outlined"
              outlineColor="#E0E0E0"
              activeOutlineColor={theme.colors.primary}
            />
          )}

          {/* Sport Specific Fields */}
          {formData.sport === 'Cricket' && (
            <View style={styles.sportSpecificContainer}>
              <Text style={styles.sectionTitle}>Cricket Specifics</Text>
              
              {/* Format Selection */}
              <Text style={styles.fieldLabel}>Format</Text>
              <View style={styles.chipContainer}>
                {['5-a-side', '8-a-side', '11-a-side'].map((formatOpt) => {
                  const isSelected = formData.format === formatOpt;
                  return (
                    <Chip
                      key={formatOpt}
                      mode="flat"
                      selected={isSelected}
                      onPress={() => setFormData({ ...formData, format: formatOpt })}
                      style={[
                        styles.sportChip,
                        isSelected && styles.selectedSportChip
                      ]}
                      textStyle={[
                        styles.chipText,
                        isSelected && styles.selectedChipText
                      ]}
                      showSelectedOverlay
                    >
                      {formatOpt}
                    </Chip>
                  );
                })}
              </View>

              <View style={styles.row}>
                <TextInput
                  label="Ball Type"
                  value={formData.ballType}
                  onChangeText={(text) => setFormData({ ...formData, ballType: text })}
                  placeholder="Type"
                  style={[styles.input, styles.halfInput]}
                  mode="outlined"
                  outlineColor="#E0E0E0"
                  activeOutlineColor={theme.colors.primary}
                />
                <TextInput
                  label="Overs"
                  value={formData.overs}
                  onChangeText={(text) => setFormData({ ...formData, overs: text })}
                  placeholder="Count"
                  keyboardType="numeric"
                  style={[styles.input, styles.halfInput]}
                  mode="outlined"
                  outlineColor="#E0E0E0"
                  activeOutlineColor={theme.colors.primary}
                />
              </View>

              {/* Player Count Section - Only for Individual */}
              {challengeAs === 'individual' && (
                <View style={styles.playerCountSection}>
                  <Text style={styles.fieldLabel}>Team Status</Text>
                  <View style={styles.playerCountRow}>
                    <View style={styles.playerCountInput}>
                      <TextInput
                        label="Players I Have"
                        value={formData.currentPlayers}
                        onChangeText={(text) => setFormData({ ...formData, currentPlayers: text })}
                        placeholder="5"
                        keyboardType="numeric"
                        style={styles.input}
                        mode="outlined"
                        outlineColor="#E0E0E0"
                        activeOutlineColor={theme.colors.primary}
                        dense
                      />
                    </View>
                    <View style={styles.playerCountInput}>
                      <TextInput
                        label="Need Players"
                        value={formData.needPlayers}
                        onChangeText={(text) => setFormData({ ...formData, needPlayers: text })}
                        placeholder="3"
                        keyboardType="numeric"
                        style={styles.input}
                        mode="outlined"
                        outlineColor="#E0E0E0"
                        activeOutlineColor={theme.colors.primary}
                        dense
                      />
                    </View>
                  </View>
                  <Text style={styles.helperText}>
                    Let others know how many players you have and how many more you need
                  </Text>
                </View>
              )}
            </View>
          )}

          {formData.sport === 'Football' && (
            <View style={styles.sportSpecificContainer}>
              <Text style={styles.sectionTitle}>Football Specifics</Text>
              
              {/* Format Selection */}
              <Text style={styles.fieldLabel}>Format</Text>
              <View style={styles.chipContainer}>
                {['5-a-side', '6-a-side', '7-a-side', '11-a-side'].map((formatOpt) => {
                  const isSelected = formData.format === formatOpt;
                  return (
                    <Chip
                      key={formatOpt}
                      mode="flat"
                      selected={isSelected}
                      onPress={() => setFormData({ ...formData, format: formatOpt })}
                      style={[
                        styles.sportChip,
                        isSelected && styles.selectedSportChip
                      ]}
                      textStyle={[
                        styles.chipText,
                        isSelected && styles.selectedChipText
                      ]}
                      showSelectedOverlay
                    >
                      {formatOpt}
                    </Chip>
                  );
                })}
              </View>

              <TextInput
                label="Duration (mins)"
                value={formData.duration}
                onChangeText={(text) => setFormData({ ...formData, duration: text })}
                placeholder="90"
                keyboardType="numeric"
                style={styles.input}
                mode="outlined"
                outlineColor="#E0E0E0"
                activeOutlineColor={theme.colors.primary}
              />

              {/* Player Count Section - Only for Individual */}
              {challengeAs === 'individual' && (
                <View style={styles.playerCountSection}>
                  <Text style={styles.fieldLabel}>Team Status</Text>
                  <View style={styles.playerCountRow}>
                    <View style={styles.playerCountInput}>
                      <TextInput
                        label="Players I Have"
                        value={formData.currentPlayers}
                        onChangeText={(text) => setFormData({ ...formData, currentPlayers: text })}
                        placeholder="4"
                        keyboardType="numeric"
                        style={styles.input}
                        mode="outlined"
                        outlineColor="#E0E0E0"
                        activeOutlineColor={theme.colors.primary}
                        dense
                      />
                    </View>
                    <View style={styles.playerCountInput}>
                      <TextInput
                        label="Need Players"
                        value={formData.needPlayers}
                        onChangeText={(text) => setFormData({ ...formData, needPlayers: text })}
                        placeholder="2"
                        keyboardType="numeric"
                        style={styles.input}
                        mode="outlined"
                        outlineColor="#E0E0E0"
                        activeOutlineColor={theme.colors.primary}
                        dense
                      />
                    </View>
                  </View>
                  <Text style={styles.helperText}>
                    Let others know how many players you have and how many more you need
                  </Text>
                </View>
              )}
            </View>
          )}

          {formData.sport === 'Padel' && (
            <View style={styles.sportSpecificContainer}>
              <Text style={styles.sectionTitle}>Padel Specifics</Text>

              <Text style={styles.fieldLabel}>Format</Text>
              <View style={styles.chipContainer}>
                {['1v1', '2v2'].map((formatOpt) => {
                  const isSelected = formData.format === formatOpt;
                  return (
                    <Chip
                      key={formatOpt}
                      mode="flat"
                      selected={isSelected}
                      onPress={() => setFormData({ ...formData, format: formatOpt })}
                      style={[
                        styles.sportChip,
                        isSelected && styles.selectedSportChip
                      ]}
                      textStyle={[
                        styles.chipText,
                        isSelected && styles.selectedChipText
                      ]}
                      showSelectedOverlay
                    >
                      {formatOpt}
                    </Chip>
                  );
                })}
              </View>

              {/* Player Count Section - Only for Individual */}
              {challengeAs === 'individual' && (
                <View style={styles.playerCountSection}>
                  <Text style={styles.fieldLabel}>Team Status</Text>
                  <View style={styles.playerCountRow}>
                    <View style={styles.playerCountInput}>
                      <TextInput
                        label="Players I Have"
                        value={formData.currentPlayers}
                        onChangeText={(text) => setFormData({ ...formData, currentPlayers: text })}
                        placeholder="1"
                        keyboardType="numeric"
                        style={styles.input}
                        mode="outlined"
                        outlineColor="#E0E0E0"
                        activeOutlineColor={theme.colors.primary}
                        dense
                      />
                    </View>
                    <View style={styles.playerCountInput}>
                      <TextInput
                        label="Need Players"
                        value={formData.needPlayers}
                        onChangeText={(text) => setFormData({ ...formData, needPlayers: text })}
                        placeholder="1"
                        keyboardType="numeric"
                        style={styles.input}
                        mode="outlined"
                        outlineColor="#E0E0E0"
                        activeOutlineColor={theme.colors.primary}
                        dense
                      />
                    </View>
                  </View>
                  <Text style={styles.helperText}>
                    Let others know how many players you have and how many more you need
                  </Text>
                </View>
              )}

              <TextInput
                label="Duration (mins)"
                value={formData.duration}
                onChangeText={(text) => setFormData({ ...formData, duration: text })}
                placeholder="60"
                keyboardType="numeric"
                style={styles.input}
                mode="outlined"
                outlineColor="#E0E0E0"
                activeOutlineColor={theme.colors.primary}
              />
            </View>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <Button
            mode="outlined"
            onPress={onDismiss}
            style={styles.cancelButton}
            textColor="#555"
            contentStyle={{ height: 48 }}
          >
            Cancel
          </Button>
          <Button
            mode="contained"
            onPress={handleSubmit}
            style={styles.submitButton}
            buttonColor={theme.colors.primary}
            contentStyle={{ height: 48 }}
            labelStyle={{ fontWeight: 'bold' }}
          >
            Create Challenge
          </Button>
        </View>
      </Modal>
    </Portal >
  );
}

const styles = StyleSheet.create({
  modalContent: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 16,
    height: '90%',
    maxHeight: 700,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  title: {
    color: theme.colors.primary,
    fontWeight: 'bold',
    fontFamily: 'Montserrat_700Bold',
  },
  closeButton: {
    padding: 4,
  },
  divider: {
    backgroundColor: '#EEEEEE',
  },
  form: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  challengeAsContainer: {
    marginBottom: 20,
  },
  challengeAsToggle: {
    flexDirection: 'row',
    gap: 12,
  },
  challengeAsOption: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    backgroundColor: '#FAFAFA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  challengeAsOptionActive: {
    borderColor: theme.colors.primary,
    backgroundColor: '#e8f5f3',
  },
  challengeAsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#757575',
    marginTop: 8,
    fontFamily: 'Montserrat_600SemiBold',
  },
  challengeAsTextActive: {
    color: theme.colors.primary,
  },
  challengeAsDescription: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
    fontFamily: 'Montserrat_400Regular',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
    marginBottom: 12,
    fontFamily: 'Montserrat_600SemiBold',
  },
  typeContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    justifyContent: 'space-between',
  },
  typeCard: {
    flex: 1,
    padding: 10,
    marginHorizontal: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EEE',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  selectedTypeCard: {
    borderColor: theme.colors.primary,
    backgroundColor: '#F0F7F5', // Light primary tint
    borderWidth: 1.5,
  },
  iconContainer: {
    marginBottom: 6,
    padding: 8,
    borderRadius: 50,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  selectedIconContainer: {
    borderColor: theme.colors.secondary,
    backgroundColor: theme.colors.secondary,
  },
  typeLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#666',
    textAlign: 'center',
    fontFamily: 'Montserrat_600SemiBold',
    marginBottom: 2,
  },
  selectedTypeLabel: {
    color: theme.colors.primary,
  },
  typeDescription: {
    fontSize: 9,
    color: '#999',
    textAlign: 'center',
    fontFamily: 'Montserrat_400Regular',
    lineHeight: 11,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    fontFamily: 'Montserrat_600SemiBold',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  sportChip: {
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#F5F5F5',
    height: 36,
  },
  selectedSportChip: {
    backgroundColor: theme.colors.secondary,
  },
  chipText: {
    color: '#666',
    fontFamily: 'Montserrat_500Medium',
    fontSize: 13,
  },
  selectedChipText: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
  input: {
    marginBottom: 16,
    backgroundColor: 'white',
    fontSize: 14,
  },
  inputContent: {
    fontFamily: 'Montserrat_400Regular',
  },
  textArea: {
    height: 80,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    flex: 0.48,
  },
  switchContainer: {
    marginBottom: 20,
    backgroundColor: '#FAFAFA',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'Montserrat_600SemiBold',
    marginBottom: 2,
  },
  switchDescription: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'Montserrat_400Regular',
  },
  sportSpecificContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    backgroundColor: 'white',
  },
  cancelButton: {
    flex: 1,
    marginRight: 10,
    borderColor: '#DDD',
  },
  submitButton: {
    flex: 2,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#E0F2F1', // Very light teal
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
  },
  infoText: {
    fontSize: 12,
    color: '#004d43',
    flex: 1,
    fontFamily: 'Montserrat_400Regular',
    lineHeight: 18,
  },
  pickerModal: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 12,
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  timePickerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 150,
    marginBottom: 20,
  },
  timeColumn: {
    width: 60,
    marginHorizontal: 5,
  },
  timeItem: {
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  selectedTimeItem: {
    backgroundColor: '#E0F2F1', // Light Primary
  },
  timeText: {
    fontSize: 18,
    color: '#555',
  },
  selectedTimeText: {
    fontWeight: 'bold',
    color: '#004d43',
    fontSize: 20,
  },
  colon: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#333',
    marginHorizontal: 5,
  },
  confirmButton: {
    marginTop: 10,
    backgroundColor: '#004d43',
  },
  playerCountSection: {
    marginTop: 16,
  },
  playerCountRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  playerCountInput: {
    flex: 1,
  },
  helperText: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    fontFamily: 'Montserrat_400Regular',
    fontStyle: 'italic',
  },
  venueSelectionContainer: {
    marginBottom: 16,
  },
  venueDropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 14,
    backgroundColor: 'white',
  },
  venueDropdownContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  venueDropdownText: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'Montserrat_500Medium',
  },
  venueDropdownPlaceholder: {
    color: '#999',
    fontFamily: 'Montserrat_400Regular',
  },
  venueModalContent: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 16,
    maxHeight: '80%',
    overflow: 'hidden',
  },
  venueModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  venueModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'Montserrat_700Bold',
  },
  venueListScroll: {
    maxHeight: 500,
  },
  venueListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  venueThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
  },
  venueListItemInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  venueListItemName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    fontFamily: 'Montserrat_600SemiBold',
    marginBottom: 4,
  },
  venueListItemLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  venueListItemLocationText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'Montserrat_400Regular',
    marginLeft: 2,
    flex: 1,
  },
  venueListItemSports: {
    flexDirection: 'row',
    gap: 6,
  },
  sportBadge: {
    backgroundColor: '#E8F5F3',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  sportBadgeText: {
    fontSize: 10,
    color: theme.colors.primary,
    fontFamily: 'Montserrat_600SemiBold',
  },
  venueDivider: {
    marginVertical: 8,
    backgroundColor: '#E0E0E0',
  },
  emptyVenueContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyVenueText: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'Montserrat_400Regular',
    marginTop: 12,
  },
  customVenueOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8FFFE',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  customVenueIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#E8F5F3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  customVenueOptionInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  customVenueOptionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.primary,
    fontFamily: 'Montserrat_600SemiBold',
    marginBottom: 2,
  },
  customVenueOptionSubtitle: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'Montserrat_400Regular',
  },
  customVenueContainer: {
    marginBottom: 16,
  },
  backToDropdownButton: {
    alignSelf: 'flex-start',
    marginTop: -8,
    marginBottom: 8,
    paddingVertical: 4,
  },
  backToDropdownText: {
    fontSize: 13,
    color: theme.colors.primary,
    fontFamily: 'Montserrat_600SemiBold',
  },
});
