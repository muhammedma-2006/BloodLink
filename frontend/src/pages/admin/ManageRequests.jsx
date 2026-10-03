import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { StatusBadge } from '../../components/StatusBadge';

export const ManageRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState('');
  const { showSuccess, showError } = useToast();

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await api.admin.getRequests({
        status: statusFilter,
        urgency: urgencyFilter,
      });
      if (res.success) {
        setRequests(res.requests);
      }
    } catch (err) {
      showError(err.message || 'Failed to load requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [statusFilter, urgencyFilter]);

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to administratively cancel this request?')) return;
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-purple-600 uppercase tracking-widest">Network Oversight</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            All Hospital Blood Requests
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Global view of all blood demand across hospital members
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 text-xs">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white"
          >
            <option value="">All Statuses</option>
            <option value="open">Open</option>
            <option value="partially_fulfilled">Partially Fulfilled</option>
            <option value="fulfilled">Fulfilled</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={urgencyFilter}
            onChange={(e) => setUrgencyFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white"
          >
            <option value="">All Urgencies</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading requests...</div>
        ) : requests.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Clock className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800">No Blood Requests Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No hospital blood requests match your selected filters. When hospitals submit patient requests, they will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-semibold uppercase text-[10px]">
                  <th className="py-3 px-5">Hospital</th>
                  <th className="py-3 px-5">Patient Details</th>
                  <th className="py-3 px-5">Blood Group</th>
                  <th className="py-3 px-5">Units Needed / Fulfilled</th>
                  <th className="py-3 px-5">Urgency</th>
                  <th className="py-3 px-5">Status</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {requests.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="font-bold text-slate-900">{r.hospitalId?.hospitalName}</div>
                      <span className="text-[10px] text-slate-400">{r.hospitalId?.city}</span>
                    </td>

                    <td className="py-3.5 px-5">
                      <span className="font-bold text-slate-800">{r.patientName}</span>
                      <span className="text-slate-400 block text-[10px]">Age: {r.patientAge} yrs</span>
                    </td>

                    <td className="py-3.5 px-5">
                      <span className="font-extrabold text-red-600 text-sm">{r.bloodGroup}</span>
                    </td>

                    <td className="py-3.5 px-5">
                      <span className="font-bold text-slate-800">
                        {r.unitsFulfilled || 0} / {r.unitsRequired} units
                      </span>
                    </td>

                    <td className="py-3.5 px-5">
                      <StatusBadge status={r.urgency} />
                    </td>

                    <td className="py-3.5 px-5">
                      <StatusBadge status={r.status} />
                    </td>

                    <td className="py-3.5 px-5 text-right">
                      {r.status !== 'cancelled' && r.status !== 'fulfilled' && (
                        <button
                          onClick={() => handleCancel(r._id)}
                          className="px-2.5 py-1 rounded-lg text-rose-600 hover:bg-rose-50 font-semibold text-[11px] transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
