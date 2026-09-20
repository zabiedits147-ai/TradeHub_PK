const Bid = require('../models/Bid');
const Product = require('../models/Product');
const Escrow = require('../models/Escrow');
const { generateTransactionHash } = require('../utils/cryptoUtils');

// @route  POST /api/bids
// @desc   Submit a new bid/offer on a product
exports.createBid = async (req, res) => {
  try {
    const { productId, offerAmount } = req.body;
    const buyer = req.user.id;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const bid = await Bid.create({
      product: productId,
      buyer,
      seller: product.seller,
      offerAmount,
    });

    // Emit real-time event to seller via Socket.io
    const io = req.app.get('io');
    io.to(`user_${product.seller}`).emit('newBid', bid);

    res.status(201).json(bid);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route  GET /api/bids/product/:productId
// @desc   Get negotiation history for a product
exports.getBidsForProduct = async (req, res) => {
  try {
    const bids = await Bid.find({ product: req.params.productId })
      .populate('buyer', 'shopName mobileNumber')
      .sort({ createdAt: -1 });
    res.status(200).json(bids);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route  PUT /api/bids/:id/respond
// @desc   Seller responds to a bid (accept / reject / counter)
exports.respondToBid = async (req, res) => {
  try {
    const { action, counterAmount } = req.body; // action: 'accepted' | 'rejected' | 'countered'

    const bid = await Bid.findById(req.params.id);
    if (!bid) {
      return res.status(404).json({ message: 'Bid not found' });
    }

    bid.status = action;
    if (action === 'countered') {
      bid.counterAmount = counterAmount;
    }
    await bid.save();

    let escrow = null;
    if (action === 'accepted') {
      const verificationHash = generateTransactionHash({
        bidId: bid._id,
        buyerId: bid.buyer,
        sellerId: bid.seller,
        amount: bid.offerAmount,
        timestamp: Date.now(),
      });

      escrow = await Escrow.create({
        bid: bid._id,
        buyer: bid.buyer,
        seller: bid.seller,
        amount: bid.offerAmount,
        verificationHash,
      });
    }

    // Notify buyer in real-time
    const io = req.app.get('io');
    io.to(`user_${bid.buyer}`).emit('bidResponse', bid);

    res.status(200).json({ bid, escrow });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};