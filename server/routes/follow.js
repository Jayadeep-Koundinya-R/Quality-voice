const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

// GET /api/follow/check/:userId - Check if current user follows another user
router.get('/check/:userId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isFollowing = user.followers?.some(followerId =>
      followerId.toString() === req.user._id.toString()
    );

    res.json({ isFollowing });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/follow/:userId - Follow a user
router.post('/:userId', protect, async (req, res) => {
  try {
    const userToFollow = await User.findById(req.params.userId);
    if (!userToFollow) return res.status(404).json({ message: 'User not found' });

    if (userToFollow._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot follow yourself' });
    }

    // Check if already following
    const isFollowing = userToFollow.followers?.some(followerId =>
      followerId.toString() === req.user._id.toString()
    );

    if (isFollowing) {
      return res.status(400).json({ message: 'Already following this user' });
    }

    // Add follower
    await User.findByIdAndUpdate(req.params.userId, {
      $push: { followers: req.user._id }
    });

    // Add following
    await User.findByIdAndUpdate(req.user._id, {
      $push: { following: req.params.userId }
    });

    // Create notification for the user being followed
    await Notification.create({
      recipientId: req.params.userId,
      actorId: req.user._id,
      type: 'follow',
      commentText: `${req.user.name} started following you`
    });

    res.json({ 
      message: 'Successfully followed user',
      isFollowing: true
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/follow/unfollow/:userId - Unfollow a user
router.post('/unfollow/:userId', protect, async (req, res) => {
  try {
    const userToUnfollow = await User.findById(req.params.userId);
    if (!userToUnfollow) return res.status(404).json({ message: 'User not found' });

    // Remove follower
    await User.findByIdAndUpdate(req.params.userId, {
      $pull: { followers: req.user._id }
    });

    // Remove following
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { following: req.params.userId }
    });

    res.json({ 
      message: 'Successfully unfollowed user',
      isFollowing: false
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/followers - Get current user's followers
router.get('/followers', protect, async (req, res) => {
  try {
    const followers = await User.find({ 
      _id: { $in: req.user.followers || [] } 
    }).select('name avatar city district area');

    res.json({ followers });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/following - Get users current user is following
router.get('/following', protect, async (req, res) => {
  try {
    const following = await User.find({ 
      _id: { $in: req.user.following || [] } 
    }).select('name avatar city district area');

    res.json({ following });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/follow/suggestions - Get users to follow suggestions
router.get('/suggestions', protect, async (req, res) => {
  try {
    // Get users who have written reviews but aren't followed yet
    const usersWithReviews = await User.aggregate([
      {
        $match: {
          _id: { $ne: req.user._id },
          _id: { $nin: req.user.following || [] }
        }
      },
      {
        $lookup: {
          from: 'reviews',
          localField: '_id',
          foreignField: 'userId',
          as: 'reviews'
        }
      },
      {
        $match: { reviews: { $exists: true, $ne: [] } }
      },
      { $limit: 10 }
    ]);

    // Populate with review count
    const suggestions = await User.find({
      _id: { $in: usersWithReviews.map(u => u._id) }
    }).select('name avatar city district area');

    res.json({ suggestions });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
