import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Building2, Stethoscope, Users, CalendarCheck, 
  BarChart3, Bell, Clock, FileText, CreditCard, LogOut, Activity,
  UserCheck, ShieldCheck, DollarSign, HelpCircle, Settings, ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

interface SidebarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  badgeCounts?: {
    appointments?: number;
    notifications?: number;
    patients?: number;
  };
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: string | number;
  hasChevron?: boolean;
}

interface NavSection {
  title?: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onTabChange, badgeCounts }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const adminSections: NavSection[] = [
    {
      title: 'General',
      items: [
        { id: 'overview', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
        { 
          id: 'appointments', 
          label: 'Appointments', 
          icon: <CalendarCheck className="w-4 h-4" />,
          badge: badgeCounts?.appointments || undefined
        },
        { id: 'patients', label: 'Patients', icon: <Users className="w-4 h-4" />, hasChevron: true },
        { id: 'departments', label: 'Departments', icon: <Building2 className="w-4 h-4" />, hasChevron: true },
        { id: 'doctors', label: 'Doctor Roster', icon: <Stethoscope className="w-4 h-4" /> },
      ]
    },
    {
      title: 'Reports',
      items: [
        { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" />, hasChevron: true },
        { id: 'financial', label: 'Financial Reports', icon: <DollarSign className="w-4 h-4" />, hasChevron: true },
      ]
    },
    {
      title: 'Settings',
      items: [
        { id: 'help', label: 'Help & Support', icon: <HelpCircle className="w-4 h-4" /> },
        { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
      ]
    }
  ];

  const defaultSections: Record<UserRole, NavSection[]> = {
    admin: adminSections,
    doctor: [
      {
        title: 'Clinical Desk',
        items: [
          { id: 'schedule', label: "Today's Schedule", icon: <CalendarCheck className="w-4 h-4" /> },
          { id: 'consultations', label: 'Consultations & Notes', icon: <FileText className="w-4 h-4" /> },
          { id: 'prescriptions', label: 'Prescriptions', icon: <FileText className="w-4 h-4" /> },
          { id: 'availability', label: 'Weekly Availability', icon: <Clock className="w-4 h-4" /> },
        ]
      }
    ],
    patient: [
      {
        title: 'Health Home',
        items: [
          { id: 'overview', label: 'My Health Home', icon: <LayoutDashboard className="w-4 h-4" /> },
          { id: 'book', label: 'Book Appointment', icon: <CalendarCheck className="w-4 h-4" /> },
          { id: 'queue', label: 'Live Queue Tracker', icon: <Clock className="w-4 h-4" /> },
          { id: 'healthcard', label: 'Digital Health Card', icon: <CreditCard className="w-4 h-4" /> },
          { id: 'prescriptions', label: 'My Prescriptions', icon: <FileText className="w-4 h-4" /> },
          { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
        ]
      }
    ],
    receptionist: [
      {
        title: 'Front Desk',
        items: [
          { id: 'checkin', label: 'Desk Check-in & Queue', icon: <UserCheck className="w-4 h-4" /> },
          { id: 'walkin', label: 'Register Walk-in Patient', icon: <Users className="w-4 h-4" /> },
          { id: 'book', label: 'Book for Patient', icon: <CalendarCheck className="w-4 h-4" /> },
          { id: 'roster', label: 'Doctor Availability', icon: <Stethoscope className="w-4 h-4" /> },
        ]
      }
    ]
  };

  const sections = defaultSections[user.role] || [];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 border-r border-slate-800 flex flex-col h-[calc(100vh-4rem)] sticky top-16 select-none shrink-0 transition-all duration-300">
      
      {/* Brand & User Mini Pill */}
      <div className="p-4 border-b border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-500 text-slate-950 flex items-center justify-center font-black text-sm shadow-md shadow-teal-500/20">
            {user.full_name.charAt(0)}
          </div>
          <div className="overflow-hidden">
            <h3 className="text-sm font-bold text-white truncate">{user.full_name}</h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-teal-500/10 text-teal-400 border border-teal-500/20 uppercase tracking-wider">
                {user.role}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation menu grouped by sections */}
      <nav className="flex-1 p-3 space-y-4 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800">
        {sections.map((sec, secIdx) => (
          <div key={secIdx} className="space-y-1">
            {sec.title && (
              <div className="px-3 text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mb-1.5">
                {sec.title}
              </div>
            )}
            {sec.items.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                    isActive
                      ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20 font-bold'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`${isActive ? 'text-slate-950' : 'text-slate-400 group-hover:text-teal-400'} transition-colors`}>
                      {item.icon}
                    </span>
                    <span className="truncate">{item.label}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {item.badge !== undefined && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                        isActive ? 'bg-slate-950 text-teal-400' : 'bg-amber-400/90 text-slate-950'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                    {item.hasChevron && !isActive && (
                      <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 transition-colors" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer / Logout Button */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/20">
        <button
          onClick={() => {
            logout();
            navigate('/');
          }}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-semibold text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 rounded-xl transition-all"
        >
          <LogOut className="w-4 h-4 text-slate-500 group-hover:text-rose-400" />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
};
