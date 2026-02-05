import React from 'react';
import { View, StyleSheet, TouchableOpacity, ImageBackground, Image, Alert } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { googleSignIn } from '../../store/slices/authSlice';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { theme } from '../../theme/theme';

WebBrowser.maybeCompleteAuthSession();

export default function WelcomeScreen({ navigation }) {
  const dispatch = useDispatch();
  const { loading } = useSelector(state => state.auth);

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: '960416327217-0evmllr420e5b8s2lpkb6rgt9a04kr39.apps.googleusercontent.com',
    iosClientId: 'YOUR_IOS_CLIENT_ID',
    androidClientId: '960416327217-87m8l6b8cjti5jg9mejv87v9eo652v6h.apps.googleusercontent.com',
  });

  React.useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      dispatch(googleSignIn(id_token));
    } else if (response?.type === 'error') {
      Alert.alert('Sign In Error', 'Google sign-in failed. Please try again.');
    }
  }, [response]);

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
          <View style={styles.logoContainer}>
            <Image
              source={require('../../images/pitch it logo (500 x 200 px) (2).png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
            <Text style={styles.tagline}>Book. Play. Compete.</Text>
          </View>

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
          </View>

          {/* Social Login */}
          <View style={styles.socialContainer}>
            <Text style={styles.socialText}>Or continue with</Text>
            <View style={styles.socialButtons}>
              <TouchableOpacity
                style={styles.socialButton}
                onPress={() => promptAsync()}
                disabled={!request || loading}
              >
                <Image
                  source={require('../../images/2a5758d6-4edb-4047-87bb-e6b94dbbbab0-cover.png')}
                  style={styles.googleIcon}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>
          </View>
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
});