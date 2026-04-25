const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Shop = require('../models/Shop');
const Notification = require('../models/Notification');
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

const { handleMentions } = require('../utils/mentionHandler');

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

    // Determine if this is a traveller review
    // Compare reviewer's home city with the shop's city (case-insensitive)
    const userHomeCity = req.user.location?.city || '';
    const shopCity = shop.city || '';
    const isTravellerReview =
      userHomeCity.trim().length > 0 &&
      shopCity.trim().length > 0 &&
      userHomeCity.trim().toLowerCase() !== shopCity.trim().toLowerCase();

    const photos = req.files.map((f) => `/uploads/${f.filename}`);

    const review = await Review.create({
      shopId,
      userId: req.user._id,
      starRating: parseInt(starRating),
      reviewText,
      photos,
      isTravellerReview,
      reviewerHomeCity: isTravellerReview ? userHomeCity.trim() : ''
    });

    // Handle user mentions
    await handleMentions(reviewText, req.user._id, review._id, shopId, 'mention');

    // Recalculate average rating
    const allReviews = await Review.find({ shopId });
    const avgRating = allReviews.reduce((sum, r) => sum + r.starRating, 0) / allReviews.length;

    await Shop.findByIdAndUpdate(shopId, {
      averageRating: Math.round(avgRating * 10) / 10,
      totalReviews: allReviews.length
    });

    const populatedReview = await Review.findById(review._id).populate(
      'userId', 'name avatar isVerifiedBadge role'
    );

    res.status(201).json({ review: populatedReview });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/reviews/:id/like — toggle like on a review
router.post('/:id/like', protect, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id).populate('userId', 'name');
    if (!review) return res.status(404).json({ message: 'Review not found' });

    const userId = req.user._id;
    const alreadyLiked = review.likes.some((id) => id.toString() === userId.toString());

    if (alreadyLiked) {
      // Unlike
      review.likes = review.likes.filter((id) => id.toString() !== userId.toString());
    } else {
      // Like
      review.likes.push(userId);

      // Create notification for review author (not if liking own review)
      if (review.userId._id.toString() !== userId.toString()) {
        await Notification.create({
          recipientId: review.userId._id,
          actorId: userId,
          type: 'like',
          reviewId: review._id,
          shopId: review.shopId
        });
      }
    }

    review.likeCount = review.likes.length;
    await review.save();

    res.json({
      liked: !alreadyLiked,
      likeCount: review.likeCount
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/reviews/:id/helpful — toggle helpful on a review
router.post('/:id/helpful', protect, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    const userId = req.user._id;
    const alreadyHelpful = review.helpfulBy.some(id => id.toString() === userId.toString());

    if (alreadyHelpful) {
      review.helpfulBy = review.helpfulBy.filter(id => id.toString() !== userId.toString());
    } else {
      review.helpfulBy.push(userId);
    }

    review.helpfulCount = review.helpfulBy.length;
    await review.save();

    res.json({ helpful: !alreadyHelpful, helpfulCount: review.helpfulCount });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
