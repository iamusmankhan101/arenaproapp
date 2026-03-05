const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username cannot exceed 30 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false
  },
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    maxlength: [100, 'Full name cannot exceed 100 characters']
  },
  role: {
    type: String,
    enum: ['super_admin', 'admin', 'moderator', 'support'],
    default: 'admin'
  },
  permissions: [{
    type: String,
    enum: [
      'dashboard_view',
      'users_view', 'users_edit', 'users_delete',
      'venues_view', 'venues_edit', 'venues_delete', 'venues_approve',
      'bookings_view', 'bookings_edit', 'bookings_cancel',
      'challenges_view', 'challenges_moderate',
      'reports_view', 'reports_export',
      'settings_view', 'settings_edit',
      'admin_manage'
    ]
  }],
  avatar: {
    type: String,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: null
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: {
    type: Date
  },
  twoFactorAuth: {
    enabled: { type: Boolean, default: false },
    secret: { type: String, select: false },
    backupCodes: [{ type: String, select: false }]
  },
  preferences: {
    theme: { type: String, enum: ['light', 'dark'], default: 'light' },
    language: { type: String, default: 'en' },
    timezone: { type: String, default: 'Asia/Karachi' },
    notifications: {
      email: { type: Boolean, default: true },
      browser: { type: Boolean, default: true },
      newBookings: { type: Boolean, default: true },
      newVenues: { type: Boolean, default: true },
      systemAlerts: { type: Boolean, default: true }
    }
  },
  activityLog: [{
    action: String,
    resource: String,
    resourceId: String,
    details: mongoose.Schema.Types.Mixed,
    ipAddress: String,
    userAgent: String,
    timestamp: { type: Date, default: Date.now }
  }],
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
adminSchema.index({ username: 1 });
adminSchema.index({ email: 1 });
adminSchema.index({ role: 1, isActive: 1 });
adminSchema.index({ lastLogin: -1 });

// Virtual for account locked
adminSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Hash password before saving
adminSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
adminSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Update last login
adminSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date();
  this.loginAttempts = 0;
  this.lockUntil = undefined;
  return this.save({ validateBeforeSave: false });
};

// Handle failed login attempt
adminSchema.methods.handleFailedLogin = function() {
  this.loginAttempts += 1;
  
  // Lock account after 5 failed attempts for 30 minutes
  if (this.loginAttempts >= 5) {
    this.lockUntil = Date.now() + 30 * 60 * 1000; // 30 minutes
  }
  
  return this.save({ validateBeforeSave: false });
};

// Check if admin has permission
adminSchema.methods.hasPermission = function(permission) {
  if (this.role === 'super_admin') return true;
  return this.permissions.includes(permission);
};

// Add permission
adminSchema.methods.addPermission = function(permission) {
  if (!this.permissions.includes(permission)) {
    this.permissions.push(permission);
  }
  return this.save();
};

// Remove permission
adminSchema.methods.removePermission = function(permission) {
  this.permissions = this.permissions.filter(p => p !== permission);
  return this.save();
};

// Log activity
adminSchema.methods.logActivity = function(action, resource, resourceId, details, req) {
  this.activityLog.push({
    action,
    resource,
    resourceId,
    details,
    ipAddress: req?.ip || req?.connection?.remoteAddress,
    userAgent: req?.get('User-Agent'),
    timestamp: new Date()
  });
  
  // Keep only last 100 activities
  if (this.activityLog.length > 100) {
    this.activityLog = this.activityLog.slice(-100);
  }
  
  return this.save({ validateBeforeSave: false });
};

// Set default permissions based on role
adminSchema.pre('save', function(next) {
  if (this.isNew || this.isModified('role')) {
    switch (this.role) {
      case 'super_admin':
        // Super admin gets all permissions
        this.permissions = [
          'dashboard_view',
          'users_view', 'users_edit', 'users_delete',
          'venues_view', 'venues_edit', 'venues_delete', 'venues_approve',
          'bookings_view', 'bookings_edit', 'bookings_cancel',
          'challenges_view', 'challenges_moderate',
          'reports_view', 'reports_export',
          'settings_view', 'settings_edit',
          'admin_manage'
        ];
        break;
      case 'admin':
        this.permissions = [
          'dashboard_view',
          'users_view', 'users_edit',
          'venues_view', 'venues_edit', 'venues_approve',
          'bookings_view', 'bookings_edit', 'bookings_cancel',
          'challenges_view', 'challenges_moderate',
          'reports_view', 'reports_export'
        ];
        break;
      case 'moderator':
        this.permissions = [
          'dashboard_view',
          'users_view',
          'venues_view',
          'bookings_view',
          'challenges_view', 'challenges_moderate'
        ];
        break;
      case 'support':
        this.permissions = [
          'dashboard_view',
          'users_view',
          'venues_view',
          'bookings_view'
        ];
        break;
    }
  }
  next();
});

module.exports = mongoose.model('Admin', adminSchema);