import React from 'react';
import { Heart, PhoneCall } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-[#202B36] text-[#667085] pt-12 pb-8 border-t border-[#E4E7EC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2.5">
              <img src="/icon.png" alt="BloodLink" className="w-8 h-8 object-contain" />
              <span className="text-xl font-bold tracking-tight text-white">
                Blood<span className="text-[#B42332]">Link</span>
              </span>
            </div>
            <p className="text-xs text-[#667085] leading-relaxed">
              Empowering communities and healthcare institutions through rapid, transparent, and safe blood donation coordination.
            </p>
            <div className="flex items-center space-x-2 text-xs text-[#B42332] font-semibold">
              <PhoneCall className="w-4 h-4" />
              <span>Emergency Blood Hotline: 1-800-BLOOD-LINK</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-3">Quick Links</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/" className="hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  About the Platform
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition-colors">
                  Account Sign In
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-white transition-colors">
                  Register as Donor
                </Link>
              </li>
            </ul>
          </div>

          {/* Clinical Rules & Eligibility */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-3">Safety Standards</h4>
            <ul className="space-y-2 text-xs text-[#667085]">
              <li>Minimum 90 days interval between donations</li>
              <li>3-month deferral following any tattoo or piercing</li>
              <li>Age eligibility window: 18 - 65 years</li>
              <li>Minimum required body weight: 45 kg</li>
            </ul>
          </div>

          {/* Platform Status */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-3">System Integrity</h4>
            <div className="p-3 rounded-xl bg-[#FFFFFF]/5 border border-[#FFFFFF]/10 text-xs space-y-2">
              <div className="flex items-center text-[#25855A] font-medium">
                <span className="w-2 h-2 rounded-full bg-[#25855A] mr-2 animate-pulse"></span>
                BloodLink Network Active
              </div>
              <p className="text-[11px] text-[#667085]">
                Hospital matching daemon and notification dispatch operational.
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-[#FFFFFF]/10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#667085]">
          <p>© {new Date().getFullYear()} BloodLink Management System. All rights reserved.</p>
          <div className="flex items-center space-x-1 mt-2 sm:mt-0">
            <span>Built with care to save lives</span>
            <Heart className="w-3.5 h-3.5 text-[#B42332] fill-current inline" />
          </div>
        </div>
      </div>
    </footer>
  );
};
