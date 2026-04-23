import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { theme } from '../theme/theme';

const { width: screenWidth } = Dimensions.get('window');

const SkeletonLoader = ({
  width: customWidth = '100%',
  height = 20,
  borderRadius = 4,
  style = {},
  animationSpeed = 1200
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const startAnimation = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: animationSpeed,
            useNativeDriver: false,
          }),
          Animated.timing(animatedValue, {
            toValue: 0,
            duration: animationSpeed,
            useNativeDriver: false,
          }),
        ])
      ).start();
    };

    startAnimation();
  }, [animatedValue, animationSpeed]);

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-screenWidth, screenWidth],
  });

  const skeletonWidth = typeof customWidth === 'string' && customWidth.includes('%')
    ? customWidth
    : customWidth;

  return (
    <View
      style={[
        styles.container,
        {
          width: skeletonWidth,
          height,
          borderRadius
        },
        style
      ]}
    >
      <Animated.View
        style={[
          styles.shimmer,
          {
            transform: [{ translateX }],
          },
        ]}
      />
    </View>
  );
};

// Specific skeleton components for different UI elements
export const TurfCardSkeleton = () => (
  <View style={styles.turfCardSkeleton}>
    <SkeletonLoader width="100%" height={180} borderRadius={16} style={styles.imageSkeleton} />
    <View style={styles.turfCardContent}>
      <SkeletonLoader width="70%" height={18} borderRadius={4} style={styles.titleSkeleton} />
      <SkeletonLoader width="50%" height={14} borderRadius={4} style={styles.subtitleSkeleton} />
      <SkeletonLoader width="40%" height={14} borderRadius={4} style={styles.subtitleSkeleton} />
      <View style={styles.chipRow}>
        <SkeletonLoader width={60} height={24} borderRadius={12} style={styles.chipSkeleton} />
        <SkeletonLoader width={80} height={24} borderRadius={12} style={styles.chipSkeleton} />
      </View>
      <SkeletonLoader width="100%" height={40} borderRadius={20} style={styles.buttonSkeleton} />
    </View>
  </View>
);

export const VenueCardSkeleton = () => (
  <View style={styles.venueCardSkeleton}>
    <SkeletonLoader width="100%" height={160} borderRadius={15} style={styles.imageSkeleton} />
    <View style={styles.venueCardContent}>
      <SkeletonLoader width="80%" height={16} borderRadius={4} style={styles.titleSkeleton} />
      <SkeletonLoader width="60%" height={12} borderRadius={4} style={styles.subtitleSkeleton} />
      <SkeletonLoader width="50%" height={12} borderRadius={4} style={styles.subtitleSkeleton} />
      <View style={styles.venueFooter}>
        <SkeletonLoader width={30} height={16} borderRadius={8} />
        <SkeletonLoader width={60} height={24} borderRadius={8} />
      </View>
    </View>
  </View>
);

export const SportCategorySkeleton = () => (
  <View style={styles.sportCategorySkeleton}>
    <SkeletonLoader width={60} height={60} borderRadius={15} style={styles.sportIconSkeleton} />
    <SkeletonLoader width={50} height={12} borderRadius={4} style={styles.sportNameSkeleton} />
  </View>
);

export const ChallengeCardSkeleton = () => (
  <View style={styles.challengeCardSkeleton}>
    <View style={styles.challengeHeader}>
      <SkeletonLoader width={80} height={16} borderRadius={8} />
      <SkeletonLoader width={60} height={20} borderRadius={10} />
    </View>
    <SkeletonLoader width="90%" height={16} borderRadius={4} style={styles.titleSkeleton} />
    <SkeletonLoader width="70%" height={14} borderRadius={4} style={styles.subtitleSkeleton} />
    <View style={styles.challengeDetails}>
      <SkeletonLoader width="40%" height={12} borderRadius={4} />
      <SkeletonLoader width="30%" height={12} borderRadius={4} />
    </View>
    <View style={styles.challengeFooter}>
      <SkeletonLoader width={60} height={12} borderRadius={4} />
      <SkeletonLoader width={50} height={24} borderRadius={8} />
    </View>
  </View>
);

export const HeaderSkeleton = () => (
  <View style={styles.headerSkeleton}>
    <SkeletonLoader width="100%" height={250} borderRadius={20} />
  </View>
);

export const SearchBarSkeleton = () => (
  <View style={styles.searchBarSkeleton}>
    <SkeletonLoader width="100%" height={48} borderRadius={12} />
  </View>
);

export const BookingCardSkeleton = () => (
  <View style={styles.bookingCardSkeleton}>
    <View style={styles.bookingCardRow}>
      <SkeletonLoader width={60} height={60} borderRadius={12} />
      <View style={styles.bookingCardInfo}>
        <SkeletonLoader width="70%" height={16} borderRadius={4} style={{ marginBottom: 8 }} />
        <SkeletonLoader width="50%" height={12} borderRadius={4} style={{ marginBottom: 6 }} />
        <SkeletonLoader width="40%" height={12} borderRadius={4} />
      </View>
    </View>
    <View style={styles.bookingCardFooter}>
      <SkeletonLoader width={80} height={24} borderRadius={12} />
      <SkeletonLoader width={60} height={24} borderRadius={12} />
    </View>
  </View>
);

