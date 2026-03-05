const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Team name is required'],
    trim: true,
    maxlength: [50, 'Team name cannot exceed 50 characters']
  },
  captain: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['captain', 'vice_captain', 'player'],
      default: 'player'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended'],
      default: 'active'
    }
  }],
  sport: {
    type: String,
    enum: ['Football', 'Cricket', 'Padel', 'Futsal', 'Tennis', 'Badminton'],
    required: true
  },
  description: {
    type: String,
    maxlength: [300, 'Description cannot exceed 300 characters']
  },
  logo: {
    type: String,
    default: null
  },
  location: {
    city: String,
    area: String
  },
  stats: {
    wins: { type: Number, default: 0 },
    losses: { type: Number, default: 0 },
    draws: { type: Number, default: 0 },
    totalMatches: { type: Number, default: 0 },
    winPercentage: { type: Number, default: 0 },
    eloRating: { type: Number, default: 1200 },
    fairPlayScore: { type: Number, default: 5.0, min: 1, max: 5 }
  },
  achievements: [{
    title: String,
    description: String,
    achievedAt: Date,
    type: {
      type: String,
      enum: ['tournament_win', 'milestone', 'fair_play', 'other'],
      default: 'other'
    }
  }],
  preferences: {
    preferredVenues: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Turf'
    }],
    availableDays: [{
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    }],
    preferredTimeSlots: [{
      type: String,
      enum: ['morning', 'afternoon', 'evening', 'night']
    }],
    maxBudgetPerMatch: Number
  },
  settings: {
    isPublic: { type: Boolean, default: true },
    allowChallenges: { type: Boolean, default: true },
    autoAcceptChallenges: { type: Boolean, default: false },
    requireApprovalForMembers: { type: Boolean, default: true }
  },
  joinRequests: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    message: String,
    requestedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    }
  }],
  invitations: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    message: String,
    invitedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined'],
      default: 'pending'
    }
  }],
  status: {
    type: String,
    enum: ['active', 'inactive', 'disbanded'],
    default: 'active'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
teamSchema.index({ captain: 1 });
teamSchema.index({ sport: 1, status: 1 });
teamSchema.index({ 'stats.eloRating': -1 });
teamSchema.index({ 'location.city': 1, 'location.area': 1 });
teamSchema.index({ createdAt: -1 });

// Virtual for member count
teamSchema.virtual('memberCount').get(function() {
  return this.members.filter(member => member.status === 'active').length;
});

// Virtual for match history
teamSchema.virtual('matchHistory', {
  ref: 'Challenge',
  localField: '_id',
  foreignField: 'participants.team'
});

// Method to add member
teamSchema.methods.addMember = function(userId, role = 'player') {
  const existingMember = this.members.find(
    member => member.user.toString() === userId.toString()
  );
  
  if (existingMember) {
    throw new Error('User is already a member of this team');
  }
  
  this.members.push({
    user: userId,
    role: role,
    status: 'active'
  });
  
  return this.save();
};

// Method to remove member
teamSchema.methods.removeMember = function(userId) {
  if (this.captain.toString() === userId.toString()) {
    throw new Error('Cannot remove team captain');
  }
  
  this.members = this.members.filter(
    member => member.user.toString() !== userId.toString()
  );
  
  return this.save();
};

// Method to update member role
teamSchema.methods.updateMemberRole = function(userId, newRole) {
  const member = this.members.find(
    member => member.user.toString() === userId.toString()
  );
  
  if (!member) {
    throw new Error('User is not a member of this team');
  }
  
  member.role = newRole;
  return this.save();
};

// Method to update stats after a match
teamSchema.methods.updateStats = function(result) {
  this.stats.totalMatches += 1;
  
  if (result === 'win') {
    this.stats.wins += 1;
    this.stats.eloRating += 20;
  } else if (result === 'loss') {
    this.stats.losses += 1;
    this.stats.eloRating = Math.max(800, this.stats.eloRating - 20);
  } else if (result === 'draw') {
    this.stats.draws += 1;
  }
  
  // Calculate win percentage
  this.stats.winPercentage = (this.stats.wins / this.stats.totalMatches) * 100;
  
  return this.save();
};

// Method to add achievement
teamSchema.methods.addAchievement = function(title, description, type = 'other') {
  this.achievements.push({
    title,
    description,
    achievedAt: new Date(),
    type
  });
  
  return this.save();
};

// Method to check if user is member
teamSchema.methods.isMember = function(userId) {
  return this.members.some(
    member => member.user.toString() === userId.toString() && member.status === 'active'
  ) || this.captain.toString() === userId.toString();
};

// Method to check if user is captain or vice captain
teamSchema.methods.canManageTeam = function(userId) {
  if (this.captain.toString() === userId.toString()) {
    return true;
  }
  
  const member = this.members.find(
    member => member.user.toString() === userId.toString()
  );
  
  return member && member.role === 'vice_captain';
};

module.exports = mongoose.model('Team', teamSchema);