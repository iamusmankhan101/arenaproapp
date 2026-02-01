import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Modal, Portal, Text, TextInput, Button, Card, Chip, Switch } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';

const challengeTypes = [
  { id: 'open', label: 'Open Challenge', description: 'Anyone can accept', icon: 'public' },
  { id: 'private', label: 'Private Match', description: 'Invite specific teams', icon: 'lock' },
  { id: 'tournament', label: 'Tournament', description: 'Multi-team competition', icon: 'emoji-events' }
];

const sports = ['Cricket', 'Football', 'Padel', 'Badminton'];

export default function CreateChallengeModal({ visible, onDismiss, onSubmit }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'open',
    sport: 'Cricket',
    proposedDate: '',
    proposedTime: '',
    venue: '',
    maxGroundFee: '',
    rules: '',
    isWinnerTakesAll: false,
    maxParticipants: '2',
    inviteTeams: [],
  });

  const handleSubmit = () => {
    if (!formData.title || !formData.proposedDate || !formData.proposedTime || !formData.sport) {
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
      type: 'open',
      sport: 'Cricket',
      proposedDate: '',
      proposedTime: '',
      venue: '',
      maxGroundFee: '',
      rules: '',
      isWinnerTakesAll: false,
      maxParticipants: '2',
      inviteTeams: [],
    });
  };

  const renderChallengeType = (type) => (
    <TouchableOpacity
      key={type.id}
      style={[
        styles.typeCard,
        formData.type === type.id && styles.selectedTypeCard
      ]}
      onPress={() => setFormData({...formData, type: type.id})}
    >
      <MaterialIcons 
        name={type.icon} 
        size={24} 
        color={formData.type === type.id ? '#229a60' : '#666'} 
      />
      <Text style={[
        styles.typeLabel,
        formData.type === type.id && styles.selectedTypeLabel
      ]}>
        {type.label}
      </Text>
      <Text style={styles.typeDescription}>{type.description}</Text>
    </TouchableOpacity>
  );

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.modal}>
        <Card>
          <Card.Content>
            <Text variant="headlineSmall" style={styles.title}>
              Create Match Challenge
            </Text>
            
            <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
              {/* Challenge Type Selection */}
              <Text style={styles.sectionTitle}>Challenge Type</Text>
              <View style={styles.typeContainer}>
                {challengeTypes.map(renderChallengeType)}
              </View>

              {/* Basic Information */}
              <Text style={styles.sectionTitle}>Match Details</Text>
              
              <TextInput
                label="Challenge Title"
                value={formData.title}
                onChangeText={(text) => setFormData({...formData, title: text})}
                placeholder="Friday Night Football Challenge"
                style={styles.input}
                mode="outlined"
                activeOutlineColor="#229a60"
              />
              
              <TextInput
                label="Description"
                value={formData.description}
                onChangeText={(text) => setFormData({...formData, description: text})}
                placeholder="Looking for a competitive match. Loser pays ground fee!"
                multiline
                numberOfLines={3}
                style={styles.input}
                mode="outlined"
                activeOutlineColor="#229a60"
              />

              {/* Sport Selection */}
              <Text style={styles.fieldLabel}>Sport</Text>
              <View style={styles.chipContainer}>
                {sports.map((sport) => (
                  <Chip
                    key={sport}
                    mode={formData.sport === sport ? 'flat' : 'outlined'}
                    selected={formData.sport === sport}
                    onPress={() => setFormData({...formData, sport: sport})}
                    style={[
                      styles.sportChip,
                      formData.sport === sport && styles.selectedSportChip
                    ]}
                    textStyle={[
                      styles.chipText,
                      formData.sport === sport && styles.selectedChipText
                    ]}
                  >
                    {sport}
                  </Chip>
                ))}
              </View>

              {/* Date and Time */}
              <View style={styles.row}>
                <TextInput
                  label="Date"
                  value={formData.proposedDate}
                  onChangeText={(text) => setFormData({...formData, proposedDate: text})}
                  placeholder="YYYY-MM-DD"
                  style={[styles.input, styles.halfInput]}
                  mode="outlined"
                  activeOutlineColor="#229a60"
                />
                
                <TextInput
                  label="Time"
                  value={formData.proposedTime}
                  onChangeText={(text) => setFormData({...formData, proposedTime: text})}
                  placeholder="19:00"
                  style={[styles.input, styles.halfInput]}
                  mode="outlined"
                  activeOutlineColor="#229a60"
                />
              </View>

              {/* Venue and Fee */}
              <TextInput
                label="Preferred Venue (Optional)"
                value={formData.venue}
                onChangeText={(text) => setFormData({...formData, venue: text})}
                placeholder="DHA Sports Complex or any good venue"
                style={styles.input}
                mode="outlined"
                activeOutlineColor="#229a60"
              />
              
              <TextInput
                label="Max Ground Fee (PKR)"
                value={formData.maxGroundFee}
                onChangeText={(text) => setFormData({...formData, maxGroundFee: text})}
                placeholder="3000"
                keyboardType="numeric"
                style={styles.input}
                mode="outlined"
                activeOutlineColor="#229a60"
              />

              {/* Rules and Settings */}
              <Text style={styles.sectionTitle}>Match Rules</Text>
              
              <TextInput
                label="Special Rules (Optional)"
                value={formData.rules}
                onChangeText={(text) => setFormData({...formData, rules: text})}
                placeholder="Standard rules, 90 minutes, referee required"
                multiline
                numberOfLines={2}
                style={styles.input}
                mode="outlined"
                activeOutlineColor="#229a60"
              />

              <View style={styles.switchContainer}>
                <View style={styles.switchItem}>
                  <Text style={styles.switchLabel}>Winner Takes All</Text>
                  <Switch
                    value={formData.isWinnerTakesAll}
                    onValueChange={(value) => setFormData({...formData, isWinnerTakesAll: value})}
                    color="#229a60"
                  />
                </View>
                <Text style={styles.switchDescription}>
                  {formData.isWinnerTakesAll ? 'Loser pays entire ground fee' : 'Split ground fee equally'}
                </Text>
              </View>

              {formData.type === 'tournament' && (
                <TextInput
                  label="Max Participants"
                  value={formData.maxParticipants}
                  onChangeText={(text) => setFormData({...formData, maxParticipants: text})}
                  placeholder="8"
                  keyboardType="numeric"
                  style={styles.input}
                  mode="outlined"
                  activeOutlineColor="#229a60"
                />
              )}
            </ScrollView>
            
            <View style={styles.buttons}>
              <Button mode="outlined" onPress={onDismiss} style={styles.button}>
                Cancel
              </Button>
              <Button 
                mode="contained" 
                onPress={handleSubmit} 
                style={[styles.button, styles.submitButton]}
                buttonColor="#229a60"
              >
                Create Challenge
              </Button>
            </View>
          </Card.Content>
        </Card>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modal: {
    margin: 20,
    maxHeight: '90%',
  },
  title: {
    textAlign: 'center',
    marginBottom: 20,
    color: '#229a60',
    fontWeight: 'bold',
    fontFamily: 'Montserrat_700Bold',
  },
  form: {
    maxHeight: 500,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 15,
    fontFamily: 'Montserrat_600SemiBold',
  },
  typeContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  typeCard: {
    flex: 1,
    padding: 12,
    marginHorizontal: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  selectedTypeCard: {
    borderColor: '#229a60',
    backgroundColor: 'rgba(34, 154, 96, 0.1)',
  },
  typeLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
    fontFamily: 'Montserrat_600SemiBold',
  },
  selectedTypeLabel: {
    color: '#229a60',
  },
  typeDescription: {
    fontSize: 10,
    color: '#999',
    textAlign: 'center',
    marginTop: 2,
    fontFamily: 'Montserrat_400Regular',
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
    marginBottom: 15,
  },
  sportChip: {
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: 'white',
    borderColor: '#E0E0E0',
  },
  selectedSportChip: {
    backgroundColor: '#229a60',
    borderColor: '#229a60',
  },
  chipText: {
    color: '#666',
    fontFamily: 'Montserrat_500Medium',
  },
  selectedChipText: {
    color: 'white',
  },
  input: {
    marginBottom: 15,
    backgroundColor: 'white',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    flex: 0.48,
  },
  switchContainer: {
    marginBottom: 15,
  },
  switchItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'Montserrat_600SemiBold',
  },
  switchDescription: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'Montserrat_400Regular',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
  },
  submitButton: {
    backgroundColor: '#229a60',
  },
});