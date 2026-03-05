const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Challenge title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  creatorTeam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true
  },
  sport: {
    type: String,
    enum: ['Football', 'Cricket', 'Padel', 'Futsal', 'Tennis', 'Badminton'],
    required: true
  },
  type: {
    type: String,
    enum: ['open', 'private', 'tournament'],
    default: 'open'
  },
  proposedDateTime: {
    type: Date,
    required: [true, 'Proposed date and time is required']
  },
  venue: {
    turf: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Turf'
    },
    name: String,
    address: String,
    isFlexible: { type: Boolean, default: false }
  },
  maxGroundFee: {
    type: Number,
    required: [true, 'Maximum ground fee is required'],
    min: [0, 'Ground fee cannot be negative']
  },
  isWinnerTakesAll: {
    type: Boolean,
    default: false
  },
  prizePool: {
    amount: { type: Number, default: 0 },
    currency: { type: String, default: 'PKR' },
    distribution: {
      winner: { type: Number, default: 100 }, // percentage
      runnerUp: { type: Number, default: 0 }
    }
  },
  requirements: {
    minTeamSize: { type: Number, default: 1 },
    maxTeamSize: { type: Number, default: 11 },
    skillLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'any'],
      default: 'any'
    },
    ageGroup: {
      type: String,
      enum: ['under_18', '18_25', '25_35', '35_plus', 'any'],
      default: 'any'
    }
  },
  participants: [{
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      required: true
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined'],
      default: 'pending'
    }
  }],
  maxParticipants: {
    type: Number,
    default: 2,
    min: 2
  },
  status: {
    type: String,
    enum: ['open', 'full', 'in_progress', 'completed', 'cancelled'],
    default: 'open'
  },
  visibility: {
    type: String,
    enum: ['public', 'private', 'friends_only'],
    default: 'public'
  },
  invitedTeams: [{
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team'
    },
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
  rules: {
    matchDuration: { type: Number, default: 90 }, // minutes
    extraTime: { type: Boolean, default: false },
    penalties: { type: Boolean, default: true },
    substitutions: { type: Number, default: 3 },
    customRules: [String]
  },
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  },
  result: {
    winner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team'
    },
    score: {
      team1: Number,
      team2: Number
    },
    completedAt: Date,
    notes: String
  },
  fairPlay: {
    reports: [{
      reportedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      reportedTeam: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team'
      },
      reason: String,
      severity: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'low'
      },
      reportedAt: {
        type: Date,
        default: Date.now
      }
    }],
    overallRating: {
      type: Number,
      min: 1,
      max: 5,
      default: 5
    }
  },
  chat: {
    enabled: { type: Boolean, default: true },
    messages: [{
      sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      message: String,
      timestamp: {
        type: Date,
        default: Date.now
      }
    }]
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
challengeSchema.index({ creator: 1, createdAt: -1 });
challengeSchema.index({ sport: 1, status: 1 });
challengeSchema.index({ proposedDateTime: 1 });
challengeSchema.index({ status: 1, visibility: 1 });
challengeSchema.index({ 'venue.turf': 1 });

// Virtual for time ago
challengeSchema.virtual('timeAgo').get(function() {
  const now = new Date();
  const diff = now - this.createdAt;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return 'Just now';
});

// Virtual for participant count
challengeSchema.virtual('participantCount').get(function() {
  return this.participants.filter(p => p.status === 'accepted').length;
});

// Virtual for is full
challengeSchema.virtual('isFull').get(function() {
  return this.participantCount >= this.maxParticipants;
});

// Method to add participant
challengeSchema.methods.addParticipant = function(teamId) {
  if (this.isFull) {
    throw new Error('Challenge is full');
  }
  
  const existingParticipant = this.participants.find(
    p => p.team.toString() === teamId.toString()
  );
  
  if (existingParticipant) {
    throw new Error('Team already participating');
  }
  
  this.participants.push({
    team: teamId,
    status: 'accepted'
  });
  
  if (this.participantCount >= this.maxParticipants) {
    this.status = 'full';
  }
  
  return this.save();
};

// Method to remove participant
challengeSchema.methods.removeParticipant = function(teamId) {
  this.participants = this.participants.filter(
    p => p.team.toString() !== teamId.toString()
  );
  
  if (this.status === 'full' && this.participantCount < this.maxParticipants) {
    this.status = 'open';
  }
  
  return this.save();
};

// Method to start challenge
challengeSchema.methods.startChallenge = function() {
  if (this.participantCount < 2) {
    throw new Error('Need at least 2 participants to start');
  }
  
  this.status = 'in_progress';
  return this.save();
};

// Method to complete challenge
challengeSchema.methods.completeChallenge = function(winnerId, score, notes) {
  this.status = 'completed';
  this.result = {
    winner: winnerId,
    score: score,
    completedAt: new Date(),
    notes: notes
  };
  return this.save();
};

module.exports = mongoose.model('Challenge', challengeSchema);