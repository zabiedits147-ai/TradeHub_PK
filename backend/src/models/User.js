const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    mobileNumber: {
      type: String,
      required: true,
      unique: true,
    },
    role: {
      type: String,
      enum: ['wholesaler', 'retailer'],
      default: 'retailer',
    },
    shopName: {
      type: String,
      default: '',
    },
    ntnCnic: {
      type: String,
      default: '',
    },
    shopAddress: {
      type: String,
      default: '',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isProAccount: {
      type: Boolean,
      default: false,
    },
pendingMobileNumber: {
      type: String,
      default: null,
    },
    otp: {
      type: String,
      default: null,
    },
    otpExpiry: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);