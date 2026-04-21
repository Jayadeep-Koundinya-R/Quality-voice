const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    shopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shop',
      required: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    starRating: {
      type: Number,
      required: [true, 'Star rating is required'],
      min: 1,
      max: 5
    },
    reviewText: {
      type: String,
      required: [true, 'Review text is required'],
      minlength: [20, 'Review must be at least 20 characters']
    },
    photos: [{ type: String }],
    // Review likes — array of user IDs who liked this review
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    likeCount: { type: Number, default: 0 },
    // Trending score — recalculated on each new review/like
    trendScore: { type: Number, default: 0 },
    // Traveller review — set when reviewer's home city differs from shop's city
    isTravellerReview: { type: Boolean, default: false },
    reviewerHomeCity:  { type: String, default: '' },
    // Helpful votes
    helpfulCount: { type: Number, default: 0 },
    helpfulBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Review', reviewSchema);
