import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Search, Package, Clock, CheckCircle2, ArrowRight, Droplet } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { StatusBadge } from '../../components/StatusBadge';

export const HospitalDashboard = () => {
  const { user, profile } = useAuth();
  const { showError } = useToast();
  const [requests, setRequests] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHospitalData = async () => {
    setLoading(true);
    try {
      const [reqRes, invRes] = await Promise.all([
        api.hospital.getMyRequests(),
        api.inventory.getInventory(),
      ]);

      if (reqRes.success) setRequests(reqRes.requests);
      if (invRes.success) setInventory(invRes.inventory);
    } catch (err) {
      showError(err.message || 'Failed to load hospital dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHospitalData();
  }, []);

  const totalUnitsInStock = inventory.reduce((sum, item) => sum + (item.units || 0), 0);
  const openRequests = requests.filter((r) => r.status === 'open' || r.status === 'partially_fulfilled');
  const fulfilledRequests = requests.filter((r) => r.status === 'fulfilled');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. Hospital Header & Quick Actions */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Hospital Portal</span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
            <span className="text-xs text-slate-500">{profile?.hospitalType || 'Medical Center'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            {profile?.hospitalName || user?.name}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Licence: <strong>{profile?.registrationNumber}</strong> • Location: <strong>{profile?.city}</strong>
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <Link
            to="/hospital/requests/create"
            className="inline-flex items-center px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 shadow-md shadow-red-600/20 transition-all"
          >
            <PlusCircle className="w-4 h-4 mr-1.5" />
            Request Blood
          </Link>
          <Link
            to="/hospital/donors"
            className="inline-flex items-center px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 shadow-sm transition-all"
          >
            <Search className="w-4 h-4 mr-1.5" />
            Find Donors
          </Link>
          <Link
            to="/hospital/inventory"
            className="inline-flex items-center px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 shadow-sm transition-all"
          >
            <Package className="w-4 h-4 mr-1.5" />
            Stock ({totalUnitsInStock} u)
          </Link>
        </div>
      </div>

      {/* 2. Key Metrics Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="text-xs font-bold uppercase text-slate-400">Active Requests</div>
          <div className="text-2xl sm:text-3xl font-black text-red-600 mt-1">{openRequests.length}</div>
          <p className="text-[11px] text-slate-500 mt-1">Requiring blood units</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="text-xs font-bold uppercase text-slate-400">Fulfilled Requests</div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 mt-1">{fulfilledRequests.length}</div>
          <p className="text-[11px] text-slate-500 mt-1">Successfully completed</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="text-xs font-bold uppercase text-slate-400">Blood Bank Units</div>
          <div className="text-2xl sm:text-3xl font-black text-blue-600 mt-1">{totalUnitsInStock}</div>
          <p className="text-[11px] text-slate-500 mt-1">Available across 8 groups</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="text-xs font-bold uppercase text-slate-400">Total Requests</div>
          <div className="text-2xl sm:text-3xl font-black text-slate-800 mt-1">{requests.length}</div>
          <p className="text-[11px] text-slate-500 mt-1">Submitted to network</p>
        </div>
      </div>

      {/* 3. Active Requests Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center">
              <Clock className="w-4 h-4 mr-2 text-red-600" />
              Active Patient Blood Requests
            </h2>
            <p className="text-xs text-slate-500">Track real-time donor matches, responses, and fulfillment</p>
          </div>
          <Link to="/hospital/requests" className="text-xs font-semibold text-blue-600 hover:underline">
            View all requests →
          </Link>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading requests...</div>
        ) : requests.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <Clock className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800">No Blood Requests Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Your hospital hasn't submitted any patient blood requests yet. Submit a request to automatically match with compatible donors in your area.
            </p>
            <div className="pt-2">
              <Link
                to="/hospital/requests/create"
                className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-bold text-white bg-primary hover:bg-primary-hover shadow-md transition-all"
              >
                <PlusCircle className="w-3.5 h-3.5 mr-1.5" />
                Submit Your First Request
              </Link>
            </div>
          </div>
        ) : openRequests.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800">No Open Blood Requests</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              All blood requests have been fulfilled or cancelled. Create a new request whenever blood is required.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase text-[10px]">
                  <th className="pb-3">Patient / Case</th>
                  <th className="pb-3">Blood Group</th>
                  <th className="pb-3">Fulfillment Progress</th>
                  <th className="pb-3">Urgency</th>
                  <th className="pb-3">Matches / Accepted</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {openRequests.map((req) => {
                  const percent = Math.min(100, Math.round(((req.unitsFulfilled || 0) / req.unitsRequired) * 100));
                  return (
                    <tr key={req._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 font-bold text-slate-900">
                        {req.patientName} (Age: {req.patientAge})
                        <span className="block text-[11px] font-normal text-slate-500">{req.location}</span>
                      </td>
                      <td className="py-3.5">
                        <span className="font-extrabold text-red-600 text-sm">{req.bloodGroup}</span>
                      </td>
                      <td className="py-3.5 w-48">
                        <div className="flex items-center justify-between text-[11px] mb-1">
                          <span className="font-semibold text-slate-700">
                            {req.unitsFulfilled || 0} / {req.unitsRequired} units
                          </span>
                          <span className="text-slate-400">{percent}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              percent >= 100 ? 'bg-emerald-500' : percent > 0 ? 'bg-amber-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${percent}%` }}
                          ></div>
                        </div>
                      </td>
                      <td className="py-3.5">
                        <StatusBadge status={req.urgency} />
                      </td>
                      <td className="py-3.5">
                        <div className="text-[11px]">
                          <span className="font-semibold text-slate-700">{req.matchesCount || 0}</span> matched
                          {req.acceptedCount > 0 && (
                            <span className="ml-1 text-emerald-600 font-bold">({req.acceptedCount} accepted!)</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5">
                        <StatusBadge status={req.status} />
                      </td>
                      <td className="py-3.5 text-right">
                        <Link
                          to={`/hospital/requests/${req._id}`}
                          className="inline-flex items-center px-3 py-1.5 rounded-xl font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors"
                        >
                          Review & Confirm
                          <ArrowRight className="w-3.5 h-3.5 ml-1" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 4. Quick Blood Inventory Glance */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center">
              <Droplet className="w-4 h-4 mr-2 text-red-600 fill-current" />
              Hospital Blood Inventory Snapshot
            </h3>
            <p className="text-xs text-slate-500">Current available units stored in your hospital blood bank</p>
          </div>
          <Link to="/hospital/inventory" className="text-xs font-semibold text-blue-600 hover:underline">
            Manage blood stock →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {inventory.map((item) => (
            <div
              key={item.bloodGroup}
              className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-center hover:border-slate-300 transition-all"
            >
              <div className="text-sm font-black text-red-600">{item.bloodGroup}</div>
              <div className="text-xl font-black text-slate-800 mt-1">{item.units}</div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Units</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
