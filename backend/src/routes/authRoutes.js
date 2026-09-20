const express = require('express');
const router = express.Router();
const { sendOTP, verifyOTP, verifyBusiness, updateProfile, requestNumberChange, confirmNumberChange } = require('../controllers/authController');
const protect = require('../middleware/authMiddleware');

router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.post('/verify-business', protect, verifyBusiness);
router.put('/profile', protect, updateProfile);
router.post('/change-number/request', protect, requestNumberChange);
router.post('/change-number/confirm', protect, confirmNumberChange);
module.exports = router;