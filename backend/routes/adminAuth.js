const express = require('express');
const Admin = require('../models/Admin');
const { adminProtect, generateAdminTokens } = require('../middleware/auth');
const { validateAdminLogin, handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

// @desc    Admin login
// @route   POST /api/admin/auth/login
// @access  Public
router.post('/login', validateAdminLogin, handleValidationErrors, async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if admin exists and get password
    const admin = await Admin.findOne({ 
      $or: [{ username }, { email: username }] 
    }).select('+password');

    if (!admin) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials'
      });
    }

    // Check if admin is active
    if (!admin.isActive) {
      return res.status(401).json({
        status: 'error',
        message: 'Admin account is deactivated'
      });
    }

    // Check if admin is locked
    if (admin.isLocked) {
      return res.status(401).json({
        status: 'error',
        message: 'Admin account is temporarily locked due to multiple failed login attempts'
      });
    }

    // Check password
    const isPasswordValid = await admin.comparePassword(password);
    if (!isPasswordValid) {
      // Handle failed login attempt
      await admin.handleFailedLogin();
      
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials'
      });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateAdminTokens(admin._id);

    // Save refresh token and update last login
    admin.refreshToken = refreshToken;
    await admin.updateLastLogin();

    // Log login activity
    await admin.logActivity('login', 'admin', admin._id, { success: true }, req);

    res.json({
      status: 'success',
      message: 'Admin login successful',
      data: {
        admin: {
          id: admin._id,
          username: admin.username,
          email: admin.email,
          fullName: admin.fullName,
          role: admin.role,
          permissions: admin.permissions,
          lastLogin: admin.lastLogin,
          preferences: admin.preferences
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

// @desc    Get current admin
// @route   GET /api/admin/auth/me
// @access  Private (Admin)
router.get('/me', adminProtect, async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id).select('-refreshToken');

    res.json({
      status: 'success',
      data: {
        admin
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// @desc    Update admin profile
// @route   PUT /api/admin/auth/profile
// @access  Private (Admin)
router.put('/profile', adminProtect, async (req, res) => {
  try {
    const { fullName, email, preferences } = req.body;

    const updateData = {};
    if (fullName) updateData.fullName = fullName;
    if (email) updateData.email = email;
    if (preferences) updateData.preferences = { ...req.admin.preferences, ...preferences };

    const admin = await Admin.findByIdAndUpdate(
      req.admin.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-refreshToken');

    // Log activity
    await admin.logActivity('profile_update', 'admin', admin._id, updateData, req);

    res.json({
      status: 'success',
      message: 'Admin profile updated successfully',
      data: {
        admin
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// @desc    Change admin password
// @route   PUT /api/admin/auth/change-password
// @access  Private (Admin)
router.put('/change-password', adminProtect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        status: 'error',
        message: 'Current password and new password are required'
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        status: 'error',
        message: 'New password must be at least 8 characters long'
      });
    }

    // Get admin with password
    const admin = await Admin.findById(req.admin.id).select('+password');

    // Check current password
    const isCurrentPasswordValid = await admin.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        status: 'error',
        message: 'Current password is incorrect'
      });
    }

    // Update password
    admin.password = newPassword;
    await admin.save();

    // Log activity
    await admin.logActivity('password_change', 'admin', admin._id, {}, req);

    res.json({
      status: 'success',
      message: 'Admin password changed successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// @desc    Admin logout
// @route   POST /api/admin/auth/logout
// @access  Private (Admin)
router.post('/logout', adminProtect, async (req, res) => {
  try {
    // Clear refresh token
    await Admin.findByIdAndUpdate(req.admin.id, {
      $unset: { refreshToken: 1 }
    });

    // Log activity
    await req.admin.logActivity('logout', 'admin', req.admin._id, {}, req);

    res.json({
      status: 'success',
      message: 'Admin logged out successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// @desc    Get admin activity log
// @route   GET /api/admin/auth/activity
// @access  Private (Admin)
router.get('/activity', adminProtect, async (req, res) => {
  try {
    const { page = 0, pageSize = 20 } = req.query;
    
    const admin = await Admin.findById(req.admin.id).select('activityLog');
    
    const activities = admin.activityLog
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(page * pageSize, (page + 1) * pageSize);

    res.json({
      status: 'success',
      data: {
        activities,
        total: admin.activityLog.length,
        page: parseInt(page),
        pageSize: parseInt(pageSize)
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

module.exports = router;