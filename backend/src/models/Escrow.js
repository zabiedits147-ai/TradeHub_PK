const mongoose = require('mongoose');

const escrowSchema = new mongoose.Schema(
  {
    bid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bid',
      required: true,
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['holding', 'released', 'refunded'],
      default: 'holding',
    },
    verificationHash: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Escrow', escrowSchema);