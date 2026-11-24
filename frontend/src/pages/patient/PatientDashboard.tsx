import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  CreditCard, Calendar, Clock, FileText, CheckCircle, 
  AlertCircle, ChevronRight, User, Stethoscope, Building2, 
  X, Phone, Heart, Activity, ArrowRight, ShieldCheck, Download,
  Edit3, MapPin, Droplets, QrCode, RefreshCw, Bell, Sparkles,
  ArrowUpRight
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
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('overview');
  const [healthCard, setHealthCard] = useState<DigitalHealthCard | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [activeQueue, setActiveQueue] = useState<QueueStatus | null>(null);
  const [queueRefreshing, setQueueRefreshing] = useState(false);
  const [queueError, setQueueError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Edit Profile Modal States
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [editFullName, setEditFullName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editDOB, setEditDOB] = useState('');
  const [editGender, setEditGender] = useState('Male');
  const [editBloodGroup, setEditBloodGroup] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editEmergencyName, setEditEmergencyName] = useState('');
  const [editEmergencyPhone, setEditEmergencyPhone] = useState('');
  const [editAllergies, setEditAllergies] = useState('');
  const [editProfileSaving, setEditProfileSaving] = useState(false);
  const [editProfileError, setEditProfileError] = useState<string | null>(null);

  // QR Verification Modal
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [verifyData, setVerifyData] = useState<any>(null);
  const [verifyLoading, setVerifyLoading] = useState(false);

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

      // Find today's active appointment or nearest upcoming active appointment for live queue telemetry
      const todayStr = new Date().toISOString().split('T')[0];
      const todayAppt = apptsData.find(a => a.appointment_date === todayStr && (a.status === 'confirmed' || a.status === 'pending'));
      const activeAppt = todayAppt || apptsData.find(a => a.status === 'confirmed' || a.status === 'pending');

      if (activeAppt) {
        try {
          const queueData = await api.appointments.getQueueStatus(activeAppt.id);
          setActiveQueue(queueData);
        } catch (e) {
          console.warn("Queue load error:", e);
          setActiveQueue(null);
        }
      } else {
        setActiveQueue(null);
      }

      // Load patient health card & profile
      try {
        const myProfile = await api.patients.getMyProfile();
        if (myProfile && myProfile.id) {
          const cardData = await api.patients.getHealthCard(myProfile.id);
          setHealthCard(cardData);
          const prescData = await api.prescriptions.getByPatient(myProfile.id);
          setPrescriptions(prescData);

          // Populate edit modal fields with actual current data
          setEditFullName(cardData.full_name || user?.full_name || '');
          setEditPhone(cardData.phone || user?.phone_number || '');
          setEditDOB(cardData.dob ? String(cardData.dob) : (myProfile.date_of_birth ? String(myProfile.date_of_birth) : ''));
          setEditGender(cardData.gender || myProfile.gender || 'Male');
          setEditBloodGroup(cardData.blood_group || myProfile.blood_group || '');
          setEditAddress(cardData.address || myProfile.address || '');
          setEditEmergencyName(cardData.emergency_contact || myProfile.emergency_contact_name || '');
          setEditEmergencyPhone(cardData.emergency_phone || myProfile.emergency_contact_phone || '');
          setEditAllergies(cardData.allergies || myProfile.allergies || '');
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

  const handleRefreshQueue = async (targetApptId?: number) => {
    setQueueRefreshing(true);
    setQueueError(null);
    try {
      if (targetApptId) {
        const qData = await api.appointments.getQueueStatus(targetApptId);
        setActiveQueue(qData);
      } else if (activeQueue?.appointment_id) {
        const qData = await api.appointments.getQueueStatus(activeQueue.appointment_id);
        setActiveQueue(qData);
      } else {
        const qData = await api.appointments.getMyActiveQueue();
        setActiveQueue(qData);
      }
    } catch (err: any) {
      // If endpoint returns 404, activeQueue is null
      if (err.response?.status === 404) {
        setActiveQueue(null);
      } else {
        setQueueError(err.response?.data?.detail || "Could not retrieve live queue status.");
      }
    } finally {
      setQueueRefreshing(false);
    }
  };

  // Real-time polling for live queue telemetry (polls every 15s when activeQueue exists)
  useEffect(() => {
    if (!activeQueue) return;

    const interval = setInterval(async () => {
      try {
        const queueData = await api.appointments.getQueueStatus(activeQueue.appointment_id);
        setActiveQueue(queueData);
      } catch (e) {
        // Silently catch polling errors
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [activeQueue?.appointment_id]);

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

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditProfileError(null);
    setEditProfileSaving(true);

    try {
      await api.patients.updateMyProfile({
        full_name: editFullName.trim(),
        phone_number: editPhone.trim() || undefined,
        date_of_birth: editDOB || undefined,
        gender: editGender || undefined,
        blood_group: editBloodGroup.trim() || undefined,
        address: editAddress.trim() || undefined,
        emergency_contact_name: editEmergencyName.trim() || undefined,
        emergency_contact_phone: editEmergencyPhone.trim() || undefined,
        allergies: editAllergies.trim() || undefined
      });

      setIsEditProfileOpen(false);
      await loadData();
    } catch (err: any) {
      setEditProfileError(err.response?.data?.detail || "Failed to update profile. Please verify your details.");
    } finally {
      setEditProfileSaving(false);
    }
  };

  const handleVerifyCardClick = async () => {
    if (!healthCard?.uhid) return;
    setVerifyModalOpen(true);
    setVerifyLoading(true);
    try {
      const data = await api.patients.verifyCard(healthCard.uhid);
      setVerifyData(data);
    } catch (e) {
      setVerifyData({ valid: false, message: "UHID could not be verified." });
    } finally {
      setVerifyLoading(false);
    }
  };

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
              <p className="text-xs text-slate-500 mt-0.5">
                Welcome, <strong>{user?.full_name}</strong>. Monitor your consultations, queue position, and Digital Health Card
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditProfileOpen(true)}
                className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5 text-teal-600" />
                <span>Edit Profile</span>
              </button>

              <button
                onClick={() => setActiveTab('book')}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm shadow-teal-600/20 transition-all"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Book Appointment</span>
              </button>
            </div>
          </div>

          {/* TAB 1: OVERVIEW & CARDS */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* Top Row: Authentic Digital Health Card & Live Queue Monitor */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Authentic Digital Health Card */}
                <div className="lg:col-span-6 bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 text-white rounded-3xl p-7 shadow-xl relative overflow-hidden flex flex-col justify-between border border-slate-700/60">
                  <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 rounded-full bg-teal-500/15 blur-3xl pointer-events-none"></div>

                  <div>
                    <div className="flex items-center justify-between pb-3.5 border-b border-slate-700/70 mb-5">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-8 h-8 rounded-xl bg-teal-500 flex items-center justify-center font-bold text-white shadow-md">
                          <Activity className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-extrabold text-sm tracking-wide block">CAREHEALTH DIGITAL CARD</span>
                          <span className="text-[10px] text-teal-400 font-mono tracking-widest uppercase">Verified Patient Record</span>
                        </div>
                      </div>
                      
                      <button 
                        onClick={handleVerifyCardClick}
                        className="text-[10px] uppercase font-mono px-2.5 py-1 bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 rounded-lg font-bold border border-teal-500/40 transition-colors flex items-center gap-1"
                        title="Click to view public verification certificate"
                      >
                        <QrCode className="w-3 h-3 text-teal-400" />
                        <span>VERIFIED UHID</span>
                      </button>
                    </div>

                    <div className="space-y-1 mb-5">
                      <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400">PATIENT NAME</div>
                      <div className="text-xl font-extrabold tracking-tight text-white">{healthCard?.full_name || user?.full_name}</div>
                      <div className="text-xs font-mono text-teal-300 font-bold tracking-wider">{healthCard?.uhid || 'Generating UHID...'}</div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-700/60 text-xs">
                      <div>
                        <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block">Blood Group</span>
                        <span className="font-bold text-teal-300 text-sm">
                          {healthCard?.blood_group && healthCard.blood_group.trim() ? healthCard.blood_group : 'Not provided'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block">Gender</span>
                        <span className="font-bold text-white text-xs">
                          {healthCard?.gender && healthCard.gender.trim() ? healthCard.gender : 'Not provided'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block">Date of Birth</span>
                        <span className="font-bold text-white text-xs">
                          {healthCard?.dob ? String(healthCard.dob) : 'Not provided'}
                        </span>
                      </div>
                    </div>

                    {healthCard?.address && (
                      <div className="pt-3 mt-3 border-t border-slate-700/50 text-[11px] text-slate-300 flex items-center gap-1.5 truncate">
                        <MapPin className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                        <span className="truncate">{healthCard.address}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 mt-5 border-t border-slate-700/70 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                      <span>Encrypted Clinical UHID</span>
                    </span>
                    <button
                      onClick={() => setIsEditProfileOpen(true)}
                      className="text-teal-400 hover:text-teal-300 font-semibold underline text-xs"
                    >
                      Update Details
                    </button>
                  </div>
                </div>

                {/* Live OPD Queue Position Tracker */}
                <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-200 p-7 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                          <Clock className="w-4 h-4 text-teal-600" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 text-sm">Live OPD Queue Tracker</h3>
                          <span className="text-[10px] text-slate-500">Real-time consultation chamber progression</span>
                        </div>
                      </div>
                      
                      {activeQueue && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200/60 flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
                          <span>Live Telemetry</span>
                        </span>
                      )}
                    </div>

                    {activeQueue ? (
                      <div className="space-y-4">
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 grid grid-cols-2 gap-4 text-center">
                          <div className="p-2 border-r border-slate-200">
                            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">Your Token Number</span>
                            <span className="text-3xl font-black text-teal-700 font-mono">#{activeQueue.queue_number}</span>
                          </div>
                          <div className="p-2">
                            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">Currently In Chamber</span>
                            <span className="text-3xl font-black text-slate-800 font-mono">#{activeQueue.current_serving_number}</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-600 font-medium">Patients Ahead in Queue:</span>
                            <span className="font-bold text-slate-900">
                              {activeQueue.patients_ahead === 0 ? "You are next in turn!" : `${activeQueue.patients_ahead} Patients ahead`}
                            </span>
                          </div>
                          
                          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200/80">
                            <div 
                              className="bg-teal-600 h-full rounded-full transition-all duration-700"
                              style={{ width: `${Math.min(100, Math.max(15, 100 - activeQueue.patients_ahead * 20))}%` }}
                            ></div>
                          </div>
                          
                          <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
                            <span className="truncate pr-2">Doctor: <strong>{activeQueue.doctor_name}</strong></span>
                            <span className="font-bold text-teal-700 shrink-0">
                              {activeQueue.patients_ahead === 0 ? "Ready for Chamber" : `Est. Wait: ~${activeQueue.estimated_wait_minutes} mins`}
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-10 text-slate-400 space-y-3">
                        <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                          <CheckCircle className="w-6 h-6 text-slate-400" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 text-sm">No Active Queue Token Today</h4>
                          <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
                            When you schedule an outpatient appointment, your live chamber token and progression will appear here.
                          </p>
                        </div>
                        <button
                          onClick={() => setActiveTab('book')}
                          className="px-4 py-2 text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-sm transition-all"
                        >
                          Book Your Next Slot
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 text-[11px] text-slate-400 border-t border-slate-100 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Activity className="w-3.5 h-3.5 text-teal-600" />
                      <span>Queue updates automatically from physician chambers</span>
                    </span>
                    <button onClick={loadData} className="text-teal-600 hover:underline flex items-center gap-1 text-[10px]">
                      <RefreshCw className="w-2.5 h-2.5" /> Refresh
                    </button>
                  </div>
                </div>

              </div>

              {/* My Scheduled Appointments Table */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">My Appointments History</h3>
                    <p className="text-xs text-slate-500">Your genuine scheduled visits, consultations, and prescriptions</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('book')}
                    className="px-3.5 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-xl text-xs font-semibold transition-colors"
                  >
                    + New Appointment
                  </button>
                </div>

                {appointments.length === 0 ? (
                  <div className="py-14 px-6 text-center space-y-3">
                    <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                      <Calendar className="w-7 h-7 text-slate-400" />
                    </div>
                    <h4 className="font-bold text-slate-800 text-base">You don't have any appointments yet.</h4>
                    <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                      Your scheduled consultations, chamber tokens, and official prescriptions will appear here once you book an outpatient slot.
                    </p>
                    <button
                      onClick={() => setActiveTab('book')}
                      className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-teal-600/20 transition-all mt-2"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Book Your First Consultation</span>
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="p-4">Token #</th>
                          <th className="p-4">Department</th>
                          <th className="p-4">Specialist Doctor</th>
                          <th className="p-4">Date & Slot</th>
                          <th className="p-4">Status</th>
                          <th className="p-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {appointments.map((appt) => (
                          <tr key={appt.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="p-4 font-mono font-bold text-teal-700">#{appt.queue_number}</td>
                            <td className="p-4 font-medium text-slate-800">{appt.department_name}</td>
                            <td className="p-4 font-semibold text-slate-900">{appt.doctor_name}</td>
                            <td className="p-4">
                              <div className="text-slate-800 font-medium">{appt.appointment_date}</div>
                              <div className="text-[10px] text-slate-500">{appt.time_slot}</div>
                            </td>
                            <td className="p-4">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                                appt.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                                appt.status === 'confirmed' ? 'bg-teal-100 text-teal-800' :
                                appt.status === 'cancelled' ? 'bg-rose-100 text-rose-800' :
                                'bg-amber-100 text-amber-800'
                              }`}>
                                {appt.status}
                              </span>
                            </td>
                            <td className="p-4 text-right space-x-2">
                              {appt.status !== 'cancelled' && appt.status !== 'completed' && (
                                <button
                                  onClick={() => handleCancelAppointment(appt.id)}
                                  className="px-2.5 py-1 text-[11px] font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
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
                                  className="px-3 py-1 text-[11px] font-semibold bg-teal-50 text-teal-700 hover:bg-teal-100 rounded-lg transition-colors"
                                >
                                  View Rx
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 2: SMART APPOINTMENT BOOKING WIZARD */}
          {activeTab === 'book' && (
            <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm max-w-3xl mx-auto space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Schedule Hospital Consultation</h3>
                <p className="text-xs text-slate-500">Select department, specialist physician, consultation date, and open chamber slot</p>
              </div>

              {bookingSuccess && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>{bookingSuccess}</span>
                  </div>
                  <button onClick={() => setBookingSuccess(null)}><X className="w-4 h-4" /></button>
                </div>
              )}

              {bookingError && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                    <span>{bookingError}</span>
                  </div>
                  <button onClick={() => setBookingError(null)}><X className="w-4 h-4" /></button>
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
                        className={`p-4 rounded-2xl border text-left transition-all ${
                          selectedDeptId === dept.id
                            ? 'border-teal-600 bg-teal-50/60 shadow-sm'
                            : 'border-slate-200 hover:border-teal-400 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-sm text-slate-900">{dept.name}</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold">{dept.code}</span>
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
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Choose Specialist Doctor</h4>
                    <button onClick={() => setBookingStep(1)} className="text-xs text-teal-600 font-semibold hover:underline">
                      ← Back to Departments
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
                          className={`p-4 rounded-2xl border text-left transition-all ${
                            selectedDoctorId === doc.id
                              ? 'border-teal-600 bg-teal-50/60 shadow-sm'
                              : 'border-slate-200 hover:border-teal-400 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center space-x-3 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                              {doc.user?.full_name.charAt(3) || 'D'}
                            </div>
                            <div>
                              <div className="font-bold text-sm text-slate-900">{doc.user?.full_name}</div>
                              <div className="text-xs text-teal-600 font-medium">{doc.specialization}</div>
                            </div>
                          </div>
                          <div className="text-[11px] text-slate-500 space-y-0.5 pt-2 border-t border-slate-100">
                            <div>Experience: <strong>{doc.experience_years}+ Years</strong></div>
                            <div>Consultation Fee: <strong>₹{doc.consultation_fee}</strong></div>
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
                      ← Back to Doctors
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Appointment Date</label>
                    <input
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 w-full sm:w-60"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-2">Available Consultation Slots</label>
                    {availableSlots.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {availableSlots.map((s, idx) => (
                          <button
                            key={idx}
                            type="button"
                            disabled={s.is_booked}
                            onClick={() => setSelectedSlot(s.slot)}
                            className={`py-2 px-3 text-xs rounded-xl border font-semibold transition-all ${
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
                    ) : (
                      <p className="text-xs text-amber-700 bg-amber-50 p-4 rounded-xl border border-amber-200">
                        No available slots for this date. The doctor may be off-duty or fully booked. Please choose another date.
                      </p>
                    )}
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      disabled={!selectedSlot}
                      onClick={() => setBookingStep(4)}
                      className="px-5 py-2.5 bg-teal-600 text-white rounded-xl text-xs font-semibold hover:bg-teal-700 disabled:opacity-40 transition-all shadow-sm"
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
                      ← Back to Slots
                    </button>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2">
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
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleConfirmBooking}
                      className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-teal-600/20 transition-all flex items-center justify-center gap-1.5"
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
              <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 text-white rounded-3xl p-8 shadow-2xl relative overflow-hidden space-y-6 border border-slate-700">
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
                    <span className="text-base font-bold text-teal-400">{healthCard.blood_group || 'Not provided'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase tracking-wider block">Date of Birth</span>
                    <span className="font-semibold text-white">{healthCard.dob ? String(healthCard.dob) : 'Not provided'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase tracking-wider block">Gender</span>
                    <span className="font-semibold text-white">{healthCard.gender || 'Not provided'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase tracking-wider block">Registered Phone</span>
                    <span className="font-semibold text-white">{healthCard.phone || 'Not provided'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase tracking-wider block">Known Allergies</span>
                    <span className="font-semibold text-rose-300">{healthCard.allergies || 'None'}</span>
                  </div>
                </div>

                {healthCard.address && (
                  <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 text-xs">
                    <span className="text-slate-400 text-[10px] uppercase tracking-wider block mb-0.5">Residential Address</span>
                    <span className="text-slate-200">{healthCard.address}</span>
                  </div>
                )}

                <div className="pt-4 border-t border-slate-700/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Issued by CareHealth Hospital Network</span>
                  <span className="font-mono text-teal-400">Total Visits: {healthCard.total_visits}</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setIsEditProfileOpen(true)}
                  className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50 shadow-sm inline-flex items-center gap-1.5 transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5 text-teal-600" />
                  <span>Edit Card Details</span>
                </button>

                <button
                  onClick={handleVerifyCardClick}
                  className="px-4 py-2 bg-teal-50 border border-teal-200 text-teal-800 rounded-xl text-xs font-semibold hover:bg-teal-100 shadow-sm inline-flex items-center gap-1.5 transition-colors"
                >
                  <QrCode className="w-3.5 h-3.5 text-teal-600" />
                  <span>Verify UHID Certificate</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: MY PRESCRIPTIONS VIEW */}
          {activeTab === 'prescriptions' && (
            <div className="space-y-4">
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
                <h3 className="font-bold text-slate-900 text-base mb-1">My Digital Prescriptions</h3>
                <p className="text-xs text-slate-500 mb-4">Official e-prescriptions issued by consulting physicians</p>

                <div className="space-y-4">
                  {prescriptions.map((p) => (
                    <div key={p.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5">
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
                        <p className="text-xs text-slate-500 bg-white p-3 rounded-xl border border-slate-100">
                          <strong>Doctor's Advice:</strong> {p.additional_advice}
                        </p>
                      )}
                    </div>
                  ))}
                  {prescriptions.length === 0 && (
                    <div className="py-12 text-center text-slate-400 space-y-2">
                      <FileText className="w-8 h-8 text-slate-300 mx-auto" />
                      <p className="text-xs">No prescriptions recorded yet. Completed appointments with doctors will generate official digital prescriptions.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: LIVE QUEUE TRACKER */}
          {activeTab === 'queue' && (
            <div className="space-y-6">
              
              {/* Header Strip with Live Badge & Refresh Button */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                      <Clock className="w-4 h-4 text-teal-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">Live OPD Queue Tracker</h2>
                      <p className="text-xs text-slate-500">
                        Hello, <strong>{user?.full_name}</strong>. Real-time consultation chamber progression and token telemetry
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                    <span>Live Chamber Stream</span>
                  </span>

                  <button
                    onClick={() => handleRefreshQueue(activeQueue?.appointment_id)}
                    disabled={queueRefreshing}
                    className="px-3.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 text-teal-600 ${queueRefreshing ? 'animate-spin' : ''}`} />
                    <span>{queueRefreshing ? 'Syncing...' : 'Refresh Status'}</span>
                  </button>
                </div>
              </div>

              {/* Error Alert */}
              {queueError && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between gap-2 shadow-sm">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{queueError}</span>
                  </div>
                  <button
                    onClick={() => handleRefreshQueue()}
                    className="px-3 py-1 bg-white text-rose-700 hover:bg-rose-100 rounded-lg font-semibold border border-rose-200 transition-colors"
                  >
                    Retry Connection
                  </button>
                </div>
              )}

              {/* Multiple Appointments Selector Pill Bar */}
              {appointments.filter(a => a.status === 'confirmed' || a.status === 'pending').length > 1 && (
                <div className="bg-slate-100/80 p-2 rounded-2xl flex items-center gap-2 overflow-x-auto text-xs border border-slate-200">
                  <span className="text-slate-500 font-semibold pl-2 whitespace-nowrap">Select Appointment:</span>
                  {appointments.filter(a => a.status === 'confirmed' || a.status === 'pending').map((a) => {
                    const isSelected = activeQueue?.appointment_id === a.id;
                    return (
                      <button
                        key={a.id}
                        onClick={() => handleRefreshQueue(a.id)}
                        className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                          isSelected 
                            ? 'bg-teal-600 text-white shadow-sm shadow-teal-600/30' 
                            : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
                        }`}
                      >
                        <span>Token #{a.queue_number}</span>
                        <span className="opacity-80">({a.doctor_name?.replace('Dr. ', '')})</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Active Queue Display */}
              {activeQueue ? (
                <div className="space-y-6">
                  {/* Hero Chamber Card */}
                  <div className="bg-white rounded-3xl border border-slate-200 p-7 lg:p-8 shadow-sm space-y-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mr-16 -mt-16 w-56 h-56 rounded-full bg-teal-500/5 blur-3xl pointer-events-none"></div>

                    {/* Top Row: Doctor Info & Appointment Slot */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold shadow-inner">
                          <Stethoscope className="w-6 h-6 text-teal-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-extrabold text-slate-900 text-base">{activeQueue.doctor_name}</h3>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-100 text-teal-800 uppercase tracking-wide">
                              Chamber Assigned
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {activeQueue.department_name} Center of Clinical Excellence
                          </p>
                        </div>
                      </div>

                      <div className="sm:text-right">
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Scheduled Slot</span>
                        <span className="text-sm font-bold text-slate-800 font-mono flex items-center sm:justify-end gap-1.5 mt-0.5">
                          <Calendar className="w-3.5 h-3.5 text-teal-600" />
                          <span>{activeQueue.time_slot}</span>
                        </span>
                      </div>
                    </div>

                    {/* Big Numbers Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                      <div className="p-4 bg-teal-50/70 border border-teal-200/80 rounded-2xl">
                        <span className="text-[10px] font-bold text-teal-900 uppercase tracking-wider block mb-1">Your Token #</span>
                        <span className="text-4xl font-black text-teal-700 font-mono">#{activeQueue.queue_number}</span>
                        <span className="text-[10px] text-teal-600 font-medium block mt-1">Confirmed OPD Token</span>
                      </div>

                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">In Chamber Now</span>
                        <span className="text-4xl font-black text-slate-900 font-mono">#{activeQueue.current_serving_number}</span>
                        <span className="text-[10px] text-slate-500 font-medium block mt-1">Currently with Doctor</span>
                      </div>

                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Patients Ahead</span>
                        <span className={`text-4xl font-black font-mono ${activeQueue.patients_ahead === 0 ? 'text-emerald-600' : 'text-slate-900'}`}>
                          {activeQueue.patients_ahead}
                        </span>
                        <span className="text-[10px] font-medium block mt-1 text-slate-500">
                          {activeQueue.patients_ahead === 0 ? "You're next in turn!" : "Waiting in lounge"}
                        </span>
                      </div>

                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Est. Waiting Time</span>
                        <span className="text-4xl font-black text-slate-900 font-mono">
                          {activeQueue.patients_ahead === 0 ? "0" : `~${activeQueue.estimated_wait_minutes}`}
                        </span>
                        <span className="text-[10px] font-medium block mt-1 text-slate-500">
                          {activeQueue.patients_ahead === 0 ? "Please approach door" : "Minutes estimated"}
                        </span>
                      </div>
                    </div>

                    {/* Visual Queue Progress Indicator / Stepper */}
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-800">Chamber Queue Progression</span>
                        <span className="font-semibold text-teal-700">
                          {activeQueue.patients_ahead === 0 
                            ? "Status: Ready for Consultation" 
                            : activeQueue.current_serving_number === activeQueue.queue_number
                            ? "Status: Currently Inside Chamber"
                            : `Status: Position #${activeQueue.patients_ahead + 1} in Waiting Line`}
                        </span>
                      </div>

                      <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden p-0.5 border border-slate-200">
                        <div 
                          className="h-full rounded-full bg-gradient-to-r from-teal-500 via-teal-600 to-emerald-500 transition-all duration-700 shadow-sm"
                          style={{
                            width: `${Math.min(100, Math.max(15, Math.round((activeQueue.current_serving_number / (activeQueue.queue_number || 1)) * 100)))}%`
                          }}
                        ></div>
                      </div>

                      {/* 4 Step Milestones */}
                      <div className="grid grid-cols-4 gap-2 pt-2 text-center text-[11px]">
                        <div className="flex flex-col items-center">
                          <span className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-xs mb-1">✓</span>
                          <span className="font-semibold text-slate-900">Token Issued</span>
                          <span className="text-[9px] text-slate-400 font-mono">#{activeQueue.queue_number}</span>
                        </div>

                        <div className="flex flex-col items-center">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs mb-1 ${
                            activeQueue.patients_ahead > 0 ? 'bg-teal-600 text-white animate-pulse' : 'bg-slate-200 text-slate-600'
                          }`}>
                            2
                          </span>
                          <span className="font-semibold text-slate-900">Lounge Waiting</span>
                          <span className="text-[9px] text-slate-400">Level 1 OPD</span>
                        </div>

                        <div className="flex flex-col items-center">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs mb-1 ${
                            activeQueue.patients_ahead === 0 ? 'bg-emerald-600 text-white animate-bounce' : 'bg-slate-200 text-slate-600'
                          }`}>
                            3
                          </span>
                          <span className="font-semibold text-slate-900">Door Call</span>
                          <span className="text-[9px] text-slate-400">Next In Turn</span>
                        </div>

                        <div className="flex flex-col items-center">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs mb-1 ${
                            activeQueue.status === 'completed' ? 'bg-teal-700 text-white' : 'bg-slate-200 text-slate-600'
                          }`}>
                            4
                          </span>
                          <span className="font-semibold text-slate-900">Consultation</span>
                          <span className="text-[9px] text-slate-400">e-Prescription</span>
                        </div>
                      </div>
                    </div>

                    {/* Patient Guidance Strip */}
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2 text-slate-600">
                        <CheckCircle className="w-4 h-4 text-teal-600 shrink-0" />
                        <span>Please keep your <strong>Digital Health Card QR</strong> ready for quick nurse triage scanning.</span>
                      </div>
                      <button
                        onClick={() => setActiveTab('healthcard')}
                        className="text-teal-700 hover:text-teal-800 font-bold whitespace-nowrap underline"
                      >
                        View Digital Health Card →
                      </button>
                    </div>

                  </div>
                </div>
              ) : (
                /* Empty State Screen when no active queue */
                <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-sm space-y-6">
                  <div className="w-20 h-20 rounded-3xl bg-teal-50 text-teal-600 mx-auto flex items-center justify-center shadow-inner">
                    <Clock className="w-10 h-10 text-teal-600" />
                  </div>

                  <div className="max-w-md mx-auto space-y-2">
                    <h3 className="text-xl font-bold text-slate-900">No Active Queue Found</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      You currently do not have an active outpatient appointment in the chamber queue today. 
                      Once you schedule an appointment with our clinical specialists, your live token position, 
                      current serving chamber number, and estimated waiting time will appear here automatically.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    <button
                      onClick={() => setActiveTab('book')}
                      className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-600/20 transition-all flex items-center gap-1.5"
                    >
                      <Calendar className="w-4 h-4" />
                      <span>Book Outpatient Consultation</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('overview')}
                      className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
                    >
                      <span>View Health Records</span>
                    </button>

                    <button
                      onClick={() => handleRefreshQueue()}
                      className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                      <span>Check Again</span>
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 6: NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="space-y-4">
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">Patient Notifications</h3>
                    <p className="text-xs text-slate-500">Appointment updates, queue alerts, and clinical announcements</p>
                  </div>
                </div>

                <div className="py-12 text-center text-slate-400 space-y-2">
                  <Bell className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs">No unread notifications. All clinical appointment confirmations are delivered here.</p>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Edit Profile Modal */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-teal-600" />
                <h3 className="font-bold text-slate-900 text-base">Edit Patient Profile & Health Card</h3>
              </div>
              <button 
                onClick={() => setIsEditProfileOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {editProfileError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{editProfileError}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Legal Name</label>
                <input
                  type="text"
                  required
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="+91-9876543210"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    max={new Date().toISOString().split('T')[0]}
                    value={editDOB}
                    onChange={(e) => setEditDOB(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Gender</label>
                  <select
                    value={editGender}
                    onChange={(e) => setEditGender(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Blood Group</label>
                  <select
                    value={editBloodGroup}
                    onChange={(e) => setEditBloodGroup(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                  >
                    <option value="">Not provided</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Residential Address</label>
                <input
                  type="text"
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  placeholder="Street, City, State"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Emergency Contact Name</label>
                  <input
                    type="text"
                    value={editEmergencyName}
                    onChange={(e) => setEditEmergencyName(e.target.value)}
                    placeholder="Relative / Guardian Name"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Emergency Contact Phone</label>
                  <input
                    type="tel"
                    value={editEmergencyPhone}
                    onChange={(e) => setEditEmergencyPhone(e.target.value)}
                    placeholder="+91-9876543210"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Known Allergies</label>
                <input
                  type="text"
                  value={editAllergies}
                  onChange={(e) => setEditAllergies(e.target.value)}
                  placeholder="e.g. Penicillin, Peanuts, None"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditProfileOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editProfileSaving}
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-semibold shadow-sm transition-all disabled:opacity-50"
                >
                  {editProfileSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Privacy-Safe UHID Card Verification Certificate Modal */}
      {verifyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-teal-600" />
                <h3 className="font-bold text-slate-900 text-sm">Official UHID Registry Verification</h3>
              </div>
              <button 
                onClick={() => setVerifyModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {verifyLoading ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                Verifying digital token with hospital registry...
              </div>
            ) : verifyData?.valid ? (
              <div className="space-y-3 text-xs">
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-900 space-y-1">
                  <div className="font-extrabold text-sm flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>Active Verified UHID Record</span>
                  </div>
                  <p className="text-[11px] text-emerald-700">
                    This patient identifier is registered in CareHealth Point hospital database.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-sans">UHID Token:</span>
                    <strong className="text-teal-700">{verifyData.uhid}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-sans">Patient:</span>
                    <strong className="text-slate-900">{verifyData.patient_name_masked}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-sans">Blood Group:</span>
                    <strong className="text-slate-900">{verifyData.blood_group || 'Not provided'}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-sans">Verified At:</span>
                    <span className="text-slate-600 text-[11px]">{verifyData.verification_timestamp}</span>
                  </div>
                </div>

                <p className="text-[10px] text-slate-400 text-center leading-normal">
                  Privacy Protected: Personal contact information, address, and medical records are never exposed via public identification check.
                </p>
              </div>
            ) : (
              <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200 text-rose-800 text-xs text-center">
                Invalid or unverified UHID token.
              </div>
            )}

            <div className="pt-2 text-right">
              <button
                onClick={() => setVerifyModalOpen(false)}
                className="px-4 py-1.5 bg-teal-600 text-white rounded-xl text-xs font-semibold hover:bg-teal-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Prescription Modal */}
      {viewPrescription && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200">
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
              <div className="p-3.5 bg-teal-50/60 rounded-2xl border border-teal-100">
                <div className="font-semibold text-slate-700">Clinical Diagnosis:</div>
                <div className="text-sm font-bold text-teal-800">{viewPrescription.diagnosis}</div>
              </div>

              <div>
                <div className="font-bold text-slate-800 mb-2">Prescribed Medications:</div>
                <div className="space-y-2">
                  {viewPrescription.medications.map((m, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
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
                  <p className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-600">{viewPrescription.additional_advice}</p>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => window.print()}
                className="px-3.5 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
              >
                Print Rx
              </button>
              <button
                onClick={() => setViewPrescription(null)}
                className="px-4 py-1.5 text-xs font-semibold bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors shadow-sm"
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
