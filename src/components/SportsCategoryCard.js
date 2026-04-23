import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { SportsIcon } from './SportsIcons';
import { theme } from '../theme/theme';

export default function SportsCategoryCard({ sport, onPress, selected = false }) {
  return (
    <TouchableOpacity onPress={() => onPress(sport)} activeOpacity={0.7}>
      <Card 
        style={[
          styles.card, 
          selected && styles.selectedCard
        ]}
      >
        <Card.Content style={styles.content}>
          <View style={styles.iconContainer}>
            <SportsIcon 
              sport={sport} 
              size={40} 
              style={[
                styles.icon,
                selected && styles.selectedIcon
              ]}
            />
          </View>
          <Text 
            variant="labelMedium" 
            style={[
              styles.sportName,
              selected && styles.selectedText
            ]}
          >
            {sport}
          </Text>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
}

// Sports category list component
export const SportsCategoryList = ({ 
  sports = ['Cricket', 'Football', 'Futsal', 'Padel'], 
  selectedSports = [], 
  onSportPress,
  horizontal = true 
}) => {
  return (
    <View style={horizontal ? styles.horizontalList : styles.verticalList}>
      {sports.map((sport) => (
        <SportsCategoryCard
          key={sport}
          sport={sport}
          selected={selectedSports.includes(sport)}
          onPress={onSportPress}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginRight: 12,
    marginBottom: 12,
    minWidth: 80,
    backgroundColor: '#ffffff',
    elevation: 2,
  },
  selectedCard: {
    backgroundColor: theme.colors.primaryLight,
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  content: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  iconContainer: {
    marginBottom: 8,
  },
  icon: {
    backgroundColor: 'transparent',
  },
  selectedIcon: {
    backgroundColor: theme.colors.primary + '20', // 20% opacity
    borderRadius: 8,
    padding: 4,
  },
  sportName: {
    textAlign: 'center',
    fontWeight: '500',
    color: theme.colors.text,
  },
  selectedText: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  horizontalList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  verticalList: {
    flexDirection: 'column',
  },
});