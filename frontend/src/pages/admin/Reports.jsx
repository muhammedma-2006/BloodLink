import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, PieChart, FileText, Download } from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export const Reports = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showError } = useToast();

  useEffect(() => {
    api.admin.getReports()
      .then((res) => {
        if (res.success) setReportData(res);
      })
      .catch((err) => showError(err.message || 'Failed to load reports'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-xs text-slate-400">
        Generating reports...
      </div>
    );
  }

  const { requestStatusStats = [], donationsByMonth = [] } = reportData || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <span className="text-xs font-bold text-purple-600 uppercase tracking-widest">Executive Analytics</span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">Platform Reports</h1>
        <p className="text-xs text-slate-500 mt-1">
          Historical summaries of request lifecycles, donor fulfillments, and clinical trends
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Request Status Distribution */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center">
            <PieChart className="w-4 h-4 mr-2 text-purple-600" />
            Request Lifecycle Distribution
          </h3>
          {requestStatusStats.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">
              No hospital blood requests have been recorded yet to generate lifecycle statistics.
            </p>
          ) : (
            <div className="space-y-3 pt-2">
              {requestStatusStats.map((item) => (
                <div key={item._id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                  <div className="flex items-center justify-between font-bold text-slate-800 capitalize mb-1">
                    <span>{item._id.replace('_', ' ')}</span>
                    <span>{item.count} Requests</span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Total blood units involved: <strong>{item.totalUnits} Units</strong>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Monthly Donation Volumes */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center">
            <TrendingUp className="w-4 h-4 mr-2 text-emerald-600" />
            Verified Donation Volume
          </h3>
          {donationsByMonth.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No monthly historical data yet.</p>
          ) : (
            <div className="space-y-3 pt-2">
              {donationsByMonth.map((m, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-100 text-xs">
                  <div className="flex items-center justify-between font-bold text-slate-800 mb-1">
                    <span>
                      Month {m._id.month} / {m._id.year}
                    </span>
                    <span className="text-emerald-700 font-extrabold">{m.units} Units Verified</span>
                  </div>
                  <div className="text-[11px] text-slate-500">{m.count} completed donor sessions</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
