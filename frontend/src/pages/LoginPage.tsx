import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Activity, Lock, Mail, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

export const LoginPage: React.FC = () => {
  const { login, quickLoginAs } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setError('Please enter your email address.');
      return;
    }

    if (!password) {
      setError('Please enter your account password.');
      return;
    }

    setLoading(true);

    try {
      const user = await login(cleanEmail, password);
      const targetPath = (location.state as any)?.from || `/dashboard/${user.role}`;
      navigate(targetPath);
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      if (Array.isArray(detail)) {
        setError(detail.map((d: any) => d.msg || d).join(', '));
      } else {
        setError(detail || 'Invalid email address or password. Please verify and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (role: UserRole) => {
    setError(null);
    setLoading(true);
    try {
      await quickLoginAs(role);
      const targetPath = (location.state as any)?.from || `/dashboard/${role}`;
      navigate(targetPath);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Quick demo login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        
        {/* Brand Header */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center space-x-2 mb-2 group">
            <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-md shadow-teal-600/20 group-hover:scale-105 transition-transform">
              <Activity className="w-6 h-6" />
            </div>
            <span className="text-2xl font-extrabold text-slate-900 tracking-tight">CareHealth Point</span>
          </Link>
          <h2 className="text-xl font-bold text-slate-800">Hospital Portal Sign In</h2>
          <p className="text-xs text-slate-500 mt-1">Access your clinical dashboard or patient health records</p>
        </div>

        {/* 1-Click Evaluation / Viva Quick Login Buttons */}
        <div className="bg-teal-50/70 border border-teal-200/80 rounded-2xl p-4 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-teal-900 uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            <span>1-Click Evaluator Demo Accounts</span>
          </div>
          <p className="text-[11px] text-teal-700 leading-normal">
            Select any role to test its specific dashboard and role-based permissions immediately:
          </p>
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => handleQuickLogin('admin')}
              className="py-1.5 px-3 bg-white hover:bg-teal-100 text-teal-900 font-semibold text-xs rounded-lg border border-teal-200 shadow-sm transition-colors text-left flex items-center justify-between"
            >
              <span>🛡️ Admin</span>
              <span className="text-[10px] text-teal-600 font-mono">Full Mgmt</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('doctor')}
              className="py-1.5 px-3 bg-white hover:bg-teal-100 text-teal-900 font-semibold text-xs rounded-lg border border-teal-200 shadow-sm transition-colors text-left flex items-center justify-between"
            >
              <span>👨‍⚕️ Doctor</span>
              <span className="text-[10px] text-teal-600 font-mono">Consult</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('receptionist')}
              className="py-1.5 px-3 bg-white hover:bg-teal-100 text-teal-900 font-semibold text-xs rounded-lg border border-teal-200 shadow-sm transition-colors text-left flex items-center justify-between"
            >
              <span>📋 Reception</span>
              <span className="text-[10px] text-teal-600 font-mono">Check-in</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('patient')}
              className="py-1.5 px-3 bg-white hover:bg-teal-100 text-teal-900 font-semibold text-xs rounded-lg border border-teal-200 shadow-sm transition-colors text-left flex items-center justify-between"
            >
              <span>🧑‍🦱 Patient</span>
              <span className="text-[10px] text-teal-600 font-mono">Book / Queue</span>
            </button>
          </div>
        </div>

        {/* Standard Real Login Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="yourname@gmail.com"
                  className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-teal-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Sign In to Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500">
            Don't have a patient account?{' '}
            <Link to="/register" className="font-semibold text-teal-600 hover:text-teal-700">
              Register New Patient
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};
