const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  deleteUser,
  getAllUsers,
  searchUsers,
  toggleProfileVisibility
} = require('../controllers/userController');

// Import middleware
const authMiddleware = require('../middleware/authMiddleware');

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/search', searchUsers);
router.get('/public', getAllUsers);
router.get('/profile/:id', getUserProfile);

// Protected routes (require authentication)
router.get('/me', authMiddleware, getUserProfile);
router.put('/me', authMiddleware, updateUserProfile);
router.delete('/me', authMiddleware, deleteUser);
router.put('/privacy', authMiddleware, toggleProfileVisibility);

module.exports = router;