const DonorProfile = require('../models/DonorProfile');
const BloodRequest = require('../models/BloodRequest');
const RequestMatch = require('../models/RequestMatch');
const Donation = require('../models/Donation');
const Notification = require('../models/Notification');
const HospitalProfile = require('../models/HospitalProfile');
const { evaluateEligibility, recordEligibilityCheck } = require('../services/eligibilityService');

// @desc    Get donor profile & eligibility
// @route   GET /api/donor/profile
// @access  Private (Donor)
exports.getProfile = async (req, res) => {
  try {
    const profile = await DonorProfile.findOne({ userId: req.user.id }).populate('userId', 'name email');
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Donor profile not found.' });
    }

    const eligibility = evaluateEligibility(profile);

    res.json({
      success: true,
      profile,
      eligibility,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Update donor profile
// @route   PUT /api/donor/profile
// @access  Private (Donor)
exports.updateProfile = async (req, res) => {
  try {
    const profile = await DonorProfile.findOne({ userId: req.user.id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Donor profile not found.' });
    }

    const {
      bloodGroup,
      phone,
      address,
      city,
      state,
      lastDonationDate,
      hasTattooLast3Months,
      tattooDate,
      weightKg,
      isAvailable,
      gender,
      dob,
    } = req.body;

    if (bloodGroup) profile.bloodGroup = bloodGroup;
    if (phone) profile.phone = phone;
    if (address !== undefined) profile.address = address;
    if (city) profile.city = city;
    if (state !== undefined) profile.state = state;
    if (lastDonationDate !== undefined) profile.lastDonationDate = lastDonationDate || null;
    if (hasTattooLast3Months !== undefined) profile.hasTattooLast3Months = Boolean(hasTattooLast3Months);
    if (tattooDate !== undefined) profile.tattooDate = tattooDate || null;
    if (weightKg !== undefined) profile.weightKg = weightKg;
    if (isAvailable !== undefined) profile.isAvailable = Boolean(isAvailable);
    if (gender) profile.gender = gender;
    if (dob) profile.dob = dob;

    await profile.save();

    const eligibility = await recordEligibilityCheck(profile);

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      profile,
      eligibility,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Explicitly check and record eligibility
// @route   GET /api/donor/eligibility
// @access  Private (Donor)
exports.checkEligibility = async (req, res) => {
  try {
    const profile = await DonorProfile.findOne({ userId: req.user.id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Donor profile not found.' });
    }

    const eligibility = await recordEligibilityCheck(profile);

    res.json({
      success: true,
      eligibility,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    View donation history
// @route   GET /api/donor/history
// @access  Private (Donor)
exports.getDonationHistory = async (req, res) => {
  try {
    const profile = await DonorProfile.findOne({ userId: req.user.id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Donor profile not found.' });
    }

    const donations = await Donation.find({ donorId: profile._id })
      .populate('hospitalId', 'hospitalName city phone address')
      .populate('requestId', 'patientName bloodGroup urgency neededByDate')
      .sort({ donationDate: -1 });

    res.json({
      success: true,
      count: donations.length,
      donations,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    View matching blood requests
// @route   GET /api/donor/requests
// @access  Private (Donor)
exports.getMatchingRequests = async (req, res) => {
  try {
    const profile = await DonorProfile.findOne({ userId: req.user.id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Donor profile not found.' });
    }

    const matches = await RequestMatch.find({ donorId: profile._id })
      .populate({
        path: 'requestId',
        populate: { path: 'hospitalId', select: 'hospitalName city address phone' },
      })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: matches.length,
      matches,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Accept or reject matching blood request
// @route   POST /api/donor/requests/:matchId/respond
// @access  Private (Donor)
exports.respondToRequest = async (req, res) => {
  try {
    const { action, reason } = req.body; // action: 'accept' | 'reject'
    const profile = await DonorProfile.findOne({ userId: req.user.id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Donor profile not found.' });
    }

    const match = await RequestMatch.findOne({
      _id: req.params.matchId,
      donorId: profile._id,
    }).populate('requestId').populate('hospitalId');

    if (!match) {
      return res.status(404).json({ success: false, message: 'Matching request not found.' });
    }

    if (match.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `This request has already been ${match.status}.`,
      });
    }

    if (action === 'accept') {
      // Safety check: Per Use Case 4: Verify eligibility before allowing acceptance
      const eligibility = evaluateEligibility(profile);
      if (!eligibility.isEligible) {
        return res.status(400).json({
          success: false,
          message: 'Cannot accept request: You do not currently meet donation eligibility criteria.',
          reasons: eligibility.reasons,
        });
      }

      match.status = 'accepted';
      match.responseDate = new Date();
      await match.save();

      // Notify hospital of acceptance
      if (match.hospitalId) {
        await Notification.create({
          userId: match.hospitalId.userId,
          title: 'Donor Accepted Blood Request!',
          message: `Donor ${req.user.name} (${profile.bloodGroup}) accepted the blood request for patient ${match.requestId?.patientName}.`,
          type: 'response',
          link: `/hospital/requests/${match.requestId?._id}`,
        });
      }

      return res.json({
        success: true,
        message: 'Donation request accepted! The hospital has been notified and can confirm the donation.',
        match,
      });
    } else if (action === 'reject') {
      match.status = 'rejected';
      match.responseDate = new Date();
      match.rejectionReason = reason || 'Donor unavailable or declined.';
      await match.save();

      return res.json({
        success: true,
        message: 'Request declined.',
        match,
      });
    } else {
      return res.status(400).json({ success: false, message: 'Invalid action. Must be accept or reject.' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
