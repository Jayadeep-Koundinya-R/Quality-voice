const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const Review = require('../models/Review');
const { protect } = require('../middleware/auth');

// GET /api/comments/:reviewId — get all comments for a review
router.get('/:reviewId', protect, async (req, res) => {
  try {
    const comments = await Comment.find({ reviewId: req.params.reviewId })
      .populate('userId', 'name avatar role isVerifiedBadge')
      .sort({ createdAt: 1 });

    res.json({ comments });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/comments — add a comment to a review
router.post('/', protect, async (req, res) => {
  try {
    const { reviewId, commentText } = req.body;

    if (!reviewId || !commentText) {
      return res.status(400).json({ message: 'reviewId and commentText are required' });
    }

    const review = await Review.findById(reviewId);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    const comment = await Comment.create({
      reviewId,
      userId: req.user._id,
      commentText
    });

    const populatedComment = await Comment.findById(comment._id).populate(
      'userId',
      'name avatar role isVerifiedBadge'
    );

    res.status(201).json({ comment: populatedComment });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
