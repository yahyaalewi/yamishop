const express = require('express');
const router = express.Router();
const {
  addOrderItems,
  getOrderById,
  updateOrderToPaid,
  updateOrderToConfirmed,
  deleteOrder,
  getMyOrders,
  getOrders,
  getOrderInvoice,
  addOrderReview
} = require('../controllers/orderController');
const { protect, admin, adminOrStoreAdmin } = require('../middleware/auth');

// User routes
router.post('/', protect, addOrderItems);
router.get('/myorders', protect, getMyOrders);
router.get('/:id', protect, getOrderById);
router.get('/:id/invoice', protect, getOrderInvoice);
router.put('/:id/review', protect, addOrderReview);

// Admin & Store Admin routes
router.put('/:id/pay', protect, adminOrStoreAdmin, updateOrderToPaid);
router.put('/:id/confirm', protect, adminOrStoreAdmin, updateOrderToConfirmed);
router.delete('/:id', protect, admin, deleteOrder);
router.get('/', protect, adminOrStoreAdmin, getOrders);

module.exports = router;
