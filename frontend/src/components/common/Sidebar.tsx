import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Building2, Stethoscope, Users, CalendarCheck, 
  BarChart3, Bell, Clock, FileText, CreditCard, LogOut, Activity,
  UserCheck, ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

interface SidebarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onTabChange }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const roleNavItems: Record<UserRole, { id: string; label: string; icon: React.ReactNode }[]> = {
    admin: [
      { id: 'overview', label: 'Hospital Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
      { id: 'departments', label: 'Departments', icon: <Building2 className="w-4 h-4" /> },
      { id: 'doctors', label: 'Doctor Roster', icon: <Stethoscope className="w-4 h-4" /> },
      { id: 'patients', label: 'Patient Master', icon: <Users className="w-4 h-4" /> },
      { id: 'appointments', label: 'All Appointments', icon: <CalendarCheck className="w-4 h-4" /> },
      { id: 'analytics', label: 'Operational Analytics', icon: <BarChart3 className="w-4 h-4" /> },
      { id: 'notifications', label: 'System Alerts', icon: <Bell className="w-4 h-4" /> },
    ],
    doctor: [
      { id: 'schedule', label: "Today's Schedule", icon: <CalendarCheck className="w-4 h-4" /> },
      { id: 'consultations', label: 'Consultations & Notes', icon: <FileText className="w-4 h-4" /> },
      { id: 'prescriptions', label: 'Prescriptions', icon: <FileText className="w-4 h-4" /> },
      { id: 'availability', label: 'Weekly Availability', icon: <Clock className="w-4 h-4" /> },
    ],
    patient: [
      { id: 'overview', label: 'My Health Home', icon: <LayoutDashboard className="w-4 h-4" /> },
      { id: 'book', label: 'Book Appointment', icon: <CalendarCheck className="w-4 h-4" /> },
      { id: 'queue', label: 'Live Queue Tracker', icon: <Clock className="w-4 h-4" /> },
      { id: 'healthcard', label: 'Digital Health Card', icon: <CreditCard className="w-4 h-4" /> },
      { id: 'prescriptions', label: 'My Prescriptions', icon: <FileText className="w-4 h-4" /> },
      { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
    ],
    receptionist: [
      { id: 'checkin', label: 'Desk Check-in & Queue', icon: <UserCheck className="w-4 h-4" /> },
      { id: 'walkin', label: 'Register Walk-in Patient', icon: <Users className="w-4 h-4" /> },
      { id: 'book', label: 'Book for Patient', icon: <CalendarCheck className="w-4 h-4" /> },
      { id: 'roster', label: 'Doctor Availability', icon: <Stethoscope className="w-4 h-4" /> },
    ]
  };

  const navItems = roleNavItems[user.role] || [];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-[calc(100vh-4rem)] sticky top-16">
      {/* User profile card */}
      <div className="p-4 border-b border-slate-100 bg-slate-50/70">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
            {user.full_name.charAt(0)}
          </div>
          <div className="overflow-hidden">
            <h3 className="text-sm font-semibold text-slate-900 truncate">{user.full_name}</h3>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-teal-100 text-teal-800 uppercase tracking-wide">
                {user.role}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation menu */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left ${
                isActive
                  ? 'bg-teal-600 text-white shadow-sm font-semibold'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer / Logout */}
      <div className="p-3 border-t border-slate-200">
        <button
          onClick={() => {
            logout();
            navigate('/');
          }}
          className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
