const express = require('express');
const router = express.Router();
const { getMyLedger, createLedgerEntry, sendReminder } = require('../controllers/ledgerController');
const protect = require('../middleware/authMiddleware');

router.get('/', protect, getMyLedger);
router.post('/', protect, createLedgerEntry);
router.put('/:id/remind', protect, sendReminder);

module.exports = router;