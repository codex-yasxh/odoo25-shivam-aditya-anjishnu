const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  swap: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Swap',
    required: true
  },
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reviewee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  categories: {
    skillQuality: {
      type: Number,
      min: 1,
      max: 5
    },
    communication: {
      type: Number,
      min: 1,
      max: 5
    },
    reliability: {
      type: Number,
      min: 1,
      max: 5
    },
    professionalism: {
      type: Number,
      min: 1,
      max: 5
    }
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  // Admin moderation
  flagged: {
    type: Boolean,
    default: false
  },
  flagReason: {
    type: String,
    trim: true
  },
  adminReviewed: {
    type: Boolean,
    default: false
  },
  adminNotes: {
    type: String,
    trim: true
  },
  // Helpful votes from other users
  helpfulVotes: {
    type: Number,
    default: 0
  },
  reportedCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
feedbackSchema.index({ reviewee: 1, createdAt: -1 });
feedbackSchema.index({ reviewer: 1, createdAt: -1 });
feedbackSchema.index({ swap: 1 });
feedbackSchema.index({ rating: 1 });

// Prevent duplicate feedback for same swap from same reviewer
feedbackSchema.index({ swap: 1, reviewer: 1 }, { unique: true });

// Prevent self-feedback
feedbackSchema.pre('save', function(next) {
  if (this.reviewer.equals(this.reviewee)) {
    next(new Error('Cannot leave feedback for yourself'));
  }
  next();
});

// Update reviewee's rating after saving feedback
feedbackSchema.post('save', async function(doc) {
  try {
    const User = mongoose.model('User');
    
    // Calculate new average rating for the reviewee
    const feedbacks = await this.constructor.find({ 
      reviewee: doc.reviewee, 
      flagged: false 
    });
    
    const totalRating = feedbacks.reduce((sum, feedback) => sum + feedback.rating, 0);
    const avgRating = totalRating / feedbacks.length;
    
    await User.findByIdAndUpdate(doc.reviewee, {
      'rating.average': Math.round(avgRating * 10) / 10, // Round to 1 decimal
      'rating.count': feedbacks.length
    });
  } catch (error) {
    console.error('Error updating user rating:', error);
  }
});

// Update reviewee's rating after feedback deletion
feedbackSchema.post('findOneAndDelete', async function(doc) {
  if (doc) {
    try {
      const User = mongoose.model('User');
      
      const feedbacks = await this.constructor.find({ 
        reviewee: doc.reviewee, 
        flagged: false 
      });
      
      if (feedbacks.length > 0) {
        const totalRating = feedbacks.reduce((sum, feedback) => sum + feedback.rating, 0);
        const avgRating = totalRating / feedbacks.length;
        
        await User.findByIdAndUpdate(doc.reviewee, {
          'rating.average': Math.round(avgRating * 10) / 10,
          'rating.count': feedbacks.length
        });
      } else {
        await User.findByIdAndUpdate(doc.reviewee, {
          'rating.average': 0,
          'rating.count': 0
        });
      }
    } catch (error) {
      console.error('Error updating user rating after deletion:', error);
    }
  }
});

// Get feedback summary for a user
feedbackSchema.statics.getUserFeedbackSummary = async function(userId) {
  const summary = await this.aggregate([
    {
      $match: { 
        reviewee: mongoose.Types.ObjectId(userId),
        flagged: false
      }
    },
    {
      $group: {
        _id: null,
        totalFeedbacks: { $sum: 1 },
        averageRating: { $avg: '$rating' },
        ratingDistribution: {
          $push: '$rating'
        },
        averageSkillQuality: { $avg: '$categories.skillQuality' },
        averageCommunication: { $avg: '$categories.communication' },
        averageReliability: { $avg: '$categories.reliability' },
        averageProfessionalism: { $avg: '$categories.professionalism' }
      }
    }
  ]);

  if (summary.length === 0) {
    return {
      totalFeedbacks: 0,
      averageRating: 0,
      ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      categories: {
        skillQuality: 0,
        communication: 0,
        reliability: 0,
        professionalism: 0
      }
    };
  }

  const result = summary[0];
  
  // Calculate rating distribution
  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  result.ratingDistribution.forEach(rating => {
    distribution[rating] = (distribution[rating] || 0) + 1;
  });

  return {
    totalFeedbacks: result.totalFeedbacks,
    averageRating: Math.round(result.averageRating * 10) / 10,
    ratingDistribution: distribution,
    categories: {
      skillQuality: Math.round((result.averageSkillQuality || 0) * 10) / 10,
      communication: Math.round((result.averageCommunication || 0) * 10) / 10,
      reliability: Math.round((result.averageReliability || 0) * 10) / 10,
      professionalism: Math.round((result.averageProfessionalism || 0) * 10) / 10
    }
  };
};

module.exports = mongoose.model('Feedback', feedbackSchema);