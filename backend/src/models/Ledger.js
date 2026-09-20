const mongoose = require('mongoose');

const ledgerSchema = new mongoose.Schema(
  {
    wholesaler: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    retailer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amountOwed: {
      type: Number,
      required: true,
      default: 0,
    },
    dueDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['pending', 'partially_paid', 'paid'],
      default: 'pending',
    },
    transactionHash: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Ledger', ledgerSchema);