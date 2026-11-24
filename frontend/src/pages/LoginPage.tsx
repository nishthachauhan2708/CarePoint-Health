import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Activity, Lock, Mail, ArrowRight, ShieldCheck, AlertCircle, 
  Eye, EyeOff, CheckCircle2, UserCheck, Stethoscope, Users, 
  HelpCircle, X, Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { HOSPITAL_IMAGES } from '../utils/assets';

export const LoginPage: React.FC = () => {
  const { login, quickLoginAs } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [portalType, setPortalType] = useState<'staff' | 'patient'>('staff');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);

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
        setError(detail || 'Invalid email address or password. Please verify your credentials and try again.');
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
      setError(err.response?.data?.detail || 'Demo login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="max-w-4xl w-full bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        
        {/* Left Visual Column (4.5 cols on desktop): Hospital Branding & Clinical Context */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 p-8 lg:p-10 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-56 h-56 rounded-full bg-teal-500/10 blur-3xl pointer-events-none"></div>

          <div className="space-y-6 relative z-10">
            <Link to="/" className="inline-flex items-center space-x-2 group">
              <div className="w-10 h-10 rounded-xl bg-teal-500 text-slate-950 flex items-center justify-center font-bold shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform">
                <Activity className="w-6 h-6" />
              </div>
              <span className="text-xl font-extrabold text-white tracking-tight">CareHealth Point</span>
            </Link>

            <div className="space-y-2 pt-4">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-500/15 text-teal-300 text-[10px] font-bold border border-teal-500/30">
                <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                <span>Enterprise Clinical Portal</span>
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">
                Secure Hospital Access
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                Single sign-on gateway for medical specialists, hospital administration, desk receptionists, and outpatient records.
              </p>
            </div>

            <div className="space-y-3 pt-2 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                <span>Encrypted HIPAA/NABH Compliant Vault</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                <span>Real-Time Live Chamber Telemetry</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                <span>Role-Based Permissions & Audit Logs</span>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-700/60 relative z-10 text-[11px] text-slate-400 space-y-1">
            <p>24/7 Technical Support Desk: <strong>+91-1800-CARE-NOW</strong></p>
            <p className="font-mono text-[10px] text-teal-400">CareHealth Point v2.4 LTS • Build 2026</p>
          </div>
        </div>

        {/* Right Form Column (7.5 cols on desktop): Comfortable, Generous Form Controls */}
        <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-between space-y-6">
          
          <div>
            {/* Staff vs Patient Tab Switcher */}
            <div className="flex items-center justify-between pb-6 border-b border-slate-100">
              <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl w-full max-w-xs text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setPortalType('staff')}
                  className={`py-1.5 px-3 rounded-lg transition-all ${
                    portalType === 'staff'
                      ? 'bg-white text-slate-900 shadow-sm font-bold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Hospital Staff
                </button>
                <button
                  type="button"
                  onClick={() => setPortalType('patient')}
                  className={`py-1.5 px-3 rounded-lg transition-all ${
                    portalType === 'patient'
                      ? 'bg-white text-slate-900 shadow-sm font-bold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Patient Portal
                </button>
              </div>

              <span className="hidden sm:inline-block text-[11px] font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200">
                {portalType === 'staff' ? 'Staff Gateway' : 'Patient Gateway'}
              </span>
            </div>

            {/* Error Message Alert */}
            {error && (
              <div className="mt-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 shadow-sm">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              
              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Email Address / Staff Identifier
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={portalType === 'staff' ? "doctor@carehealth.com or admin@carehealth.com" : "your.email@example.com"}
                    className="w-full pl-10 pr-4 py-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all font-medium"
                  />
                </div>
              </div>

              {/* Password with Visibility Toggle */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700">
                    Account Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsForgotModalOpen(true)}
                    className="text-[11px] font-semibold text-teal-600 hover:text-teal-700 transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your confidential password"
                    className="w-full pl-10 pr-11 py-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me Option */}
              <div className="flex items-center justify-between pt-1 text-xs">
                <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600 font-medium">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
                  />
                  <span>Remember this clinical workstation</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-teal-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Sign In to {portalType === 'staff' ? 'Staff Portal' : 'Patient Portal'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* 1-Click Role Switcher (Compact & Elegant) */}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                <span>Clinical Role Switcher (Testing & Viva)</span>
              </span>
              <span className="text-[10px] text-slate-400">1-Click Auth</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin')}
                className="p-2 bg-slate-50 hover:bg-teal-50 hover:border-teal-300 text-slate-700 rounded-xl border border-slate-200 text-center text-xs font-semibold transition-all"
              >
                <span className="block text-sm mb-0.5">🛡️</span>
                <span>Admin</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('doctor')}
                className="p-2 bg-slate-50 hover:bg-teal-50 hover:border-teal-300 text-slate-700 rounded-xl border border-slate-200 text-center text-xs font-semibold transition-all"
              >
                <span className="block text-sm mb-0.5">👨‍⚕️</span>
                <span>Doctor</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('receptionist')}
                className="p-2 bg-slate-50 hover:bg-teal-50 hover:border-teal-300 text-slate-700 rounded-xl border border-slate-200 text-center text-xs font-semibold transition-all"
              >
                <span className="block text-sm mb-0.5">📋</span>
                <span>Reception</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('patient')}
                className="p-2 bg-slate-50 hover:bg-teal-50 hover:border-teal-300 text-slate-700 rounded-xl border border-slate-200 text-center text-xs font-semibold transition-all"
              >
                <span className="block text-sm mb-0.5">🧑‍🦱</span>
                <span>Patient</span>
              </button>
            </div>

            <div className="pt-2 text-center text-xs text-slate-500">
              New patient without an account?{' '}
              <Link to="/register" className="font-bold text-teal-600 hover:text-teal-700 underline">
                Register New Patient & Generate UHID
              </Link>
            </div>
          </div>

        </div>

      </div>

      {/* Forgot Password Helper Modal */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-teal-600" />
                <h3 className="font-bold text-slate-900 text-sm">Credential Recovery & Support</h3>
              </div>
              <button
                onClick={() => setIsForgotModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-slate-600 leading-relaxed">
              In accordance with hospital data safety standards and HIPAA privacy protocols:
            </p>

            <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-slate-700">
              <p>• <strong>Hospital Staff:</strong> Please contact the IT Administration Department or hospital supervisor to reset staff clinical credentials.</p>
              <p>• <strong>Patients:</strong> You may register with your current email or contact the front desk with your Universal Hospital ID (UHID).</p>
              <p>• <strong>Emergency Assistance:</strong> Call hospital desk at +91-1800-CARE-NOW.</p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setIsForgotModalOpen(false)}
                className="px-4 py-2 bg-teal-600 text-white font-bold rounded-xl"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
