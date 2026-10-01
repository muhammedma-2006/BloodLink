const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  checkEligibility,
  getDonationHistory,
  getMatchingRequests,
  respondToRequest,
} = require('../controllers/donorController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('donor'));

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.get('/eligibility', checkEligibility);
router.get('/history', getDonationHistory);
router.get('/requests', getMatchingRequests);
router.post('/requests/:matchId/respond', respondToRequest);

module.exports = router;
