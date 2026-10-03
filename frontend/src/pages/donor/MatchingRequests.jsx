import React, { useState, useEffect } from 'react';
import { Heart, AlertCircle, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { StatusBadge } from '../../components/StatusBadge';

export const MatchingRequests = () => {
  const { eligibility, refreshProfile } = useAuth();
  const { showSuccess, showError } = useToast();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState(null);

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const res = await api.donor.getRequests();
      if (res.success) {
        setMatches(res.matches);
      }
    } catch (err) {
      showError(err.message || 'Failed to load matching requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  const handleRespond = async (matchId, action) => {
    setActionLoading(matchId);
    try {
      const res = await api.donor.respondToRequest(matchId, action);
      if (res.success) {
        showSuccess(res.message);
        await fetchMatches();
        await refreshProfile();
      }
    } catch (err) {
      showError(err.message || 'Error processing response.');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredMatches = matches.filter((m) => {
    if (statusFilter === 'all') return true;
    return m.status === statusFilter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-red-600 uppercase tracking-widest">Blood Matches</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Matching Blood Donation Requests
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Requests from verified hospitals matching your blood profile and location
          </p>
        </div>

        {/* Filter chips */}
        <div className="flex items-center space-x-2">
          {['all', 'pending', 'accepted', 'rejected', 'completed'].map((filterKey) => (
            <button
              key={filterKey}
              onClick={() => setStatusFilter(filterKey)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                statusFilter === filterKey
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {filterKey}
            </button>
          ))}
        </div>
      </div>

      {!eligibility?.isEligible && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start">
          <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0 text-amber-600 mt-0.5" />
          <div>
            <strong className="block font-bold">You are currently marked as ineligible to donate.</strong>
            <span>
              You can still review hospital requests, but you cannot accept new donation appointments until your safety interval or deferral period has concluded.
            </span>
          </div>
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-3xl p-12 text-center text-xs text-slate-400 border border-slate-200">
          Loading requests...
        </div>
      ) : matches.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-2">
          <Heart className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Matching Blood Requests Yet</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            There are currently no open blood requests requiring your blood type. As soon as a verified hospital logs an emergency or planned request matching your profile, it will appear here and you'll receive a notification.
          </p>
        </div>
      ) : filteredMatches.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-2">
          <Heart className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No requests match this filter</h3>
          <p className="text-xs text-slate-500">
            Try switching filter tabs or check back soon as hospitals update request statuses.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMatches.map((m) => {
            const req = m.requestId;
            const hosp = req?.hospitalId;

            return (
              <div
                key={m._id}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Patient Case
                      </span>
                      <h3 className="text-base font-bold text-slate-900">
                        {req?.patientName} (Age: {req?.patientAge})
                      </h3>
                      <p className="text-xs text-slate-500">{hosp?.hospitalName || 'Hospital Center'}</p>
                    </div>
                    <StatusBadge status={m.status} />
                  </div>

                  <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-slate-50 text-[11px]">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Blood</span>
                      <strong className="text-red-600 text-sm font-extrabold">{req?.bloodGroup}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Needed</span>
                      <strong className="text-slate-800 text-xs">{req?.unitsRequired} unit(s)</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Urgency</span>
                      <strong className="text-rose-600 text-xs uppercase">{req?.urgency}</strong>
                    </div>
                  </div>

                  <div className="text-xs text-slate-600 space-y-1">
                    <div>
                      <span className="font-semibold text-slate-700">Location:</span> {req?.location}
                    </div>
                    <div>
                      <span className="font-semibold text-slate-700">Needed By:</span>{' '}
                      {req?.neededByDate ? new Date(req.neededByDate).toLocaleDateString() : 'ASAP'}
                    </div>
                    {req?.notes && (
                      <div className="text-[11px] italic bg-slate-50 p-2 rounded-lg text-slate-600">
                        "{req.notes}"
                      </div>
                    )}
                  </div>
                </div>

                {/* Response Buttons */}
                {m.status === 'pending' && (
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                    <button
                      onClick={() => handleRespond(m._id, 'reject')}
                      disabled={actionLoading === m._id}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                      Decline
                    </button>
                    <button
                      onClick={() => handleRespond(m._id, 'accept')}
                      disabled={actionLoading === m._id || !eligibility?.isEligible}
                      className={`px-4 py-2 rounded-xl text-xs font-bold text-white transition-all shadow-sm ${
                        eligibility?.isEligible
                          ? 'bg-red-600 hover:bg-red-700 shadow-red-600/20'
                          : 'bg-slate-300 cursor-not-allowed'
                      }`}
                    >
                      {actionLoading === m._id ? 'Saving...' : 'Accept Request'}
                    </button>
                  </div>
                )}

                {m.status === 'accepted' && (
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-emerald-700">
                    <span className="flex items-center font-semibold">
                      <CheckCircle2 className="w-4 h-4 mr-1 text-emerald-600" />
                      Accepted by You
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(m.responseDate || m.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                )}

                {m.status === 'completed' && (
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-indigo-700">
                    <span className="flex items-center font-semibold">
                      <CheckCircle2 className="w-4 h-4 mr-1 text-indigo-600" />
                      Donation Completed
                    </span>
                    <span className="text-[10px] text-slate-400">Verified by hospital</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