export const SquadCardSkeleton = () => (
  <View style={styles.squadCardSkeleton}>
    <View style={styles.squadCardHeader}>
      <SkeletonLoader width={50} height={50} borderRadius={25} />
      <View style={{ flex: 1, marginLeft: 12 }}>
        <SkeletonLoader width="60%" height={16} borderRadius={4} style={{ marginBottom: 8 }} />
        <SkeletonLoader width="40%" height={12} borderRadius={4} />
      </View>
      <SkeletonLoader width={60} height={24} borderRadius={12} />
    </View>
    <View style={styles.squadCardDetails}>
      <SkeletonLoader width="45%" height={14} borderRadius={4} />
      <SkeletonLoader width="35%" height={14} borderRadius={4} />
    </View>
    <View style={styles.squadCardDetails}>
      <SkeletonLoader width="55%" height={14} borderRadius={4} />
      <SkeletonLoader width="25%" height={14} borderRadius={4} />
    </View>
    <SkeletonLoader width="100%" height={44} borderRadius={12} style={{ marginTop: 12 }} />
  </View>
);

export const ProfileSkeleton = () => (
  <View style={styles.profileSkeleton}>
    <View style={styles.profileHeader}>
      <SkeletonLoader width={90} height={90} borderRadius={45} />
      <SkeletonLoader width="50%" height={20} borderRadius={4} style={{ marginTop: 16 }} />
      <SkeletonLoader width="35%" height={14} borderRadius={4} style={{ marginTop: 8 }} />
    </View>
    <View style={styles.profileStats}>
      <SkeletonLoader width="30%" height={50} borderRadius={12} />
      <SkeletonLoader width="30%" height={50} borderRadius={12} />
      <SkeletonLoader width="30%" height={50} borderRadius={12} />
    </View>
    {[1, 2, 3, 4].map((i) => (
      <View key={i} style={styles.profileMenuItem}>
        <SkeletonLoader width={40} height={40} borderRadius={20} />
        <SkeletonLoader width="60%" height={16} borderRadius={4} style={{ marginLeft: 16 }} />
      </View>
    ))}
  </View>
);

export const NotificationSkeleton = () => (
  <View style={styles.notificationSkeleton}>
    {[1, 2, 3, 4].map((i) => (
      <View key={i} style={styles.notifCardSkeleton}>
        <SkeletonLoader width={48} height={48} borderRadius={24} />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            <SkeletonLoader width="60%" height={16} borderRadius={4} />
            <SkeletonLoader width={30} height={12} borderRadius={4} />
          </View>
          <SkeletonLoader width="90%" height={12} borderRadius={4} style={{ marginBottom: 4 }} />
          <SkeletonLoader width="70%" height={12} borderRadius={4} />
        </View>
      </View>
    ))}
  </View>
);

export const HomeScreenSkeleton = () => (
  <View style={styles.homeSkeletonContainer}>
    {/* Sport categories */}
    <View style={styles.homeSkeletonCategories}>
      {[1, 2, 3].map(i => (
        <SportCategorySkeleton key={i} />
      ))}
    </View>
    {/* Section title */}
    <SkeletonLoader width="50%" height={18} borderRadius={4} style={{ marginHorizontal: 20, marginBottom: 16 }} />
    {/* Venue cards */}
    <View style={{ flexDirection: 'row', paddingHorizontal: 20, gap: 16 }}>
      <VenueCardSkeleton />
      <VenueCardSkeleton />
    </View>
    {/* Section title */}
    <SkeletonLoader width="40%" height={18} borderRadius={4} style={{ marginHorizontal: 20, marginTop: 24, marginBottom: 16 }} />
    {/* More venue cards */}
    <View style={{ flexDirection: 'row', paddingHorizontal: 20, gap: 16 }}>
      <VenueCardSkeleton />
      <VenueCardSkeleton />
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#E8F0FE',
    overflow: 'hidden',
  },
  shimmer: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    position: 'absolute',
  },

  // TurfCard Skeleton
  turfCardSkeleton: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    overflow: 'hidden',
  },
  turfCardContent: {
    padding: 16,
  },
  imageSkeleton: {
    marginBottom: 8,
  },
  titleSkeleton: {
    marginBottom: 8,
  },
  subtitleSkeleton: {
    marginBottom: 6,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 12,
  },
  chipSkeleton: {
    marginRight: 8,
  },
  buttonSkeleton: {
    marginTop: 8,
  },

  // VenueCard Skeleton
  venueCardSkeleton: {
    width: 280,
    marginRight: 15,
    backgroundColor: 'white',
    borderRadius: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  venueCardContent: {
    padding: 15,
  },
  venueFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },

  // SportCategory Skeleton
  sportCategorySkeleton: {
    alignItems: 'center',
    marginRight: 15,
    width: 70,
  },
  sportIconSkeleton: {
    marginBottom: 8,
  },
  sportNameSkeleton: {
    marginTop: 4,
  },

  // ChallengeCard Skeleton
  challengeCardSkeleton: {
    width: 280,
    marginRight: 15,
    backgroundColor: 'white',
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    padding: 15,
  },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  challengeDetails: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: 12,
  },
  challengeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },

  // Header Skeleton
  headerSkeleton: {
    height: 250,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    overflow: 'hidden',
  },

  // SearchBar Skeleton
  searchBarSkeleton: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
  },

  // BookingCard Skeleton
  bookingCardSkeleton: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  bookingCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  bookingCardInfo: {
    flex: 1,
    marginLeft: 12,
  },
  bookingCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },

  // SquadCard Skeleton
  squadCardSkeleton: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  squadCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  squadCardDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  // Profile Skeleton
  profileSkeleton: {
    padding: 20,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  profileStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingHorizontal: 10,
  },
  profileMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },

  // Notification Skeleton
  notificationSkeleton: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  notifCardSkeleton: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },

  // HomeScreen Skeleton
  homeSkeletonContainer: {
    paddingTop: 16,
  },
  homeSkeletonCategories: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 24,
  },
});

export default SkeletonLoader;