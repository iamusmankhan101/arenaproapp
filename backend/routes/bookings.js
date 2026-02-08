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
const sendEmail = require('../utils/sendEmail');

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

    // --- SEND EMAIL CONFIRMATION ---
    try {
      const emailParams = {
        email: customerDetails.email || req.user.email,
        subject: `Booking Confirmed - ${populatedBooking.turf.name}`,
        message: `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Booking Confirmed</title>
<style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #004d43 0%, #00695c 100%); color: #ffffff; padding: 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 600; letter-spacing: 1px; }
    .content { padding: 30px; color: #333333; line-height: 1.6; }
    .greeting { font-size: 18px; margin-bottom: 20px; color: #004d43; font-weight: 600; }
    .card { background-color: #f8f9fa; border: 1px solid #e9ecef; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .detail-row { display: flex; justify-content: space-between; margin-bottom: 12px; border-bottom: 1px solid #eee; padding-bottom: 8px; }
    .detail-row:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
    .label { font-weight: 600; color: #666; font-size: 14px; }
    .value { font-weight: 500; color: #333; font-size: 15px; text-align: right; }
    .footer { background-color: #f1f3f5; padding: 20px; text-align: center; font-size: 12px; color: #888; }
    .button { display: inline-block; background-color: #004d43; color: #ffffff; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: 600; margin-top: 20px; }
    @media only screen and (max-width: 600px) {
        .container { margin: 0; border-radius: 0; }
        .content { padding: 20px; }
    }
</style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <h1>Booking Confirmed! ✅</h1>
        </div>

        <!-- Content -->
        <div class="content">
            <p class="greeting">Hi ${customerDetails.name || req.user.fullName || 'Sports Enthusiast'},</p>
            <p>Great news! Your booking at <strong>${populatedBooking.turf.name}</strong> has been successfully confirmed. We can't wait to see you there!</p>

            <div class="card">
                <div class="detail-row">
                    <span class="label">Booking ID</span>
                    <span class="value">#${populatedBooking.formattedId}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Date</span>
                    <span class="value">${new Date(date).toDateString()}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Time</span>
                    <span class="value">${timeSlot}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Total Amount</span>
                    <span class="value">PKR ${totalAmount}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Venue</span>
                    <span class="value">${populatedBooking.turf.name}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Location</span>
                    <span class="value">${populatedBooking.turf.location.address}</span>
                </div>
            </div>

            <p style="text-align: center;">
                <a href="#" class="button">View Booking in App</a>
            </p>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p>&copy; 2026 Arena Pro. All rights reserved.</p>
            <p>Need help? Contact us at support@arenapro.com</p>
        </div>
    </div>
</body>
</html>
        `
      };

      // Send to User
      await sendEmail(emailParams);

      // Send to Admin
      const adminEmail = 'iamusmankhan101@gmail.com';
      await sendEmail({
        email: adminEmail,
        subject: `🔔 NEW BOOKING: ${populatedBooking.turf.name} (${new Date(date).toDateString()})`,
        message: `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>New Booking Received</title>
<style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1); border-top: 5px solid #ff9800; }
    .header { background-color: #fff3e0; color: #e65100; padding: 25px; text-align: center; border-bottom: 1px solid #ffe0b2; }
    .header h1 { margin: 0; font-size: 22px; font-weight: 700; }
    .content { padding: 30px; color: #333333; }
    .stat-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
    .stat-box { background-color: #f8f9fa; padding: 15px; border-radius: 8px; text-align: center; border: 1px solid #eee; }
    .stat-label { display: block; font-size: 12px; text-transform: uppercase; color: #666; margin-bottom: 5px; letter-spacing: 0.5px; }
    .stat-value { display: block; font-size: 16px; font-weight: 700; color: #333; }
    .customer-info { background-color: #e3f2fd; padding: 15px; border-radius: 8px; margin-top: 20px; border: 1px solid #bbdefb; }
    .customer-info h3 { margin-top: 0; color: #1565c0; font-size: 16px; margin-bottom: 10px; }
    .footer { background-color: #f1f3f5; padding: 15px; text-align: center; font-size: 11px; color: #999; }
</style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔔 New Booking Alert</h1>
        </div>
        <div class="content">
            <p>Start your engines! A new booking has just been received.</p>
            
            <div class="stat-grid">
                <div class="stat-box">
                    <span class="stat-label">Venue</span>
                    <span class="stat-value">${populatedBooking.turf.name}</span>
                </div>
                <div class="stat-box">
                    <span class="stat-label">Amount</span>
                    <span class="stat-value">PKR ${totalAmount}</span>
                </div>
                <div class="stat-box">
                    <span class="stat-label">Date</span>
                    <span class="stat-value">${new Date(date).toDateString()}</span>
                </div>
                <div class="stat-box">
                    <span class="stat-label">Time</span>
                    <span class="stat-value">${timeSlot}</span>
                </div>
            </div>

            <div class="customer-info">
                <h3>👤 Customer Details</h3>
                <p style="margin: 5px 0;"><strong>Name:</strong> ${customerDetails.name}</p>
                <p style="margin: 5px 0;"><strong>Email:</strong> ${customerDetails.email || req.user.email}</p>
                <p style="margin: 5px 0;"><strong>Phone:</strong> ${customerDetails.phoneNumber || 'N/A'}</p>
            </div>
            
            <p style="text-align: center; margin-top: 25px;">
                <a href="#" style="color: #666; text-decoration: none; font-size: 14px;">Log in to admin dashboard to view more</a>
            </p>
        </div>
        <div class="footer">
            System Notification • &copy; 2026 Arena Pro Backend
        </div>
    </div>
</body>
</html>
        `
      });

    } catch (emailError) {
      console.error('⚠️ Backend: Failed to send booking emails:', emailError);
      // We don't block the response if email fails, but we log it.
    }

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

