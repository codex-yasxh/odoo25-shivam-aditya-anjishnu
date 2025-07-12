const Swap = require('../models/Swap');
const User = require('../models/User');

// Create a new swap request
const createSwapRequest = async (req, res) => {
  try {
    const { receiverId, skillOffered, skillRequested, message } = req.body;
    const requesterId = req.user.id;

    // Validation
    if (!receiverId || !skillOffered || !skillRequested) {
      return res.status(400).json({ 
        error: 'Please provide receiver ID, skill offered, and skill requested' 
      });
    }

    // Check if user is trying to create swap with themselves
    if (requesterId === receiverId) {
      return res.status(400).json({ error: 'You cannot create a swap with yourself' });
    }

    // Check if receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ error: 'Receiver not found' });
    }

    // Check if receiver has the requested skill
    if (!receiver.skillsOffered.includes(skillRequested)) {
      return res.status(400).json({ 
        error: 'Receiver does not offer the requested skill' 
      });
    }

    // Check if requester has the offered skill
    const requester = await User.findById(requesterId);
    if (!requester.skillsOffered.includes(skillOffered)) {
      return res.status(400).json({ 
        error: 'You do not offer the skill you are trying to swap' 
      });
    }

    // Check if similar swap request already exists
    const existingSwap = await Swap.findOne({
      requesterId,
      receiverId,
      skillOffered,
      skillRequested,
      status: 'pending'
    });

    if (existingSwap) {
      return res.status(400).json({ 
        error: 'A similar swap request already exists' 
      });
    }

    // Create swap request
    const swap = new Swap({
      requesterId,
      receiverId,
      skillOffered,
      skillRequested,
      message,
      status: 'pending'
    });

    await swap.save();

    // Populate the swap with user details
    const populatedSwap = await Swap.findById(swap._id)
      .populate('requesterId', 'name profilePhoto')
      .populate('receiverId', 'name profilePhoto');

    res.status(201).json({
      message: 'Swap request created successfully',
      swap: populatedSwap
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all swaps for current user
const getUserSwaps = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status || 'all';

    let query = {
      $or: [
        { requesterId: userId },
        { receiverId: userId }
      ]
    };

    if (status !== 'all') {
      query.status = status;
    }

    const swaps = await Swap.find(query)
      .populate('requesterId', 'name profilePhoto averageRating')
      .populate('receiverId', 'name profilePhoto averageRating')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Swap.countDocuments(query);

    res.json({
      swaps,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get swaps received by current user
const getReceivedSwaps = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status || 'all';

    let query = { receiverId: userId };

    if (status !== 'all') {
      query.status = status;
    }

    const swaps = await Swap.find(query)
      .populate('requesterId', 'name profilePhoto averageRating')
      .populate('receiverId', 'name profilePhoto averageRating')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Swap.countDocuments(query);

    res.json({
      swaps,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get swaps sent by current user
const getSentSwaps = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status || 'all';

    let query = { requesterId: userId };

    if (status !== 'all') {
      query.status = status;
    }

    const swaps = await Swap.find(query)
      .populate('requesterId', 'name profilePhoto averageRating')
      .populate('receiverId', 'name profilePhoto averageRating')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Swap.countDocuments(query);

    res.json({
      swaps,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get swap by ID
const getSwapById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const swap = await Swap.findById(id)
      .populate('requesterId', 'name profilePhoto averageRating email')
      .populate('receiverId', 'name profilePhoto averageRating email');

    if (!swap) {
      return res.status(404).json({ error: 'Swap not found' });
    }

    // Check if user is part of this swap
    if (swap.requesterId._id.toString() !== userId && swap.receiverId._id.toString() !== userId) {
      return res.status(403).json({ error: 'You can only view your own swaps' });
    }

    res.json({ swap });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update swap status (accept/reject/complete)
const updateSwapStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    const swap = await Swap.findById(id);
    if (!swap) {
      return res.status(404).json({ error: 'Swap not found' });
    }

    // Validate status
    const validStatuses = ['accepted', 'rejected', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Only receiver can accept/reject pending swaps
    if (swap.status === 'pending' && (status === 'accepted' || status === 'rejected')) {
      if (swap.receiverId.toString() !== userId) {
        return res.status(403).json({ error: 'Only the receiver can accept or reject swap requests' });
      }
    }

    // Both parties can mark as completed
    if (status === 'completed') {
      if (swap.requesterId.toString() !== userId && swap.receiverId.toString() !== userId) {
        return res.status(403).json({ error: 'Only participants can mark swap as completed' });
      }
      if (swap.status !== 'accepted') {
        return res.status(400).json({ error: 'Swap must be accepted before it can be completed' });
      }
    }

    // Both parties can cancel
    if (status === 'cancelled') {
      if (swap.requesterId.toString() !== userId && swap.receiverId.toString() !== userId) {
        return res.status(403).json({ error: 'Only participants can cancel swap' });
      }
      if (swap.status === 'completed') {
        return res.status(400).json({ error: 'Cannot cancel completed swap' });
      }
    }

    // Update swap status
    swap.status = status;
    
    if (status === 'accepted') {
      swap.acceptedAt = new Date();
    } else if (status === 'rejected') {
      swap.rejectedAt = new Date();
    } else if (status === 'completed') {
      swap.completedAt = new Date();
    } else if (status === 'cancelled') {
      swap.cancelledAt = new Date();
    }

    await swap.save();

    // Populate the updated swap
    const populatedSwap = await Swap.findById(swap._id)
      .populate('requesterId', 'name profilePhoto averageRating')
      .populate('receiverId', 'name profilePhoto averageRating');

    res.json({
      message: `Swap ${status} successfully`,
      swap: populatedSwap
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete swap request (only by requester and only if pending)
const deleteSwapRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const swap = await Swap.findById(id);
    if (!swap) {
      return res.status(404).json({ error: 'Swap not found' });
    }

    // Only requester can delete their own swap request
    if (swap.requesterId.toString() !== userId) {
      return res.status(403).json({ error: 'You can only delete your own swap requests' });
    }

    // Can only delete pending swaps
    if (swap.status !== 'pending') {
      return res.status(400).json({ error: 'Can only delete pending swap requests' });
    }

    await Swap.findByIdAndDelete(id);

    res.json({ message: 'Swap request deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createSwapRequest,
  getUserSwaps,
  getReceivedSwaps,
  getSentSwaps,
  getSwapById,
  updateSwapStatus,
  deleteSwapRequest
};