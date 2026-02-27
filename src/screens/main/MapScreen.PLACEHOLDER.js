import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Card, Surface } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../theme/theme';

export default function MapScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.iconContainer}>
          <MaterialIcons name="map" size={80} color={theme.colors.primary} />
        </View>
        
        <Text style={styles.title}>Map View Coming Soon</Text>
        
        <Text style={styles.subtitle}>
          We're working on bringing you an amazing map experience to find venues near you.
        </Text>

        <Surface style={styles.featureCard}>
          <Text style={styles.featureTitle}>What's Coming:</Text>
          <View style={styles.featureItem}>
            <MaterialIcons name="location-on" size={24} color={theme.colors.secondary} />
            <Text style={styles.featureText}>Interactive venue map</Text>
          </View>
          <View style={styles.featureItem}>
            <MaterialIcons name="directions" size={24} color={theme.colors.secondary} />
            <Text style={styles.featureText}>Distance calculations</Text>
          </View>
          <View style={styles.featureItem}>
            <MaterialIcons name="search" size={24} color={theme.colors.secondary} />
            <Text style={styles.featureText}>Location-based search</Text>
          </View>
        </Surface>

        <TouchableOpacity 
          style={styles.button}
          onPress={() => navigation.navigate('VenueList')}
        >
          <Text style={styles.buttonText}>Browse All Venues</Text>
          <MaterialIcons name="arrow-forward" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  iconContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  featureCard: {
    width: '100%',
    padding: 20,
    borderRadius: 12,
    elevation: 2,
    marginBottom: 32,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 8,
    elevation: 3,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginRight: 8,
  },
});
