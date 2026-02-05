import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, StatusBar, Modal, TouchableWithoutFeedback, Image } from 'react-native';
import { Text, TextInput, Avatar, Button } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { MaterialIcons } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';
import * as ImagePicker from 'expo-image-picker';
import { updateProfile } from '../../store/slices/authSlice';

// Brand colors
const COLORS = {
  primary: '#004d43',
  secondary: '#e8ee26',
  background: '#F8FAFB',
  white: '#FFFFFF',
  gray: '#6B7280',
  lightGray: '#E5E7EB',
  darkText: '#1F2937',
};

const InputField = ({ label, value, onChangeText, icon, keyboardType = 'default', editable = true, onPress, isSelect = false, isEditing }) => (
  <View style={styles.inputGroup}>
    <Text style={styles.inputLabel}>{label}</Text>
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={(isEditing && isSelect) ? onPress : undefined}
      style={[
        styles.inputWrapper,
        isEditing && editable && styles.inputWrapperActive,
        (!isEditing || !editable) && styles.inputWrapperDisabled
      ]}
      disabled={!isEditing || !isSelect}
    >
      <MaterialIcons name={icon} size={20} color={COLORS.primary} style={styles.inputIcon} />
      {isSelect ? (
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <Text style={[
            styles.textInput,
            {
              textAlignVertical: 'center',
              color: value ? COLORS.darkText : COLORS.gray
            }
          ]}>
            {value || `Select ${label.toLowerCase()}`}
          </Text>
        </View>
      ) : (
        <TextInput
          value={value}
          onChangeText={onChangeText}
          style={styles.textInput}
          mode="flat"
          disabled={!isEditing || !editable}
          keyboardType={keyboardType}
          underlineColor="transparent"
          activeUnderlineColor="transparent"
          textColor={COLORS.darkText}
          placeholderTextColor={COLORS.gray}
          placeholder={`Enter ${label.toLowerCase()}`}
          editable={isEditing && editable}
        />
      )}

      {isEditing && (
        <MaterialIcons
          name={isSelect ? "arrow-drop-down" : "edit"}
          size={isSelect ? 24 : 16}
          color={COLORS.gray}
        />
      )}
    </TouchableOpacity>
  </View>
);

