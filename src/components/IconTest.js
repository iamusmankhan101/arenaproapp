import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Icon, AppIcons } from './Icons';
import { MaterialIcons } from '@expo/vector-icons';

const IconTest = () => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Icon Test</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Direct MaterialIcons (should work)</Text>
        <View style={styles.iconRow}>
          <MaterialIcons name="home" size={24} color="#000" />
          <MaterialIcons name="search" size={24} color="#000" />
          <MaterialIcons name="person" size={24} color="#000" />
          <MaterialIcons name="settings" size={24} color="#000" />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Eye and Arrow Icons Test</Text>
        <View style={styles.iconRow}>
          <MaterialIcons name="visibility" size={24} color="#000" />
          <MaterialIcons name="visibility_off" size={24} color="#000" />
          <MaterialIcons name="arrow_back" size={24} color="#000" />
          <MaterialIcons name="arrow_forward" size={24} color="#000" />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Alternative Arrow Names</Text>
        <View style={styles.iconRow}>
          <MaterialIcons name="keyboard_arrow_left" size={24} color="#000" />
          <MaterialIcons name="keyboard_arrow_right" size={24} color="#000" />
          <MaterialIcons name="chevron_left" size={24} color="#000" />
          <MaterialIcons name="chevron_right" size={24} color="#000" />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>AppIcons (using our wrapper)</Text>
        <View style={styles.iconRow}>
          <AppIcons.Home size={24} color="#000" />
          <AppIcons.Search size={24} color="#000" />
          <AppIcons.Profile size={24} color="#000" />
          <AppIcons.Settings size={24} color="#000" />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Generic Icon Component</Text>
        <View style={styles.iconRow}>
          <Icon name="home" size={24} color="#000" />
          <Icon name="search" size={24} color="#000" />
          <Icon name="user" size={24} color="#000" />
          <Icon name="settings" size={24} color="#000" />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  iconRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
  },
});

export default IconTest;