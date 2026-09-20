const express = require('express');
const router = express.Router();
const { getMarketInsights, getTradingVolume } = require('../controllers/insightController');
const protect = require('../middleware/authMiddleware');

router.get('/', protect, getMarketInsights);
router.get('/volume', protect, getTradingVolume);

module.exports = router;