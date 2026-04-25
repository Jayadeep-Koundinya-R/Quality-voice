const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    // Who receives this notification
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    // Who triggered it
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    type: {
      type: String,
      enum: ['comment', 'like', 'badge', 'report_reviewed', 'follow', 'mention'],
      required: true
    },
    // Context references
    reviewId: { type: mongoose.Schema.Types.ObjectId, ref: 'Review' },
    shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop' },
    commentText: { type: String, default: '' },
    read: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
