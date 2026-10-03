const mongoose = require('mongoose');

const donorProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      required: [true, 'Blood group is required'],
      index: true,
    },
    dob: {
      type: Date,
      required: [true, 'Date of birth is required'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      default: 'other',
    },
    address: {
      type: String,
      default: '',
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
    lastDonationDate: {
      type: Date,
      default: null,
    },
    hasTattooLast3Months: {
      type: Boolean,
      default: false,
    },
    tattooDate: {
      type: Date,
      default: null,
    },
    weightKg: {
      type: Number,
      default: 60,
    },
    isAvailable: {
      type: Boolean,
      default: true,
      index: true,
    },
    totalDonations: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

donorProfileSchema.index({ bloodGroup: 1, isAvailable: 1 });
donorProfileSchema.index({ city: 1, bloodGroup: 1 });

// Virtual for calculating current age from DOB
donorProfileSchema.virtual('age').get(function () {
  if (!this.dob) return null;
  const diffMs = Date.now() - new Date(this.dob).getTime();
  const ageDt = new Date(diffMs);
  return Math.abs(ageDt.getUTCFullYear() - 1970);
});

donorProfileSchema.set('toJSON', { virtuals: true });
donorProfileSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('DonorProfile', donorProfileSchema);
