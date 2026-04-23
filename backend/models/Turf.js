const mongoose = require('mongoose');

const turfSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Turf name is required'],
    trim: true,
    maxlength: [100, 'Turf name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  location: {
    address: {
      type: String,
      required: [true, 'Address is required']
    },
    area: {
      type: String,
      required: [true, 'Area is required']
    },
    city: {
      type: String,
      required: [true, 'City is required']
    },
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true
      }
    }
  },
  sports: [{
    type: String,
    enum: ['Football', 'Cricket', 'Padel', 'Futsal', 'Tennis', 'Badminton'],
    required: true
  }],
  images: [{
    url: { type: String, required: true },
    caption: { type: String, default: '' },
    isPrimary: { type: Boolean, default: false }
  }],
  facilities: [{
    name: {
      type: String,
      required: true
    },
    icon: {
      type: String,
      default: 'check-circle'
    },
    available: {
      type: Boolean,
      default: true
    }
  }],
  pricing: {
    basePrice: {
      type: Number,
      required: [true, 'Base price is required'],
      min: [0, 'Price cannot be negative']
    },
    currency: {
      type: String,
      default: 'PKR'
    },
    priceVariations: [{
      timeSlot: {
        type: String,
        enum: ['morning', 'afternoon', 'evening', 'night'],
        required: true
      },
      multiplier: {
        type: Number,
        default: 1,
        min: [0.1, 'Multiplier must be at least 0.1']
      }
    }]
  },
  operatingHours: {
    monday: { open: String, close: String, closed: { type: Boolean, default: false } },
    tuesday: { open: String, close: String, closed: { type: Boolean, default: false } },
    wednesday: { open: String, close: String, closed: { type: Boolean, default: false } },
    thursday: { open: String, close: String, closed: { type: Boolean, default: false } },
    friday: { open: String, close: String, closed: { type: Boolean, default: false } },
    saturday: { open: String, close: String, closed: { type: Boolean, default: false } },
    sunday: { open: String, close: String, closed: { type: Boolean, default: false } }
  },
  specifications: {
    surfaceType: {
      type: String,
      enum: ['Natural Grass', 'Artificial Turf', 'Concrete', 'Indoor Court', 'Clay'],
      required: true
    },
    size: {
      type: String,
      enum: ['Small', 'Standard', 'Large', 'Full Size'],
      required: true
    },
    capacity: {
      type: Number,
      min: [2, 'Capacity must be at least 2 players']
    }
  },
  amenities: {
    hasFloodlights: { type: Boolean, default: false },
    hasGenerator: { type: Boolean, default: false },
    hasParking: { type: Boolean, default: false },
    hasChangingRoom: { type: Boolean, default: false },
    hasCafeteria: { type: Boolean, default: false },
    hasFirstAid: { type: Boolean, default: false },
    hasWifi: { type: Boolean, default: false }
  },
  contact: {
    phoneNumber: {
      type: String,
      required: [true, 'Contact phone number is required']
    },
    email: {
      type: String,
      lowercase: true
    },
    whatsapp: {
      type: String
    }
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'maintenance', 'pending_approval'],
    default: 'pending_approval'
  },
  isBookable: {
    type: Boolean,
    default: true
  },
  rating: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0 }
  },
  stats: {
    totalBookings: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    averageBookingDuration: { type: Number, default: 0 }
  },
  policies: {
    cancellationPolicy: {
      type: String,
      default: 'Free cancellation up to 2 hours before booking time'
    },
    advanceBookingDays: {
      type: Number,
      default: 30,
      min: 1
    },
    minimumBookingDuration: {
      type: Number,
      default: 1, // hours
      min: 0.5
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
turfSchema.index({ 'location.coordinates': '2dsphere' });
turfSchema.index({ 'location.city': 1, 'location.area': 1 });
turfSchema.index({ sports: 1 });
turfSchema.index({ status: 1 });
turfSchema.index({ 'rating.average': -1 });
turfSchema.index({ createdAt: -1 });

// Virtual for bookings
turfSchema.virtual('bookings', {
  ref: 'Booking',
  localField: '_id',
  foreignField: 'turf'
});

// Virtual for reviews
turfSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'turf'
});

// Method to get available time slots for a date
turfSchema.methods.getAvailableSlots = async function(date) {
  const Booking = mongoose.model('Booking');
  
  // Get existing bookings for the date
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  const existingBookings = await Booking.find({
    turf: this._id,
    date: {
      $gte: startOfDay,
      $lte: endOfDay
    },
    status: { $in: ['confirmed', 'pending'] }
  });
  
  // Generate time slots based on operating hours
  const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][date.getDay()];
  const hours = this.operatingHours[dayOfWeek];
  
  if (hours.closed) return [];
  
  const slots = [];
  const openTime = parseInt(hours.open.split(':')[0]);
  const closeTime = parseInt(hours.close.split(':')[0]);
  
  for (let hour = openTime; hour < closeTime; hour++) {
    const timeSlot = `${hour.toString().padStart(2, '0')}:00`;
    const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`;
    
    // Check if slot is booked
    const isBooked = existingBookings.some(booking => {
      const bookingHour = booking.timeSlot.split(':')[0];
      return parseInt(bookingHour) === hour;
    });
    
    // Calculate price based on time slot
    let price = this.pricing.basePrice;
    const timeCategory = this.getTimeCategory(hour);
    const priceVariation = this.pricing.priceVariations.find(pv => pv.timeSlot === timeCategory);
    if (priceVariation) {
      price = Math.round(price * priceVariation.multiplier);
    }
    
    slots.push({
      id: `${this._id}_${hour}`,
      time: timeSlot,
      endTime: endTime,
      price: price,
      available: !isBooked
    });
  }
  
  return slots;
};

// Method to get time category
turfSchema.methods.getTimeCategory = function(hour) {
  if (hour >= 6 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
};

// Method to update rating
turfSchema.methods.updateRating = async function(newRating) {
  const totalRating = (this.rating.average * this.rating.count) + newRating;
  this.rating.count += 1;
  this.rating.average = totalRating / this.rating.count;
  return this.save();
};

module.exports = mongoose.model('Turf', turfSchema);