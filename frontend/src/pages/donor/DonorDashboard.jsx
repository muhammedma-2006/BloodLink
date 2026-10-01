import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Activity, Calendar, MapPin, Clock, ArrowRight, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';
import { EligibilityCard } from '../../components/EligibilityCard';
import { StatusBadge } from '../../components/StatusBadge';

export const DonorDashboard = () => {
  const { user, profile, eligibility, refreshProfile } = useAuth();
  const { showSuccess, showError } = useToast();
  const [matches, setMatches] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchDonorData = async () => {
    setLoading(true);
    try {
      const [matchesRes, historyRes] = await Promise.all([
        api.donor.getRequests(),
        api.donor.getHistory(),
      ]);

      if (matchesRes.success) setMatches(matchesRes.matches);
      if (historyRes.success) setHistory(historyRes.donations);
    } catch (err) {
      console.error(err);
      showError('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonorData();
  }, []);

  const handleResponse = async (matchId, action) => {
    setActionLoading(matchId);
    try {
      const res = await api.donor.respondToRequest(matchId, action);
      if (res.success) {
        showSuccess(res.message);
        await fetchDonorData();
        await refreshProfile();
      }
    } catch (err) {
      showError(err.message || 'Error responding to request.');
    } finally {
      setActionLoading(null);
    }
  };

  const pendingMatches = matches.filter((m) => m.status === 'pending');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. Welcome & KPI Bar */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-red-600">Donor Portal</span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
            <span className="text-xs text-slate-500">{profile?.city || 'Location unassigned'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-xs text-slate-500">
            Blood Group:{' '}
            <strong className="text-red-600 text-sm font-black mr-2">{profile?.bloodGroup}</strong>
            {profile?.isAvailable ? (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Active Donor
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                Donations Paused
              </span>
            )}
          </p>
        </div>

        {/* Quick KPI stats */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-3.5 rounded-2xl bg-red-50/60 border border-red-100">
            <p className="text-2xl font-black text-red-600">{profile?.totalDonations || 0}</p>
            <p className="text-[11px] font-bold text-slate-600 uppercase">Donations</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-100">
            <p className="text-2xl font-black text-amber-600">{pendingMatches.length}</p>
            <p className="text-[11px] font-bold text-slate-600 uppercase">Pending</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-100">
            <p className="text-2xl font-black text-blue-600">{history.length}</p>
            <p className="text-[11px] font-bold text-slate-600 uppercase">Verified</p>
          </div>
        </div>
      </div>

      {/* 2. Clinical Eligibility Breakdown Card */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center">
            <Activity className="w-4 h-4 mr-2 text-red-600" />
            Medical Safety & Eligibility Analysis
          </h2>
          <Link to="/donor/eligibility" className="text-xs font-semibold text-red-600 hover:underline">
            View full eligibility details & calculator →
          </Link>
        </div>
        <EligibilityCard eligibility={eligibility} profile={profile} />
      </div>

      {/* 3. Matching Blood Requests Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center">
              <Heart className="w-4 h-4 mr-2 text-red-600 fill-current" />
              Matching Blood Requests ({pendingMatches.length} Pending)
            </h2>
            <p className="text-xs text-slate-500">
              Hospital requests matching your blood group ({profile?.bloodGroup}) and region
            </p>
          </div>
          <Link to="/donor/requests" className="text-xs font-semibold text-red-600 hover:underline">
            View all requests →
          </Link>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl p-8 text-center text-xs text-slate-400 border border-slate-200">
            Loading matching requests...
          </div>
        ) : pendingMatches.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 shadow-sm space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800">No Pending Requests Right Now</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              There are currently no urgent blood requests pending your response. We will notify you immediately when a hospital requests your blood group!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingMatches.slice(0, 4).map((m) => {
              const req = m.requestId;
              const hosp = req?.hospitalId;
              return (
                <div
                  key={m._id}
                  className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:border-red-200 transition-all space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span>
                        <h4 className="text-sm font-bold text-slate-900">
                          {req?.patientName} (Age: {req?.patientAge})
                        </h4>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {hosp?.hospitalName || 'Hospital Center'} • {req?.location}
                      </p>
                    </div>
                    <StatusBadge status={req?.urgency} />
                  </div>

                  <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-slate-50 text-[11px]">
                    <div>
                      <span className="text-slate-400 block">Requested</span>
                      <strong className="text-red-600 text-xs font-bold">{req?.bloodGroup}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Units Needed</span>
                      <strong className="text-slate-800 text-xs">{req?.unitsRequired} unit(s)</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Needed By</span>
                      <strong className="text-slate-800 text-xs">
                        {req?.neededByDate ? new Date(req.neededByDate).toLocaleDateString() : 'Immediate'}
                      </strong>
                    </div>
                  </div>

                  {req?.notes && (
                    <p className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg italic">
                      "{req.notes}"
                    </p>
                  )}

                  {/* Actions */}
                  <div className="pt-2 flex items-center justify-end space-x-2 border-t border-slate-100">
                    <button
                      onClick={() => handleResponse(m._id, 'reject')}
                      disabled={actionLoading === m._id}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-50 transition-colors"
                    >
                      Decline
                    </button>
                    <button
                      onClick={() => handleResponse(m._id, 'accept')}
                      disabled={actionLoading === m._id || !eligibility?.isEligible}
                      className={`px-4 py-1.5 rounded-xl text-xs font-bold text-white transition-all shadow-sm ${
                        eligibility?.isEligible
                          ? 'bg-red-600 hover:bg-red-700 shadow-red-600/20'
                          : 'bg-slate-300 cursor-not-allowed'
                      }`}
                      title={!eligibility?.isEligible ? 'You must be eligible to accept' : 'Accept Request'}
                    >
                      {actionLoading === m._id ? 'Saving...' : 'Accept to Donate'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Recent Donation History Snippet */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center">
              <Calendar className="w-4 h-4 mr-2 text-slate-600" />
              Recent Donation History
            </h3>
            <p className="text-xs text-slate-500">Your verified contributions to hospital blood banks</p>
          </div>
          <Link to="/donor/history" className="text-xs font-semibold text-red-600 hover:underline">
            View full log →
          </Link>
        </div>

        {history.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">
            No donation history recorded yet. Complete a donation to log your record!
          </p>
        ) : (
          <div className="divide-y divide-slate-100 text-xs">
            {history.slice(0, 3).map((item) => (
              <div key={item._id} className="py-3 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800">
                    {item.units} unit(s) of {item.bloodGroup} Blood
                  </span>
                  <p className="text-[11px] text-slate-500">
                    {item.hospitalId?.hospitalName || 'Medical Facility'} • Code: {item.donationCode}
                  </p>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Verified
                  </span>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {new Date(item.donationDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
