const Product = require('../models/Product');

// @route  GET /api/products
// @desc   Get all active products
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find({ status: 'active' }).populate('seller', 'shopName mobileNumber');
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route  POST /api/products
// @desc   Create a new product listing
exports.createProduct = async (req, res) => {
  try {
    const { title, description, originalPrice, category, badge, imageUrl } = req.body;
    const seller = req.user.id;

    const product = await Product.create({
      seller,
      title,
      description,
      originalPrice,
      category,
      badge,
      imageUrl,
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route  GET /api/products/:id
// @desc   Get single product detail
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('seller', 'shopName mobileNumber');
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};