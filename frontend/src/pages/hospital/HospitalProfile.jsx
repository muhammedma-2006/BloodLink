import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';

export const HospitalProfile = () => {
  const { user, profile, refreshProfile } = useAuth();
  const { showSuccess, showError } = useToast();

  const [formData, setFormData] = useState({
    hospitalName: '',
    registrationNumber: '',
    hospitalType: 'Private',
    phone: '',
    address: '',
    city: '',
    state: '',
    emergencyContact: '',
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        hospitalName: profile.hospitalName || '',
        registrationNumber: profile.registrationNumber || '',
        hospitalType: profile.hospitalType || 'Private',
        phone: profile.phone || '',
        address: profile.address || '',
        city: profile.city || '',
        state: profile.state || '',
        emergencyContact: profile.emergencyContact || '',
      });
    }
  }, [profile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.hospital.updateProfile(formData);
      if (res.success) {
        showSuccess('Hospital profile updated successfully.');
        await refreshProfile();
      }
    } catch (err) {
      showError(err.message || 'Failed to update hospital profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Medical Institution</span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">Hospital Profile</h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage clinical registry details, authorized facilities, and 24/7 emergency dispatch numbers
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6 text-xs">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              Facility Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Hospital / Medical Center Name</label>
                <input
                  type="text"
                  name="hospitalName"
                  required
                  value={formData.hospitalName}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Registration / Accreditation Number</label>
                <input
                  type="text"
                  name="registrationNumber"
                  required
                  value={formData.registrationNumber}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Facility Type</label>
                <select
                  name="hospitalType"
                  value={formData.hospitalType}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs"
                >
                  <option value="Government">Government / Public Hospital</option>
                  <option value="Private">Private Hospital / Medical Center</option>
                  <option value="Clinic">Specialty Clinic</option>
                  <option value="Blood Bank">Blood Bank / Red Cross</option>
                  <option value="Charitable">Charitable Trust Hospital</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Primary Hospital Phone</label>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">24/7 Emergency Hotline</label>
                <input
                  type="tel"
                  name="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">City / Municipality</label>
                <input
                  type="text"
                  name="city"
                  required
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Full Physical Address</label>
              <input
                type="text"
                name="address"
                required
                value={formData.address}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-6 py-2.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20 disabled:opacity-50 transition-all text-xs"
            >
              <Save className="w-4 h-4 mr-1.5" />
              {loading ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
