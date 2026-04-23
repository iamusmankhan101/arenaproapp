const express = require('express');
const Challenge = require('../models/Challenge');
const Team = require('../models/Team');
const { protect } = require('../middleware/auth');
const {
  validateChallengeCreation,
  validateObjectId,
  handleValidationErrors
} = require('../middleware/validation');
const sendEmail = require('../utils/sendEmail');

const { sendNotification } = require('../config/firebaseAdmin');

const router = express.Router();

// @desc    Get all challenges
// @route   GET /api/challenges
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      sport,
      type,
      status = 'open',
      page = 0,
      pageSize = 20,
      city,
      skillLevel
    } = req.query;

    // Build query
    let query = { visibility: 'public' };

    if (sport) query.sport = sport;
    if (type) query.type = type;
    if (status !== 'all') query.status = status;
    if (city) query['venue.address'] = { $regex: city, $options: 'i' };
    if (skillLevel) query['requirements.skillLevel'] = skillLevel;

    const [challenges, total] = await Promise.all([
      Challenge.find(query)
        .populate('creatorTeam', 'name stats.wins stats.losses stats.eloRating stats.fairPlayScore')
        .populate('creator', 'fullName')
        .populate('venue.turf', 'name location.area location.city')
        .sort({ createdAt: -1 })
        .skip(page * pageSize)
        .limit(parseInt(pageSize)),
      Challenge.countDocuments(query)
    ]);

    // Format challenges for mobile app
    const formattedChallenges = challenges.map(challenge => ({
      id: challenge._id,
      title: challenge.title,
      teamName: challenge.creatorTeam.name,
      sport: challenge.sport,
      type: challenge.type,
      proposedDateTime: challenge.proposedDateTime,
      venue: challenge.venue.name || challenge.venue.turf?.name,
      maxGroundFee: challenge.maxGroundFee.toString(),
      status: challenge.status,
      teamWins: challenge.creatorTeam.stats.wins,
      teamLosses: challenge.creatorTeam.stats.losses,
      teamElo: challenge.creatorTeam.stats.eloRating,
      fairPlayScore: challenge.creatorTeam.stats.fairPlayScore,
      timeAgo: challenge.timeAgo,
      isWinnerTakesAll: challenge.isWinnerTakesAll,
      maxParticipants: challenge.maxParticipants,
      participants: challenge.participantCount,
      prizePool: challenge.prizePool.amount
    }));

    res.json({
      status: 'success',
      results: formattedChallenges.length,
      data: formattedChallenges,
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

// @desc    Get challenge details
// @route   GET /api/challenges/:id
// @access  Public
router.get('/:id', validateObjectId('id'), handleValidationErrors, async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id)
      .populate('creatorTeam', 'name stats members')
      .populate('creator', 'fullName phoneNumber')
      .populate('participants.team', 'name stats members')
      .populate('venue.turf', 'name location contact images')
      .populate('invitedTeams.team', 'name stats');

    if (!challenge) {
      return res.status(404).json({
        status: 'error',
        message: 'Challenge not found'
      });
    }

    res.json({
      status: 'success',
      data: challenge
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// @desc    Create new challenge
// @route   POST /api/challenges
// @access  Private
router.post('/', [protect, validateChallengeCreation, handleValidationErrors], async (req, res) => {
  try {
    const {
      title,
      description,
      sport,
      type = 'open',
      proposedDateTime,
      venue,
      maxGroundFee,
      isWinnerTakesAll = false,
      prizePool,
      requirements,
      maxParticipants = 2,
      visibility = 'public',
      rules,
      invitedTeams
    } = req.body;

    // Check if user has a team for this sport
    const userTeam = await Team.findOne({
      $or: [
        { captain: req.user._id },
        { 'members.user': req.user._id }
      ],
      sport,
      status: 'active'
    });

    if (!userTeam) {
      return res.status(400).json({
        status: 'error',
        message: `You need to be part of a ${sport} team to create challenges`
      });
    }

    // Check if user can manage the team (captain or vice-captain)
    if (!userTeam.canManageTeam(req.user._id)) {
      return res.status(403).json({
        status: 'error',
        message: 'Only team captain or vice-captain can create challenges'
      });
    }

    // Create challenge
    const challenge = await Challenge.create({
      title,
      description,
      creator: req.user._id,
      creatorTeam: userTeam._id,
      sport,
      type,
      proposedDateTime: new Date(proposedDateTime),
      venue,
      maxGroundFee,
      isWinnerTakesAll,
      prizePool,
      requirements,
      maxParticipants,
      visibility,
      rules,
      invitedTeams: invitedTeams || []
    });

    // Populate the created challenge
    const populatedChallenge = await Challenge.findById(challenge._id)
      .populate('creatorTeam', 'name stats')
      .populate('creator', 'fullName');

    res.status(201).json({
      status: 'success',
      message: 'Challenge created successfully',
      data: populatedChallenge
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// @desc    Accept/Join challenge
// @route   POST /api/challenges/:id/accept
// @access  Private
router.post('/:id/accept', [protect, validateObjectId('id'), handleValidationErrors], async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id)
      .populate('creatorTeam');

    if (!challenge) {
      return res.status(404).json({
        status: 'error',
        message: 'Challenge not found'
      });
    }

    if (challenge.status !== 'open') {
      return res.status(400).json({
        status: 'error',
        message: 'Challenge is not open for participation'
      });
    }

    // Check if user has a team for this sport
    const userTeam = await Team.findOne({
      $or: [
        { captain: req.user._id },
        { 'members.user': req.user._id }
      ],
      sport: challenge.sport,
      status: 'active'
    });

    if (!userTeam) {
      return res.status(400).json({
        status: 'error',
        message: `You need to be part of a ${challenge.sport} team to join this challenge`
      });
    }

    // Check if user can manage the team
    if (!userTeam.canManageTeam(req.user._id)) {
      return res.status(403).json({
        status: 'error',
        message: 'Only team captain or vice-captain can accept challenges'
      });
    }

    // Check if it's not the creator's own challenge
    if (challenge.creatorTeam._id.toString() === userTeam._id.toString()) {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot join your own challenge'
      });
    }

    // Add participant
    await challenge.addParticipant(userTeam._id);

    // --- SEND PUSH NOTIFICATION ---
    try {
      // Re-fetch creator to get FCM Token if not populated
      const challengeCreator = await User.findById(challenge.creator);
      if (challengeCreator && challengeCreator.fcmToken) {
        await sendNotification(
          challengeCreator.fcmToken,
          'Challenge Accepted! ⚔️',
          `${userTeam.name} has accepted your ${challenge.sport} challenge!`
        );
      }
    } catch (pushError) {
      console.warn('⚠️ Push notification failed:', pushError);
    }

    // --- SEND EMAIL NOTIFICATIONS ---
    try {
      // 1. Send email to Challenge Creator
      // Re-fetch challenge to ensure we have populated fields if needed, or just rely on what we have if we populate correctly above.
      // We need to populate creator to get email.
      const challengeForEmail = await Challenge.findById(req.params.id)
        .populate('creator', 'fullName email')
        .populate('venue.turf', 'name location');

      if (challengeForEmail && challengeForEmail.creator && challengeForEmail.creator.email) {

        // Email to Creator
        await sendEmail({
          email: challengeForEmail.creator.email,
          subject: `Challenge Accepted! ⚔️ - ${challengeForEmail.title}`,
          message: `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { font-family: sans-serif; background-color: #f4f4f4; padding: 20px; }
  .container { max-width: 600px; margin: auto; background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
  .header { background: #004d43; color: #fff; padding: 15px; text-align: center; border-radius: 8px 8px 0 0; }
  .content { padding: 20px; }
  .button { display: inline-block; background: #ff9800; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Game On! ⚽</h1>
    </div>
    <div class="content">
      <p>Hi ${challengeForEmail.creator.fullName},</p>
      <p>Your challenge <strong>"${challengeForEmail.title}"</strong> has been accepted by <strong>${userTeam.name}</strong>!</p>
      
      <h3>Challenge Details:</h3>
      <ul>
        <li><strong>Sport:</strong> ${challengeForEmail.sport}</li>
        <li><strong>Date:</strong> ${new Date(challengeForEmail.proposedDateTime).toDateString()}</li>
        <li><strong>Venue:</strong> ${challengeForEmail.venue.name || challengeForEmail.venue.turf?.name || 'TBD'}</li>
      </ul>

      <p>Get ready for the match!</p>
      <center><a href="#" class="button">View Challenge</a></center>
    </div>
  </div>
</body>
</html>
          `
        });
      }

      // 2. Send email to Acceptor (Current User)
      if (req.user.email) {
        await sendEmail({
          email: req.user.email,
          subject: `You Joined a Challenge! 🛡️ - ${challenge.title}`,
          message: `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { font-family: sans-serif; background-color: #f4f4f4; padding: 20px; }
  .container { max-width: 600px; margin: auto; background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
  .header { background: #023c69; color: #fff; padding: 15px; text-align: center; border-radius: 8px 8px 0 0; }
  .content { padding: 20px; }
  .button { display: inline-block; background: #004d43; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Challenge Accepted!</h1>
    </div>
    <div class="content">
      <p>Hi ${req.user.fullName},</p>
      <p>You have successfully accepted the challenge <strong>"${challenge.title}"</strong> with your team <strong>${userTeam.name}</strong>.</p>
      
      <p>Bring your A-game!</p>
      <center><a href="#" class="button">View Challenge</a></center>
    </div>
  </div>
</body>
</html>
          `
        });
      }

    } catch (emailError) {
      console.error('⚠️ Backend: Failed to send challenge emails:', emailError);
      // Don't block response
    }

    res.json({
      status: 'success',
      message: 'Successfully joined the challenge',
      data: {
        challengeId: challenge._id,
        status: challenge.status,
        participantCount: challenge.participantCount
      }
    });
  } catch (error) {
    if (error.message.includes('already participating') || error.message.includes('full')) {
      return res.status(400).json({
        status: 'error',
        message: error.message
      });
    }

    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// @desc    Leave challenge
// @route   DELETE /api/challenges/:id/leave
// @access  Private
router.delete('/:id/leave', [protect, validateObjectId('id'), handleValidationErrors], async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id);

    if (!challenge) {
      return res.status(404).json({
        status: 'error',
        message: 'Challenge not found'
      });
    }

    // Find user's team
    const userTeam = await Team.findOne({
      $or: [
        { captain: req.user._id },
        { 'members.user': req.user._id }
      ],
      sport: challenge.sport,
      status: 'active'
    });

    if (!userTeam) {
      return res.status(400).json({
        status: 'error',
        message: 'Team not found'
      });
    }

    // Check if user can manage the team
    if (!userTeam.canManageTeam(req.user._id)) {
      return res.status(403).json({
        status: 'error',
        message: 'Only team captain or vice-captain can leave challenges'
      });
    }

    // Remove participant
    await challenge.removeParticipant(userTeam._id);

    res.json({
      status: 'success',
      message: 'Successfully left the challenge'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// @desc    Update challenge
// @route   PUT /api/challenges/:id
// @access  Private
router.put('/:id', [protect, validateObjectId('id'), handleValidationErrors], async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id);

    if (!challenge) {
      return res.status(404).json({
        status: 'error',
        message: 'Challenge not found'
      });
    }

    // Check if user is the creator
    if (challenge.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Only challenge creator can update the challenge'
      });
    }

    // Check if challenge can be updated
    if (challenge.status !== 'open') {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot update challenge that is not open'
      });
    }

    const allowedUpdates = [
      'title', 'description', 'proposedDateTime', 'venue',
      'maxGroundFee', 'requirements', 'rules'
    ];

    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const updatedChallenge = await Challenge.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate('creatorTeam', 'name stats');

    res.json({
      status: 'success',
      message: 'Challenge updated successfully',
      data: updatedChallenge
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// @desc    Cancel challenge
// @route   DELETE /api/challenges/:id
// @access  Private
router.delete('/:id', [protect, validateObjectId('id'), handleValidationErrors], async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id);

    if (!challenge) {
      return res.status(404).json({
        status: 'error',
        message: 'Challenge not found'
      });
    }

    // Check if user is the creator
    if (challenge.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Only challenge creator can cancel the challenge'
      });
    }

    // Check if challenge can be cancelled
    if (challenge.status === 'completed') {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot cancel completed challenge'
      });
    }

    challenge.status = 'cancelled';
    await challenge.save();

    res.json({
      status: 'success',
      message: 'Challenge cancelled successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// @desc    Complete challenge with result
// @route   POST /api/challenges/:id/complete
// @access  Private
router.post('/:id/complete', [protect, validateObjectId('id'), handleValidationErrors], async (req, res) => {
  try {
    const { winnerId, score, notes } = req.body;

    const challenge = await Challenge.findById(req.params.id)
      .populate('participants.team');

    if (!challenge) {
      return res.status(404).json({
        status: 'error',
        message: 'Challenge not found'
      });
    }

    // Check if user is a participant
    const userTeam = await Team.findOne({
      $or: [
        { captain: req.user._id },
        { 'members.user': req.user._id }
      ],
      sport: challenge.sport,
      status: 'active'
    });

    const isParticipant = challenge.participants.some(p =>
      p.team._id.toString() === userTeam?._id.toString()
    ) || challenge.creatorTeam.toString() === userTeam?._id.toString();

    if (!isParticipant) {
      return res.status(403).json({
        status: 'error',
        message: 'Only challenge participants can complete the challenge'
      });
    }

    if (challenge.status !== 'in_progress') {
      return res.status(400).json({
        status: 'error',
        message: 'Challenge must be in progress to complete'
      });
    }

    // Complete challenge
    await challenge.completeChallenge(winnerId, score, notes);

    // Update team stats
    const winnerTeam = await Team.findById(winnerId);
    const loserTeams = challenge.participants
      .map(p => p.team)
      .filter(team => team._id.toString() !== winnerId.toString());

    if (winnerTeam) {
      await winnerTeam.updateStats('win');
    }

    for (const team of loserTeams) {
      await team.updateStats('loss');
    }

    res.json({
      status: 'success',
      message: 'Challenge completed successfully',
      data: {
        winner: winnerTeam?.name,
        score,
        completedAt: challenge.result.completedAt
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