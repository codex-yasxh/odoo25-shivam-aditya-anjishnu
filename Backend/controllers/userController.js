const User = require('../models/User');
const Swap = require('../models/Swap');
const Feedback = require('../models/Feedback');
const jwt = require('jsonwebtoken');

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Register new user
exports.register = async (req, res) => {
  try {
    const { name, email, password, location } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'User already exists with this email' 
      });
    }

    // Create new user
    const user = new User({
      name,
      email,
      password,
      location
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          location: user.location,
          isPublic: user.isPublic,
          role: user.role
        },
        token
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user and include password for comparison
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if user is banned
    if (user.isBanned) {
      return res.status(403).json({
        success: false,
        message: 'Account is banned',
        banReason: user.banReason
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Update last active
    user.lastActive = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          location: user.location,
          profilePhoto: user.profilePhoto,
          isPublic: user.isPublic,
          role: user.role,
          rating: user.rating
        },
        token
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
};

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user's swap statistics
    const swapStats = await Swap.getUserSwapStats(user._id);

    res.json({
      success: true,
      data: {
        user,
        swapStats
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to get profile',
      error: error.message
    });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const allowedUpdates = ['name', 'location', 'profilePhoto', 'skillsOffered', 'skillsWanted', 'availability', 'isPublic'];
    const updates = {};

    // Filter allowed updates
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
};

// Search users by skills
exports.searchUsers = async (req, res) => {
  try {
    const { skill, location, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    let query = {
      isPublic: true,
      isActive: true,
      isBanned: false,
      _id: { $ne: req.user.userId } // Exclude current user
    };

    // Add skill search
    if (skill) {
      query.$or = [
        { 'skillsOffered.skill': { $regex: skill, $options: 'i' } },
        { 'skillsWanted.skill': { $regex: skill, $options: 'i' } }
      ];
    }

    // Add location filter
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    const users = await User.find(query)
      .select('-password -email')
      .sort({ 'rating.average': -1, lastActive: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Search failed',
      error: error.message
    });
  }
};

// Get user by ID (public profile)
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -email');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.isPublic) {
      return res.status(403).json({
        success: false,
        message: 'This profile is private'
      });
    }

    // Get user's feedback summary
    const feedbackSummary = await Feedback.getUserFeedbackSummary(user._id);

    res.json({
      success: true,
      data: {
        user,
        feedbackSummary
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to get user',
      error: error.message
    });
  }
};

// Get user's feedbacks
exports.getUserFeedbacks = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const feedbacks = await Feedback.find({ 
      reviewee: req.params.id,
      isPublic: true,
      flagged: false
    })
    .populate('reviewer', 'name profilePhoto')
    .populate('swap', 'skillOffered.skill skillRequested.skill')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

    const total = await Feedback.countDocuments({ 
      reviewee: req.params.id,
      isPublic: true,
      flagged: false
    });

    res.json({
      success: true,
      data: {
        feedbacks,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to get feedbacks',
      error: error.message
    });
  }
};

// Get dashboard data
exports.getDashboard = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get user's swap statistics
    const swapStats = await Swap.getUserSwapStats(userId);

    // Get recent swaps
    const recentSwaps = await Swap.find({
      $or: [
        { requester: userId },
        { provider: userId }
      ]
    })
    .populate('requester', 'name profilePhoto')
    .populate('provider', 'name profilePhoto')
    .sort({ createdAt: -1 })
    .limit(5);

    // Get pending swap requests (as provider)
    const pendingRequests = await Swap.find({
      provider: userId,
      status: 'pending'
    })
    .populate('requester', 'name profilePhoto')
    .sort({ createdAt: -1 })
    .limit(5);

    // Get recent feedback received
    const recentFeedback = await Feedback.find({
      reviewee: userId,
      isPublic: true,
      flagged: false
    })
    .populate('reviewer', 'name profilePhoto')
    .sort({ createdAt: -1 })
    .limit(3);

    res.json({
      success: true,
      data: {
        swapStats,
        recentSwaps,
        pendingRequests,
        recentFeedback
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to get dashboard data',
      error: error.message
    });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to change password',
      error: error.message
    });
  }
};

// Delete account
exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Cancel all pending swaps
    await Swap.updateMany(
      {
        $or: [
          { requester: userId },
          { provider: userId }
        ],
        status: 'pending'
      },
      { status: 'cancelled' }
    );

    // Delete user
    await User.findByIdAndDelete(userId);

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to delete account',
      error: error.message
    });
  }
};