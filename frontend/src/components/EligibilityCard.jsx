import React from 'react';
import { CheckCircle2, XCircle, AlertCircle, Calendar, ShieldAlert, Heart, Activity } from 'lucide-react';

export const EligibilityCard = ({ eligibility, profile }) => {
  if (!eligibility) {
    return (
      <div className="bg-[#FFFFFF] rounded-2xl p-6 border border-[#E4E7EC] shadow-sm animate-pulse">
        <div className="h-6 bg-[#E4E7EC] rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-[#F7F8FA] rounded w-full mb-2"></div>
      </div>
    );
  }

  const { isEligible, reasons, details, nextEligibleDate } = eligibility;

  return (
    <div
      className={`rounded-2xl p-6 border shadow-sm transition-all ${
        isEligible
          ? 'bg-gradient-to-br from-[#25855A]/5 via-[#FFFFFF] to-[#25855A]/10 border-[#25855A]/30'
          : 'bg-gradient-to-br from-[#D04444]/5 via-[#FFFFFF] to-[#B7791F]/5 border-[#D04444]/30'
      }`}
    >
      {/* Header status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E4E7EC] gap-4">
        <div className="flex items-center space-x-3">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              isEligible ? 'bg-[#25855A]/15 text-[#25855A]' : 'bg-[#D04444]/15 text-[#D04444]'
            }`}
          >
            {isEligible ? <CheckCircle2 className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#202B36]">
              Donation Eligibility Status:{' '}
              <span className={isEligible ? 'text-[#25855A]' : 'text-[#D04444]'}>
                {isEligible ? 'Eligible to Donate' : 'Temporarily Ineligible'}
              </span>
            </h3>
            <p className="text-xs text-[#667085]">
              Evaluated in real-time according to BloodLink clinical safety rules
            </p>
          </div>
        </div>

        {nextEligibleDate && (
          <div className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#B7791F]/10 text-[#B7791F] border border-[#B7791F]/30">
            <Calendar className="w-3.5 h-3.5 mr-1.5" />
            Next Eligible:{' '}
            <strong className="ml-1">
              {new Date(nextEligibleDate).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </strong>
          </div>
        )}
      </div>

      {/* Condition breakdown */}
      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* 1. Interval Check */}
        <div
          className={`p-3.5 rounded-xl border text-xs ${
            details?.intervalSatisfied
              ? 'bg-[#25855A]/5 border-[#25855A]/25 text-[#202B36]'
              : 'bg-[#D04444]/5 border-[#D04444]/25 text-[#D04444]'
          }`}
        >
          <div className="flex items-center justify-between mb-1 font-semibold">
            <span className="flex items-center">
              <Calendar className="w-3.5 h-3.5 mr-1" />
              Donation Interval
            </span>
            <span className={details?.intervalSatisfied ? 'text-[#25855A]' : 'text-[#D04444]'}>
              {details?.intervalSatisfied ? 'Satisfied' : 'Wait Period'}
            </span>
          </div>
          <div className="text-[11px] text-[#667085]">
            {profile?.lastDonationDate ? (
              <>
                Last donated {details?.daysSinceLastDonation} days ago. (Min {details?.minDaysRequired} days)
              </>
            ) : (
              'No previous donations recorded.'
            )}
          </div>
        </div>

        {/* 2. Tattoo Rule (from Activity Diagram) */}
        <div
          className={`p-3.5 rounded-xl border text-xs ${
            details?.tattooRuleSatisfied
              ? 'bg-[#25855A]/5 border-[#25855A]/25 text-[#202B36]'
              : 'bg-[#D04444]/5 border-[#D04444]/25 text-[#D04444]'
          }`}
        >
          <div className="flex items-center justify-between mb-1 font-semibold">
            <span className="flex items-center">
              <ShieldAlert className="w-3.5 h-3.5 mr-1" />
              Tattoo Safety (3 Mo.)
            </span>
            <span className={details?.tattooRuleSatisfied ? 'text-[#25855A]' : 'text-[#D04444]'}>
              {details?.tattooRuleSatisfied ? 'Passed' : 'Restriction'}
            </span>
          </div>
          <div className="text-[11px] text-[#667085]">
            {profile?.hasTattooLast3Months || details?.hasRecentTattoo
              ? 'Tattoo within last 3 months.'
              : 'No recent tattoo reported.'}
          </div>
        </div>

        {/* 3. Age bounds */}
        <div
          className={`p-3.5 rounded-xl border text-xs ${
            details?.ageSatisfied
              ? 'bg-[#25855A]/5 border-[#25855A]/25 text-[#202B36]'
              : 'bg-[#D04444]/5 border-[#D04444]/25 text-[#D04444]'
          }`}
        >
          <div className="flex items-center justify-between mb-1 font-semibold">
            <span className="flex items-center">
              <Activity className="w-3.5 h-3.5 mr-1" />
              Age Bounds (18-65)
            </span>
            <span className={details?.ageSatisfied ? 'text-[#25855A]' : 'text-[#D04444]'}>
              {details?.ageSatisfied ? 'Passed' : 'Out of Range'}
            </span>
          </div>
          <div className="text-[11px] text-[#667085]">
            Current age: {details?.currentAge ? `${details.currentAge} years` : 'Not provided'}
          </div>
        </div>

        {/* 4. Weight check */}
        <div
          className={`p-3.5 rounded-xl border text-xs ${
            details?.weightSatisfied
              ? 'bg-[#25855A]/5 border-[#25855A]/25 text-[#202B36]'
              : 'bg-[#D04444]/5 border-[#D04444]/25 text-[#D04444]'
          }`}
        >
          <div className="flex items-center justify-between mb-1 font-semibold">
            <span className="flex items-center">
              <Heart className="w-3.5 h-3.5 mr-1" />
              Weight Check (≥45kg)
            </span>
            <span className={details?.weightSatisfied ? 'text-[#25855A]' : 'text-[#D04444]'}>
              {details?.weightSatisfied ? 'Passed' : 'Underweight'}
            </span>
          </div>
          <div className="text-[11px] text-[#667085]">
            Recorded weight: {profile?.weightKg || '60'} kg
          </div>
        </div>
      </div>

      {/* Explanatory Reasons if Ineligible */}
      {!isEligible && reasons && reasons.length > 0 && (
        <div className="mt-4 p-4 rounded-xl bg-[#D04444]/10 border border-[#D04444]/30 text-xs text-[#D04444]">
          <div className="flex items-center font-bold mb-1.5 text-[#B42332]">
            <AlertCircle className="w-4 h-4 mr-1.5 flex-shrink-0" />
            Condition(s) affecting your current eligibility:
          </div>
          <ul className="list-disc list-inside space-y-1 pl-1 text-[#202B36]">
            {reasons.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
