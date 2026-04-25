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
        city: city || req.user.location.city,
        district: district || req.user.location.district,
        area: area || req.user.location.area
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

module.exports = router;
