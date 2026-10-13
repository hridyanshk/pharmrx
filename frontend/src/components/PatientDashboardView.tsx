import React from 'react';
import {
  Pill,
  FileText,
  Calendar,
  Clock,
  User,
  ArrowRight,
  ShieldCheck,
  Download,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { Patient, Prescription, PrescriptionItem, Medicine, Doctor } from '../types/pharmacy';
import { formatINR } from '../utils/currency';

interface PatientDashboardViewProps {
  patient: Patient;
  prescriptions: Prescription[];
  prescriptionItems: PrescriptionItem[];
  medicines: Medicine[];
  doctors: Doctor[];
  onNavigateToPrescriptions: () => void;
  onNavigateToMedicines: () => void;
  onNavigateToProfile: () => void;
  onViewPrescription: (rx: Prescription) => void;
}

export const PatientDashboardView: React.FC<PatientDashboardViewProps> = ({
  patient,
  prescriptions,
  prescriptionItems,
  medicines,
  doctors,
  onNavigateToPrescriptions,
  onNavigateToMedicines,
  onNavigateToProfile,
  onViewPrescription,
}) => {
  // Filter records belonging to this logged-in patient
  const patientPrescriptions = prescriptions.filter((r) => r.PatientID === patient.PatientID);
  const patientItems = prescriptionItems.filter((i) =>
    patientPrescriptions.some((r) => r.PrescriptionID === i.PrescriptionID)
  );

  // Unique active medications prescribed to this patient
  const uniqueMedIds = Array.from(new Set(patientItems.map((i) => i.MedicineID)));
  const prescribedMedicines = medicines.filter((m) => uniqueMedIds.includes(m.MedicineID));

  // Attending doctor from most recent prescription
  const latestRx = patientPrescriptions[0];
  const attendingDoctor = latestRx
    ? doctors.find((d) => d.DoctorID === latestRx.DoctorID)
    : doctors[0];

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-r from-teal-700 via-teal-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 text-teal-200 text-xs font-semibold border border-teal-500/30">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-300" />
              <span>Verified Patient Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Welcome back, {patient.Name}
            </h1>
            <p className="text-xs sm:text-sm text-teal-100/80 leading-relaxed">
              Your digital pharmacy portal. View your active prescriptions, monitor daily medication dosages, and check refill schedules directly from your care team.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onNavigateToProfile}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-xs border border-white/20 transition-all cursor-pointer"
            >
              My Medical Profile
            </button>
            <button
              onClick={onNavigateToPrescriptions}
              className="px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold shadow-md transition-all cursor-pointer"
            >
              View Active Prescriptions
            </button>
          </div>
        </div>
      </div>

      {/* 4 Summary Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-2xs transition-colors">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Prescriptions</span>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1.5">
            {patientPrescriptions.length}
          </p>
          <span className="text-[11px] text-teal-600 dark:text-teal-400 font-semibold mt-1 block">
            All active &amp; verified
          </span>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-2xs transition-colors">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Prescribed Medications</span>
          <p className="text-2xl font-bold text-teal-700 dark:text-teal-400 mt-1.5">
            {uniqueMedIds.length}
          </p>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 block">Active regimen</span>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-2xs transition-colors">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Attending Doctor</span>
          <p className="text-base font-bold text-slate-900 dark:text-white mt-1.5 truncate">
            {attendingDoctor ? attendingDoctor.Name : 'Dr. Arjun Mehta'}
          </p>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 block truncate">
            {attendingDoctor ? attendingDoctor.Specialization : 'Cardiology'}
          </span>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-2xs transition-colors">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Next Scheduled Refill</span>
          <p className="text-base font-bold text-amber-600 dark:text-amber-400 mt-1.5">In 14 Days</p>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 block">Pharmacy auto-ship</span>
        </div>
      </div>

      {/* Main Grid: Recent Prescriptions & Active Medications */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Recent Prescriptions List */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-2xs p-6 space-y-4 transition-colors">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700/60">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Recent Prescriptions</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Your personalized clinical orders</p>
            </div>
            <button
              onClick={onNavigateToPrescriptions}
              className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:text-teal-700 flex items-center gap-1 cursor-pointer"
            >
              <span>View all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {patientPrescriptions.length > 0 ? (
              patientPrescriptions.map((rx) => {
                const doctor = doctors.find((d) => d.DoctorID === rx.DoctorID);
                const items = prescriptionItems.filter((i) => i.PrescriptionID === rx.PrescriptionID);

                return (
                  <div
                    key={rx.PrescriptionID}
                    onClick={() => onViewPrescription(rx)}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-700/60 hover:border-teal-400 dark:hover:border-teal-600 transition-all cursor-pointer space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-teal-700 dark:text-teal-400 text-xs">
                          {rx.PrescriptionID}
                        </span>
                        <span className="text-slate-300 dark:text-slate-600">•</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">Date: {rx.Date}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200/50 dark:border-teal-800/50">
                        {rx.status || 'Dispensed'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 dark:text-slate-300 font-medium line-clamp-1">
                      {rx.Notes}
                    </p>

                    <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200/40 dark:border-slate-800">
                      <span>Prescribed by: <strong className="text-slate-800 dark:text-slate-200">{doctor?.Name || rx.DoctorID}</strong></span>
                      <span className="font-medium text-teal-700 dark:text-teal-400">{items.length} Medicines</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-slate-400 dark:text-slate-500 py-6 text-center">
                No prescriptions found for this patient account.
              </p>
            )}
          </div>
        </div>

        {/* Right Column: Prescribed Medicines & Dosages */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-2xs p-6 space-y-4 transition-colors">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700/60">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Active Medications</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Current pharmaceutical items</p>
            </div>
            <button
              onClick={onNavigateToMedicines}
              className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:text-teal-700 flex items-center gap-1 cursor-pointer"
            >
              <span>View list</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {patientItems.slice(0, 4).map((item) => {
              const med = medicines.find((m) => m.MedicineID === item.MedicineID);
              const unitPrice = med ? med.Price : 0;

              return (
                <div
                  key={item.ItemID}
                  className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/60 flex items-center justify-center text-teal-600 dark:text-teal-400 shrink-0">
                      <Pill className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-white">{med?.Name || item.MedicineID}</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Dosage: <strong className="text-slate-700 dark:text-slate-300">{item.Dosage}</strong> • Qty: {item.Quantity}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-semibold text-teal-700 dark:text-teal-400 block">
                      {formatINR(unitPrice * item.Quantity)}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                      {formatINR(unitPrice)} / unit
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick refill reminder note */}
          <div className="p-4 rounded-xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200/70 dark:border-teal-800/60 flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
            <div className="text-xs space-y-0.5">
              <p className="font-semibold text-teal-900 dark:text-teal-200">Patient Compliance Reminder</p>
              <p className="text-teal-800/80 dark:text-teal-300/80 leading-relaxed text-[11px]">
                Always follow dosage guidelines provided by your prescribing doctor. Contact your pharmacist for dosage clarifications.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
