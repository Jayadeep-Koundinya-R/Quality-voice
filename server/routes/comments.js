const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const Review = require('../models/Review');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

// GET /api/comments/:reviewId
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

const { handleMentions } = require('../utils/mentionHandler');

// POST /api/comments — add a comment and create notification
router.post('/', protect, async (req, res) => {
  try {
    const { reviewId, commentText } = req.body;

    if (!reviewId || !commentText) {
      return res.status(400).json({ message: 'reviewId and commentText are required' });
    }

    const review = await Review.findById(reviewId).populate('userId', '_id name');
    if (!review) return res.status(404).json({ message: 'Review not found' });

    const comment = await Comment.create({
      reviewId,
      userId: req.user._id,
      commentText
    });

    // Handle user mentions
    await handleMentions(commentText, req.user._id, review._id, review.shopId, 'mention');

    // Notify the review author (skip if commenting on own review)
    if (review.userId._id.toString() !== req.user._id.toString()) {
      await Notification.create({
        recipientId: review.userId._id,
        actorId: req.user._id,
        type: 'comment',
        reviewId: review._id,
        shopId: review.shopId,
        commentText: commentText.slice(0, 100)
      });
    }

    const populatedComment = await Comment.findById(comment._id).populate(
      'userId', 'name avatar role isVerifiedBadge'
    );

    res.status(201).json({ comment: populatedComment });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// DELETE /api/comments/:id — delete own comment (or admin)
router.delete('/:id', protect, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    const isOwner = comment.userId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not authorised to delete this comment' });
    }

    await comment.deleteOne();
    res.json({ message: 'Comment deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
