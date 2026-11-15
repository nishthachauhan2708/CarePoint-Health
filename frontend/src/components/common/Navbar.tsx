import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Activity, ShieldAlert, User, LogOut, LayoutDashboard, 
  Bell, ChevronDown, CheckCircle2 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

export const Navbar: React.FC = () => {
  const { user, logout, quickLoginAs } = useAuth();
  const navigate = useNavigate();
  const [isDemoDropdownOpen, setIsDemoDropdownOpen] = useState(false);

  const handleRoleSwitch = async (role: UserRole) => {
    setIsDemoDropdownOpen(false);
    await quickLoginAs(role);
    navigate(`/dashboard/${role}`);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-md shadow-teal-600/20 group-hover:scale-105 transition-transform">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-teal-700 transition-colors">
                CareHealth<span className="text-teal-600 font-extrabold">.</span>Point
              </span>
              <p className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">Better Healthcare. Smarter Management.</p>
            </div>
          </Link>

          {/* Navigation links */}
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-slate-600">
            <Link to="/" className="hover:text-teal-600 transition-colors">Home</Link>
            <a href="#departments" className="hover:text-teal-600 transition-colors">Departments</a>
            <a href="#doctors" className="hover:text-teal-600 transition-colors">Specialists</a>
            <a href="#emergency" className="hover:text-teal-600 transition-colors text-rose-600 font-semibold flex items-center gap-1">
              <ShieldAlert className="w-4 h-4" /> 24/7 Emergency
            </a>
          </nav>

          {/* Right Action buttons */}
          <div className="flex items-center space-x-3">
            {/* Quick Demo Role Switcher for Viva & Evaluation */}
            <div className="relative">
              <button 
                onClick={() => setIsDemoDropdownOpen(!isDemoDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200 rounded-lg hover:bg-teal-100 transition-all shadow-sm"
              >
                <span>Demo Accounts</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {isDemoDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    Switch Active Role
                  </div>
                  <button 
                    onClick={() => handleRoleSwitch('admin')}
                    className="w-full px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-teal-50 hover:text-teal-700 flex items-center justify-between"
                  >
                    <span>🛡️ Hospital Admin</span>
                    {user?.role === 'admin' && <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />}
                  </button>
                  <button 
                    onClick={() => handleRoleSwitch('doctor')}
                    className="w-full px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-teal-50 hover:text-teal-700 flex items-center justify-between"
                  >
                    <span>👨‍⚕️ Specialist Doctor</span>
                    {user?.role === 'doctor' && <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />}
                  </button>
                  <button 
                    onClick={() => handleRoleSwitch('receptionist')}
                    className="w-full px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-teal-50 hover:text-teal-700 flex items-center justify-between"
                  >
                    <span>📋 Receptionist Desk</span>
                    {user?.role === 'receptionist' && <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />}
                  </button>
                  <button 
                    onClick={() => handleRoleSwitch('patient')}
                    className="w-full px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-teal-50 hover:text-teal-700 flex items-center justify-between"
                  >
                    <span>🧑‍🦱 Patient Portal</span>
                    {user?.role === 'patient' && <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />}
                  </button>
                </div>
              )}
            </div>

            {user ? (
              <div className="flex items-center space-x-2">
                <Link
                  to={`/dashboard/${user.role}`}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span className="capitalize">{user.role} Dashboard</span>
                </Link>
                <button
                  onClick={logout}
                  title="Logout"
                  className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-sm font-medium text-slate-700 hover:text-teal-600 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm transition-colors"
                >
                  Book Appointment
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
