const express = require('express');
const router = express.Router();
const { createBid, getBidsForProduct, respondToBid } = require('../controllers/bidController');
const protect = require('../middleware/authMiddleware');

router.post('/', protect, createBid);
router.get('/product/:productId', getBidsForProduct);
router.put('/:id/respond', protect, respondToBid);

module.exports = router;