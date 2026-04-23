import React, { useState } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
    Dimensions,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button, ActivityIndicator } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { locationService } from '../../services/locationService';
import { theme } from '../../theme/theme';

const { width } = Dimensions.get('window');

export default function LocationAccessScreen({ navigation }) {
    const [loading, setLoading] = useState(false);

    const handleAllowAccess = async () => {
        setLoading(true);
        try {
            // Request permission
            const result = await locationService.requestLocationPermission();
            console.log('📍 Location permission result:', result);

            // Navigate to main tabs regardless of result
            // If granted, MapScreen will pick it up
            // If denied, app will work with default/manual location
            navigation.replace('MainTabs');
        } catch (error) {
            console.error('📍 Error requesting location:', error);
            navigation.replace('MainTabs');
        } finally {
            setLoading(false);
        }
    };

    const handleManualLocation = () => {
        // Navigate to manual location screen
        navigation.navigate('ManualLocation');
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

            <View style={styles.content}>
                {/* Icon */}
                <View style={styles.iconContainer}>
                    <View style={styles.iconCircle}>
                        <MaterialIcons name="location-on" size={width * 0.15} color="#666" />
                    </View>
                </View>

                {/* Text Content */}
                <View style={styles.textContainer}>
                    <Text variant="headlineMedium" style={styles.title}>
                        What is Your Location?
                    </Text>
                    <Text variant="bodyLarge" style={styles.subtitle}>
                        We need to know your location in order to suggest nearby services.
                    </Text>
                </View>

                {/* Buttons */}
                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={styles.primaryButton}
                        onPress={handleAllowAccess}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#e8ee26" />
                        ) : (
                            <Text style={styles.primaryButtonText}>Allow Location Access</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.secondaryButton}
                        onPress={handleManualLocation}
                        disabled={loading}
                    >
                        <Text style={styles.secondaryButtonText}>Enter Location Manually</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 30,
    },
    iconContainer: {
        marginBottom: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconCircle: {
        width: width * 0.35,
        height: width * 0.35,
        borderRadius: (width * 0.35) / 2,
        backgroundColor: '#F0F0F0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    textContainer: {
        alignItems: 'center',
        marginBottom: 60,
    },
    title: {
        fontWeight: '700',
        color: '#000000',
        textAlign: 'center',
        marginBottom: 16,
        fontFamily: 'Montserrat_700Bold',
    },
    subtitle: {
        color: '#666666',
        textAlign: 'center',
        lineHeight: 24,
        fontFamily: 'Montserrat_400Regular',
    },
    buttonContainer: {
        width: '100%',
        paddingHorizontal: 10,
    },
    primaryButton: {
        backgroundColor: '#7D7D7D', // matching the grey in user's image
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    primaryButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
        fontFamily: 'Montserrat_600SemiBold',
    },
    secondaryButton: {
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    secondaryButtonText: {
        color: '#7D7D7D',
        fontSize: 16,
        fontWeight: '500',
        fontFamily: 'Montserrat_500Medium',
    },
});
