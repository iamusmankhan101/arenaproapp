import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { Modal, Portal, Text, TextInput, Button, Card, Chip, Switch, useTheme, Divider } from 'react-native-paper';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';
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

    // New Fields
    minLevel: 'Intermediate', // For Open Challenge
    entryFee: '', // For Tournament
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

    const challengeData = {
      ...formData,
      proposedDateTime: `${formData.proposedDate}T${formData.proposedTime}:00`,
      createdAt: new Date().toISOString(),
      status: 'open',
    };

    onSubmit(challengeData);
    resetForm();
  };

  const resetForm = () => {
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

      minLevel: 'Intermediate',
      entryFee: '',
      tournamentFormat: 'Knockout',
    });
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
            <TextInput
              label="Date"
              value={formData.proposedDate}
              onChangeText={(text) => setFormData({ ...formData, proposedDate: text })}
              placeholder="YYYY-MM-DD"
              style={[styles.input, styles.halfInput]}
              mode="outlined"
              outlineColor="#E0E0E0"
              activeOutlineColor={theme.colors.primary}
              right={<TextInput.Icon icon="calendar" color="#999" />}
            />

            <TextInput
              label="Time"
              value={formData.proposedTime}
              onChangeText={(text) => setFormData({ ...formData, proposedTime: text })}
              placeholder="HH:MM"
              style={[styles.input, styles.halfInput]}
              mode="outlined"
              outlineColor="#E0E0E0"
              activeOutlineColor={theme.colors.primary}
              right={<TextInput.Icon icon="clock-outline" color="#999" />}
            />
          </View>

          {/* Venue and Fee */}
          <TextInput
            label="Preferred Venue (Optional)"
            value={formData.venue}
            onChangeText={(text) => setFormData({ ...formData, venue: text })}
            placeholder="Where do you want to play?"
            style={styles.input}
            mode="outlined"
            outlineColor="#E0E0E0"
            activeOutlineColor={theme.colors.primary}
            left={<TextInput.Icon icon="map-marker" color="#999" />}
          />

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

          {/* Rules and Settings */}
          <Text style={styles.sectionTitle}>Rules & Settings</Text>

          <View style={styles.switchContainer}>
            <View style={styles.switchRow}>
              <View>
                <Text style={styles.switchLabel}>Winner Takes All</Text>
                <Text style={styles.switchDescription}>
                  {formData.isWinnerTakesAll ? 'Loser pays entire ground fee' : 'Split ground fee equally'}
                </Text>
              </View>
              <Switch
                value={formData.isWinnerTakesAll}
                onValueChange={(value) => setFormData({ ...formData, isWinnerTakesAll: value })}
                color={theme.colors.secondary} // Bright lime accent
                trackColor={{ true: theme.colors.primaryLight }}
              />
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
              <TextInput
                label="Format"
                value={formData.format}
                onChangeText={(text) => setFormData({ ...formData, format: text })}
                placeholder="e.g. 8-a-side"
                style={styles.input}
                mode="outlined"
                outlineColor="#E0E0E0"
                activeOutlineColor={theme.colors.primary}
              />
            </View>
          )}

          {formData.sport === 'Football' && (
            <View style={styles.sportSpecificContainer}>
              <Text style={styles.sectionTitle}>Football Specifics</Text>
              <View style={styles.row}>
                <TextInput
                  label="Format"
                  value={formData.format}
                  onChangeText={(text) => setFormData({ ...formData, format: text })}
                  placeholder="e.g. 6v6"
                  style={[styles.input, styles.halfInput]}
                  mode="outlined"
                  outlineColor="#E0E0E0"
                  activeOutlineColor={theme.colors.primary}
                />
                <TextInput
                  label="Duration (mins)"
                  value={formData.duration}
                  onChangeText={(text) => setFormData({ ...formData, duration: text })}
                  placeholder="Minutes"
                  keyboardType="numeric"
                  style={[styles.input, styles.halfInput]}
                  mode="outlined"
                  outlineColor="#E0E0E0"
                  activeOutlineColor={theme.colors.primary}
                />
              </View>
            </View>
          )}

          {formData.sport === 'Padel' && (
            <View style={styles.sportSpecificContainer}>
              <Text style={styles.sectionTitle}>Padel Specifics</Text>

              <Text style={styles.fieldLabel}>Format</Text>
              <View style={styles.chipContainer}>
                {['2v2', '4v4'].map((formatOpt) => {
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
  sectionContainer: {
    marginBottom: 10,
  },
});