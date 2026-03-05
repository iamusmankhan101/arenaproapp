const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    maxlength: [100, 'Full name cannot exceed 100 characters']
  },
  phoneNumber: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    match: [/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number']
  },
  email: {
    type: String,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  avatar: {
    type: String,
    default: null
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  role: {
    type: String,
    enum: ['user', 'venue_owner'],
    default: 'user'
  },
  preferences: {
    favoriteVenues: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Turf'
    }],
    favoriteSports: [{
      type: String,
      enum: ['Football', 'Cricket', 'Padel', 'Futsal', 'Tennis', 'Badminton']
    }],
    notifications: {
      bookingReminders: { type: Boolean, default: true },
      challengeInvites: { type: Boolean, default: true },
      promotions: { type: Boolean, default: false }
    }
  },
  stats: {
    totalBookings: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    favoriteVenueType: { type: String, default: null }
  },
  lastLogin: {
    type: Date,
    default: null
  },
  refreshToken: {
    type: String,
    select: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
userSchema.index({ phoneNumber: 1 });
userSchema.index({ email: 1 });
userSchema.index({ createdAt: -1 });

// Virtual for user's bookings
userSchema.virtual('bookings', {
  ref: 'Booking',
  localField: '_id',
  foreignField: 'user'
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Update last login
userSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date();
  return this.save({ validateBeforeSave: false });
};

// Add to favorites
userSchema.methods.addToFavorites = function(venueId) {
  if (!this.preferences.favoriteVenues.includes(venueId)) {
    this.preferences.favoriteVenues.push(venueId);
  }
  return this.save();
};

// Remove from favorites
userSchema.methods.removeFromFavorites = function(venueId) {
  this.preferences.favoriteVenues = this.preferences.favoriteVenues.filter(
    id => id.toString() !== venueId.toString()
  );
  return this.save();
};

module.exports = mongoose.model('User', userSchema);