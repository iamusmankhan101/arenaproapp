const { body, param, query, validationResult } = require('express-validator');

// Handle validation errors
exports.handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  
  next();
};

// User validation rules
exports.validateUserRegistration = [
  body('fullName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),
  
  body('phoneNumber')
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Please enter a valid phone number'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email address')
];

exports.validateUserLogin = [
  body('phoneNumber')
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Please enter a valid phone number'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Admin validation rules
exports.validateAdminLogin = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Turf validation rules
exports.validateTurfCreation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Turf name must be between 2 and 100 characters'),
  
  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  
  body('location.address')
    .trim()
    .notEmpty()
    .withMessage('Address is required'),
  
  body('location.area')
    .trim()
    .notEmpty()
    .withMessage('Area is required'),
  
  body('location.city')
    .trim()
    .notEmpty()
    .withMessage('City is required'),
  
  body('location.coordinates')
    .isArray({ min: 2, max: 2 })
    .withMessage('Coordinates must be an array of [longitude, latitude]'),
  
  body('sports')
    .isArray({ min: 1 })
    .withMessage('At least one sport must be selected'),
  
  body('pricing.basePrice')
    .isFloat({ min: 0 })
    .withMessage('Base price must be a positive number'),
  
  body('contact.phoneNumber')
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Please enter a valid contact phone number')
];

// Booking validation rules
exports.validateBookingCreation = [
  body('turf')
    .isMongoId()
    .withMessage('Valid turf ID is required'),
  
  body('date')
    .isISO8601()
    .withMessage('Valid date is required'),
  
  body('timeSlot')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Valid time slot is required (HH:MM format)'),
  
  body('duration')
    .isFloat({ min: 0.5, max: 8 })
    .withMessage('Duration must be between 0.5 and 8 hours'),
  
  body('customerDetails.name')
    .trim()
    .notEmpty()
    .withMessage('Customer name is required'),
  
  body('customerDetails.phoneNumber')
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Valid customer phone number is required')
];

// Challenge validation rules
exports.validateChallengeCreation = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Challenge title must be between 5 and 100 characters'),
  
  body('sport')
    .isIn(['Football', 'Cricket', 'Padel', 'Futsal', 'Tennis', 'Badminton'])
    .withMessage('Valid sport is required'),
  
  body('proposedDateTime')
    .isISO8601()
    .withMessage('Valid proposed date and time is required'),
  
  body('maxGroundFee')
    .isFloat({ min: 0 })
    .withMessage('Maximum ground fee must be a positive number'),
  
  body('maxParticipants')
    .isInt({ min: 2, max: 32 })
    .withMessage('Maximum participants must be between 2 and 32')
];

// Query parameter validation
exports.validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Page must be a non-negative integer'),
  
  query('pageSize')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Page size must be between 1 and 100')
];

exports.validateNearbyTurfs = [
  query('lat')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Valid latitude is required'),
  
  query('lng')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Valid longitude is required'),
  
  query('radius')
    .optional()
    .isFloat({ min: 0.1, max: 100 })
    .withMessage('Radius must be between 0.1 and 100 km')
];

// MongoDB ObjectId validation
exports.validateObjectId = (paramName) => [
  param(paramName)
    .isMongoId()
    .withMessage(`Valid ${paramName} is required`)
];