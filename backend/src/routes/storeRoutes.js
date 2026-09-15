const express = require('express');
const router = express.Router();
const {
  getStores,
  getStoreById,
  createStore,
  updateStore,
  deleteStore,
  toggleStoreStatus,
  getStoreStats,
  resetStoreAdminPassword,
  getMyStore,
  getPublicStores,
  getMyStoreStats,
} = require('../controllers/storeController');
const { protect, admin, storeAdmin } = require('../middleware/auth');

// ─── Public routes ───────────────────────────────────────────────────────────
router.get('/public', getPublicStores);

// ─── Store Admin routes ──────────────────────────────────────────────────────
router.get('/me', protect, storeAdmin, getMyStore);
router.get('/my-stats', protect, storeAdmin, getMyStoreStats);

// ─── Super Admin routes ──────────────────────────────────────────────────────
router.get('/', protect, admin, getStores);
router.post('/', protect, admin, createStore);
router.put('/:id', protect, admin, updateStore);
router.delete('/:id', protect, admin, deleteStore);
router.patch('/:id/status', protect, admin, toggleStoreStatus);
router.get('/:id/stats', protect, admin, getStoreStats);
router.patch('/:id/reset-password', protect, admin, resetStoreAdminPassword);

module.exports = router;
