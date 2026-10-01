/**
 * BloodLink - Configurable Eligibility & Blood Group Rules
 * Grounded in project documents and configurable system settings.
 */

const ELIGIBILITY_RULES = {
  // Interval between consecutive donations (in days, ~3 months)
  MIN_DAYS_BETWEEN_DONATIONS: 90,

  // Recency restriction for tattoos (in months, as explicitly specified in Activity Diagram)
  TATTOO_MONTHS_RESTRICTION: 3,

  // Age eligibility bounds
  MIN_AGE: 18,
  MAX_AGE: 65,

  // Minimum required body weight in kg (standard medical safety guideline)
  MIN_WEIGHT_KG: 45,
};

// Blood group compatibility dictionary: maps requested blood group to acceptable donor blood groups
const BLOOD_COMPATIBILITY = {
  'A+': ['A+', 'A-', 'O+', 'O-'],
  'A-': ['A-', 'O-'],
  'B+': ['B+', 'B-', 'O+', 'O-'],
  'B-': ['B-', 'O-'],
  'AB+': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], // Universal Recipient
  'AB-': ['AB-', 'A-', 'B-', 'O-'],
  'O+': ['O+', 'O-'],
  'O-': ['O-'] // Universal Donor
};

const ALL_BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

module.exports = {
  ELIGIBILITY_RULES,
  BLOOD_COMPATIBILITY,
  ALL_BLOOD_GROUPS,
};
