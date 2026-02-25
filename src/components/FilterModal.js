import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Platform } from 'react-native';
import { Modal, Portal, Text, Surface, Divider } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { setFilters } from '../store/slices/turfSlice';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../theme/theme';
import RangeSlider from './RangeSlider';

const { width, height } = Dimensions.get('window');

const availableSports = ['All', 'Cricket', 'Futsal', 'Padel'];
const sortOptions = ['All', 'Popular', 'Near by', 'Price Low to High'];
const ratingOptions = [4.5, 4.0, 3.5, 3.0, 2.5];

export default function FilterModal({ visible, onDismiss }) {
  const dispatch = useDispatch();
  const { filters } = useSelector(state => state.turf);
  const [localFilters, setLocalFilters] = useState(filters);

  // Sync with redux filters when modal opens
  useEffect(() => {
    if (visible) {
      setLocalFilters(filters);
    }
  }, [visible, filters]);

  const handleApplyFilters = () => {
    dispatch(setFilters(localFilters));
    onDismiss();
  };

  const handleResetFilters = () => {
    const resetFilters = {
      hasFloodlights: false,
      surfaceType: 'all',
      hasGenerator: false,
      priceRange: [0, 10000],
      sortBy: 'All',
      minRating: 0,
      sports: ['All'],
    };
    setLocalFilters(resetFilters);
  };

  const handleSportToggle = (sport) => {
    let updatedSports = [...localFilters.sports];

    if (sport === 'All') {
      updatedSports = ['All'];
    } else {
      // Remove 'All' if selecting a specific sport
      updatedSports = updatedSports.filter(s => s !== 'All');

      if (updatedSports.includes(sport)) {
        updatedSports = updatedSports.filter(s => s !== sport);
        // If nothing selected, default back to 'All'
        if (updatedSports.length === 0) updatedSports = ['All'];
      } else {
        updatedSports.push(sport);
      }
    }

    setLocalFilters({ ...localFilters, sports: updatedSports });
  };

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.modal}>
        <Surface style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onDismiss} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Filters</Text>
            <TouchableOpacity onPress={handleResetFilters}>
              <Text style={styles.resetText}>Reset</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
            {/* Sort By */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Sort by</Text>
              <View style={styles.chipRow}>
                {sortOptions.map(option => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.chip,
                      localFilters.sortBy === option && styles.activeChip
                    ]}
                    onPress={() => setLocalFilters({ ...localFilters, sortBy: option })}
                  >
                    <Text style={[
                      styles.chipText,
                      localFilters.sortBy === option && styles.activeChipText
                    ]}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Price Range */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Price Range (PKR)</Text>
              <RangeSlider
                min={0}
                max={10000}
                step={500}
                initialRange={localFilters.priceRange}
                onRangeChange={(range) => setLocalFilters({ ...localFilters, priceRange: range })}
              />
            </View>

            {/* Sports */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Sports</Text>
              <View style={styles.chipRow}>
                {availableSports.map(sport => (
                  <TouchableOpacity
                    key={sport}
                    style={[
                      styles.chip,
                      localFilters.sports.includes(sport) && styles.activeChip
                    ]}
                    onPress={() => handleSportToggle(sport)}
                  >
                    <Text style={[
                      styles.chipText,
                      localFilters.sports.includes(sport) && styles.activeChipText
                    ]}>
                      {sport}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Minimum Rating */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Minimum Rating</Text>
              {ratingOptions.map(rating => (
                <TouchableOpacity
                  key={rating}
                  style={styles.ratingRow}
                  onPress={() => setLocalFilters({ ...localFilters, minRating: rating })}
                >
                  <View style={styles.starsContainer}>
                    {[1, 2, 3, 4, 5].map(s => (
                      <MaterialIcons
                        key={s}
                        name="star"
                        size={20}
                        color={s <= Math.floor(rating) ? "#FFD700" : "#E0E0E0"}
                      />
                    ))}
                    <Text style={styles.ratingLabel}>{String(rating) + ' & up'}</Text>
                  </View>
                  <View style={[
                    styles.radio,
                    localFilters.minRating === rating && styles.radioActive
                  ]}>
                    {localFilters.minRating === rating && <View style={styles.radioInner} />}
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Amenities / Facilities */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Facilities</Text>
              <View style={styles.chipRow}>
                <TouchableOpacity
                  style={[styles.chip, localFilters.hasFloodlights && styles.activeChip]}
                  onPress={() => setLocalFilters({ ...localFilters, hasFloodlights: !localFilters.hasFloodlights })}
                >
                  <Text style={[styles.chipText, localFilters.hasFloodlights && styles.activeChipText]}>Floodlights</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.chip, localFilters.hasGenerator && styles.activeChip]}
                  onPress={() => setLocalFilters({ ...localFilters, hasGenerator: !localFilters.hasGenerator })}
                >
                  <Text style={[styles.chipText, localFilters.hasGenerator && styles.activeChipText]}>Generator</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={{ height: 100 }} />
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.applyButton}
              onPress={handleApplyFilters}
            >
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </Surface>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  container: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: height * 0.85,
    paddingTop: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#004d43',
    fontFamily: 'Montserrat_700Bold',
  },
  closeButton: {
    padding: 4,
  },
  resetText: {
    color: '#004d43',
    fontWeight: '600',
    fontFamily: 'Montserrat_600SemiBold',
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 15,
    fontFamily: 'Montserrat_700Bold',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    marginHorizontal: 5,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  activeChip: {
    backgroundColor: '#004d43',
    borderColor: '#004d43',
  },
  chipText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
    fontFamily: 'Montserrat_600SemiBold',
  },
  activeChipText: {
    color: '#e8ee26', // Brand lime
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  priceValue: {
    fontSize: 14,
    color: '#004d43',
    fontWeight: '700',
    fontFamily: 'Montserrat_700Bold',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F8F8F8',
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingLabel: {
    marginLeft: 10,
    fontSize: 14,
    color: '#666',
    fontFamily: 'Montserrat_500Medium',
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioActive: {
    borderColor: '#004d43',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#004d43',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  applyButton: {
    backgroundColor: '#004d43',
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  applyButtonText: {
    color: '#e8ee26', // Brand lime
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Montserrat_700Bold',
  },
});
