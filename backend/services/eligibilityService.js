const { ELIGIBILITY_RULES } = require('../config/eligibilityConfig');
const EligibilityCheck = require('../models/EligibilityCheck');

/**
 * Evaluates donor eligibility based on project documents:
 * - Interval since last donation (configurable, default 90 days)
 * - Tattoo within last 3 months (configurable, default 3 months)
 * - Age within acceptable range (18-65)
 * - Weight requirement (>= 45kg)
 * - General donor availability flag
 */
const evaluateEligibility = (donor) => {
  const reasons = [];
  const details = {
    intervalSatisfied: true,
    daysSinceLastDonation: null,
    minDaysRequired: ELIGIBILITY_RULES.MIN_DAYS_BETWEEN_DONATIONS,
    tattooRuleSatisfied: true,
    hasRecentTattoo: false,
    ageSatisfied: true,
    currentAge: null,
    weightSatisfied: true,
    weightKg: donor.weightKg || null,
    isAvailable: donor.isAvailable !== false,
  };

  const now = new Date();

  // 1. Check Last Donation Date Interval
  if (donor.lastDonationDate) {
    const lastDate = new Date(donor.lastDonationDate);
    const diffTime = Math.abs(now.getTime() - lastDate.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    details.daysSinceLastDonation = diffDays;

    if (diffDays < ELIGIBILITY_RULES.MIN_DAYS_BETWEEN_DONATIONS) {
      details.intervalSatisfied = false;
      const daysRemaining = ELIGIBILITY_RULES.MIN_DAYS_BETWEEN_DONATIONS - diffDays;
      reasons.push(
        `Donation interval not satisfied: Last donation was ${diffDays} days ago. A minimum interval of ${ELIGIBILITY_RULES.MIN_DAYS_BETWEEN_DONATIONS} days is required (${daysRemaining} day(s) remaining).`
      );
    }
  }

  // 2. Check Tattoo Recency (within last 3 months)
  let recentTattoo = false;
  if (donor.hasTattooLast3Months) {
    recentTattoo = true;
  }
  if (donor.tattooDate) {
    const tattooDate = new Date(donor.tattooDate);
    const monthsDiff = (now.getFullYear() - tattooDate.getFullYear()) * 12 + (now.getMonth() - tattooDate.getMonth());
    const daysDiff = (now.getTime() - tattooDate.getTime()) / (1000 * 60 * 60 * 24);
    if (daysDiff < ELIGIBILITY_RULES.TATTOO_MONTHS_RESTRICTION * 30.5) {
      recentTattoo = true;
    }
  }

  if (recentTattoo) {
    details.tattooRuleSatisfied = false;
    details.hasRecentTattoo = true;
    reasons.push(
      `Safety rule: Received a tattoo within the last ${ELIGIBILITY_RULES.TATTOO_MONTHS_RESTRICTION} months. Temporary deferral applies.`
    );
  }

  // 3. Check Age bounds
  if (donor.dob) {
    const birthDate = new Date(donor.dob);
    let age = now.getFullYear() - birthDate.getFullYear();
    const monthDiff = now.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birthDate.getDate())) {
      age--;
    }
    details.currentAge = age;

    if (age < ELIGIBILITY_RULES.MIN_AGE || age > ELIGIBILITY_RULES.MAX_AGE) {
      details.ageSatisfied = false;
      reasons.push(
        `Age condition not met: Current age is ${age} years. Must be between ${ELIGIBILITY_RULES.MIN_AGE} and ${ELIGIBILITY_RULES.MAX_AGE} years.`
      );
    }
  }

  // 4. Weight check
  if (donor.weightKg && donor.weightKg < ELIGIBILITY_RULES.MIN_WEIGHT_KG) {
    details.weightSatisfied = false;
    reasons.push(
      `Weight condition not met: Weight is ${donor.weightKg} kg. Minimum required weight is ${ELIGIBILITY_RULES.MIN_WEIGHT_KG} kg.`
    );
  }

  // 5. Availability
  if (donor.isAvailable === false) {
    reasons.push('Donor status is currently set to paused / unavailable.');
  }

  const isEligible = reasons.length === 0;

  // Calculate Next Eligible Date
  let nextEligibleDate = null;
  if (!details.intervalSatisfied && donor.lastDonationDate) {
    const eligibleInterval = new Date(donor.lastDonationDate);
    eligibleInterval.setDate(eligibleInterval.getDate() + ELIGIBILITY_RULES.MIN_DAYS_BETWEEN_DONATIONS);
    nextEligibleDate = eligibleInterval;
  }
  if (!details.tattooRuleSatisfied && donor.tattooDate) {
    const eligibleTattoo = new Date(donor.tattooDate);
    eligibleTattoo.setDate(eligibleTattoo.getDate() + ELIGIBILITY_RULES.TATTOO_MONTHS_RESTRICTION * 30);
    if (!nextEligibleDate || eligibleTattoo > nextEligibleDate) {
      nextEligibleDate = eligibleTattoo;
    }
  }

  return {
    isEligible,
    reasons,
    details,
    nextEligibleDate,
  };
};

/**
 * Evaluates and records the eligibility check to the database
 */
const recordEligibilityCheck = async (donor) => {
  const result = evaluateEligibility(donor);

  await EligibilityCheck.create({
    donorId: donor._id,
    checkDate: new Date(),
    isEligible: result.isEligible,
    reasons: result.reasons,
    details: result.details,
  });

  return result;
};

module.exports = {
  evaluateEligibility,
  recordEligibilityCheck,
};
