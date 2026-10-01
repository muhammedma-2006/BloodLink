import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Droplet,
  Heart,
  Hospital,
  ShieldCheck,
  ArrowRight,
  Search,
  Users,
  Clock,
  CheckCircle2,
  Calendar,
  Activity,
  Layers,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Home = () => {
  const { isAuthenticated, isDonor, isHospital, isAdmin } = useAuth();
  const [selectedBloodGroup, setSelectedBloodGroup] = useState('O-');

  const compatibilityMatrix = {
    'A+': { canDonateTo: ['A+', 'AB+'], canReceiveFrom: ['A+', 'A-', 'O+', 'O-'] },
    'A-': { canDonateTo: ['A+', 'A-', 'AB+', 'AB-'], canReceiveFrom: ['A-', 'O-'] },
    'B+': { canDonateTo: ['B+', 'AB+'], canReceiveFrom: ['B+', 'B-', 'O+', 'O-'] },
    'B-': { canDonateTo: ['B+', 'B-', 'AB+', 'AB-'], canReceiveFrom: ['B-', 'O-'] },
    'AB+': { canDonateTo: ['AB+'], canReceiveFrom: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
    'AB-': { canDonateTo: ['AB+', 'AB-'], canReceiveFrom: ['AB-', 'A-', 'B-', 'O-'] },
    'O+': { canDonateTo: ['O+', 'A+', 'B+', 'AB+'], canReceiveFrom: ['O+', 'O-'] },
    'O-': { canDonateTo: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], canReceiveFrom: ['O-'] },
  };

  return (
    <div className="space-y-16 pb-16 bg-[#F5F7FA]">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden pt-8 sm:pt-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#B42332]/10 text-[#B42332] text-xs font-bold uppercase tracking-wider border border-[#B42332]/20">
              <span className="w-2 h-2 rounded-full bg-[#B42332] animate-ping"></span>
              <span>Lifesaving Blood Management Platform</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#202B36] tracking-tight leading-[1.15]">
              Connecting Blood Donors & Hospitals <span className="text-[#B42332]">In Real Time.</span>
            </h1>

            <p className="text-base sm:text-lg text-[#667085] leading-relaxed max-w-2xl">
              BloodLink bridges the gap between emergency hospital demands and eligible voluntary donors with automated matching, clinical safety evaluations, and transparent donation tracking.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              {!isAuthenticated ? (
                <>
                  <Link
                    to="/register"
                    className="inline-flex items-center px-6 py-3.5 rounded-xl font-bold text-white bg-[#B42332] hover:bg-[#8F1D2A] shadow-lg shadow-[#B42332]/25 transition-all hover:-translate-y-0.5 text-sm"
                  >
                    <Heart className="w-4 h-4 mr-2 fill-current" />
                    Register as Donor
                  </Link>

                  <Link
                    to="/login"
                    className="inline-flex items-center px-6 py-3.5 rounded-xl font-bold text-[#202B36] bg-[#FFFFFF] border border-[#E4E7EC] hover:bg-[#F7F8FA] shadow-sm transition-all text-sm"
                  >
                    <Hospital className="w-4 h-4 mr-2 text-[#167D8D]" />
                    Sign In to Portal
                  </Link>
                </>
              ) : isDonor ? (
                <Link
                  to="/donor/dashboard"
                  className="inline-flex items-center px-6 py-3.5 rounded-xl font-bold text-white bg-[#B42332] hover:bg-[#8F1D2A] shadow-md transition-all text-sm"
                >
                  Go to Donor Dashboard
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              ) : isHospital ? (
                <Link
                  to="/hospital/dashboard"
                  className="inline-flex items-center px-6 py-3.5 rounded-xl font-bold text-white bg-[#167D8D] hover:bg-[#116370] shadow-md transition-all text-sm"
                >
                  Go to Hospital Dashboard
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              ) : (
                <Link
                  to="/admin/dashboard"
                  className="inline-flex items-center px-6 py-3.5 rounded-xl font-bold text-white bg-[#202B36] hover:bg-[#167D8D] shadow-md transition-all text-sm"
                >
                  Go to Admin Dashboard
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              )}
            </div>

            {/* Quick Metrics */}
            <div className="pt-6 grid grid-cols-3 gap-4 border-t border-[#E4E7EC] text-[#202B36]">
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-[#B42332]">8</p>
                <p className="text-xs text-[#667085] font-medium">Compatible Groups</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-[#202B36]">100%</p>
                <p className="text-xs text-[#667085] font-medium">Safety Rule Verified</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-[#25855A]">&lt; 3 mins</p>
                <p className="text-xs text-[#667085] font-medium">Donor Dispatch</p>
              </div>
            </div>
          </div>

          {/* Hero Visual Card: Core Platform Pillars */}
          <div className="lg:col-span-5">
            <div className="relative mx-auto max-w-md bg-[#FFFFFF] rounded-3xl p-6 shadow-xl border border-[#E4E7EC]">
              <div className="flex items-center justify-between pb-4 border-b border-[#E4E7EC]">
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full bg-[#B42332]"></span>
                  <span className="text-xs font-bold text-[#202B36] uppercase tracking-wider">
                    Core Clinical Pillars
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#25855A]/10 text-[#25855A] border border-[#25855A]/30">
                  Active
                </span>
              </div>

              <div className="mt-5 space-y-4 text-xs">
                <div className="p-3.5 rounded-xl bg-[#B42332]/5 border border-[#B42332]/20">
                  <div className="flex items-center justify-between text-[#B42332] font-semibold mb-1">
                    <span className="flex items-center font-bold">
                      <Hospital className="w-3.5 h-3.5 mr-1.5" />
                      Hospital Request Dispatch
                    </span>
                    <span className="text-[10px] bg-[#B42332] text-white px-2 py-0.5 rounded font-bold">Real Time</span>
                  </div>
                  <p className="text-[#667085] text-[11px]">
                    Hospitals submit precise blood requirements with urgency levels, required units, and patient timelines.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#167D8D]/5 border border-[#167D8D]/20">
                  <div className="flex items-center justify-between text-[#167D8D] font-semibold mb-1">
                    <span className="flex items-center font-bold">
                      <Layers className="w-3.5 h-3.5 mr-1.5" />
                      Automated Donor Matching
                    </span>
                    <span className="text-[10px] bg-[#167D8D] text-white px-2 py-0.5 rounded font-bold">ABO / Rh</span>
                  </div>
                  <p className="text-[#667085] text-[11px]">
                    Algorithm matches compatible donors by blood group, locality, and active voluntary availability.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#25855A]/5 border border-[#25855A]/20">
                  <div className="flex items-center justify-between text-[#25855A] font-semibold mb-1">
                    <span className="flex items-center font-bold">
                      <ShieldCheck className="w-3.5 h-3.5 mr-1.5" />
                      Clinical Safety Screening
                    </span>
                    <span className="text-[10px] bg-[#25855A] text-white px-2 py-0.5 rounded font-bold">Safety First</span>
                  </div>
                  <p className="text-[#667085] text-[11px]">
                    Automatic enforcement of 90-day recovery intervals and 3-month tattoo safety deferral periods.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Core Workflow Architecture */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#B42332] mb-2">Platform Flow</h2>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-[#202B36]">
            How BloodLink Orchestrates Every Life-Saving Request
          </h3>
          <p className="text-sm text-[#667085] mt-2">
            Fully aligned with the reconciled Hospital & Donor Activity Diagrams
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-[#FFFFFF] rounded-2xl p-6 border border-[#E4E7EC] shadow-sm relative">
            <div className="w-10 h-10 rounded-xl bg-[#B42332]/10 text-[#B42332] flex items-center justify-center font-bold mb-4">
              1
            </div>
            <h4 className="font-bold text-[#202B36] text-base mb-2">Hospital Requests</h4>
            <p className="text-xs text-[#667085] leading-relaxed">
              Hospital enters patient details, required blood group, units, location, urgency, and needed-by deadline.
            </p>
          </div>

          <div className="bg-[#FFFFFF] rounded-2xl p-6 border border-[#E4E7EC] shadow-sm relative">
            <div className="w-10 h-10 rounded-xl bg-[#167D8D]/10 text-[#167D8D] flex items-center justify-center font-bold mb-4">
              2
            </div>
            <h4 className="font-bold text-[#202B36] text-base mb-2">Auto-Matching & Rules</h4>
            <p className="text-xs text-[#667085] leading-relaxed">
              System checks blood compatibility, location, and evaluates medical eligibility (last donation date & tattoo rule).
            </p>
          </div>

          <div className="bg-[#FFFFFF] rounded-2xl p-6 border border-[#E4E7EC] shadow-sm relative">
            <div className="w-10 h-10 rounded-xl bg-[#B7791F]/10 text-[#B7791F] flex items-center justify-center font-bold mb-4">
              3
            </div>
            <h4 className="font-bold text-[#202B36] text-base mb-2">Donor Responds</h4>
            <p className="text-xs text-[#667085] leading-relaxed">
              Eligible donors receive high-priority notifications and choose to accept or decline the donation opportunity.
            </p>
          </div>

          <div className="bg-[#FFFFFF] rounded-2xl p-6 border border-[#E4E7EC] shadow-sm relative">
            <div className="w-10 h-10 rounded-xl bg-[#25855A]/10 text-[#25855A] flex items-center justify-center font-bold mb-4">
              4
            </div>
            <h4 className="font-bold text-[#202B36] text-base mb-2">Hospital Confirms</h4>
            <p className="text-xs text-[#667085] leading-relaxed">
              Hospital confirms completed donation on site, updating request fulfillment progress, donor history, and blood stock.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Interactive Blood Compatibility Explorer */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#FFFFFF] text-[#1F2937] rounded-3xl p-8 sm:p-12 shadow-sm border border-[#E2E8F0]">
          <div className="max-w-3xl mb-8">
            <span className="text-xs font-bold text-[#C6283D] uppercase tracking-widest">Medical Matrix</span>
            <h3 className="text-2xl sm:text-3xl font-extrabold mt-1 text-[#1F2937]">
              Interactive Blood Compatibility Explorer
            </h3>
            <p className="text-xs sm:text-sm text-[#64748B] mt-2">
              Select any blood group to see which patients can receive it and who can safely donate to them.
            </p>
          </div>

          {/* Blood group selection chips */}
          <div className="flex flex-wrap gap-2.5 mb-8">
            {Object.keys(compatibilityMatrix).map((bg) => (
              <button
                key={bg}
                onClick={() => setSelectedBloodGroup(bg)}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  selectedBloodGroup === bg
                    ? 'bg-[#C6283D] text-white shadow-md shadow-[#C6283D]/30 scale-105 border border-[#C6283D]'
                    : 'bg-[#FFFFFF] text-[#1F2937] border border-[#E2E8F0] hover:bg-[#F5F7FA] hover:border-[#CBD5E1]'
                }`}
              >
                {bg}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#FFFFFF] rounded-2xl p-6 border border-[#E2E8F0] shadow-sm">
              <h4 className="text-xs font-bold text-[#15805D] uppercase tracking-wider mb-2 flex items-center">
                <CheckCircle2 className="w-4 h-4 mr-1.5 text-[#15805D]" />
                Donors with {selectedBloodGroup} can donate to:
              </h4>
              <div className="flex flex-wrap gap-2 mt-4">
                {compatibilityMatrix[selectedBloodGroup].canDonateTo.map((target) => (
                  <span
                    key={target}
                    className="px-3.5 py-1.5 rounded-lg bg-[#15805D]/10 text-[#15805D] border border-[#15805D]/30 text-xs font-bold"
                  >
                    {target}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-[#FFFFFF] rounded-2xl p-6 border border-[#E2E8F0] shadow-sm">
              <h4 className="text-xs font-bold text-[#087E9B] uppercase tracking-wider mb-2 flex items-center">
                <Heart className="w-4 h-4 mr-1.5 text-[#087E9B]" />
                Patients with {selectedBloodGroup} can receive from:
              </h4>
              <div className="flex flex-wrap gap-2 mt-4">
                {compatibilityMatrix[selectedBloodGroup].canReceiveFrom.map((source) => (
                  <span
                    key={source}
                    className="px-3.5 py-1.5 rounded-lg bg-[#087E9B]/10 text-[#087E9B] border border-[#087E9B]/30 text-xs font-bold"
                  >
                    {source}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
