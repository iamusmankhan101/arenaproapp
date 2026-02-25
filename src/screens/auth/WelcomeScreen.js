import React from 'react';
import { View, StyleSheet, TouchableOpacity, StatusBar, Image } from 'react-native';
import { Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../theme/theme';

export default function WelcomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <LinearGradient
        colors={['#004d43', '#004d43', '#004d43']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.content}>
            {/* Logo Image */}
            <Image
              source={require('../../images/app ui arena pro (4).png')}
              style={styles.logoImage}
              resizeMode="contain"
            />

            {/* Spacer - removed to move text up */}

            {/* Bottom Content */}
            <View style={styles.bottomContent}>
              <Text style={styles.title}>Book Your Favorite</Text>
              <Text style={styles.titleHighlight}>Sports Venue</Text>

              <Text style={styles.subtitle}>
                From cricket and football to padel and futsal — we have venues ready for you to book and play
              </Text>

              

              <TouchableOpacity
                style={styles.continueButton}
                onPress={() => navigation.navigate('SignUp')}
              >
                <Text style={styles.continueText}>Continue</Text>
              </TouchableOpacity>

              <View style={styles.signInContainer}>
                <Text style={styles.signInText}>Already have an account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
                  <Text style={styles.signInLink}>Sign In</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#004d43',
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingTop: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoImage: {
    width: 500,
    height: 500,
    marginBottom: 20,
  },
  bottomContent: {
    width: '100%',
    paddingBottom: 40,
    alignItems: 'center',
    marginTop: -25,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: 'ClashDisplay-Medium',
    lineHeight: 36,
  },
  titleHighlight: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.secondary,
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: 'ClashDisplay-Medium',
    lineHeight: 36,
  },
  subtitle: {
    fontSize: 15,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 24,
    fontFamily: 'Montserrat_400Regular',
    lineHeight: 24,
    paddingHorizontal: 10,
    opacity: 0.9,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 28,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  dotActive: {
    width: 24,
    backgroundColor: theme.colors.secondary,
  },
  continueButton: {
    backgroundColor: theme.colors.secondary,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    elevation: 4,
    shadowColor: theme.colors.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    width: '90%',
  },
  continueText: {
    color: theme.colors.primary,
    fontSize: 17,
    fontWeight: '700',
    fontFamily: 'Montserrat_700Bold',
    letterSpacing: 0.5,
  },
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 50,
  },
  signInText: {
    fontSize: 15,
    color: '#FFFFFF',
    fontFamily: 'Montserrat_400Regular',
    opacity: 0.9,
  },
  signInLink: {
    fontSize: 15,
    color: theme.colors.secondary,
    fontWeight: '700',
    fontFamily: 'Montserrat_700Bold',
  },
});
