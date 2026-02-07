const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');

// Client routes
router.post('/', auth, orderController.createOrder);
router.get('/my-orders', auth, orderController.getMyOrders);

// Manager routes
router.get('/', auth, role(['Manager']), orderController.getAllOrders);
router.put('/:id/status', auth, role(['Manager']), orderController.updateOrderStatus);

module.exports = router;
