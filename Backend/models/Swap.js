const mongoose = require('mongoose');

const swapSchema = new mongoose.Schema({
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  skillOffered: {
    skill: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    estimatedHours: {
      type: Number,
      min: 1,
      max: 100
    }
  },
  skillRequested: {
    skill: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    estimatedHours: {
      type: Number,
      min: 1,
      max: 100
    }
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'in_progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  message: {
    type: String,
    trim: true,
    maxlength: 500
  },
  rejectionReason: {
    type: String,
    trim: true
  },
  scheduledDate: {
    type: Date
  },
  completedDate: {
    type: Date
  },
  isRequesterCompleted: {
    type: Boolean,
    default: false
  },
  isProviderCompleted: {
    type: Boolean,
    default: false
  },
  // Tracking who initiated what
  requesterSkillDelivered: {
    type: Boolean,
    default: false
  },
  providerSkillDelivered: {
    type: Boolean,
    default: false
  },
  // Contact information exchange
  contactExchanged: {
    type: Boolean,
    default: false
  },
  // Admin monitoring
  flagged: {
    type: Boolean,
    default: false
  },
  flagReason: {
    type: String,
    trim: true
  },
  adminNotes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
swapSchema.index({ requester: 1, status: 1 });
swapSchema.index({ provider: 1, status: 1 });
swapSchema.index({ status: 1, createdAt: -1 });
swapSchema.index({ 'skillOffered.skill': 1, 'skillRequested.skill': 1 });

// Prevent user from requesting swap with themselves
swapSchema.pre('save', function(next) {
  if (this.requester.equals(this.provider)) {
    next(new Error('Cannot create swap request with yourself'));
  }
  next();
});

// Auto-complete swap when both parties mark as completed
swapSchema.pre('save', function(next) {
  if (this.isRequesterCompleted && this.isProviderCompleted && this.status === 'in_progress') {
    this.status = 'completed';
    this.completedDate = new Date();
  }
  next();
});

// Check if swap can be cancelled
swapSchema.methods.canBeCancelled = function() {
  return ['pending', 'accepted', 'in_progress'].includes(this.status);
};

// Check if swap can be accepted
swapSchema.methods.canBeAccepted = function() {
  return this.status === 'pending';
};

// Check if swap can be rejected
swapSchema.methods.canBeRejected = function() {
  return this.status === 'pending';
};

// Get swap summary for notifications
swapSchema.methods.getSwapSummary = function() {
  return {
    id: this._id,
    requesterSkill: this.skillOffered.skill,
    providerSkill: this.skillRequested.skill,
    status: this.status,
    createdAt: this.createdAt,
    scheduledDate: this.scheduledDate
  };
};

// Static method to get user's swap statistics
swapSchema.statics.getUserSwapStats = async function(userId) {
  const stats = await this.aggregate([
    {
      $match: {
        $or: [
          { requester: mongoose.Types.ObjectId(userId) },
          { provider: mongoose.Types.ObjectId(userId) }
        ]
      }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  const result = {
    total: 0,
    pending: 0,
    accepted: 0,
    rejected: 0,
    in_progress: 0,
    completed: 0,
    cancelled: 0
  };

  stats.forEach(stat => {
    result[stat._id] = stat.count;
    result.total += stat.count;
  });

  return result;
};

module.exports = mongoose.model('Swap', swapSchema);