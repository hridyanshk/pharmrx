import React from 'react';
import {
  User,
  Calendar,
  Phone,
  MapPin,
  AlertTriangle,
  FileText,
  Download,
  Pill,
  CheckCircle2,
} from 'lucide-react';
import { Patient, Prescription, PrescriptionItem, Medicine, Doctor } from '../types/pharmacy';
import { formatINR } from '../utils/currency';

interface PatientProfileViewProps {
  patient: Patient;
  prescriptions: Prescription[];
  prescriptionItems: PrescriptionItem[];
  medicines: Medicine[];
  doctors: Doctor[];
  onViewPrescription: (rx: Prescription) => void;
}

export const PatientProfileView: React.FC<PatientProfileViewProps> = ({
  patient,
  prescriptions,
  prescriptionItems,
  medicines,
  doctors,
  onViewPrescription,
}) => {
  const patientRxList = prescriptions.filter((r) => r.PatientID === patient.PatientID);

  const handleDownloadSummary = () => {
    alert(`Downloading verified clinical prescription summary for ${patient.Name} (${patient.PatientID})...`);
  };

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Top Profile Card */}
      <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 transition-colors">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 flex items-center justify-center font-bold text-2xl shadow-xs ring-4 ring-cyan-50 dark:ring-cyan-900/30">
            <User className="w-10 h-10" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{patient.Name}</h2>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200/50 dark:border-teal-800/50">
                <CheckCircle2 className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                Active Patient
              </span>
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-mono mt-1">
              Patient ID: {patient.PatientID} • National Health ID: ABHA-IND-901244
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={handleDownloadSummary}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Summary</span>
          </button>
        </div>
      </div>

      {/* Basic Demographics & Medical Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-2xs space-y-1 transition-colors">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-medium">
            <Calendar className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span>Date of Birth</span>
          </div>
          <p className="font-semibold text-slate-900 dark:text-white text-sm">{patient.DateOfBirth}</p>
          <span className="text-[10px] text-slate-400 dark:text-slate-500">Verified medical record</span>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-2xs space-y-1 transition-colors">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-medium">
            <Phone className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span>Mobile Phone</span>
          </div>
          <p className="font-semibold text-slate-900 dark:text-white text-sm">{patient.Phone}</p>
          <span className="text-[10px] text-slate-400 dark:text-slate-500">SMS refill alerts enabled</span>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-2xs space-y-1 transition-colors">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-medium">
            <MapPin className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span>Residential Address</span>
          </div>
          <p className="font-semibold text-slate-900 dark:text-white text-xs truncate">{patient.Address}</p>
          <span className="text-[10px] text-slate-400 dark:text-slate-500">Primary delivery address</span>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-2xs space-y-1 transition-colors">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-medium">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span>Documented Allergies</span>
          </div>
          <p className="font-semibold text-rose-700 dark:text-rose-400 text-xs truncate">
            {patient.allergies?.join(', ') || 'No known drug allergies'}
          </p>
          <span className="text-[10px] text-slate-400 dark:text-slate-500">Formulary contraindication alert</span>
        </div>
      </div>

      {/* Prescription History Timeline */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-2xs space-y-6 transition-colors">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700/60">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Prescription History</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">All registered prescriptions and dispensation records</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
            {patientRxList.length} Records
          </span>
        </div>

        <div className="space-y-4">
          {patientRxList.length > 0 ? (
            patientRxList.map((rx) => {
              const doctor = doctors.find((d) => d.DoctorID === rx.DoctorID);
              const items = prescriptionItems.filter((i) => i.PrescriptionID === rx.PrescriptionID);

              return (
                <div
                  key={rx.PrescriptionID}
                  onClick={() => onViewPrescription(rx)}
                  className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-700/80 hover:border-teal-400 dark:hover:border-teal-600 transition-all cursor-pointer space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono font-bold text-teal-700 dark:text-teal-400 text-sm">
                        {rx.PrescriptionID}
                      </span>
                      <span className="text-slate-300 dark:text-slate-600">•</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">Date: {rx.Date}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                        Prescribed by: <strong className="text-slate-900 dark:text-white">{doctor?.Name || rx.DoctorID}</strong> ({doctor?.Specialization || 'Clinical'})
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200/50 dark:border-teal-800/50">
                        {rx.status || 'Dispensed'}
                      </span>
                    </div>
                  </div>

                  {/* Medicines List */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200/60 dark:border-slate-800">
                    {items.map((item) => {
                      const med = medicines.find((m) => m.MedicineID === item.MedicineID);
                      const unitPrice = med ? med.Price : 0;
                      return (
                        <div
                          key={item.ItemID}
                          className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-teal-50 dark:bg-teal-950/60 flex items-center justify-center text-teal-600 dark:text-teal-400">
                              <Pill className="w-3.5 h-3.5" />
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900 dark:text-white">{med?.Name || item.MedicineID}</p>
                              <span className="text-[11px] text-slate-400 dark:text-slate-500">
                                Dosage: {item.Dosage} • Qty: {item.Quantity}
                              </span>
                            </div>
                          </div>
                          <span className="font-mono font-semibold text-teal-700 dark:text-teal-400">
                            {formatINR(unitPrice * item.Quantity)}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {rx.Notes && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 italic bg-white dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200/40 dark:border-slate-700/40">
                      Doctor's Notes: "{rx.Notes}"
                    </p>
                  )}
                </div>
              );
            })
          ) : (
            <p className="text-xs text-slate-400 dark:text-slate-500 py-6 text-center">
              No registered prescriptions found in this patient record.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
