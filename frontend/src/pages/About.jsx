import React from 'react';
import { ShieldCheck, BookOpen, GitMerge, Database, Heart, CheckCircle2 } from 'lucide-react';

export const About = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-10">
      <div>
        <span className="text-xs font-bold text-red-600 uppercase tracking-widest">Documentation & Standards</span>
        <h1 className="text-3xl font-extrabold text-slate-900 mt-1">About BloodLink</h1>
        <p className="text-slate-600 mt-2 text-sm leading-relaxed">
          BloodLink is an enterprise-grade, web-based blood donation coordination platform engineered according to the Unified Modeling Language (UML) specifications, Software Requirements Specification (SRS), and Entity-Relationship architecture.
        </p>
      </div>

      {/* Document Reconciliation Section */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center space-x-3 text-red-600">
          <GitMerge className="w-6 h-6" />
          <h2 className="text-lg font-bold text-slate-900">Reconciliation of Project Documents</h2>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          During system analysis of the provided SRS, Use Case Specifications, and Activity Diagrams, discrepancies were identified and resolved to ensure robust operational consistency:
        </p>

        <div className="space-y-3 pt-2 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <h3 className="font-bold text-slate-800 mb-1">1. Primary Requester Role: Hospital</h3>
            <p className="text-slate-600">
              While the early use-case specification draft listed the donor as the requester in Use Case 6, both the Hospital Activity Diagram and the system SRS explicitly define the <strong>Hospital</strong> as the authoritative entity requiring blood for verified patients. The system adopts the <strong>Hospital as the primary requester</strong>, while matching registered, eligible donors in real time.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <h3 className="font-bold text-slate-800 mb-1">2. Configurable Safety & Eligibility Rules</h3>
            <p className="text-slate-600">
              The Donor Activity Diagram explicitly models the rule: <em>"is there any tattoo in last 3 months?"</em> as an immediate disqualifier. The system implements this as a fully configurable safety rule alongside the 90-day minimum donation interval and 18–65 age bounds, logging transparent reasons for any deferral.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <h3 className="font-bold text-slate-800 mb-1">3. Data Model Normalization</h3>
            <p className="text-slate-600">
              The database schema directly reflects the supplied ER Diagram, organizing distinct collections for Users, Donor Profiles, Hospital Profiles, Blood Requests, Request Matches, Donations, Eligibility Checks, Notifications, and Hospital Blood Inventories with MongoDB and Mongoose.
            </p>
          </div>
        </div>
      </div>

      {/* Eligibility Rules Grid */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center space-x-3 text-emerald-600">
          <ShieldCheck className="w-6 h-6" />
          <h2 className="text-lg font-bold text-slate-900">Configurable Clinical Rules</h2>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          All criteria are evaluated automatically whenever a donor accesses matching requests or submits an eligibility verification:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs">
          <div className="flex items-start space-x-3 p-3 rounded-xl bg-emerald-50/50 border border-emerald-100">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-bold text-slate-800">Donation Frequency Interval:</span>
              <p className="text-slate-600 mt-0.5">Minimum 90 days required between consecutive whole blood donations.</p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-3 rounded-xl bg-emerald-50/50 border border-emerald-100">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-bold text-slate-800">Tattoo / Piercing Deferral:</span>
              <p className="text-slate-600 mt-0.5">3-month safety pause following any recent body art or needle procedure.</p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-3 rounded-xl bg-emerald-50/50 border border-emerald-100">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-bold text-slate-800">Age Qualification Window:</span>
              <p className="text-slate-600 mt-0.5">Must be between 18 and 65 years of age on date of donation.</p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-3 rounded-xl bg-emerald-50/50 border border-emerald-100">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-bold text-slate-800">Body Weight Standard:</span>
              <p className="text-slate-600 mt-0.5">Minimum body mass of 45 kg ensures donor physiological tolerance.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
