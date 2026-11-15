import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Activity, Calendar, Heart, Shield, Award, Users, 
  ArrowRight, PhoneCall, Clock, CheckCircle, Search, 
  Stethoscope, Building2, ChevronRight, UserCheck, 
  Sparkles, Star, Bed, Pill, TestTube, Microscope, HeartPulse
} from 'lucide-react';
import { api } from '../services/api';
import { Department, Doctor } from '../types';
import { useAuth } from '../context/AuthContext';

export const LandingPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [departments, setDepartments] = useState<Department[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDept, setSelectedDept] = useState<number | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [deptsData, docsData] = await Promise.all([
          api.departments.getAll(),
          api.doctors.getAll()
        ]);
        setDepartments(deptsData);
        setDoctors(docsData);
      } catch (err) {
        console.error("Failed to load landing data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleBookNow = () => {
    if (user) {
      if (user.role === 'patient') {
        navigate('/dashboard/patient');
      } else if (user.role === 'doctor') {
        navigate('/dashboard/doctor');
      } else if (user.role === 'admin') {
        navigate('/dashboard/admin');
      } else if (user.role === 'receptionist') {
        navigate('/dashboard/receptionist');
      }
    } else {
      // Direct unauthenticated users to the doctors directory to browse and select
      navigate('/doctors');
    }
  };

  const filteredDoctors = doctors.filter(doc => {
    const matchesDept = selectedDept ? doc.department_id === selectedDept : true;
    const matchesSearch = searchQuery 
      ? (doc.user?.full_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
         doc.specialization.toLowerCase().includes(searchQuery.toLowerCase()))
      : true;
    return matchesDept && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* 24/7 Emergency Header Strip */}
      <section id="emergency" className="bg-rose-900 text-rose-50 px-4 py-2.5 text-xs font-medium border-b border-rose-950">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400 animate-ping"></span>
            <span className="font-bold uppercase tracking-wider text-rose-200">24/7 Critical Emergency Hotline:</span>
            <span className="font-mono font-black text-white text-sm bg-rose-950/80 px-2.5 py-0.5 rounded border border-rose-700/50">+91-1800-CARE-NOW</span>
          </div>
          <p className="text-rose-200/90 text-[11px] text-center sm:text-right">
            Level-1 Trauma, Acute Stroke & Cardiac Emergencies. Immediate Ambulance Dispatch with Live GPS.
          </p>
        </div>
      </section>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-teal-50/60 via-white to-slate-50 border-b border-slate-200/80 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Hospital Value Proposition */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-100/90 border border-teal-200 text-teal-800 text-xs font-semibold">
                <Sparkles className="w-4 h-4 text-teal-600" />
                <span>Next-Generation Smart Healthcare & Hospital Operations</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12]">
                Better Healthcare.<br />
                <span className="text-teal-600">Smarter Management.</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
                CareHealth Point unifies patient registrations, doctor availability, real-time OPD queue telemetry, electronic consultations, digital health cards, and hospital analytics into one secure clinical ecosystem.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={handleBookNow}
                  className="px-6 py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm rounded-xl shadow-lg shadow-teal-600/25 transition-all flex items-center gap-2 group"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Book Consultation Slot</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <Link
                  to="/doctors"
                  className="px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm rounded-xl border border-slate-200 shadow-sm transition-all flex items-center gap-2"
                >
                  <Stethoscope className="w-4 h-4 text-teal-600" />
                  <span>Browse Doctor Directory</span>
                </Link>
              </div>

              {/* Key Trust Stats */}
              <div className="grid grid-cols-3 gap-6 pt-6 border-t border-slate-200/80 max-w-lg">
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-slate-900">6+</div>
                  <div className="text-xs text-slate-500 font-medium">Core Departments</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-slate-900">100%</div>
                  <div className="text-xs text-slate-500 font-medium">Verified Physicians</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-teal-600">&lt; 15m</div>
                  <div className="text-xs text-slate-500 font-medium">Avg OPD Queue Time</div>
                </div>
              </div>
            </div>

            {/* Right Column: Live Clinical Showcase Card */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-3xl shadow-xl border border-slate-200/90 p-6 space-y-5">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                      <Stethoscope className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">OPD Live Queue Telemetry</h3>
                      <p className="text-xs text-slate-500">Real-time status tracking for patients</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                    Live System
                  </span>
                </div>

                {/* Queue status banner */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Currently In Chamber:</span>
                    <span className="font-bold text-slate-900">Token #02 (Dr. Aarav Sharma)</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-teal-600 h-full rounded-full w-2/3 animate-pulse"></div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-teal-600" /> Estimated: ~15 mins
                    </span>
                    <span className="font-semibold text-teal-700">Next: Token #03</span>
                  </div>
                </div>

                {/* Digital Health Card teaser */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 text-white space-y-2 shadow-md">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>CAREHEALTH DIGITAL UHID</span>
                    <span className="font-mono text-teal-400">CHP-2026-1001</span>
                  </div>
                  <div className="font-bold text-base">Rohan Mehra</div>
                  <div className="flex items-center justify-between text-xs text-slate-300 pt-1">
                    <span>Blood Group: <strong className="text-white">B+</strong></span>
                    <span>Emergency: <strong className="text-white">+91-9876549999</strong></span>
                  </div>
                </div>

                <Link
                  to="/doctors"
                  className="w-full py-2.5 text-xs font-semibold bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-xl transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Select Doctor & Check Live Availability</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Hospital Clinical Services Section */}
      <section id="services" className="py-16 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs uppercase tracking-widest text-teal-600 font-bold mb-2">Comprehensive Healthcare</h2>
            <h3 className="text-3xl font-extrabold text-slate-900">Hospital Clinical Services</h3>
            <p className="text-sm text-slate-600 mt-2">
              End-to-end medical care combining multidisciplinary consultants, modern diagnostic laboratories, and digital patient services.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all space-y-3">
              <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                <HeartPulse className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-900 text-base">24/7 Emergency & Trauma Care</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Round-the-clock emergency room with dedicated resuscitation bays, immediate cardiac intervention catheterization lab, and acute trauma surgeons.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all space-y-3">
              <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                <Stethoscope className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-900 text-base">Specialist Outpatient Clinics</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Consultations across cardiology, neurology, pediatrics, orthopedics, oncology, and internal medicine with automated appointment scheduling.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all space-y-3">
              <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                <Microscope className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-900 text-base">Advanced Diagnostics & Pathology</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                High-resolution 3.0T MRI, 128-slice CT scans, digital ultrasound, and full clinical biochemistry labs providing fast, automated diagnostic reporting.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all space-y-3">
              <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                <Bed className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-900 text-base">Inpatient & Surgical Suites</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                State-of-the-art modular operating rooms, intensive care units (ICU, CCU, NICU), and post-operative recovery rooms with continuous vital telemetry.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all space-y-3">
              <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                <Shield className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-900 text-base">Digital Health Cards & UHID</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Permanent Universal Hospital Identification (UHID) ensuring lifelong records encryption, seamless consultation history, and emergency access.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all space-y-3">
              <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                <Pill className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-900 text-base">Automated Hospital Pharmacy</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Direct e-prescription routing from doctor consultation rooms to our 24/7 licensed dispensary, preventing transcription errors and drug clashes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Departments Section */}
      <section id="departments" className="py-16 bg-slate-50 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs uppercase tracking-widest text-teal-600 font-bold mb-2">Medical Specialties</h2>
            <h3 className="text-3xl font-extrabold text-slate-900">Hospital Clinical Departments</h3>
            <p className="text-sm text-slate-600 mt-2">Comprehensive inpatient and outpatient clinical specialties powered by modern diagnostic technologies.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {departments.map((dept) => (
              <div 
                key={dept.id} 
                className="p-6 rounded-2xl border border-slate-200 hover:border-teal-500/50 hover:shadow-lg transition-all group bg-white"
              >
                <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Building2 className="w-6 h-6" />
                </div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-slate-900 text-lg">{dept.name}</h4>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold border border-slate-200">{dept.code}</span>
                </div>
                <p className="text-xs text-slate-600 mb-4 line-clamp-2 leading-relaxed">{dept.description}</p>
                <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs">
                  <span className="text-slate-500 font-medium">Head: {dept.head_doctor_name || 'Senior Consultant'}</span>
                  <Link 
                    to={`/doctors?department_id=${dept.id}`}
                    className="font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1"
                  >
                    <span>{dept.doctor_count} Doctors</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Doctors Section */}
      <section id="doctors" className="py-16 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <h2 className="text-xs uppercase tracking-widest text-teal-600 font-bold mb-2">Clinical Staff</h2>
              <h3 className="text-3xl font-extrabold text-slate-900">Featured Specialists & Consultants</h3>
              <p className="text-sm text-slate-600 mt-1">Verified physicians with published consultation hours and direct slot booking.</p>
            </div>

            {/* Live Filter Controls */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search doctor or specialty..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 w-60 shadow-sm"
                />
              </div>

              <select
                value={selectedDept || ''}
                onChange={(e) => setSelectedDept(e.target.value ? Number(e.target.value) : undefined)}
                className="py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-sm text-slate-700"
              >
                <option value="">All Departments</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Doctor Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredDoctors.map((doc) => (
              <div key={doc.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between group">
                <div>
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 text-white flex items-center justify-center font-bold text-base shadow-sm shrink-0">
                      {doc.user?.full_name ? doc.user.full_name.replace('Dr. ', '').charAt(0) : 'D'}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-slate-900 text-sm truncate group-hover:text-teal-600 transition-colors">
                        {doc.user?.full_name}
                      </h4>
                      <p className="text-xs text-teal-600 font-semibold truncate">{doc.specialization}</p>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs text-slate-600 mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <p><strong className="text-slate-800">Dept:</strong> {doc.department_name}</p>
                    <p><strong className="text-slate-800">Experience:</strong> {doc.experience_years}+ Years</p>
                    <p><strong className="text-slate-800">Fee:</strong> ₹{doc.consultation_fee}</p>
                  </div>

                  <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">{doc.biography}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100">
                  <Link
                    to={`/doctors/${doc.id}`}
                    className="py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg text-center border border-slate-200 transition-colors"
                  >
                    View Bio
                  </Link>
                  <Link
                    to={`/doctors/${doc.id}`}
                    className="py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg text-center transition-colors flex items-center justify-center gap-1"
                  >
                    <Calendar className="w-3 h-3" />
                    <span>Book Slot</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              to="/doctors"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-all shadow-md"
            >
              <span>Explore All Hospital Doctors & Schedules</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 bg-slate-50 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs uppercase tracking-widest text-teal-600 font-bold mb-2">Clinical Quality</h2>
            <h3 className="text-3xl font-extrabold text-slate-900">Why Patients Trust CareHealth Point</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <Clock className="w-8 h-8 text-teal-600 mb-3" />
              <h4 className="font-bold text-slate-900 text-sm mb-1">Zero-Wait OPD Queue</h4>
              <p className="text-xs text-slate-600 leading-relaxed">Live queue wait-time tracking so patients know exact consultation status before arriving.</p>
            </div>
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <Shield className="w-8 h-8 text-teal-600 mb-3" />
              <h4 className="font-bold text-slate-900 text-sm mb-1">Encrypted Health Records</h4>
              <p className="text-xs text-slate-600 leading-relaxed">Tamper-evident prescriptions, diagnostic history, and patient confidentiality protected by RBAC.</p>
            </div>
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <Award className="w-8 h-8 text-teal-600 mb-3" />
              <h4 className="font-bold text-slate-900 text-sm mb-1">Board-Certified Specialists</h4>
              <p className="text-xs text-slate-600 leading-relaxed">Verified medical credentials, senior department heads, and evidence-based protocols.</p>
            </div>
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <PhoneCall className="w-8 h-8 text-teal-600 mb-3" />
              <h4 className="font-bold text-slate-900 text-sm mb-1">24/7 Rapid Emergency</h4>
              <p className="text-xs text-slate-600 leading-relaxed">Level-1 trauma center, round-the-clock cardiac interventions, and intensive care readiness.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Patient Testimonials Section (Demonstration Data) */}
      <section className="py-16 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-[11px] font-semibold mb-2">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>Sample Patient Testimonials (Demonstration Content)</span>
            </div>
            <h3 className="text-3xl font-extrabold text-slate-900">Patient Experiences & Feedback</h3>
            <p className="text-sm text-slate-600 mt-2">
              Demonstrating how CareHealth Point streamlines the OPD waiting journey and clinical consultations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <div className="flex items-center gap-1 text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-500" />
                ))}
              </div>
              <p className="text-xs text-slate-600 leading-relaxed italic">
                "The live OPD queue number saved me over two hours of sitting in the hospital waiting room. I could monitor token progression in real-time from my phone."
              </p>
              <div className="pt-2 border-t border-slate-200/60">
                <span className="font-bold text-slate-900 text-xs block">Rohan M.</span>
                <span className="text-[11px] text-slate-400">Cardiology Outpatient Patient</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <div className="flex items-center gap-1 text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-500" />
                ))}
              </div>
              <p className="text-xs text-slate-600 leading-relaxed italic">
                "Having my Digital Health Card and UHID instantly accessible meant the front desk checked me in within seconds. Dr. Priya Nair's consultation was exceptional."
              </p>
              <div className="pt-2 border-t border-slate-200/60">
                <span className="font-bold text-slate-900 text-xs block">Anita S.</span>
                <span className="text-[11px] text-slate-400">Neurology Consultation</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <div className="flex items-center gap-1 text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-500" />
                ))}
              </div>
              <p className="text-xs text-slate-600 leading-relaxed italic">
                "Direct prescription syncing with the hospital dispensary was effortless. The medicine instructions and dosages were clearly marked in my patient portal."
              </p>
              <div className="pt-2 border-t border-slate-200/60">
                <span className="font-bold text-slate-900 text-xs block">Vikram K.</span>
                <span className="text-[11px] text-slate-400">Internal Medicine Routine Checkup</span>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
