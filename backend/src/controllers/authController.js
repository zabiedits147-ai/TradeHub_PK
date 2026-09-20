const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// @route  POST /api/auth/send-otp
// @desc   Send OTP to mobile number (creates user if doesn't exist)
exports.sendOTP = async (req, res) => {
  try {
    const { mobileNumber } = req.body;

    if (!mobileNumber || mobileNumber.length < 10) {
      return res.status(400).json({ message: 'Valid mobile number is required' });
    }

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 min expiry

    let user = await User.findOne({ mobileNumber });

    if (!user) {
      user = await User.create({ mobileNumber, otp, otpExpiry });
    } else {
      user.otp = otp;
      user.otpExpiry = otpExpiry;
      await user.save();
    }

    // TODO: integrate real SMS gateway (Twilio / local Pakistani SMS API)
    console.log(`OTP for ${mobileNumber}: ${otp}`);

    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route  POST /api/auth/verify-otp
// @desc   Verify OTP and return JWT token
exports.verifyOTP = async (req, res) => {
  try {
    const { mobileNumber, otp } = req.body;

    const user = await User.findOne({ mobileNumber });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.otp !== otp || new Date() > user.otpExpiry) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

    res.status(200).json({
      message: 'OTP verified successfully',
      token,
      user: {
        id: user._id,
        mobileNumber: user.mobileNumber,
        isVerified: user.isVerified,
        shopName: user.shopName,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route  POST /api/auth/verify-business
// @desc   Submit business verification details
exports.verifyBusiness = async (req, res) => {
  try {
    const { shopName, ntnCnic, shopAddress } = req.body;
    const userId = req.user.id; // comes from auth middleware

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.shopName = shopName;
    user.ntnCnic = ntnCnic;
    user.shopAddress = shopAddress;
    user.isVerified = true;
    await user.save();

    res.status(200).json({ message: 'Business verified successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route  PUT /api/auth/profile
// @desc   Update logged-in user's profile info
exports.updateProfile = async (req, res) => {
  try {
    const { shopName, shopAddress } = req.body;
    const userId = req.user.id;

    if (!shopName || shopName.trim().length < 3) {
      return res.status(400).json({ message: 'Shop name must be at least 3 characters' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.shopName = shopName;
    if (shopAddress) user.shopAddress = shopAddress;
    await user.save();

    res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        mobileNumber: user.mobileNumber,
        isVerified: user.isVerified,
        shopName: user.shopName,
        shopAddress: user.shopAddress,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route  POST /api/auth/change-number/request
// @desc   Send OTP to new mobile number for verification
exports.requestNumberChange = async (req, res) => {
  try {
    const { newMobileNumber } = req.body;

    if (!newMobileNumber || newMobileNumber.length < 10) {
      return res.status(400).json({ message: 'Valid mobile number is required' });
    }

    const existing = await User.findOne({ mobileNumber: newMobileNumber });
    if (existing) {
      return res.status(400).json({ message: 'This number is already registered' });
    }

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

    const user = await User.findById(req.user.id);
    user.pendingMobileNumber = newMobileNumber;
    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    console.log(`OTP for number change to ${newMobileNumber}: ${otp}`);

    res.status(200).json({ message: 'OTP sent to new number' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route  POST /api/auth/change-number/confirm
// @desc   Verify OTP and finalize mobile number change
exports.confirmNumberChange = async (req, res) => {
  try {
    const { otp } = req.body;
    const user = await User.findById(req.user.id);

    if (!user.pendingMobileNumber) {
      return res.status(400).json({ message: 'No pending number change request' });
    }

    if (user.otp !== otp || new Date() > user.otpExpiry) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    user.mobileNumber = user.pendingMobileNumber;
    user.pendingMobileNumber = null;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    res.status(200).json({
      message: 'Mobile number updated successfully',
      user: {
        id: user._id,
        mobileNumber: user.mobileNumber,
        isVerified: user.isVerified,
        shopName: user.shopName,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};