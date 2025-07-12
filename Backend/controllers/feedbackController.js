const Feedback = require('../models/Feedback');
const Swap = require('../models/Swap');
const User = require('../models/User');

// Create feedback after a swap
const createFeedback = async (req, res) => {
  try {
    const { swapId, rating, comment } = req.body;
    const reviewerId = req.user.id; // Assuming auth middleware sets req.user

    // Check if swap exists and is completed
    const swap = await Swap.findById(swapId);
    if (!swap) {
      return res.status(404).json({ error: 'Swap not found' });
    }

    if (swap.status !== 'completed') {
      return res.status(400).json({ error: 'Can only review completed swaps' });
    }

    // Check if user is part of this swap
    if (swap.requesterId.toString() !== reviewerId && swap.receiverId.toString() !== reviewerId) {
      return res.status(403).json({ error: 'You can only review swaps you participated in' });
    }

    // Determine who is being reviewed
    const revieweeId = swap.requesterId.toString() === reviewerId ? swap.receiverId : swap.requesterId;

    // Check if feedback already exists
    const existingFeedback = await Feedback.findOne({
      swapId,
      reviewerId,
      revieweeId
    });

    if (existingFeedback) {
      return res.status(400).json({ error: 'Feedback already submitted for this swap' });
    }

    // Create feedback
    const feedback = new Feedback({
      swapId,
      reviewerId,
      revieweeId,
      rating,
      comment
    });

    await feedback.save();

    // Update user's average rating
    await updateUserRating(revieweeId);

    res.status(201).json({
      message: 'Feedback submitted successfully',
      feedback
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get feedback for a user
const getUserFeedback = async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const feedback = await Feedback.find({ revieweeId: userId })
      .populate('reviewerId', 'name profilePhoto')
      .populate('swapId', 'skillOffered skillRequested')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Feedback.countDocuments({ revieweeId: userId });

    res.json({
      feedback,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get feedback given by a user
const getFeedbackByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const feedback = await Feedback.find({ reviewerId: userId })
      .populate('revieweeId', 'name profilePhoto')
      .populate('swapId', 'skillOffered skillRequested')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Feedback.countDocuments({ reviewerId: userId });

    res.json({
      feedback,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update feedback (only by the reviewer)
const updateFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const reviewerId = req.user.id;

    const feedback = await Feedback.findById(id);
    if (!feedback) {
      return res.status(404).json({ error: 'Feedback not found' });
    }

    if (feedback.reviewerId.toString() !== reviewerId) {
      return res.status(403).json({ error: 'You can only update your own feedback' });
    }

    feedback.rating = rating || feedback.rating;
    feedback.comment = comment || feedback.comment;
    feedback.updatedAt = Date.now();

    await feedback.save();

    // Update user's average rating
    await updateUserRating(feedback.revieweeId);

    res.json({
      message: 'Feedback updated successfully',
      feedback
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete feedback (only by the reviewer)
const deleteFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const reviewerId = req.user.id;

    const feedback = await Feedback.findById(id);
    if (!feedback) {
      return res.status(404).json({ error: 'Feedback not found' });
    }

    if (feedback.reviewerId.toString() !== reviewerId) {
      return res.status(403).json({ error: 'You can only delete your own feedback' });
    }

    const revieweeId = feedback.revieweeId;
    await Feedback.findByIdAndDelete(id);

    // Update user's average rating
    await updateUserRating(revieweeId);

    res.json({ message: 'Feedback deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Helper function to update user's average rating
const updateUserRating = async (userId) => {
  try {
    const feedbacks = await Feedback.find({ revieweeId: userId });
    
    if (feedbacks.length === 0) {
      await User.findByIdAndUpdate(userId, { 
        averageRating: 0,
        totalReviews: 0 
      });
      return;
    }

    const totalRating = feedbacks.reduce((sum, feedback) => sum + feedback.rating, 0);
    const averageRating = totalRating / feedbacks.length;

    await User.findByIdAndUpdate(userId, { 
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
      totalReviews: feedbacks.length 
    });
  } catch (error) {
    console.error('Error updating user rating:', error);
  }
};

module.exports = {
  createFeedback,
  getUserFeedback,
  getFeedbackByUser,
  updateFeedback,
  deleteFeedback
};