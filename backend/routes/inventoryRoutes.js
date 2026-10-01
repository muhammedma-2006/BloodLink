const express = require('express');
const router = express.Router();
const { getInventory, updateInventory } = require('../controllers/inventoryController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('hospital', 'admin'));

router.get('/', getInventory);
router.put('/', updateInventory);

module.exports = router;
