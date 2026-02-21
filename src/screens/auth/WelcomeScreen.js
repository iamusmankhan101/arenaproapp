import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image, Dimensions, StatusBar } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../theme/theme';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      
      {/* Decorative circles in background */}
      <View style={styles.decorativeCircle1} />
      <View style={styles.decorativeCircle2} />
      
      {/* Image circles */}
      <View style={styles.imagesContainer}>
        {/* Main center image */}
        <View style={styles.mainImageContainer}>
          <Image
            source={require('../../images/indoor-football-court-turf.jpeg')}
            style={styles.mainImage}
            resizeMode="cover"
          />
          <TouchableOpacity style={styles.arrowButton}>
            <MaterialIcons name="arrow-forward" size={24} color={theme.colors.background} />
          </TouchableOpacity>
        </View>
        
        {/* Small top right image */}
        <View style={styles.smallImageTop}>
          <Image
            source={require('../../images/football.jpg')}
            style={styles.smallImage}
            resizeMode="cover"
          />
        </View>
        
        {/* Small bottom left image */}
        <View style={styles.smallImageBottom}>
          <Image
            source={require('../../images/padel.jpg')}
            style={styles.smallImage}
            resizeMode="cover"
          />
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>
          Redefining Your <Text style={styles.titleHighlight}>Sports Venue Booking</Text>
          {'\n'}
          <Text style={styles.titleHighlight}></Text> Experience
        </Text>
        
        <Text style={styles.subtitle}>
          Discover and book the best sports venues in your area. Join challenges, meet players, and elevate your game.
        </Text>
        
        <TouchableOpacity
          style={styles.getStartedButton}
          onPress={() => navigation.navigate('SignUp')}
        >
          <Text style={styles.getStartedText}>Let's Get Started</Text>
        </TouchableOpacity>
        
        <View style={styles.signInContainer}>
          <Text style={styles.signInText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
            <Text style={styles.signInLink}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  decorativeCircle1: {
    position: 'absolute',
    top: -100,
    left: -100,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: `${theme.colors.primary}10`,
  },
  decorativeCircle2: {
    position: 'absolute',
    bottom: -80,
    right: -80,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: `${theme.colors.secondary}10`,
  },
  imagesContainer: {
    height: height * 0.5,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  mainImageContainer: {
    width: width * 0.65,
    height: width * 0.85,
    borderRadius: (width * 0.65) / 2,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: theme.colors.primary,
    position: 'relative',
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  arrowButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  smallImageTop: {
    position: 'absolute',
    top: 80,
    right: 30,
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: theme.colors.primary,
  },
  smallImageBottom: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: theme.colors.primary,
  },
  smallImage: {
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 20,
    paddingBottom: 40,
    justifyContent: 'flex-end',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: 'ClashDisplay-Medium',
    lineHeight: 36,
  },
  titleHighlight: {
    color: theme.colors.primary,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    fontFamily: 'Montserrat_400Regular',
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  getStartedButton: {
    backgroundColor: theme.colors.primary,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  getStartedText: {
    color: theme.colors.secondary,
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'ClashDisplay-Medium',
  },
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signInText: {
    fontSize: 14,
    color: theme.colors.text,
    fontFamily: 'Montserrat_400Regular',
  },
  signInLink: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '600',
    fontFamily: 'Montserrat_600SemiBold',
  },
});