const HospitalProfile = require('../models/HospitalProfile');
const DonorProfile = require('../models/DonorProfile');
const BloodRequest = require('../models/BloodRequest');
const RequestMatch = require('../models/RequestMatch');
const Donation = require('../models/Donation');
const Notification = require('../models/Notification');
const BloodInventory = require('../models/BloodInventory');
const { matchDonorsForRequest } = require('../services/matchingService');
const { evaluateEligibility } = require('../services/eligibilityService');
const { BLOOD_COMPATIBILITY } = require('../config/eligibilityConfig');

// @desc    Get hospital profile
// @route   GET /api/hospital/profile
// @access  Private (Hospital)
exports.getProfile = async (req, res) => {
  try {
    const profile = await HospitalProfile.findOne({ userId: req.user.id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Hospital profile not found.' });
    }
    res.json({ success: true, profile });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Update hospital profile
// @route   PUT /api/hospital/profile
// @access  Private (Hospital)
exports.updateProfile = async (req, res) => {
  try {
    const profile = await HospitalProfile.findOne({ userId: req.user.id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Hospital profile not found.' });
    }

    const { hospitalName, registrationNumber, hospitalType, phone, address, city, state, emergencyContact } = req.body;
    if (hospitalName) profile.hospitalName = hospitalName;
    if (registrationNumber) profile.registrationNumber = registrationNumber;
    if (hospitalType) profile.hospitalType = hospitalType;
    if (phone) profile.phone = phone;
    if (address) profile.address = address;
    if (city) profile.city = city;
    if (state !== undefined) profile.state = state;
    if (emergencyContact !== undefined) profile.emergencyContact = emergencyContact;

    await profile.save();
    res.json({ success: true, message: 'Hospital profile updated successfully.', profile });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Search for donors by blood group and location (privacy-preserving)
// @route   GET /api/hospital/donors
// @access  Private (Hospital | Admin)
exports.searchDonors = async (req, res) => {
  try {
    const { bloodGroup, location, availableOnly = 'true' } = req.query;

    const query = {};

    if (bloodGroup) {
      // Find compatible blood groups or exact
      const compatible = BLOOD_COMPATIBILITY[bloodGroup] || [bloodGroup];
      query.bloodGroup = { $in: compatible };
    }

    if (location) {
      const locRegex = new RegExp(location.trim(), 'i');
      query.$or = [{ city: locRegex }, { state: locRegex }, { address: locRegex }];
    }

    if (availableOnly === 'true') {
      query.isAvailable = true;
    }

    const donors = await DonorProfile.find(query).populate('userId', 'name isActive');

    // Filter and sanitize to preserve donor privacy before request acceptance
    const sanitizedDonors = donors.map((d) => {
      const eligibility = evaluateEligibility(d);
      return {
        _id: d._id,
        name: d.userId?.name || 'Anonymous Donor',
        bloodGroup: d.bloodGroup,
        city: d.city,
        state: d.state,
        age: d.age,
        gender: d.gender,
        isAvailable: d.isAvailable,
        totalDonations: d.totalDonations,
        isEligible: eligibility.isEligible,
        eligibilityReasons: eligibility.reasons,
      };
    });

    res.json({
      success: true,
      count: sanitizedDonors.length,
      donors: sanitizedDonors,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Submit a new blood request (Hospital as primary requester)
// @route   POST /api/hospital/requests
// @access  Private (Hospital)
exports.submitRequest = async (req, res) => {
  try {
    const hospital = await HospitalProfile.findOne({ userId: req.user.id });
    if (!hospital) {
      return res.status(404).json({ success: false, message: 'Hospital profile not found.' });
    }

    const {
      patientName,
      patientAge,
      bloodGroup,
      unitsRequired,
      urgency = 'high',
      neededByDate,
      location,
      contactPhone,
      notes,
    } = req.body;

    if (!patientName || !patientAge || !bloodGroup || !unitsRequired || !neededByDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide patientName, patientAge, bloodGroup, unitsRequired, and neededByDate.',
      });
    }

    const newRequest = await BloodRequest.create({
      hospitalId: hospital._id,
      patientName,
      patientAge,
      bloodGroup,
      unitsRequired,
      urgency,
      neededByDate,
      location: location || `${hospital.hospitalName}, ${hospital.city}`,
      contactPhone: contactPhone || hospital.phone,
      notes: notes || '',
      status: 'open',
    });

    // Auto-match donors and trigger notifications
    const matchedDonors = await matchDonorsForRequest(newRequest, hospital);

    res.status(201).json({
      success: true,
      message: `Blood request submitted successfully. ${matchedDonors.length} matching eligible donor(s) notified.`,
      request: newRequest,
      matchedDonorsCount: matchedDonors.length,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get all requests submitted by the logged in hospital
// @route   GET /api/hospital/requests
// @access  Private (Hospital)
exports.getMyRequests = async (req, res) => {
  try {
    const hospital = await HospitalProfile.findOne({ userId: req.user.id });
    if (!hospital) {
      return res.status(404).json({ success: false, message: 'Hospital profile not found.' });
    }

    const requests = await BloodRequest.find({ hospitalId: hospital._id }).sort({ createdAt: -1 });

    // Enhance each request with match counts
    const requestsWithCounts = await Promise.all(
      requests.map(async (r) => {
        const matchesCount = await RequestMatch.countDocuments({ requestId: r._id });
        const acceptedCount = await RequestMatch.countDocuments({ requestId: r._id, status: 'accepted' });
        const completedCount = await RequestMatch.countDocuments({ requestId: r._id, status: 'completed' });
        return {
          ...r.toObject(),
          matchesCount,
          acceptedCount,
          completedCount,
        };
      })
    );

    res.json({
      success: true,
      count: requestsWithCounts.length,
      requests: requestsWithCounts,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get detailed single request and its donor matches
// @route   GET /api/hospital/requests/:id
// @access  Private (Hospital | Admin)
exports.getRequestDetails = async (req, res) => {
  try {
    const request = await BloodRequest.findById(req.params.id).populate('hospitalId');
    if (!request) {
      return res.status(404).json({ success: false, message: 'Blood request not found.' });
    }

    const matches = await RequestMatch.find({ requestId: request._id })
      .populate({
        path: 'donorId',
        populate: { path: 'userId', select: 'name email' },
      })
      .sort({ updatedAt: -1 });

    // Expose contact details ONLY for donors who accepted
    const formattedMatches = matches.map((m) => {
      const donor = m.donorId;
      const isAccepted = m.status === 'accepted' || m.status === 'completed';

      return {
        _id: m._id,
        matchStatus: m.status,
        responseDate: m.responseDate,
        rejectionReason: m.rejectionReason,
        donorId: donor?._id,
        donorName: donor?.userId?.name || 'Anonymous Donor',
        donorBloodGroup: donor?.bloodGroup,
        donorCity: donor?.city,
        // Contact phone only revealed upon donor acceptance
        donorPhone: isAccepted ? donor?.phone : 'Hidden until donor accepts',
        donorEmail: isAccepted ? donor?.userId?.email : 'Hidden until donor accepts',
      };
    });

    res.json({
      success: true,
      request,
      matches: formattedMatches,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Cancel an active blood request
// @route   PUT /api/hospital/requests/:id/cancel
// @access  Private (Hospital | Admin)
exports.cancelRequest = async (req, res) => {
  try {
    const request = await BloodRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Blood request not found.' });
    }

    request.status = 'cancelled';
    await request.save();

    // Mark pending matches as cancelled
    await RequestMatch.updateMany(
      { requestId: request._id, status: 'pending' },
      { status: 'cancelled' }
    );

    res.json({
      success: true,
      message: 'Blood request cancelled successfully.',
      request,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Confirm completed donation
// @route   POST /api/hospital/confirm-donation
// @access  Private (Hospital)
exports.confirmDonation = async (req, res) => {
  try {
    const hospital = await HospitalProfile.findOne({ userId: req.user.id });
    if (!hospital) {
      return res.status(404).json({ success: false, message: 'Hospital profile not found.' });
    }

    const { matchId, units = 1, notes } = req.body;

    const match = await RequestMatch.findById(matchId)
      .populate('requestId')
      .populate('donorId');

    if (!match) {
      return res.status(404).json({ success: false, message: 'Request match record not found.' });
    }

    if (match.status === 'completed') {
      return res.status(400).json({ success: false, message: 'This donation has already been confirmed.' });
    }

    const request = match.requestId;
    const donor = match.donorId;

    const donationCode = `DON-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    // Create donation record
    const donation = await Donation.create({
      donationCode,
      requestId: request?._id || null,
      matchId: match._id,
      donorId: donor._id,
      hospitalId: hospital._id,
      units,
      bloodGroup: donor.bloodGroup,
      donationDate: new Date(),
      status: 'completed',
      verifiedByHospital: true,
      notes: notes || 'Verified donation at hospital premises.',
    });

    // Update match status
    match.status = 'completed';
    await match.save();

    // Update donor profile: last donation date and total donations count
    donor.lastDonationDate = new Date();
    donor.totalDonations = (donor.totalDonations || 0) + units;
    await donor.save();

    // Update request progress and lifecycle status
    if (request) {
      request.unitsFulfilled = (request.unitsFulfilled || 0) + units;
      if (request.unitsFulfilled >= request.unitsRequired) {
        request.status = 'fulfilled';
      } else {
        request.status = 'partially_fulfilled';
      }
      await request.save();
    }

    // Update Hospital Blood Inventory
    await BloodInventory.findOneAndUpdate(
      { hospitalId: hospital._id, bloodGroup: donor.bloodGroup },
      {
        $inc: { units: units },
        $set: { lastUpdated: new Date() },
      },
      { upsert: true, new: true }
    );

    // Notify donor of confirmation
    await Notification.create({
      userId: donor.userId,
      title: 'Donation Confirmed! ❤️',
      message: `Your donation of ${units} unit(s) of ${donor.bloodGroup} blood at ${hospital.hospitalName} was confirmed. Thank you for saving lives!`,
      type: 'donation',
      link: '/donor/history',
    });

    res.json({
      success: true,
      message: 'Donation verified and recorded successfully! Donor profile, inventory, and request progress updated.',
      donation,
      requestStatus: request ? request.status : null,
      unitsFulfilled: request ? request.unitsFulfilled : units,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
