import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Activity, Calendar, Heart, Shield, Award, Users, 
  ArrowRight, PhoneCall, Clock, CheckCircle, Search, 
  Stethoscope, Building2, ChevronRight, UserCheck, 
  Sparkles, Star, Bed, Pill, TestTube, Microscope, HeartPulse,
  ShieldCheck, Ambulance, FileBadge2, AlertTriangle, CalendarCheck
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
      <section id="emergency" className="bg-rose-900 text-rose-50 px-4 py-2.5 text-xs font-medium border-b border-rose-950">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400 animate-ping"></span>
            <span className="font-bold uppercase tracking-wider text-rose-200">24/7 Level-1 Trauma Emergency:</span>
            <a 
              href="tel:18002273669" 
              className="font-mono font-black text-white text-sm bg-rose-950/80 px-2.5 py-0.5 rounded border border-rose-700/60 hover:bg-rose-800 transition-colors"
            >
              +91-1800-CARE-NOW
            </a>
          </div>
          <p className="text-rose-200/90 text-[11px] text-center sm:text-right">
            Cardiac Arrest, Acute Stroke & Polytrauma Care. Immediate Ambulance Dispatch with Live GPS Telemetry.
          </p>
        </div>
      </section>

      {/* Hero Section with Professional Medical Visual & Search Integration */}
      <section className="relative overflow-hidden bg-white border-b border-slate-200/90 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Hospital Vision & Direct Search */}
            <div className="lg:col-span-7 space-y-6">
              
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold shadow-sm">
                <Sparkles className="w-4 h-4 text-teal-600" />
                <span>NABH Accredited Tertiary Healthcare & Smart Hospital Management</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.12]">
                Better Healthcare.<br />
                <span className="text-teal-600">Smarter Management.</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
                CareHealth Point unifies clinical specialist consultations, real-time OPD queue telemetry, digital health cards (UHID), e-prescriptions, and hospital operations into one robust, cloud-native platform.
              </p>

              {/* Integrated Hero Doctor Search Bar */}
              <form onSubmit={handleHeroSearch} className="bg-slate-50 p-2 sm:p-2.5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-2 max-w-xl">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    placeholder="Search doctor by name, specialty, or condition..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-teal-600/25 transition-all flex items-center justify-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  <span>Find Doctor</span>
                </button>
              </form>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-1">
                <Link
                  to="/doctors"
                  className="px-6 py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-teal-600/20 transition-all flex items-center gap-2 group"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Browse Available Schedules</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  to="/login"
                  className="px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm rounded-xl border border-slate-200 shadow-sm transition-all flex items-center gap-2"
                >
                  <UserCheck className="w-4 h-4 text-teal-600" />
                  <span>Clinical Portals Login</span>
                </Link>
              </div>

              {/* Key Hospital Trust Statistics */}
              <div className="grid grid-cols-3 gap-6 pt-6 border-t border-slate-200/80 max-w-lg">
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-slate-900">6+</div>
                  <div className="text-xs text-slate-500 font-semibold">Specialized Depts</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-slate-900">100%</div>
                  <div className="text-xs text-slate-500 font-semibold">Licensed Physicians</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-teal-600">&lt; 15m</div>
                  <div className="text-xs text-slate-500 font-semibold">Avg OPD Queue Wait</div>
                </div>
              </div>

            </div>

            {/* Right Column: High Quality Hospital Visual & Live Telemetry Card */}
            <div className="lg:col-span-5 space-y-4">
              
              {/* Facility Photography Card with Overlay Badge */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200">
                <img 
                  src={HOSPITAL_IMAGES.hospitalFacility} 
                  alt="CareHealth Point Hospital Medical Complex"
                  className="w-full h-64 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-5">
                  <div className="text-white space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-teal-500/80 px-2 py-0.5 rounded text-white">
                      Tertiary Medical Center
                    </span>
                    <h3 className="font-extrabold text-lg text-white">Institutional Multi-Specialty Hospital</h3>
                    <p className="text-xs text-slate-300">Level-1 Trauma Center, 6 Modular Operating Theatres, 120 ICU Beds</p>
                  </div>
                </div>
              </div>

              {/* Outpatient Services & Technology Highlights Card */}
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                    <Activity className="w-4 h-4 text-teal-600" />
                    <span>Hospital Outpatient Excellence</span>
                  </div>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    NABH Accredited
                  </span>
                </div>

                <div className="space-y-2 text-xs text-slate-600">
                  <div className="flex items-center justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">OPD Consultation Hours:</span>
                    <span className="font-bold text-slate-900">Mon – Sat, 8:30 AM – 8:00 PM</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">Consultation Interval:</span>
                    <span className="font-bold text-teal-700">30-Min Dedicated Chamber Slots</span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-slate-500 font-medium">Digital Records:</span>
                    <span className="font-bold text-slate-900">Encrypted UHID & E-Prescriptions</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-600">
                  <span className="flex items-center gap-1 font-medium text-slate-600">
                    <Clock className="w-3.5 h-3.5 text-teal-600" /> Token progression tracked in real-time
                  </span>
                  <Link to="/doctors" className="font-bold text-teal-600 hover:text-teal-700 text-[11px]">
                    View Schedule →
                  </Link>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* Hospital Clinical Services & Facilities Section */}
      <section id="services" className="py-20 bg-white border-b border-slate-200/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-teal-600 bg-teal-50 px-3 py-1 rounded-full border border-teal-100">
              Clinical Excellence
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
              Hospital Services & Facilities
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Equipped with modern medical diagnostic infrastructure, modular surgery suites, and round-the-clock emergency departments.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Service 1 */}
            <div className="bg-slate-50/70 hover:bg-white rounded-3xl border border-slate-200/90 hover:border-teal-500/50 hover:shadow-xl transition-all p-7 space-y-4 group">
              <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <HeartPulse className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg">24/7 Critical Emergency & Trauma</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Dedicated Level-1 resuscitation bays, emergency triage, immediate stroke thrombolysis, and cardiac catheterization lab ready 24/7.
              </p>
              <div className="text-xs font-semibold text-rose-600 flex items-center gap-1.5 pt-2 border-t border-slate-200/60">
                <Ambulance className="w-4 h-4" />
                <span>Immediate Ambulance Dispatch</span>
              </div>
            </div>

            {/* Service 2 */}
            <div className="bg-slate-50/70 hover:bg-white rounded-3xl border border-slate-200/90 hover:border-teal-500/50 hover:shadow-xl transition-all p-7 space-y-4 group">
              <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Stethoscope className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg">Specialist Outpatient Clinics (OPD)</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Multidisciplinary consultations across Cardiology, Neurology, Orthopedics, Pediatrics, Oncology, and Internal Medicine with zero-wait queue tracking.
              </p>
              <Link to="/doctors" className="text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1 pt-2 border-t border-slate-200/60">
                <span>View OPD Consulting Hours</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Service 3 */}
            <div className="bg-slate-50/70 hover:bg-white rounded-3xl border border-slate-200/90 hover:border-teal-500/50 hover:shadow-xl transition-all p-7 space-y-4 group">
              <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Microscope className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg">Advanced Radiology & Pathology</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                3.0 Tesla MRI, 128-Slice High-Resolution CT, Digital Fluoroscopy, 4D Ultrasound, and automated biochemistry analyzers for swift, verified reporting.
              </p>
              <div className="text-xs font-semibold text-slate-500 flex items-center gap-1 pt-2 border-t border-slate-200/60">
                <CheckCircle className="w-4 h-4 text-teal-600" />
                <span>NABL Accredited Diagnostics</span>
              </div>
            </div>

            {/* Service 4 */}
            <div className="bg-slate-50/70 hover:bg-white rounded-3xl border border-slate-200/90 hover:border-teal-500/50 hover:shadow-xl transition-all p-7 space-y-4 group">
              <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Bed className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg">Modular Operating Suites & ICU</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Laminar airflow surgical theaters, laparoscopic & robotic surgery suites, dedicated coronary care (CCU), neonatal ICU (NICU), and surgical recovery units.
              </p>
              <div className="text-xs font-semibold text-slate-500 flex items-center gap-1 pt-2 border-t border-slate-200/60">
                <ShieldCheck className="w-4 h-4 text-teal-600" />
                <span>HEPA Filtered Sterility Class 100</span>
              </div>
            </div>

            {/* Service 5 */}
            <div className="bg-slate-50/70 hover:bg-white rounded-3xl border border-slate-200/90 hover:border-teal-500/50 hover:shadow-xl transition-all p-7 space-y-4 group">
              <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <FileBadge2 className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg">Digital Health Card & UHID</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Permanent Universal Hospital Identification ensuring lifelong medical history encryption, emergency blood group retrieval, and immediate front-desk check-in.
              </p>
              <div className="text-xs font-semibold text-slate-500 flex items-center gap-1 pt-2 border-t border-slate-200/60">
                <CheckCircle className="w-4 h-4 text-teal-600" />
                <span>Instant QR-Based Patient Verification</span>
              </div>
            </div>

            {/* Service 6 */}
            <div className="bg-slate-50/70 hover:bg-white rounded-3xl border border-slate-200/90 hover:border-teal-500/50 hover:shadow-xl transition-all p-7 space-y-4 group">
              <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Pill className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg">Automated Hospital Dispensary</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Electronic prescriptions are instantly routed from doctor chambers to our 24/7 licensed pharmacy, eliminating handwriting errors and medication conflicts.
              </p>
              <div className="text-xs font-semibold text-slate-500 flex items-center gap-1 pt-2 border-t border-slate-200/60">
                <CheckCircle className="w-4 h-4 text-teal-600" />
                <span>Barcoded Prescription Verification</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Hospital Departments Section */}
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
                Explore specialized medical departments staffed by board-certified physicians.
              </p>
            </div>

            <Link
              to="/doctors"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-600 hover:text-teal-700 bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm transition-all"
            >
              <span>View All Department Doctors</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {departments.map((dept) => (
              <div 
                key={dept.id} 
                className="p-7 rounded-3xl border border-slate-200/90 hover:border-teal-500/50 hover:shadow-lg transition-all group bg-white flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold text-lg group-hover:scale-105 transition-transform">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
                      {dept.code}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-slate-900 text-lg mb-2 group-hover:text-teal-600 transition-colors">
                    {dept.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 mb-6 line-clamp-2 leading-relaxed">
                    {dept.description || 'Comprehensive diagnosis, inpatient surgical management, and advanced restorative clinical care.'}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Head: <strong>{dept.head_doctor_name || 'Senior Consultant'}</strong></span>
                  <Link 
                    to={`/doctors?department_id=${dept.id}`}
                    className="font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1"
                  >
                    <span>{dept.doctor_count} Specialists</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Featured Doctors Section with Real Physician Photography */}
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
                    {/* Doctor Real Photo Banner */}
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

      {/* Why Choose CareHealth Point Section */}
      <section id="why-us" className="py-20 bg-slate-50 border-b border-slate-200/90">
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
            
            <div className="p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Zero-Wait OPD Queue</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Live queue wait-time telemetry lets patients arrive right on time, preventing crowded waiting lounges.
              </p>
            </div>

            <div className="p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Encrypted Health Vault</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Tamper-evident prescriptions, consultation notes, and health records protected by strict role-based access controls.
              </p>
            </div>

            <div className="p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Board-Certified Doctors</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Every physician holds verified credentials from medical councils with transparent consultation fees and schedules.
              </p>
            </div>

            <div className="p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-3">
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

      {/* Patient Testimonials Section */}
      <section className="py-20 bg-white border-b border-slate-200/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-[11px] font-bold border border-teal-200/60">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>Verified Patient Care Feedback</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
              Patient Experiences & Care Feedback
            </h2>
            <p className="text-sm text-slate-600">
              Real clinical feedback on outpatient experiences, doctor consultations, and electronic health services.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200/90 space-y-4 shadow-sm">
              <div className="flex items-center gap-1 text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-500" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed italic">
                "The live OPD queue token saved me over two hours of sitting in the waiting area. I could track my token progression in real time from my phone before walking into the consultation chamber."
              </p>
              <div className="pt-4 border-t border-slate-200/60">
                <span className="font-bold text-slate-900 text-sm block">R. K. Mehra</span>
                <span className="text-xs text-slate-500">Cardiology Outpatient Patient</span>
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200/90 space-y-4 shadow-sm">
              <div className="flex items-center gap-1 text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-500" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed italic">
                "Having my Digital Health Card and UHID on my phone meant the front desk checked me in within 15 seconds. Dr. Priya Nair's neurology consultation was thorough, prompt and reassuring."
              </p>
              <div className="pt-4 border-t border-slate-200/60">
                <span className="font-bold text-slate-900 text-sm block">Anita Sharma</span>
                <span className="text-xs text-slate-500">Neurology Consultation</span>
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200/90 space-y-4 shadow-sm">
              <div className="flex items-center gap-1 text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-500" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed italic">
                "Direct prescription syncing with the hospital pharmacy made picking up prescribed medicines seamless. The clear dosage instructions were visible directly on my patient dashboard."
              </p>
              <div className="pt-4 border-t border-slate-200/60">
                <span className="font-bold text-slate-900 text-sm block">Vikram Kapoor</span>
                <span className="text-xs text-slate-500">Internal Medicine Review</span>
              </div>
            </div>

          </div>

        </div>
      </section>

    </div>
  );
};
