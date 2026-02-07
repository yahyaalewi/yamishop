const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');

// Public routes
const uploadController = require('../controllers/uploadController');

router.post('/upload', auth, role(['Manager']), uploadController.uploadImage);

router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);

// Protected routes (Manager only)
router.post('/', auth, role(['Manager']), productController.createProduct);
router.put('/:id', auth, role(['Manager']), productController.updateProduct);
router.delete('/:id', auth, role(['Manager']), productController.deleteProduct);

module.exports = router;
