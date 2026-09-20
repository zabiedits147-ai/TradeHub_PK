const express = require('express');
const router = express.Router();
const { createEscrow, releaseEscrow, getEscrowByBid } = require('../controllers/escrowController');
const protect = require('../middleware/authMiddleware');

router.post('/', protect, createEscrow);
router.put('/:id/release', protect, releaseEscrow);
router.get('/bid/:bidId', protect, getEscrowByBid);

module.exports = router;