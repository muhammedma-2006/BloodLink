const mongoose = require('mongoose');

const eligibilityCheckSchema = new mongoose.Schema(
  {
    donorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DonorProfile',
      required: true,
      index: true,
    },
    checkDate: {
      type: Date,
      default: Date.now,
    },
    isEligible: {
      type: Boolean,
      required: true,
    },
    reasons: [
      {
        type: String,
      },
    ],
    details: {
      intervalSatisfied: Boolean,
      daysSinceLastDonation: Number,
      minDaysRequired: Number,
      tattooRuleSatisfied: Boolean,
      hasRecentTattoo: Boolean,
      ageSatisfied: Boolean,
      currentAge: Number,
      weightSatisfied: Boolean,
      weightKg: Number,
      isAvailable: Boolean,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('EligibilityCheck', eligibilityCheckSchema);
