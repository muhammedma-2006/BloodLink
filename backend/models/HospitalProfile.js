const mongoose = require('mongoose');

const hospitalProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    hospitalName: {
      type: String,
      required: [true, 'Hospital name is required'],
      trim: true,
    },
    registrationNumber: {
      type: String,
      required: [true, 'Hospital registration number is required'],
      trim: true,
    },
    hospitalType: {
      type: String,
      enum: ['Government', 'Private', 'Clinic', 'Blood Bank', 'Charitable'],
      default: 'Private',
    },
    phone: {
      type: String,
      required: [true, 'Contact phone is required'],
      trim: true,
    },
    address: {
      type: String,
      required: [true, 'Hospital address is required'],
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'City/Location is required'],
      trim: true,
      index: true,
    },
    state: {
      type: String,
      default: '',
      trim: true,
    },
    emergencyContact: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('HospitalProfile', hospitalProfileSchema);
