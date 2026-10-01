import React, { useState, useEffect } from 'react';
import { Calendar, Award, Hospital, Droplet, FileCheck2, Heart } from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export const DonationHistory = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showError } = useToast();

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await api.donor.getHistory();
      if (res.success) {
        setDonations(res.donations);
      }
    } catch (err) {
      showError(err.message || 'Failed to fetch donation records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const totalUnits = donations.reduce((sum, d) => sum + (d.units || 1), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-red-600 uppercase tracking-widest">Medical Records</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Personal Donation History
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Verified whole blood donations recorded by authorized hospital medical staff
          </p>
        </div>

        {/* Total Impact Banner */}
        <div className="inline-flex items-center space-x-3 bg-red-50 border border-red-200 px-4 py-2.5 rounded-2xl">
          <Award className="w-6 h-6 text-red-600" />
          <div>
            <div className="text-xs text-slate-500">Cumulative Impact</div>
            <div className="text-sm font-extrabold text-red-700">
              {totalUnits} Units Donated • Up to {totalUnits * 3} Lives Touched
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-3xl p-12 text-center text-xs text-slate-400 border border-slate-200">
          Loading donation records...
        </div>
      ) : donations.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-3">
          <Heart className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Donations Logged Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Once you accept a blood request and complete the donation procedure at the hospital, your verified medical record will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {donations.map((item) => (
            <div
              key={item._id}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-300 transition-all"
            >
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0">
                  <Droplet className="w-6 h-6 fill-current" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-base font-bold text-slate-900">
                      {item.units} Unit(s) of {item.bloodGroup} Blood
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      Verified Donation
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 mt-1 flex items-center">
                    <Hospital className="w-3.5 h-3.5 mr-1 text-slate-400" />
                    {item.hospitalId?.hospitalName || 'Clinical Facility'} ({item.hospitalId?.city || 'Local Ward'})
                  </p>

                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Donation Verification ID: <strong className="font-mono">{item.donationCode}</strong>
                  </p>
                  {item.notes && (
                    <p className="text-xs text-slate-500 italic mt-1 bg-slate-50 p-1.5 rounded">
                      Note: {item.notes}
                    </p>
                  )}
                </div>
              </div>

              <div className="md:text-right flex md:flex-col justify-between items-center md:items-end border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                <div className="text-xs text-slate-500 flex items-center">
                  <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  {new Date(item.donationDate).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </div>
                <div className="text-[10px] text-emerald-600 font-semibold mt-1 flex items-center">
                  <FileCheck2 className="w-3.5 h-3.5 mr-1" />
                  Confirmed by Hospital Staff
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
