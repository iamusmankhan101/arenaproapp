import { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, Image, Dimensions, TouchableOpacity } from 'react-native';
import { Text, TextInput, Button, Card } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { verifyOTP, sendOTP } from '../../store/slices/authSlice';
import { MaterialIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function OTPScreen({ route, navigation }) {
  const [otp, setOtp] = useState('');
  const [countdown, setCountdown] = useState(60);
  const { phoneNumber, password, isSignup = false, fullName = '' } = route.params;
  const dispatch = useDispatch();
  const { loading, error } = useSelector(state => state.auth);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => prev > 0 ? prev - 1 : 0);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit OTP');
      return;
    }

    try {
      await dispatch(verifyOTP({ 
        phoneNumber, 
        otp, 
        password, 
        fullName, 
        isSignup 
      })).unwrap();
    } catch (error) {
      Alert.alert('Error', error.message || 'Invalid OTP');
    }
  };

  const handleResendOTP = async () => {
    try {
      await dispatch(sendOTP(phoneNumber)).unwrap();
      setCountdown(60);
      Alert.alert('Success', 'OTP sent successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to resend OTP');
    }
  };

  return (
    <View style={styles.container}>
      {/* Background with decorative elements */}
      <View style={styles.backgroundContainer}>
        <View style={styles.decorativeCircle1} />
        <View style={styles.decorativeCircle2} />
        <View style={styles.decorativeCircle3} />
        
        {/* Back button */}
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => {
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              navigation.navigate('SignIn');
            }
          }}
        >
          <MaterialIcons name="arrow-back" size={24} color="white" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      </View>

      {/* Logo */}
      <View style={styles.logoContainer}>
        <Image
          source={require('../../images/pitch it logo (2).png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* White container */}
      <View style={styles.formContainer}>
        <Card style={styles.card}>
          <Card.Content style={styles.cardContent}>
            <Text variant="headlineMedium" style={styles.title}>
              Verify OTP
            </Text>
            <Text variant="bodyMedium" style={styles.subtitle}>
              Enter the 6-digit code sent to {phoneNumber}
            </Text>
            
            <TextInput
              label="OTP Code"
              value={otp}
              onChangeText={setOtp}
              keyboardType="numeric"
              maxLength={6}
              style={styles.input}
              mode="outlined"
              outlineColor="#E0E0E0"
              activeOutlineColor="#229a60"
              left={<Lock size={20} color="#666" style={{ marginLeft: 12 }} />}
            />
            
            {error && (
              <Text style={styles.error}>{error}</Text>
            )}
            
            <Button
              mode="contained"
              onPress={handleVerifyOTP}
              loading={loading}
              disabled={loading}
              style={styles.primaryButton}
              contentStyle={styles.buttonContent}
            >
              Verify OTP
            </Button>
            
            <TouchableOpacity 
              style={styles.resendContainer}
              onPress={handleResendOTP}
              disabled={countdown > 0}
            >
              <Text style={[styles.resendText, countdown > 0 && styles.disabledText]}>
                {countdown > 0 ? `Resend in ${countdown}s` : 'Resend OTP'}
              </Text>
            </TouchableOpacity>
          </Card.Content>
        </Card>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8F0FE',
  },
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.5,
    backgroundColor: '#229a60',
    overflow: 'hidden',
  },
  decorativeCircle1: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  decorativeCircle2: {
    position: 'absolute',
    top: 100,
    left: -80,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  decorativeCircle3: {
    position: 'absolute',
    bottom: -30,
    right: 50,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  backText: {
    color: 'white',
    marginLeft: 5,
    fontFamily: 'Montserrat_500Medium',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 120,
    marginBottom: 20,
    zIndex: 1,
  },
  logo: {
    width: 80,
    height: 80,
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'flex-end',
    paddingBottom: 40,
  },
  card: {
    borderRadius: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardContent: {
    padding: 30,
  },
  title: {
    textAlign: 'center',
    marginBottom: 10,
    color: '#229a60',
    fontFamily: 'Montserrat_600SemiBold',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
    fontFamily: 'Montserrat_400Regular',
  },
  input: {
    marginBottom: 20,
    backgroundColor: 'transparent',
    textAlign: 'center',
  },
  primaryButton: {
    backgroundColor: '#229a60',
    marginBottom: 20,
    borderRadius: 12,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  resendContainer: {
    alignItems: 'center',
  },
  resendText: {
    color: '#229a60',
    fontFamily: 'Montserrat_500Medium',
  },
  disabledText: {
    color: '#999',
  },
  error: {
    color: '#D32F2F',
    textAlign: 'center',
    marginBottom: 15,
    fontFamily: 'Montserrat_400Regular',
  },
});