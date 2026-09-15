const express = require('express');
const router = express.Router();
const {
  addOrderItems,
  getOrderById,
  updateOrderToPaid,
  updateOrderStatus,
  getMyOrders,
  getOrders,
  generateInvoice,
  addReview
} = require('../controllers/orderController');
const { protect, admin, adminOrStoreAdmin } = require('../middleware/auth');

// User routes
router.post('/', protect, addOrderItems);
router.get('/myorders', protect, getMyOrders);
router.get('/:id', protect, getOrderById);
router.get('/:id/invoice', protect, generateInvoice);
router.put('/:id/review', protect, addReview);

// Admin & Store Admin routes
router.put('/:id/pay', protect, adminOrStoreAdmin, updateOrderToPaid);
router.put('/:id/confirm', protect, adminOrStoreAdmin, updateOrderStatus);
router.get('/', protect, adminOrStoreAdmin, getOrders);

module.exports = router;
