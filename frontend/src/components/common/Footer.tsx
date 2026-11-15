import React from 'react';
import { Activity, Heart, ShieldAlert, PhoneCall, Mail, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Column */}
          <div className="md:col-span-1">
            <div className="flex items-center space-x-2 text-white mb-4">
              <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">CareHealth Point</span>
            </div>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Better Healthcare. Smarter Management. An enterprise hospital management system engineered with modern cloud-native DevOps practices.
            </p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-800 text-teal-400 rounded-md text-xs font-mono">
              <span>Capstone Project: ENSP461</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Clinical Portals</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><a href="/login" className="hover:text-teal-400 transition-colors">Admin Management Hub</a></li>
              <li><a href="/login" className="hover:text-teal-400 transition-colors">Doctor Consultation Console</a></li>
              <li><a href="/login" className="hover:text-teal-400 transition-colors">Reception & Walk-in Desk</a></li>
              <li><a href="/login" className="hover:text-teal-400 transition-colors">Patient Digital Health Portal</a></li>
            </ul>
          </div>

          {/* Medical Specialties */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Centers of Excellence</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>Cardiovascular Care & Diagnostics</li>
              <li>Neurology & Stroke Management</li>
              <li>Orthopedics & Joint Replacement</li>
              <li>Pediatrics & Neonatal Care</li>
              <li>Comprehensive Oncology</li>
            </ul>
          </div>

          {/* Emergency & Campus */}
          <div>
            <h4 className="text-sm font-semibold text-rose-400 tracking-wider uppercase mb-4 flex items-center gap-1">
              <ShieldAlert className="w-4 h-4" /> Urgent Care & Trauma
            </h4>
            <div className="p-3 bg-rose-950/40 border border-rose-800/50 rounded-xl mb-3">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <PhoneCall className="w-4 h-4 text-rose-400 animate-pulse" />
                <span>+91-1800-CARE-NOW</span>
              </div>
              <p className="text-[11px] text-rose-300 mt-1">24/7 Dedicated Emergency Ambulance Response</p>
            </div>
            <div className="text-xs text-slate-400 space-y-1">
              <p className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-500" /> Plot 44, Institutional Area, New Delhi</p>
              <p className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-slate-500" /> emergency@carehealthpoint.in</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500">
          <p>© 2026 CareHealth Point – Better Healthcare. Smarter Management. Educational demonstration platform.</p>
          <p className="mt-2 md:mt-0 flex items-center gap-1">
            Built with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for DevOps & Cloud-Native Engineering.
          </p>
        </div>
      </div>
    </footer>
  );
};
