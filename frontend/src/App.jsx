import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ProtectedRoute } from './components/ProtectedRoute';

// Public Pages
import { Home } from './pages/Home';
import { About } from './pages/About';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { SetupAdmin } from './pages/SetupAdmin';

// Donor Pages
import { DonorDashboard } from './pages/donor/DonorDashboard';
import { MatchingRequests } from './pages/donor/MatchingRequests';
import { DonationHistory } from './pages/donor/DonationHistory';
import { DonorProfile } from './pages/donor/DonorProfile';
import { EligibilityChecker } from './pages/donor/EligibilityChecker';

// Hospital Pages
import { HospitalDashboard } from './pages/hospital/HospitalDashboard';
import { CreateRequest } from './pages/hospital/CreateRequest';
import { TrackRequests } from './pages/hospital/TrackRequests';
import { RequestDetails } from './pages/hospital/RequestDetails';
import { DonorSearch } from './pages/hospital/DonorSearch';
import { HospitalProfile } from './pages/hospital/HospitalProfile';
import { InventoryManagement } from './pages/hospital/InventoryManagement';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { ManageUsers } from './pages/admin/ManageUsers';
import { ManageRequests } from './pages/admin/ManageRequests';
import { Reports } from './pages/admin/Reports';

export default function App() {
  return (
    <Router>
      <ToastProvider>
        <AuthProvider>
          <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-red-500 selection:text-white">
            <Navbar />
            <main className="flex-1">
              <Routes>
                {/* Public */}
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/setup-admin" element={<SetupAdmin />} />

                {/* Donor Protected */}
                <Route
                  path="/donor/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['donor']}>
                      <DonorDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/donor/requests"
                  element={
                    <ProtectedRoute allowedRoles={['donor']}>
                      <MatchingRequests />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/donor/history"
                  element={
                    <ProtectedRoute allowedRoles={['donor']}>
                      <DonationHistory />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/donor/profile"
                  element={
                    <ProtectedRoute allowedRoles={['donor']}>
                      <DonorProfile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/donor/eligibility"
                  element={
                    <ProtectedRoute allowedRoles={['donor']}>
                      <EligibilityChecker />
                    </ProtectedRoute>
                  }
                />

                {/* Hospital Protected */}
                <Route
                  path="/hospital/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['hospital']}>
                      <HospitalDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/hospital/requests/create"
                  element={
                    <ProtectedRoute allowedRoles={['hospital']}>
                      <CreateRequest />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/hospital/requests"
                  element={
                    <ProtectedRoute allowedRoles={['hospital']}>
                      <TrackRequests />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/hospital/requests/:id"
                  element={
                    <ProtectedRoute allowedRoles={['hospital', 'admin']}>
                      <RequestDetails />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/hospital/donors"
                  element={
                    <ProtectedRoute allowedRoles={['hospital', 'admin']}>
                      <DonorSearch />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/hospital/profile"
                  element={
                    <ProtectedRoute allowedRoles={['hospital']}>
                      <HospitalProfile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/hospital/inventory"
                  element={
                    <ProtectedRoute allowedRoles={['hospital', 'admin']}>
                      <InventoryManagement />
                    </ProtectedRoute>
                  }
                />

                {/* Admin Protected */}
                <Route
                  path="/admin/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/users"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <ManageUsers />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/requests"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <ManageRequests />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/reports"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <Reports />
                    </ProtectedRoute>
                  }
                />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </AuthProvider>
      </ToastProvider>
    </Router>
  );
}
