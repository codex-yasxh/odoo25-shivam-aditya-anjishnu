const express = require('express');
const router = express.Router();
const {
  createSwapRequest,
  getUserSwaps,
  updateSwapStatus,
  deleteSwapRequest,
  getSwapById,
  getReceivedSwaps,
  getSentSwaps
} = require('../controllers/swapController');

// Import middleware
const authMiddleware = require('../middleware/authMiddleware');

// All swap routes require authentication
router.use(authMiddleware);

// Create a new swap request
router.post('/', createSwapRequest);

// Get all swaps for current user
router.get('/', getUserSwaps);

// Get swaps received by current user
router.get('/received', getReceivedSwaps);

// Get swaps sent by current user
router.get('/sent', getSentSwaps);

// Get specific swap by ID
router.get('/:id', getSwapById);

// Update swap status (accept/reject)
router.put('/:id/status', updateSwapStatus);

// Delete swap request
router.delete('/:id', deleteSwapRequest);

module.exports = router;