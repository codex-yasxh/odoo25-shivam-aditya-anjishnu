const Swap = require('../models/Swap');
const User = require('../models/User');

// Create new swap request
exports.createSwapRequest = async (req, res) => {
  try {
    const {
      providerId,
      skillOffered,
      skillRequested,
      message,
      scheduledDate
    } = req.body;

    // Validate provider exists and is active
    const provider = await User.findById(providerId);
    if (!provider || !provider.isActive || provider.isBanned) {
      return res.status(404).json({
        success: false,
        message: 'Provider not found or inactive'
      });
    }

    // Check if requester is trying to request from themselves
    if (providerId === req.user.userId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot create swap request with yourself'
      });
    }

    // Check if there's already a pending request between these users for same skills
    const existingRequest = await Swap.findOne({
      requester: req.user.userId,
      provider: providerId,
      'skillOffered.skill': skillOffered.skill,
      'skillRequested.skill': skillRequested.skill,
      status: 'pending'
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending request for this skill swap'
      });
    }

    // Create new swap request
    const swap = new Swap({
      requester: req.user.userId,
      provider: providerId,
      skillOffered,
      skillRequested,
      message,
      scheduledDate: scheduledDate ? new Date(scheduledDate) : undefined
    });

    await swap.save();

    // Populate the swap with user details
    await swap.populate([
      { path: 'requester', select: 'name profilePhoto' },
      { path: 'provider', select: 'name profilePhoto' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Swap request created successfully',
      data: { swap }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to create swap request',
      error: error.message
    });
  }
};

// Get swap requests (received by user)
exports.getReceivedRequests = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    let query = { provider: req.user.userId };
    if (status) {
      query.status = status;
    }

    const swaps = await Swap.find(query)
      .populate('requester', 'name profilePhoto rating')
      .populate('provider', 'name profilePhoto rating')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Swap.countDocuments(query);

    res.json({
      success: true,
      data: {
        swaps,
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
      message: 'Failed to get received requests',
      error: error.message
    });
  }
};

// Get swap requests (sent by user)
exports.getSentRequests = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    let query = { requester: req.user.userId };
    if (status) {
      query.status = status;
    }

    const swaps = await Swap.find(query)
      .populate('requester', 'name profilePhoto rating')
      .populate('provider', 'name profilePhoto rating')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Swap.countDocuments(query);

    res.json({
      success: true,
      data: {
        swaps,
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
      message: 'Failed to get sent requests',
      error: error.message
    });
  }
};

// Get all user's swaps
exports.getUserSwaps = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    let query = {
      $or: [
        { requester: req.user.userId },
        { provider: req.user.userId }
      ]
    };

    if (status) {
      query.status = status;
    }

    const swaps = await Swap.find(query)
      .populate('requester', 'name profilePhoto rating')
      .populate('provider', 'name profilePhoto rating')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Swap.countDocuments(query);

    res.json({
      success: true,
      data: {
        swaps,
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
      message: 'Failed to get user swaps',
      error: error.message
    });
  }
};

// Get single swap by ID
exports.getSwapById = async (req, res) => {
  try {
    const swap = await Swap.findById(req.params.id)
      .populate('requester', 'name profilePhoto rating email')
      .populate('provider', 'name profilePhoto rating email');

    if (!swap) {
      return res.status(404).json({
        success: false,
        message: 'Swap not found'
      });
    }

    // Check if user is part of this swap
    if (!swap.requester._id.equals(req.user.userId) && !swap.provider._id.equals(req.user.userId)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: { swap }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to get swap',
      error: error.message
    });
  }
};

// Accept swap request
exports.acceptSwapRequest = async (req, res) => {
  try {
    const swap = await Swap.findById(req.params.id);

    if (!swap) {
      return res.status(404).json({
        success: false,
        message: 'Swap request not found'
      });
    }

    // Check if user is the provider
    if (!swap.provider.equals(req.user.userId)) {
      return res.status(403).json({
        success: false,
        message: 'Only the provider can accept this request'
      });
    }

    // Check if swap can be accepted
    if (!swap.canBeAccepted()) {
      return res.status(400).json({
        success: false,
        message: 'This swap request cannot be accepted'
      });
    }

    swap.status = 'accepted';
    await swap.save();

    await swap.populate([
      { path: 'requester', select: 'name profilePhoto' },
      { path: 'provider', select: 'name profilePhoto' }
    ]);

    res.json({
      success: true,
      message: 'Swap request accepted successfully',
      data: { swap }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to accept swap request',
      error: error.message
    });
  }
};

// Reject swap request
exports.rejectSwapRequest = async (req, res) => {
  try {
    const { rejectionReason } = req.body;
    const swap = await Swap.findById(req.params.id);

    if (!swap) {
      return res.status(404).json({
        success: false,
        message: 'Swap request not found'
      });
    }

    // Check if user is the provider
    if (!swap.provider.equals(req.user.userId)) {
      return res.status(403).json({
        success: false,
        message: 'Only the provider can reject this request'
      });
    }

    // Check if swap can be rejected
    if (!swap.canBeRejected()) {
      return res.status(400).json({
        success: false,
        message: 'This swap request cannot be rejected'
      });
    }

    swap.status = 'rejected';
    swap.rejectionReason = rejectionReason;
    await swap.save();

    await swap.populate([
      { path: 'requester', select: 'name profilePhoto' },
      { path: 'provider', select: 'name profilePhoto' }
    ]);

    res.json({
      success: true,
      message: 'Swap request rejected successfully',
      data: { swap }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to reject swap request',
      error: error.message
    });
  }
};

