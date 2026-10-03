import React, { useState, useEffect } from 'react';
import { Activity, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';
import { EligibilityCard } from '../../components/EligibilityCard';

export const EligibilityChecker = () => {
  const { profile, eligibility, refreshProfile } = useAuth();
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(false);
  const [rules, setRules] = useState(null);

  // Self-check interactive scenario simulator
  const [simDonationDate, setSimDonationDate] = useState('');
  const [simTattoo, setSimTattoo] = useState(false);
  const [simAge, setSimAge] = useState(25);
  const [simWeight, setSimWeight] = useState(65);
  const [simResult, setSimResult] = useState(null);

  useEffect(() => {
    api.getEligibilityRules().then((res) => {
      if (res.success) setRules(res.rules);
    }).catch(console.error);
  }, []);

  const handleRecheck = async () => {
    setLoading(true);
    try {
      const res = await api.donor.checkEligibility();
      if (res.success) {
        showSuccess('Eligibility re-evaluated and recorded to medical ledger.');
        await refreshProfile();
      }
    } catch (err) {
      showError(err.message || 'Failed to check eligibility.');
    } finally {
      setLoading(false);
    }
  };

  const simulateEligibility = (e) => {
    e.preventDefault();
    const now = new Date();
    const simReasons = [];
    const minDays = rules?.MIN_DAYS_BETWEEN_DONATIONS || 90;
    const minMonths = rules?.TATTOO_MONTHS_RESTRICTION || 3;
    const minAge = rules?.MIN_AGE || 18;
    const maxAge = rules?.MAX_AGE || 65;
    const minWeight = rules?.MIN_WEIGHT_KG || 45;

    let daysSince = null;
    let nextEligible = null;

    if (simDonationDate) {
      const diffMs = now.getTime() - new Date(simDonationDate).getTime();
      daysSince = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      if (daysSince < minDays) {
        simReasons.push(`Donation interval not met: Last donation was ${daysSince} days ago (${minDays - daysSince} days remaining).`);
        const eligibleDate = new Date(simDonationDate);
        eligibleDate.setDate(eligibleDate.getDate() + minDays);
        nextEligible = eligibleDate;
      }
    }

    if (simTattoo) {
      simReasons.push(`Recent tattoo safety rule: A minimum ${minMonths}-month pause applies following new tattoos.`);
    }

    if (simAge < minAge || simAge > maxAge) {
      simReasons.push(`Age rule: Stated age of ${simAge} falls outside safe donation bracket (${minAge}–${maxAge} years).`);
    }

    if (simWeight < minWeight) {
      simReasons.push(`Weight rule: Stated body weight of ${simWeight}kg is below ${minWeight}kg threshold.`);
    }

    setSimResult({
      isEligible: simReasons.length === 0,
      reasons: simReasons,
      daysSince,
      nextEligible,
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-red-600 uppercase tracking-widest">Clinical Safety Engine</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Donor Eligibility Verification
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Evaluates donation interval, tattoo recency safety rule, age, and weight requirements
          </p>
        </div>

        <button
          onClick={handleRecheck}
          disabled={loading}
          className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 shadow-sm transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
          Re-evaluate Ledger
        </button>
      </div>

      {/* 1. Current Live Status */}
      <div className="space-y-2">
        <h2 className="text-sm font-bold text-slate-800">Your Official Recorded Status</h2>
        <EligibilityCard eligibility={eligibility} profile={profile} />
      </div>

      {/* 2. Interactive Simulator Calculator */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-red-600" />
            Interactive Eligibility Simulator
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Want to know when you can donate next? Simulate hypothetical dates and criteria below without altering your profile.
          </p>
        </div>

        <form onSubmit={simulateEligibility} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Hypothetical Last Donation Date
            </label>
            <input
              type="date"
              value={simDonationDate}
              onChange={(e) => setSimDonationDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Hypothetical Age (Years)</label>
            <input
              type="number"
              min="10"
              max="100"
              value={simAge}
              onChange={(e) => setSimAge(parseInt(e.target.value, 10))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Body Weight (kg)</label>
            <input
              type="number"
              min="30"
              max="200"
              value={simWeight}
              onChange={(e) => setSimWeight(parseInt(e.target.value, 10))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs"
            />
          </div>

          <div className="flex items-center pt-5">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={simTattoo}
                onChange={(e) => setSimTattoo(e.target.checked)}
                className="w-4 h-4 text-red-600 rounded border-slate-300 focus:ring-red-500"
              />
              <span className="text-slate-800 font-medium text-xs">
                Received a tattoo or piercing within past 3 months?
              </span>
            </label>
          </div>

          <div className="sm:col-span-2 pt-2">
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl font-bold text-white bg-slate-900 hover:bg-slate-800 text-xs shadow-md transition-all"
            >
              Simulate Eligibility Calculation
            </button>
          </div>
        </form>

        {simResult && (
          <div
            className={`p-4 rounded-2xl border text-xs ${
              simResult.isEligible
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}
          >
            <div className="flex items-center space-x-2 font-bold mb-2">
              {simResult.isEligible ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              ) : (
                <XCircle className="w-5 h-5 text-rose-600" />
              )}
              <span className="text-sm">
                Simulation Outcome:{' '}
                {simResult.isEligible ? 'Eligible to Donate' : 'Temporarily Ineligible'}
              </span>
            </div>

            {simResult.nextEligible && (
              <p className="text-[11px] mb-2 font-semibold">
                Estimated Next Donation Date: {simResult.nextEligible.toLocaleDateString()}
              </p>
            )}

            {simResult.reasons.length > 0 && (
              <ul className="list-disc list-inside space-y-1 text-slate-700 text-[11px]">
                {simResult.reasons.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
