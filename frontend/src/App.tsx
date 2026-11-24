import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { CareBuddyChatbot } from './components/chatbot/CareBuddyChatbot';
import { ProtectedRoute } from './components/common/ProtectedRoute';

import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DoctorDirectoryPage } from './pages/DoctorDirectoryPage';
import { DoctorProfilePage } from './pages/DoctorProfilePage';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { DoctorDashboard } from './pages/doctor/DoctorDashboard';
import { PatientDashboard } from './pages/patient/PatientDashboard';
import { ReceptionistDashboard } from './pages/receptionist/ReceptionistDashboard';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-slate-50 font-['Plus_Jakarta_Sans',sans-serif]">
          <Navbar />
          
          <div className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/doctors" element={<DoctorDirectoryPage />} />
              <Route path="/doctors/:id" element={<DoctorProfilePage />} />

              {/* Protected Clinical Dashboards */}
              <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                <Route path="/dashboard/admin" element={<AdminDashboard />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={['doctor']} />}>
                <Route path="/dashboard/doctor" element={<DoctorDashboard />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={['patient']} />}>
                <Route path="/dashboard/patient" element={<PatientDashboard />} />
                <Route path="/queue" element={<Navigate to="/dashboard/patient?tab=queue" replace />} />
                <Route path="/dashboard/queue" element={<Navigate to="/dashboard/patient?tab=queue" replace />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={['receptionist']} />}>
                <Route path="/dashboard/receptionist" element={<ReceptionistDashboard />} />
              </Route>

              {/* Catch-all redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>

          <CareBuddyChatbot />
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
