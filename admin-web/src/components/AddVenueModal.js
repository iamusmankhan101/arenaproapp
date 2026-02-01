import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  Typography,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  IconButton,
  Checkbox
} from '@mui/material';
import { Schedule, DateRange, CloudUpload, Close } from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { addVenue, updateVenue } from '../store/slices/adminSlice';

const SPORTS_OPTIONS = ['Football', 'Cricket', 'Padel', 'Futsal', 'Basketball', 'Tennis'];
const FACILITIES_OPTIONS = [
  'Floodlights', 'Parking', 'Changing Room', 'Cafeteria', 'Equipment Rental',
  'Air Conditioning', 'Pro Shop', 'Lounge', 'Coaching', 'Practice Nets',
  'Scoreboard', 'Pavilion', 'Indoor Court'
];

export default function AddVenueModal({ open, onClose, editVenue = null }) {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadedImages, setUploadedImages] = useState([]);
  const isEditing = Boolean(editVenue);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    city: 'Lahore',
    area: '',
    latitude: '',
    longitude: '',
    sports: [],
    facilities: [],
    basePrice: '1000', // Default base price
    openTime: '06:00',
    closeTime: '23:00',
    images: [],
    slotDuration: '60', // minutes
    availableSlots: [], // All possible slots based on operating hours
    // Date-related fields
    selectedDate: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
    dateSpecificSlots: {} // Object to store slots for different dates
  });

  // Load edit venue data when editVenue prop changes
  useEffect(() => {
    if (editVenue) {
      console.log('🔄 Loading edit venue data:', editVenue);
      
      // Extract location data from different possible structures
      let latitude = '';
      let longitude = '';
      
      if (editVenue.location?.latitude) {
        latitude = editVenue.location.latitude.toString();
        longitude = editVenue.location.longitude.toString();
      } else if (editVenue.latitude) {
        latitude = editVenue.latitude.toString();
        longitude = editVenue.longitude.toString();
      }
      
      // Extract pricing data
      const basePrice = editVenue.pricing?.basePrice || editVenue.basePrice || 1000;
      
      // Extract operating hours
      const openTime = editVenue.operatingHours?.open || editVenue.openTime || '06:00';
      const closeTime = editVenue.operatingHours?.close || editVenue.closeTime || '23:00';
      
      setFormData({
        name: editVenue.name || '',
        description: editVenue.description || '',
        address: editVenue.address || '',
        city: editVenue.city || editVenue.location?.city || 'Lahore',
        area: editVenue.area || '',
        latitude: latitude,
        longitude: longitude,
        sports: Array.isArray(editVenue.sports) ? editVenue.sports : [],
        facilities: Array.isArray(editVenue.facilities) ? editVenue.facilities : [],
        basePrice: basePrice.toString(),
        openTime: openTime,
        closeTime: closeTime,
        images: Array.isArray(editVenue.images) ? editVenue.images : [],
        slotDuration: (editVenue.slotDuration || 60).toString(),
        availableSlots: Array.isArray(editVenue.timeSlots) ? editVenue.timeSlots : [],
        selectedDate: new Date().toISOString().split('T')[0],
        dateSpecificSlots: editVenue.dateSpecificSlots || {}
      });
      
      // Set uploaded images for editing
      if (editVenue.images && editVenue.images.length > 0) {
        const existingImages = editVenue.images.map((img, index) => ({
          id: `existing-${index}`,
          preview: typeof img === 'string' ? img : img.preview || img.url,
          name: `Image ${index + 1}`,
          existing: true
        }));
        setUploadedImages(existingImages);
      }
      
      console.log('✅ Edit venue data loaded successfully');
    } else {
      // Reset form for new venue
      setFormData({
        name: '',
        description: '',
        address: '',
        city: 'Lahore',
        area: '',
        latitude: '',
        longitude: '',
        sports: [],
        facilities: [],
        basePrice: '1000',
        openTime: '06:00',
        closeTime: '23:00',
        images: [],
        slotDuration: '60',
        availableSlots: [],
        selectedDate: new Date().toISOString().split('T')[0],
        dateSpecificSlots: {}
      });
      setUploadedImages([]);
    }
  }, [editVenue]);

  // Handle image upload
  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const newImage = {
            id: Date.now() + Math.random(),
            file: file,
            preview: e.target.result,
            name: file.name
          };
          
          setUploadedImages(prev => [...prev, newImage]);
          setFormData(prev => ({
            ...prev,
            images: [...prev.images, newImage]
          }));
        };
        reader.readAsDataURL(file);
      }
    });
    
    // Reset the input
    event.target.value = '';
  };

  // Remove image
  const handleRemoveImage = (imageId) => {
    setUploadedImages(prev => prev.filter(img => img.id !== imageId));
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter(img => img.id !== imageId)
    }));
  };

  // Generate all possible time slots based on operating hours
  const generateAllPossibleSlots = useCallback(() => {
    if (!formData.openTime || !formData.closeTime) return [];
    
    const slots = [];
    const startHour = parseInt(formData.openTime.split(':')[0]);
    const startMinute = parseInt(formData.openTime.split(':')[1]);
    const endHour = parseInt(formData.closeTime.split(':')[0]);
    const endMinute = parseInt(formData.closeTime.split(':')[1]);
    const duration = parseInt(formData.slotDuration);
    
    // Convert to minutes for easier calculation
    const startTotalMinutes = startHour * 60 + startMinute;
    const endTotalMinutes = endHour * 60 + endMinute;
    
    for (let minutes = startTotalMinutes; minutes < endTotalMinutes; minutes += duration) {
      const slotStartHour = Math.floor(minutes / 60);
      const slotStartMinute = minutes % 60;
      const slotEndMinutes = minutes + duration;
      const slotEndHour = Math.floor(slotEndMinutes / 60);
      const slotEndMinute = slotEndMinutes % 60;
      
      // Skip if end time exceeds closing time
      if (slotEndMinutes > endTotalMinutes) break;
      
      const startTime = `${slotStartHour.toString().padStart(2, '0')}:${slotStartMinute.toString().padStart(2, '0')}`;
      const endTime = `${slotEndHour.toString().padStart(2, '0')}:${slotEndMinute.toString().padStart(2, '0')}`;
      
      const slotId = `slot-${slotStartHour}-${slotStartMinute}`;
      const basePrice = parseFloat(formData.basePrice) || 1000; // Default base price
      
      slots.push({
        id: slotId,
        startTime,
        endTime,
        price: basePrice, // Use base price for all slots
        available: true,
        selected: true // Default to selected
      });
    }
    
    return slots;
  }, [formData.openTime, formData.closeTime, formData.basePrice, formData.slotDuration]);

  // Update available slots when operating hours or pricing changes
  useEffect(() => {
    if (formData.openTime && formData.closeTime) {
      const allSlots = generateAllPossibleSlots();
      setFormData(prev => ({
        ...prev,
        availableSlots: allSlots
      }));
    }
  }, [generateAllPossibleSlots, formData.openTime, formData.closeTime]);

  // Generate initial slots when component mounts
  useEffect(() => {
    // Generate slots with default values on component mount
    const allSlots = generateAllPossibleSlots();
    if (allSlots.length > 0) {
      setFormData(prev => ({
        ...prev,
        availableSlots: allSlots
      }));
    }
  }, [generateAllPossibleSlots]); // Include generateAllPossibleSlots as dependency

  // Handle date change for date-specific slots
  const handleDateChange = (event) => {
    const newDate = event.target.value;
    setFormData(prev => ({
      ...prev,
      selectedDate: newDate
    }));
  };

  // Generate slots for a specific date
  const generateSlotsForDate = (date) => {
    const slots = generateAllPossibleSlots();
    return slots.map(slot => ({
      ...slot,
      id: `${date}-${slot.id}`,
      date: date
    }));
  };

  // Handle date-specific slot toggle
  const handleDateSpecificSlotToggle = (slotId, date) => {
    setFormData(prev => {
      const dateKey = date || prev.selectedDate;
      const currentDateSlots = prev.dateSpecificSlots[dateKey] || generateSlotsForDate(dateKey);
      
      const updatedDateSlots = currentDateSlots.map(slot =>
        slot.id === slotId ? { ...slot, selected: !slot.selected } : slot
      );
      
      return {
        ...prev,
        dateSpecificSlots: {
          ...prev.dateSpecificSlots,
          [dateKey]: updatedDateSlots
        }
      };
    });
  };

  // Add a new date for slot configuration
  const handleAddDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    
    setFormData(prev => ({
      ...prev,
      selectedDate: tomorrowStr,
      dateSpecificSlots: {
        ...prev.dateSpecificSlots,
        [tomorrowStr]: generateSlotsForDate(tomorrowStr)
      }
    }));
  };

  const handleInputChange = (field) => (event) => {
    setFormData({
      ...formData,
      [field]: event.target.value
    });
  };

  const handleMultiSelectChange = (field) => (event) => {
    const value = typeof event.target.value === 'string' 
      ? event.target.value.split(',') 
      : event.target.value;
    setFormData({
      ...formData,
      [field]: value
    });
  };

  const handleSubmit = async () => {
    setError('');
    
    // Basic validation
    if (!formData.name || !formData.address || !formData.area || !formData.basePrice) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.sports.length === 0) {
      setError('Please select at least one sport');
      return;
    }

    // Check if at least one date-specific slot is selected (only for new venues)
    if (!isEditing) {
      const hasSelectedSlots = Object.values(formData.dateSpecificSlots).some(dateSlots => 
        dateSlots.some(slot => slot.selected)
      );

      if (!hasSelectedSlots) {
        setError('Please configure and select at least one time slot for at least one date');
        return;
      }
    }

    setLoading(true);
    
    try {
      // Prepare venue data with date-specific slots if configured
      let dateSpecificAvailability = null;
      
      // If date-specific slots are configured, include them
      if (Object.keys(formData.dateSpecificSlots).length > 0) {
        dateSpecificAvailability = {};
        Object.keys(formData.dateSpecificSlots).forEach(date => {
          dateSpecificAvailability[date] = formData.dateSpecificSlots[date].filter(slot => slot.selected);
        });
      }
      
      // Convert string numbers to actual numbers
      const venueData = {
        ...formData,
        basePrice: parseFloat(formData.basePrice),
        latitude: formData.latitude ? parseFloat(formData.latitude) : 31.5204,
        longitude: formData.longitude ? parseFloat(formData.longitude) : 74.3587,
        // Include date-specific slots if they exist
        ...(dateSpecificAvailability && { dateSpecificSlots: dateSpecificAvailability })
      };

      if (isEditing) {
        // Update existing venue
        await dispatch(updateVenue({ 
          venueId: editVenue.id, 
          venueData 
        })).unwrap();
      } else {
        // Add new venue
        await dispatch(addVenue(venueData)).unwrap();
      }
      
      // Reset form and close modal
      setFormData({
        name: '',
        description: '',
        address: '',
        city: 'Lahore',
        area: '',
        latitude: '',
        longitude: '',
        sports: [],
        facilities: [],
        basePrice: '1000',
        openTime: '06:00',
        closeTime: '23:00',
        images: [],
        slotDuration: '60',
        availableSlots: [],
        // Reset date-related fields
        selectedDate: new Date().toISOString().split('T')[0],
        dateSpecificSlots: {}
      });
      
      setUploadedImages([]);
      
      onClose();
      
    } catch (error) {
      setError(error.message || `Failed to ${isEditing ? 'update' : 'add'} venue`);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setError('');
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>{isEditing ? 'Edit Venue' : 'Add New Venue'}</DialogTitle>
      
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {/* Basic Information */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Basic Information
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Venue Name *"
              value={formData.name}
              onChange={handleInputChange('name')}
              disabled={loading}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Area *"
              value={formData.area}
              onChange={handleInputChange('area')}
              placeholder="e.g., DHA Phase 5"
              disabled={loading}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Address *"
              value={formData.address}
              onChange={handleInputChange('address')}
              disabled={loading}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Description"
              value={formData.description}
              onChange={handleInputChange('description')}
              disabled={loading}
            />
          </Grid>

          {/* Location */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Location
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="City"
              value={formData.city}
              onChange={handleInputChange('city')}
              disabled={loading}
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Latitude"
              type="number"
              value={formData.latitude}
              onChange={handleInputChange('latitude')}
              placeholder="31.5204"
              disabled={loading}
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Longitude"
              type="number"
              value={formData.longitude}
              onChange={handleInputChange('longitude')}
              placeholder="74.3587"
              disabled={loading}
            />
          </Grid>

          {/* Sports and Facilities */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Sports & Facilities
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Sports *</InputLabel>
              <Select
                multiple
                value={formData.sports}
                onChange={handleMultiSelectChange('sports')}
                input={<OutlinedInput label="Sports *" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} size="small" />
                    ))}
                  </Box>
                )}
                disabled={loading}
              >
                {SPORTS_OPTIONS.map((sport) => (
                  <MenuItem key={sport} value={sport}>
                    {sport}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Facilities</InputLabel>
              <Select
                multiple
                value={formData.facilities}
                onChange={handleMultiSelectChange('facilities')}
                input={<OutlinedInput label="Facilities" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} size="small" />
                    ))}
                  </Box>
                )}
                disabled={loading}
              >
                {FACILITIES_OPTIONS.map((facility) => (
                  <MenuItem key={facility} value={facility}>
                    {facility}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Images */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Images
            </Typography>
          </Grid>
          
          <Grid item xs={12}>
            <Box sx={{ mb: 2 }}>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="image-upload"
                multiple
                type="file"
                onChange={handleImageUpload}
              />
              <label htmlFor="image-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<CloudUpload />}
                  disabled={loading}
                  sx={{ mb: 2 }}
                >
                  Upload Images
                </Button>
              </label>
              
              {uploadedImages.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Uploaded Images ({uploadedImages.length})
                  </Typography>
                  <Grid container spacing={2}>
                    {uploadedImages.map((image) => (
                      <Grid item xs={6} sm={4} md={3} key={image.id}>
                        <Card variant="outlined">
                          <Box sx={{ position: 'relative' }}>
                            <img
                              src={image.preview}
                              alt={image.name}
                              style={{
                                width: '100%',
                                height: 120,
                                objectFit: 'cover'
                              }}
                            />
                            <IconButton
                              size="small"
                              sx={{
                                position: 'absolute',
                                top: 4,
                                right: 4,
                                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                '&:hover': {
                                  backgroundColor: 'rgba(255, 255, 255, 0.9)'
                                }
                              }}
                              onClick={() => handleRemoveImage(image.id)}
                            >
                              <Close fontSize="small" />
                            </IconButton>
                          </Box>
                          <CardContent sx={{ p: 1 }}>
                            <Typography variant="caption" noWrap>
                              {image.name}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}
            </Box>
          </Grid>

          {/* Pricing */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Pricing
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Base Price (PKR) *"
              type="number"
              value={formData.basePrice}
              onChange={handleInputChange('basePrice')}
              disabled={loading}
              helperText="Price per time slot"
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
              <Typography variant="body2" color="textSecondary">
                All time slots will use the same base price.
              </Typography>
            </Box>
          </Grid>

          {/* Operating Hours */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Operating Hours
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Opening Time"
              type="time"
              value={formData.openTime}
              onChange={handleInputChange('openTime')}
              InputLabelProps={{ shrink: true }}
              disabled={loading}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Closing Time"
              type="time"
              value={formData.closeTime}
              onChange={handleInputChange('closeTime')}
              InputLabelProps={{ shrink: true }}
              disabled={loading}
            />
          </Grid>

          {/* Time Slots Configuration */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Time Slots Configuration
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Slot Duration (minutes)"
              type="number"
              value={formData.slotDuration}
              onChange={handleInputChange('slotDuration')}
              disabled={loading}
              inputProps={{ min: 30, max: 180, step: 30 }}
              helperText="Duration of each time slot (30-180 minutes)"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
              <Typography variant="body2" color="textSecondary">
                Time slots will be generated automatically based on operating hours and slot duration.
              </Typography>
            </Box>
          </Grid>

          {/* Time Slots Selection */}
          {formData.availableSlots.length > 0 && (
            <Grid item xs={12}>
              <Card variant="outlined" sx={{ mt: 1 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Schedule sx={{ mr: 1 }} />
                    <Typography variant="subtitle1">
                      Time Slots Configuration
                    </Typography>
                  </Box>

                  {/* Tabs for General vs Date-Specific Slots */}
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                    Configure availability for specific dates. This allows you to set different time slots for different days.
                  </Typography>

                  {/* Date Selection */}
                  <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                    <TextField
                      type="date"
                      label="Select Date"
                      value={formData.selectedDate}
                      onChange={handleDateChange}
                      InputLabelProps={{ shrink: true }}
                      sx={{ minWidth: 200 }}
                    />
                    <Button
                      variant="outlined"
                      startIcon={<DateRange />}
                      onClick={handleAddDate}
                      size="small"
                    >
                      Add New Date
                    </Button>
                  </Box>

                  {/* Show configured dates */}
                  {Object.keys(formData.dateSpecificSlots).length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        Configured Dates:
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {Object.keys(formData.dateSpecificSlots).map((date) => (
                          <Chip
                            key={date}
                            label={new Date(date).toLocaleDateString()}
                            color={date === formData.selectedDate ? 'primary' : 'default'}
                            onClick={() => setFormData(prev => ({ ...prev, selectedDate: date }))}
                            sx={{ cursor: 'pointer' }}
                          />
                        ))}
                      </Box>
                    </Box>
                  )}

                  {/* Date-Specific Slots Grid */}
                  {formData.dateSpecificSlots[formData.selectedDate] && (
                    <Box>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        Time Slots for {new Date(formData.selectedDate).toLocaleDateString()}
                      </Typography>
                      <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
                        <Grid container spacing={1}>
                          {formData.dateSpecificSlots[formData.selectedDate].map((slot) => (
                            <Grid item xs={6} sm={4} md={3} key={slot.id}>
                              <Card
                                variant="outlined"
                                sx={{
                                  cursor: 'pointer',
                                  transition: 'all 0.2s',
                                  backgroundColor: slot.selected ? '#e3f2fd' : '#fafafa',
                                  borderColor: slot.selected ? '#2196f3' : '#e0e0e0',
                                  borderWidth: slot.selected ? 2 : 1,
                                  '&:hover': {
                                    backgroundColor: slot.selected ? '#bbdefb' : '#f0f0f0'
                                  }
                                }}
                                onClick={() => handleDateSpecificSlotToggle(slot.id, formData.selectedDate)}
                              >
                                <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                    <Checkbox
                                      checked={slot.selected}
                                      size="small"
                                      sx={{ p: 0, mr: 0.5 }}
                                      color="primary"
                                    />
                                    <Typography variant="caption" fontWeight="bold">
                                      {slot.startTime} - {slot.endTime}
                                    </Typography>
                                  </Box>
                                  
                                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                    <Typography variant="caption" fontWeight="bold" color="primary">
                                      PKR {slot.price}
                                    </Typography>
                                  </Box>
                                </CardContent>
                              </Card>
                            </Grid>
                          ))}
                        </Grid>
                      </Box>
                    </Box>
                  )}

                  {/* Add initial date slots if none exist */}
                  {!formData.dateSpecificSlots[formData.selectedDate] && (
                    <Box sx={{ textAlign: 'center', py: 3 }}>
                      <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                        No slots configured for {new Date(formData.selectedDate).toLocaleDateString()}
                      </Typography>
                      <Button
                        variant="contained"
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          dateSpecificSlots: {
                            ...prev.dateSpecificSlots,
                            [prev.selectedDate]: generateSlotsForDate(prev.selectedDate)
                          }
                        }))}
                      >
                        Configure Slots for This Date
                      </Button>
                    </Box>
                  )}
                  
                  <Typography variant="caption" color="textSecondary" sx={{ mt: 2, display: 'block' }}>
                    Click on time slots to select/deselect them. Selected slots will be available for booking.
                  </Typography>

                  {/* Summary */}
                  <Box sx={{ mt: 2, p: 1, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                    <Typography variant="body2" fontWeight="bold" gutterBottom>
                      Selection Summary:
                    </Typography>
                    <Typography variant="caption">
                      Date-Specific: {Object.keys(formData.dateSpecificSlots).length} dates configured
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? (isEditing ? 'Updating...' : 'Adding...') : (isEditing ? 'Update Venue' : 'Add Venue')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}