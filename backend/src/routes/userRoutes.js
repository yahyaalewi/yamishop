const express = require('express');
const router = express.Router();
const { registerUser, loginUser, verifyOtp, getUserProfile, updateUserProfile, forgotPassword, resetPassword, getAllUsers, adminResetPassword } = require('../controllers/userController');
const { protect, admin } = require('../middleware/auth');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/verify-otp', verifyOtp);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

// Admin Routes
router.get('/admin/all', protect, admin, getAllUsers);
router.patch('/admin/reset-password', protect, admin, adminResetPassword);

module.exports = router;

