const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Shop = require('../models/Shop');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

// GET /api/reviews/:shopId — get all reviews for a shop
router.get('/:shopId', protect, async (req, res) => {
  try {
    const reviews = await Review.find({ shopId: req.params.shopId })
      .populate('userId', 'name avatar isVerifiedBadge role')
      .sort({ createdAt: -1 });

    res.json({ reviews });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/reviews — create a review
router.post('/', protect, upload.array('photos', 5), async (req, res) => {
  try {
    const { shopId, starRating, reviewText } = req.body;

    if (!shopId || !starRating || !reviewText) {
      return res.status(400).json({ message: 'shopId, starRating, and reviewText are required' });
    }

    if (reviewText.length < 20) {
      return res.status(400).json({ message: 'Review must be at least 20 characters' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'At least one photo is required as proof' });
    }

    const shop = await Shop.findById(shopId);
    if (!shop) return res.status(404).json({ message: 'Shop not found' });

    const photos = req.files.map((f) => `/uploads/${f.filename}`);

    const review = await Review.create({
      shopId,
      userId: req.user._id,
      starRating: parseInt(starRating),
      reviewText,
      photos
    });

    // Recalculate average rating
    const allReviews = await Review.find({ shopId });
    const avgRating =
      allReviews.reduce((sum, r) => sum + r.starRating, 0) / allReviews.length;

    await Shop.findByIdAndUpdate(shopId, {
      averageRating: Math.round(avgRating * 10) / 10,
      totalReviews: allReviews.length
    });

    const populatedReview = await Review.findById(review._id).populate(
      'userId',
      'name avatar isVerifiedBadge role'
    );

    res.status(201).json({ review: populatedReview });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
