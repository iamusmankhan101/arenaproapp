const express = require('express');
const Turf = require('../models/Turf');
const { protect, optionalAuth } = require('../middleware/auth');
const { 
  validateTurfCreation, 
  validateNearbyTurfs, 
  validateObjectId,
  handleValidationErrors 
} = require('../middleware/validation');

const router = express.Router();

// @desc    Get nearby turfs
// @route   GET /api/turfs/nearby
// @access  Public
router.get('/nearby', [validateNearbyTurfs, handleValidationErrors], optionalAuth, async (req, res) => {
  try {
    const { lat, lng, radius = 10, sport, minPrice, maxPrice, amenities } = req.query;

    // Build query
    let query = {
      status: 'active',
      'location.coordinates': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: radius * 1000 // Convert km to meters
        }
      }
    };

    // Apply filters
    if (sport) {
      query.sports = { $in: [sport] };
    }

    if (minPrice || maxPrice) {
      query['pricing.basePrice'] = {};
      if (minPrice) query['pricing.basePrice'].$gte = parseFloat(minPrice);
      if (maxPrice) query['pricing.basePrice'].$lte = parseFloat(maxPrice);
    }

    if (amenities) {
      const amenityList = amenities.split(',');
      amenityList.forEach(amenity => {
        query[`amenities.${amenity}`] = true;
      });
    }

    const turfs = await Turf.find(query)
      .populate('owner', 'fullName phoneNumber')
      .select('-__v')
      .limit(50);

    // Format response for mobile app
    const formattedTurfs = turfs.map(turf => ({
      id: turf._id,
      name: turf.name,
      description: turf.description,
      area: turf.location.area,
      city: turf.location.city,
      sport: turf.sports[0], // Primary sport
      sports: turf.sports,
      rating: turf.rating.average,
      reviewCount: turf.rating.count,
      pricePerHour: turf.pricing.basePrice,
      image: turf.images[0]?.url,
      images: turf.images,
      time: getOperatingHoursString(turf.operatingHours),
      bookable: turf.isBookable,
      distance: calculateDistance(lat, lng, turf.location.coordinates.coordinates[1], turf.location.coordinates.coordinates[0]),
      surfaceType: turf.specifications.surfaceType,
      size: turf.specifications.size,
      hasFloodlights: turf.amenities.hasFloodlights,
      hasGenerator: turf.amenities.hasGenerator,
      hasParking: turf.amenities.hasParking,
      facilities: turf.facilities,
      contact: turf.contact
    }));

    res.json({
      status: 'success',
      results: formattedTurfs.length,
      data: formattedTurfs
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// @desc    Get turf details
// @route   GET /api/turfs/:id
// @access  Public
router.get('/:id', validateObjectId('id'), handleValidationErrors, optionalAuth, async (req, res) => {
  try {
    const turf = await Turf.findById(req.params.id)
      .populate('owner', 'fullName phoneNumber email')
      .populate({
        path: 'reviews',
        populate: {
          path: 'user',
          select: 'fullName'
        },
        options: { limit: 10, sort: { createdAt: -1 } }
      });

    if (!turf) {
      return res.status(404).json({
        status: 'error',
        message: 'Turf not found'
      });
    }

    // Check if user has favorited this turf
    let isFavorite = false;
    if (req.user) {
      isFavorite = req.user.preferences.favoriteVenues.includes(turf._id);
    }

    // Format response
    const formattedTurf = {
      id: turf._id,
      name: turf.name,
      description: turf.description,
      location: turf.location.address,
      area: turf.location.area,
      city: turf.location.city,
      coordinates: turf.location.coordinates.coordinates,
      sports: turf.sports,
      availableSports: turf.sports.map(sport => ({
        name: sport,
        icon: getSportIcon(sport)
      })),
      images: turf.images,
      facilities: turf.facilities,
      amenities: turf.amenities,
      pricing: turf.pricing,
      operatingHours: turf.operatingHours,
      hours: getOperatingHoursString(turf.operatingHours),
      specifications: turf.specifications,
      rating: turf.rating.average,
      reviewCount: turf.rating.count,
      priceFrom: turf.pricing.basePrice,
      contact: turf.contact,
      policies: turf.policies,
      isFavorite,
      owner: turf.owner
    };

    res.json({
      status: 'success',
      data: formattedTurf
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// @desc    Search turfs
// @route   POST /api/turfs/search
// @access  Public
router.post('/search', optionalAuth, async (req, res) => {
  try {
    const { query, filters = {} } = req.body;
    
    let searchQuery = { status: 'active' };

    // Text search
    if (query) {
      searchQuery.$or = [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { 'location.area': { $regex: query, $options: 'i' } },
        { 'location.city': { $regex: query, $options: 'i' } },
        { sports: { $in: [new RegExp(query, 'i')] } }
      ];
    }

    // Apply filters
    if (filters.sports && filters.sports.length > 0) {
      searchQuery.sports = { $in: filters.sports };
    }

    if (filters.priceRange) {
      searchQuery['pricing.basePrice'] = {
        $gte: filters.priceRange.min || 0,
        $lte: filters.priceRange.max || 10000
      };
    }

    if (filters.amenities) {
      Object.keys(filters.amenities).forEach(amenity => {
        if (filters.amenities[amenity]) {
          searchQuery[`amenities.${amenity}`] = true;
        }
      });
    }

    if (filters.rating) {
      searchQuery['rating.average'] = { $gte: filters.rating };
    }

    const turfs = await Turf.find(searchQuery)
      .sort({ 'rating.average': -1, createdAt: -1 })
      .limit(50);

    const formattedTurfs = turfs.map(turf => ({
      id: turf._id,
      name: turf.name,
      area: turf.location.area,
      city: turf.location.city,
      sport: turf.sports[0],
      rating: turf.rating.average,
      reviewCount: turf.rating.count,
      pricePerHour: turf.pricing.basePrice,
      image: turf.images[0]?.url,
      surfaceType: turf.specifications.surfaceType,
      hasFloodlights: turf.amenities.hasFloodlights,
      hasParking: turf.amenities.hasParking
    }));

    res.json({
      status: 'success',
      results: formattedTurfs.length,
      data: formattedTurfs
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// @desc    Toggle favorite turf
// @route   POST /api/turfs/:id/favorite
// @access  Private
router.post('/:id/favorite', [protect, validateObjectId('id'), handleValidationErrors], async (req, res) => {
  try {
    const turfId = req.params.id;
    
    // Check if turf exists
    const turf = await Turf.findById(turfId);
    if (!turf) {
      return res.status(404).json({
        status: 'error',
        message: 'Turf not found'
      });
    }

    const user = req.user;
    const isFavorite = user.preferences.favoriteVenues.includes(turfId);

    if (isFavorite) {
      // Remove from favorites
      await user.removeFromFavorites(turfId);
    } else {
      // Add to favorites
      await user.addToFavorites(turfId);
    }

    res.json({
      status: 'success',
      message: isFavorite ? 'Removed from favorites' : 'Added to favorites',
      data: {
        isFavorite: !isFavorite
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// @desc    Get user's favorite turfs
// @route   GET /api/turfs/favorites
// @access  Private
router.get('/favorites', protect, async (req, res) => {
  try {
    const user = await req.user.populate('preferences.favoriteVenues');
    
    const favorites = user.preferences.favoriteVenues.map(turf => ({
      id: turf._id,
      name: turf.name,
      location: `${turf.location.area}, ${turf.location.city}`,
      priceFrom: turf.pricing.basePrice,
      rating: turf.rating.average,
      imageType: turf.sports[0]?.toLowerCase() || 'football'
    }));

    res.json({
      status: 'success',
      results: favorites.length,
      data: favorites
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// @desc    Create new turf (for venue owners)
// @route   POST /api/turfs
// @access  Private
router.post('/', [protect, validateTurfCreation, handleValidationErrors], async (req, res) => {
  try {
    const turfData = {
      ...req.body,
      owner: req.user._id
    };

    const turf = await Turf.create(turfData);

    res.status(201).json({
      status: 'success',
      message: 'Turf created successfully',
      data: turf
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Helper functions
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  return Math.round(distance * 10) / 10; // Round to 1 decimal place
}

function getOperatingHoursString(operatingHours) {
  // Simple implementation - can be enhanced
  const monday = operatingHours.monday;
  if (monday.closed) return 'Closed';
  return `${monday.open} - ${monday.close} (All Days)`;
}

function getSportIcon(sport) {
  const icons = {
    'Football': '⚽',
    'Cricket': '🏏',
    'Padel': '🏓',
    'Futsal': '⚽',
    'Tennis': '🎾',
    'Badminton': '🏸'
  };
  return icons[sport] || '⚽';
}

module.exports = router;