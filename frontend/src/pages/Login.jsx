import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Droplet, Mail, Lock, ArrowRight, AlertCircle, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [adminExists, setAdminExists] = useState(true);

  const { login } = useAuth();
  const { showSuccess } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    api.auth.getSetupStatus()
      .then((res) => {
        if (res.success) setAdminExists(res.adminExists);
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await login(email, password);
      showSuccess(`Welcome back, ${data.user.name}!`);

      const destination = location.state?.from?.pathname || (
        data.user.role === 'admin'
          ? '/admin/dashboard'
          : data.user.role === 'hospital'
          ? '/hospital/dashboard'
          : '/donor/dashboard'
      );
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-[#F7F8FA]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <img src="/icon.png" alt="BloodLink" className="w-16 h-16 object-contain mx-auto mb-3" />
        <h2 className="text-3xl font-extrabold text-[#202B36] tracking-tight">Sign in to BloodLink</h2>
        <p className="mt-2 text-xs text-[#667085]">
          Access your donor, hospital, or system administration dashboard
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

          {!adminExists && (
            <div className="mb-5 p-3.5 rounded-xl bg-[#B7791F]/10 border border-[#B7791F]/30 text-xs text-[#B7791F] flex items-start">
              <ShieldAlert className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <strong>Initial Setup Notice:</strong> No administrator account has been provisioned yet.{' '}
                <Link to="/setup-admin" className="font-bold underline text-[#202B36] hover:text-[#B42332]">
                  Create the initial admin account
                </Link>
                {' '}or run <code className="bg-white/80 px-1 py-0.5 rounded font-mono text-[11px]">npm run setup:admin</code>.
              </div>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-[#202B36] mb-1">Email address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your registered email"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E4E7EC] focus:outline-none focus:ring-2 focus:ring-[#B42332]/20 focus:border-[#B42332] text-sm text-[#202B36]"
                />
                <Mail className="w-4 h-4 text-[#667085] absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#202B36] mb-1">Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E4E7EC] focus:outline-none focus:ring-2 focus:ring-[#B42332]/20 focus:border-[#B42332] text-sm text-[#202B36]"
                />
                <Lock className="w-4 h-4 text-[#667085] absolute left-3.5 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-[#B42332] hover:bg-[#8F1D2A] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#B42332] shadow-lg shadow-[#B42332]/20 disabled:opacity-50 transition-all flex items-center justify-center"
            >
              {loading ? 'Authenticating...' : 'Sign In to Account'}
              {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-[#E4E7EC] text-center text-xs text-[#667085]">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-semibold text-[#B42332] hover:underline">
              Register as Donor or Hospital
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