// @desc    Send booking confirmation email (Standalone service)
// @route   POST /api/bookings/send-confirmation
// @access  Public (or protected if token available)
router.post('/send-confirmation', async (req, res) => {
  try {
    const { email, bookingDetails } = req.body;

    if (!email || !bookingDetails) {
      return res.status(400).json({
        status: 'error',
        message: 'Email and booking details are required'
      });
    }

    const message = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Booking Confirmed</title>
<style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #004d43 0%, #00695c 100%); color: #ffffff; padding: 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 600; letter-spacing: 1px; }
    .content { padding: 30px; color: #333333; line-height: 1.6; }
    .greeting { font-size: 18px; margin-bottom: 20px; color: #004d43; font-weight: 600; }
    .card { background-color: #f8f9fa; border: 1px solid #e9ecef; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .detail-row { display: flex; justify-content: space-between; margin-bottom: 12px; border-bottom: 1px solid #eee; padding-bottom: 8px; }
    .detail-row:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
    .label { font-weight: 600; color: #666; font-size: 14px; }
    .value { font-weight: 500; color: #333; font-size: 15px; text-align: right; }
    .footer { background-color: #f1f3f5; padding: 20px; text-align: center; font-size: 12px; color: #888; }
    .button { display: inline-block; background-color: #004d43; color: #ffffff; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: 600; margin-top: 20px; }
    @media only screen and (max-width: 600px) {
        .container { margin: 0; border-radius: 0; }
        .content { padding: 20px; }
    }
</style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <h1>Booking Confirmed! ✅</h1>
        </div>

        <!-- Content -->
        <div class="content">
            <p class="greeting">Hi ${bookingDetails.customerName || 'Sports Enthusiast'},</p>
            <p>Great news! Your booking at <strong>${bookingDetails.turfName}</strong> has been successfully confirmed. We can't wait to see you there!</p>

            <div class="card">
                <div class="detail-row">
                    <span class="label">Booking ID</span>
                    <span class="value">#${bookingDetails.bookingId}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Date</span>
                    <span class="value">${bookingDetails.date}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Time</span>
                    <span class="value">${bookingDetails.timeSlot}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Amount</span>
                    <span class="value">PKR ${bookingDetails.totalAmount}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Venue</span>
                    <span class="value">${bookingDetails.turfName}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Location</span>
                    <span class="value">${bookingDetails.turfAddress}</span>
                </div>
            </div>

            <p style="text-align: center;">
                <a href="#" class="button">View Booking in App</a>
            </p>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p>&copy; 2026 Arena Pro. All rights reserved.</p>
            <p>Need help? Contact us at support@arenapro.com</p>
        </div>
    </div>
</body>
</html>
    `;

    const result = await sendEmail({
      email: email,
      subject: `Booking Confirmed - ${bookingDetails.turfName}`,
      message: message
    });

    // --- ADMIN NOTIFICATION START ---
    try {
      const adminEmail = 'iamusmankhan101@gmail.com';
      console.log(`📧 Backend: Sending admin notification to ${adminEmail}...`);
      await sendEmail({
        email: adminEmail,
        subject: `🔔 NEW BOOKING: ${bookingDetails.turfName} (${bookingDetails.date})`,
        message: `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>New Booking Received</title>
<style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1); border-top: 5px solid #ff9800; }
    .header { background-color: #fff3e0; color: #e65100; padding: 25px; text-align: center; border-bottom: 1px solid #ffe0b2; }
    .header h1 { margin: 0; font-size: 22px; font-weight: 700; }
    .content { padding: 30px; color: #333333; }
    .stat-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
    .stat-box { background-color: #f8f9fa; padding: 15px; border-radius: 8px; text-align: center; border: 1px solid #eee; }
    .stat-label { display: block; font-size: 12px; text-transform: uppercase; color: #666; margin-bottom: 5px; letter-spacing: 0.5px; }
    .stat-value { display: block; font-size: 16px; font-weight: 700; color: #333; }
    .customer-info { background-color: #e3f2fd; padding: 15px; border-radius: 8px; margin-top: 20px; border: 1px solid #bbdefb; }
    .customer-info h3 { margin-top: 0; color: #1565c0; font-size: 16px; margin-bottom: 10px; }
    .footer { background-color: #f1f3f5; padding: 15px; text-align: center; font-size: 11px; color: #999; }
</style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔔 New Booking Alert</h1>
        </div>
        <div class="content">
            <p>Start your engines! A new booking has just been received.</p>
            
            <div class="stat-grid">
                <div class="stat-box">
                    <span class="stat-label">Venue</span>
                    <span class="stat-value">${bookingDetails.turfName}</span>
                </div>
                <div class="stat-box">
                    <span class="stat-label">Amount</span>
                    <span class="stat-value">PKR ${bookingDetails.totalAmount}</span>
                </div>
                <div class="stat-box">
                    <span class="stat-label">Date</span>
                    <span class="stat-value">${bookingDetails.date}</span>
                </div>
                <div class="stat-box">
                    <span class="stat-label">Time</span>
                    <span class="stat-value">${bookingDetails.timeSlot}</span>
                </div>
            </div>

            <div class="customer-info">
                <h3>👤 Customer Details</h3>
                <p style="margin: 5px 0;"><strong>Name:</strong> ${bookingDetails.customerName}</p>
                <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
                <p style="margin: 5px 0;"><strong>Method:</strong> Firestore Trigger</p>
            </div>
            
            <p style="text-align: center; margin-top: 25px;">
                <a href="#" style="color: #666; text-decoration: none; font-size: 14px;">Log in to admin dashboard to view more</a>
            </p>
        </div>
        <div class="footer">
            System Notification • &copy; 2026 Arena Pro Backend
        </div>
    </div>
</body>
</html>
        `
      });
      console.log('✅ Backend: Admin notification sent.');
    } catch (adminError) {
      console.error('⚠️ Backend: Failed to send admin notification:', adminError);
      // Do not fail the request if admin email fails
    }
    // --- ADMIN NOTIFICATION END ---

    res.json({
      status: 'success',
      data: result
    });

  } catch (error) {
    console.error('Email service error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

module.exports = router;