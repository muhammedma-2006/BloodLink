import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, PlusCircle, Search, ArrowRight, Ban } from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { StatusBadge } from '../../components/StatusBadge';

export const TrackRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { showSuccess, showError } = useToast();

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await api.hospital.getMyRequests();
      if (res.success) {
        setRequests(res.requests);
      }
    } catch (err) {
      showError(err.message || 'Failed to fetch blood requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this blood request?')) return;
    try {
      const res = await api.hospital.cancelRequest(id);
      if (res.success) {
        showSuccess('Blood request cancelled.');
        await fetchRequests();
      }
    } catch (err) {
      showError(err.message || 'Failed to cancel request.');
    }
  };

  const filtered = requests.filter((r) => {
    if (filterStatus !== 'all' && r.status !== filterStatus) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const patient = (r.patientName || '').toLowerCase();
      const bg = (r.bloodGroup || '').toLowerCase();
      return patient.includes(query) || bg.includes(query);
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Hospital Operations</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">Track Blood Requests</h1>
          <p className="text-xs text-slate-500 mt-1">
            Monitor patient blood fulfillment, review donor responses, and record completed donations
          </p>
        </div>

        <Link
          to="/hospital/requests/create"
          className="inline-flex items-center px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 shadow-md shadow-red-600/20 transition-all self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4 mr-1.5" />
          Create New Request
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
        <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
          {['all', 'open', 'partially_fulfilled', 'fulfilled', 'cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                filterStatus === st
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search patient or blood group..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500/20"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
        </div>
      </div>

      {/* Requests Listing */}
      {loading ? (
        <div className="bg-white rounded-3xl p-12 text-center text-xs text-slate-400 border border-slate-200">
          Loading requests...
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-3">
          <Clock className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Blood Requests Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You haven't submitted any patient blood requests yet. Click below to coordinate your first emergency or scheduled blood request.
          </p>
          <div className="pt-2">
            <Link
              to="/hospital/requests/create"
              className="inline-flex items-center px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-primary hover:bg-primary-hover shadow-md transition-all"
            >
              <PlusCircle className="w-4 h-4 mr-1.5" />
              Create Your First Request
            </Link>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-2">
          <Clock className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No requests match this filter</h3>
          <p className="text-xs text-slate-500">There are no blood requests matching your selected status or search term.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((req) => {
            const percent = Math.min(100, Math.round(((req.unitsFulfilled || 0) / req.unitsRequired) * 100));
            const isCompleted = req.status === 'fulfilled';
            const isCancelled = req.status === 'cancelled';

            return (
              <div
                key={req._id}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">
                      {req.patientName} (Age: {req.patientAge})
                    </h3>
                    <StatusBadge status={req.urgency} />
                    <StatusBadge status={req.status} />
                  </div>

                  <div className="flex flex-wrap gap-4 text-xs text-slate-600">
                    <div>
                      Blood: <strong className="text-red-600 text-sm font-black">{req.bloodGroup}</strong>
                    </div>
                    <div>
                      Target: <strong>{req.unitsRequired} Units</strong>
                    </div>
                    <div>
                      Fulfilled: <strong className="text-emerald-600">{req.unitsFulfilled || 0} Units</strong>
                    </div>
                    <div>
                      Needed By:{' '}
                      <strong>
                        {req.neededByDate ? new Date(req.neededByDate).toLocaleDateString() : 'Immediate'}
                      </strong>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full sm:w-80">
                    <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                      <span>Fulfillment Status</span>
                      <span>{percent}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          percent >= 100 ? 'bg-emerald-500' : percent > 0 ? 'bg-amber-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                  {!isCompleted && !isCancelled && (
                    <button
                      onClick={() => handleCancel(req._id)}
                      className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Cancel Request"
                    >
                      <Ban className="w-4 h-4 inline mr-1" />
                      Cancel
                    </button>
                  )}

                  <Link
                    to={`/hospital/requests/${req._id}`}
                    className="inline-flex items-center px-4 py-2 rounded-xl font-bold text-xs text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20 transition-all"
                  >
                    View Matches & Responses
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
