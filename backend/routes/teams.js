const express = require('express');
const Team = require('../models/Team');
const { protect } = require('../middleware/auth');
const { validateObjectId, handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

// @desc    Get team stats
// @route   GET /api/teams/:id/stats
// @access  Public
router.get('/:id/stats', validateObjectId('id'), handleValidationErrors, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('members.user', 'fullName')
      .populate('captain', 'fullName phoneNumber');

    if (!team) {
      return res.status(404).json({
        status: 'error',
        message: 'Team not found'
      });
    }

    res.json({
      status: 'success',
      data: {
        id: team._id,
        name: team.name,
        sport: team.sport,
        stats: team.stats,
        memberCount: team.memberCount,
        captain: team.captain,
        achievements: team.achievements,
        location: team.location
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