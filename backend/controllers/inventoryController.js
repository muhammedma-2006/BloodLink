const BloodInventory = require('../models/BloodInventory');
const HospitalProfile = require('../models/HospitalProfile');
const { ALL_BLOOD_GROUPS } = require('../config/eligibilityConfig');

// @desc    Get hospital blood inventory
// @route   GET /api/inventory
// @access  Private (Hospital | Admin)
exports.getInventory = async (req, res) => {
  try {
    let hospitalId;

    if (req.user.role === 'hospital') {
      const hospital = await HospitalProfile.findOne({ userId: req.user.id });
      if (!hospital) {
        return res.status(404).json({ success: false, message: 'Hospital profile not found.' });
      }
      hospitalId = hospital._id;
    } else if (req.query.hospitalId) {
      hospitalId = req.query.hospitalId;
    }

    const query = hospitalId ? { hospitalId } : {};
    const inventoryItems = await BloodInventory.find(query).populate('hospitalId', 'hospitalName city');

    // Ensure all 8 blood groups exist in representation
    const inventoryMap = {};
    inventoryItems.forEach((item) => {
      inventoryMap[item.bloodGroup] = item.units;
    });

    const fullInventory = ALL_BLOOD_GROUPS.map((bg) => ({
      bloodGroup: bg,
      units: inventoryMap[bg] || 0,
    }));

    res.json({
      success: true,
      inventory: fullInventory,
      rawItems: inventoryItems,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Update units for a blood group in hospital inventory
// @route   PUT /api/inventory
// @access  Private (Hospital | Admin)
exports.updateInventory = async (req, res) => {
  try {
    const { bloodGroup, units } = req.body;
    if (!bloodGroup || units === undefined) {
      return res.status(400).json({ success: false, message: 'Blood group and units are required.' });
    }

    let targetHospitalId;

    if (req.user.role === 'hospital') {
      const hospital = await HospitalProfile.findOne({ userId: req.user.id });
      if (!hospital) {
        return res.status(404).json({ success: false, message: 'Hospital profile not found.' });
      }
      targetHospitalId = hospital._id;
    } else if (req.user.role === 'admin') {
      targetHospitalId = req.body.hospitalId || req.query.hospitalId;
      if (!targetHospitalId) {
        return res.status(400).json({ success: false, message: 'hospitalId is required for administrator inventory updates.' });
      }
    }

    const item = await BloodInventory.findOneAndUpdate(
      { hospitalId: targetHospitalId, bloodGroup },
      { $set: { units: Math.max(0, parseInt(units, 10)), lastUpdated: new Date() } },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      message: `Inventory for ${bloodGroup} updated to ${item.units} units.`,
      item,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
