const express = require('express');
const Booking = require('../models/Booking');
const { protect } = require('../middleware/auth');
const { validateObjectId, handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

// @desc    Create payment intent
// @route   POST /api/payments
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { bookingId, paymentMethod = 'cash' } = req.body;

    const booking = await Booking.findById(bookingId);
    
    if (!booking) {
      return res.status(404).json({
        status: 'error',
        message: 'Booking not found'
      });
    }

    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied'
      });
    }

    // For now, just mark as paid (implement actual payment gateway later)
    booking.paymentStatus = 'paid';
    booking.paymentMethod = paymentMethod;
    booking.paymentDetails = {
      transactionId: `TXN_${Date.now()}`,
      paymentGateway: paymentMethod,
      paidAt: new Date()
    };
    booking.status = 'confirmed';

    await booking.save();

    res.json({
      status: 'success',
      message: 'Payment processed successfully',
      data: {
        transactionId: booking.paymentDetails.transactionId,
        amount: booking.totalAmount,
        status: 'paid'
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// @desc    Verify payment
// @route   GET /api/payments/:id/verify
// @access  Private
router.get('/:id/verify', [protect, validateObjectId('id'), handleValidationErrors], async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({
        status: 'error',
        message: 'Payment not found'
      });
    }

    res.json({
      status: 'success',
      data: {
        paymentStatus: booking.paymentStatus,
        transactionId: booking.paymentDetails?.transactionId,
        amount: booking.totalAmount
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