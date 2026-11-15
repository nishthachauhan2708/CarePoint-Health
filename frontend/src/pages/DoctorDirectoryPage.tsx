import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, Filter, Calendar, Clock, Award, ShieldCheck, 
  Stethoscope, Building2, Star, ArrowRight, UserCheck, CheckCircle2, ChevronRight
} from 'lucide-react';
import { api } from '../services/api';
import { Doctor, Department } from '../types';

export const DoctorDirectoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter and sort state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [selectedDay, setSelectedDay] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'experience' | 'fee_asc' | 'fee_desc' | 'name'>('experience');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [docsData, deptsData] = await Promise.all([
          api.doctors.getAll(),
          api.departments.getAll()
        ]);
        setDoctors(docsData);
        setDepartments(deptsData);
      } catch (err: any) {
        console.error('Failed to load doctors:', err);
        setError('Unable to load doctors directory at this time. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter logic
  const filteredDoctors = doctors.filter((doc) => {
    // Search query match (name, specialization, qualification)
    const fullName = doc.user?.full_name || '';
    const matchesSearch = searchQuery === '' || 
      fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.specialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.qualification.toLowerCase().includes(searchQuery.toLowerCase());

    // Department match
    const matchesDept = selectedDept === 'all' || doc.department_id === Number(selectedDept);

    // Day availability match
    const matchesDay = selectedDay === 'all' || 
      (doc.availabilities && doc.availabilities.some(a => a.day_of_week.toLowerCase() === selectedDay.toLowerCase() && a.is_available));

    return matchesSearch && matchesDept && matchesDay;
  });

  // Sort logic
  const sortedDoctors = [...filteredDoctors].sort((a, b) => {
    if (sortBy === 'experience') {
      return b.experience_years - a.experience_years;
    }
    if (sortBy === 'fee_asc') {
      return a.consultation_fee - b.consultation_fee;
    }
    if (sortBy === 'fee_desc') {
      return b.consultation_fee - a.consultation_fee;
    }
    if (sortBy === 'name') {
      const nameA = a.user?.full_name || '';
      const nameB = b.user?.full_name || '';
      return nameA.localeCompare(nameB);
    }
    return 0;
  });

  // Unique working days list across doctors
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-slate-900 text-white rounded-3xl p-8 sm:p-10 shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-12 -translate-y-8 opacity-10 pointer-events-none">
            <Stethoscope className="w-96 h-96 text-teal-300" />
          </div>
          <div className="relative z-10 max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>Verified Clinical Specialists & Department Leads</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Doctor Directory & OPD Schedules
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Find board-certified physicians, review active consultation hours, compare qualifications, and book direct appointments with live OPD queue allocation.
            </p>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            
            {/* Search Input */}
            <div className="md:col-span-5 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search by doctor name, specialty, or qualification..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
              />
            </div>

            {/* Department Filter */}
            <div className="md:col-span-3">
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="w-full py-2.5 px-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-700 transition-all"
              >
                <option value="all">All Departments</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                ))}
              </select>
            </div>

            {/* Day Availability Filter */}
            <div className="md:col-span-2">
              <select
                value={selectedDay}
                onChange={(e) => setSelectedDay(e.target.value)}
                className="w-full py-2.5 px-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-700 transition-all"
              >
                <option value="all">Any Day</option>
                {daysOfWeek.map((day) => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="md:col-span-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full py-2.5 px-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-700 transition-all"
              >
                <option value="experience">Experience (High to Low)</option>
                <option value="fee_asc">Fee (Low to High)</option>
                <option value="fee_desc">Fee (High to Low)</option>
                <option value="name">Name (A-Z)</option>
              </select>
            </div>

          </div>

          {/* Active summary counts */}
          <div className="flex flex-wrap items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
            <span>
              Showing <strong className="text-slate-800">{sortedDoctors.length}</strong> of <strong className="text-slate-800">{doctors.length}</strong> active doctors
            </span>
            {(searchQuery || selectedDept !== 'all' || selectedDay !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedDept('all');
                  setSelectedDay('all');
                  setSortBy('experience');
                }}
                className="text-teal-600 hover:text-teal-700 font-semibold underline"
              >
                Reset All Filters
              </button>
            )}
          </div>
        </div>

        {/* Doctors Grid / Loading / Empty State */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="inline-block w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-sm text-slate-500 font-medium">Loading hospital doctors directory...</p>
          </div>
        ) : error ? (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 p-6 rounded-2xl text-center">
            <p className="text-sm font-semibold">{error}</p>
          </div>
        ) : sortedDoctors.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto space-y-4">
            <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
              <UserCheck className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">No doctors match your criteria</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Try adjusting your search terms, selecting "All Departments", or checking another consultation day.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedDept('all');
                setSelectedDay('all');
              }}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-xl transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedDoctors.map((doc) => {
              const workingDays = doc.availabilities?.filter(a => a.is_available).map(a => a.day_of_week) || [];
              const timing = doc.availabilities && doc.availabilities.length > 0 
                ? `${doc.availabilities[0].start_time} - ${doc.availabilities[0].end_time}`
                : '09:00 - 17:00';

              return (
                <div 
                  key={doc.id} 
                  className="bg-white rounded-2xl border border-slate-200/90 hover:border-teal-500/50 hover:shadow-lg transition-all p-6 flex flex-col justify-between group"
                >
                  <div className="space-y-4">
                    {/* Header info */}
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-700 text-white flex items-center justify-center text-xl font-bold shadow-md shadow-teal-700/20 shrink-0">
                        {doc.user?.full_name ? doc.user.full_name.replace('Dr. ', '').charAt(0) : 'D'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-100">
                            {doc.department_name}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            Lic: {doc.license_number}
                          </span>
                        </div>
                        <h3 className="font-bold text-slate-900 text-base truncate group-hover:text-teal-600 transition-colors">
                          {doc.user?.full_name}
                        </h3>
                        <p className="text-xs text-teal-600 font-medium truncate">
                          {doc.specialization}
                        </p>
                      </div>
                    </div>

                    {/* Qualifications & Experience Tag */}
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-1.5 text-xs text-slate-600">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Degree:</span>
                        <span className="font-semibold text-slate-800 text-right">{doc.qualification}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Clinical Experience:</span>
                        <span className="font-semibold text-slate-800">{doc.experience_years}+ Years</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Consultation Fee:</span>
                        <span className="font-bold text-teal-700">₹{doc.consultation_fee}</span>
                      </div>
                    </div>

                    {/* Weekly Schedule Days */}
                    <div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1.5">
                        <span className="flex items-center gap-1 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-teal-600" />
                          OPD Days
                        </span>
                        <span className="flex items-center gap-1 font-medium">
                          <Clock className="w-3.5 h-3.5 text-teal-600" />
                          {timing}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((abbr, idx) => {
                          const fullDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                          const isAvailable = workingDays.includes(fullDays[idx]);
                          return (
                            <span
                              key={abbr}
                              className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                                isAvailable
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold'
                                  : 'bg-slate-100 text-slate-300'
                              }`}
                            >
                              {abbr}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {/* Bio excerpt */}
                    {doc.biography && (
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed italic">
                        "{doc.biography}"
                      </p>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="grid grid-cols-2 gap-2 pt-4 mt-4 border-t border-slate-100">
                    <Link
                      to={`/doctors/${doc.id}`}
                      className="py-2.5 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl text-center border border-slate-200 transition-colors flex items-center justify-center gap-1"
                    >
                      <span>View Profile</span>
                    </Link>
                    <Link
                      to={`/doctors/${doc.id}`}
                      className="py-2.5 px-3 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-xl text-center shadow-sm transition-colors flex items-center justify-center gap-1"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Book Slot</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};
