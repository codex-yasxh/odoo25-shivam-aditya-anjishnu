const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');

// Create feedback after a swap
router.post('/', feedbackController.createFeedback);

// Get feedback for a specific user
router.get('/user/:userId', feedbackController.getUserFeedback);

// Get feedback for a specific swap
router.get('/swap/:swapId', feedbackController.getSwapFeedback);

// Get all feedback (admin only)
router.get('/admin/all', feedbackController.getAllFeedback);

// Update feedback (only by the reviewer)
router.put('/:feedbackId', feedbackController.updateFeedback);

// Delete feedback (admin only)
router.delete('/:feedbackId', feedbackController.deleteFeedback);

module.exports = router;