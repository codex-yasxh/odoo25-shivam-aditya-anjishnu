const express = require('express');
const router = express.Router();
const {
  createFeedback,
  getUserFeedback,
  getFeedbackByUser,
  updateFeedback,
  deleteFeedback
} = require('../controllers/feedbackController');

// Middleware (you'll need to implement these)
const authMiddleware = require('../middleware/authMiddleware');

// Create feedback for a swap
router.post('/', authMiddleware, createFeedback);

// Get feedback for a specific user (feedback received)
router.get('/user/:userId', getUserFeedback);

// Get feedback given by a specific user
router.get('/by-user/:userId', getFeedbackByUser);

// Update feedback (only by reviewer)
router.put('/:id', authMiddleware, updateFeedback);

// Delete feedback (only by reviewer)
router.delete('/:id', authMiddleware, deleteFeedback);

module.exports = router;