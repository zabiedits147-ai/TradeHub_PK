const InventoryItem = require('../models/InventoryItem');

// @route  GET /api/inventory
// @desc   Get all inventory items for logged-in wholesaler
exports.getInventory = async (req, res) => {
  try {
    const items = await InventoryItem.find({ wholesaler: req.user.id }).sort({ updatedAt: -1 });
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route  GET /api/inventory/scan/:barcode
// @desc   Look up an item by scanned barcode (for the logged-in wholesaler)
exports.scanBarcode = async (req, res) => {
  try {
    const item = await InventoryItem.findOne({ wholesaler: req.user.id, barcode: req.params.barcode });
    if (!item) {
      return res.status(404).json({ message: 'No item found for this barcode', notFound: true });
    }
    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route  POST /api/inventory
// @desc   Add a new inventory item (after scanning an unknown barcode)
exports.addInventoryItem = async (req, res) => {
  try {
    const { barcode, productName, quantity, unit, lowStockThreshold } = req.body;

    if (!barcode || !productName) {
      return res.status(400).json({ message: 'Barcode and product name are required' });
    }

    const existing = await InventoryItem.findOne({ wholesaler: req.user.id, barcode });
    if (existing) {
      return res.status(400).json({ message: 'An item with this barcode already exists' });
    }

    const item = await InventoryItem.create({
      wholesaler: req.user.id,
      barcode,
      productName,
      quantity: quantity || 0,
      unit: unit || 'pcs',
      lowStockThreshold: lowStockThreshold || 10,
    });

    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route  PUT /api/inventory/:id/adjust
// @desc   Adjust stock quantity (+ for restock scan, - for sale/dispatch scan)
exports.adjustQuantity = async (req, res) => {
  try {
    const { change } = req.body; // e.g. +10 or -5

    const item = await InventoryItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    item.quantity = Math.max(0, item.quantity + Number(change));
    await item.save();

    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};