const { BLOOD_COMPATIBILITY } = require('../config/eligibilityConfig');
const DonorProfile = require('../models/DonorProfile');
const RequestMatch = require('../models/RequestMatch');
const Notification = require('../models/Notification');
const { evaluateEligibility } = require('./eligibilityService');

const escapeRegex = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * Finds matching donors for a given BloodRequest and generates Match & Notification records
 */
const matchDonorsForRequest = async (bloodRequest, hospitalProfile) => {
  try {
    const compatibleGroups = BLOOD_COMPATIBILITY[bloodRequest.bloodGroup] || [bloodRequest.bloodGroup];

    // Find donors with compatible blood group and available status
    const candidateQuery = {
      bloodGroup: { $in: compatibleGroups },
      isAvailable: true,
    };

    // If request has location, prioritize same city or nearby
    if (bloodRequest.location && typeof bloodRequest.location === 'string') {
      const citySegment = bloodRequest.location.trim().split(',')[0].trim();
      const cityRegex = new RegExp(escapeRegex(citySegment), 'i');
      candidateQuery.$or = [
        { city: cityRegex },
        { address: cityRegex },
      ];
    }

    let candidates = await DonorProfile.find(candidateQuery).populate('userId', 'name email isActive');

    // If city-specific match yields no candidates, broaden search to all compatible available donors
    if (candidates.length === 0) {
      candidates = await DonorProfile.find({
        bloodGroup: { $in: compatibleGroups },
        isAvailable: true,
      }).populate('userId', 'name email isActive');
    }

    // Filter only currently active users who pass medical eligibility
    const eligibleMatches = [];

    for (const donor of candidates) {
      if (!donor.userId || !donor.userId.isActive) continue;

      const eligibility = evaluateEligibility(donor);
      if (eligibility.isEligible) {
        eligibleMatches.push(donor);

        // Create or find existing RequestMatch record
        const existingMatch = await RequestMatch.findOne({
          requestId: bloodRequest._id,
          donorId: donor._id,
        });

        if (!existingMatch) {
          await RequestMatch.create({
            requestId: bloodRequest._id,
            donorId: donor._id,
            hospitalId: bloodRequest.hospitalId,
            status: 'pending',
          });

          // Dispatch notification to donor
          await Notification.create({
            userId: donor.userId._id,
            title: `Urgent Match: ${bloodRequest.bloodGroup} Blood Request`,
            message: `${hospitalProfile.hospitalName || 'A hospital'} in ${bloodRequest.location} requires ${bloodRequest.unitsRequired} unit(s) of ${bloodRequest.bloodGroup} blood for patient ${bloodRequest.patientName}. Urgency: ${bloodRequest.urgency.toUpperCase()}.`,
            type: 'match',
            link: `/donor/requests`,
          });
        }
      }
    }

    return eligibleMatches;
  } catch (err) {
    console.error('[BloodLink MatchingService] Error finding matches:', err);
    throw err;
  }
};

module.exports = {
  matchDonorsForRequest,
};
