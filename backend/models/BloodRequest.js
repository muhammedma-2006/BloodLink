const mongoose = require('mongoose');

const bloodRequestSchema = new mongoose.Schema(
  {
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'HospitalProfile',
      required: true,
      index: true,
    },
    patientName: {
      type: String,
      required: [true, 'Patient name is required'],
      trim: true,
    },
    patientAge: {
      type: Number,
      required: [true, 'Patient age is required'],
      min: 0,
      max: 130,
    },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      required: [true, 'Blood group is required'],
      index: true,
    },
    unitsRequired: {
      type: Number,
      required: [true, 'Units required is required'],
      min: [1, 'Must request at least 1 unit'],
    },
    unitsFulfilled: {
      type: Number,
      default: 0,
      min: 0,
    },
    urgency: {
      type: String,
      enum: ['critical', 'high', 'medium', 'low'],
      default: 'high',
    },
    neededByDate: {
      type: Date,
      required: [true, 'Needed by date is required'],
    },
    location: {
      type: String,
      required: [true, 'Hospital/Delivery location is required'],
      trim: true,
    },
    contactPhone: {
      type: String,
      required: [true, 'Contact phone is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['open', 'partially_fulfilled', 'fulfilled', 'cancelled', 'expired'],
      default: 'open',
      index: true,
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

bloodRequestSchema.index({ hospitalId: 1, status: 1 });
bloodRequestSchema.index({ bloodGroup: 1, status: 1 });

module.exports = mongoose.model('BloodRequest', bloodRequestSchema);
