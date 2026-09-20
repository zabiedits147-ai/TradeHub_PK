const mongoose = require('mongoose');

const inventoryItemSchema = new mongoose.Schema(
  {
    wholesaler: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    barcode: { type: String, required: true },
    productName: { type: String, required: true },
    quantity: { type: Number, required: true, default: 0 },
    unit: { type: String, default: 'pcs' },
    lowStockThreshold: { type: Number, default: 10 },
  },
  { timestamps: true }
);

// Same wholesaler cannot have duplicate barcode entries
inventoryItemSchema.index({ wholesaler: 1, barcode: 1 }, { unique: true });

module.exports = mongoose.model('InventoryItem', inventoryItemSchema);