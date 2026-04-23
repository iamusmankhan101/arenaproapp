const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  bookingId: {
    type: String,
    unique: true,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  turf: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Turf',
    required: true
  },
  date: {
    type: Date,
    required: [true, 'Booking date is required']
  },
  timeSlot: {
    type: String,
    required: [true, 'Time slot is required'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format']
  },
  duration: {
    type: Number,
    required: [true, 'Duration is required'],
    min: [0.5, 'Minimum duration is 30 minutes'],
    max: [8, 'Maximum duration is 8 hours']
  },
  totalAmount: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed', 'no_show'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded', 'partial_refund'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'online', 'wallet'],
    default: 'cash'
  },
  paymentDetails: {
    transactionId: String,
    paymentGateway: String,
    paidAt: Date,
    refundedAt: Date,
    refundAmount: Number
  },
  customerDetails: {
    name: {
      type: String,
      required: true
    },
    phoneNumber: {
      type: String,
      required: true
    },
    email: String,
    specialRequests: String
  },
  bookingType: {
    type: String,
    enum: ['individual', 'team', 'tournament', 'training'],
    default: 'individual'
  },
  teamDetails: {
    teamName: String,
    numberOfPlayers: Number,
    isChallenge: { type: Boolean, default: false },
    challengeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Challenge'
    }
  },
  cancellation: {
    cancelledAt: Date,
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: String,
    refundAmount: Number
  },
  review: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    reviewedAt: Date
  },
  notifications: {
    reminderSent: { type: Boolean, default: false },
    confirmationSent: { type: Boolean, default: false },
    cancellationSent: { type: Boolean, default: false }
  },
  metadata: {
    source: {
      type: String,
      enum: ['mobile_app', 'web_app', 'admin_panel', 'phone_call'],
      default: 'mobile_app'
    },
    userAgent: String,
    ipAddress: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
bookingSchema.index({ user: 1, createdAt: -1 });
bookingSchema.index({ turf: 1, date: 1 });
bookingSchema.index({ bookingId: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ date: 1, timeSlot: 1 });
bookingSchema.index({ paymentStatus: 1 });

// Virtual for formatted booking ID
bookingSchema.virtual('formattedId').get(function() {
  return `PIT${this.bookingId}`;
});

// Virtual for booking datetime
bookingSchema.virtual('dateTime').get(function() {
  const [hours, minutes] = this.timeSlot.split(':');
  const bookingDateTime = new Date(this.date);
  bookingDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
  return bookingDateTime;
});

// Virtual for end time
bookingSchema.virtual('endTime').get(function() {
  const [hours, minutes] = this.timeSlot.split(':');
  const endDateTime = new Date(this.date);
  endDateTime.setHours(parseInt(hours) + this.duration, parseInt(minutes), 0, 0);
  return endDateTime;
});

// Pre-save middleware to generate booking ID
bookingSchema.pre('save', async function(next) {
  if (!this.bookingId) {
    const count = await mongoose.model('Booking').countDocuments();
    this.bookingId = String(count + 1001).padStart(6, '0');
  }
  next();
});

// Method to check if booking can be cancelled
bookingSchema.methods.canBeCancelled = function() {
  if (this.status !== 'confirmed' && this.status !== 'pending') {
    return false;
  }
  
  const now = new Date();
  const bookingTime = this.dateTime;
  const hoursUntilBooking = (bookingTime - now) / (1000 * 60 * 60);
  
  return hoursUntilBooking >= 2; // Can cancel up to 2 hours before
};

// Method to calculate refund amount
bookingSchema.methods.calculateRefund = function() {
  if (!this.canBeCancelled()) {
    return 0;
  }
  
  const now = new Date();
  const bookingTime = this.dateTime;
  const hoursUntilBooking = (bookingTime - now) / (1000 * 60 * 60);
  
  if (hoursUntilBooking >= 24) {
    return this.totalAmount; // Full refund
  } else if (hoursUntilBooking >= 12) {
    return this.totalAmount * 0.8; // 80% refund
  } else if (hoursUntilBooking >= 2) {
    return this.totalAmount * 0.5; // 50% refund
  }
  
  return 0;
};

// Method to mark as completed
bookingSchema.methods.markCompleted = function() {
  this.status = 'completed';
  return this.save();
};

// Method to add review
bookingSchema.methods.addReview = function(rating, comment) {
  this.review = {
    rating,
    comment,
    reviewedAt: new Date()
  };
  return this.save();
};

module.exports = mongoose.model('Booking', bookingSchema);