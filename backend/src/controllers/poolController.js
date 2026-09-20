const Pool = require('../models/Pool');

// @route  POST /api/pools
// @desc   Wholesaler creates a new pool buying campaign
exports.createPool = async (req, res) => {
  try {
    const { productId, targetQuantity, pricePerUnit, deadline } = req.body;
    const wholesaler = req.user.id;

    if (!productId || !targetQuantity || !pricePerUnit || !deadline) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const pool = await Pool.create({
      product: productId,
      wholesaler,
      targetQuantity,
      pricePerUnit,
      deadline,
    });

    res.status(201).json(pool);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route  GET /api/pools
// @desc   Get all open pools
exports.getPools = async (req, res) => {
  try {
    const pools = await Pool.find({ status: 'open' })
      .populate('product', 'title imageUrl originalPrice')
      .populate('wholesaler', 'shopName mobileNumber')
      .sort({ createdAt: -1 });
    res.status(200).json(pools);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route  GET /api/pools/:id
// @desc   Get single pool details with participants
exports.getPoolById = async (req, res) => {
  try {
    const pool = await Pool.findById(req.params.id)
      .populate('product', 'title imageUrl originalPrice')
      .populate('wholesaler', 'shopName mobileNumber')
      .populate('participants.retailer', 'shopName mobileNumber');
    if (!pool) {
      return res.status(404).json({ message: 'Pool not found' });
    }
    res.status(200).json(pool);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route  POST /api/pools/:id/join
// @desc   Retailer joins a pool with a quantity contribution
exports.joinPool = async (req, res) => {
  try {
    const { quantity } = req.body;
    const retailerId = req.user.id;

    if (!quantity || quantity <= 0) {
      return res.status(400).json({ message: 'Please enter a valid quantity' });
    }

    const pool = await Pool.findById(req.params.id);
    if (!pool) {Q
      return res.status(404).json({ message: 'Pool not found' });
    }

    if (pool.status !== 'open') {
      return res.status(400).json({ message: 'This pool is no longer open' });
    }

    const alreadyJoined = pool.participants.find((p) => p.retailer.toString() === retailerId);
    if (alreadyJoined) {
      return res.status(400).json({ message: 'You have already joined this pool' });
    }

    pool.participants.push({ retailer: retailerId, quantity });
    pool.currentQuantity += quantity;

    if (pool.currentQuantity >= pool.targetQuantity) {
      pool.status = 'completed';
    }

    await pool.save();

    // Notify all participants in real-time when pool completes
    if (pool.status === 'completed') {
      const io = req.app.get('io');
      pool.participants.forEach((p) => {
        io.to(`user_${p.retailer}`).emit('poolCompleted', pool);
      });
    }

    res.status(200).json(pool);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};