// Cancel swap request (by requester)
exports.cancelSwapRequest = async (req, res) => {
  try {
    const swap = await Swap.findById(req.params.id);

    if (!swap) {
      return res.status(404).json({
        success: false,
        message: 'Swap request not found'
      });
    }

    // Check if user is the requester
    if (!swap.requester.equals(req.user.userId)) {
      return res.status(403).json({
        success: false,
        message: 'Only the requester can cancel this request'
      });
    }

    // Check if swap can be cancelled
    if (!swap.canBeCancelled()) {
      return res.status(400).json({
        success: false,
        message: 'This swap request cannot be cancelled'
      });
    }

    swap.status = 'cancelled';
    await swap.save();

    await swap.populate([
      { path: 'requester', select: 'name profilePhoto' },
      { path: 'provider', select: 'name profilePhoto' }
    ]);

    res.json({
      success: true,
      message: 'Swap request cancelled successfully',
      data: { swap }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to cancel swap request',
      error: error.message
    });
  }
};

// Start swap (move to in_progress)
exports.startSwap = async (req, res) => {
  try {
    const swap = await Swap.findById(req.params.id);

    if (!swap) {
      return res.status(404).json({
        success: false,
        message: 'Swap not found'
      });
    }

    // Check if user is part of this swap
    if (!swap.requester.equals(req.user.userId) && !swap.provider.equals(req.user.userId)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check if swap is accepted
    if (swap.status !== 'accepted') {
      return res.status(400).json({
        success: false,
        message: 'Swap must be accepted before starting'
      });
    }

    swap.status = 'in_progress';
    swap.contactExchanged = true;
    await swap.save();

    await swap.populate([
      { path: 'requester', select: 'name profilePhoto email' },
      { path: 'provider', select: 'name profilePhoto email' }
    ]);

    res.json({
      success: true,
      message: 'Swap started successfully',
      data: { swap }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to start swap',
      error: error.message
    });
  }
};

// Mark swap as completed by user
exports.markSwapCompleted = async (req, res) => {
  try {
    const swap = await Swap.findById(req.params.id);

    if (!swap) {
      return res.status(404).json({
        success: false,
        message: 'Swap not found'
      });
    }

    // Check if user is part of this swap
    if (!swap.requester.equals(req.user.userId) && !swap.provider.equals(req.user.userId)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check if swap is in progress
    if (swap.status !== 'in_progress') {
      return res.status(400).json({
        success: false,
        message: 'Swap must be in progress to mark as completed'
      });
    }

    // Mark completion based on who is marking it
    if (swap.requester.equals(req.user.userId)) {
      swap.isRequesterCompleted = true;
    } else {
      swap.isProviderCompleted = true;
    }

    await swap.save();

    // If both marked as completed, update user stats
    if (swap.status === 'completed') {
      await User.findByIdAndUpdate(swap.requester, { $inc: { completedSwaps: 1 } });
      await User.findByIdAndUpdate(swap.provider, { $inc: { completedSwaps: 1 } });
    }

    await swap.populate([
      { path: 'requester', select: 'name profilePhoto' },
      { path: 'provider', select: 'name profilePhoto' }
    ]);

    res.json({
      success: true,
      message: swap.status === 'completed' ? 'Swap completed successfully' : 'Marked as completed',
      data: { swap }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to mark swap as completed',
      error: error.message
    });
  }
};

// Update swap details
exports.updateSwap = async (req, res) => {
  try {
    const { scheduledDate, message } = req.body;
    const swap = await Swap.findById(req.params.id);

    if (!swap) {
      return res.status(404).json({
        success: false,
        message: 'Swap not found'
      });
    }

    // Check if user is part of this swap
    if (!swap.requester.equals(req.user.userId) && !swap.provider.equals(req.user.userId)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Only allow updates for accepted or in_progress swaps
    if (!['accepted', 'in_progress'].includes(swap.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot update swap in current status'
      });
    }

    // Update allowed fields
    if (scheduledDate) {
      swap.scheduledDate = new Date(scheduledDate);
    }
    if (message) {
      swap.message = message;
    }

    await swap.save();

    await swap.populate([
      { path: 'requester', select: 'name profilePhoto' },
      { path: 'provider', select: 'name profilePhoto' }
    ]);

    res.json({
      success: true,
      message: 'Swap updated successfully',
      data: { swap }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to update swap',
      error: error.message
    });
  }
};

// Delete swap request (only if pending)
exports.deleteSwapRequest = async (req, res) => {
  try {
    const swap = await Swap.findById(req.params.id);

    if (!swap) {
      return res.status(404).json({
        success: false,
        message: 'Swap request not found'
      });
    }

    // Check if user is the requester
    if (!swap.requester.equals(req.user.userId)) {
      return res.status(403).json({
        success: false,
        message: 'Only the requester can delete this request'
      });
    }

    // Only allow deletion of pending requests
    if (swap.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending requests can be deleted'
      });
    }

    await Swap.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Swap request deleted successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to delete swap request',
      error: error.message
    });
  }
};