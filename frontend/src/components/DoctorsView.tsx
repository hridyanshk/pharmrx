import React, { useState } from 'react';
import { Plus, Search, ArrowLeft, Stethoscope, Phone, Mail, FileText, TrendingUp, Edit2, Trash2 } from 'lucide-react';
import { Doctor, Prescription, Patient } from '../types/pharmacy';

interface DoctorsViewProps {
  doctors: Doctor[];
  prescriptions: Prescription[];
  patients: Patient[];
  onOpenAddModal: () => void;
  onOpenNewRxForDoctor: (doc: Doctor) => void;
  onViewPrescription: (rx: Prescription) => void;
  onOpenEditModal?: (doc: Doctor) => void;
  onDeleteDoctor?: (doctorId: string) => void;
}

export const DoctorsView: React.FC<DoctorsViewProps> = ({
  doctors,
  prescriptions,
  patients,
  onOpenAddModal,
  onOpenNewRxForDoctor,
  onViewPrescription,
  onOpenEditModal,
  onDeleteDoctor,
}) => {
  const [search, setSearch] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

  const filteredDoctors = doctors.filter((d) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      d.Name.toLowerCase().includes(q) ||
      d.Specialization.toLowerCase().includes(q) ||
      d.Phone.includes(q) ||
      d.DoctorID.toLowerCase().includes(q)
    );
  });

  // If Doctor Profile is open
  if (selectedDoctor) {
    const doctorRxList = prescriptions.filter((r) => r.DoctorID === selectedDoctor.DoctorID);

    return (
      <div className="p-4 lg:p-8 max-w-5xl mx-auto space-y-6">
        {/* Back navigation */}
        <button
          onClick={() => setSelectedDoctor(null)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Doctors</span>
        </button>

        {/* Doctor Header Profile */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-xl shadow-xs">
              <Stethoscope className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{selectedDoctor.Name}</h2>
              <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-50 text-cyan-700">
                {selectedDoctor.Specialization}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onOpenEditModal && (
              <button
                onClick={() => onOpenEditModal(selectedDoctor)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all cursor-pointer"
                title="Edit Doctor"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
            )}
            {onDeleteDoctor && (
              <button
                onClick={() => {
                  onDeleteDoctor(selectedDoctor.DoctorID);
                  setSelectedDoctor(null);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-600 dark:text-rose-400 text-xs font-semibold transition-all cursor-pointer"
                title="Delete Doctor"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            )}
            <button
              onClick={() => onOpenNewRxForDoctor(selectedDoctor)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Prescription</span>
            </button>
          </div>
        </div>

        {/* Contact Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
              <Phone className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 font-medium block">Phone Contact</span>
              <span className="text-sm font-semibold text-slate-800">{selectedDoctor.Phone}</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 font-medium block">Clinical Email</span>
              <span className="text-sm font-semibold text-slate-800">
                {selectedDoctor.email || 'clinician@pharmrx-health.com'}
              </span>
            </div>
          </div>
        </div>

        {/* Prescription Activity (Line/Bar Chart over time) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Prescription Activity</h3>
              <p className="text-xs text-slate-400">Prescriptions written over the past 6 weeks</p>
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-teal-600">
              <TrendingUp className="w-3.5 h-3.5" />
              Active Prescriber
            </span>
          </div>

          <div className="h-20 flex items-end gap-3 pt-3">
            {[12, 18, 14, 22, 26, 30].map((val, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                <div
                  className="w-full bg-cyan-500/20 hover:bg-cyan-600 rounded-t-sm transition-colors cursor-pointer"
                  style={{ height: `${(val / 30) * 100}%` }}
                />
                <span className="text-[10px] text-slate-400">Week {idx + 1}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Prescriptions (Compact list) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">
              Recent Prescriptions ({doctorRxList.length})
            </h3>
          </div>

          <div className="divide-y divide-slate-100">
            {doctorRxList.length > 0 ? (
              doctorRxList.map((rx) => {
                const patient = patients.find((p) => p.PatientID === rx.PatientID);
                return (
                  <div
                    key={rx.PrescriptionID}
                    onClick={() => onViewPrescription(rx)}
                    className="py-3 px-2 flex items-center justify-between hover:bg-slate-50 rounded-xl transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-mono text-xs font-bold text-teal-700 group-hover:text-teal-800">
                          {rx.PrescriptionID}
                        </span>
                        <p className="text-xs text-slate-700 font-medium">
                          Patient: {patient ? patient.Name : rx.PatientID}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-medium text-slate-500 block">{rx.Date}</span>
                      <span className="text-[10px] text-teal-600 font-semibold">{rx.status || 'Active'}</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-slate-400 py-4 text-center">No prescriptions authored yet.</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Doctors Directory View
  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Doctors</h1>
          <p className="text-xs text-slate-500 mt-0.5">Physicians &amp; prescribing clinicians directory</p>
        </div>

        <button
          onClick={onOpenAddModal}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Doctor</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search doctors by name or specialization..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 transition-all"
          />
        </div>
      </div>

      {/* Directory Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Doctor Name</th>
                <th className="py-3 px-4">Specialization</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4">Prescriptions</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredDoctors.map((doc) => {
                const rxCount = prescriptions.filter((r) => r.DoctorID === doc.DoctorID).length;
                return (
                  <tr
                    key={doc.DoctorID}
                    onClick={() => setSelectedDoctor(doc)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-xs">
                          {doc.Name.split(' ')[1]?.[0] || 'D'}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{doc.Name}</p>
                          <span className="text-[10px] text-slate-400 font-mono">{doc.DoctorID}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-cyan-50 text-cyan-700">
                        {doc.Specialization}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{doc.Phone}</td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-800">{rxCount}</span>
                      <span className="text-[11px] text-slate-400 ml-1">orders</span>
                    </td>
                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedDoctor(doc)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs transition-colors cursor-pointer"
                        >
                          Profile
                        </button>
                        {onOpenEditModal && (
                          <button
                            onClick={() => onOpenEditModal(doc)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                            title="Edit Doctor"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {onDeleteDoctor && (
                          <button
                            onClick={() => onDeleteDoctor(doc.DoctorID)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete Doctor"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => onOpenNewRxForDoctor(doc)}
                          className="px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 font-semibold text-xs transition-colors cursor-pointer"
                        >
                          Write Rx
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
