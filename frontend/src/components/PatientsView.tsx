import React, { useState } from 'react';
import { Plus, Search, Calendar, Phone, MapPin, ArrowLeft, FileText, TrendingUp, X, User, Edit2, Trash2 } from 'lucide-react';
import { Patient, Prescription, Doctor } from '../types/pharmacy';

interface PatientsViewProps {
  patients: Patient[];
  prescriptions: Prescription[];
  doctors: Doctor[];
  onOpenAddModal: () => void;
  onOpenNewRxForPatient: (patient: Patient) => void;
  onViewPrescription: (rx: Prescription) => void;
  onOpenEditModal?: (patient: Patient) => void;
  onDeletePatient?: (patientId: string) => void;
}

export const PatientsView: React.FC<PatientsViewProps> = ({
  patients,
  prescriptions,
  doctors,
  onOpenAddModal,
  onOpenNewRxForPatient,
  onViewPrescription,
  onOpenEditModal,
  onDeletePatient,
}) => {
  const [search, setSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const filteredPatients = patients.filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      p.Name.toLowerCase().includes(q) ||
      p.Phone.includes(q) ||
      p.PatientID.toLowerCase().includes(q) ||
      p.Address.toLowerCase().includes(q)
    );
  });

  // If patient profile is active:
  if (selectedPatient) {
    const patientRxList = prescriptions.filter((r) => r.PatientID === selectedPatient.PatientID);

    return (
      <div className="p-4 lg:p-8 max-w-5xl mx-auto space-y-6">
        {/* Back navigation */}
        <button
          onClick={() => setSelectedPatient(null)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Patients</span>
        </button>

        {/* Top Profile Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 flex items-center justify-center font-bold text-xl shadow-xs ring-2 ring-slate-100 dark:ring-slate-800">
              <User className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{selectedPatient.Name}</h2>
              <span className="text-xs font-mono font-medium text-slate-400">
                Patient ID: {selectedPatient.PatientID}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onOpenEditModal && (
              <button
                onClick={() => onOpenEditModal(selectedPatient)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all cursor-pointer"
                title="Edit Patient"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
            )}
            {onDeletePatient && (
              <button
                onClick={() => {
                  onDeletePatient(selectedPatient.PatientID);
                  setSelectedPatient(null);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-600 dark:text-rose-400 text-xs font-semibold transition-all cursor-pointer"
                title="Delete Patient"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            )}
            <button
              onClick={() => onOpenNewRxForPatient(selectedPatient)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Prescription</span>
            </button>
          </div>
        </div>

        {/* Small Information Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 font-medium block">Date of Birth</span>
              <span className="text-sm font-semibold text-slate-800">{selectedPatient.DateOfBirth}</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0">
              <Phone className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 font-medium block">Phone</span>
              <span className="text-sm font-semibold text-slate-800">{selectedPatient.Phone}</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] text-slate-400 font-medium block">Address</span>
              <span className="text-sm font-semibold text-slate-800 truncate block">{selectedPatient.Address}</span>
            </div>
          </div>
        </div>

        {/* Chart: Prescriptions over time */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Prescriptions Over Time</h3>
              <p className="text-xs text-slate-400">Order frequency history</p>
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-teal-600">
              <TrendingUp className="w-3.5 h-3.5" />
              Active Therapy
            </span>
          </div>

          {/* Simple minimal bar visualization */}
          <div className="h-20 flex items-end gap-3 pt-3">
            {[2, 1, 3, 2, 4, 3].map((val, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                <div
                  className="w-full bg-teal-500/20 hover:bg-teal-600 rounded-t-sm transition-colors cursor-pointer"
                  style={{ height: `${(val / 4) * 100}%` }}
                />
                <span className="text-[10px] text-slate-400">Month {idx + 1}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Prescription History Timeline / List */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">
              Prescription History ({patientRxList.length})
            </h3>
          </div>

          <div className="divide-y divide-slate-100">
            {patientRxList.length > 0 ? (
              patientRxList.map((rx) => {
                const doctor = doctors.find((d) => d.DoctorID === rx.DoctorID);
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
                          {doctor ? doctor.Name : rx.DoctorID}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-medium text-slate-500 block">{rx.Date}</span>
                      <span className="text-[10px] text-teal-600 font-semibold">{rx.status || 'Dispensed'}</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-slate-400 py-4 text-center">No prescriptions recorded for this patient.</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Main Directory List
  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Patients</h1>
          <p className="text-xs text-slate-500 mt-0.5">Patient electronic records directory</p>
        </div>

        <button
          onClick={onOpenAddModal}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Patient</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search patients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 transition-all"
          />
        </div>
      </div>

      {/* Clean Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Date of Birth</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4">Last Prescription</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredPatients.map((pat) => {
                const patRx = prescriptions.find((r) => r.PatientID === pat.PatientID);
                return (
                  <tr
                    key={pat.PatientID}
                    onClick={() => setSelectedPatient(pat)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 flex items-center justify-center font-bold text-xs shrink-0 ring-1 ring-slate-200 dark:ring-slate-700">
                          {pat.Name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{pat.Name}</p>
                          <span className="text-[10px] text-slate-400 font-mono">{pat.PatientID}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">{pat.DateOfBirth}</td>
                    <td className="py-3.5 px-4 text-slate-600">{pat.Phone}</td>
                    <td className="py-3.5 px-4">
                      {patRx ? (
                        <div>
                          <span className="font-mono text-teal-700 font-semibold">{patRx.PrescriptionID}</span>
                          <span className="text-[11px] text-slate-400 block">{patRx.Date}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px]">None</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedPatient(pat)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs transition-colors cursor-pointer"
                        >
                          Profile
                        </button>
                        {onOpenEditModal && (
                          <button
                            onClick={() => onOpenEditModal(pat)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                            title="Edit Patient"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {onDeletePatient && (
                          <button
                            onClick={() => onDeletePatient(pat.PatientID)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete Patient"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => onOpenNewRxForPatient(pat)}
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
