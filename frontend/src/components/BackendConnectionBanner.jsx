import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle2, Globe, X, ExternalLink } from 'lucide-react';
import { getApiBase } from '../services/api';

export const BackendConnectionBanner = () => {
  const [showModal, setShowModal] = useState(false);
  const [inputUrl, setInputUrl] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null); // { success: boolean, message: string }
  const [isProductionWithoutBackend, setIsProductionWithoutBackend] = useState(false);

  useEffect(() => {
    // Check if we are running in a production browser environment
    if (typeof window !== 'undefined') {
      const isLocal =
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1';

      const currentBase = getApiBase();
      const hasRelativeBase = currentBase === '/api';

      // If on a hosted website (like *.vercel.app) and API_BASE is still relative '/api'
      if (!isLocal && hasRelativeBase) {
        setIsProductionWithoutBackend(true);
      } else {
        setIsProductionWithoutBackend(false);
      }
    }
  }, []);

  const handleOpenModal = () => {
    const saved = localStorage.getItem('bloodlink_api_url') || '';
    setInputUrl(saved);
    setTestResult(null);
    setShowModal(true);
  };

  const handleTestAndSave = async (e) => {
    e.preventDefault();
    if (!inputUrl.trim()) return;

    setTesting(true);
    setTestResult(null);

    const clean = inputUrl.trim().replace(/\/+$/, '');
    const healthUrl = clean.endsWith('/api') ? `${clean}/health` : `${clean}/api/health`;

    try {
      const res = await fetch(healthUrl, { method: 'GET' }).catch((err) => {
        throw new Error(`Failed to reach ${healthUrl}: ${err.message}`);
      });

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const data = await res.json().catch(() => ({}));
      if (data.status === 'online' || data.system) {
        // Save to localStorage
        localStorage.setItem('bloodlink_api_url', clean);
        setTestResult({
          success: true,
          message: 'Connection successful! Backend connected.',
        });
        setTimeout(() => {
          setShowModal(false);
          window.location.reload();
        }, 1200);
      } else {
        throw new Error('Server responded but did not return BloodLink API signature.');
      }
    } catch (err) {
      setTestResult({
        success: false,
        message: err.message || 'Connection failed. Verify URL and CORS settings.',
      });
    } finally {
      setTesting(false);
    }
  };

  const handleReset = () => {
    localStorage.removeItem('bloodlink_api_url');
    window.location.reload();
  };

  if (!isProductionWithoutBackend && !localStorage.getItem('bloodlink_api_url')) {
    return null;
  }

  return (
    <>
      {isProductionWithoutBackend && (
        <div className="bg-amber-500 text-slate-900 px-4 py-2.5 text-xs sm:text-sm font-medium flex items-center justify-between shadow-sm z-50">
          <div className="flex items-center space-x-2 overflow-hidden">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 text-amber-950" />
            <span className="truncate">
              <strong>Backend Disconnected:</strong> API requests will fail with 405/404 until your backend URL is linked.
            </span>
          </div>
          <button
            onClick={handleOpenModal}
            className="ml-3 px-3 py-1 bg-slate-900 text-white rounded-md font-semibold hover:bg-slate-800 transition-colors whitespace-nowrap shadow-sm"
          >
            Connect Backend URL
          </button>
        </div>
      )}

      {/* Backend Connection Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2 text-slate-900">
                <Globe className="w-5 h-5 text-[#B42332]" />
                <h3 className="text-lg font-bold">Connect Backend API</h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              Enter your deployed BloodLink backend URL (e.g. from your Vercel backend project). Once saved, all registration, login, and donation features will communicate with this server immediately.
            </p>

            <form onSubmit={handleTestAndSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Backend URL
                </label>
                <input
                  type="url"
                  placeholder="https://your-backend-project.vercel.app"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B42332] focus:border-transparent font-mono"
                  required
                />
              </div>

              {testResult && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-start space-x-2 ${
                    testResult.success
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  {testResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                  )}
                  <span>{testResult.message}</span>
                </div>
              )}

              <div className="flex items-center space-x-2 pt-2">
                <button
                  type="submit"
                  disabled={testing}
                  className="flex-1 py-2.5 px-4 bg-[#B42332] text-white rounded-xl text-sm font-semibold hover:bg-[#8F1D2A] transition-colors disabled:opacity-50 shadow-sm"
                >
                  {testing ? 'Testing Connection...' : 'Connect & Save'}
                </button>
                {localStorage.getItem('bloodlink_api_url') && (
                  <button
                    type="button"
                    onClick={handleReset}
                    className="py-2.5 px-3 text-xs text-slate-600 hover:text-slate-900 border border-slate-200 rounded-xl"
                  >
                    Reset
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
