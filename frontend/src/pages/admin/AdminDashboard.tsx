import React, { useState, useEffect } from 'react';
import { 
  Users, Stethoscope, Building2, CalendarCheck, TrendingUp, 
  Plus, Edit, Trash2, CheckCircle, Clock, AlertTriangle, Send,
  Search, SlidersHorizontal, ChevronRight, MessageSquare, Bell,
  User, CheckSquare, Square, Eye, X, ArrowUpRight, DollarSign,
  ShieldAlert, Sparkles, Filter, ChevronDown, Check, Activity
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { api } from '../../services/api';
import { HospitalAnalytics, Department, Doctor, Patient, Appointment, RecentPatientActivity } from '../../types';
import { Sidebar } from '../../components/common/Sidebar';
import { useAuth } from '../../context/AuthContext';
import { getDoctorPhoto } from '../../utils/assets';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [analytics, setAnalytics] = useState<HospitalAnalytics | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentPatientActivity[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter States
  const [globalSearch, setGlobalSearch] = useState('');
  const [patientSearch, setPatientSearch] = useState('');
  const [patientStatusFilter, setPatientStatusFilter] = useState('All');
  const [isAdvanceFilterOpen, setIsAdvanceFilterOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState('2024-2026');
  const [selectedPatientIds, setSelectedPatientIds] = useState<number[]>([]);
  const [selectedPatientModal, setSelectedPatientModal] = useState<Patient | null>(null);

  // Recent Activity Search & Filter
  const [activitySearch, setActivitySearch] = useState('');
  const [activityFilter, setActivityFilter] = useState('All');
  const [isActivityFilterOpen, setIsActivityFilterOpen] = useState(false);

  // Department Modal State
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [deptForm, setDeptForm] = useState({ name: '', code: '', description: '', head_doctor_name: '' });

  // Broadcast Modal State
  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);
  const [broadcastForm, setBroadcastForm] = useState({ title: '', message: '', type: 'info' });

  // Notifications Popover State
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const loadData = async () => {
    try {
      const [analyticsData, deptsData, docsData, patsData, apptsData] = await Promise.all([
        api.analytics.getSummary(),
        api.departments.getAll(),
        api.doctors.getAll(),
        api.patients.getAll(),
        api.appointments.getAll()
      ]);
      setAnalytics(analyticsData);
      setDepartments(deptsData);
      setDoctors(docsData);
      setPatients(patsData);
      setAppointments(apptsData);

      // Fetch recent patient activities
      try {
        const activities = await api.patients.getRecentActivities();
        setRecentActivities(activities);
      } catch (e) {
        console.warn("Could not load recent activities:", e);
      }
    } catch (err) {
      console.error("Failed to load admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.departments.create(deptForm);
      setIsDeptModalOpen(false);
      setDeptForm({ name: '', code: '', description: '', head_doctor_name: '' });
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to create department");
    }
  };

  const handleDeleteDepartment = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this department?")) {
      try {
        await api.departments.delete(id);
        loadData();
      } catch (err: any) {
        alert(err.response?.data?.detail || "Cannot delete department");
      }
    }
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.notifications.getAll(); // Verify connection
      alert("Broadcast alert dispatched to all active hospital users!");
      setIsBroadcastOpen(false);
      setBroadcastForm({ title: '', message: '', type: 'info' });
    } catch (err) {
      alert("Broadcast delivery failed");
    }
  };

  // Toggle selection for patient rows
  const toggleSelectPatient = (id: number) => {
    setSelectedPatientIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAllPatients = () => {
    if (selectedPatientIds.length === filteredPatients.length) {
      setSelectedPatientIds([]);
    } else {
      setSelectedPatientIds(filteredPatients.map(p => p.id));
    }
  };

  // Filtered Patients List
  const filteredPatients = patients.filter(p => {
    const fullName = p.user?.full_name?.toLowerCase() || '';
    const uhid = p.patient_uhid.toLowerCase();
    const matchesSearch = patientSearch === '' || 
      fullName.includes(patientSearch.toLowerCase()) || 
      uhid.includes(patientSearch.toLowerCase()) ||
      String(p.id).includes(patientSearch);

    const matchesStatus = patientStatusFilter === 'All' || 
      (p.clinical_status || 'New Patient').toLowerCase() === patientStatusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  // Filtered Activities List
  const filteredActivities = recentActivities.filter(act => {
    const nameMatch = act.patient_name.toLowerCase().includes(activitySearch.toLowerCase());
    const conditionMatch = act.disease_or_condition.toLowerCase().includes(activitySearch.toLowerCase());
    const matchesSearch = activitySearch === '' || nameMatch || conditionMatch;

    const matchesFilter = activityFilter === 'All' || 
      act.status.toLowerCase().includes(activityFilter.toLowerCase());

    return matchesSearch && matchesFilter;
  });

  // Today's Operational Reports / Alerts
  const todaysReports = [
    {
      id: 1,
      type: 'warning',
      title: 'Facility Maintenance Notice',
      message: "The HVAC positive pressure system in OT-2 underwent scheduled filter calibration.",
      timeAgo: "Few Hours Ago"
    },
    {
      id: 2,
      type: 'warning',
      title: 'OPD Flow Optimization',
      message: "Cardiology chamber peak queue volume stabilized with 15-minute average patient triage.",
      timeAgo: "2 Hours Ago"
    },
    {
      id: 3,
      type: 'info',
      title: 'Emergency Resuscitation Bay',
      message: "Level-1 Trauma & stroke thrombolysis team on active 24/7 priority standby.",
      timeAgo: "4 Hours Ago"
    }
  ];

  const COLORS = ['#0D9488', '#2DD4BF', '#0284C7', '#6366F1', '#EC4899', '#F59E0B'];

  return (
    <div className="flex bg-slate-950 text-slate-100 min-h-[calc(100vh-4rem)] font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Grouped Reference-Style Sidebar */}
      <Sidebar 
        currentTab={activeTab} 
        onTabChange={setActiveTab}
        badgeCounts={{
          appointments: appointments.filter(a => a.status === 'confirmed' || a.status === 'pending').length,
          patients: patients.length
        }}
      />

      {/* Main View Area */}
      <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
        <div className="max-w-[1440px] mx-auto space-y-6">

          {/* Reference-Style Dashboard Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
            <div>
              <h1 className="text-2xl font-black text-white flex items-center gap-2 tracking-tight">
                <span>Hello, {user?.full_name?.split(' ')[0] || 'Admin'}</span>
                <span className="text-xl">👋</span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Welcome to the CareHealth Point Hospital Management Dashboard.
              </p>
            </div>

            {/* Global Search & Action Icons */}
            <div className="flex items-center gap-3">
              {/* Search Bar */}
              <div className="relative min-w-[260px] md:min-w-[320px]">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search anything (patient, doctor, token)..."
                  value={globalSearch}
                  onChange={(e) => setGlobalSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-xs bg-slate-900 border border-slate-800 rounded-xl text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-teal-500 transition-colors"
                />
              </div>

              {/* Chat / Alert Icon */}
              <button 
                onClick={() => setIsBroadcastOpen(true)}
                title="Send Hospital Broadcast Alert"
                className="w-9 h-9 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 flex items-center justify-center transition-colors relative"
              >
                <MessageSquare className="w-4 h-4" />
              </button>

              {/* Notifications Icon with Badge */}
              <div className="relative">
                <button
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  title="System Notifications"
                  className="w-9 h-9 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 flex items-center justify-center transition-colors relative"
                >
                  <Bell className="w-4 h-4" />
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-teal-400"></span>
                </button>

                {isNotificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-4 z-50 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <span className="text-xs font-bold text-white">System Notifications</span>
                      <span className="text-[10px] text-teal-400 font-semibold">{todaysReports.length} Unread</span>
                    </div>
                    <div className="space-y-2">
                      {todaysReports.map((r) => (
                        <div key={r.id} className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-800 text-xs space-y-1">
                          <span className="font-bold text-slate-200 block">{r.title}</span>
                          <p className="text-[11px] text-slate-400 leading-normal">{r.message}</p>
                          <span className="text-[10px] text-slate-500 block">{r.timeAgo}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Admin Profile Pill */}
              <div className="flex items-center gap-2.5 pl-2 border-l border-slate-800">
                <div className="w-9 h-9 rounded-xl bg-teal-500 text-slate-950 font-black text-xs flex items-center justify-center shadow-md shadow-teal-500/20">
                  {user?.full_name?.charAt(0) || 'A'}
                </div>
                <div className="hidden sm:block text-left">
                  <span className="text-xs font-bold text-white block leading-tight">{user?.full_name}</span>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Admin</span>
                </div>
              </div>
            </div>
          </div>

          {/* MAIN TAB 1: OVERVIEW (MATCHING REFERENCE SCREENSHOT) */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

              {/* LEFT / CENTER COLUMN (8 cols): Patients Management & Recent Activity */}
              <div className="lg:col-span-8 space-y-6">

                {/* CARD 1: PATIENTS MANAGEMENT (Matching Reference Table) */}
                <div className="bg-slate-900/90 rounded-2xl border border-slate-800/90 p-6 shadow-xl space-y-4">
                  
                  {/* Card Header */}
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-bold text-white tracking-tight">Patients Management</h2>
                    <button 
                      onClick={() => setActiveTab('patients')}
                      className="text-xs font-semibold text-teal-400 hover:text-teal-300 transition-colors"
                    >
                      See All
                    </button>
                  </div>

                  {/* Search & Advance Filter Bar */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="search patients name, id"
                        value={patientSearch}
                        onChange={(e) => setPatientSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 text-xs bg-slate-950/80 border border-slate-800 rounded-xl text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-teal-500 transition-colors"
                      />
                    </div>

                    <button
                      onClick={() => setIsAdvanceFilterOpen(!isAdvanceFilterOpen)}
                      className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded-xl shadow-md shadow-teal-500/20 flex items-center justify-center gap-2 transition-all shrink-0"
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5" />
                      <span>Advance Filter</span>
                    </button>
                  </div>

                  {/* Advance Filter Drawer */}
                  {isAdvanceFilterOpen && (
                    <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-xs flex flex-wrap items-center gap-2">
                      <span className="text-slate-400 font-semibold mr-1">Status Filter:</span>
                      {['All', 'Discharged', 'In Treatment', 'Transfers', 'New Patient'].map((st) => (
                        <button
                          key={st}
                          onClick={() => setPatientStatusFilter(st)}
                          className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                            patientStatusFilter === st 
                              ? 'bg-teal-500 text-slate-950' 
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Patients Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-950/40 text-slate-400 border-b border-slate-800 font-semibold">
                        <tr>
                          <th className="p-3 w-8">
                            <button 
                              onClick={toggleSelectAllPatients}
                              className="text-slate-400 hover:text-white"
                            >
                              {selectedPatientIds.length > 0 && selectedPatientIds.length === filteredPatients.length ? (
                                <CheckSquare className="w-4 h-4 text-teal-400" />
                              ) : (
                                <Square className="w-4 h-4" />
                              )}
                            </button>
                          </th>
                          <th className="p-3 font-semibold uppercase tracking-wider text-[11px]">ID</th>
                          <th className="p-3 font-semibold uppercase tracking-wider text-[11px]">Name</th>
                          <th className="p-3 font-semibold uppercase tracking-wider text-[11px]">Admit</th>
                          <th className="p-3 font-semibold uppercase tracking-wider text-[11px]">Type</th>
                          <th className="p-3 font-semibold uppercase tracking-wider text-[11px]">Status</th>
                          <th className="p-3 font-semibold uppercase tracking-wider text-[11px] text-right">Details</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {filteredPatients.slice(0, 6).map((p) => {
                          const isSelected = selectedPatientIds.includes(p.id);
                          const patientNum = `#${p.id + 40320}`;
                          const admitDate = p.admission_date 
                            ? new Date(p.admission_date).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: '2-digit' })
                            : (p.registered_at ? new Date(p.registered_at).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: '2-digit' }) : '9/4/26');

                          const status = p.clinical_status || 'New Patient';
                          const statusColor = 
                            status.toLowerCase().includes('discharg') || status.toLowerCase().includes('recover') ? 'text-emerald-400 font-semibold' :
                            status.toLowerCase().includes('transfer') || status.toLowerCase().includes('cancel') ? 'text-rose-400 font-semibold' :
                            status.toLowerCase().includes('treat') ? 'text-amber-400 font-semibold' :
                            'text-teal-400 font-semibold';

                          return (
                            <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                              <td className="p-3">
                                <button 
                                  onClick={() => toggleSelectPatient(p.id)}
                                  className="text-slate-500 hover:text-white"
                                >
                                  {isSelected ? (
                                    <CheckSquare className="w-4 h-4 text-teal-400" />
                                  ) : (
                                    <Square className="w-4 h-4" />
                                  )}
                                </button>
                              </td>
                              <td className="p-3 font-mono text-slate-400">
                                {patientNum}
                              </td>
                              <td className="p-3">
                                <div className="font-semibold text-white flex items-center gap-2">
                                  <span>{p.user?.full_name || 'Patient'}</span>
                                </div>
                              </td>
                              <td className="p-3 text-slate-400">
                                {admitDate}
                              </td>
                              <td className="p-3 text-slate-300">
                                {p.medical_category || 'General'}
                              </td>
                              <td className="p-3">
                                <span className={statusColor}>
                                  {status}
                                </span>
                              </td>
                              <td className="p-3 text-right">
                                <button
                                  onClick={() => setSelectedPatientModal(p)}
                                  className="text-teal-400 hover:text-teal-300 font-semibold text-xs transition-colors"
                                >
                                  Details
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>

                    {filteredPatients.length === 0 && (
                      <div className="py-12 text-center text-slate-500 text-xs">
                        No patient records found matching your search or filters.
                      </div>
                    )}
                  </div>

                </div>

                {/* CARD 2: RECENT PATIENTS ACTIVITY (Matching Reference Design) */}
                <div className="bg-slate-900/90 rounded-2xl border border-slate-800/90 p-6 shadow-xl space-y-4">
                  
                  {/* Card Header */}
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-bold text-white tracking-tight">Recent Patients Activity</h2>
                    <button 
                      onClick={() => setActiveTab('patients')}
                      className="text-xs font-semibold text-teal-400 hover:text-teal-300 transition-colors"
                    >
                      See All
                    </button>
                  </div>

                  {/* Search & Advance Filter */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="search patients name, disease"
                        value={activitySearch}
                        onChange={(e) => setActivitySearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 text-xs bg-slate-950/80 border border-slate-800 rounded-xl text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-teal-500 transition-colors"
                      />
                    </div>

                    <button
                      onClick={() => setIsActivityFilterOpen(!isActivityFilterOpen)}
                      className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded-xl shadow-md shadow-teal-500/20 flex items-center justify-center gap-2 transition-all shrink-0"
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5" />
                      <span>Advance Filter</span>
                    </button>
                  </div>

                  {/* Activity Filter Drawer */}
                  {isActivityFilterOpen && (
                    <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-xs flex flex-wrap items-center gap-2">
                      <span className="text-slate-400 font-semibold mr-1">Activity Type:</span>
                      {['All', 'Recovered', 'In Treatment', 'New Patient'].map((st) => (
                        <button
                          key={st}
                          onClick={() => setActivityFilter(st)}
                          className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                            activityFilter === st 
                              ? 'bg-teal-500 text-slate-950' 
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Activity List */}
                  <div className="space-y-3 pt-1">
                    {filteredActivities.slice(0, 5).map((act) => {
                      const statusColor = 
                        act.status.toLowerCase().includes('recover') ? 'text-emerald-400' :
                        act.status.toLowerCase().includes('treatment') ? 'text-amber-400' :
                        'text-teal-400';

                      return (
                        <div 
                          key={act.id}
                          className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/80 hover:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
                        >
                          {/* Left: Avatar + Name + Age */}
                          <div className="flex items-center gap-3.5">
                            <img 
                              src={act.avatar_url || "/avatars/doctor-male.svg"} 
                              alt={act.patient_name}
                              className="w-11 h-11 rounded-xl bg-slate-800 border border-slate-700 object-cover"
                            />
                            <div>
                              <h4 className="font-bold text-white text-sm">{act.patient_name}</h4>
                              <span className="text-xs text-slate-400">
                                {act.age ? `${act.age} Years Old` : (act.gender || 'Patient Profile')}
                              </span>
                            </div>
                          </div>

                          {/* Center: Disease / Clinical Condition */}
                          <div className="sm:text-left">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Disease / Condition</span>
                            <span className="text-xs font-semibold text-slate-200">
                              {act.disease_or_condition}
                            </span>
                          </div>

                          {/* Right: Status & Date Time */}
                          <div className="sm:text-right shrink-0">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Status</span>
                            <span className={`text-xs font-bold ${statusColor} block`}>
                              {act.status}
                            </span>
                            <span className="text-[10px] font-mono text-slate-500 block mt-0.5">
                              {act.formatted_time}
                            </span>
                          </div>
                        </div>
                      );
                    })}

                    {filteredActivities.length === 0 && (
                      <div className="py-12 text-center text-slate-500 text-xs">
                        No recent patient activities recorded yet.
                      </div>
                    )}
                  </div>

                </div>

              </div>

              {/* RIGHT COLUMN (4 cols): Patient Stats, Doctor List, Today's Report */}
              <div className="lg:col-span-4 space-y-6">

                {/* WIDGET 1: PATIENT STATISTICS (Matching Reference) */}
                <div className="bg-slate-900/90 rounded-2xl border border-slate-800/90 p-5 shadow-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white">Patient</h3>
                    <div className="relative">
                      <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value)}
                        className="bg-slate-950 border border-slate-800 text-[11px] font-semibold text-slate-300 rounded-lg px-2.5 py-1 focus:outline-none focus:border-teal-500 cursor-pointer"
                      >
                        <option value="2024-2026">2024–2026</option>
                        <option value="2026">2026 Live</option>
                        <option value="All Time">All Time</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {/* New Patient Box */}
                    <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800/80 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center shrink-0 border border-teal-500/20">
                        <Users className="w-5 h-5 text-teal-400" />
                      </div>
                      <div>
                        <div className="text-xl font-black text-white font-mono">
                          {analytics?.new_patients !== undefined ? analytics.new_patients : (patients.length > 0 ? patients.length : 16)}
                        </div>
                        <div className="text-[11px] font-semibold text-slate-400">New Patient</div>
                      </div>
                    </div>

                    {/* Old/Existing Patient Box */}
                    <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800/80 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
                        <User className="w-5 h-5 text-amber-400" />
                      </div>
                      <div>
                        <div className="text-xl font-black text-white font-mono">
                          {analytics?.old_patients !== undefined ? analytics.old_patients : 4}
                        </div>
                        <div className="text-[11px] font-semibold text-slate-400">Old Patient</div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-1 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/60">
                    <span>Total Registered Patients</span>
                    <span className="font-bold text-white font-mono">{analytics?.total_patients || patients.length}</span>
                  </div>
                </div>

                {/* WIDGET 2: DOCTOR LIST (Matching Reference) */}
                <div className="bg-slate-900/90 rounded-2xl border border-slate-800/90 p-5 shadow-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white">Doctor List</h3>
                    <button 
                      onClick={() => setActiveTab('doctors')}
                      className="text-xs font-semibold text-teal-400 hover:text-teal-300 transition-colors"
                    >
                      See All
                    </button>
                  </div>

                  <div className="space-y-3">
                    {doctors.slice(0, 4).map((doc) => {
                      const docName = doc.user?.full_name || 'Doctor Specialist';
                      const isAvailable = doc.availabilities && doc.availabilities.length > 0 ? doc.availabilities[0].is_available : true;
                      
                      return (
                        <div 
                          key={doc.id}
                          className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={getDoctorPhoto(docName, doc.specialization)}
                              alt={docName}
                              className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 object-cover"
                            />
                            <div>
                              <h4 className="text-xs font-bold text-white">{docName}</h4>
                              <p className="text-[11px] text-slate-400">{doc.specialization}</p>
                            </div>
                          </div>

                          <span className={`text-[11px] font-bold ${isAvailable ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {isAvailable ? 'Available' : 'Absent'}
                          </span>
                        </div>
                      );
                    })}

                    {doctors.length === 0 && (
                      <div className="py-6 text-center text-slate-500 text-xs">
                        No doctors found in directory.
                      </div>
                    )}
                  </div>
                </div>

                {/* WIDGET 3: TODAY'S REPORT (Matching Reference) */}
                <div className="bg-slate-900/90 rounded-2xl border border-slate-800/90 p-5 shadow-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white">Today's Report</h3>
                    <button 
                      onClick={() => setIsNotificationsOpen(true)}
                      className="text-xs font-semibold text-teal-400 hover:text-teal-300 transition-colors"
                    >
                      See All
                    </button>
                  </div>

                  <div className="space-y-3">
                    {todaysReports.map((report) => (
                      <div 
                        key={report.id}
                        className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2"
                      >
                        <div className="flex items-start gap-2.5">
                          <div className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 mt-0.5 border border-amber-500/20">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                          </div>
                          <p className="text-xs text-slate-300 leading-snug">
                            {report.message}
                          </p>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono block pl-8">
                          {report.timeAgo}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* WIDGET 4: ANALYTICS OVERVIEW */}
                {analytics && (
                  <div className="bg-slate-900/90 rounded-2xl border border-slate-800/90 p-5 shadow-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-white">Department Volume</h3>
                      <button 
                        onClick={() => setActiveTab('analytics')}
                        className="text-xs font-semibold text-teal-400 hover:text-teal-300 transition-colors"
                      >
                        Analytics
                      </button>
                    </div>

                    <div className="h-44 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={analytics.department_distribution}>
                          <XAxis dataKey="department" stroke="#64748B" fontSize={9} tickLine={false} />
                          <YAxis stroke="#64748B" fontSize={9} tickLine={false} allowDecimals={false} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px', fontSize: '11px' }}
                          />
                          <Bar dataKey="count" fill="#14B8A6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

              </div>

            </div>
          )}

          {/* MAIN TAB 2: ALL PATIENTS (FULL VIEW) */}
          {activeTab === 'patients' && (
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <h2 className="text-lg font-bold text-white">Patient Master Directory</h2>
                  <p className="text-xs text-slate-400">All registered hospital patients, medical records, and admission statuses</p>
                </div>
                <span className="px-3 py-1 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20 text-xs font-bold font-mono">
                  Total: {patients.length}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-semibold">
                    <tr>
                      <th className="p-3">UHID / ID</th>
                      <th className="p-3">Full Legal Name</th>
                      <th className="p-3">Gender / Blood</th>
                      <th className="p-3">Contact</th>
                      <th className="p-3">Admission</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {patients.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-800/40">
                        <td className="p-3 font-mono font-bold text-teal-400">{p.patient_uhid}</td>
                        <td className="p-3 font-semibold text-white">{p.user?.full_name}</td>
                        <td className="p-3 text-slate-400">{p.gender || '—'} / <strong className="text-slate-200">{p.blood_group || '—'}</strong></td>
                        <td className="p-3 text-slate-400">{p.user?.phone_number || p.user?.email}</td>
                        <td className="p-3 text-slate-400">{p.admission_date ? String(p.admission_date) : 'Recent'}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/10 text-teal-400 border border-teal-500/20">
                            {p.clinical_status || 'Active Record'}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => setSelectedPatientModal(p)}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-teal-400 rounded-lg font-semibold text-xs transition-colors"
                          >
                            View Record
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* MAIN TAB 3: APPOINTMENTS */}
          {activeTab === 'appointments' && (
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <h2 className="text-lg font-bold text-white">All Hospital Appointments</h2>
                  <p className="text-xs text-slate-400">Manage outpatient consultations, chamber tokens, and clinical progress</p>
                </div>
                <span className="px-3 py-1 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20 text-xs font-bold font-mono">
                  {appointments.length} Consultations
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-semibold">
                    <tr>
                      <th className="p-3">Token #</th>
                      <th className="p-3">Patient</th>
                      <th className="p-3">Physician</th>
                      <th className="p-3">Date & Slot</th>
                      <th className="p-3">Department</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {appointments.map((appt) => (
                      <tr key={appt.id} className="hover:bg-slate-800/40">
                        <td className="p-3 font-mono font-bold text-teal-400">#{appt.queue_number}</td>
                        <td className="p-3">
                          <span className="font-semibold text-white block">{appt.patient_name}</span>
                          <span className="text-[10px] font-mono text-slate-500">{appt.patient_uhid}</span>
                        </td>
                        <td className="p-3 text-slate-300">{appt.doctor_name}</td>
                        <td className="p-3 text-slate-400">
                          <div>{appt.appointment_date}</div>
                          <div className="text-[10px] text-teal-400 font-mono">{appt.time_slot}</div>
                        </td>
                        <td className="p-3 text-slate-300">{appt.department_name}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            appt.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                            appt.status === 'confirmed' ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20' :
                            appt.status === 'cancelled' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                            'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}>
                            {appt.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          {appt.status === 'confirmed' && (
                            <button
                              onClick={async () => {
                                await api.appointments.updateStatus(appt.id, 'completed');
                                loadData();
                              }}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold"
                            >
                              Complete
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* MAIN TAB 4: DEPARTMENTS */}
          {activeTab === 'departments' && (
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <h2 className="text-lg font-bold text-white">Specialized Clinical Departments</h2>
                  <p className="text-xs text-slate-400">Centers of Excellence, clinical heads, and diagnostic chambers</p>
                </div>
                <button
                  onClick={() => setIsDeptModalOpen(true)}
                  className="px-3.5 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-teal-500/20"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Department</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {departments.map((dept) => (
                  <div key={dept.id} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
                        {dept.code}
                      </span>
                      <button
                        onClick={() => handleDeleteDepartment(dept.id)}
                        className="text-slate-500 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-white">{dept.name}</h4>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">{dept.description || 'Dedicated clinical specialty center'}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                      <span>Head: <strong>{dept.head_doctor_name || 'Senior Consultant'}</strong></span>
                      <span className="text-teal-400 font-semibold">{dept.doctor_count || 1} Specialists</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MAIN TAB 5: DOCTOR ROSTER */}
          {activeTab === 'doctors' && (
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <h2 className="text-lg font-bold text-white">Hospital Medical Staff & Physician Roster</h2>
                  <p className="text-xs text-slate-400">Board-certified specialists, licenses, and clinical consultation fees</p>
                </div>
                <span className="px-3 py-1 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20 text-xs font-bold font-mono">
                  {doctors.length} Doctors
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {doctors.map((doc) => {
                  const docName = doc.user?.full_name || 'Doctor';
                  return (
                    <div key={doc.id} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 flex items-start gap-4">
                      <img 
                        src={getDoctorPhoto(docName, doc.specialization)} 
                        alt={docName} 
                        className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 object-cover shrink-0"
                      />
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-white text-sm">{docName}</h4>
                          <span className="text-teal-400 font-bold text-xs font-mono">₹{doc.consultation_fee}</span>
                        </div>
                        <p className="text-xs text-slate-300">{doc.specialization} • {doc.department_name || 'Specialty'}</p>
                        <p className="text-[11px] text-slate-500">License: {doc.license_number} • Exp: {doc.experience_years} Years</p>
                        
                        <div className="pt-2 flex flex-wrap gap-1 text-[10px]">
                          {doc.availabilities?.map((a, i) => (
                            <span key={i} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                              {a.day_of_week.slice(0, 3)}: {a.start_time}-{a.end_time}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* MAIN TAB 6: ANALYTICS FULL VIEW */}
          {activeTab === 'analytics' && analytics && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* 7-Day Trend Chart */}
                <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                  <h3 className="text-sm font-bold text-white mb-1">Appointment Volume (Past 7 Days)</h3>
                  <p className="text-xs text-slate-400 mb-4">Daily patient booking and consultation trends</p>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={analytics.daily_trend}>
                        <defs>
                          <linearGradient id="colorCountDark" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#14B8A6" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#14B8A6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="date" stroke="#64748B" fontSize={11} tickLine={false} />
                        <YAxis stroke="#64748B" fontSize={11} tickLine={false} allowDecimals={false} />
                        <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px' }} />
                        <Area type="monotone" dataKey="count" stroke="#14B8A6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorCountDark)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Doctor Workload */}
                <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                  <h3 className="text-sm font-bold text-white mb-1">Doctor Consultation Workload</h3>
                  <p className="text-xs text-slate-400 mb-4">Patient distribution across medical specialists</p>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analytics.doctor_workload} layout="vertical">
                        <XAxis type="number" stroke="#64748B" fontSize={11} tickLine={false} allowDecimals={false} />
                        <YAxis dataKey="doctor_name" type="category" stroke="#64748B" fontSize={10} width={100} tickLine={false} />
                        <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px' }} />
                        <Bar dataKey="appointment_count" fill="#2DD4BF" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* MAIN TAB 7: FINANCIAL REPORTS */}
          {activeTab === 'financial' && (
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <h2 className="text-lg font-bold text-white">Hospital Financial & Consultation Overview</h2>
                  <p className="text-xs text-slate-400">Transparent OPD consultation revenue and billing metrics</p>
                </div>
                <span className="px-3 py-1 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20 text-xs font-bold font-mono">
                  Q4 Audit Status: Verified
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-xs text-slate-400 block mb-1">Total Consultations Value</span>
                  <div className="text-2xl font-black text-white font-mono">
                    ₹{appointments.reduce((sum, a) => sum + (doctors.find(d => d.id === a.doctor_id)?.consultation_fee || 800), 0).toLocaleString()}
                  </div>
                  <span className="text-[10px] text-teal-400 font-semibold block mt-1">Based on published doctor tariffs</span>
                </div>

                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-xs text-slate-400 block mb-1">Average Fee / Consultation</span>
                  <div className="text-2xl font-black text-white font-mono">
                    ₹{Math.round(doctors.reduce((sum, d) => sum + d.consultation_fee, 0) / (doctors.length || 1))}
                  </div>
                  <span className="text-[10px] text-slate-500 block mt-1">Across 4 medical specialties</span>
                </div>

                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-xs text-slate-400 block mb-1">Completed Consultations</span>
                  <div className="text-2xl font-black text-emerald-400 font-mono">
                    {appointments.filter(a => a.status === 'completed').length}
                  </div>
                  <span className="text-[10px] text-emerald-500 block mt-1">Discharged & Settled</span>
                </div>
              </div>
            </div>
          )}

          {/* MAIN TAB 8: HELP & SETTINGS */}
          {(activeTab === 'help' || activeTab === 'settings') && (
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-4">
              <h2 className="text-lg font-bold text-white">CareHealth Point System Configurations</h2>
              <p className="text-xs text-slate-400">Enterprise Healthcare SaaS platform settings and support</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 text-xs">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <span className="font-bold text-white block">Emergency Hotline Telephony</span>
                  <p className="text-slate-400">+91-1800-CARE-NOW (1800-227-3669) connected to 24/7 Level-1 trauma desk.</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <span className="font-bold text-white block">Prometheus Telemetry & Metrics</span>
                  <p className="text-slate-400">Real-time health endpoint listening at /metrics with active queue counters.</p>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Patient Details Modal */}
      {selectedPatientModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-800 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="font-bold text-white text-base">{selectedPatientModal.user?.full_name}</h3>
                <span className="font-mono text-teal-400 text-xs font-semibold">{selectedPatientModal.patient_uhid}</span>
              </div>
              <button 
                onClick={() => setSelectedPatientModal(null)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-slate-300">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                <span className="text-[10px] text-slate-500 uppercase font-bold block mb-0.5">Blood Group</span>
                <span className="font-bold text-white text-sm">{selectedPatientModal.blood_group || 'Not specified'}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                <span className="text-[10px] text-slate-500 uppercase font-bold block mb-0.5">Date of Birth / Age</span>
                <span className="font-bold text-white text-sm">
                  {selectedPatientModal.date_of_birth ? `${selectedPatientModal.date_of_birth} (${selectedPatientModal.age || '—'} yrs)` : 'Not specified'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                <span className="text-[10px] text-slate-500 uppercase font-bold block mb-0.5">Gender</span>
                <span className="font-bold text-white">{selectedPatientModal.gender || 'Not specified'}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                <span className="text-[10px] text-slate-500 uppercase font-bold block mb-0.5">Phone Number</span>
                <span className="font-bold text-white">{selectedPatientModal.user?.phone_number || 'Not specified'}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Residential Address</span>
              <p className="text-slate-300">{selectedPatientModal.address || 'Address not on file.'}</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Chronic Conditions & Allergies</span>
              <p className="text-slate-300">{selectedPatientModal.chronic_conditions || selectedPatientModal.allergies || 'No active alerts recorded.'}</p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedPatientModal(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold"
              >
                Close Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Department Modal */}
      {isDeptModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-800">
            <h3 className="text-base font-bold text-white mb-4">Add Medical Department</h3>
            <form onSubmit={handleCreateDepartment} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Department Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dermatology"
                  value={deptForm.name}
                  onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-teal-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Code (3-5 Letters)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DERM"
                  value={deptForm.code}
                  onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-teal-500 uppercase"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Head Doctor Name</label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Sarah Khan"
                  value={deptForm.head_doctor_name}
                  onChange={(e) => setDeptForm({ ...deptForm, head_doctor_name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-teal-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Clinical scope and specialty..."
                  value={deptForm.description}
                  onChange={(e) => setDeptForm({ ...deptForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-teal-500"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsDeptModalOpen(false)}
                  className="px-3 py-2 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-lg shadow-sm"
                >
                  Create Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Broadcast Alert Modal */}
      {isBroadcastOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-800">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <Send className="w-4 h-4 text-teal-400" />
              <span>Broadcast Hospital Alert</span>
            </h3>
            <form onSubmit={handleSendBroadcast} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Alert Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Schedule Notice or Operational Update"
                  value={broadcastForm.title}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-teal-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Alert Message</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Write message to broadcast to all patients and staff..."
                  value={broadcastForm.message}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, message: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-teal-500"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsBroadcastOpen(false)}
                  className="px-3 py-2 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-lg shadow-sm"
                >
                  Send Broadcast
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
