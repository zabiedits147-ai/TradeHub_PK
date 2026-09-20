const Escrow = require('../models/Escrow');
const { generateTransactionHash } = require('../utils/cryptoUtils');

// @route  POST /api/escrow
// @desc   Lock funds in escrow after a bid is accepted
exports.createEscrow = async (req, res) => {
  try {
    const { bidId, sellerId, amount } = req.body;
    const buyerId = req.user.id;

    const verificationHash = generateTransactionHash({ bidId, buyerId, sellerId, amount, timestamp: Date.now() });

    const escrow = await Escrow.create({
      bid: bidId,
      buyer: buyerId,
      seller: sellerId,
      amount,
      verificationHash,
    });

    res.status(201).json(escrow);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route  PUT /api/escrow/:id/release
// @desc   Release escrow funds to seller after delivery confirmation
exports.releaseEscrow = async (req, res) => {
  try {
    const escrow = await Escrow.findById(req.params.id);
    if (!escrow) {
      return res.status(404).json({ message: 'Escrow record not found' });
    }

    escrow.status = 'released';
    await escrow.save();

    res.status(200).json({ message: 'Funds released to seller', escrow });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
// @route  GET /api/escrow/bid/:bidId
// @desc   Get escrow record for a specific bid
exports.getEscrowByBid = async (req, res) => {
  try {
    const escrow = await Escrow.findOne({ bid: req.params.bidId });
    if (!escrow) {
      return res.status(404).json({ message: 'No escrow found for this bid' });
    }
    res.status(200).json(escrow);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};