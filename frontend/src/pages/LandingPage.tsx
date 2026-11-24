import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Activity, Calendar, Heart, Shield, Award, Users, 
  ArrowRight, PhoneCall, Clock, CheckCircle, Search, 
  Stethoscope, Building2, ChevronRight, UserCheck, 
  Sparkles, Star, Bed, Pill, TestTube, Microscope, HeartPulse,
  ShieldCheck, Ambulance, FileBadge2, AlertTriangle, CalendarCheck,
  Bot, MessageSquare, Zap, Check, ArrowUpRight
} from 'lucide-react';
import { api } from '../services/api';
import { Department, Doctor } from '../types';
import { useAuth } from '../context/AuthContext';
import { HOSPITAL_IMAGES, getDoctorPhoto } from '../utils/assets';

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

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/doctors?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
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
    <div className="min-h-screen bg-slate-50 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      
      {/* 24/7 Critical Emergency Alert Strip */}
      <section id="emergency" className="bg-rose-950 text-rose-100 px-4 py-2.5 text-xs font-medium border-b border-rose-900 select-none">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
            <span className="font-bold uppercase tracking-wider text-rose-300">24/7 Level-1 Trauma Emergency:</span>
            <a 
              href="tel:18002273669" 
              className="font-mono font-black text-white text-xs sm:text-sm bg-rose-900/90 px-2.5 py-0.5 rounded border border-rose-700/60 hover:bg-rose-800 transition-colors"
            >
              +91-1800-CARE-NOW
            </a>
          </div>
          <p className="text-rose-200/90 text-[11px] text-center sm:text-right">
            Level-1 Resuscitation Bays, Acute Stroke Unit & Cardiac Catheterization Ready. Immediate Ambulance Dispatch.
          </p>
        </div>
      </section>

      {/* 1. HERO SECTION WITH REALISTIC HOSPITAL PHOTOGRAPHY */}
      <section className="relative overflow-hidden bg-white border-b border-slate-200/90 py-12 lg:py-20">
        {/* Subtle background decoration */}
        <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 rounded-full bg-teal-50/50 blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            
            {/* Left Column: Hospital Value Proposition, Tagline, Heading, Quote & Quick Search */}
            <div className="lg:col-span-7 space-y-6">
              
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold shadow-xs">
                <Sparkles className="w-4 h-4 text-teal-600" />
                <span>NABH & JCI Accredited Multispecialty Tertiary Hospital</span>
              </div>

              <div className="space-y-2">
                <div className="inline-block text-xs sm:text-sm font-extrabold uppercase tracking-wider text-teal-600 bg-teal-50/60 px-2.5 py-0.5 rounded-md">
                  Your Health, Our Priority.
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.12]">
                  Better Healthcare Begins with <span className="text-teal-600">Better Care.</span>
                </h1>
              </div>

              <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
                Experience a smarter and more connected healthcare journey. From finding the right specialist and booking appointments to tracking your OPD queue, CareHealth Point makes managing your healthcare easier, more accessible, and more convenient.
              </p>

              {/* Meaningful Healthcare Quote */}
              <div className="p-3.5 sm:p-4 bg-teal-50/80 rounded-2xl border border-teal-100/90 flex items-center gap-3.5 shadow-xs max-w-xl">
                <div className="w-8 h-8 rounded-xl bg-teal-600/10 text-teal-700 flex items-center justify-center shrink-0">
                  <Heart className="w-4 h-4 text-teal-600 fill-teal-100" />
                </div>
                <p className="text-xs sm:text-sm text-slate-700 font-medium italic">
                  "Every patient deserves compassionate care, timely attention, and a healthier tomorrow."
                </p>
              </div>

              {/* Integrated Hero Doctor Search Bar */}
              <form onSubmit={handleHeroSearch} className="bg-slate-50 p-2 sm:p-2.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-2 max-w-xl">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    placeholder="Search doctor by name, specialty, or symptom..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-teal-600/20 transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  <Search className="w-4 h-4" />
                  <span>Find Doctor</span>
                </button>
              </form>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-1">
                <Link
                  to={user?.role === 'patient' ? '/dashboard/patient?tab=book' : '/doctors'}
                  className="px-6 py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-teal-600/20 transition-all flex items-center gap-2 group active:scale-95"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Book an Appointment</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  to="/doctors"
                  className="px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm rounded-xl border border-slate-200 shadow-xs transition-all flex items-center gap-2 active:scale-95"
                >
                  <Stethoscope className="w-4 h-4 text-teal-600" />
                  <span>Explore Our Doctors</span>
                </Link>
              </div>

              {/* Key Hospital Statistics */}
              <div className="grid grid-cols-3 gap-6 pt-5 border-t border-slate-200/80 max-w-lg">
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-slate-900">100%</div>
                  <div className="text-xs text-slate-500 font-semibold">Verified Doctors</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-slate-900">6+</div>
                  <div className="text-xs text-slate-500 font-semibold">Specialty Depts</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-teal-600">&lt; 15m</div>
                  <div className="text-xs text-slate-500 font-semibold">Avg Queue Wait</div>
                </div>
              </div>

            </div>

            {/* Right Column: Realistic Healthcare Photography Composition */}
            <div className="lg:col-span-5 space-y-4">
              
              {/* Primary Realistic Hospital Photograph */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200/90 group bg-slate-100">
                <img 
                  src={HOSPITAL_IMAGES.heroBanner} 
                  alt="CareHealth Point Multispecialty Hospital Modern Facility and Reception"
                  className="w-full h-80 sm:h-96 lg:h-[440px] object-cover group-hover:scale-102 transition-transform duration-500"
                  loading="eager"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent p-6 text-white">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-teal-600 px-2.5 py-0.5 rounded-full text-white inline-block">
                      Modern Tertiary Campus
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-900/90 border border-slate-700 px-2 py-0.5 rounded-full text-teal-300">
                      NABH Accredited
                    </span>
                  </div>
                  <h3 className="font-extrabold text-lg sm:text-xl text-white">CareHealth Point Multispecialty Hospital</h3>
                  <p className="text-xs text-slate-200 line-clamp-1">Level-1 Trauma Center, 6 Modular Procedural Suites & 120 Intensive Care Beds</p>
                </div>
              </div>

              {/* Real Facility Telemetry Highlights */}
              <div className="bg-slate-50/90 rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center justify-between text-xs text-slate-600">
                <div className="flex items-center gap-2 font-medium text-slate-700">
                  <Clock className="w-4 h-4 text-teal-600" />
                  <span>OPD Consultation: <strong>Mon – Sat, 8:30 AM – 8:00 PM</strong></span>
                </div>
                <Link to="/doctors" className="font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1">
                  <span>View Roster</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* 2. ABOUT CAREHEALTH POINT SECTION (Realistic Medical Visuals) */}
      <section id="about" className="py-20 bg-slate-50 border-b border-slate-200/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Visual Grid: Real Physician Examination & Modern Facility */}
            <div className="lg:col-span-6 grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <img 
                  src={HOSPITAL_IMAGES.doctorConsulting} 
                  alt="Doctor consulting patient" 
                  className="rounded-3xl shadow-lg border border-slate-200 object-cover h-64 w-full"
                />
                <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
                  <span className="text-2xl font-black text-teal-600 font-mono">100%</span>
                  <p className="text-xs font-bold text-slate-900">Board-Certified Faculty</p>
                  <p className="text-[11px] text-slate-500">Experienced specialists across tertiary specialties</p>
                </div>
              </div>

              <div className="space-y-4 pt-8">
                <div className="p-5 bg-teal-600 text-white rounded-2xl shadow-lg shadow-teal-600/20 space-y-1">
                  <ShieldCheck className="w-6 h-6 text-teal-200 mb-2" />
                  <span className="text-2xl font-black font-mono">NABH</span>
                  <p className="text-xs font-bold">Accredited Quality</p>
                  <p className="text-[11px] text-teal-100">National standards in clinical safety and patient privacy</p>
                </div>
                <img 
                  src={HOSPITAL_IMAGES.corridor} 
                  alt="Clean modern hospital corridor" 
                  className="rounded-3xl shadow-lg border border-slate-200 object-cover h-64 w-full"
                />
              </div>
            </div>

            {/* Content Column */}
            <div className="lg:col-span-6 space-y-6">
              <span className="text-xs font-bold uppercase tracking-widest text-teal-600 bg-teal-50 px-3 py-1 rounded-full border border-teal-100">
                About Our Institution
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Modern Healthcare Designed Around You
              </h2>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                CareHealth Point was founded with a clear mission: eliminate frustrating outpatient delays and disjointed clinical records by combining state-of-the-art medical diagnostics with intelligent hospital automation.
              </p>

              <div className="space-y-3.5">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 mt-0.5 border border-teal-200">
                    <Check className="w-4 h-4 text-teal-600" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">Zero-Paperwork Digital Health Card</h4>
                    <p className="text-xs text-slate-500">Every patient is issued an encrypted UHID card for paperless check-ins and lifetime records.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 mt-0.5 border border-teal-200">
                    <Check className="w-4 h-4 text-teal-600" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">Real-Time OPD Queue Progression</h4>
                    <p className="text-xs text-slate-500">Patients view live chamber tokens, serving numbers, and estimated wait times from any mobile device.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 mt-0.5 border border-teal-200">
                    <Check className="w-4 h-4 text-teal-600" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">Integrated e-Prescription & Pharmacy</h4>
                    <p className="text-xs text-slate-500">Consultation prescriptions route automatically to our 24/7 hospital pharmacy without handwriting confusion.</p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  to="/doctors"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
                >
                  <span>Meet Our Clinical Team</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. OUR HEALTHCARE SERVICES & FACILITIES (PHOTO CARDS) */}
      <section id="services" className="py-20 bg-white border-b border-slate-200/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-teal-600 bg-teal-50 px-3 py-1 rounded-full border border-teal-100">
              Clinical Excellence
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
              Hospital Services & Advanced Facilities
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Equipped with modern medical diagnostic infrastructure, modular surgery suites, and round-the-clock emergency departments.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Service 1: 24/7 Emergency */}
            <div className="bg-slate-50 hover:bg-white rounded-3xl border border-slate-200 hover:border-teal-500/50 hover:shadow-xl transition-all overflow-hidden flex flex-col justify-between group">
              <div>
                <img 
                  src={HOSPITAL_IMAGES.emergencyAmbulance} 
                  alt="Emergency Trauma Care" 
                  className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="p-6 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                    24/7 Emergency Wing
                  </span>
                  <h3 className="font-bold text-slate-900 text-lg">Level-1 Trauma & Emergency Care</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Resuscitation bays, acute stroke thrombolysis, emergency polytrauma triage, and cardiac catheterization on continuous standby.
                  </p>
                </div>
              </div>
              <div className="p-6 pt-0 border-t border-slate-200/60 mt-3 flex items-center justify-between text-xs">
                <span className="font-mono font-bold text-rose-600">+91-1800-CARE-NOW</span>
                <span className="text-slate-400 font-semibold">Immediate Dispatch</span>
              </div>
            </div>

            {/* Service 2: Outpatient Clinics */}
            <div className="bg-slate-50 hover:bg-white rounded-3xl border border-slate-200 hover:border-teal-500/50 hover:shadow-xl transition-all overflow-hidden flex flex-col justify-between group">
              <div>
                <img 
                  src={HOSPITAL_IMAGES.doctorConsulting} 
                  alt="Specialist Outpatient Clinics" 
                  className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="p-6 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                    Outpatient Department
                  </span>
                  <h3 className="font-bold text-slate-900 text-lg">Specialist OPD Clinics</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Comprehensive outpatient consultations across Cardiology, Neurology, Orthopedics, Pediatrics, and Oncology with live queue progression.
                  </p>
                </div>
              </div>
              <div className="p-6 pt-0 border-t border-slate-200/60 mt-3 flex items-center justify-between text-xs">
                <Link to="/doctors" className="font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1">
                  <span>View Doctor Roster</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
                <span className="text-slate-400 font-semibold">30-min slots</span>
              </div>
            </div>

            {/* Service 3: Radiology & Diagnostics */}
            <div className="bg-slate-50 hover:bg-white rounded-3xl border border-slate-200 hover:border-teal-500/50 hover:shadow-xl transition-all overflow-hidden flex flex-col justify-between group">
              <div>
                <img 
                  src={HOSPITAL_IMAGES.diagnosticImaging} 
                  alt="Advanced Radiology & MRI" 
                  className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="p-6 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                    NABL Diagnostic Lab
                  </span>
                  <h3 className="font-bold text-slate-900 text-lg">Advanced Radiology & Pathology</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    3.0 Tesla MRI, 128-Slice High-Resolution CT, Digital Fluoroscopy, and automated biochemistry analyzers for swift, verified diagnosis.
                  </p>
                </div>
              </div>
              <div className="p-6 pt-0 border-t border-slate-200/60 mt-3 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-semibold">NABL Accredited</span>
                <span className="text-teal-600 font-bold">Same-Day Reports</span>
              </div>
            </div>

            {/* Service 4: Modular Operating Theatres */}
            <div className="bg-slate-50 hover:bg-white rounded-3xl border border-slate-200 hover:border-teal-500/50 hover:shadow-xl transition-all overflow-hidden flex flex-col justify-between group">
              <div>
                <img 
                  src={HOSPITAL_IMAGES.operatingTheater} 
                  alt="Modular Operating Suites" 
                  className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="p-6 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                    Surgical Wing
                  </span>
                  <h3 className="font-bold text-slate-900 text-lg">Modular Operating Suites & ICU</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Laminar airflow surgical theaters, robotic and laparoscopic suites, CCU coronary care, and pediatric intensive care units.
                  </p>
                </div>
              </div>
              <div className="p-6 pt-0 border-t border-slate-200/60 mt-3 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-semibold">HEPA Class 100</span>
                <span className="text-teal-600 font-bold">6 Modular Suites</span>
              </div>
            </div>

            {/* Service 5: Digital Health Card */}
            <div className="bg-slate-50 hover:bg-white rounded-3xl border border-slate-200 hover:border-teal-500/50 hover:shadow-xl transition-all overflow-hidden flex flex-col justify-between group">
              <div>
                <img 
                  src={HOSPITAL_IMAGES.patientCare} 
                  alt="Digital Health Identification" 
                  className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="p-6 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Digital Health Identity
                  </span>
                  <h3 className="font-bold text-slate-900 text-lg">Digital Health Card & UHID</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Universal Hospital ID card generated instantly on patient registration. Secure QR code verification prevents paperwork delays.
                  </p>
                </div>
              </div>
              <div className="p-6 pt-0 border-t border-slate-200/60 mt-3 flex items-center justify-between text-xs">
                <Link to="/register" className="font-bold text-teal-600 hover:text-teal-700">
                  Generate Your Card →
                </Link>
                <span className="text-slate-400 font-semibold">Encrypted Vault</span>
              </div>
            </div>

            {/* Service 6: Automated Dispensary */}
            <div className="bg-slate-50 hover:bg-white rounded-3xl border border-slate-200 hover:border-teal-500/50 hover:shadow-xl transition-all overflow-hidden flex flex-col justify-between group">
              <div>
                <img 
                  src={HOSPITAL_IMAGES.laboratory} 
                  alt="Automated Hospital Pharmacy" 
                  className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="p-6 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                    Hospital Dispensary
                  </span>
                  <h3 className="font-bold text-slate-900 text-lg">Automated E-Pharmacy & Dispensary</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Prescriptions written during consultation sync immediately to our 24/7 licensed pharmacy for zero-wait medication pickup.
                  </p>
                </div>
              </div>
              <div className="p-6 pt-0 border-t border-slate-200/60 mt-3 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-semibold">Open 24/7/365</span>
                <span className="text-teal-600 font-bold">Barcoded Verification</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 4. DEPARTMENTS & SPECIALIZATIONS */}
      <section id="departments" className="py-20 bg-slate-50 border-b border-slate-200/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-teal-600 bg-teal-50 px-3 py-1 rounded-full border border-teal-100">
                Specialized Medicine
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-2">
                Centers of Clinical Excellence
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Explore specialized tertiary care departments led by senior board-certified clinicians.
              </p>
            </div>

            <Link
              to="/doctors"
              className="px-5 py-2.5 bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs rounded-xl border border-slate-200 shadow-sm transition-all flex items-center gap-2 self-start md:self-auto"
            >
              <span>View All Specialties</span>
              <ArrowRight className="w-4 h-4 text-teal-600" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {departments.map((dept) => (
              <div 
                key={dept.id} 
                className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md hover:border-teal-500/40 transition-all space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                    <Building2 className="w-6 h-6 text-teal-600" />
                  </div>
                  <span className="font-mono font-bold text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg">
                    {dept.code}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 text-base">{dept.name}</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {dept.description || 'Specialized outpatient and diagnostic healthcare center.'}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-600">Head: <strong>{dept.head_doctor_name || 'Senior Consultant'}</strong></span>
                  <Link 
                    to={`/doctors?specialization=${encodeURIComponent(dept.name)}`}
                    className="font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1"
                  >
                    <span>View Doctors</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 5. FEATURED DOCTORS SECTION */}
      <section id="doctors" className="py-20 bg-white border-b border-slate-200/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-teal-600 bg-teal-50 px-3 py-1 rounded-full border border-teal-100">
                Medical Staff
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-2">
                Featured Specialists & Department Heads
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Verified physicians with published weekly consulting schedules and direct slot reservation.
              </p>
            </div>

            <Link
              to="/doctors"
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-md shadow-teal-600/20 transition-all flex items-center gap-2"
            >
              <span>Explore All {doctors.length} Doctors</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredDoctors.slice(0, 4).map((doc) => {
              const photo = getDoctorPhoto(doc.user?.full_name, doc.specialization);

              return (
                <div 
                  key={doc.id} 
                  className="bg-white rounded-3xl border border-slate-200/90 hover:border-teal-500/50 hover:shadow-xl transition-all overflow-hidden flex flex-col justify-between group"
                >
                  <div>
                    {/* Doctor Photo */}
                    <div className="relative h-56 overflow-hidden bg-slate-100">
                      <img 
                        src={photo} 
                        alt={doc.user?.full_name || 'Hospital Doctor'} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-slate-800 shadow-sm flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-teal-600" />
                        <span>Verified</span>
                      </div>
                      <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-md px-2.5 py-0.5 rounded-md text-[10px] font-mono text-teal-300">
                        {doc.license_number}
                      </div>
                    </div>

                    <div className="p-5 space-y-3">
                      <div>
                        <span className="text-[11px] font-bold text-teal-700 uppercase tracking-wider block">
                          {doc.department_name}
                        </span>
                        <h3 className="font-extrabold text-slate-900 text-base group-hover:text-teal-600 transition-colors">
                          {doc.user?.full_name}
                        </h3>
                        <p className="text-xs text-slate-500 font-medium">
                          {doc.specialization}
                        </p>
                      </div>

                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs text-slate-600 space-y-1">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Degree:</span>
                          <span className="font-semibold text-slate-800">{doc.qualification}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Experience:</span>
                          <span className="font-semibold text-slate-800">{doc.experience_years}+ Years</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Consultation:</span>
                          <span className="font-bold text-teal-700">₹{doc.consultation_fee}</span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {doc.biography}
                      </p>
                    </div>
                  </div>

                  <div className="p-5 pt-0 grid grid-cols-2 gap-2">
                    <Link
                      to={`/doctors/${doc.id}`}
                      className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl text-center transition-colors"
                    >
                      View Profile
                    </Link>
                    <Link
                      to={`/doctors/${doc.id}`}
                      className="py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl text-center shadow-sm transition-colors flex items-center justify-center gap-1"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Book Slot</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 6. HOW IT WORKS (STEP-BY-STEP PATIENT JOURNEY) */}
      <section className="py-20 bg-slate-50 border-b border-slate-200/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-teal-600 bg-teal-50 px-3 py-1 rounded-full border border-teal-100">
              Simple 4-Step Process
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
              How CareHealth Point Works
            </h2>
            <p className="text-sm text-slate-600">
              From online booking to live queue tracking and digital prescription fulfillment in four simple steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3 relative">
              <span className="w-8 h-8 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center">1</span>
              <h3 className="font-bold text-slate-900 text-base">Select Specialist</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Browse our verified physician directory by specialty, clinical qualifications, or consultation fees.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3 relative">
              <span className="w-8 h-8 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center">2</span>
              <h3 className="font-bold text-slate-900 text-base">Reserve OPD Slot</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Choose a 30-minute consultation window that suits your schedule. No overbooking or dual reservations.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3 relative">
              <span className="w-8 h-8 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center">3</span>
              <h3 className="font-bold text-slate-900 text-base">Instant Digital Token</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Receive an encrypted UHID token and Digital Health Card QR for paperless arrival check-in.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3 relative">
              <span className="w-8 h-8 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center">4</span>
              <h3 className="font-bold text-slate-900 text-base">Track Live Chamber Queue</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Monitor your token progression, currently serving chamber number, and enter right when called.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* 7. WHY CHOOSE CAREHEALTH POINT */}
      <section id="why-us" className="py-20 bg-white border-b border-slate-200/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-teal-600 bg-teal-50 px-3 py-1 rounded-full border border-teal-100">
              Institutional Quality
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
              Why Patients Trust CareHealth Point
            </h2>
            <p className="text-sm text-slate-600">
              Transforming patient experience through cloud-native queue telemetry, zero paperwork, and verified specialists.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            
            <div className="p-7 rounded-3xl bg-slate-50 border border-slate-200/90 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Zero-Wait OPD Queue</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Live queue wait-time telemetry lets patients arrive right on time, preventing crowded waiting lounges.
              </p>
            </div>

            <div className="p-7 rounded-3xl bg-slate-50 border border-slate-200/90 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Encrypted Health Vault</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Tamper-evident prescriptions, consultation notes, and health records protected by strict role-based access controls.
              </p>
            </div>

            <div className="p-7 rounded-3xl bg-slate-50 border border-slate-200/90 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Board-Certified Doctors</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Every physician holds verified credentials from medical councils with transparent consultation fees and schedules.
              </p>
            </div>

            <div className="p-7 rounded-3xl bg-slate-50 border border-slate-200/90 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
                <Ambulance className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">24/7 Rapid Trauma Care</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Immediate Level-1 trauma resuscitation, cardiac catheterization, and round-the-clock emergency surgical readiness.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* 8. PATIENT SUPPORT / CARE BUDDY SECTION */}
      <section className="py-16 bg-slate-900 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20 text-xs font-bold">
                <Bot className="w-4 h-4 text-teal-400" />
                <span>24/7 AI Hospital Virtual Guide</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Meet Care Buddy – Your Automated Hospital Navigator
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
                Have questions about OPD consultation hours, physician fees, departments, or appointment booking? 
                Our AI assistant queries PostgreSQL in real-time to answer patient inquiries 24 hours a day with clinical safety guardrails.
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
                <span className="px-3 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                  "What are OPD visiting hours?"
                </span>
                <span className="px-3 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                  "Who is the head of Cardiology?"
                </span>
                <span className="px-3 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                  "Emergency helpline number"
                </span>
              </div>
            </div>

            <div className="lg:col-span-4 text-center lg:text-right">
              <Link
                to="/doctors"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-teal-500/20 transition-all"
              >
                <span>Find A Doctor Now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* 9. CALL TO ACTION BANNER */}
      <section className="py-16 bg-teal-700 text-white text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 relative z-10 space-y-4">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
            Ready to Experience Hassle-Free Healthcare?
          </h2>
          <p className="text-sm sm:text-base text-teal-100 max-w-xl mx-auto leading-relaxed">
            Register your patient profile in 60 seconds. Instant Digital Health Card, verified doctor appointments, and live OPD queue progression.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/register"
              className="px-6 py-3 bg-white hover:bg-slate-100 text-teal-900 font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all"
            >
              Register New Patient
            </Link>
            <Link
              to="/login"
              className="px-6 py-3 bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs sm:text-sm rounded-xl border border-teal-600 transition-all"
            >
              Sign In to Patient Portal
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};
