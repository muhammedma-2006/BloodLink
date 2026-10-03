import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Clock,
  Heart,
  Phone,
  Mail,
  CheckCircle2,
  XCircle,
  Award,
} from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { StatusBadge } from '../../components/StatusBadge';

export const RequestDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const [request, setRequest] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  // Confirm Donation Modal State
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [donationUnits, setDonationUnits] = useState(1);
  const [donationNotes, setDonationNotes] = useState('');
  const [submittingDonation, setSubmittingDonation] = useState(false);

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const res = await api.hospital.getRequestDetails(id);
      if (res.success) {
        setRequest(res.request);
        setMatches(res.matches);
      }
    } catch (err) {
      showError(err.message || 'Failed to load request details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const openConfirmModal = (match) => {
    setSelectedMatch(match);
    setDonationUnits(1);
    setDonationNotes(`Whole blood donation verified at clinical premises for request ${request?.patientName}.`);
    setConfirmModalOpen(true);
  };

  const handleConfirmDonation = async (e) => {
    e.preventDefault();
    if (!selectedMatch) return;

    setSubmittingDonation(true);
    try {
      const res = await api.hospital.confirmDonation({
        matchId: selectedMatch._id,
        units: Number(donationUnits),
        notes: donationNotes,
      });

      if (res.success) {
        showSuccess(res.message);
        setConfirmModalOpen(false);
        await fetchDetails();
      }
    } catch (err) {
      showError(err.message || 'Failed to confirm donation.');
    } finally {
      setSubmittingDonation(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-xs text-slate-400">
        Loading request details and donor matches...
      </div>
    );
  }

  if (!request) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-xs text-slate-500">
        Blood request not found.{' '}
        <Link to="/hospital/requests" className="text-blue-600 underline">
          Return to requests
        </Link>
      </div>
    );
  }

  const percent = Math.min(100, Math.round(((request.unitsFulfilled || 0) / request.unitsRequired) * 100));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <button
        onClick={() => navigate('/hospital/requests')}
        className="inline-flex items-center text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5 mr-1" />
        Back to Blood Requests
      </button>

      {/* 1. Request Overview Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Request Details</span>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
              <span className="text-xs text-slate-500">ID: {request._id}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              Patient: {request.patientName} (Age: {request.patientAge})
            </h1>
          </div>

          <div className="flex items-center space-x-2">
            <StatusBadge status={request.urgency} />
            <StatusBadge status={request.status} />
          </div>
        </div>

        {/* Metric Summary Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-red-50/70 border border-red-100">
            <span className="text-slate-500 block">Required Blood</span>
            <span className="text-2xl font-black text-red-600">{request.bloodGroup}</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-slate-500 block">Required Units</span>
            <span className="text-2xl font-black text-slate-900">{request.unitsRequired}</span>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100">
            <span className="text-slate-500 block">Units Fulfilled</span>
            <span className="text-2xl font-black text-emerald-600">{request.unitsFulfilled || 0}</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-slate-500 block">Needed By Date</span>
            <span className="text-sm font-bold text-slate-800 mt-2 block">
              {new Date(request.neededByDate).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div>
          <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
            <span>Fulfillment Progress</span>
            <span>{percent}% Complete</span>
          </div>
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                percent >= 100 ? 'bg-emerald-500' : percent > 0 ? 'bg-amber-500' : 'bg-red-500'
              }`}
              style={{ width: `${percent}%` }}
            ></div>
          </div>
        </div>

        {request.notes && (
          <div className="p-3.5 rounded-xl bg-slate-50 text-xs text-slate-600 border border-slate-200">
            <strong className="text-slate-800">Clinical Notes:</strong> {request.notes}
          </div>
        )}
      </div>

      {/* 2. Matched Donors & Live Responses */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center">
            <Heart className="w-4 h-4 mr-2 text-red-600 fill-current" />
            Matched Donors & Response Ledger ({matches.length})
          </h2>
          <p className="text-xs text-slate-500">
            Eligible donors notified by the system. Contact details are unveiled once a donor formally accepts.
          </p>
        </div>

        {matches.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No matching donors currently found in this region. You can expand search via the Donor Directory.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 text-xs">
            {matches.map((m) => {
              const isAccepted = m.matchStatus === 'accepted';
              const isCompleted = m.matchStatus === 'completed';

              return (
                <div
                  key={m._id}
                  className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-900 text-sm">{m.donorName}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700">
                        {m.donorBloodGroup}
                      </span>
                      <StatusBadge status={m.matchStatus} />
                    </div>

                    <p className="text-slate-500 text-xs">
                      Location: <strong>{m.donorCity}</strong>
                      {m.responseDate && (
                        <span className="ml-2 text-[11px] text-slate-400">
                          (Responded: {new Date(m.responseDate).toLocaleString()})
                        </span>
                      )}
                    </p>

                    {/* Reveal donor contact details upon acceptance */}
                    {isAccepted || isCompleted ? (
                      <div className="flex flex-wrap gap-4 pt-1 text-[11px] text-emerald-800 bg-emerald-50/60 p-2 rounded-xl border border-emerald-200/80">
                        <span className="flex items-center font-semibold">
                          <Phone className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                          {m.donorPhone}
                        </span>
                        <span className="flex items-center font-semibold">
                          <Mail className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                          {m.donorEmail}
                        </span>
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-400 italic">
                        Contact details protected until donor accepts request.
                      </p>
                    )}
                  </div>

                  {/* Actions for Hospital Staff */}
                  <div className="flex items-center space-x-2 self-start md:self-auto">
                    {isAccepted && (
                      <button
                        onClick={() => openConfirmModal(m)}
                        className="inline-flex items-center px-4 py-2 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all"
                      >
                        <Award className="w-4 h-4 mr-1.5" />
                        Confirm Donation Completed
                      </button>
                    )}

                    {isCompleted && (
                      <span className="inline-flex items-center px-3 py-1.5 rounded-xl font-bold text-xs bg-indigo-50 text-indigo-700 border border-indigo-200">
                        <CheckCircle2 className="w-4 h-4 mr-1" />
                        Donation Verified & Logged
                      </span>
                    )}

                    {m.matchStatus === 'rejected' && (
                      <span className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs bg-rose-50 text-rose-700 border border-rose-200">
                        <XCircle className="w-4 h-4 mr-1" />
                        Donor Declined: {m.rejectionReason}
                      </span>
                    )}

                    {m.matchStatus === 'pending' && (
                      <span className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs text-slate-500 bg-slate-50 border border-slate-200">
                        <Clock className="w-4 h-4 mr-1" />
                        Awaiting Donor Decision
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Confirm Donation Modal Dialog */}
      {confirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95">
            <div>
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Verify & Confirm Donation</h3>
              <p className="text-xs text-slate-500 mt-1">
                Record completed whole blood donation for <strong>{selectedMatch?.donorName}</strong> ({selectedMatch?.donorBloodGroup}).
              </p>
            </div>

            <form onSubmit={handleConfirmDonation} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Units Donated</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={donationUnits}
                  onChange={(e) => setDonationUnits(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Clinical Verification Notes</label>
                <textarea
                  rows="3"
                  value={donationNotes}
                  onChange={(e) => setDonationNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs"
                ></textarea>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-[11px] text-emerald-900">
                Confirming will:
                <ul className="list-disc list-inside mt-1 space-y-0.5">
                  <li>Generate a unique medical Donation Code</li>
                  <li>Update request fulfilled progress</li>
                  <li>Update donor last donation date & total units</li>
                  <li>Increment hospital blood bank inventory (+{donationUnits} u)</li>
                </ul>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setConfirmModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingDonation}
                  className="px-5 py-2 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 disabled:opacity-50"
                >
                  {submittingDonation ? 'Recording...' : 'Confirm & Finalize'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
