const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  searchDonors,
  submitRequest,
  getMyRequests,
  getRequestDetails,
  cancelRequest,
  confirmDonation,
} = require('../controllers/hospitalController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

// Hospital profile & search routes
router.get('/profile', authorize('hospital'), getProfile);
router.put('/profile', authorize('hospital'), updateProfile);
router.get('/donors', authorize('hospital', 'admin'), searchDonors);

// Blood Request lifecycle
router.post('/requests', authorize('hospital'), submitRequest);
router.get('/requests', authorize('hospital'), getMyRequests);
router.get('/requests/:id', authorize('hospital', 'admin'), getRequestDetails);
router.put('/requests/:id/cancel', authorize('hospital', 'admin'), cancelRequest);

// Confirm donation
router.post('/confirm-donation', authorize('hospital'), confirmDonation);

module.exports = router;
