const Ledger = require('../models/Ledger');
const { generateTransactionHash } = require('../utils/cryptoUtils');

// @route  GET /api/ledger
// @desc   Get total udhari + pending dues for logged-in wholesaler
exports.getMyLedger = async (req, res) => {
  try {
    const wholesalerId = req.user.id;

    const entries = await Ledger.find({ wholesaler: wholesalerId, status: { $ne: 'paid' } })
      .populate('retailer', 'shopName mobileNumber')
      .sort({ createdAt: -1 });

    const totalOwed = entries.reduce((sum, entry) => sum + entry.amountOwed, 0);

    res.status(200).json({ totalOwed, activeAccounts: entries.length, entries });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route  POST /api/ledger
// @desc   Create a new credit entry (wholesaler gives credit to retailer)
exports.createLedgerEntry = async (req, res) => {
  try {
    const { retailerId, amountOwed, dueDate } = req.body;
    const wholesalerId = req.user.id;

    const transactionHash = generateTransactionHash({ wholesalerId, retailerId, amountOwed, timestamp: Date.now() });

    const entry = await Ledger.create({
      wholesaler: wholesalerId,
      retailer: retailerId,
      amountOwed,
      dueDate,
      transactionHash,
    });

    res.status(201).json(entry);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route  PUT /api/ledger/:id/remind
// @desc   Send SMS reminder for a pending due
exports.sendReminder = async (req, res) => {
  try {
    const entry = await Ledger.findById(req.params.id).populate('retailer', 'mobileNumber');
    if (!entry) {
      return res.status(404).json({ message: 'Ledger entry not found' });
    }

    // TODO: integrate real SMS gateway
    console.log(`SMS Reminder sent to ${entry.retailer.mobileNumber}: Rs. ${entry.amountOwed} pending`);

    res.status(200).json({ message: 'Reminder sent successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};