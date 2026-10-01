const mongoose = require('mongoose');

const bloodInventorySchema = new mongoose.Schema(
  {
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'HospitalProfile',
      required: true,
      index: true,
    },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      required: true,
    },
    units: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

bloodInventorySchema.index({ hospitalId: 1, bloodGroup: 1 }, { unique: true });

module.exports = mongoose.model('BloodInventory', bloodInventorySchema);
