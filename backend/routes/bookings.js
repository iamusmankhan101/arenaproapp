const express = require('express');
const Booking = require('../models/Booking');
const Turf = require('../models/Turf');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { 
  validateBookingCreation, 
  validateObjectId,
  handleValidationErrors 
} = require('../middleware/validation');

const router = express.Router();

// @desc    Get available slots for a turf on a specific date
// @route   GET /api/bookings/slots/:turfId
// @access  Public
router.get('/slots/:turfId', validateObjectId('turfId'), handleValidationErrors, async (req, res) => {
  try {
    const { turfId } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        status: 'error',
        message: 'Date is required'
      });
    }

    const turf = await Turf.findById(turfId);
    if (!turf) {
      return res.status(404).json({
        status: 'error',
        message: 'Turf not found'
      });
    }

    if (turf.status !== 'active') {
      return res.status(400).json({
        status: 'error',
        message: 'Turf is not available for booking'
      });
    }

    const slots = await turf.getAvailableSlots(new Date(date));

    res.json({
      status: 'success',
      data: slots
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private
router.post('/', [protect, validateBookingCreation, handleValidationErrors], async (req, res) => {
  try {
    const {
      turf: turfId,
      date,
      timeSlot,
      duration,
      customerDetails,
      bookingType = 'individual',
      teamDetails,
      specialRequests
    } = req.body;

    // Verify turf exists and is active
    const turf = await Turf.findById(turfId);
    if (!turf) {
      return res.status(404).json({
        status: 'error',
        message: 'Turf not found'
      });
    }

    if (turf.status !== 'active' || !turf.isBookable) {
      return res.status(400).json({
        status: 'error',
        message: 'Turf is not available for booking'
      });
    }

    // Check if slot is available
    const bookingDate = new Date(date);
    const [hours, minutes] = timeSlot.split(':');
    const bookingDateTime = new Date(bookingDate);
    bookingDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    // Check for existing bookings at the same time
    const existingBooking = await Booking.findOne({
      turf: turfId,
      date: {
        $gte: new Date(bookingDate.setHours(0, 0, 0, 0)),
        $lte: new Date(bookingDate.setHours(23, 59, 59, 999))
      },
      timeSlot,
      status: { $in: ['pending', 'confirmed'] }
    });

    if (existingBooking) {
      return res.status(400).json({
        status: 'error',
        message: 'This time slot is already booked'
      });
    }

    // Calculate total amount
    let basePrice = turf.pricing.basePrice;
    const hour = parseInt(hours);
    const timeCategory = getTimeCategory(hour);
    const priceVariation = turf.pricing.priceVariations.find(pv => pv.timeSlot === timeCategory);
    
    if (priceVariation) {
      basePrice = Math.round(basePrice * priceVariation.multiplier);
    }

    const totalAmount = basePrice * duration;

    // Create booking
    const booking = await Booking.create({
      user: req.user._id,
      turf: turfId,
      date: bookingDate,
      timeSlot,
      duration,
      totalAmount,
      customerDetails: {
        name: customerDetails.name,
        phoneNumber: customerDetails.phoneNumber,
        email: customerDetails.email || req.user.email,
        specialRequests
      },
      bookingType,
      teamDetails,
      metadata: {
        source: 'mobile_app',
        userAgent: req.get('User-Agent'),
        ipAddress: req.ip
      }
    });

    // Update user stats
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { 
        'stats.totalBookings': 1,
        'stats.totalSpent': totalAmount
      }
    });

    // Update turf stats
    await Turf.findByIdAndUpdate(turfId, {
      $inc: { 
        'stats.totalBookings': 1,
        'stats.totalRevenue': totalAmount
      }
    });

    // Populate booking details for response
    const populatedBooking = await Booking.findById(booking._id)
      .populate('turf', 'name location contact')
      .populate('user', 'fullName phoneNumber email');

    res.status(201).json({
      status: 'success',
      message: 'Booking created successfully',
      data: {
        id: populatedBooking._id,
        bookingId: populatedBooking.formattedId,
        turf: {
          id: populatedBooking.turf._id,
          name: populatedBooking.turf.name,
          address: populatedBooking.turf.location.address,
          phoneNumber: populatedBooking.turf.contact.phoneNumber
        },
        slot: {
          startTime: populatedBooking.timeSlot,
          endTime: populatedBooking.endTime,
          price: totalAmount,
          priceType: timeCategory
        },
        date: populatedBooking.date,
        status: populatedBooking.status,
        paymentStatus: populatedBooking.paymentStatus,
        totalAmount: populatedBooking.totalAmount,
        createdAt: populatedBooking.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// @desc    Get user's bookings
// @route   GET /api/bookings/user
// @access  Private
router.get('/user', protect, async (req, res) => {
  try {
    const { status, page = 0, pageSize = 20 } = req.query;

    let query = { user: req.user._id };
    
    if (status) {
      query.status = status;
    }

    const [bookings, total] = await Promise.all([
      Booking.find(query)
        .populate('turf', 'name location.area location.city sports images')
        .sort({ createdAt: -1 })
        .skip(page * pageSize)
        .limit(parseInt(pageSize)),
      Booking.countDocuments(query)
    ]);

    // Format bookings for mobile app
    const formattedBookings = bookings.map(booking => ({
      id: booking._id,
      turfName: booking.turf.name,
      turfArea: `${booking.turf.location.area}, ${booking.turf.location.city}`,
      dateTime: booking.dateTime,
      duration: booking.duration,
      slotType: getTimeCategory(parseInt(booking.timeSlot.split(':')[0])),
      totalAmount: booking.totalAmount,
      status: booking.status,
      paymentStatus: booking.paymentStatus,
      bookingId: booking.formattedId,
      sport: booking.turf.sports[0],
      teamMatch: booking.bookingType !== 'individual',
      opponentTeam: booking.teamDetails?.teamName,
      matchType: booking.teamDetails?.isChallenge ? 'Challenge Match' : 'Friendly Match',
      cancellationReason: booking.cancellation?.reason,
      rated: !!booking.review?.rating,
      canCancel: booking.canBeCancelled(),
      refundAmount: booking.calculateRefund()
    }));

    res.json({
      status: 'success',
      results: formattedBookings.length,
      data: formattedBookings,
      pagination: {
        total,
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        totalPages: Math.ceil(total / pageSize)
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// @desc    Get booking details
// @route   GET /api/bookings/:id
// @access  Private
router.get('/:id', [protect, validateObjectId('id'), handleValidationErrors], async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('turf', 'name location contact images amenities')
      .populate('user', 'fullName phoneNumber email');

    if (!booking) {
      return res.status(404).json({
        status: 'error',
        message: 'Booking not found'
      });
    }

    // Check if user owns this booking
    if (booking.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied'
      });
    }

    res.json({
      status: 'success',
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// @desc    Cancel booking
// @route   DELETE /api/bookings/:id
// @access  Private
router.delete('/:id', [protect, validateObjectId('id'), handleValidationErrors], async (req, res) => {
  try {
    const { reason } = req.body;

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        status: 'error',
        message: 'Booking not found'
      });
    }

    // Check if user owns this booking
    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied'
      });
    }

    // Check if booking can be cancelled
    if (!booking.canBeCancelled()) {
      return res.status(400).json({
        status: 'error',
        message: 'Booking cannot be cancelled. Cancellation is only allowed up to 2 hours before the booking time.'
      });
    }

    // Calculate refund amount
    const refundAmount = booking.calculateRefund();

    // Update booking
    booking.status = 'cancelled';
    booking.cancellation = {
      cancelledAt: new Date(),
      cancelledBy: req.user._id,
      reason: reason || 'Cancelled by user',
      refundAmount
    };

    if (refundAmount > 0) {
      booking.paymentStatus = 'refunded';
      booking.paymentDetails.refundedAt = new Date();
      booking.paymentDetails.refundAmount = refundAmount;
    }

    await booking.save();

    res.json({
      status: 'success',
      message: 'Booking cancelled successfully',
      data: {
        refundAmount,
        refundPercentage: Math.round((refundAmount / booking.totalAmount) * 100)
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// @desc    Add review to booking
// @route   POST /api/bookings/:id/review
// @access  Private
router.post('/:id/review', [protect, validateObjectId('id'), handleValidationErrors], async (req, res) => {
  try {
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        status: 'error',
        message: 'Rating must be between 1 and 5'
      });
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        status: 'error',
        message: 'Booking not found'
      });
    }

    // Check if user owns this booking
    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied'
      });
    }

    // Check if booking is completed
    if (booking.status !== 'completed') {
      return res.status(400).json({
        status: 'error',
        message: 'Can only review completed bookings'
      });
    }

    // Check if already reviewed
    if (booking.review?.rating) {
      return res.status(400).json({
        status: 'error',
        message: 'Booking already reviewed'
      });
    }

    // Add review
    await booking.addReview(rating, comment);

    // Update turf rating
    const turf = await Turf.findById(booking.turf);
    await turf.updateRating(rating);

    res.json({
      status: 'success',
      message: 'Review added successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Helper function
function getTimeCategory(hour) {
  if (hour >= 6 && hour < 12) return 'Morning';
  if (hour >= 12 && hour < 17) return 'Day';
  if (hour >= 17 && hour < 20) return 'Evening';
  return 'Night';
}

module.exports = router;