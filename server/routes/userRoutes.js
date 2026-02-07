const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');

router.get('/', auth, role(['Manager']), userController.getAllUsers);
router.delete('/:id', auth, role(['Manager']), userController.deleteUser);

module.exports = router;
