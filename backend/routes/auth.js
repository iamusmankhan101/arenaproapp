const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { protect, generateUserTokens } = require('../middleware/auth');
const { 
  validateUserRegistration, 
  validateUserLogin, 
  handleValidationErrors 
} = require('../middleware/validation');

const router = express.Router();

// @desc    Register user
// @route   POST /api/auth/signup
// @access  Public
router.post('/signup', validateUserRegistration, handleValidationErrors, async (req, res) => {
  try {
    const { fullName, phoneNumber, password, email } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ phoneNumber });
    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'User with this phone number already exists'
      });
    }

    // Create user
    const user = await User.create({
      fullName,
      phoneNumber,
      password,
      email
    });

    // Generate tokens
    const { accessToken, refreshToken } = generateUserTokens(user._id);

    // Save refresh token
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    // Update last login
    await user.updateLastLogin();

    res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      data: {
        user: {
          id: user._id,
          fullName: user.fullName,
          phoneNumber: user.phoneNumber,
          email: user.email,
          isVerified: user.isVerified,
          role: user.role
        },
        tokens: {
          accessToken,
          refreshToken
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// @desc    Login user
// @route   POST /api/auth/signin
// @access  Public
router.post('/signin', validateUserLogin, handleValidationErrors, async (req, res) => {
  try {
    const { phoneNumber, password } = req.body;

    // Check if user exists and get password
    const user = await User.findOne({ phoneNumber }).select('+password');
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid phone number or password'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        status: 'error',
        message: 'Account is deactivated. Please contact support.'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid phone number or password'
      });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateUserTokens(user._id);

    // Save refresh token
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    // Update last login
    await user.updateLastLogin();

    res.json({
      status: 'success',
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          fullName: user.fullName,
          phoneNumber: user.phoneNumber,
          email: user.email,
          isVerified: user.isVerified,
          role: user.role,
          lastLogin: user.lastLogin
        },
        tokens: {
          accessToken,
          refreshToken
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('preferences.favoriteVenues', 'name location.area location.city')
      .select('-refreshToken');

    res.json({
      status: 'success',
      data: {
        user
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
  try {
    const { fullName, email, preferences } = req.body;

    const updateData = {};
    if (fullName) updateData.fullName = fullName;
    if (email) updateData.email = email;
    if (preferences) updateData.preferences = { ...req.user.preferences, ...preferences };

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-refreshToken');

    res.json({
      status: 'success',
      message: 'Profile updated successfully',
      data: {
        user
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
router.put('/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        status: 'error',
        message: 'Current password and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        status: 'error',
        message: 'New password must be at least 6 characters long'
      });
    }

    // Get user with password
    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        status: 'error',
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      status: 'success',
      message: 'Password changed successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
router.post('/logout', protect, async (req, res) => {
  try {
    // Clear refresh token
    await User.findByIdAndUpdate(req.user.id, {
      $unset: { refreshToken: 1 }
    });

    res.json({
      status: 'success',
      message: 'Logged out successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// @desc    Verify token
// @route   GET /api/auth/verify-token
// @access  Private
router.get('/verify-token', protect, (req, res) => {
  res.json({
    status: 'success',
    message: 'Token is valid',
    data: {
      user: {
        id: req.user._id,
        fullName: req.user.fullName,
        phoneNumber: req.user.phoneNumber,
        email: req.user.email,
        role: req.user.role
      }
    }
  });
});

module.exports = router;