const User = require('../models/User');

// @route  GET /api/users
// @desc   Get all registered users except the logged-in user (for starting new chats)
exports.getAllUsers = async (req, res) => {
  try {
    const myId = req.user.id;
    const users = await User.find({ _id: { $ne: myId } }).select('shopName mobileNumber isVerified');
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};