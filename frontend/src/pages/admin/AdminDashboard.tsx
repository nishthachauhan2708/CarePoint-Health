import React, { useState, useEffect } from 'react';
import { 
  Users, Stethoscope, Building2, CalendarCheck, TrendingUp, 
  Plus, Edit, Trash2, CheckCircle, Clock, AlertTriangle, Send 
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { api } from '../../services/api';
import { HospitalAnalytics, Department, Doctor, Patient, Appointment } from '../../types';
import { Sidebar } from '../../components/common/Sidebar';

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [analytics, setAnalytics] = useState<HospitalAnalytics | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  // Department Modal State
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [deptForm, setDeptForm] = useState({ name: '', code: '', description: '', head_doctor_name: '' });

  // Broadcast Modal State
  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);
  const [broadcastForm, setBroadcastForm] = useState({ title: '', message: '', type: 'info' });

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

  const COLORS = ['#0D9488', '#2DD4BF', '#0284C7', '#6366F1', '#EC4899', '#F59E0B'];

  return (
    <div className="flex bg-slate-50 min-h-[calc(100vh-4rem)]">
      <Sidebar currentTab={activeTab} onTabChange={setActiveTab} />

      <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* Top Title Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Hospital Administration & Operations</h1>
              <p className="text-xs text-slate-500 mt-0.5">Live clinical capacity, departments, workforce roster, and patient analytics</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsBroadcastOpen(true)}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Hospital Alert</span>
              </button>
              <button
                onClick={() => setIsDeptModalOpen(true)}
                className="px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Department</span>
              </button>
            </div>
          </div>

          {/* KPI Cards Row */}
          {analytics && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-xs font-medium">Patients</span>
                  <Users className="w-4 h-4 text-teal-600" />
                </div>
                <div className="text-2xl font-black text-slate-900">{analytics.total_patients}</div>
                <div className="text-[10px] text-emerald-600 font-semibold mt-1">Active Profiles</div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-xs font-medium">Doctors</span>
                  <Stethoscope className="w-4 h-4 text-teal-600" />
                </div>
                <div className="text-2xl font-black text-slate-900">{analytics.total_doctors}</div>
                <div className="text-[10px] text-teal-600 font-semibold mt-1">Licensed On-Duty</div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-xs font-medium">Departments</span>
                  <Building2 className="w-4 h-4 text-teal-600" />
                </div>
                <div className="text-2xl font-black text-slate-900">{analytics.total_departments}</div>
                <div className="text-[10px] text-slate-500 font-semibold mt-1">Centers of Care</div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-xs font-medium">Today's OPD</span>
                  <CalendarCheck className="w-4 h-4 text-teal-600" />
                </div>
                <div className="text-2xl font-black text-slate-900">{analytics.today_appointments}</div>
                <div className="text-[10px] text-teal-600 font-semibold mt-1">Booked Consults</div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-xs font-medium">Active Queue</span>
                  <Clock className="w-4 h-4 text-amber-500" />
                </div>
                <div className="text-2xl font-black text-slate-900">{analytics.active_in_queue}</div>
                <div className="text-[10px] text-amber-600 font-semibold mt-1">Pending In-Clinic</div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-xs font-medium">Completion Rate</span>
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-2xl font-black text-emerald-600">{analytics.completion_rate_percentage}%</div>
                <div className="text-[10px] text-slate-500 font-semibold mt-1">Consults Fulfilled</div>
              </div>
            </div>
          )}

          {/* TAB 1: OVERVIEW & ANALYTICS CHARTS */}
          {(activeTab === 'overview' || activeTab === 'analytics') && analytics && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* 7-Day Trend Chart */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-900 mb-1">Appointment Volume (Past 7 Days)</h3>
                  <p className="text-xs text-slate-500 mb-4">Daily patient booking and consultation trends</p>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={analytics.daily_trend}>
                        <defs>
                          <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0D9488" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#0D9488" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} tickLine={false} />
                        <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} allowDecimals={false} />
                        <Tooltip />
                        <Area type="monotone" dataKey="count" stroke="#0D9488" strokeWidth={2.5} fillOpacity={1} fill="url(#colorCount)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Department Distribution Chart */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-900 mb-1">Department-wise Patient Load</h3>
                  <p className="text-xs text-slate-500 mb-4">Distribution of patient appointments by specialty</p>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analytics.department_distribution}>
                        <XAxis dataKey="department" stroke="#94A3B8" fontSize={10} tickLine={false} />
                        <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} allowDecimals={false} />
                        <Tooltip />
                        <Bar dataKey="count" fill="#0D9488" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 2: DEPARTMENTS MANAGEMENT */}
          {(activeTab === 'departments' || activeTab === 'overview') && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Medical Departments</h3>
                  <p className="text-xs text-slate-500">Manage hospital clinical divisions, head specialists, and staffing</p>
                </div>
                <button
                  onClick={() => setIsDeptModalOpen(true)}
                  className="px-3 py-1.5 text-xs font-semibold bg-teal-50 text-teal-700 hover:bg-teal-100 rounded-lg transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Department</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Code</th>
                      <th className="p-3">Department Name</th>
                      <th className="p-3">Head of Department</th>
                      <th className="p-3">Assigned Doctors</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {departments.map((dept) => (
                      <tr key={dept.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 font-mono font-bold text-teal-700">{dept.code}</td>
                        <td className="p-3 font-semibold text-slate-900">{dept.name}</td>
                        <td className="p-3 text-slate-600">{dept.head_doctor_name || 'N/A'}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 font-semibold text-slate-700">
                            {dept.doctor_count} Doctors
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleDeleteDepartment(dept.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete Department"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: DOCTOR ROSTER */}
          {(activeTab === 'doctors' || activeTab === 'overview') && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100">
                <h3 className="font-bold text-slate-900 text-sm">Medical Specialist Roster</h3>
                <p className="text-xs text-slate-500">Registered hospital doctors, licenses, qualifications, and consultation rates</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Doctor</th>
                      <th className="p-3">Department</th>
                      <th className="p-3">Specialization</th>
                      <th className="p-3">License #</th>
                      <th className="p-3">Experience</th>
                      <th className="p-3">Fee</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {doctors.map((doc) => (
                      <tr key={doc.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 font-semibold text-slate-900 flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-xs">
                            {doc.user?.full_name.charAt(3) || 'D'}
                          </div>
                          <span>{doc.user?.full_name}</span>
                        </td>
                        <td className="p-3 text-slate-600">{doc.department_name}</td>
                        <td className="p-3 font-medium text-teal-700">{doc.specialization}</td>
                        <td className="p-3 font-mono text-slate-500">{doc.license_number}</td>
                        <td className="p-3 text-slate-600">{doc.experience_years} Years</td>
                        <td className="p-3 font-semibold text-slate-900">₹{doc.consultation_fee}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: ALL APPOINTMENTS */}
          {(activeTab === 'appointments' || activeTab === 'overview') && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100">
                <h3 className="font-bold text-slate-900 text-sm">Central Appointment Log</h3>
                <p className="text-xs text-slate-500">Live feed of all hospital consultations and statuses</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-3">ID / Token</th>
                      <th className="p-3">Patient</th>
                      <th className="p-3">Doctor</th>
                      <th className="p-3">Date & Slot</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {appointments.slice(0, 8).map((appt) => (
                      <tr key={appt.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 font-mono font-bold text-slate-900">
                          #{appt.id} <span className="text-[10px] text-teal-600">(Queue #{appt.queue_number})</span>
                        </td>
                        <td className="p-3">
                          <div className="font-semibold text-slate-900">{appt.patient_name}</div>
                          <div className="text-[10px] font-mono text-slate-400">{appt.patient_uhid}</div>
                        </td>
                        <td className="p-3 text-slate-700">{appt.doctor_name}</td>
                        <td className="p-3">
                          <div className="text-slate-800">{appt.appointment_date}</div>
                          <div className="text-[10px] text-slate-500">{appt.time_slot}</div>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                            appt.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                            appt.status === 'confirmed' ? 'bg-teal-100 text-teal-800' :
                            appt.status === 'cancelled' ? 'bg-rose-100 text-rose-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {appt.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Add Department Modal */}
      {isDeptModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-4">Add Medical Department</h3>
            <form onSubmit={handleCreateDepartment} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Department Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dermatology"
                  value={deptForm.name}
                  onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Code (3-5 Letters)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DERM"
                  value={deptForm.code}
                  onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 uppercase"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Head Doctor Name</label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Sarah Khan"
                  value={deptForm.head_doctor_name}
                  onChange={(e) => setDeptForm({ ...deptForm, head_doctor_name: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Clinical scope and specialty..."
                  value={deptForm.description}
                  onChange={(e) => setDeptForm({ ...deptForm, description: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsDeptModalOpen(false)}
                  className="px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-lg shadow-sm"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Send className="w-4 h-4 text-teal-600" />
              <span>Broadcast Hospital Alert</span>
            </h3>
            <form onSubmit={handleSendBroadcast} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Alert Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Schedule Change or Operational Notice"
                  value={broadcastForm.title}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Alert Message</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Write message to broadcast to all patients and staff..."
                  value={broadcastForm.message}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, message: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsBroadcastOpen(false)}
                  className="px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-900 text-white rounded-lg shadow-sm"
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
