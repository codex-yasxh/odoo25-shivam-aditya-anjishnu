const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  updateUserStatus,
  getAllSwaps,
  cancelSwap,
  getPlatformStats,
  sendPlatformMessage,
  getReportsData,
  reviewSkillDescription
} = require('../controllers/adminController');

// Middleware (you'll need to implement these)
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// Apply auth and admin middleware to all routes
router.use(authMiddleware);
router.use(adminMiddleware);

// User management
router.get('/users', getAllUsers);
router.put('/users/:userId/status', updateUserStatus);
router.put('/users/:userId/skills/review', reviewSkillDescription);

// Swap management
router.get('/swaps', getAllSwaps);
router.put('/swaps/:swapId/cancel', cancelSwap);

// Platform statistics
router.get('/stats', getPlatformStats);

// Platform messaging
router.post('/message', sendPlatformMessage);

// Reports
router.get('/reports', getReportsData);

module.exports = router;