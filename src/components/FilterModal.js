import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Modal, Portal, Text, Button, Card, Switch, Chip } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { setFilters } from '../store/slices/turfSlice';
import { SportsIcon } from './SportsIcons';

export default function FilterModal({ visible, onDismiss }) {
  const dispatch = useDispatch();
  const { filters } = useSelector(state => state.turf);
  const [localFilters, setLocalFilters] = useState(filters);

  const handleApplyFilters = () => {
    dispatch(setFilters(localFilters));
    onDismiss();
  };

  const handleResetFilters = () => {
    const resetFilters = {
      hasFloodlights: false,
      surfaceType: 'all',
      hasGenerator: false,
      priceRange: [0, 5000],
      sports: [],
    };
    setLocalFilters(resetFilters);
    dispatch(setFilters(resetFilters));
  };

  const handleSportToggle = (sport) => {
    const currentSports = localFilters.sports || [];
    const updatedSports = currentSports.includes(sport)
      ? currentSports.filter(s => s !== sport)
      : [...currentSports, sport];
    
    setLocalFilters({...localFilters, sports: updatedSports});
  };

  const availableSports = ['Cricket', 'Futsal', 'Padel'];

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.modal}>
        <Card>
          <Card.Content>
            <Text variant="headlineSmall" style={styles.title}>
              Filter Turfs
            </Text>
            
            <View style={styles.filterSection}>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Facilities
              </Text>
              
              <View style={styles.switchRow}>
                <Text>Floodlights Available</Text>
                <Switch
                  value={localFilters.hasFloodlights}
                  onValueChange={(value) => 
                    setLocalFilters({...localFilters, hasFloodlights: value})
                  }
                />
              </View>
              
              <View style={styles.switchRow}>
                <Text>Generator Backup</Text>
                <Switch
                  value={localFilters.hasGenerator}
                  onValueChange={(value) => 
                    setLocalFilters({...localFilters, hasGenerator: value})
                  }
                />
              </View>
            </View>
            
            <View style={styles.filterSection}>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Surface Type
              </Text>
              
              <View style={styles.chipRow}>
                <Chip
                  selected={localFilters.surfaceType === 'all'}
                  onPress={() => setLocalFilters({...localFilters, surfaceType: 'all'})}
                  style={styles.chip}
                >
                  All
                </Chip>
                <Chip
                  selected={localFilters.surfaceType === 'astroturf'}
                  onPress={() => setLocalFilters({...localFilters, surfaceType: 'astroturf'})}
                  style={styles.chip}
                >
                  AstroTurf
                </Chip>
                <Chip
                  selected={localFilters.surfaceType === 'cement'}
                  onPress={() => setLocalFilters({...localFilters, surfaceType: 'cement'})}
                  style={styles.chip}
                >
                  Cement
                </Chip>
              </View>
            </View>
            
            <View style={styles.buttons}>
              <Button mode="outlined" onPress={handleResetFilters} style={styles.button}>
                Reset
              </Button>
              <Button mode="contained" onPress={handleApplyFilters} style={styles.button}>
                Apply Filters
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
  },
  title: {
    textAlign: 'center',
    marginBottom: 20,
    color: '#2E7D32',
    fontWeight: 'bold',
  },
  filterSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    marginBottom: 10,
    fontWeight: 'bold',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    marginRight: 8,
    marginBottom: 8,
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
});