import React, { useState, useEffect } from 'react';
import { User, Phone, MapPin, Calendar, Heart, ShieldAlert, Save, Activity } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';
import { EligibilityCard } from '../../components/EligibilityCard';

export const DonorProfile = () => {
  const { user, profile, eligibility, refreshProfile } = useAuth();
  const { showSuccess, showError } = useToast();

  const [formData, setFormData] = useState({
    bloodGroup: 'A+',
    phone: '',
    city: '',
    address: '',
    state: '',
    dob: '',
    gender: 'other',
    weightKg: 65,
    lastDonationDate: '',
    hasTattooLast3Months: false,
    tattooDate: '',
    isAvailable: true,
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        bloodGroup: profile.bloodGroup || 'A+',
        phone: profile.phone || '',
        city: profile.city || '',
        address: profile.address || '',
        state: profile.state || '',
        dob: profile.dob ? new Date(profile.dob).toISOString().split('T')[0] : '',
        gender: profile.gender || 'other',
        weightKg: profile.weightKg || 65,
        lastDonationDate: profile.lastDonationDate
          ? new Date(profile.lastDonationDate).toISOString().split('T')[0]
          : '',
        hasTattooLast3Months: Boolean(profile.hasTattooLast3Months),
        tattooDate: profile.tattooDate
          ? new Date(profile.tattooDate).toISOString().split('T')[0]
          : '',
        isAvailable: profile.isAvailable !== false,
      });
    }
  }, [profile]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.donor.updateProfile(formData);
      if (res.success) {
        showSuccess('Donor profile and medical attributes updated successfully!');
        await refreshProfile();
      }
    } catch (err) {
      showError(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <span className="text-xs font-bold text-red-600 uppercase tracking-widest">Account & Safety</span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">Donor Profile Management</h1>
        <p className="text-xs text-slate-500 mt-1">
          Keep your medical info, contact details, and donation availability accurate
        </p>
      </div>

      {/* Live Eligibility Card for immediate feedback on changed profile */}
      <EligibilityCard eligibility={eligibility} profile={profile} />

      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6 text-xs">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              Personal & Contact Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name (Read Only)</label>
                <input
                  type="text"
                  disabled
                  value={user?.name || ''}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Account Email (Read Only)</label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-red-500/20 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">City / Region</label>
                <input
                  type="text"
                  name="city"
                  required
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-red-500/20 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Street Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs"
              />
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              Clinical & Blood Safety Attributes
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Blood Group</label>
                <select
                  name="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white font-bold text-red-600 text-xs"
                >
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                    <option key={bg} value={bg}>
                      {bg}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Date of Birth</label>
                <input
                  type="date"
                  name="dob"
                  required
                  value={formData.dob}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Weight (kg)</label>
                <input
                  type="number"
                  name="weightKg"
                  min="30"
                  max="200"
                  value={formData.weightKg}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Last Whole Blood Donation Date
                </label>
                <input
                  type="date"
                  name="lastDonationDate"
                  value={formData.lastDonationDate}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  A 90-day recovery interval applies before the next donation.
                </span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Date of Last Tattoo / Piercing
                </label>
                <input
                  type="date"
                  name="tattooDate"
                  value={formData.tattooDate}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  A 3-month safety pause applies following body art or piercings.
                </span>
              </div>
            </div>

            <div className="pt-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="hasTattooLast3Months"
                  checked={formData.hasTattooLast3Months}
                  onChange={handleChange}
                  className="w-4 h-4 text-red-600 rounded border-slate-300 focus:ring-red-500"
                />
                <span className="text-slate-800 font-semibold text-xs">
                  I have received a tattoo or body piercing within the last 3 months
                </span>
              </label>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-800 block text-xs">Donation Availability</span>
                <p className="text-[11px] text-slate-500">
                  Toggle off if you are traveling, feeling unwell, or temporarily paused from donating blood.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="isAvailable"
                  checked={formData.isAvailable}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-6 py-2.5 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/20 disabled:opacity-50 transition-all text-xs"
            >
              <Save className="w-4 h-4 mr-1.5" />
              {loading ? 'Saving Profile...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
