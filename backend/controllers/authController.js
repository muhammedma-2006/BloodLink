const jwt = require('jsonwebtoken');
const User = require('../models/User');
const DonorProfile = require('../models/DonorProfile');
const HospitalProfile = require('../models/HospitalProfile');
const Notification = require('../models/Notification');
const { evaluateEligibility } = require('../services/eligibilityService');

// Generate JWT token helper
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'bloodlink_super_secure_jwt_secret_dev_key_2026_change_in_prod',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// @desc    Check initial admin setup status
// @route   GET /api/auth/setup-status
// @access  Public
exports.getSetupStatus = async (req, res) => {
  try {
    const adminCount = await User.countDocuments({ role: 'admin' });
    res.json({
      success: true,
      adminExists: adminCount > 0,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Secure initial administrator setup (only possible when 0 admins exist)
// @route   POST /api/auth/setup-admin
// @access  Public (One-time locked)
exports.setupAdmin = async (req, res) => {
  try {
    const adminCount = await User.countDocuments({ role: 'admin' });
    if (adminCount > 0) {
      return res.status(403).json({
        success: false,
        message: 'Administrator account already exists. Initial setup is locked.',
      });
    }

    const { name, email, password } = req.body;
    if (!name || !email || !password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and a password of at least 6 characters are required.',
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    const admin = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: 'admin',
      isActive: true,
    });

    const token = generateToken(admin._id);

    res.status(201).json({
      success: true,
      message: 'Primary administrator account initialized successfully.',
      token,
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Register a new user (donor or hospital)
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role = 'donor',
      // Donor profile fields
      bloodGroup,
      dob,
      phone,
      gender,
      address,
      city,
      state,
      lastDonationDate,
      hasTattooLast3Months,
      tattooDate,
      weightKg,
      // Hospital profile fields
      hospitalName,
      registrationNumber,
      hospitalType,
      emergencyContact,
    } = req.body;

    // Restrict regular self-registration to donor and hospital
    if (!['donor', 'hospital'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Public registration is only available for Donors and Hospitals. Administrators must be provisioned via setup.',
      });
    }

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required fields.',
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    // Role-specific validation
    if (role === 'donor') {
      if (!bloodGroup || !dob || !city || !phone) {
        return res.status(400).json({
          success: false,
          message: 'Donors must provide blood group, date of birth, phone, and city.',
        });
      }
    } else if (role === 'hospital') {
      if (!hospitalName || !registrationNumber || !city || !phone || !address) {
        return res.status(400).json({
          success: false,
          message: 'Hospitals must provide name, registration number, address, city, and phone.',
        });
      }
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role,
    });

    let profile = null;

    if (role === 'donor') {
      profile = await DonorProfile.create({
        userId: user._id,
        bloodGroup,
        dob,
        phone,
        gender: gender || 'other',
        address: address || '',
        city,
        state: state || '',
        lastDonationDate: lastDonationDate || null,
        hasTattooLast3Months: Boolean(hasTattooLast3Months),
        tattooDate: tattooDate || null,
        weightKg: weightKg || 60,
      });

      // Welcome notification
      await Notification.create({
        userId: user._id,
        title: 'Welcome to BloodLink!',
        message: 'Thank you for registering as a blood donor. Check your eligibility and keep your profile up to date.',
        type: 'system',
      });
    } else if (role === 'hospital') {
      profile = await HospitalProfile.create({
        userId: user._id,
        hospitalName,
        registrationNumber,
        hospitalType: hospitalType || 'Private',
        phone,
        address,
        city,
        state: state || '',
        emergencyContact: emergencyContact || '',
      });

      await Notification.create({
        userId: user._id,
        title: 'Hospital Account Activated',
        message: 'Your hospital account is ready. You can now submit urgent blood requests and find matching donors.',
        type: 'system',
      });
    }

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      profile,
    });
  } catch (err) {
    console.error('[Register Error]', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Server error while registering.',
    });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account is deactivated. Please contact an administrator.',
      });
    }

    // Fetch corresponding profile
    let profile = null;
    let eligibility = null;

    if (user.role === 'donor') {
      profile = await DonorProfile.findOne({ userId: user._id });
      if (profile) {
        eligibility = evaluateEligibility(profile);
      }
    } else if (user.role === 'hospital') {
      profile = await HospitalProfile.findOne({ userId: user._id });
    }

    const unreadNotifications = await Notification.countDocuments({
      userId: user._id,
      isRead: false,
    });

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      profile,
      eligibility,
      unreadNotifications,
    });
  } catch (err) {
    console.error('[Login Error]', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Server error while logging in.',
    });
  }
};

// @desc    Get current logged in user & profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    let profile = null;
    let eligibility = null;

    if (user.role === 'donor') {
      profile = await DonorProfile.findOne({ userId: user._id });
      if (profile) {
        eligibility = evaluateEligibility(profile);
      }
    } else if (user.role === 'hospital') {
      profile = await HospitalProfile.findOne({ userId: user._id });
    }

    const unreadNotifications = await Notification.countDocuments({
      userId: user._id,
      isRead: false,
    });

    res.json({
      success: true,
      user,
      profile,
      eligibility,
      unreadNotifications,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
