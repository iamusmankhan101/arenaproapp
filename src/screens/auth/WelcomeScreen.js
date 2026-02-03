import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ImageBackground, Image, Alert } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useDispatch } from 'react-redux';
import { theme } from '../../theme/theme';
import { DEV_CONFIG, getMockCredentials } from '../../config/devConfig';
import { setAuthData } from '../../store/slices/authSlice';

export default function WelcomeScreen({ navigation }) {
  const [devTapCount, setDevTapCount] = useState(0);
  const dispatch = useDispatch();

  const handleDevBypass = () => {
    if (!__DEV__) {
      Alert.alert('Dev Mode', 'Dev bypass is only available in development mode.');
      return;
    }

    Alert.alert(
      '🚀 Developer Bypass',
      'Choose how to bypass authentication:',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Skip Auth (Guest)',
          onPress: () => {
            // Navigate directly without authentication
            navigation.reset({
              index: 0,
              routes: [{ name: 'MainTabs' }],
            });
          },
        },
        {
          text: 'Mock Sign In',
          onPress: () => {
            // Set mock user data in Redux
            const { user, token } = getMockCredentials();
            dispatch(setAuthData({
              user,
              token,
              isAuthenticated: true
            }));
            
            // Navigate to main app
            navigation.reset({
              index: 0,
              routes: [{ name: 'MainTabs' }],
            });
          },
        },
      ]
    );
  };

  const handleLogoPress = () => {
    if (!__DEV__) return; // Only work in development
    
    setDevTapCount(prev => prev + 1);
    
    // Reset count after 3 seconds of inactivity
    setTimeout(() => {
      setDevTapCount(0);
    }, 3000);
  };

  return (
    <View style={styles.container}>
      <ImageBackground 
        source={require('../../images/football.jpg')} 
        style={styles.backgroundImage}
        imageStyle={styles.backgroundImageStyle}
      >
        <View style={styles.overlay} />
        
        {/* Content */}
        <View style={styles.content}>
          {/* Logo */}
          <TouchableOpacity 
            style={styles.logoContainer}
            onPress={handleLogoPress}
            activeOpacity={0.8}
          >
            <Image 
              source={require('../../images/pitch it logo (500 x 200 px) (2).png')} 
              style={styles.logoImage}
              resizeMode="contain"
            />
            <Text style={styles.tagline}>Book. Play. Compete.</Text>
            {__DEV__ && devTapCount >= 3 && devTapCount < 5 && (
              <Text style={styles.devHint}>Tap {5 - devTapCount} more times for dev mode</Text>
            )}
            {__DEV__ && devTapCount >= 5 && (
              <Text style={styles.devActive}>🚀 Dev mode activated!</Text>
            )}
          </TouchableOpacity>

          {/* Welcome Text */}
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeTitle}>Welcome to Arena Pro</Text>
            <Text style={styles.welcomeSubtitle}>
              Discover and book the best sports venues in your area. 
              Join challenges, meet players, and elevate your game.
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={() => navigation.navigate('SignUp')}
              style={styles.primaryButton}
              contentStyle={styles.buttonContent}
              textColor="#004d43"
              buttonColor="#e8ee26"
            >
              Get Started
            </Button>

            <Button
              mode="outlined"
              onPress={() => navigation.navigate('SignIn')}
              style={styles.secondaryButton}
              contentStyle={styles.buttonContent}
              textColor="#004d43"
              buttonColor="#ffffff"
            >
              I already have an account
            </Button>

            {/* Dev Bypass Button - Only show in dev mode after 5 logo taps */}
            {__DEV__ && devTapCount >= 5 && (
              <Button
                mode="contained"
                onPress={handleDevBypass}
                style={styles.devButton}
                contentStyle={styles.buttonContent}
                textColor="#ffffff"
                buttonColor="#ff6b35"
                icon="developer-board"
              >
                🚀 Developer Bypass
              </Button>
            )}
          </View>

          {/* Social Login */}
          <View style={styles.socialContainer}>
            <Text style={styles.socialText}>Or continue with</Text>
            <View style={styles.socialButtons}>
              <TouchableOpacity style={styles.socialButton}>
                <Image 
                  source={require('../../images/2a5758d6-4edb-4047-87bb-e6b94dbbbab0-cover.png')} 
                  style={styles.googleIcon}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Dev Info - Only show in dev mode */}
          {__DEV__ && (
            <View style={styles.devInfo}>
              <Text style={styles.devInfoText}>
                🔧 Development Mode • Tap logo 5 times for bypass
              </Text>
            </View>
          )}
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    justifyContent: 'center',
  },
  backgroundImageStyle: {
    opacity: 0.8,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
    justifyContent: 'space-between',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  logoImage: {
    width: 200,
    height: 80,
    marginBottom: 16,
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  devHint: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    fontStyle: 'italic',
    marginTop: 8,
  },
  devActive: {
    fontSize: 12,
    color: '#e8ee26',
    fontWeight: 'bold',
    marginTop: 8,
  },
  welcomeContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 16,
  },
  welcomeSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonContainer: {
    gap: 16,
  },
  primaryButton: {
    borderRadius: 12,
  },
  secondaryButton: {
    borderRadius: 12,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 1,
  },
  devButton: {
    borderRadius: 12,
    marginTop: 8,
    elevation: 3,
    shadowColor: '#ff6b35',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  buttonContent: {
    height: 56,
  },
  socialContainer: {
    alignItems: 'center',
  },
  socialText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 16,
  },
  socialButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  socialButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  googleIcon: {
    width: 50,
    height: 50,
  },
  devInfo: {
    position: 'absolute',
    bottom: 10,
    left: 24,
    right: 24,
    alignItems: 'center',
  },
  devInfoText: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
  },
});