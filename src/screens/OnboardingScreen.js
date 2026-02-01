import React, { useState, useRef } from 'react';
import { View, StyleSheet, Dimensions, StatusBar, ScrollView } from 'react-native';
import { Text, Button } from 'react-native-paper';

const { width, height } = Dimensions.get('window');

const onboardingData = [
  {
    id: 1,
    title: 'Book your slots',
    description: 'For your favorite sport without any hassle',
    backgroundColor: '#E8F5E8',
    illustration: 'booking',
  },
  {
    id: 2,
    title: 'Find budget friendly turf/courts',
    description: 'Find every budget friendly turf/courts and book them directly',
    backgroundColor: '#FFF3E0',
    illustration: 'budget',
  },
];

export default function OnboardingScreen({ onComplete }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef(null);

  const handleScroll = (event) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = event.nativeEvent.contentOffset.x / slideSize;
    const roundIndex = Math.round(index);
    setCurrentIndex(roundIndex);
  };

  const handleNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      scrollViewRef.current?.scrollTo({
        x: nextIndex * width,
        animated: true,
      });
    } else {
      // Complete onboarding and go to login
      onComplete?.();
    }
  };

  const renderIllustration = (type) => {
    switch (type) {
      case 'booking':
        return (
          <View style={styles.bookingScene}>
            <View style={styles.phone}>
              <View style={styles.screen}>
                <View style={styles.slotGrid}>
                  <View style={[styles.slot, { backgroundColor: '#4CAF50' }]} />
                  <View style={[styles.slot, { backgroundColor: '#F44336' }]} />
                  <View style={[styles.slot, { backgroundColor: '#4CAF50' }]} />
                  <View style={[styles.slot, { backgroundColor: '#4CAF50' }]} />
                </View>
                <Text style={styles.slotLabel}>Available Slots</Text>
              </View>
            </View>
            <View style={styles.clock}>
              <Text style={styles.clockText}>⏰</Text>
            </View>
          </View>
        );
      case 'budget':
        return (
          <View style={styles.budgetScene}>
            <View style={styles.priceCard}>
              <Text style={styles.priceTitle}>Budget Friendly</Text>
              <Text style={styles.priceAmount}>PKR 1,500/hr</Text>
              <View style={styles.priceFeatures}>
                <Text style={styles.featureText}>✓ Quality Ground</Text>
                <Text style={styles.featureText}>✓ Good Location</Text>
                <Text style={styles.featureText}>✓ Best Price</Text>
              </View>
            </View>
            <View style={styles.moneyIcon}>
              <Text style={styles.moneyText}>💰</Text>
            </View>
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>50% OFF</Text>
            </View>
          </View>
        );
      default:
        return null;
    }
  };

  const currentItem = onboardingData[currentIndex];

  const renderOnboardingItem = (item, index) => (
    <View key={item.id} style={[styles.slide, { backgroundColor: item.backgroundColor }]}>
      <StatusBar barStyle="dark-content" />
      
      {/* Illustration */}
      <View style={styles.illustrationContainer}>
        {renderIllustration(item.illustration)}
        
        {/* Decorative Elements */}
        <View style={styles.decorativeElements}>
          <View style={[styles.dot, styles.dot1]} />
          <View style={[styles.dot, styles.dot2]} />
          <View style={[styles.dot, styles.dot3]} />
        </View>
      </View>

      {/* Content - moved outside illustration container */}
      <View style={styles.contentContainer}>
        <Text variant="headlineLarge" style={styles.title}>
          {item.title}
        </Text>
        <Text variant="bodyLarge" style={styles.description}>
          {item.description}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        style={styles.scrollView}
      >
        {onboardingData.map((item, index) => renderOnboardingItem(item, index))}
      </ScrollView>

      {/* Pagination Dots */}
      <View style={styles.paginationContainer}>
        {onboardingData.map((_, index) => (
          <View
            key={index}
            style={[
              styles.paginationDot,
              index === currentIndex ? styles.activeDot : styles.inactiveDot,
            ]}
          />
        ))}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        <Button
          mode="contained"
          onPress={handleNext}
          style={styles.getStartedButton}
          contentStyle={styles.buttonContent}
        >
          {currentIndex === onboardingData.length - 1 ? 'Get Started' : 'Next'}
        </Button>
        
        <Button
          mode="text"
          onPress={() => onComplete?.()}
          style={styles.loginButton}
          textColor="#666"
        >
          Already have an account? Log in
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  slide: {
    width: width,
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 180, // Space for buttons
  },
  illustrationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    maxHeight: height * 0.5,
  },
  bookingScene: {
    width: width * 0.8,
    height: height * 0.35,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  phone: {
    width: 200,
    height: 300,
    backgroundColor: '#333',
    borderRadius: 20,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  screen: {
    width: '100%',
    height: '90%',
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 20,
    justifyContent: 'center',
  },
  slotGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  slot: {
    width: '45%',
    height: 40,
    borderRadius: 8,
    marginBottom: 10,
  },
  slotLabel: {
    textAlign: 'center',
    marginTop: 10,
    fontSize: 12,
    color: '#666',
    fontFamily: 'Montserrat_400Regular',
  },
  clock: {
    position: 'absolute',
    top: -20,
    right: 20,
  },
  clockText: {
    fontSize: 30,
  },
  budgetScene: {
    width: width * 0.8,
    height: height * 0.35,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  priceCard: {
    width: 250,
    height: 200,
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  priceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 10,
    fontFamily: 'Montserrat_600SemiBold',
  },
  priceAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 15,
    fontFamily: 'Montserrat_700Bold',
  },
  priceFeatures: {
    alignItems: 'flex-start',
  },
  featureText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
    fontFamily: 'Montserrat_400Regular',
  },
  moneyIcon: {
    position: 'absolute',
    top: -10,
    left: 20,
  },
  moneyText: {
    fontSize: 40,
  },
  discountBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#FF5722',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  discountText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'Montserrat_700Bold',
  },
  decorativeElements: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  dot: {
    borderRadius: 50,
    position: 'absolute',
  },
  dot1: {
    top: '10%',
    left: '10%',
    width: 12,
    height: 12,
    backgroundColor: '#FF6F00',
    opacity: 0.6,
  },
  dot2: {
    top: '20%',
    right: '15%',
    width: 8,
    height: 8,
    backgroundColor: '#2E7D32',
    opacity: 0.4,
  },
  dot3: {
    bottom: '15%',
    left: '20%',
    width: 10,
    height: 10,
    backgroundColor: '#1976D2',
    opacity: 0.5,
  },
  contentContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  title: {
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    fontFamily: 'Montserrat_700Bold',
    fontSize: 28,
  },
  description: {
    textAlign: 'center',
    color: '#666',
    lineHeight: 24,
    fontFamily: 'Montserrat_400Regular',
    fontSize: 16,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 140,
    left: 0,
    right: 0,
  },
  paginationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  activeDot: {
    backgroundColor: '#2E7D32',
  },
  inactiveDot: {
    backgroundColor: '#C8E6C9',
  },
  actionContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 20,
  },
  getStartedButton: {
    backgroundColor: '#2E7D32',
    marginBottom: 15,
    borderRadius: 25,
  },
  buttonContent: {
    paddingVertical: 12,
  },
  loginButton: {
    alignSelf: 'center',
  },
});