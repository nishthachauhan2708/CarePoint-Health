import React, { useState, useEffect } from 'react';
import { 
  UserCheck, Users, CalendarCheck, Clock, Plus, 
  Search, CheckCircle, AlertCircle, Phone, Stethoscope 
} from 'lucide-react';
import { api } from '../../services/api';
import { Appointment, Doctor, Department, Patient } from '../../types';
import { Sidebar } from '../../components/common/Sidebar';

export const ReceptionistDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('checkin');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  // Walk-in Registration Form State
  const [walkinName, setWalkinName] = useState('');
  const [walkinEmail, setWalkinEmail] = useState('');
  const [walkinPhone, setWalkinPhone] = useState('');
  const [walkinSuccess, setWalkinSuccess] = useState<string | null>(null);

  // Staff Booking State
  const [selectedPatId, setSelectedPatId] = useState<number | null>(null);
  const [selectedDocId, setSelectedDocId] = useState<number | null>(null);
  const [selectedDeptId, setSelectedDeptId] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedSlot, setSelectedSlot] = useState<string>('09:30 - 10:00');
  const [bookSuccess, setBookSuccess] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [apptsData, docsData, deptsData, patsData] = await Promise.all([
        api.appointments.getAll(),
        api.doctors.getAll(),
        api.departments.getAll(),
        api.patients.getAll()
      ]);
      setAppointments(apptsData);
      setDoctors(docsData);
      setDepartments(deptsData);
      setPatients(patsData);
    } catch (err) {
      console.error("Failed to load receptionist data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStatusChange = async (apptId: number, newStatus: any) => {
    try {
      await api.appointments.updateStatus(apptId, newStatus);
      loadData();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const handleRegisterWalkin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.auth.register({
        full_name: walkinName,
        email: walkinEmail,
        password: "Patient@123", // Default secure demo password
        phone_number: walkinPhone,
        role: "patient"
      });
      setWalkinSuccess(`Patient ${walkinName} registered successfully! New patient record and UHID generated.`);
      setWalkinName('');
      setWalkinEmail('');
      setWalkinPhone('');
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Walk-in registration failed");
    }
  };

  const handleStaffBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatId || !selectedDocId || !selectedDeptId) {
      alert("Please select Patient, Department and Doctor");
      return;
    }

    try {
      const appt = await api.appointments.book({
        patient_id: selectedPatId,
        doctor_id: selectedDocId,
        department_id: selectedDeptId,
        appointment_date: selectedDate,
        time_slot: selectedSlot,
        symptoms: "Walk-in front desk booking"
      });
      setBookSuccess(`Appointment #${appt.id} booked. Assigned Queue Token: #${appt.queue_number}`);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Booking failed");
    }
  };

  return (
    <div className="flex bg-slate-50 min-h-[calc(100vh-4rem)]">
      <Sidebar currentTab={activeTab} onTabChange={setActiveTab} />

      <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-6">

          {/* Top Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Front Desk & Reception Management</h1>
              <p className="text-xs text-slate-500 mt-0.5">Patient check-in, walk-in onboarding, token assignment & doctor availability</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('walkin')}
                className="px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Register Walk-in</span>
              </button>
            </div>
          </div>

          {/* TAB 1: DESK CHECK-IN & QUEUE BOARD */}
          {activeTab === 'checkin' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Today's Patient Arrival Desk</h3>
                  <p className="text-xs text-slate-500">Mark patient as arrived to assign active queue token number</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-teal-50 text-teal-800 border border-teal-200">
                    {appointments.filter(a => a.status === 'confirmed').length} In Waiting Queue
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Queue Token</th>
                      <th className="p-3">Patient Name</th>
                      <th className="p-3">UHID</th>
                      <th className="p-3">Assigned Doctor</th>
                      <th className="p-3">Time Slot</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Desk Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {appointments.map((appt) => (
                      <tr key={appt.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 font-mono font-bold text-teal-700 text-sm">
                          #{appt.queue_number}
                        </td>
                        <td className="p-3 font-semibold text-slate-900">{appt.patient_name}</td>
                        <td className="p-3 font-mono text-slate-500">{appt.patient_uhid}</td>
                        <td className="p-3 text-slate-800">{appt.doctor_name}</td>
                        <td className="p-3 text-slate-600">{appt.time_slot}</td>
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
                        <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                          {appt.status === 'pending' && (
                            <button
                              onClick={() => handleStatusChange(appt.id, 'confirmed')}
                              className="px-2.5 py-1 text-[11px] font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-md shadow-sm"
                            >
                              Check-in Patient
                            </button>
                          )}
                          {appt.status === 'confirmed' && (
                            <button
                              onClick={() => handleStatusChange(appt.id, 'completed')}
                              className="px-2.5 py-1 text-[11px] font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-md"
                            >
                              Mark Completed
                            </button>
                          )}
                          {appt.status !== 'cancelled' && (
                            <button
                              onClick={() => handleStatusChange(appt.id, 'cancelled')}
                              className="px-2 py-1 text-[11px] font-semibold text-rose-600 hover:bg-rose-50 rounded"
                            >
                              Cancel
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

          {/* TAB 2: REGISTER WALK-IN PATIENT */}
          {activeTab === 'walkin' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm max-w-xl mx-auto space-y-4">
              <h3 className="text-base font-bold text-slate-900">Walk-in Patient Instant Onboarding</h3>
              <p className="text-xs text-slate-500">Automatically creates User account, Patient profile, and assigns unique UHID</p>

              {walkinSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>{walkinSuccess}</span>
                </div>
              )}

              <form onSubmit={handleRegisterWalkin} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar"
                    value={walkinName}
                    onChange={(e) => setWalkinName(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="ramesh@example.com"
                    value={walkinEmail}
                    onChange={(e) => setWalkinEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91-9876543210"
                    value={walkinPhone}
                    onChange={(e) => setWalkinPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-sm"
                  >
                    Generate Patient Record & UHID
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: BOOK FOR PATIENT */}
          {activeTab === 'book' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm max-w-xl mx-auto space-y-4">
              <h3 className="text-base font-bold text-slate-900">Book Appointment for Walk-in Patient</h3>
              
              {bookSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>{bookSuccess}</span>
                </div>
              )}

              <form onSubmit={handleStaffBook} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Select Registered Patient</label>
                  <select
                    value={selectedPatId || ''}
                    onChange={(e) => setSelectedPatId(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    <option value="">-- Choose Patient --</option>
                    {patients.map((p) => (
                      <option key={p.id} value={p.id}>{p.user?.full_name} ({p.patient_uhid})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department</label>
                  <select
                    value={selectedDeptId || ''}
                    onChange={(e) => setSelectedDeptId(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    <option value="">-- Choose Department --</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Doctor Specialist</label>
                  <select
                    value={selectedDocId || ''}
                    onChange={(e) => setSelectedDocId(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    <option value="">-- Choose Doctor --</option>
                    {doctors
                      .filter(d => selectedDeptId ? d.department_id === selectedDeptId : true)
                      .map((d) => (
                        <option key={d.id} value={d.id}>{d.user?.full_name} – {d.specialization}</option>
                      ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Date</label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Slot</label>
                    <select
                      value={selectedSlot}
                      onChange={(e) => setSelectedSlot(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                    >
                      <option value="09:00 - 09:30">09:00 - 09:30</option>
                      <option value="09:30 - 10:00">09:30 - 10:00</option>
                      <option value="10:00 - 10:30">10:00 - 10:30</option>
                      <option value="11:30 - 12:00">11:30 - 12:00</option>
                      <option value="14:00 - 14:30">14:00 - 14:30</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold"
                  >
                    Book Walk-in Slot & Print Token
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 4: DOCTOR AVAILABILITY ROSTER */}
          {activeTab === 'roster' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100">
                <h3 className="font-bold text-slate-900 text-sm">Doctor Availability & Weekly OPD Roster</h3>
                <p className="text-xs text-slate-500">Live active schedules and consulting hours</p>
              </div>

              <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {doctors.map((doc) => (
                  <div key={doc.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-sm">{doc.user?.full_name}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">Available</span>
                    </div>
                    <p className="text-teal-700 font-medium">{doc.specialization} ({doc.department_name})</p>
                    <div className="pt-2 border-t border-slate-200 space-y-1 text-slate-600">
                      <div>Consulting Days: <strong>Mon – Fri</strong></div>
                      <div>OPD Timings: <strong>09:00 AM – 05:00 PM</strong></div>
                      <div>Consultation Fee: <strong>₹{doc.consultation_fee}</strong></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};
