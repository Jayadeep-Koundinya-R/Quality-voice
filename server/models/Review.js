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
    photos: [{ type: String }]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Review', reviewSchema);
