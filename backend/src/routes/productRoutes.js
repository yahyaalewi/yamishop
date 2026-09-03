const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');
const { protect, adminOrStoreAdmin } = require('../middleware/auth');

// Public routes
router.get('/', getProducts);
router.get('/:id', getProductById);

// Admin / Store Admin routes
router.post('/', protect, adminOrStoreAdmin, createProduct);
router.put('/:id', protect, adminOrStoreAdmin, updateProduct);
router.delete('/:id', protect, adminOrStoreAdmin, deleteProduct);

module.exports = router;
