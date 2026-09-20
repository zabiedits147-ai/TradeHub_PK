const express = require('express');
const router = express.Router();
const { createPool, getPools, getPoolById, joinPool } = require('../controllers/poolController');
const protect = require('../middleware/authMiddleware');

router.post('/', protect, createPool);
router.get('/', getPools);
router.get('/:id', getPoolById);
router.post('/:id/join', protect, joinPool);

module.exports = router;