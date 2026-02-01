const express = require('express');
const User = require('../models/User');
const Turf = require('../models/Turf');
const Booking = require('../models/Booking');
const Challenge = require('../models/Challenge');
const { adminProtect, adminPermission } = require('../middleware/auth');
const { validatePagination, handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

// Apply admin protection to all routes
router.use(adminProtect);

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard/stats
// @access  Private (Admin)
router.get('/dashboard/stats', adminPermission('dashboard_view'), async (req, res) => {
  try {
    // Get current date ranges
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Get basic counts
    const [
      totalBookings,
      todayBookings,
      activeVenues,
      totalCustomers,
      pendingBookings,
      thisMonthBookings,
      lastMonthBookings
    ] = await Promise.all([
      Booking.countDocuments(),
      Booking.countDocuments({ 
        createdAt: { $gte: startOfToday } 
      }),
      Turf.countDocuments({ status: 'active' }),
      User.countDocuments({ role: 'user' }),
      Booking.countDocuments({ status: 'pending' }),
      Booking.countDocuments({ 
        createdAt: { $gte: startOfMonth } 
      }),
      Booking.countDocuments({ 
        createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } 
      })
    ]);

    // Calculate revenue
    const revenueResult = await Booking.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;

    const thisMonthRevenueResult = await Booking.aggregate([
      { 
        $match: { 
          paymentStatus: 'paid',
          createdAt: { $gte: startOfMonth }
        } 
      },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const thisMonthRevenue = thisMonthRevenueResult[0]?.total || 0;

    const lastMonthRevenueResult = await Booking.aggregate([
      { 
        $match: { 
          paymentStatus: 'paid',
          createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth }
        } 
      },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const lastMonthRevenue = lastMonthRevenueResult[0]?.total || 0;

    // Calculate growth percentages
    const monthlyGrowth = lastMonthBookings > 0 
      ? ((thisMonthBookings - lastMonthBookings) / lastMonthBookings * 100).toFixed(1)
      : 0;

    const revenueGrowth = lastMonthRevenue > 0 
      ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1)
      : 0;

    // Get weekly stats (last 7 days)
    const weeklyStats = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);

      const [dayBookings, dayRevenueResult] = await Promise.all([
        Booking.countDocuments({
          createdAt: { $gte: startOfDay, $lt: endOfDay }
        }),
        Booking.aggregate([
          {
            $match: {
              paymentStatus: 'paid',
              createdAt: { $gte: startOfDay, $lt: endOfDay }
            }
          },
          { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ])
      ]);

      const dayRevenue = dayRevenueResult[0]?.total || 0;

      weeklyStats.push({
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        bookings: dayBookings,
        revenue: dayRevenue
      });
    }

    res.json({
      status: 'success',
      data: {
        totalBookings,
        todayBookings,
        totalRevenue,
        activeVenues,
        totalCustomers,
        pendingBookings,
        monthlyGrowth: parseFloat(monthlyGrowth),
        revenueGrowth: parseFloat(revenueGrowth),
        weeklyStats
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// @desc    Get all bookings with pagination and filters
// @route   GET /api/admin/bookings
// @access  Private (Admin)
router.get('/bookings', [adminPermission('bookings_view'), validatePagination, handleValidationErrors], async (req, res) => {
  try {
    const { 
      page = 0, 
      pageSize = 25, 
      filter = 'all', 
      search = '',
      startDate,
      endDate 
    } = req.query;

    // Build query
    let query = {};

    // Apply filters
    if (filter !== 'all') {
      if (filter === 'today') {
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        const endOfToday = new Date();
        endOfToday.setHours(23, 59, 59, 999);
        query.date = { $gte: startOfToday, $lte: endOfToday };
      } else {
        query.status = filter;
      }
    }

    // Apply date range
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Apply search
    if (search) {
      query.$or = [
        { bookingId: { $regex: search, $options: 'i' } },
        { 'customerDetails.name': { $regex: search, $options: 'i' } },
        { 'customerDetails.phoneNumber': { $regex: search, $options: 'i' } }
      ];
    }

    // Get bookings with pagination
    const [bookings, total] = await Promise.all([
      Booking.find(query)
        .populate('user', 'fullName phoneNumber email')
        .populate('turf', 'name location.area location.city')
        .sort({ createdAt: -1 })
        .skip(page * pageSize)
        .limit(parseInt(pageSize)),
      Booking.countDocuments(query)
    ]);

    // Format bookings for admin panel
    const formattedBookings = bookings.map(booking => ({
      id: booking._id,
      bookingId: booking.formattedId,
      customerName: booking.customerDetails.name,
      customerPhone: booking.customerDetails.phoneNumber,
      customerEmail: booking.customerDetails.email || booking.user?.email,
      turfName: booking.turf?.name,
      turfArea: booking.turf?.location?.area + ', ' + booking.turf?.location?.city,
      sport: booking.turf?.sports?.[0] || 'Unknown',
      dateTime: booking.dateTime,
      duration: booking.duration,
      totalAmount: booking.totalAmount,
      status: booking.status,
      paymentStatus: booking.paymentStatus,
      paymentMethod: booking.paymentMethod,
      createdAt: booking.createdAt
    }));

    res.json({
      status: 'success',
      data: {
        data: formattedBookings,
        total,
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

// @desc    Update booking status
// @route   PUT /api/admin/bookings/:id/status
// @access  Private (Admin)
router.put('/bookings/:id/status', adminPermission('bookings_edit'), async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    if (!['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid status'
      });
    }

    const booking = await Booking.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!booking) {
      return res.status(404).json({
        status: 'error',
        message: 'Booking not found'
      });
    }

    // Log activity
    await req.admin.logActivity('booking_status_update', 'booking', id, { status }, req);

    res.json({
      status: 'success',
      message: 'Booking status updated successfully',
      data: { booking }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// @desc    Get all venues with pagination and filters
// @route   GET /api/admin/venues
// @access  Private (Admin)
router.get('/venues', [adminPermission('venues_view'), validatePagination, handleValidationErrors], async (req, res) => {
  try {
    const { 
      page = 0, 
      pageSize = 25, 
      filter = 'all', 
      search = '' 
    } = req.query;

    // Build query
    let query = {};

    // Apply filters
    if (filter !== 'all') {
      if (['football', 'cricket', 'padel', 'futsal'].includes(filter)) {
        query.sports = { $in: [filter.charAt(0).toUpperCase() + filter.slice(1)] };
      } else {
        query.status = filter;
      }
    }

    // Apply search
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { 'location.area': { $regex: search, $options: 'i' } },
        { 'location.city': { $regex: search, $options: 'i' } }
      ];
    }

    // Get venues with pagination
    const [venues, total] = await Promise.all([
      Turf.find(query)
        .populate('owner', 'fullName phoneNumber email')
        .sort({ createdAt: -1 })
        .skip(page * pageSize)
        .limit(parseInt(pageSize)),
      Turf.countDocuments(query)
    ]);

    // Get booking stats for each venue
    const venuesWithStats = await Promise.all(
      venues.map(async (venue) => {
        const [totalSlots, bookedSlots] = await Promise.all([
          // Assuming 16 hours operation (6 AM to 10 PM) = 16 slots per day
          Promise.resolve(16),
          Booking.countDocuments({
            turf: venue._id,
            date: {
              $gte: new Date(),
              $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Next 30 days
            },
            status: { $in: ['confirmed', 'pending'] }
          })
        ]);

        return {
          id: venue._id,
          name: venue.name,
          area: venue.location.area + ', ' + venue.location.city,
          sports: venue.sports,
          status: venue.status,
          totalSlots,
          bookedSlots,
          rating: venue.rating.average.toFixed(1),
          totalReviews: venue.rating.count,
          priceRange: `${venue.pricing.basePrice}-${Math.round(venue.pricing.basePrice * 1.5)}`,
          revenue: venue.stats.totalRevenue,
          contactPerson: venue.owner?.fullName || 'N/A',
          contactPhone: venue.contact.phoneNumber,
          createdAt: venue.createdAt
        };
      })
    );

    res.json({
      status: 'success',
      data: {
        data: venuesWithStats,
        total,
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

// @desc    Update venue status
// @route   PUT /api/admin/venues/:id/status
// @access  Private (Admin)
router.put('/venues/:id/status', adminPermission('venues_edit'), async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    if (!['active', 'inactive', 'maintenance', 'pending_approval'].includes(status)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid status'
      });
    }

    const venue = await Turf.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!venue) {
      return res.status(404).json({
        status: 'error',
        message: 'Venue not found'
      });
    }

    // Log activity
    await req.admin.logActivity('venue_status_update', 'venue', id, { status }, req);

    res.json({
      status: 'success',
      message: 'Venue status updated successfully',
      data: { venue }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// @desc    Get all customers with pagination and filters
// @route   GET /api/admin/customers
// @access  Private (Admin)
router.get('/customers', [adminPermission('users_view'), validatePagination, handleValidationErrors], async (req, res) => {
  try {
    const { 
      page = 0, 
      pageSize = 25, 
      filter = 'all', 
      search = '' 
    } = req.query;

    // Build query
    let query = { role: 'user' };

    // Apply filters
    if (filter !== 'all') {
      if (filter === 'new') {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        query.createdAt = { $gte: thirtyDaysAgo };
      } else if (filter === 'vip') {
        query['stats.totalSpent'] = { $gte: 50000 };
      } else {
        query.isActive = filter === 'active';
      }
    }

    // Apply search
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { phoneNumber: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Get customers with pagination
    const [customers, total] = await Promise.all([
      User.find(query)
        .sort({ createdAt: -1 })
        .skip(page * pageSize)
        .limit(parseInt(pageSize)),
      User.countDocuments(query)
    ]);

    // Get additional stats for each customer
    const customersWithStats = await Promise.all(
      customers.map(async (customer) => {
        const [totalBookings, lastBooking] = await Promise.all([
          Booking.countDocuments({ user: customer._id }),
          Booking.findOne({ user: customer._id }).sort({ createdAt: -1 })
        ]);

        return {
          id: customer._id,
          name: customer.fullName,
          email: customer.email,
          phone: customer.phoneNumber,
          joinDate: customer.createdAt,
          status: customer.isActive ? 'active' : 'inactive',
          totalBookings,
          totalSpent: customer.stats.totalSpent,
          lastBooking: lastBooking?.createdAt,
          favoriteVenues: customer.preferences.favoriteVenues,
          preferredSports: customer.preferences.favoriteSports,
          rating: 4.5, // Placeholder - implement customer rating system
          isVip: customer.stats.totalSpent > 50000
        };
      })
    );

    res.json({
      status: 'success',
      data: {
        data: customersWithStats,
        total,
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

// @desc    Update customer status
// @route   PUT /api/admin/customers/:id/status
// @access  Private (Admin)
router.put('/customers/:id/status', adminPermission('users_edit'), async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    const isActive = status === 'active';

    const customer = await User.findByIdAndUpdate(
      id,
      { isActive },
      { new: true, runValidators: true }
    );

    if (!customer) {
      return res.status(404).json({
        status: 'error',
        message: 'Customer not found'
      });
    }

    // Log activity
    await req.admin.logActivity('customer_status_update', 'user', id, { status }, req);

    res.json({
      status: 'success',
      message: 'Customer status updated successfully',
      data: { customer }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

module.exports = router;