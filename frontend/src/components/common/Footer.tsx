import React, { useState } from 'react';
import { Activity, ShieldAlert, PhoneCall, Mail, MapPin, Clock, ShieldCheck, FileText, ChevronRight, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  const [modalType, setModalType] = useState<'privacy' | 'terms' | null>(null);

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          
          {/* Brand & Hospital Overview */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center space-x-2.5 text-white">
              <div className="w-9 h-9 rounded-xl bg-teal-600 flex items-center justify-center shadow-lg shadow-teal-600/30">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-xl font-extrabold tracking-tight">CareHealth Point</span>
                <span className="block text-[10px] uppercase font-mono tracking-widest text-teal-400">Hospitals & Research Institute</span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed pr-4">
              CareHealth Point is a premier tertiary-care multispecialty hospital committed to clinical excellence, compassionate patient care, and modern healthcare automation. Accredited for international safety and clinical quality standards.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-800/90 text-teal-400 rounded-lg text-[11px] font-semibold border border-slate-700/60">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                <span>NABH & JCI Standard Accredited</span>
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-slate-800/90 text-slate-300 rounded-lg text-[11px] font-semibold border border-slate-700/60">
                <Clock className="w-3.5 h-3.5 text-teal-400" />
                <span>OPD: Mon – Sat, 8:30 AM – 8:00 PM</span>
              </span>
            </div>
          </div>

          {/* Quick Clinical Portals */}
          <div>
            <h4 className="text-xs font-bold text-white tracking-widest uppercase mb-4 text-teal-400">
              Patient Services
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <Link to="/doctors" className="hover:text-teal-300 transition-colors flex items-center gap-1">
                  <ChevronRight className="w-3 h-3 text-teal-500" />
                  <span>Doctor Directory & Schedules</span>
                </Link>
              </li>
              <li>
                <Link to="/doctors" className="hover:text-teal-300 transition-colors flex items-center gap-1">
                  <ChevronRight className="w-3 h-3 text-teal-500" />
                  <span>Book Outpatient Consultation</span>
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-teal-300 transition-colors flex items-center gap-1">
                  <ChevronRight className="w-3 h-3 text-teal-500" />
                  <span>Digital Health Card & UHID</span>
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-teal-300 transition-colors flex items-center gap-1">
                  <ChevronRight className="w-3 h-3 text-teal-500" />
                  <span>New Patient Registration</span>
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-teal-300 transition-colors flex items-center gap-1">
                  <ChevronRight className="w-3 h-3 text-teal-500" />
                  <span>Patient Health Record Portal</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Medical Specialties */}
          <div>
            <h4 className="text-xs font-bold text-white tracking-widest uppercase mb-4 text-teal-400">
              Centers of Excellence
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link to="/doctors?department_id=1" className="hover:text-teal-300 transition-colors">Cardiology & Heart Center</Link></li>
              <li><Link to="/doctors?department_id=2" className="hover:text-teal-300 transition-colors">Neurology & Stroke Clinic</Link></li>
              <li><Link to="/doctors?department_id=3" className="hover:text-teal-300 transition-colors">Orthopedics & Joint Replacement</Link></li>
              <li><Link to="/doctors?department_id=4" className="hover:text-teal-300 transition-colors">Pediatrics & Neonatal Care</Link></li>
              <li><Link to="/doctors?department_id=5" className="hover:text-teal-300 transition-colors">Multidisciplinary Oncology</Link></li>
              <li><Link to="/doctors?department_id=6" className="hover:text-teal-300 transition-colors">Internal & Preventative Medicine</Link></li>
            </ul>
          </div>

          {/* Emergency, Contact & Campus */}
          <div>
            <h4 className="text-xs font-bold text-rose-400 tracking-widest uppercase mb-4 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-rose-500" />
              <span>24/7 Trauma Care</span>
            </h4>
            
            <div className="p-3.5 bg-rose-950/40 border border-rose-800/60 rounded-2xl mb-3 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-300 block">Emergency Ambulance</span>
              <a 
                href="tel:18002273669" 
                className="flex items-center gap-2 text-white font-extrabold text-sm hover:text-rose-300 transition-colors"
              >
                <PhoneCall className="w-4 h-4 text-rose-400 animate-pulse" />
                <span>+91-1800-CARE-NOW</span>
              </a>
              <p className="text-[10px] text-rose-300/80">Immediate cardiac & trauma resuscitation triage</p>
            </div>

            <div className="text-xs text-slate-400 space-y-1.5 pt-1">
              <p className="flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
                <span>Plot 44, Institutional Medical Area, New Delhi, India</span>
              </p>
              <p className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <span>contact@carehealthpoint.in</span>
              </p>
            </div>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Compliance */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <p>© 2026 CareHealth Point Hospitals & Research Institute. All rights reserved.</p>
          
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <button 
              onClick={() => setModalType('privacy')} 
              className="hover:text-teal-400 transition-colors"
            >
              Privacy Policy
            </button>
            <span className="text-slate-700">|</span>
            <button 
              onClick={() => setModalType('terms')} 
              className="hover:text-teal-400 transition-colors"
            >
              Terms of Clinical Service
            </button>
            <span className="text-slate-700">|</span>
            <Link to="/doctors" className="hover:text-teal-400 transition-colors">
              OPD Timings
            </Link>
          </div>
        </div>
      </div>

      {/* Modal for Privacy Policy / Terms */}
      {modalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
          <div className="bg-white text-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-teal-600" />
                <h3 className="font-bold text-slate-900 text-base">
                  {modalType === 'privacy' ? 'Patient Data Privacy Policy' : 'Terms of Clinical Service'}
                </h3>
              </div>
              <button 
                onClick={() => setModalType(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-600 space-y-3 max-h-72 overflow-y-auto pr-1 leading-relaxed">
              {modalType === 'privacy' ? (
                <>
                  <p>
                    <strong>1. Protection of Clinical Information:</strong> CareHealth Point complies with healthcare privacy guidelines. Patient medical records, consultation notes, laboratory investigations, and digital health cards are protected by encrypted storage and strict role-based access control.
                  </p>
                  <p>
                    <strong>2. Confidentiality:</strong> Your electronic prescriptions, medical history, and Universal Hospital ID (UHID) are accessible solely by authorized hospital physicians and yourself. We do not sell or share private clinical data with third-party advertising entities.
                  </p>
                  <p>
                    <strong>3. Data Rights:</strong> Patients may review, update, and request copies of their digital health records anytime through the authenticated Patient Health Portal.
                  </p>
                </>
              ) : (
                <>
                  <p>
                    <strong>1. Outpatient Consultations:</strong> OPD appointments booked via CareHealth Point allocate an electronic queue token for scheduled physician hours. Emergency admissions receive immediate triage priority.
                  </p>
                  <p>
                    <strong>2. Digital Health Identification:</strong> The issued UHID serves as your permanent patient identifier across all hospital departments, inpatient wards, pharmacy, and diagnostic services.
                  </p>
                  <p>
                    <strong>3. Emergency Care:</strong> For life-threatening emergencies, patients should utilize the 24/7 dedicated trauma line (+91-1800-CARE-NOW) or arrive directly at our Level-1 Emergency resuscitation center.
                  </p>
                </>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 text-right">
              <button
                onClick={() => setModalType(null)}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-xl transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};
