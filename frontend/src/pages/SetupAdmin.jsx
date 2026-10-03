import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, User, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const SetupAdmin = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [adminExists, setAdminExists] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const { showSuccess } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    api.auth.getSetupStatus()
      .then((res) => {
        if (res.success) setAdminExists(res.adminExists);
      })
      .catch((err) => setError(err.message));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.auth.setupAdmin({ name, email, password });
      if (res.success) {
        showSuccess('Administrator provisioned successfully!');
        // Automatically login with new credentials
        await login(email, password);
        navigate('/admin/dashboard', { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Failed to setup administrator.');
    } finally {
      setLoading(false);
    }
  };

  if (adminExists === null) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center text-xs text-[#667085]">
        Checking initial provisioning status...
      </div>
    );
  }

  if (adminExists) {
    return (
      <div className="min-h-[80vh] flex flex-col justify-center items-center px-4 py-12">
        <div className="bg-[#FFFFFF] p-8 rounded-3xl border border-[#E4E7EC] shadow-xl max-w-md w-full text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#25855A]/10 text-[#25855A] flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-[#202B36]">Setup Locked</h2>
          <p className="text-xs text-[#667085] leading-relaxed">
            An administrator account is already provisioned for this system. For security reasons, public administrative bootstrapping is locked.
          </p>
          <div className="pt-2">
            <Link
              to="/login"
              className="inline-flex items-center px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-[#B42332] hover:bg-[#8F1D2A] transition-all"
            >
              Go to Sign In
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-[#F7F8FA]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <img src="/icon.png" alt="BloodLink" className="w-16 h-16 object-contain mx-auto mb-3" />
        <h2 className="text-3xl font-extrabold text-[#202B36] tracking-tight">System Initial Setup</h2>
        <p className="mt-2 text-xs text-[#667085]">
          Provision the primary BloodLink administrator account. No default credentials exist.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#FFFFFF] py-8 px-6 shadow-xl shadow-slate-200/50 rounded-3xl border border-[#E4E7EC] sm:px-10">
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-[#D04444]/10 border border-[#D04444]/30 text-xs text-[#D04444] flex items-start">
              <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4 text-xs" onSubmit={handleSubmit}>
            <div>
              <label className="block font-semibold text-[#202B36] mb-1">Administrator Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Master Administrator"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E4E7EC] focus:outline-none focus:ring-2 focus:ring-[#B42332]/20 text-[#202B36]"
                />
                <User className="w-4 h-4 text-[#667085] absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-[#202B36] mb-1">Admin Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@yourinstitution.org"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E4E7EC] focus:outline-none focus:ring-2 focus:ring-[#B42332]/20 text-[#202B36]"
                />
                <Mail className="w-4 h-4 text-[#667085] absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-[#202B36] mb-1">Master Password (min 6 characters)</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E4E7EC] focus:outline-none focus:ring-2 focus:ring-[#B42332]/20 text-[#202B36]"
                />
                <Lock className="w-4 h-4 text-[#667085] absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-[#202B36] mb-1">Confirm Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E4E7EC] focus:outline-none focus:ring-2 focus:ring-[#B42332]/20 text-[#202B36]"
                />
                <Lock className="w-4 h-4 text-[#667085] absolute left-3.5 top-3" />
              </div>
            </div>

            <div className="p-3 bg-[#F7F8FA] border border-[#E4E7EC] rounded-xl text-[11px] text-[#667085]">
              🔒 <strong>Security Guarantee:</strong> Once created, this form locks permanently and future administrator changes require authenticated system privileges.
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-[#B42332] hover:bg-[#8F1D2A] shadow-lg shadow-[#B42332]/20 disabled:opacity-50 transition-all flex items-center justify-center"
            >
              {loading ? 'Initializing Administrator...' : 'Create Primary Administrator'}
              {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
