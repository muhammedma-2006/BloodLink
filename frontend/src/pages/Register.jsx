import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Droplet, Heart, Hospital, User, Mail, Lock, Phone, MapPin, Calendar, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const Register = () => {
  const [role, setRole] = useState('donor'); // 'donor' | 'hospital'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    city: '',
    address: '',
    // Donor specific
    bloodGroup: 'A+',
    dob: '1998-01-01',
    gender: 'male',
    weightKg: 65,
    hasTattooLast3Months: false,
    lastDonationDate: '',
    // Hospital specific
    hospitalName: '',
    registrationNumber: '',
    hospitalType: 'Private',
    emergencyContact: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register } = useAuth();
  const { showSuccess } = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        ...formData,
        role,
        name: role === 'hospital' ? formData.hospitalName : formData.name,
      };

      const data = await register(payload);
      showSuccess('Registration successful! Welcome to BloodLink.');

      if (role === 'hospital') {
        navigate('/hospital/dashboard');
      } else {
        navigate('/donor/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Failed to complete registration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] py-10 px-4 sm:px-6 lg:px-8 max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <img src="/icon.png" alt="BloodLink" className="w-16 h-16 object-contain mx-auto mb-3" />
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Create your BloodLink Account</h2>
        <p className="mt-2 text-xs text-slate-500">
          Join our decentralized network to save lives or request emergency blood
        </p>

        {/* Role Selector Tabs */}
        <div className="mt-6 flex justify-center p-1 bg-slate-200/80 rounded-2xl max-w-sm mx-auto">
          <button
            type="button"
            onClick={() => setRole('donor')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center ${
              role === 'donor'
                ? 'bg-white text-red-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Heart className="w-4 h-4 mr-1.5 fill-current" />
            Voluntary Donor
          </button>
          <button
            type="button"
            onClick={() => setRole('hospital')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center ${
              role === 'hospital'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Hospital className="w-4 h-4 mr-1.5" />
            Hospital / Clinic
          </button>
        </div>
      </div>

      <div className="bg-white py-8 px-6 sm:px-10 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50">
        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start">
            <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Common Account Fields */}
          {role === 'donor' ? (
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Full Legal Name</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Johnathan Doe"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-xs"
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Hospital / Clinic Name</label>
                <input
                  type="text"
                  name="hospitalName"
                  required
                  value={formData.hospitalName}
                  onChange={handleChange}
                  placeholder="e.g. St. Mary Memorial Hospital"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Registration / License Number</label>
                <input
                  type="text"
                  name="registrationNumber"
                  required
                  value={formData.registrationNumber}
                  onChange={handleChange}
                  placeholder="e.g. HOSP-REG-8491"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Official Email</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="contact@example.org"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Account Password (min 6 chars)</label>
              <input
                type="password"
                name="password"
                required
                minLength={6}
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
              <input
                type="tel"
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1 555-0123"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-xs"
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
                placeholder="e.g. Metropolis"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Physical Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Street name, suite or building"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-xs"
            />
          </div>

          {/* Donor-Specific Medical Fields */}
          {role === 'donor' && (
            <div className="pt-3 border-t border-slate-100 space-y-3">
              <span className="block font-bold text-slate-800 text-[11px] uppercase tracking-wider">
                Clinical Eligibility & Profile Data
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Blood Group</label>
                  <select
                    name="bloodGroup"
                    value={formData.bloodGroup}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 text-xs"
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
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 text-xs"
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Last Donation Date (leave blank if never donated)
                  </label>
                  <input
                    type="date"
                    name="lastDonationDate"
                    value={formData.lastDonationDate}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs"
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="hasTattooLast3Months"
                      checked={formData.hasTattooLast3Months}
                      onChange={handleChange}
                      className="w-4 h-4 text-red-600 rounded border-slate-300 focus:ring-red-500"
                    />
                    <span className="text-slate-700 font-medium text-xs">
                      Received a tattoo or piercing in the last 3 months?
                    </span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Hospital-Specific Fields */}
          {role === 'hospital' && (
            <div className="pt-3 border-t border-slate-100 space-y-3">
              <span className="block font-bold text-slate-800 text-[11px] uppercase tracking-wider">
                Hospital Classification & Emergency Details
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                  <label className="block font-semibold text-slate-700 mb-1">24/7 Emergency Hotline</label>
                  <input
                    type="tel"
                    name="emergencyContact"
                    value={formData.emergencyContact}
                    onChange={handleChange}
                    placeholder="+1 555-9111"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full mt-4 py-3 px-4 rounded-xl text-sm font-bold text-white shadow-lg disabled:opacity-50 transition-all ${
              role === 'donor'
                ? 'bg-red-600 hover:bg-red-700 shadow-red-600/25'
                : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/25'
            }`}
          >
            {loading ? 'Creating Account...' : `Register as ${role === 'donor' ? 'Donor' : 'Hospital'}`}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500">
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-red-600 hover:underline">
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
};
