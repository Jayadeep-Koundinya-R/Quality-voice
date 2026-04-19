const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    reviewId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Review',
      required: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    commentText: {
      type: String,
      required: [true, 'Comment text is required'],
      trim: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Comment', commentSchema);
