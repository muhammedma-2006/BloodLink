const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema(
  {
    donationCode: {
      type: String,
      unique: true,
      required: true,
    },
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BloodRequest',
      default: null,
    },
    matchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RequestMatch',
      default: null,
    },
    donorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DonorProfile',
      required: true,
      index: true,
    },
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'HospitalProfile',
      required: true,
      index: true,
    },
    units: {
      type: Number,
      default: 1,
      min: 1,
    },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      required: true,
    },
    donationDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'cancelled'],
      default: 'completed',
    },
    verifiedByHospital: {
      type: Boolean,
      default: true,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Donation', donationSchema);
