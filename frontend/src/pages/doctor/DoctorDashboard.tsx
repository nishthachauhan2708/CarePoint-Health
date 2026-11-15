import React, { useState, useEffect } from 'react';
import { 
  CalendarCheck, Clock, FileText, CheckCircle2, User, 
  Plus, Trash2, Heart, Activity, AlertCircle, Stethoscope 
} from 'lucide-react';
import { api } from '../../services/api';
import { Appointment, Prescription, ConsultationNote, MedicationItem } from '../../types';
import { Sidebar } from '../../components/common/Sidebar';
import { useAuth } from '../../context/AuthContext';

export const DoctorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('schedule');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);

  // Consultation Note Modal State
  const [isConsultModalOpen, setIsConsultModalOpen] = useState(false);
  const [vitals, setVitals] = useState({
    blood_pressure: '120/80 mmHg',
    pulse_rate: '72 bpm',
    temperature: '98.4 F',
    spo2: '99%',
    weight: '70 kg'
  });
  const [clinicalImpression, setClinicalImpression] = useState('');
  const [followUp, setFollowUp] = useState('');

  // Prescription Generator Modal State
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
  const [diagnosis, setDiagnosis] = useState('');
  const [additionalAdvice, setAdditionalAdvice] = useState('');
  const [medications, setMedications] = useState<MedicationItem[]>([
    { medicine_name: '', dosage: '', frequency: '1-0-1 (Twice daily)', duration: '5 days', instructions: 'After meals' }
  ]);

  const loadAppointments = async () => {
    try {
      const data = await api.appointments.getAll();
      setAppointments(data);
    } catch (err) {
      console.error("Failed to load doctor appointments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const handleUpdateStatus = async (apptId: number, newStatus: any) => {
    try {
      await api.appointments.updateStatus(apptId, newStatus);
      loadAppointments();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const handleAddMedicationRow = () => {
    setMedications([
      ...medications,
      { medicine_name: '', dosage: '', frequency: '1-0-0 (Morning)', duration: '7 days', instructions: 'After meals' }
    ]);
  };

  const handleRemoveMedicationRow = (index: number) => {
    setMedications(medications.filter((_, i) => i !== index));
  };

  const handleMedicationChange = (index: number, field: keyof MedicationItem, value: string) => {
    const updated = [...medications];
    updated[index][field] = value;
    setMedications(updated);
  };

  const handleSubmitConsultation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppt) return;
    try {
      await api.consultations.record({
        appointment_id: selectedAppt.id,
        clinical_impression: clinicalImpression,
        vital_signs: vitals,
        follow_up_recommendation: followUp
      });
      alert("Consultation notes & patient vitals recorded successfully!");
      setIsConsultModalOpen(false);
      setClinicalImpression('');
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to record consultation");
    }
  };

  const handleSubmitPrescription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppt) return;
    try {
      await api.prescriptions.create({
        appointment_id: selectedAppt.id,
        diagnosis,
        medications: medications.filter(m => m.medicine_name.trim() !== ''),
        additional_advice: additionalAdvice
      });
      alert("Electronic Prescription generated & dispatched to patient portal!");
      setIsPrescriptionModalOpen(false);
      loadAppointments();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to issue prescription");
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
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Doctor Clinical Console</h1>
              <p className="text-xs text-slate-500 mt-0.5">Welcome, {user?.full_name}. Review your queue, clinical notes, and electronic Rx</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Doctor OPD Status: Available</span>
              </span>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 font-medium">Assigned Patients</span>
                <div className="text-2xl font-black text-slate-900">{appointments.length}</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                <CalendarCheck className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 font-medium">In Waiting Queue</span>
                <div className="text-2xl font-black text-amber-600">
                  {appointments.filter(a => a.status === 'confirmed' || a.status === 'pending').length}
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <Clock className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 font-medium">Completed Today</span>
                <div className="text-2xl font-black text-emerald-600">
                  {appointments.filter(a => a.status === 'completed').length}
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Appointments Queue Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Today's Patient Schedule</h3>
                <p className="text-xs text-slate-500">Live consult queue, clinical history, and prescription actions</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Queue #</th>
                    <th className="p-3">Patient Details</th>
                    <th className="p-3">Date & Time Slot</th>
                    <th className="p-3">Symptoms / Chief Complaint</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Clinical Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {appointments.map((appt) => (
                    <tr key={appt.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 font-mono font-bold text-teal-700 text-sm">
                        #{appt.queue_number}
                      </td>
                      <td className="p-3">
                        <div className="font-semibold text-slate-900">{appt.patient_name}</div>
                        <div className="text-[10px] font-mono text-slate-400">{appt.patient_uhid}</div>
                      </td>
                      <td className="p-3">
                        <div className="text-slate-800 font-medium">{appt.appointment_date}</div>
                        <div className="text-[10px] text-slate-500">{appt.time_slot}</div>
                      </td>
                      <td className="p-3 text-slate-600 max-w-xs truncate">
                        {appt.symptoms || 'General Check-up'}
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
                      <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                        {appt.status !== 'completed' && (
                          <button
                            onClick={() => handleUpdateStatus(appt.id, 'confirmed')}
                            className="px-2.5 py-1 text-[11px] font-semibold bg-teal-50 text-teal-700 hover:bg-teal-100 rounded-md transition-colors"
                          >
                            Call Patient
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setSelectedAppt(appt);
                            setIsConsultModalOpen(true);
                          }}
                          className="px-2.5 py-1 text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors"
                        >
                          Vitals & Notes
                        </button>
                        <button
                          onClick={() => {
                            setSelectedAppt(appt);
                            setIsPrescriptionModalOpen(true);
                          }}
                          className="px-2.5 py-1 text-[11px] font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-md shadow-sm transition-colors"
                        >
                          Issue Rx
                        </button>
                      </td>
                    </tr>
                  ))}
                  {appointments.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-400">
                        No patient appointments scheduled for this doctor currently.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </main>

      {/* Record Vitals & Clinical Notes Modal */}
      {isConsultModalOpen && selectedAppt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Consultation Notes – {selectedAppt.patient_name}
            </h3>
            <p className="text-xs text-slate-500 mb-4">Patient UHID: {selectedAppt.patient_uhid} | Token #{selectedAppt.queue_number}</p>

            <form onSubmit={handleSubmitConsultation} className="space-y-4">
              {/* Vitals Grid */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Patient Vital Signs</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-500">Blood Pressure</label>
                    <input
                      type="text"
                      value={vitals.blood_pressure}
                      onChange={(e) => setVitals({ ...vitals, blood_pressure: e.target.value })}
                      className="w-full px-2 py-1 text-xs bg-white border border-slate-200 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500">Pulse Rate</label>
                    <input
                      type="text"
                      value={vitals.pulse_rate}
                      onChange={(e) => setVitals({ ...vitals, pulse_rate: e.target.value })}
                      className="w-full px-2 py-1 text-xs bg-white border border-slate-200 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500">Body Temp</label>
                    <input
                      type="text"
                      value={vitals.temperature}
                      onChange={(e) => setVitals({ ...vitals, temperature: e.target.value })}
                      className="w-full px-2 py-1 text-xs bg-white border border-slate-200 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500">SpO2 Oxygen</label>
                    <input
                      type="text"
                      value={vitals.spo2}
                      onChange={(e) => setVitals({ ...vitals, spo2: e.target.value })}
                      className="w-full px-2 py-1 text-xs bg-white border border-slate-200 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500">Weight</label>
                    <input
                      type="text"
                      value={vitals.weight}
                      onChange={(e) => setVitals({ ...vitals, weight: e.target.value })}
                      className="w-full px-2 py-1 text-xs bg-white border border-slate-200 rounded-md"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Clinical Impression & Findings</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Record symptoms evaluation, physical examination findings, and diagnosis..."
                  value={clinicalImpression}
                  onChange={(e) => setClinicalImpression(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Follow-up Recommendation</label>
                <input
                  type="text"
                  placeholder="e.g. Review after 10 days with fasting blood glucose report"
                  value={followUp}
                  onChange={(e) => setFollowUp(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsConsultModalOpen(false)}
                  className="px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-lg shadow-sm"
                >
                  Save Consultation Notes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Electronic Prescription Generator Modal */}
      {isPrescriptionModalOpen && selectedAppt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Generate Digital Prescription (Rx)</h3>
                <p className="text-xs text-slate-500">Patient: {selectedAppt.patient_name} ({selectedAppt.patient_uhid})</p>
              </div>
              <span className="text-xs font-mono px-2.5 py-1 bg-teal-50 text-teal-800 rounded font-semibold">
                CareHealth e-Rx
              </span>
            </div>

            <form onSubmit={handleSubmitPrescription} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Diagnosis</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acute Bronchitis / Stage 1 Hypertension"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* Medication Table Builder */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-slate-700">Prescribed Medications</label>
                  <button
                    type="button"
                    onClick={handleAddMedicationRow}
                    className="text-xs text-teal-600 font-semibold flex items-center gap-1 hover:text-teal-700"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Medicine</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {medications.map((med, idx) => (
                    <div key={idx} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-4">
                        <input
                          type="text"
                          required
                          placeholder="Medicine (e.g. Amoxicillin)"
                          value={med.medicine_name}
                          onChange={(e) => handleMedicationChange(idx, 'medicine_name', e.target.value)}
                          className="w-full px-2 py-1 text-xs bg-white border border-slate-200 rounded"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="text"
                          required
                          placeholder="Dosage (500mg)"
                          value={med.dosage}
                          onChange={(e) => handleMedicationChange(idx, 'dosage', e.target.value)}
                          className="w-full px-2 py-1 text-xs bg-white border border-slate-200 rounded"
                        />
                      </div>
                      <div className="col-span-3">
                        <input
                          type="text"
                          required
                          placeholder="Freq (1-0-1)"
                          value={med.frequency}
                          onChange={(e) => handleMedicationChange(idx, 'frequency', e.target.value)}
                          className="w-full px-2 py-1 text-xs bg-white border border-slate-200 rounded"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="text"
                          required
                          placeholder="Duration (5 days)"
                          value={med.duration}
                          onChange={(e) => handleMedicationChange(idx, 'duration', e.target.value)}
                          className="w-full px-2 py-1 text-xs bg-white border border-slate-200 rounded"
                        />
                      </div>
                      <div className="col-span-1 text-right">
                        {medications.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveMedicationRow(idx)}
                            className="p-1 text-slate-400 hover:text-rose-600"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Dietary & Lifestyle Advice</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Drink plenty of fluids, avoid cold water, get adequate rest..."
                  value={additionalAdvice}
                  onChange={(e) => setAdditionalAdvice(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsPrescriptionModalOpen(false)}
                  className="px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-lg shadow-sm"
                >
                  Sign & Issue Prescription
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
