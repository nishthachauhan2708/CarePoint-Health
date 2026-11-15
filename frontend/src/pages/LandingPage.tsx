import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Activity, Calendar, Heart, Shield, Award, Users, 
  ArrowRight, PhoneCall, Clock, CheckCircle, Search, 
  Stethoscope, Building2, ChevronRight, UserCheck
} from 'lucide-react';
import { api } from '../services/api';
import { Department, Doctor } from '../types';
import { useAuth } from '../context/AuthContext';

export const LandingPage: React.FC = () => {
  const { user, quickLoginAs } = useAuth();
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

  const handleBookNow = async () => {
    if (user) {
      navigate('/dashboard/patient');
    } else {
      // Log in as demo patient directly for smooth demo flow
      await quickLoginAs('patient');
      navigate('/dashboard/patient');
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
      <section id="emergency" className="bg-rose-900 text-rose-50 px-4 py-2 text-xs font-medium">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping"></span>
            <span className="font-semibold uppercase tracking-wider text-rose-200">24/7 Critical Emergency Hotline:</span>
            <span className="font-mono font-bold text-white text-sm">+91-1800-CARE-NOW</span>
          </div>
          <p className="text-rose-200/90 text-[11px]">
            Immediate ambulance dispatch & Level-1 trauma response. If you are experiencing chest pain or acute trauma, dial immediately.
          </p>
        </div>
      </section>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-teal-50/50 via-white to-slate-50 border-b border-slate-200/80 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Messaging */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-100/80 border border-teal-200 text-teal-800 text-xs font-semibold">
                <Activity className="w-4 h-4 text-teal-600" />
                <span>Next-Generation Smart Healthcare Management</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
                Better Healthcare.<br />
                <span className="text-teal-600">Smarter Management.</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
                CareHealth Point seamlessly unifies patient appointments, real-time OPD queue telemetry, electronic consultations, digital health cards, and hospital operations into one robust clinical platform.
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
                  to="/login"
                  className="px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm rounded-xl border border-slate-200 shadow-sm transition-all flex items-center gap-2"
                >
                  <UserCheck className="w-4 h-4 text-teal-600" />
                  <span>Staff & Doctor Login</span>
                </Link>
              </div>

              {/* Key Trust Stats */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200/80 max-w-lg">
                <div>
                  <div className="text-2xl font-black text-slate-900">15+</div>
                  <div className="text-xs text-slate-500 font-medium">Specialized Depts</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-900">50+</div>
                  <div className="text-xs text-slate-500 font-medium">Licensed Specialists</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-teal-600">99.8%</div>
                  <div className="text-xs text-slate-500 font-medium">On-Time Care Rating</div>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Quick Card Preview */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 p-6 space-y-5">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                      <Stethoscope className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">OPD Live Queue Monitor</h3>
                      <p className="text-xs text-slate-500">Cardiology & Internal Medicine</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                    Live Demo
                  </span>
                </div>

                {/* Queue status banner */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Currently Serving:</span>
                    <span className="font-bold text-slate-900">Token #03 (Dr. Aarav Sharma)</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-teal-600 h-full rounded-full w-3/5 animate-pulse"></div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-teal-600" /> Avg. Consultation: 15 min</span>
                    <span className="font-semibold text-teal-700">Waiting: 2 Patients</span>
                  </div>
                </div>

                {/* Digital Health Card teaser */}
                <div className="p-4 rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 text-white space-y-2 shadow-md">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>CAREHEALTH SMART UHID</span>
                    <span className="font-mono text-teal-400">CHP-2026-1001</span>
                  </div>
                  <div className="font-bold text-base">Rohan Mehra</div>
                  <div className="flex items-center justify-between text-xs text-slate-300 pt-1">
                    <span>Blood Group: <strong className="text-white">B+</strong></span>
                    <span>Emergency: <strong className="text-white">+91-9876549999</strong></span>
                  </div>
                </div>

                <button 
                  onClick={handleBookNow}
                  className="w-full py-2.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg transition-colors flex items-center justify-center gap-1"
                >
                  <span>Experience Patient Workflow</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Departments Section */}
      <section id="departments" className="py-16 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs uppercase tracking-widest text-teal-600 font-bold mb-2">Medical Excellence</h2>
            <h3 className="text-3xl font-extrabold text-slate-900">Hospital Departments</h3>
            <p className="text-sm text-slate-600 mt-2">Comprehensive inpatient and outpatient clinical specialties powered by modern diagnostic technologies.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {departments.map((dept) => (
              <div 
                key={dept.id} 
                className="p-6 rounded-2xl border border-slate-200 hover:border-teal-500/50 hover:shadow-lg transition-all group bg-slate-50/50 hover:bg-white"
              >
                <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Building2 className="w-6 h-6" />
                </div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-slate-900 text-lg">{dept.name}</h4>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-bold">{dept.code}</span>
                </div>
                <p className="text-xs text-slate-600 mb-4 line-clamp-2 leading-relaxed">{dept.description}</p>
                <div className="flex items-center justify-between pt-4 border-t border-slate-200/60 text-xs">
                  <span className="text-slate-500 font-medium">Head: {dept.head_doctor_name || 'Senior Consultant'}</span>
                  <span className="font-semibold text-teal-700">{dept.doctor_count} Doctors</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Smart Doctor Finder Section */}
      <section id="doctors" className="py-16 bg-slate-50 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <h2 className="text-xs uppercase tracking-widest text-teal-600 font-bold mb-2">Specialist Directory</h2>
              <h3 className="text-3xl font-extrabold text-slate-900">Find Available Doctors</h3>
              <p className="text-sm text-slate-600 mt-1">Filter by specialty, department, or experience for prompt appointments.</p>
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
                  className="pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 w-60 shadow-sm"
                />
              </div>

              <select
                value={selectedDept || ''}
                onChange={(e) => setSelectedDept(e.target.value ? Number(e.target.value) : undefined)}
                className="py-2 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-sm text-slate-700"
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
              <div key={doc.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                <div>
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-base shadow-sm">
                      {doc.user?.full_name.replace('Dr. ', '').charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{doc.user?.full_name}</h4>
                      <p className="text-xs text-teal-600 font-semibold">{doc.specialization}</p>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600 mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <p><strong className="text-slate-800">Dept:</strong> {doc.department_name}</p>
                    <p><strong className="text-slate-800">Experience:</strong> {doc.experience_years}+ Years</p>
                    <p><strong className="text-slate-800">Qualification:</strong> {doc.qualification}</p>
                    <p><strong className="text-slate-800">Consultation:</strong> ₹{doc.consultation_fee}</p>
                  </div>

                  <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">{doc.biography}</p>
                </div>

                <button
                  onClick={handleBookNow}
                  className="w-full py-2 bg-teal-50 hover:bg-teal-600 text-teal-700 hover:text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Book Consultation</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs uppercase tracking-widest text-teal-600 font-bold mb-2">Hospital Advantages</h2>
            <h3 className="text-3xl font-extrabold text-slate-900">Why Patients Trust CareHealth Point</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
              <Clock className="w-8 h-8 text-teal-600 mb-3" />
              <h4 className="font-bold text-slate-900 text-sm mb-1">Zero-Wait OPD Queue</h4>
              <p className="text-xs text-slate-600 leading-relaxed">Live wait-time tracking so patients know exact queue status before arriving.</p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
              <Shield className="w-8 h-8 text-teal-600 mb-3" />
              <h4 className="font-bold text-slate-900 text-sm mb-1">Encrypted Health Records</h4>
              <p className="text-xs text-slate-600 leading-relaxed">Tamper-evident prescriptions, diagnostic history, and patient confidentiality.</p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
              <Award className="w-8 h-8 text-teal-600 mb-3" />
              <h4 className="font-bold text-slate-900 text-sm mb-1">Board-Certified Doctors</h4>
              <p className="text-xs text-slate-600 leading-relaxed">Verified medical credentials, senior department heads, and multidisciplinary care.</p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
              <PhoneCall className="w-8 h-8 text-teal-600 mb-3" />
              <h4 className="font-bold text-slate-900 text-sm mb-1">24/7 Rapid Emergency</h4>
              <p className="text-xs text-slate-600 leading-relaxed">Level-1 trauma center, round-the-clock cardiac interventions, and ICU readiness.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
