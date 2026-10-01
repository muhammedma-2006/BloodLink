import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Heart, User, MapPin, Calendar, Clock, AlertTriangle, ArrowLeft } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const CreateRequest = () => {
  const { profile } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    patientName: '',
    patientAge: 30,
    bloodGroup: 'A+',
    unitsRequired: 2,
    urgency: 'high',
    neededByDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    location: profile?.address ? `${profile.hospitalName}, ${profile.city}` : '',
    contactPhone: profile?.phone || '',
    notes: '',
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.hospital.submitRequest(formData);
      if (res.success) {
        showSuccess(
          `Request submitted! ${res.matchedDonorsCount} eligible donor(s) were automatically matched and notified.`
        );
        navigate(`/hospital/requests/${res.request._id}`);
      }
    } catch (err) {
      showError(err.message || 'Failed to submit request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5 mr-1" />
        Back to Dashboard
      </button>

      <div>
        <span className="text-xs font-bold text-red-600 uppercase tracking-widest">Emergency Dispatch</span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">Submit Blood Request</h1>
        <p className="text-xs text-slate-500 mt-1">
          The system will automatically find eligible, active donors with compatible blood types and notify them immediately.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xl shadow-slate-100">
        <form onSubmit={handleSubmit} className="space-y-6 text-xs">
          {/* Patient Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              Patient Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">Patient Full Name</label>
                <input
                  type="text"
                  name="patientName"
                  required
                  value={formData.patientName}
                  onChange={handleChange}
                  placeholder="e.g. Eleanor Rigby"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-red-500/20 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Patient Age</label>
                <input
                  type="number"
                  name="patientAge"
                  required
                  min="0"
                  max="130"
                  value={formData.patientAge}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Blood & Units Requirement */}
          <div className="space-y-4 pt-2 border-t border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              Required Blood & Urgency
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Required Blood Group</label>
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
                <label className="block font-semibold text-slate-700 mb-1">Units Required (Pints)</label>
                <input
                  type="number"
                  name="unitsRequired"
                  required
                  min="1"
                  max="50"
                  value={formData.unitsRequired}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Clinical Urgency</label>
                <select
                  name="urgency"
                  value={formData.urgency}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white font-semibold text-xs"
                >
                  <option value="critical">Critical (Immediate / OR)</option>
                  <option value="high">High (Within 24 Hours)</option>
                  <option value="medium">Medium (Within 3 Days)</option>
                  <option value="low">Low (Elective / Scheduled)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Needed By Date</label>
                <input
                  type="date"
                  name="neededByDate"
                  required
                  value={formData.neededByDate}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Contact Phone</label>
                <input
                  type="tel"
                  name="contactPhone"
                  required
                  value={formData.contactPhone}
                  onChange={handleChange}
                  placeholder="+1 555-0100"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Hospital / Delivery Location</label>
              <input
                type="text"
                name="location"
                required
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. City General Hospital, Emergency Ward 3B"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Clinical Notes & Instructions</label>
              <textarea
                name="notes"
                rows="3"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Specific surgery details, cross-matching requirements, or department contact..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs"
              ></textarea>
            </div>
          </div>

          <div className="pt-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-6 py-2.5 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/20 disabled:opacity-50 transition-all text-xs"
            >
              <PlusCircle className="w-4 h-4 mr-1.5" />
              {loading ? 'Submitting & Matching Donors...' : 'Submit & Notify Matching Donors'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
