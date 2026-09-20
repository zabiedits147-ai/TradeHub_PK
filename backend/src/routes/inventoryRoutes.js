const express = require('express');
const router = express.Router();
const { getInventory, scanBarcode, addInventoryItem, adjustQuantity } = require('../controllers/inventoryController');
const protect = require('../middleware/authMiddleware');

router.get('/', protect, getInventory);
router.get('/scan/:barcode', protect, scanBarcode);
router.post('/', protect, addInventoryItem);
router.put('/:id/adjust', protect, adjustQuantity);

module.exports = router;