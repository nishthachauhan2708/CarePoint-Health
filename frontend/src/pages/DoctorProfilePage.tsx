import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Stethoscope, Calendar, Clock, Award, ShieldCheck, 
  MapPin, Phone, ArrowLeft, CheckCircle2, AlertCircle, 
  ChevronRight, Sparkles, User, FileText
} from 'lucide-react';
import { api } from '../services/api';
import { Doctor, Appointment } from '../types';
import { useAuth } from '../context/AuthContext';
import { getDoctorPhoto } from '../utils/assets';

export const DoctorProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Booking form state
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [symptoms, setSymptoms] = useState<string>('');
  
  // Slots state
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotData, setSlotData] = useState<{
    is_working_day?: boolean;
    day_of_week?: string;
    message?: string;
    slots: { slot: string; is_booked: boolean }[];
  } | null>(null);

  // Submission state
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [confirmedAppointment, setConfirmedAppointment] = useState<Appointment | null>(null);

  // Load Doctor Details
  useEffect(() => {
    const fetchDoc = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const data = await api.doctors.getById(Number(id));
        setDoctor(data);
      } catch (err: any) {
        console.error('Failed to load doctor:', err);
        setError('Doctor profile not found or unavailable.');
      } finally {
        setLoading(false);
      }
    };
    fetchDoc();
  }, [id]);

  // Load slots when doctor or selectedDate changes
  useEffect(() => {
    const fetchSlots = async () => {
      if (!id || !selectedDate) return;
      setSlotsLoading(true);
      setSelectedSlot('');
      setBookingError(null);
      try {
        const res: any = await api.doctors.getSlots(Number(id), selectedDate);
        setSlotData(res);
      } catch (err: any) {
        console.error('Failed to load slots:', err);
        setSlotData(null);
      } finally {
        setSlotsLoading(false);
      }
    };
    fetchSlots();
  }, [id, selectedDate]);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingError(null);

    if (!user) {
      // Redirect to login preserving intended target
      navigate('/login', { state: { from: location.pathname } });
      return;
    }

    if (user.role !== 'patient' && user.role !== 'admin' && user.role !== 'receptionist') {
      setBookingError('Doctors cannot book patient appointments. Please use a patient or receptionist account.');
      return;
    }

    if (!selectedDate) {
      setBookingError('Please choose an appointment date.');
      return;
    }

    if (!selectedSlot) {
      setBookingError('Please select an available consultation time slot.');
      return;
    }

    if (!doctor) return;

    setBookingLoading(true);
    try {
      const appt = await api.appointments.book({
        doctor_id: doctor.id,
        department_id: doctor.department_id,
        appointment_date: selectedDate,
        time_slot: selectedSlot,
        symptoms: symptoms.trim() || undefined,
      });
      setConfirmedAppointment(appt);
    } catch (err: any) {
      console.error('Booking failed:', err);
      const msg = err.response?.data?.detail || 'Booking failed. This slot may already be occupied.';
      setBookingError(msg);
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="inline-block w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-slate-500 font-medium">Loading clinical profile...</p>
        </div>
      </div>
    );
  }

  if (error || !doctor) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center max-w-md shadow-sm space-y-4">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-xl font-bold text-slate-800">Doctor Profile Unavailable</h2>
          <p className="text-xs text-slate-500">{error || 'The requested doctor could not be located in the hospital registry.'}</p>
          <Link
            to="/doctors"
            className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-xl transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Doctor Directory</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Link to="/" className="hover:text-teal-600 transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link to="/doctors" className="hover:text-teal-600 transition-colors">Doctors Directory</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-800 font-medium">{doctor.user?.full_name}</span>
        </div>

        {/* Success Modal / Banner if Confirmed */}
        {confirmedAppointment && (
          <div className="bg-emerald-50 border-2 border-emerald-500/30 rounded-3xl p-8 shadow-lg space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Booking Confirmed</span>
                <h2 className="text-2xl font-black text-slate-900">
                  Appointment Successfully Scheduled!
                </h2>
                <p className="text-xs sm:text-sm text-slate-600">
                  Your OPD consultation token has been generated and registered in the hospital management database.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-white p-5 rounded-2xl border border-emerald-100">
              <div>
                <span className="text-[11px] text-slate-400 font-medium">Appointment ID</span>
                <div className="font-mono font-bold text-slate-900 text-base">#{confirmedAppointment.id}</div>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 font-medium">OPD Token #</span>
                <div className="font-mono font-bold text-teal-600 text-xl">Queue #{confirmedAppointment.queue_number}</div>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 font-medium">Date & Time</span>
                <div className="font-semibold text-slate-900 text-xs">
                  {confirmedAppointment.appointment_date} <br />
                  <span className="text-teal-600 font-medium">{confirmedAppointment.time_slot}</span>
                </div>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 font-medium">Doctor</span>
                <div className="font-semibold text-slate-900 text-xs">
                  {doctor.user?.full_name} <br />
                  <span className="text-slate-500 font-normal">{doctor.specialization}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                to="/dashboard/patient"
                className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-xl shadow-md transition-colors flex items-center gap-2"
              >
                <span>View in Patient Dashboard & Live Queue</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
              <button
                onClick={() => {
                  setConfirmedAppointment(null);
                  setSelectedSlot('');
                }}
                className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-semibold text-xs rounded-xl hover:bg-slate-50 transition-colors"
              >
                Book Another Slot
              </button>
            </div>
          </div>
        )}

        {/* Main Profile Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Doctor Profile Overview */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Primary Profile Card */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-8 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <div className="w-28 h-28 rounded-3xl overflow-hidden border-2 border-teal-500/30 shadow-lg shadow-teal-700/20 shrink-0 bg-slate-100">
                  <img 
                    src={getDoctorPhoto(doctor.user?.full_name, doctor.specialization)} 
                    alt={doctor.user?.full_name || 'Doctor'} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-teal-800 bg-teal-50 px-3 py-1 rounded-full border border-teal-200/80">
                      {doctor.department_name}
                    </span>
                    <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-md">
                      MCI License: {doctor.license_number}
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    {doctor.user?.full_name}
                  </h1>
                  <p className="text-sm font-semibold text-teal-600">
                    {doctor.specialization}
                  </p>
                  <p className="text-xs text-slate-500">
                    {doctor.qualification}
                  </p>
                </div>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-100">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <span className="text-xs text-slate-500 font-medium">Experience</span>
                  <div className="text-xl font-black text-slate-900 mt-0.5">{doctor.experience_years}+ Years</div>
                  <span className="text-[10px] text-teal-600 font-medium">Clinical Practice</span>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <span className="text-xs text-slate-500 font-medium">Consultation Fee</span>
                  <div className="text-xl font-black text-teal-700 mt-0.5">₹{doctor.consultation_fee}</div>
                  <span className="text-[10px] text-slate-400 font-medium">Per Session</span>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <span className="text-xs text-slate-500 font-medium">Status</span>
                  <div className="text-xl font-black text-emerald-600 mt-0.5">Active</div>
                  <span className="text-[10px] text-slate-400 font-medium">Verified Staff</span>
                </div>
              </div>

              {/* Biography Section */}
              <div className="space-y-2 pt-2">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4 text-teal-600" />
                  <span>Clinical Biography & Background</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed bg-slate-50/70 p-4 rounded-2xl border border-slate-100">
                  {doctor.biography || `${doctor.user?.full_name} is a senior consultant in the ${doctor.department_name} department with extensive clinical background in diagnosis, chronic care, and modern surgical protocols.`}
                </p>
              </div>

              {/* Weekly Working Days & Hours */}
              <div className="space-y-3 pt-2">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Clock className="w-4 h-4 text-teal-600" />
                  <span>Weekly OPD Consulting Schedule</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {doctor.availabilities && doctor.availabilities.length > 0 ? (
                    doctor.availabilities.map((avail) => (
                      <div 
                        key={avail.id} 
                        className={`p-3.5 rounded-xl border text-xs flex items-center justify-between ${
                          avail.is_available 
                            ? 'bg-slate-50 border-slate-200' 
                            : 'bg-slate-50/50 border-dashed border-slate-200 opacity-60'
                        }`}
                      >
                        <div>
                          <span className="font-bold text-slate-800">{avail.day_of_week}</span>
                          <div className="text-[11px] text-slate-500">
                            {avail.start_time} - {avail.end_time}
                          </div>
                        </div>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          avail.is_available 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-slate-200 text-slate-600'
                        }`}>
                          {avail.is_available ? 'Available' : 'Off-duty'}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-2 text-xs text-slate-500 italic p-3 bg-slate-50 rounded-xl">
                      Standard schedule: Monday to Friday, 09:00 AM – 05:00 PM (30 min slots).
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Hospital Facility Credential Card */}
            <div className="bg-slate-900 text-white rounded-3xl p-6 space-y-4 shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">CareHealth Point Clinical Standard</h4>
                  <p className="text-xs text-slate-400">NABH & ISO 9001:2015 Accredited Quality Healthcare</p>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Consultations include electronic diagnostic archiving, automatic queue allocation with live telemetry, and instant prescription syncing with the hospital dispensary.
              </p>
            </div>

          </div>

          {/* Right Column: Appointment Booking Widget */}
          <div className="lg:col-span-5" id="book">
            <div className="bg-white rounded-3xl border border-slate-200/90 p-7 shadow-xl space-y-6 sticky top-6">
              
              <div className="border-b border-slate-100 pb-4">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 text-[11px] font-semibold mb-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Real-time Doctor Availability</span>
                </div>
                <h2 className="text-xl font-bold text-slate-900">Book OPD Consultation</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select consultation date to view doctor's active time slots.
                </p>
              </div>

              {bookingError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3.5 rounded-xl text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div className="flex-1 font-medium">{bookingError}</div>
                </div>
              )}

              <form onSubmit={handleBooking} className="space-y-5">
                
                {/* Date Picker */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span>1. Select Consultation Date</span>
                    <span className="text-[11px] font-normal text-slate-400">Past dates disabled</span>
                  </label>
                  <input
                    type="date"
                    min={todayStr}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full py-2.5 px-3.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 transition-all font-medium"
                    required
                  />
                </div>

                {/* Slots selection */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span>2. Select Available Time Slot</span>
                    {slotData?.day_of_week && (
                      <span className="text-[11px] font-semibold text-teal-600">{slotData.day_of_week}</span>
                    )}
                  </label>

                  {slotsLoading ? (
                    <div className="py-8 text-center bg-slate-50 rounded-xl border border-slate-100">
                      <div className="inline-block w-5 h-5 border-2 border-teal-600 border-t-transparent rounded-full animate-spin mb-1"></div>
                      <p className="text-xs text-slate-500">Checking doctor's calendar...</p>
                    </div>
                  ) : slotData && slotData.is_working_day === false ? (
                    <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs space-y-1.5">
                      <div className="font-bold flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4 text-amber-600" />
                        <span>Doctor Off-Duty</span>
                      </div>
                      <p className="text-[11px] leading-relaxed text-amber-700">
                        {doctor.user?.full_name} does not have OPD hours scheduled on {slotData.day_of_week}s. Please pick another working day (e.g. Monday - Friday).
                      </p>
                    </div>
                  ) : slotData && slotData.slots && slotData.slots.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                      {slotData.slots.map((s, idx) => {
                        const isSelected = selectedSlot === s.slot;
                        const isBooked = s.is_booked;

                        return (
                          <button
                            key={idx}
                            type="button"
                            disabled={isBooked}
                            onClick={() => setSelectedSlot(s.slot)}
                            className={`py-2 px-2.5 text-xs rounded-xl font-medium border text-center transition-all ${
                              isBooked
                                ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed line-through'
                                : isSelected
                                ? 'bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-600/20 font-bold'
                                : 'bg-slate-50 hover:bg-teal-50 hover:border-teal-300 text-slate-700 border-slate-200'
                            }`}
                          >
                            <span className="block">{s.slot}</span>
                            <span className="text-[10px] block opacity-80">
                              {isBooked ? 'Booked' : isSelected ? 'Selected' : 'Available'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-slate-50 text-slate-500 text-xs text-center border border-slate-200">
                      No slots available for the selected date.
                    </div>
                  )}
                </div>

                {/* Symptoms / Chief Complaints */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span>3. Symptoms & Consultation Purpose</span>
                    <span className="text-[11px] font-normal text-slate-400">Optional</span>
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Briefly describe your symptoms or reason for visit (e.g., headache, chest tightness, routine health checkup)..."
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 transition-all resize-none"
                  ></textarea>
                </div>

                {/* Booking summary banner */}
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1.5">
                  <div className="flex justify-between text-slate-600">
                    <span>Consultation Fee:</span>
                    <span className="font-bold text-slate-800">₹{doctor.consultation_fee}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Estimated Slot:</span>
                    <span className="font-semibold text-teal-700">{selectedSlot || 'None selected'}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 text-[11px]">
                    <span>Account:</span>
                    <span className="font-medium text-slate-800">
                      {user ? `${user.full_name} (${user.role})` : 'Not logged in (will prompt sign in)'}
                    </span>
                  </div>
                </div>

                {/* Confirm Action Button */}
                <button
                  type="submit"
                  disabled={bookingLoading || (slotData?.is_working_day === false)}
                  className={`w-full py-3.5 px-4 font-bold text-xs sm:text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 ${
                    bookingLoading || (slotData?.is_working_day === false)
                      ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                      : 'bg-teal-600 hover:bg-teal-700 text-white shadow-teal-600/25'
                  }`}
                >
                  {bookingLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Confirming Clinical Appointment...</span>
                    </>
                  ) : !user ? (
                    <>
                      <User className="w-4 h-4" />
                      <span>Sign In to Confirm Appointment</span>
                    </>
                  ) : (
                    <>
                      <Calendar className="w-4 h-4" />
                      <span>Confirm & Generate OPD Token</span>
                    </>
                  )}
                </button>

                {!user && (
                  <p className="text-[11px] text-center text-slate-400">
                    You will be guided to login as a patient or create a new account to keep your digital health card synced.
                  </p>
                )}

              </form>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