export default function ManageProfileScreen({ navigation }) {
  const { user } = useSelector(state => state.auth);
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    fullName: user?.fullName || user?.displayName || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
    dateOfBirth: user?.dateOfBirth || '',
    gender: user?.gender || '',
    location: user?.city || user?.location || '',
    profileImage: user?.photoURL || null
  });

  const [isEditing, setIsEditing] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showGenderPicker, setShowGenderPicker] = useState(false);

  // Date Picker State
  const [datePickerMode, setDatePickerMode] = useState('calendar'); // 'calendar' or 'year'
  const [currentCalendarDate, setCurrentCalendarDate] = useState(formData.dateOfBirth || new Date().toISOString().split('T')[0]);

  // Generate years for selection (1950 to current year)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1949 }, (_, i) => currentYear - i);

  const handleYearSelect = (year) => {
    // Keep current month and day, just change year
    const currentDate = new Date(currentCalendarDate);
    const newDate = new Date(year, currentDate.getMonth(), currentDate.getDate() || 1);
    const dateString = newDate.toISOString().split('T')[0];

    setCurrentCalendarDate(dateString);
    setDatePickerMode('calendar');
  };



  // ... (inside component)

  const handleSave = async () => {
    try {
      // Map form data to user object structure
      // Note: profileImage is local state, mapping to photoURL for auth slice
      const userData = {
        fullName: formData.fullName,
        displayName: formData.fullName, // Ensure consistency
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        location: formData.location,
        city: formData.location, // Map location to city for consistency
        photoURL: formData.profileImage
      };

      await dispatch(updateProfile(userData)).unwrap();

      Alert.alert(
        'Profile Updated',
        'Your profile has been updated successfully!',
        [{ text: 'OK', onPress: () => setIsEditing(false) }]
      );
    } catch (error) {
      Alert.alert('Update Failed', error.message || 'Could not update profile');
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setFormData({ ...formData, profileImage: result.assets[0].uri });
    }
  };

  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert("Permission to access camera is required!");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setFormData({ ...formData, profileImage: result.assets[0].uri });
    }
  };

  const handleEditPhoto = () => {
    Alert.alert(
      'Change Profile Photo',
      'Choose an option',
      [
        { text: 'Camera', onPress: takePhoto },
        { text: 'Gallery', onPress: pickImage },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Profile</Text>
        <TouchableOpacity
          style={[styles.editButton, isEditing && styles.editButtonActive]}
          onPress={() => setIsEditing(!isEditing)}
        >
          <MaterialIcons
            name={isEditing ? "close" : "edit"}
            size={20}
            color={isEditing ? COLORS.white : COLORS.primary}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Photo Section */}
        <View style={styles.photoSection}>
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarGlow} />
            <View style={styles.avatarContainer}>
              {formData.profileImage ? (
                <View style={[styles.avatar, { overflow: 'hidden', justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.white }]}>
                  <Image
                    source={{ uri: formData.profileImage }}
                    style={{ width: 110, height: 110 }}
                  />
                </View>
              ) : (
                <Avatar.Text
                  size={110}
                  label={formData.fullName?.charAt(0)?.toUpperCase() || 'U'}
                  style={styles.avatar}
                  labelStyle={styles.avatarLabel}
                />
              )}

              {isEditing && (
                <TouchableOpacity
                  style={styles.cameraButton}
                  onPress={handleEditPhoto}
                  activeOpacity={0.8}
                >
                  <MaterialIcons name="camera-alt" size={18} color={COLORS.primary} />
                </TouchableOpacity>
              )}
            </View>
          </View>
          <Text style={styles.userName}>{formData.fullName || 'Your Name'}</Text>
          <Text style={styles.userEmail}>{formData.email}</Text>
        </View>

        {/* Form Card */}
        <View style={styles.formCard}>
          <View style={styles.formHeader}>
            <View style={styles.formHeaderIcon}>
              <MaterialIcons name="person" size={20} color={COLORS.primary} />
            </View>
            <Text style={styles.formTitle}>Personal Information</Text>
          </View>

          <View style={styles.divider} />

          <InputField
            label="Full Name"
            value={formData.fullName}
            onChangeText={(text) => setFormData({ ...formData, fullName: text })}
            icon="person-outline"
            isEditing={isEditing}
          />

          <InputField
            label="Email Address"
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
            icon="email"
            keyboardType="email-address"
            editable={false}
            isEditing={isEditing}
          />

          <InputField
            label="Phone Number"
            value={formData.phoneNumber}
            onChangeText={(text) => setFormData({ ...formData, phoneNumber: text })}
            icon="phone"
            keyboardType="phone-pad"
            isEditing={isEditing}
          />

          <InputField
            label="Date of Birth"
            value={formData.dateOfBirth}
            icon="cake"
            isSelect={true}
            onPress={() => {
              setCurrentCalendarDate(formData.dateOfBirth || new Date().toISOString().split('T')[0]);
              setDatePickerMode('calendar');
              setShowDatePicker(true);
            }}
            isEditing={isEditing}
          />

          <InputField
            label="Gender"
            value={formData.gender}
            icon="wc"
            isSelect={true}
            onPress={() => setShowGenderPicker(true)}
            isEditing={isEditing}
          />

          <InputField
            label="Location"
            value={formData.location}
            onChangeText={(text) => setFormData({ ...formData, location: text })}
            icon="location-on"
            isEditing={isEditing}
          />
        </View>

        {/* Save Button */}
        {isEditing && (
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setIsEditing(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSave}
              activeOpacity={0.8}
            >
              <MaterialIcons name="check" size={20} color={COLORS.secondary} />
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Date Picker Modal */}
      <Modal
        visible={showDatePicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowDatePicker(false)}
        >
          <View style={styles.modalContent}>
            {/* Date Picker Header with Year Selection */}
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Select Date of Birth</Text>
                <TouchableOpacity
                  onPress={() => setDatePickerMode(datePickerMode === 'calendar' ? 'year' : 'calendar')}
                  style={styles.yearSelector}
                >
                  <Text style={styles.yearSelectorText}>
                    {new Date(currentCalendarDate).getFullYear()}
                  </Text>
                  <MaterialIcons
                    name={datePickerMode === 'calendar' ? "arrow-drop-down" : "arrow-drop-up"}
                    size={24}
                    color={COLORS.primary}
                  />
                </TouchableOpacity>
              </View>
              <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                <MaterialIcons name="close" size={24} color={COLORS.gray} />
              </TouchableOpacity>
            </View>

            {datePickerMode === 'calendar' ? (
              <Calendar
                current={currentCalendarDate}
                onDayPress={day => {
                  setFormData({ ...formData, dateOfBirth: day.dateString });
                  setShowDatePicker(false);
                }}
                markedDates={{
                  [formData.dateOfBirth]: { selected: true, selectedColor: COLORS.primary }
                }}
                theme={{
                  todayTextColor: COLORS.primary,
                  arrowColor: COLORS.primary,
                  selectedDayBackgroundColor: COLORS.primary,
                  selectedDayTextColor: COLORS.secondary,
                }}
                // Update internal state when month changes so year selector stays in sync
                onMonthChange={(month) => {
                  setCurrentCalendarDate(month.dateString);
                }}
              />
            ) : (
              <View style={styles.yearListContainer}>
                <ScrollView showsVerticalScrollIndicator={false}>
                  <View style={styles.yearGrid}>
                    {years.map((year) => (
                      <TouchableOpacity
                        key={year}
                        style={[
                          styles.yearItem,
                          new Date(currentCalendarDate).getFullYear() === year && styles.yearItemSelected
                        ]}
                        onPress={() => handleYearSelect(year)}
                      >
                        <Text style={[
                          styles.yearText,
                          new Date(currentCalendarDate).getFullYear() === year && styles.yearTextSelected
                        ]}>
                          {year}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Gender Picker Modal */}
      <Modal
        visible={showGenderPicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowGenderPicker(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowGenderPicker(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Gender</Text>
              <TouchableOpacity onPress={() => setShowGenderPicker(false)}>
                <MaterialIcons name="close" size={24} color={COLORS.gray} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.genderOption}
              onPress={() => {
                setFormData({ ...formData, gender: 'Male' });
                setShowGenderPicker(false);
              }}
            >
              <MaterialIcons name="male" size={24} color={COLORS.primary} style={styles.genderIcon} />
              <Text style={styles.genderText}>Male</Text>
              {formData.gender === 'Male' && (
                <MaterialIcons name="check-circle" size={24} color={COLORS.primary} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.genderOption}
              onPress={() => {
                setFormData({ ...formData, gender: 'Female' });
                setShowGenderPicker(false);
              }}
            >
              <MaterialIcons name="female" size={24} color={COLORS.primary} style={styles.genderIcon} />
              <Text style={styles.genderText}>Female</Text>
              {formData.gender === 'Female' && (
                <MaterialIcons name="check-circle" size={24} color={COLORS.primary} />
              )}
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: COLORS.background,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.darkText,
    letterSpacing: 0.3,
  },
  editButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  editButtonActive: {
    backgroundColor: COLORS.primary,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  photoSection: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 8,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 16,
  },
  avatarGlow: {
    position: 'absolute',
    top: 5,
    left: 5,
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: COLORS.secondary,
    opacity: 0.4,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    backgroundColor: COLORS.primary,
    borderWidth: 4,
    borderColor: COLORS.white,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  avatarLabel: {
    fontSize: 44,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: COLORS.secondary,
    borderRadius: 16,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.darkText,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: COLORS.gray,
    fontWeight: '500',
  },
  formCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    marginBottom: 20,
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  formHeaderIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: `${COLORS.secondary}40`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.darkText,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.lightGray,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 18,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.gray,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderWidth: 1.5,
    borderColor: 'transparent',
    minHeight: 50,
  },
  inputWrapperActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.white,
  },
  inputWrapperDisabled: {
    backgroundColor: COLORS.background,
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    backgroundColor: 'transparent',
    fontSize: 15,
    fontWeight: '500',
    paddingVertical: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.primary,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
  },
  saveButton: {
    flex: 2,
    flexDirection: 'row',
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  bottomSpacing: {
    height: 100,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: '100%',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
    maxHeight: '80%', // Limit height
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.darkText,
  },
  yearSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  yearSelectorText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginRight: 4,
  },
  yearListContainer: {
    height: 300,
  },
  yearGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  yearItem: {
    width: '30%',
    paddingVertical: 12,
    marginBottom: 12,
    backgroundColor: COLORS.background,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  yearItemSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  yearText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.darkText,
  },
  yearTextSelected: {
    color: COLORS.secondary,
    fontWeight: '700',
  },
  genderOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  genderIcon: {
    marginRight: 16,
  },
  genderText: {
    flex: 1,
    fontSize: 16,
    color: COLORS.darkText,
    fontWeight: '500',
  },
});