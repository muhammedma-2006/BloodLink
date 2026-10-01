const User = require('../models/User');
const DonorProfile = require('../models/DonorProfile');
const HospitalProfile = require('../models/HospitalProfile');
const BloodRequest = require('../models/BloodRequest');
const Donation = require('../models/Donation');
const BloodInventory = require('../models/BloodInventory');
const RequestMatch = require('../models/RequestMatch');

// @desc    Admin dashboard summary metrics
// @route   GET /api/admin/stats
// @access  Private (Admin)
exports.getDashboardStats = async (req, res) => {
  try {
    const totalDonors = await DonorProfile.countDocuments();
    const totalHospitals = await HospitalProfile.countDocuments();
    const totalRequests = await BloodRequest.countDocuments();
    const openRequests = await BloodRequest.countDocuments({ status: { $in: ['open', 'partially_fulfilled'] } });
    const fulfilledRequests = await BloodRequest.countDocuments({ status: 'fulfilled' });
    const totalDonations = await Donation.countDocuments({ status: 'completed' });

    // Inventory sum across all hospitals
    const inventoryAgg = await BloodInventory.aggregate([
      { $group: { _id: '$bloodGroup', totalUnits: { $sum: '$units' } } },
    ]);

    // Blood group donor breakdown
    const donorBloodGroupAgg = await DonorProfile.aggregate([
      { $group: { _id: '$bloodGroup', count: { $sum: 1 } } },
    ]);

    // Recent requests
    const recentRequests = await BloodRequest.find()
      .populate('hospitalId', 'hospitalName city')
      .sort({ createdAt: -1 })
      .limit(5);

    // Recent donations
    const recentDonations = await Donation.find({ status: 'completed' })
      .populate('hospitalId', 'hospitalName')
      .populate({
        path: 'donorId',
        populate: { path: 'userId', select: 'name' },
      })
      .sort({ donationDate: -1 })
      .limit(5);

    res.json({
      success: true,
      stats: {
        totalDonors,
        totalHospitals,
        totalRequests,
        openRequests,
        fulfilledRequests,
        totalDonations,
      },
      inventoryByBloodGroup: inventoryAgg,
      donorsByBloodGroup: donorBloodGroupAgg,
      recentRequests,
      recentDonations,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get all users with profile data
// @route   GET /api/admin/users
// @access  Private (Admin)
exports.getAllUsers = async (req, res) => {
  try {
    const { role } = req.query;
    const query = role ? { role } : {};
    const users = await User.find(query).select('-password').sort({ createdAt: -1 });

    const enrichedUsers = await Promise.all(
      users.map(async (u) => {
        let details = null;
        if (u.role === 'donor') {
          details = await DonorProfile.findOne({ userId: u._id });
        } else if (u.role === 'hospital') {
          details = await HospitalProfile.findOne({ userId: u._id });
        }
        return {
          ...u.toObject(),
          profileDetails: details,
        };
      })
    );

    res.json({
      success: true,
      count: enrichedUsers.length,
      users: enrichedUsers,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Toggle user active/deactive status
// @route   PUT /api/admin/users/:id/toggle-status
// @access  Private (Admin)
exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (user.role === 'admin' && user._id.toString() === req.user.id.toString()) {
      return res.status(400).json({ success: false, message: 'Administrators cannot deactivate themselves.' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      success: true,
      message: `User account has been ${user.isActive ? 'activated' : 'deactivated'}.`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isActive: user.isActive,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get all requests system-wide
// @route   GET /api/admin/requests
// @access  Private (Admin)
exports.getAllRequests = async (req, res) => {
  try {
    const { status, urgency, bloodGroup } = req.query;
    const query = {};
    if (status) query.status = status;
    if (urgency) query.urgency = urgency;
    if (bloodGroup) query.bloodGroup = bloodGroup;

    const requests = await BloodRequest.find(query)
      .populate('hospitalId')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get system audit reports
// @route   GET /api/admin/reports
// @access  Private (Admin)
exports.getReports = async (req, res) => {
  try {
    const requestStatusStats = await BloodRequest.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 }, totalUnits: { $sum: '$unitsRequired' } } },
    ]);

    const donationsByMonth = await Donation.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$donationDate' },
            month: { $month: '$donationDate' },
          },
          count: { $sum: 1 },
          units: { $sum: '$units' },
        },
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 },
    ]);

    res.json({
      success: true,
      requestStatusStats,
      donationsByMonth,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
