import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Heart, Package } from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { StatusBadge } from '../../components/StatusBadge';

export const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showError } = useToast();

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await api.admin.getStats();
      if (res.success) {
        setData(res);
      }
    } catch (err) {
      showError(err.message || 'Failed to fetch admin stats.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-xs text-slate-400">
        Loading system analytics...
      </div>
    );
  }

  const { stats, inventoryByBloodGroup = [], donorsByBloodGroup = [], recentRequests = [], recentDonations = [] } =
    data || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-purple-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-purple-300">
              System Administration
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-1">Platform Control & Analytics</h1>
          <p className="text-xs text-slate-300 mt-0.5">
            Full oversight of voluntary donors, hospital dispatch, clinical compliance, and blood reserves
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <Link
            to="/admin/users"
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-white/10 hover:bg-white/20 backdrop-blur transition-all border border-white/20"
          >
            Manage Users
          </Link>
          <Link
            to="/admin/requests"
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-white/10 hover:bg-white/20 backdrop-blur transition-all border border-white/20"
          >
            All Requests
          </Link>
          <Link
            to="/admin/reports"
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-900 bg-white hover:bg-slate-100 shadow-md transition-all"
          >
            Audit Reports
          </Link>
        </div>
      </div>

      {/* 2. Platform KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Registered Donors</span>
          <span className="text-2xl font-black text-red-600 mt-1 block">{stats?.totalDonors || 0}</span>
          <span className="text-[10px] text-slate-500">Voluntary users</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Registered Hospitals</span>
          <span className="text-2xl font-black text-blue-600 mt-1 block">{stats?.totalHospitals || 0}</span>
          <span className="text-[10px] text-slate-500">Certified facilities</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Total Requests</span>
          <span className="text-2xl font-black text-purple-600 mt-1 block">{stats?.totalRequests || 0}</span>
          <span className="text-[10px] text-slate-500">Logged to date</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Active Requests</span>
          <span className="text-2xl font-black text-amber-600 mt-1 block">{stats?.openRequests || 0}</span>
          <span className="text-[10px] text-slate-500">Currently open</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Completed Requests</span>
          <span className="text-2xl font-black text-emerald-600 mt-1 block">{stats?.fulfilledRequests || 0}</span>
          <span className="text-[10px] text-slate-500">100% fulfilled</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Completed Donations</span>
          <span className="text-2xl font-black text-indigo-600 mt-1 block">{stats?.totalDonations || 0}</span>
          <span className="text-[10px] text-slate-500">Units confirmed</span>
        </div>
      </div>

      {/* 3. Breakdown Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Blood Inventory Distribution across network */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center">
            <Package className="w-4 h-4 mr-2 text-blue-600" />
            Network Blood Bank Storage Units
          </h3>
          <div className="grid grid-cols-4 gap-3 text-xs">
            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => {
              const match = inventoryByBloodGroup.find((item) => item._id === bg);
              const units = match ? match.totalUnits : 0;
              return (
                <div key={bg} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                  <span className="text-xs font-black text-red-600">{bg}</span>
                  <p className="text-lg font-black text-slate-800">{units}</p>
                  <span className="text-[9px] text-slate-400 uppercase">Units</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Registered Donors Blood Distribution */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center">
            <Heart className="w-4 h-4 mr-2 text-red-600 fill-current" />
            Registered Donors by Blood Group
          </h3>
          <div className="grid grid-cols-4 gap-3 text-xs">
            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => {
              const match = donorsByBloodGroup.find((item) => item._id === bg);
              const count = match ? match.count : 0;
              return (
                <div key={bg} className="p-3 rounded-2xl bg-red-50/40 border border-red-100 text-center">
                  <span className="text-xs font-black text-red-600">{bg}</span>
                  <p className="text-lg font-black text-slate-800">{count}</p>
                  <span className="text-[9px] text-slate-400 uppercase">Donors</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. Recent Platform Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Requests */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm">Recent Blood Requests</h3>
            <Link to="/admin/requests" className="text-xs font-semibold text-purple-600 hover:underline">
              View all →
            </Link>
          </div>
          {recentRequests.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">
              No hospital blood requests have been submitted to the platform yet.
            </p>
          ) : (
            <div className="divide-y divide-slate-100 text-xs">
              {recentRequests.map((r) => (
                <div key={r._id} className="py-2.5 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900">{r.patientName}</span>
                    <p className="text-[11px] text-slate-500">
                      {r.hospitalId?.hospitalName} • {r.unitsRequired}u of {r.bloodGroup}
                    </p>
                  </div>
                  <StatusBadge status={r.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Completed Donations */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm">Recent Completed Donations</h3>
            <span className="text-xs text-slate-400">Verified Ledger</span>
          </div>
          {recentDonations.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">
              No verified donations have been recorded in the platform ledger yet.
            </p>
          ) : (
            <div className="divide-y divide-slate-100 text-xs">
              {recentDonations.map((d) => (
                <div key={d._id} className="py-2.5 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900">
                      {d.donorId?.userId?.name || 'Anonymous Donor'}
                    </span>
                    <p className="text-[11px] text-slate-500">
                      {d.units}u of {d.bloodGroup} at {d.hospitalId?.hospitalName}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-[10px] text-purple-600 block">{d.donationCode}</span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(d.donationDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
