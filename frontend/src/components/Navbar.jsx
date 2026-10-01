import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Droplet, Menu, X, LogOut, User, Activity, Search, PlusCircle, Shield, FileText, Package } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { NotificationBell } from './NotificationBell';

export const Navbar = () => {
  const { user, profile, isAuthenticated, isDonor, isHospital, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-40 bg-[#FFFFFF]/95 backdrop-blur border-b border-[#E4E7EC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center space-x-2.5 group">
            <img
              src="/icon.png"
              alt="BloodLink"
              className="w-9 h-9 object-contain transition-transform group-hover:scale-105"
            />
            <div>
              <span className="text-xl font-extrabold tracking-tight text-[#202B36]">
                Blood<span className="text-[#B42332]">Link</span>
              </span>
              <span className="hidden sm:inline-block ml-2 px-2 py-0.5 text-[10px] font-semibold bg-[#B42332]/10 text-[#B42332] rounded-full">
                Donation Network
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
            <Link
              to="/"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/')
                  ? 'text-[#B42332] bg-[#B42332]/10 font-bold'
                  : 'text-[#667085] hover:text-[#202B36] hover:bg-[#F7F8FA]'
              }`}
            >
              Home
            </Link>

            <Link
              to="/about"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/about')
                  ? 'text-[#B42332] bg-[#B42332]/10 font-bold'
                  : 'text-[#667085] hover:text-[#202B36] hover:bg-[#F7F8FA]'
              }`}
            >
              About & Rules
            </Link>

            {/* Role: Donor */}
            {isDonor && (
              <>
                <Link
                  to="/donor/dashboard"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/donor/dashboard')
                      ? 'text-[#B42332] bg-[#B42332]/10 font-bold'
                      : 'text-[#667085] hover:text-[#202B36] hover:bg-[#F7F8FA]'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/donor/requests"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/donor/requests')
                      ? 'text-[#B42332] bg-[#B42332]/10 font-bold'
                      : 'text-[#667085] hover:text-[#202B36] hover:bg-[#F7F8FA]'
                  }`}
                >
                  Matching Requests
                </Link>
                <Link
                  to="/donor/history"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/donor/history')
                      ? 'text-[#B42332] bg-[#B42332]/10 font-bold'
                      : 'text-[#667085] hover:text-[#202B36] hover:bg-[#F7F8FA]'
                  }`}
                >
                  History
                </Link>
                <Link
                  to="/donor/eligibility"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/donor/eligibility')
                      ? 'text-[#B42332] bg-[#B42332]/10 font-bold'
                      : 'text-[#667085] hover:text-[#202B36] hover:bg-[#F7F8FA]'
                  }`}
                >
                  Check Eligibility
                </Link>
                <Link
                  to="/donor/profile"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/donor/profile')
                      ? 'text-[#B42332] bg-[#B42332]/10 font-bold'
                      : 'text-[#667085] hover:text-[#202B36] hover:bg-[#F7F8FA]'
                  }`}
                >
                  Profile
                </Link>
              </>
            )}

            {/* Role: Hospital */}
            {isHospital && (
              <>
                <Link
                  to="/hospital/dashboard"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/hospital/dashboard')
                      ? 'text-[#167D8D] bg-[#167D8D]/10 font-bold'
                      : 'text-[#667085] hover:text-[#202B36] hover:bg-[#F7F8FA]'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/hospital/requests/create"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/hospital/requests/create')
                      ? 'text-[#B42332] bg-[#B42332]/10 font-bold'
                      : 'text-[#667085] hover:text-[#202B36] hover:bg-[#F7F8FA]'
                  }`}
                >
                  Request Blood
                </Link>
                <Link
                  to="/hospital/requests"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/hospital/requests')
                      ? 'text-[#167D8D] bg-[#167D8D]/10 font-bold'
                      : 'text-[#667085] hover:text-[#202B36] hover:bg-[#F7F8FA]'
                  }`}
                >
                  Track Requests
                </Link>
                <Link
                  to="/hospital/donors"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/hospital/donors')
                      ? 'text-[#167D8D] bg-[#167D8D]/10 font-bold'
                      : 'text-[#667085] hover:text-[#202B36] hover:bg-[#F7F8FA]'
                  }`}
                >
                  Find Donors
                </Link>
                <Link
                  to="/hospital/inventory"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/hospital/inventory')
                      ? 'text-[#167D8D] bg-[#167D8D]/10 font-bold'
                      : 'text-[#667085] hover:text-[#202B36] hover:bg-[#F7F8FA]'
                  }`}
                >
                  Inventory
                </Link>
                <Link
                  to="/hospital/profile"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/hospital/profile')
                      ? 'text-[#167D8D] bg-[#167D8D]/10 font-bold'
                      : 'text-[#667085] hover:text-[#202B36] hover:bg-[#F7F8FA]'
                  }`}
                >
                  Profile
                </Link>
              </>
            )}

            {/* Role: Admin */}
            {isAdmin && (
              <>
                <Link
                  to="/admin/dashboard"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/admin/dashboard')
                      ? 'text-[#B42332] bg-[#B42332]/10 font-bold'
                      : 'text-[#667085] hover:text-[#202B36] hover:bg-[#F7F8FA]'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/admin/users"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/admin/users')
                      ? 'text-[#167D8D] bg-[#167D8D]/10 font-bold'
                      : 'text-[#667085] hover:text-[#202B36] hover:bg-[#F7F8FA]'
                  }`}
                >
                  Manage Users
                </Link>
                <Link
                  to="/admin/requests"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/admin/requests')
                      ? 'text-[#167D8D] bg-[#167D8D]/10 font-bold'
                      : 'text-[#667085] hover:text-[#202B36] hover:bg-[#F7F8FA]'
                  }`}
                >
                  All Requests
                </Link>
                <Link
                  to="/admin/reports"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/admin/reports')
                      ? 'text-[#167D8D] bg-[#167D8D]/10 font-bold'
                      : 'text-[#667085] hover:text-[#202B36] hover:bg-[#F7F8FA]'
                  }`}
                >
                  Reports
                </Link>
              </>
            )}
          </div>

          {/* Right Action Items */}
          <div className="hidden md:flex items-center space-x-3">
            {isAuthenticated ? (
              <>
                <NotificationBell />

                <div className="flex items-center space-x-2 pl-3 border-l border-[#E4E7EC]">
                  <div className="flex flex-col text-right">
                    <span className="text-xs font-bold text-[#202B36] leading-tight">{user.name}</span>
                    <span className="text-[10px] uppercase font-bold text-[#B42332] tracking-wider">
                      {user.role} {profile?.bloodGroup ? `(${profile.bloodGroup})` : ''}
                    </span>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="p-2 text-[#667085] hover:text-[#B42332] hover:bg-[#B42332]/10 rounded-xl transition-colors"
                    title="Log Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-[#202B36] hover:text-[#B42332] hover:bg-[#F7F8FA] rounded-xl transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-[#B42332] hover:bg-[#8F1D2A] rounded-xl shadow-sm transition-all"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center space-x-2">
            {isAuthenticated && <NotificationBell />}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-[#667085] hover:text-[#202B36] hover:bg-[#F7F8FA]"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#E4E7EC] bg-[#FFFFFF] px-4 pt-2 pb-4 space-y-1">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-[#202B36] hover:bg-[#F7F8FA]"
          >
            Home
          </Link>
          <Link
            to="/about"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-[#202B36] hover:bg-[#F7F8FA]"
          >
            About & Rules
          </Link>

          {isDonor && (
            <>
              <Link
                to="/donor/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-[#202B36] hover:bg-[#F7F8FA]"
              >
                Dashboard
              </Link>
              <Link
                to="/donor/requests"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-[#202B36] hover:bg-[#F7F8FA]"
              >
                Matching Requests
              </Link>
              <Link
                to="/donor/history"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-[#202B36] hover:bg-[#F7F8FA]"
              >
                Donation History
              </Link>
              <Link
                to="/donor/eligibility"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-[#202B36] hover:bg-[#F7F8FA]"
              >
                Check Eligibility
              </Link>
              <Link
                to="/donor/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-[#202B36] hover:bg-[#F7F8FA]"
              >
                Profile
              </Link>
            </>
          )}

          {isHospital && (
            <>
              <Link
                to="/hospital/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-[#202B36] hover:bg-[#F7F8FA]"
              >
                Dashboard
              </Link>
              <Link
                to="/hospital/requests/create"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-[#202B36] hover:bg-[#F7F8FA]"
              >
                Request Blood
              </Link>
              <Link
                to="/hospital/requests"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-[#202B36] hover:bg-[#F7F8FA]"
              >
                Track Requests
              </Link>
              <Link
                to="/hospital/donors"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-[#202B36] hover:bg-[#F7F8FA]"
              >
                Find Donors
              </Link>
              <Link
                to="/hospital/inventory"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-[#202B36] hover:bg-[#F7F8FA]"
              >
                Blood Inventory
              </Link>
              <Link
                to="/hospital/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-[#202B36] hover:bg-[#F7F8FA]"
              >
                Hospital Profile
              </Link>
            </>
          )}

          {isAdmin && (
            <>
              <Link
                to="/admin/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-[#202B36] hover:bg-[#F7F8FA]"
              >
                Admin Dashboard
              </Link>
              <Link
                to="/admin/users"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-[#202B36] hover:bg-[#F7F8FA]"
              >
                Manage Users
              </Link>
              <Link
                to="/admin/requests"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-[#202B36] hover:bg-[#F7F8FA]"
              >
                All Requests
              </Link>
              <Link
                to="/admin/reports"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-[#202B36] hover:bg-[#F7F8FA]"
              >
                Reports
              </Link>
            </>
          )}

          <div className="pt-3 border-t border-[#E4E7EC]">
            {isAuthenticated ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full text-left flex items-center px-3 py-2 text-[#D04444] font-semibold"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out ({user.name})
              </button>
            ) : (
              <div className="space-y-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center px-4 py-2 border border-[#E4E7EC] rounded-xl font-medium text-[#202B36]"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center px-4 py-2 bg-[#B42332] hover:bg-[#8F1D2A] rounded-xl font-medium text-white"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
