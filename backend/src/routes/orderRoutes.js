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
const { protect, admin } = require('../middleware/auth');

// User routes
router.post('/', protect, addOrderItems);
router.get('/myorders', protect, getMyOrders);
router.get('/:id', protect, getOrderById);
router.get('/:id/invoice', protect, getOrderInvoice);
router.put('/:id/review', protect, addOrderReview);

// Admin routes
router.put('/:id/pay', protect, admin, updateOrderToPaid);
router.put('/:id/confirm', protect, admin, updateOrderToConfirmed);
router.delete('/:id', protect, admin, deleteOrder);
router.get('/', protect, admin, getOrders);

module.exports = router;
