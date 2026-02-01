import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Text, TextInput, Avatar, Button } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { MaterialIcons } from '@expo/vector-icons';
import { Icon } from '../../components/Icons';

export default function ManageProfileScreen({ navigation }) {
  const { user } = useSelector(state => state.auth);
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    fullName: user?.fullName || 'Opeyemi Alabi',
    email: user?.email || 'abosedealabi232@gmail.com',
    phoneNumber: user?.phoneNumber || '+92 300 1234567',
    dateOfBirth: user?.dateOfBirth || '15/03/1995',
    gender: user?.gender || 'Female',
    location: user?.location || 'Lagos, Nigeria'
  });

  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    // Here you would dispatch an action to update user profile
    Alert.alert(
      'Profile Updated',
      'Your profile has been updated successfully!',
      [{ text: 'OK', onPress: () => setIsEditing(false) }]
    );
  };

  const handleEditPhoto = () => {
    Alert.alert(
      'Change Profile Photo',
      'Choose an option',
      [
        { text: 'Camera', onPress: () => console.log('Open Camera') },
        { text: 'Gallery', onPress: () => console.log('Open Gallery') },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Profile</Text>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => setIsEditing(!isEditing)}
        >
          <Icon name={isEditing ? "close" : "edit"} size={24} color="#229a60" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Photo Section */}
        <View style={styles.photoSection}>
          <View style={styles.avatarContainer}>
            <Avatar.Text 
              size={100} 
              label={formData.fullName.charAt(0)} 
              style={styles.avatar}
              labelStyle={styles.avatarLabel}
            />
            {isEditing && (
              <TouchableOpacity 
                style={styles.cameraButton}
                onPress={handleEditPhoto}
              >
                <Icon name="camera-alt" size={20} color="white" />
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.photoText}>Profile Photo</Text>
        </View>

        {/* Form Fields */}
        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Full Name</Text>
            <TextInput
              value={formData.fullName}
              onChangeText={(text) => setFormData({...formData, fullName: text})}
              style={styles.textInput}
              mode="outlined"
              disabled={!isEditing}
              outlineColor="#E0E0E0"
              activeOutlineColor="#229a60"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <TextInput
              value={formData.email}
              onChangeText={(text) => setFormData({...formData, email: text})}
              style={styles.textInput}
              mode="outlined"
              disabled={!isEditing}
              keyboardType="email-address"
              outlineColor="#E0E0E0"
              activeOutlineColor="#229a60"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Phone Number</Text>
            <TextInput
              value={formData.phoneNumber}
              onChangeText={(text) => setFormData({...formData, phoneNumber: text})}
              style={styles.textInput}
              mode="outlined"
              disabled={!isEditing}
              keyboardType="phone-pad"
              outlineColor="#E0E0E0"
              activeOutlineColor="#229a60"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Date of Birth</Text>
            <TextInput
              value={formData.dateOfBirth}
              onChangeText={(text) => setFormData({...formData, dateOfBirth: text})}
              style={styles.textInput}
              mode="outlined"
              disabled={!isEditing}
              outlineColor="#E0E0E0"
              activeOutlineColor="#229a60"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Gender</Text>
            <TextInput
              value={formData.gender}
              onChangeText={(text) => setFormData({...formData, gender: text})}
              style={styles.textInput}
              mode="outlined"
              disabled={!isEditing}
              outlineColor="#E0E0E0"
              activeOutlineColor="#229a60"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Location</Text>
            <TextInput
              value={formData.location}
              onChangeText={(text) => setFormData({...formData, location: text})}
              style={styles.textInput}
              mode="outlined"
              disabled={!isEditing}
              outlineColor="#E0E0E0"
              activeOutlineColor="#229a60"
            />
          </View>
        </View>

        {/* Save Button */}
        {isEditing && (
          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={handleSave}
              style={styles.saveButton}
              buttonColor="#229a60"
            >
              Save Changes
            </Button>
          </View>
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#F5F5F5',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  editButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  photoSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    backgroundColor: '#229a60',
  },
  avatarLabel: {
    fontSize: 40,
    fontWeight: 'bold',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#229a60',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
  },
  photoText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: 'white',
  },
  buttonContainer: {
    marginTop: 30,
    paddingHorizontal: 0,
  },
  saveButton: {
    borderRadius: 12,
    paddingVertical: 4,
  },
  bottomSpacing: {
    height: 100,
  },
});