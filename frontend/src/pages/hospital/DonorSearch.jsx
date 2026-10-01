import React, { useState, useEffect } from 'react';
import { Search, MapPin, Heart, ShieldCheck, Filter, AlertCircle, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export const DonorSearch = () => {
  const [bloodGroup, setBloodGroup] = useState('');
  const [location, setLocation] = useState('');
  const [availableOnly, setAvailableOnly] = useState(true);
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(false);
  const { showError } = useToast();

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const res = await api.hospital.searchDonors({
        bloodGroup,
        location,
        availableOnly: availableOnly ? 'true' : 'false',
      });
      if (res.success) {
        setDonors(res.donors);
      }
    } catch (err) {
      showError(err.message || 'Failed to search donors.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleSearch();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Donor Directory</span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">Search Blood Donors</h1>
        <p className="text-xs text-slate-500 mt-1">
          Explore registered voluntary donors filtered by compatible blood group, location, and clinical eligibility.
        </p>
      </div>

      {/* Search Criteria Bar */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
        <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Blood Group</label>
            <select
              value={bloodGroup}
              onChange={(e) => setBloodGroup(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white font-bold text-red-600 text-xs"
            >
              <option value="">All Blood Groups</option>
              {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                <option key={bg} value={bg}>
                  {bg}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">City / Location</label>
            <input
              type="text"
              placeholder="e.g. Metropolis"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs"
            />
          </div>

          <div className="flex items-center pb-2">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={availableOnly}
                onChange={(e) => setAvailableOnly(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              />
              <span className="text-slate-700 font-semibold text-xs">Available Donors Only</span>
            </label>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20 disabled:opacity-50 transition-all flex items-center justify-center text-xs"
            >
              <Search className="w-3.5 h-3.5 mr-1.5" />
              {loading ? 'Searching...' : 'Apply Filters'}
            </button>
          </div>
        </form>
      </div>

      {/* Privacy Notice */}
      <div className="p-3.5 rounded-2xl bg-slate-100 text-slate-600 text-xs flex items-center space-x-2">
        <ShieldCheck className="w-4 h-4 text-blue-600 flex-shrink-0" />
        <span>
          <strong>Privacy Safeguard:</strong> Direct contact phone numbers are protected until a matching blood request is formally accepted by the donor.
        </span>
      </div>

      {/* Results Grid */}
      {loading ? (
        <div className="bg-white rounded-3xl p-12 text-center text-xs text-slate-400 border border-slate-200">
          Searching registered donors...
        </div>
      ) : donors.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-2">
          <Heart className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Donors Found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            No registered donors currently match your search criteria. As voluntary donors register or become available in your area, they will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {donors.map((d) => (
            <div
              key={d._id}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:border-blue-200 transition-all space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">{d.name}</h3>
                  <p className="text-xs text-slate-500">
                    {d.city} {d.state ? `, ${d.state}` : ''}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center font-black text-sm">
                  {d.bloodGroup}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-slate-50 text-[11px]">
                <div>
                  <span className="text-slate-400 block text-[10px]">Age</span>
                  <strong className="text-slate-800">{d.age ? `${d.age} yrs` : 'N/A'}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Donations</span>
                  <strong className="text-slate-800">{d.totalDonations} completed</strong>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">Eligibility Status:</span>
                {d.isEligible ? (
                  <span className="inline-flex items-center text-emerald-700 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                    Eligible
                  </span>
                ) : (
                  <span className="inline-flex items-center text-amber-700 font-bold" title={d.eligibilityReasons?.join(', ')}>
                    <AlertCircle className="w-3.5 h-3.5 mr-1 text-amber-600" />
                    Deferred
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
