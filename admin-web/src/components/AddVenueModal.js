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
  IconButton,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import { CloudUpload, Close, ArrowForward, Check } from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { addVenue, updateVenue } from '../store/slices/adminSlice';

const CLOUDINARY_CLOUD_NAME = 'dykbxopqn';
const CLOUDINARY_UPLOAD_PRESET = 'venue_images';

const SPORTS_OPTIONS = ['Football', 'Cricket', 'Padel', 'Futsal', 'Basketball', 'Tennis'];
const FACILITIES_OPTIONS = [
  'Floodlights', 'Parking', 'Changing Room', 'Cafeteria', 'Equipment Rental',
  'Air Conditioning', 'Pro Shop', 'Lounge', 'Coaching', 'Practice Nets',
  'Scoreboard', 'Pavilion', 'Indoor Court'
];



export default function AddVenueModal({ open, onClose, editVenue = null, vendorId = null }) {
  const dispatch = useDispatch();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadedImages, setUploadedImages] = useState([]);
  const isEditing = Boolean(editVenue);

  const steps = ['Venue Details', 'Sports & Location', 'Pricing & Media'];

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
    openTime: '00:00',
    closeTime: '00:00',
    images: [],
    slotDuration: '60', // minutes
    availableSlots: [], // All possible slots based on operating hours
    // Date-related fields
    selectedDate: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
    dateSpecificSlots: {}, // Object to store slots for different dates
    contactPhone: '', // Owner/Contact phone number
    discountPercentage: '0' // Venue-wide discount percentage
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
        availableSlots: Array.isArray(editVenue.timeSlots) ? editVenue.timeSlots.map(slot => ({
          ...slot,
          // Ensure both time and startTime fields exist for compatibility
          time: slot.time || slot.startTime,
          startTime: slot.startTime || slot.time,
          selected: slot.selected !== false // Default to selected unless explicitly false
        })) : [],
        selectedDate: new Date().toISOString().split('T')[0],
        dateSpecificSlots: editVenue.dateSpecificSlots || {},
        contactPhone: editVenue.contactPhone || editVenue.contact?.phoneNumber || '',
        discountPercentage: (editVenue.discountPercentage || 0).toString()
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
        openTime: '00:00',
        closeTime: '00:00',
        images: [],
        slotDuration: '60',
        availableSlots: [],
        selectedDate: new Date().toISOString().split('T')[0],
        dateSpecificSlots: {},
        contactPhone: '',
        discountPercentage: '0'
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
    if (formData.openTime === undefined || formData.closeTime === undefined) return [];

    const slots = [];
    const startHour = parseInt(formData.openTime.split(':')[0]);
    const startMinute = parseInt(formData.openTime.split(':')[1]);
    const endHour = parseInt(formData.closeTime.split(':')[0]);
    const endMinute = parseInt(formData.closeTime.split(':')[1]);
    const duration = parseInt(formData.slotDuration);

    // Convert to minutes for easier calculation
    const startTotalMinutes = startHour * 60 + startMinute;
    let endTotalMinutes = endHour * 60 + endMinute;

    // If end <= start, it wraps past midnight (e.g. 8 PM to 2 AM, or 12 AM to 12 AM)
    // Add 24 hours to the end so slots continue past midnight
    if (endTotalMinutes <= startTotalMinutes) {
      endTotalMinutes += 24 * 60; // e.g. 2 AM becomes 26:00 (1560 min)
    }

    for (let minutes = startTotalMinutes; minutes < endTotalMinutes; minutes += duration) {
      const slotStartHour = Math.floor(minutes / 60) % 24;
      const slotStartMinute = minutes % 60;
      const slotEndMinutes = minutes + duration;
      const slotEndHour = Math.floor(slotEndMinutes / 60) % 24;
      const slotEndMinute = slotEndMinutes % 60;

      // Skip if end time exceeds closing time
      if (slotEndMinutes > endTotalMinutes) break;

      const startTime = `${slotStartHour.toString().padStart(2, '0')}:${slotStartMinute.toString().padStart(2, '0')}`;
      const endTime = `${slotEndHour.toString().padStart(2, '0')}:${slotEndMinute.toString().padStart(2, '0')}`;

      const slotId = `slot-${slotStartHour}-${slotStartMinute}`;
      const basePrice = parseFloat(formData.basePrice) || 1000;

      slots.push({
        id: slotId,
        startTime,
        endTime,
        price: basePrice,
        available: true,
        selected: true
      });
    }

    return slots;
  }, [formData.openTime, formData.closeTime, formData.basePrice, formData.slotDuration]);

  // Update available slots when operating hours or pricing changes
  useEffect(() => {
    const allSlots = generateAllPossibleSlots();
    setFormData(prev => ({
      ...prev,
      availableSlots: allSlots
    }));
  }, [generateAllPossibleSlots]);

  // Auto-regenerate ALL date-specific slots when operating hours or duration change
  useEffect(() => {
    setFormData(prev => {
      const existingDates = Object.keys(prev.dateSpecificSlots);
      if (existingDates.length === 0) return prev;

      const newSlots = generateAllPossibleSlots();
      const updatedDateSlots = {};

      existingDates.forEach(date => {
        const oldDateSlots = prev.dateSpecificSlots[date];
        // Map old selection state by time range
        const oldSelectionMap = {};
        oldDateSlots.forEach(s => {
          oldSelectionMap[`${s.startTime}-${s.endTime}`] = s.selected;
        });

        // Regenerate slots for this date, preserving selection where possible
        updatedDateSlots[date] = newSlots.map(slot => ({
          ...slot,
          id: `${date}-${slot.id}`,
          date: date,
          selected: oldSelectionMap[`${slot.startTime}-${slot.endTime}`] !== undefined
            ? oldSelectionMap[`${slot.startTime}-${slot.endTime}`]
            : true
        }));
      });

      return {
        ...prev,
        dateSpecificSlots: updatedDateSlots
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.openTime, formData.closeTime, formData.slotDuration]);







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

    // Check if at least one date-specific slot is selected
    const hasSelectedSlots = Object.values(formData.dateSpecificSlots).some(dateSlots =>
      dateSlots.some(slot => slot.selected)
    );

    if (!hasSelectedSlots) {
      setError('Please configure and select at least one time slot for at least one date');
      return;
    }

    setLoading(true);

    try {
      // Prepare venue data with date-specific slots only
      let dateSpecificAvailability = {};

      // Require date-specific slots to be configured
      if (Object.keys(formData.dateSpecificSlots).length > 0) {
        Object.keys(formData.dateSpecificSlots).forEach(date => {
          dateSpecificAvailability[date] = formData.dateSpecificSlots[date].filter(slot => slot.selected);
        });
      }

      // Upload images to Cloudinary and get download URLs
      const imageUrls = [];
      for (const img of formData.images) {
        try {
          if (img.file) {
            // New image — upload to Cloudinary
            const cloudFormData = new FormData();
            cloudFormData.append('file', img.file);
            cloudFormData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
            const res = await fetch(
              `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
              { method: 'POST', body: cloudFormData }
            );
            const data = await res.json();
            if (data.secure_url) {
              imageUrls.push(data.secure_url);
            } else {
              console.warn('⚠️ Cloudinary upload returned no URL:', data);
            }
          } else if (typeof img === 'string') {
            imageUrls.push(img);
          } else if (img.preview && img.existing) {
            imageUrls.push(img.preview);
          }
        } catch (uploadErr) {
          console.warn('⚠️ Image upload failed:', uploadErr.message);
        }
      }

      // Convert string numbers to actual numbers
      const venueData = {
        ...formData,
        basePrice: parseFloat(formData.basePrice),
        latitude: formData.latitude ? parseFloat(formData.latitude) : 31.5204,
        longitude: formData.longitude ? parseFloat(formData.longitude) : 74.3587,
        // Use uploaded image URLs instead of File objects
        images: imageUrls,
        // Remove basic time slots - only use date-specific slots
        dateSpecificSlots: dateSpecificAvailability,
        // Include discount percentage
        discountPercentage: parseFloat(formData.discountPercentage) || 0,
        // Include vendorId if creating new provided via props, or preserve existing if editing
        vendorId: isEditing ? editVenue.vendorId : (vendorId || null)
      };

      console.log('🔄 Submitting venue data:', {
        name: venueData.name,
        availableSlots: venueData.availableSlots?.length || 0,
        isEditing: isEditing,
        vendorId: venueData.vendorId
      });

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
        openTime: '00:00',
        closeTime: '00:00',
        images: [],
        slotDuration: '60',
        availableSlots: [],
        // Reset date-related fields
        selectedDate: new Date().toISOString().split('T')[0],
        dateSpecificSlots: {},
        contactPhone: '',
        discountPercentage: '0'
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
      setActiveStep(0);
      onClose();
    }
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ color: '#004d43', fontWeight: 600, mb: 1 }}>
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
                variant="outlined"
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
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Owner Phone Number *"
                value={formData.contactPhone}
                onChange={handleInputChange('contactPhone')}
                placeholder="e.g., 03001234567"
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="City *"
                value={formData.city}
                onChange={handleInputChange('city')}
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
          </Grid>
        );
      case 1:
        return (
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ color: '#004d43', fontWeight: 600, mb: 1 }}>
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
                        <Chip key={value} label={value} size="small" sx={{ bgcolor: '#e0f2f1', color: '#004d43' }} />
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

            <Grid item xs={12}>
              <Typography variant="h6" sx={{ color: '#004d43', fontWeight: 600, mt: 2, mb: 1 }}>
                Map Location
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
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
            <Grid item xs={12} md={6}>
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
          </Grid>
        );
      case 2:
        return (
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ color: '#004d43', fontWeight: 600, mb: 1 }}>
                Pricing & Hours
              </Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Base Price (PKR) *"
                type="number"
                value={formData.basePrice}
                onChange={handleInputChange('basePrice')}
                disabled={loading}
                helperText="Price per slot"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Discount (%)"
                type="number"
                value={formData.discountPercentage}
                onChange={handleInputChange('discountPercentage')}
                disabled={loading}
                helperText="Percentage off"
                inputProps={{ min: 0, max: 100 }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Opening Time"
                type="time"
                value={formData.openTime}
                onChange={handleInputChange('openTime')}
                disabled={loading}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Closing Time"
                type="time"
                value={formData.closeTime}
                onChange={handleInputChange('closeTime')}
                disabled={loading}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ color: '#004d43', fontWeight: 600, mt: 2, mb: 1 }}>
                Venue Images
              </Typography>
              <Box sx={{ mb: 2, border: '1px dashed #bdbdbd', borderRadius: 2, p: 3, textAlign: 'center', bgcolor: '#fafafa' }}>
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
                    variant="contained"
                    component="span"
                    startIcon={<CloudUpload />}
                    disabled={loading}
                    sx={{ bgcolor: '#004d43', '&:hover': { bgcolor: '#00695c' } }}
                  >
                    Upload Images
                  </Button>
                </label>
                <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
                  Supported formats: JPG, PNG. Max size: 5MB
                </Typography>
              </Box>

              {uploadedImages.length > 0 && (
                <Grid container spacing={2}>
                  {uploadedImages.map((image) => (
                    <Grid item xs={6} sm={4} md={3} key={image.id}>
                      <Card variant="outlined" sx={{ position: 'relative', overflow: 'visible' }}>
                        <img
                          src={image.preview}
                          alt={image.name}
                          style={{
                            width: '100%',
                            height: 100,
                            objectFit: 'cover',
                            borderRadius: 4
                          }}
                        />
                        <IconButton
                          size="small"
                          sx={{
                            position: 'absolute',
                            top: -8,
                            right: -8,
                            bgcolor: 'white',
                            border: '1px solid #eee',
                            '&:hover': { bgcolor: '#f5f5f5' }
                          }}
                          onClick={() => handleRemoveImage(image.id)}
                        >
                          <Close fontSize="small" color="error" />
                        </IconButton>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Grid>
          </Grid>
        );
      default:
        return 'Unknown step';
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3, p: 1 } }}>
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#004d43' }}>
          {isEditing ? 'Edit Venue' : 'Agent Registration'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {isEditing ? 'Update venue details below.' : 'Please fill in the details to register a new venue.'}
        </Typography>
      </DialogTitle>

      <Box sx={{ px: 3, pt: 1 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label} sx={{ '& .MuiStepLabel-root .Mui-active': { color: '#004d43' }, '& .MuiStepLabel-root .Mui-completed': { color: '#004d43' } }}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      <DialogContent sx={{ minHeight: 400, pt: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {renderStepContent(activeStep)}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2, justifyContent: 'space-between' }}>
        <Button
          disabled={activeStep === 0}
          onClick={handleBack}
          variant="outlined"
          sx={{ color: '#004d43', borderColor: '#004d43' }}
        >
          Back
        </Button>
        <Box>
          <Button onClick={handleClose} sx={{ mr: 1, color: 'text.secondary' }}>
            Cancel
          </Button>
          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Check />}
              sx={{ bgcolor: '#004d43', '&:hover': { bgcolor: '#00695c' } }}
            >
              {isEditing ? 'Update Venue' : 'Register Venue'}
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
              endIcon={<ArrowForward />}
              sx={{ bgcolor: '#004d43', '&:hover': { bgcolor: '#00695c' } }}
            >
              Continue
            </Button>
          )}
        </Box>
      </DialogActions>
    </Dialog>
  );
}
