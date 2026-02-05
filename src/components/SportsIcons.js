import React from 'react';
import { Image, View, StyleSheet, Text } from 'react-native';

// Sports icon mapping - using the specific files requested by user
const sportsIcons = {
  cricket: require('../images/cricket (1).png'),
  football: require('../images/football.jpg'),
  futsal: require('../images/game.png'),
  padel: require('../images/padel (1).png'),
  // Add more sports as needed
  basketball: require('../images/game.png'),
  tennis: require('../images/padel (1).png'),
};

// Sports icon component
export const SportsIcon = ({ sport, size = 24, style = {} }) => {
  const sportKey = sport?.toLowerCase();
  const iconSource = sportsIcons[sportKey] || sportsIcons.football; // Default to football icon

  return (
    <View style={[styles.iconContainer, { width: size, height: size }, style]}>
      <Image
        source={iconSource}
        style={[styles.icon, { width: size, height: size }]}
        resizeMode="contain"
      />
    </View>
  );
};

// Sports icon list component for multiple sports
export const SportsIconList = ({ sports = [], size = 20, maxIcons = 3, style = {} }) => {
  const displaySports = sports.slice(0, maxIcons);
  const remainingCount = sports.length - maxIcons;

  return (
    <View style={[styles.iconList, style]}>
      {displaySports.map((sport, index) => (
        <SportsIcon
          key={`${sport}-${index}`}
          sport={sport}
          size={size}
          style={[styles.listIcon, { marginLeft: index > 0 ? -size * 0.3 : 0 }]}
        />
      ))}
      {remainingCount > 0 && (
        <View style={[styles.moreIndicator, { width: size, height: size }]}>
          <Text style={[styles.moreText, { fontSize: size * 0.4 }]}>
            +{remainingCount}
          </Text>
        </View>
      )}
    </View>
  );
};

// Get sports icon source (for use in other components)
export const getSportsIconSource = (sport) => {
  const sportKey = sport?.toLowerCase();
  return sportsIcons[sportKey] || sportsIcons.football;
};

// Available sports list
export const availableSports = Object.keys(sportsIcons);

const styles = StyleSheet.create({
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 4,
    padding: 2,
  },
  icon: {
    tintColor: undefined, // Keep original colors
  },
  iconList: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listIcon: {
    borderWidth: 1,
    borderColor: '#fff',
    borderRadius: 4,
  },
  moreIndicator: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -8,
  },
  moreText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default SportsIcon;