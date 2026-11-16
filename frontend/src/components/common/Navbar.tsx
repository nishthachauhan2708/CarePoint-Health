import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Activity, ShieldAlert, User, LogOut, LayoutDashboard, 
  Stethoscope, Building2, PhoneCall, ChevronDown, CheckCircle2,
  CalendarCheck, UserCheck, Menu, X, Clock, MapPin, Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

export const Navbar: React.FC = () => {
  const { user, logout, quickLoginAs } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isDemoDropdownOpen, setIsDemoDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleRoleSwitch = async (role: UserRole) => {
    setIsDemoDropdownOpen(false);
    setMobileMenuOpen(false);
    await quickLoginAs(role);
    navigate(`/dashboard/${role}`);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200/90 shadow-sm">
      {/* Top Professional Hospital Utility Bar */}
      <div className="bg-slate-900 text-slate-300 text-[11px] py-1.5 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1.5">
          <div className="flex items-center gap-4 text-slate-300">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-teal-400" />
              <span>OPD Consultation Hours: <strong>Mon – Sat, 08:30 AM – 08:00 PM</strong></span>
            </span>
            <span className="hidden md:flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-teal-400" />
              <span>Institutional Medical Campus, New Delhi</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <a 
              href="tel:18002273669"
              className="flex items-center gap-1.5 text-rose-300 font-semibold hover:text-white transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse"></span>
              <span>24/7 Trauma Helpline: <strong>+91-1800-CARE-NOW</strong></span>
            </a>

            <span className="text-slate-600">|</span>

            {/* Quick Demo Persona Dropdown for Evaluator / Viva Demo */}
            <div className="relative">
              <button 
                onClick={() => setIsDemoDropdownOpen(!isDemoDropdownOpen)}
                className="flex items-center gap-1 text-[11px] font-semibold text-teal-300 bg-teal-950/70 hover:bg-teal-900/90 px-2.5 py-0.5 rounded border border-teal-500/30 transition-all"
                title="Switch persona for evaluation and testing"
              >
                <span>Demo Personas</span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {isDemoDropdownOpen && (
                <div className="absolute right-0 mt-2 w-60 bg-white text-slate-800 border border-slate-200 rounded-xl shadow-2xl py-2 z-50">
                  <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 flex items-center justify-between">
                    <span>Viva & Testing Accounts</span>
                    <Sparkles className="w-3 h-3 text-teal-600" />
                  </div>
                  <button 
                    onClick={() => handleRoleSwitch('admin')}
                    className="w-full px-3.5 py-2 text-left text-xs font-medium hover:bg-teal-50 hover:text-teal-700 flex items-center justify-between"
                  >
                    <span>🛡️ Hospital Admin Console</span>
                    {user?.role === 'admin' && <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />}
                  </button>
                  <button 
                    onClick={() => handleRoleSwitch('doctor')}
                    className="w-full px-3.5 py-2 text-left text-xs font-medium hover:bg-teal-50 hover:text-teal-700 flex items-center justify-between"
                  >
                    <span>👨‍⚕️ Specialist Doctor Console</span>
                    {user?.role === 'doctor' && <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />}
                  </button>
                  <button 
                    onClick={() => handleRoleSwitch('receptionist')}
                    className="w-full px-3.5 py-2 text-left text-xs font-medium hover:bg-teal-50 hover:text-teal-700 flex items-center justify-between"
                  >
                    <span>📋 Receptionist & Desk Console</span>
                    {user?.role === 'receptionist' && <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />}
                  </button>
                  <button 
                    onClick={() => handleRoleSwitch('patient')}
                    className="w-full px-3.5 py-2 text-left text-xs font-medium hover:bg-teal-50 hover:text-teal-700 flex items-center justify-between"
                  >
                    <span>🧑‍🦱 Patient Health Portal</span>
                    {user?.role === 'patient' && <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Hospital Navigation Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Hospital Logo & Brand Identity */}
          <Link to="/" className="flex items-center space-x-3.5 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-teal-600 to-teal-800 flex items-center justify-center text-white shadow-md shadow-teal-700/25 group-hover:scale-105 transition-transform">
              <Activity className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="text-xl font-black tracking-tight text-slate-900 group-hover:text-teal-700 transition-colors">
                  CareHealth
                </span>
                <span className="text-xl font-black text-teal-600">Point</span>
              </div>
              <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Smart Hospital Management System</p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-8 text-sm font-semibold text-slate-700">
            <Link 
              to="/" 
              className={`transition-colors py-1 ${isActive('/') ? 'text-teal-600 border-b-2 border-teal-600 font-bold' : 'hover:text-teal-600'}`}
            >
              Home
            </Link>
            <Link 
              to="/doctors" 
              className={`transition-colors py-1 flex items-center gap-1.5 ${isActive('/doctors') ? 'text-teal-600 border-b-2 border-teal-600 font-bold' : 'hover:text-teal-600'}`}
            >
              <Stethoscope className="w-4 h-4 text-teal-600" />
              <span>Doctor Directory</span>
            </Link>
            <a href="/#departments" className="hover:text-teal-600 transition-colors py-1">Departments</a>
            <a href="/#services" className="hover:text-teal-600 transition-colors py-1">Services & ICU</a>
            <a href="/#why-us" className="hover:text-teal-600 transition-colors py-1">Why CareHealth</a>
            <a href="/#emergency" className="text-rose-600 hover:text-rose-700 font-bold transition-colors py-1 flex items-center gap-1">
              <ShieldAlert className="w-4 h-4" />
              <span>Emergency</span>
            </a>
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden sm:flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-2.5">
                <Link
                  to={`/dashboard/${user.role}`}
                  className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-md shadow-teal-600/20 transition-all"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span className="capitalize">{user.role} Dashboard</span>
                </Link>
                <button
                  onClick={logout}
                  title="Sign Out"
                  className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl border border-slate-200 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2.5">
                <Link
                  to="/login"
                  className="px-4 py-2.5 text-xs font-bold text-slate-700 hover:text-teal-700 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors"
                >
                  Staff / Patient Login
                </Link>
                <Link
                  to="/doctors"
                  className="px-4 py-2.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-md shadow-teal-600/25 transition-all flex items-center gap-2"
                >
                  <CalendarCheck className="w-4 h-4" />
                  <span>Book Appointment</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger button */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-semibold text-slate-800 hover:text-teal-600"
          >
            Home
          </Link>
          <Link
            to="/doctors"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-semibold text-teal-600 flex items-center gap-2"
          >
            <Stethoscope className="w-4 h-4" />
            <span>Doctor Directory & Schedules</span>
          </Link>
          <a
            href="/#departments"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-semibold text-slate-800 hover:text-teal-600"
          >
            Clinical Departments
          </a>
          <a
            href="/#services"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-semibold text-slate-800 hover:text-teal-600"
          >
            Hospital Services & ICU
          </a>
          <a
            href="/#emergency"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-bold text-rose-600 flex items-center gap-1.5"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>24/7 Emergency Care</span>
          </a>

          <div className="pt-4 border-t border-slate-100 space-y-2">
            {user ? (
              <>
                <Link
                  to={`/dashboard/${user.role}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 px-4 bg-teal-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Go to {user.role.toUpperCase()} Dashboard</span>
                </Link>
                <button
                  onClick={() => { logout(); setMobileMenuOpen(false); }}
                  className="w-full py-2 px-4 border border-rose-200 text-rose-600 font-semibold text-xs rounded-xl hover:bg-rose-50"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/doctors"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 px-4 bg-teal-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md shadow-teal-600/20"
                >
                  <CalendarCheck className="w-4 h-4" />
                  <span>Book Appointment Slot</span>
                </Link>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2 px-4 bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center"
                >
                  Login (Staff / Patient)
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
