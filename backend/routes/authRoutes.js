const express = require('express');
const router = express.Router();
const { register, login, getMe, setupAdmin, getSetupStatus } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);

// One-time initial administrative provisioning endpoints
router.get('/setup-status', getSetupStatus);
router.post('/setup-admin', setupAdmin);

module.exports = router;
