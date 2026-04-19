const mongoose = require('mongoose');

const shopSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Shop name is required'],
      trim: true
    },
    category: {
      type: String,
      enum: ['Food', 'Services', 'Shops', 'Products'],
      required: [true, 'Category is required']
    },
    address: {
      type: String,
      required: [true, 'Address is required']
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true
    },
    district: {
      type: String,
      required: [true, 'District is required'],
      trim: true
    },
    area: {
      type: String,
      required: [true, 'Area is required'],
      trim: true
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    totalReviews: {
      type: Number,
      default: 0
    },
    hasGovtBadge: {
      type: Boolean,
      default: false
    },
    photos: [{ type: String }],
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    description: {
      type: String,
      default: ''
    },
    phone: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
);

// Text index for search
shopSchema.index({ name: 'text', category: 'text', area: 'text', city: 'text' });

module.exports = mongoose.model('Shop', shopSchema);
