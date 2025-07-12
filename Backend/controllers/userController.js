const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const validator = require('validator');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// Register new user
const registerUser = async (req, res) => {
  try {
    const { name, email, password, location, skillsOffered, skillsWanted, availability } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Please provide name, email, and password' });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ error: 'Please provide a valid email' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      location,
      skillsOffered: skillsOffered || [],
      skillsWanted: skillsWanted || [],
      availability: availability || []
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        location: user.location,
        skillsOffered: user.skillsOffered,
        skillsWanted: user.skillsWanted,
        availability: user.availability,
        profilePhoto: user.profilePhoto,
        isPublic: user.isPublic
      },
      token
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Login user
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide email and password' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Check if user is banned
    if (user.status === 'banned') {
      return res.status(403).json({ 
        error: 'Account is banned',
        reason: user.banReason 
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        location: user.location,
        skillsOffered: user.skillsOffered,
        skillsWanted: user.skillsWanted,
        availability: user.availability,
        profilePhoto: user.profilePhoto,
        isPublic: user.isPublic,
        role: user.role,
        averageRating: user.averageRating,
        totalReviews: user.totalReviews
      },
      token
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get user profile
const getUserProfile = async (req, res) => {
  try {
    const userId = req.params.id || req.user.id;
    
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // If it's not the current user and profile is private, restrict access
    if (userId !== req.user?.id && !user.isPublic) {
      return res.status(403).json({ error: 'Profile is private' });
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: userId === req.user?.id ? user.email : undefined, // Only show email to self
        location: user.location,
        skillsOffered: user.skillsOffered,
        skillsWanted: user.skillsWanted,
        availability: user.availability,
        profilePhoto: user.profilePhoto,
        isPublic: user.isPublic,
        averageRating: user.averageRating,
        totalReviews: user.totalReviews,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update user profile
const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, location, skillsOffered, skillsWanted, availability, profilePhoto } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update fields
    if (name) user.name = name;
    if (location !== undefined) user.location = location;
    if (skillsOffered) user.skillsOffered = skillsOffered;
    if (skillsWanted) user.skillsWanted = skillsWanted;
    if (availability) user.availability = availability;
    if (profilePhoto !== undefined) user.profilePhoto = profilePhoto;

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        location: user.location,
        skillsOffered: user.skillsOffered,
        skillsWanted: user.skillsWanted,
        availability: user.availability,
        profilePhoto: user.profilePhoto,
        isPublic: user.isPublic,
        averageRating: user.averageRating,
        totalReviews: user.totalReviews
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete user account
const deleteUser = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // You might want to handle related data cleanup here
    // For example, cancel all pending swaps, etc.

    await User.findByIdAndDelete(userId);

    res.json({ message: 'User account deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all public users with pagination
const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skill = req.query.skill;
    const location = req.query.location;

    let query = { isPublic: true, status: 'active' };

    if (skill) {
      query.skillsOffered = { $regex: skill, $options: 'i' };
    }

    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    const users = await User.find(query)
      .select('-password -email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Search users by skill
const searchUsers = async (req, res) => {
  try {
    const { skill, location } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    if (!skill) {
      return res.status(400).json({ error: 'Please provide a skill to search for' });
    }

    let query = { 
      isPublic: true, 
      status: 'active',
      skillsOffered: { $regex: skill, $options: 'i' }
    };

    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    const users = await User.find(query)
      .select('-password -email')
      .sort({ averageRating: -1, totalReviews: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
      searchTerm: skill
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Toggle profile visibility
const toggleProfileVisibility = async (req, res) => {
  try {
    const userId = req.user.id;
    const { isPublic } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.isPublic = isPublic;
    await user.save();

    res.json({
      message: `Profile is now ${isPublic ? 'public' : 'private'}`,
      isPublic: user.isPublic
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  deleteUser,
  getAllUsers,
  searchUsers,
  toggleProfileVisibility
};