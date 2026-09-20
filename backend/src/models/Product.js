const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    originalPrice: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      default: 'General',
    },
    badge: {
      type: String,
      default: 'Bulk Sale, Wholesaler',
    },
    imageUrl: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['active', 'sold', 'closed'],
      default: 'active',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);