const mongoose = require('mongoose');

const poolParticipantSchema = new mongoose.Schema(
  {
    retailer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    quantity: { type: Number, required: true },
    joinedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const poolSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    wholesaler: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    targetQuantity: { type: Number, required: true },
    currentQuantity: { type: Number, default: 0 },
    pricePerUnit: { type: Number, required: true },
    deadline: { type: Date, required: true },
    status: {
      type: String,
      enum: ['open', 'completed', 'expired'],
      default: 'open',
    },
    participants: [poolParticipantSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Pool', poolSchema);