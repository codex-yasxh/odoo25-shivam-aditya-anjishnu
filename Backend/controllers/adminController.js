const User = require('../models/User');
const Swap = require('../models/Swap');
const Feedback = require('../models/Feedback');

// Get all users with pagination
const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const status = req.query.status || 'all'; // all, active, banned

    let query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    if (status !== 'all') {
      query.status = status;
    }

    const users = await User.find(query)
      .select('-password')
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

// Ban/Unban user
const updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, reason } = req.body; // status: 'active' or 'banned'

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(403).json({ error: 'Cannot ban admin users' });
    }

    user.status = status;
    if (status === 'banned') {
      user.banReason = reason;
      user.bannedAt = new Date();
    } else {
      user.banReason = undefined;
      user.bannedAt = undefined;
    }

    await user.save();

    // If user is banned, cancel all their pending swaps
    if (status === 'banned') {
      await Swap.updateMany(
        {
          $and: [
            { $or: [{ requesterId: userId }, { receiverId: userId }] },
            { status: 'pending' }
          ]
        },
        { status: 'cancelled', cancelReason: 'User banned' }
      );
    }

    res.json({
      message: `User ${status === 'banned' ? 'banned' : 'unbanned'} successfully`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        status: user.status,
        banReason: user.banReason,
        bannedAt: user.bannedAt
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all swaps with filters
const getAllSwaps = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status || 'all'; // all, pending, accepted, completed, cancelled
    const search = req.query.search || '';

    let query = {};
    
    if (status !== 'all') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { skillOffered: { $regex: search, $options: 'i' } },
        { skillRequested: { $regex: search, $options: 'i' } }
      ];
    }

    const swaps = await Swap.find(query)
      .populate('requesterId', 'name email profilePhoto')
      .populate('receiverId', 'name email profilePhoto')
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

// Cancel swap (admin action)
const cancelSwap = async (req, res) => {
  try {
    const { swapId } = req.params;
    const { reason } = req.body;

    const swap = await Swap.findById(swapId);
    if (!swap) {
      return res.status(404).json({ error: 'Swap not found' });
    }

    if (swap.status === 'completed' || swap.status === 'cancelled') {
      return res.status(400).json({ error: 'Cannot cancel completed or already cancelled swap' });
    }

    swap.status = 'cancelled';
    swap.cancelReason = reason || 'Cancelled by admin';
    swap.cancelledAt = new Date();

    await swap.save();

    res.json({
      message: 'Swap cancelled successfully',
      swap
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get platform statistics
const getPlatformStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ status: 'active' });
    const bannedUsers = await User.countDocuments({ status: 'banned' });
    
    const totalSwaps = await Swap.countDocuments();
    const pendingSwaps = await Swap.countDocuments({ status: 'pending' });
    const completedSwaps = await Swap.countDocuments({ status: 'completed' });
    const cancelledSwaps = await Swap.countDocuments({ status: 'cancelled' });
    
    const totalFeedback = await Feedback.countDocuments();
    const avgRating = await Feedback.aggregate([
      { $group: { _id: null, avgRating: { $avg: '$rating' } } }
    ]);

    // Get most popular skills
    const popularSkills = await User.aggregate([
      { $unwind: '$skillsOffered' },
      { $group: { _id: '$skillsOffered', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentUsers = await User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
    const recentSwaps = await Swap.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });

    res.json({
      users: {
        total: totalUsers,
        active: activeUsers,
        banned: bannedUsers,
        recentSignups: recentUsers
      },
      swaps: {
        total: totalSwaps,
        pending: pendingSwaps,
        completed: completedSwaps,
        cancelled: cancelledSwaps,
        recent: recentSwaps
      },
      feedback: {
        total: totalFeedback,
        averageRating: avgRating.length > 0 ? Math.round(avgRating[0].avgRating * 10) / 10 : 0
      },
      popularSkills: popularSkills.map(skill => ({
        skill: skill._id,
        count: skill.count
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Send platform-wide message
const sendPlatformMessage = async (req, res) => {
  try {
    const { title, message, type } = req.body; // type: 'info', 'warning', 'maintenance'
    
    // In a real app, you might store these messages in a database
    // and send them via email, push notifications, or in-app notifications
    
    // For now, we'll just log it and return success
    console.log('Platform message sent:', { title, message, type, timestamp: new Date() });
    
    // You could implement email sending here using nodemailer or similar
    // const users = await User.find({ status: 'active' }, 'email');
    // Send email to all active users
    
    res.json({
      message: 'Platform message sent successfully',
      details: {
        title,
        message,
        type,
        timestamp: new Date()
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get reports data for download
const getReportsData = async (req, res) => {
  try {
    const { type } = req.query; // 'users', 'swaps', 'feedback', 'all'
    
    const reports = {};
    
    if (type === 'users' || type === 'all') {
      reports.users = await User.find({})
        .select('name email location skillsOffered skillsWanted averageRating totalReviews status createdAt')
        .lean();
    }
    
    if (type === 'swaps' || type === 'all') {
      reports.swaps = await Swap.find({})
        .populate('requesterId', 'name email')
        .populate('receiverId', 'name email')
        .lean();
    }
    
    if (type === 'feedback' || type === 'all') {
      reports.feedback = await Feedback.find({})
        .populate('reviewerId', 'name email')
        .populate('revieweeId', 'name email')
        .populate('swapId', 'skillOffered skillRequested')
        .lean();
    }
    
    res.json({
      message: 'Reports data retrieved successfully',
      data: reports,
      generatedAt: new Date()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Review and approve/reject skill descriptions
const reviewSkillDescription = async (req, res) => {
  try {
    const { userId } = req.params;
    const { action, reason } = req.body; // action: 'approve', 'reject'
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (action === 'reject') {
      // You might want to flag the user or require them to update their skills
      user.skillsApproved = false;
      user.skillsRejectionReason = reason;
      await user.save();
      
      res.json({
        message: 'Skills rejected',
        user: {
          id: user._id,
          name: user.name,
          skillsApproved: user.skillsApproved,
          rejectionReason: user.skillsRejectionReason
        }
      });
    } else {
      user.skillsApproved = true;
      user.skillsRejectionReason = undefined;
      await user.save();
      
      res.json({
        message: 'Skills approved',
        user: {
          id: user._id,
          name: user.name,
          skillsApproved: user.skillsApproved
        }
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllUsers,
  updateUserStatus,
  getAllSwaps,
  cancelSwap,
  getPlatformStats,
  sendPlatformMessage,
  getReportsData,
  reviewSkillDescription
};