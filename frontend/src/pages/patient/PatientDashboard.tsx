import React, { useState, useEffect } from 'react';
import { 
  CreditCard, Calendar, Clock, FileText, CheckCircle, 
  AlertCircle, ChevronRight, User, Stethoscope, Building2, 
  X, Phone, Heart, Activity, ArrowRight, ShieldCheck, Download
} from 'lucide-react';
import { api } from '../../services/api';
import { 
  Appointment, Department, Doctor, DigitalHealthCard, 
  Prescription, QueueStatus 
} from '../../types';
import { Sidebar } from '../../components/common/Sidebar';
import { useAuth } from '../../context/AuthContext';

export const PatientDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [healthCard, setHealthCard] = useState<DigitalHealthCard | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [activeQueue, setActiveQueue] = useState<QueueStatus | null>(null);
  const [loading, setLoading] = useState(true);

  // Booking Wizard States
  const [departments, setDepartments] = useState<Department[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDeptId, setSelectedDeptId] = useState<number | null>(null);
  const [selectedDoctorId, setSelectedDoctorId] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [availableSlots, setAvailableSlots] = useState<{ slot: string; is_booked: boolean }[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [symptoms, setSymptoms] = useState<string>('');
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingStep, setBookingStep] = useState<number>(1);

  // Selected Prescription for viewing modal
  const [viewPrescription, setViewPrescription] = useState<Prescription | null>(null);

  const loadData = async () => {
    try {
      const [apptsData, deptsData, docsData] = await Promise.all([
        api.appointments.getAll(),
        api.departments.getAll(),
        api.doctors.getAll()
      ]);
      setAppointments(apptsData);
      setDepartments(deptsData);
      setDoctors(docsData);

      // Find first active appointment to load live queue status
      const activeAppt = apptsData.find(a => a.status === 'confirmed' || a.status === 'pending');
      if (activeAppt) {
        try {
          const queueData = await api.appointments.getQueueStatus(activeAppt.id);
          setActiveQueue(queueData);
        } catch (e) {
          console.error("Queue load error:", e);
        }
      }

      // Load patient health card
      try {
        const myProfile = await api.patients.getMyProfile();
        if (myProfile && myProfile.id) {
          const cardData = await api.patients.getHealthCard(myProfile.id);
          setHealthCard(cardData);
          const prescData = await api.prescriptions.getByPatient(myProfile.id);
          setPrescriptions(prescData);
        }
      } catch (err) {
        console.warn("Could not load health card:", err);
      }

    } catch (err) {
      console.error("Failed to load patient data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // When doctor and date are chosen, fetch slots
  useEffect(() => {
    const fetchSlots = async () => {
      if (selectedDoctorId && selectedDate) {
        try {
          const res = await api.doctors.getSlots(selectedDoctorId, selectedDate);
          setAvailableSlots(res.slots);
          setSelectedSlot(null);
        } catch (e) {
          console.error("Error fetching slots:", e);
        }
      }
    };
    fetchSlots();
  }, [selectedDoctorId, selectedDate]);

  const handleConfirmBooking = async () => {
    if (!selectedDoctorId || !selectedDeptId || !selectedDate || !selectedSlot) {
      setBookingError("Please complete all steps to book your slot.");
      return;
    }

    setBookingError(null);
    try {
      const appt = await api.appointments.book({
        doctor_id: selectedDoctorId,
        department_id: selectedDeptId,
        appointment_date: selectedDate,
        time_slot: selectedSlot,
        symptoms: symptoms
      });

      setBookingSuccess(`Appointment #${appt.id} successfully booked! Your token number is #${appt.queue_number}.`);
      setBookingStep(1);
      setSelectedDoctorId(null);
      setSelectedSlot(null);
      setSymptoms('');
      loadData();
    } catch (err: any) {
      setBookingError(err.response?.data?.detail || "Booking failed. Please try another time slot.");
    }
  };

  const handleCancelAppointment = async (apptId: number) => {
    if (window.confirm("Are you sure you want to cancel this appointment?")) {
      try {
        await api.appointments.updateStatus(apptId, 'cancelled');
        loadData();
      } catch (err: any) {
        alert(err.response?.data?.detail || "Failed to cancel appointment");
      }
    }
  };

  return (
    <div className="flex bg-slate-50 min-h-[calc(100vh-4rem)]">
      <Sidebar currentTab={activeTab} onTabChange={setActiveTab} />

      <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-6">

          {/* Title Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Patient Health Portal</h1>
              <p className="text-xs text-slate-500 mt-0.5">Welcome, {user?.full_name}. Book appointments, monitor queue position & view prescriptions</p>
            </div>
            <button
              onClick={() => setActiveTab('book')}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Book New Appointment</span>
            </button>
          </div>

          {/* TAB 1: OVERVIEW & CARDS */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* Top Row: Digital Health Card & Live Queue Monitor */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Digital Health Card Widget (Part 2, 8.D) */}
                <div className="lg:col-span-6 bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
                  <div className="absolute top-0 right-0 -mr-8 -mt-8 w-36 h-36 rounded-full bg-teal-500/10 blur-2xl pointer-events-none"></div>

                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-slate-700/60 mb-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-7 h-7 rounded-lg bg-teal-500 flex items-center justify-center font-bold text-white text-xs">
                          <Activity className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-sm tracking-wide">CAREHEALTH DIGITAL CARD</span>
                      </div>
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-teal-500/20 text-teal-300 rounded font-bold border border-teal-500/30">
                        VERIFIED UHID
                      </span>
                    </div>

                    <div className="space-y-1 mb-4">
                      <div className="text-[11px] text-slate-400 font-medium">PATIENT NAME</div>
                      <div className="text-xl font-extrabold tracking-tight text-white">{healthCard?.full_name || user?.full_name}</div>
                      <div className="text-xs font-mono text-teal-400 font-bold">{healthCard?.uhid || 'CHP-2026-1001'}</div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-700/50 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Blood Group</span>
                        <span className="font-bold text-white text-sm">{healthCard?.blood_group || 'O+'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Gender / DOB</span>
                        <span className="font-bold text-white text-xs">{healthCard?.gender || 'Male'} ({healthCard?.dob || '1995'})</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Hospital Visits</span>
                        <span className="font-bold text-teal-400 text-sm">{healthCard?.total_visits || appointments.length}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-700/50 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                      <span>Encrypted Clinical ID</span>
                    </span>
                    <span>Emergency: {healthCard?.emergency_phone || '+91-1800-CARE-NOW'}</span>
                  </div>
                </div>

                {/* Live OPD Queue Position Tracker (Part 2, 8.B) */}
                <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                      <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-teal-600" />
                        <h3 className="font-bold text-slate-900 text-sm">Live Appointment Queue Tracker</h3>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800">
                        Real-time Telemetry
                      </span>
                    </div>

                    {activeQueue ? (
                      <div className="space-y-4">
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 gap-4 text-center">
                          <div className="p-2 border-r border-slate-200">
                            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">Your Queue Token</span>
                            <span className="text-3xl font-black text-teal-700 font-mono">#{activeQueue.queue_number}</span>
                          </div>
                          <div className="p-2">
                            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">Currently Serving</span>
                            <span className="text-3xl font-black text-slate-800 font-mono">#{activeQueue.current_serving_number}</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-600 font-medium">Patients Ahead in Queue:</span>
                            <span className="font-bold text-slate-900">{activeQueue.patients_ahead} Patients</span>
                          </div>
                          <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                            <div 
                              className="bg-teal-600 h-full rounded-full transition-all duration-500"
                              style={{ width: `${Math.max(15, 100 - activeQueue.patients_ahead * 20)}%` }}
                            ></div>
                          </div>
                          <div className="flex items-center justify-between text-xs text-slate-500">
                            <span>Doctor: <strong>{activeQueue.doctor_name}</strong></span>
                            <span className="font-semibold text-teal-700">
                              Estimated Wait: ~{activeQueue.estimated_wait_minutes} mins
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-slate-400 space-y-2">
                        <CheckCircle className="w-8 h-8 text-slate-300 mx-auto" />
                        <p className="text-xs">No pending appointments in today's active queue.</p>
                        <button
                          onClick={() => setActiveTab('book')}
                          className="px-3 py-1.5 text-xs font-semibold bg-teal-50 text-teal-700 hover:bg-teal-100 rounded-lg transition-colors"
                        >
                          Book Your Next Slot
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 text-[11px] text-slate-400 border-t border-slate-100 flex items-center gap-1">
                    <Activity className="w-3.5 h-3.5 text-teal-600" />
                    <span>Real-time OPD queue telemetry auto-updates upon doctor consultation completion.</span>
                  </div>
                </div>

              </div>

              {/* My Scheduled Appointments Table */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">My Appointments History</h3>
                    <p className="text-xs text-slate-500">Review scheduled visits, prescriptions, and slot statuses</p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="p-3">Token</th>
                        <th className="p-3">Department</th>
                        <th className="p-3">Specialist Doctor</th>
                        <th className="p-3">Date & Slot</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {appointments.map((appt) => (
                        <tr key={appt.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3 font-mono font-bold text-teal-700">#{appt.queue_number}</td>
                          <td className="p-3 font-medium text-slate-800">{appt.department_name}</td>
                          <td className="p-3 font-semibold text-slate-900">{appt.doctor_name}</td>
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
                          <td className="p-3 text-right space-x-1.5">
                            {appt.status !== 'cancelled' && appt.status !== 'completed' && (
                              <button
                                onClick={() => handleCancelAppointment(appt.id)}
                                className="px-2 py-1 text-[11px] font-semibold text-rose-600 hover:bg-rose-50 rounded transition-colors"
                              >
                                Cancel
                              </button>
                            )}
                            {appt.status === 'completed' && (
                              <button
                                onClick={async () => {
                                  try {
                                    const rx = await api.prescriptions.getByAppointment(appt.id);
                                    setViewPrescription(rx);
                                  } catch (e) {
                                    alert("Prescription pending generation by doctor");
                                  }
                                }}
                                className="px-2.5 py-1 text-[11px] font-semibold bg-teal-50 text-teal-700 hover:bg-teal-100 rounded transition-colors"
                              >
                                View Rx
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                      {appointments.length === 0 && (
                        <tr>
                          <td colSpan={6} className="text-center py-8 text-slate-400">
                            No appointment records found. Book your first consultation above!
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: SMART APPOINTMENT BOOKING WIZARD */}
          {activeTab === 'book' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm max-w-3xl mx-auto space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Smart Consultation Booking Wizard</h3>
                <p className="text-xs text-slate-500">Select department, specialist doctor, date, and verified time slot</p>
              </div>

              {bookingSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>{bookingSuccess}</span>
                  </div>
                  <button onClick={() => setBookingSuccess(null)}><X className="w-3.5 h-3.5" /></button>
                </div>
              )}

              {bookingError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                    <span>{bookingError}</span>
                  </div>
                  <button onClick={() => setBookingError(null)}><X className="w-3.5 h-3.5" /></button>
                </div>
              )}

              {/* Step Progress */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 text-xs font-semibold text-slate-400">
                <span className={bookingStep >= 1 ? 'text-teal-600 font-bold' : ''}>1. Department</span>
                <ChevronRight className="w-3.5 h-3.5" />
                <span className={bookingStep >= 2 ? 'text-teal-600 font-bold' : ''}>2. Doctor</span>
                <ChevronRight className="w-3.5 h-3.5" />
                <span className={bookingStep >= 3 ? 'text-teal-600 font-bold' : ''}>3. Date & Slot</span>
                <ChevronRight className="w-3.5 h-3.5" />
                <span className={bookingStep >= 4 ? 'text-teal-600 font-bold' : ''}>4. Confirm</span>
              </div>

              {/* Step 1: Select Department */}
              {bookingStep === 1 && (
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Choose Specialty Department</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {departments.map((dept) => (
                      <button
                        key={dept.id}
                        type="button"
                        onClick={() => {
                          setSelectedDeptId(dept.id);
                          setBookingStep(2);
                        }}
                        className={`p-4 rounded-xl border text-left transition-all ${
                          selectedDeptId === dept.id
                            ? 'border-teal-600 bg-teal-50/60 shadow-sm'
                            : 'border-slate-200 hover:border-teal-400 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-sm text-slate-900">{dept.name}</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold">{dept.code}</span>
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-1">{dept.description}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2: Select Doctor */}
              {bookingStep === 2 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Choose Doctor Specialist</h4>
                    <button onClick={() => setBookingStep(1)} className="text-xs text-teal-600 font-semibold hover:underline">
                      Back to Departments
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {doctors
                      .filter(d => selectedDeptId ? d.department_id === selectedDeptId : true)
                      .map((doc) => (
                        <button
                          key={doc.id}
                          type="button"
                          onClick={() => {
                            setSelectedDoctorId(doc.id);
                            setBookingStep(3);
                          }}
                          className={`p-4 rounded-xl border text-left transition-all ${
                            selectedDoctorId === doc.id
                              ? 'border-teal-600 bg-teal-50/60 shadow-sm'
                              : 'border-slate-200 hover:border-teal-400 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center space-x-3 mb-2">
                            <div className="w-10 h-10 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-sm">
                              {doc.user?.full_name.charAt(3) || 'D'}
                            </div>
                            <div>
                              <div className="font-bold text-sm text-slate-900">{doc.user?.full_name}</div>
                              <div className="text-xs text-teal-600 font-medium">{doc.specialization}</div>
                            </div>
                          </div>
                          <div className="text-[11px] text-slate-500 space-y-0.5 pt-2 border-t border-slate-100">
                            <div>Experience: <strong>{doc.experience_years} Years</strong></div>
                            <div>Fee: <strong>₹{doc.consultation_fee}</strong></div>
                          </div>
                        </button>
                      ))}
                  </div>
                </div>
              )}

              {/* Step 3: Date & Time Slot */}
              {bookingStep === 3 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Select Date and Time Slot</h4>
                    <button onClick={() => setBookingStep(2)} className="text-xs text-teal-600 font-semibold hover:underline">
                      Back to Doctors
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Appointment Date</label>
                    <input
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 w-full sm:w-60"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-2">Available Slots</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {availableSlots.map((s, idx) => (
                        <button
                          key={idx}
                          type="button"
                          disabled={s.is_booked}
                          onClick={() => setSelectedSlot(s.slot)}
                          className={`py-2 px-3 text-xs rounded-lg border font-semibold transition-all ${
                            s.is_booked 
                              ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed line-through'
                              : selectedSlot === s.slot
                              ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-teal-500 hover:bg-teal-50/50'
                          }`}
                        >
                          {s.slot}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      disabled={!selectedSlot}
                      onClick={() => setBookingStep(4)}
                      className="px-4 py-2 bg-teal-600 text-white rounded-lg text-xs font-semibold hover:bg-teal-700 disabled:opacity-40"
                    >
                      Proceed to Review & Confirm
                    </button>
                  </div>
                </div>
              )}

              {/* Step 4: Review and Confirm Booking */}
              {bookingStep === 4 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Review Booking Details</h4>
                    <button onClick={() => setBookingStep(3)} className="text-xs text-teal-600 font-semibold hover:underline">
                      Back to Slots
                    </button>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Department:</span>
                      <strong className="text-slate-900">{departments.find(d => d.id === selectedDeptId)?.name}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Doctor:</span>
                      <strong className="text-slate-900">{doctors.find(d => d.id === selectedDoctorId)?.user?.full_name}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Date & Slot:</span>
                      <strong className="text-teal-700">{selectedDate} ({selectedSlot})</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Consultation Fee:</span>
                      <strong className="text-slate-900">₹{doctors.find(d => d.id === selectedDoctorId)?.consultation_fee}</strong>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Symptoms / Chief Complaint (Optional)</label>
                    <textarea
                      rows={2}
                      placeholder="Briefly describe your symptoms or reason for visit..."
                      value={symptoms}
                      onChange={(e) => setSymptoms(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleConfirmBooking}
                      className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Confirm & Book Appointment</span>
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 3: DIGITAL HEALTH CARD FULL VIEW */}
          {activeTab === 'healthcard' && healthCard && (
            <div className="max-w-xl mx-auto space-y-4">
              <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 text-white rounded-3xl p-8 shadow-2xl relative overflow-hidden space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-700">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center font-bold text-white shadow-md">
                      <Activity className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-lg font-black tracking-tight text-white">CareHealth Point</span>
                      <p className="text-[10px] text-teal-400 font-mono tracking-widest uppercase">SMART PATIENT HEALTH CARD</p>
                    </div>
                  </div>
                  <div className="px-3 py-1 bg-teal-500/20 text-teal-300 rounded-full text-xs font-mono font-bold border border-teal-500/30">
                    {healthCard.uhid}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase tracking-wider block">Patient Name</span>
                    <span className="text-base font-bold text-white">{healthCard.full_name}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase tracking-wider block">Blood Group</span>
                    <span className="text-base font-bold text-teal-400">{healthCard.blood_group}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase tracking-wider block">Date of Birth</span>
                    <span className="font-semibold text-white">{healthCard.dob}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase tracking-wider block">Gender</span>
                    <span className="font-semibold text-white">{healthCard.gender}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase tracking-wider block">Known Allergies</span>
                    <span className="font-semibold text-rose-300">{healthCard.allergies || 'None'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase tracking-wider block">Emergency Contact</span>
                    <span className="font-semibold text-white">{healthCard.emergency_phone}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-700/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Issued by CareHealth Hospital Network</span>
                  <span className="font-mono text-teal-400">Total Visits: {healthCard.total_visits}</span>
                </div>
              </div>

              <div className="text-center">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 shadow-sm inline-flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download / Print Digital Health Card</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: MY PRESCRIPTIONS VIEW */}
          {activeTab === 'prescriptions' && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <h3 className="font-bold text-slate-900 text-sm mb-1">My Digital Prescriptions</h3>
                <p className="text-xs text-slate-500 mb-4">Official e-prescriptions issued by consulting physicians</p>

                <div className="space-y-4">
                  {prescriptions.map((p) => (
                    <div key={p.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                        <div>
                          <span className="font-bold text-slate-900 text-sm">{p.doctor_name}</span>
                          <span className="text-xs text-slate-500 ml-2">Diagnosis: <strong className="text-teal-700">{p.diagnosis}</strong></span>
                        </div>
                        <span className="text-[11px] font-mono text-slate-400">{p.created_at?.split('T')[0]}</span>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="text-slate-500 border-b border-slate-200">
                            <tr>
                              <th className="py-1">Medication</th>
                              <th className="py-1">Dosage</th>
                              <th className="py-1">Frequency</th>
                              <th className="py-1">Duration</th>
                              <th className="py-1">Instructions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {p.medications.map((m, i) => (
                              <tr key={i}>
                                <td className="py-1.5 font-semibold text-slate-900">{m.medicine_name}</td>
                                <td className="py-1.5 text-slate-600">{m.dosage}</td>
                                <td className="py-1.5 text-slate-600">{m.frequency}</td>
                                <td className="py-1.5 text-slate-600">{m.duration}</td>
                                <td className="py-1.5 text-slate-600">{m.instructions}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {p.additional_advice && (
                        <p className="text-xs text-slate-500 bg-white p-2 rounded-lg border border-slate-100">
                          <strong>Doctor's Advice:</strong> {p.additional_advice}
                        </p>
                      )}
                    </div>
                  ))}
                  {prescriptions.length === 0 && (
                    <p className="text-xs text-slate-400 py-6 text-center">No prescriptions recorded yet.</p>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* View Prescription Modal */}
      {viewPrescription && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Official Electronic Prescription (Rx)</h3>
                <p className="text-xs text-slate-500">Doctor: {viewPrescription.doctor_name}</p>
              </div>
              <button onClick={() => setViewPrescription(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3 bg-teal-50/50 rounded-xl border border-teal-100">
                <div className="font-semibold text-slate-700">Clinical Diagnosis:</div>
                <div className="text-sm font-bold text-teal-800">{viewPrescription.diagnosis}</div>
              </div>

              <div>
                <div className="font-bold text-slate-800 mb-2">Prescribed Medications:</div>
                <div className="space-y-2">
                  {viewPrescription.medications.map((m, idx) => (
                    <div key={idx} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center">
                      <div>
                        <strong className="text-slate-900">{m.medicine_name}</strong> ({m.dosage})
                        <div className="text-[11px] text-slate-500">{m.frequency} – {m.duration}</div>
                      </div>
                      <span className="text-[11px] text-teal-700 font-semibold">{m.instructions}</span>
                    </div>
                  ))}
                </div>
              </div>

              {viewPrescription.additional_advice && (
                <div>
                  <div className="font-bold text-slate-800 mb-1">Dietary & Lifestyle Instructions:</div>
                  <p className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-slate-600">{viewPrescription.additional_advice}</p>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg"
              >
                Print Rx
              </button>
              <button
                onClick={() => setViewPrescription(null)}
                className="px-4 py-1.5 text-xs font-semibold bg-teal-600 text-white rounded-lg hover:bg-teal-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
