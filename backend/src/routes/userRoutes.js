const express = require('express');
const router = express.Router();
const { registerUser, loginUser, verifyOtp, getUserProfile, updateUserProfile } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
 
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/verify-otp', verifyOtp);
router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

module.exports = router;
