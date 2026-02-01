import React from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Text } from 'react-native-paper';
import { SportsIcon } from './SportsIcons';
import { theme } from '../theme/theme';

const sportsCategories = [
  { name: 'Cricket', key: 'cricket', color: '#FF6B35' },
  { name: 'Football', key: 'football', color: '#4ECDC4' },
  { name: 'Futsal', key: 'futsal', color: '#45B7D1' },
  { name: 'Padel', key: 'padel', color: '#96CEB4' },
];

export const SportsCategoryCard = ({ sport, onPress, selected = false }) => {
  return (
    <TouchableOpacity
      style={[
        styles.categoryCard,
        { backgroundColor: selected ? theme.colors.primary : '#fff' },
        selected && styles.selectedCard
      ]}
      onPress={() => onPress && onPress(sport.key)}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: sport.color + '20' }]}>
        <SportsIcon 
          sport={sport.key} 
          size={32} 
          style={styles.categoryIcon}
        />
      </View>
      <Text 
        style={[
          styles.categoryText,
          { color: selected ? '#fff' : theme.colors.text }
        ]}
        variant="labelMedium"
      >
        {sport.name}
      </Text>
    </TouchableOpacity>
  );
};

export const SportsCategories = ({ 
  onSportSelect, 
  selectedSports = [], 
  horizontal = true,
  showAll = true 
}) => {
  const displayCategories = showAll 
    ? [{ name: 'All', key: 'all', color: theme.colors.primary }, ...sportsCategories]
    : sportsCategories;

  if (horizontal) {
    return (
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalContainer}
        style={styles.scrollContainer}
      >
        {displayCategories.map((sport) => (
          <SportsCategoryCard
            key={sport.key}
            sport={sport}
            onPress={onSportSelect}
            selected={selectedSports.includes(sport.key)}
          />
        ))}
      </ScrollView>
    );
  }

  return (
    <View style={styles.gridContainer}>
      {displayCategories.map((sport) => (
        <SportsCategoryCard
          key={sport.key}
          sport={sport}
          onPress={onSportSelect}
          selected={selectedSports.includes(sport.key)}
        />
      ))}
    </View>
  );
};

export default SportsCategories;

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 0,
  },
  horizontalContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  categoryCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 12,
    marginBottom: 8,
    borderRadius: 12,
    minWidth: 80,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  selectedCard: {
    elevation: 4,
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryIcon: {
    backgroundColor: 'transparent',
  },
  categoryText: {
    textAlign: 'center',
    fontWeight: '500',
  },
});