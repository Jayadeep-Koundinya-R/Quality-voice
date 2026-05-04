const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Review = require('../models/Review');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

// GET /api/users/profile — get current user profile
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Get user's reviews
    const reviews = await Review.find({ userId: req.user._id })
      .populate('shopId', 'name category city')
      .sort({ createdAt: -1 });

    res.json({ user, reviews });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PUT /api/users/profile — update profile
router.put('/profile', protect, upload.single('avatar'), async (req, res) => {
  try {
    const { name, city, district, area, mobile } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (mobile) updateData.mobile = mobile;
    if (city || district || area) {
      updateData.location = {
        city: city || (req.user.location ? req.user.location.city : ''),
        district: district || (req.user.location ? req.user.location.district : ''),
        area: area || (req.user.location ? req.user.location.area : '')
      };
    }
    if (req.file) {
      updateData.avatar = `/uploads/${req.file.filename}`;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({ user: updatedUser });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/users/:id — get any user's public profile
router.get('/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select(
      '-password -email -mobile'
    );
    if (!user) return res.status(404).json({ message: 'User not found' });

    const reviews = await Review.find({ userId: req.params.id })
      .populate('shopId', 'name category city')
      .sort({ createdAt: -1 });

    res.json({ user, reviews });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/users/search?q=name — search users by name
router.get('/search/query', protect, async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) {
      return res.json({ users: [] });
    }

    const users = await User.find({
      name: new RegExp(q.trim(), 'i'),
      _id: { $ne: req.user._id }
    })
      .select('name avatar location followers following')
      .limit(20);

    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/users/saved-shops — get current user's saved shops
router.get('/saved-shops/list', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('savedShops');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const Shop = require('../models/Shop');
    const shops = await Shop.find({ _id: { $in: user.savedShops || [] } });
    res.json({ savedShops: shops });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/users/saved-shops/:shopId — save or unsave a shop
router.post('/saved-shops/:shopId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const shopId = req.params.shopId;
    const isSaved = user.savedShops?.some(id => id.toString() === shopId);

    if (isSaved) {
      await User.findByIdAndUpdate(req.user._id, { $pull: { savedShops: shopId } });
      res.json({ saved: false, message: 'Shop removed from saved' });
    } else {
      await User.findByIdAndUpdate(req.user._id, { $addToSet: { savedShops: shopId } });
      res.json({ saved: true, message: 'Shop saved' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
