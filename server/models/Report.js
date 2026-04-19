const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
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
    reason: {
      type: String,
      enum: [
        'Low quality product',
        'Unhygienic',
        'Fake reviews suspected',
        'Wrong information',
        'Other'
      ],
      required: [true, 'Reason is required']
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      minlength: [30, 'Description must be at least 30 characters']
    },
    photo: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed'],
      default: 'pending'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Report', reportSchema);
