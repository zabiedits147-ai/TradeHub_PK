const express = require('express');
const router = express.Router();
const { getProducts, createProduct, getProductById } = require('../controllers/productController');
const protect = require('../middleware/authMiddleware');

router.get('/', getProducts);
router.post('/', protect, createProduct);
router.get('/:id', getProductById);

module.exports = router;