import React, { useState } from 'react';
import { Pill, Search, ShieldCheck, FileText, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Medicine, PrescriptionItem, Prescription, Doctor } from '../types/pharmacy';
import { formatINR } from '../utils/currency';

interface PatientMedicinesViewProps {
  patientId: string;
  medicines: Medicine[];
  prescriptionItems: PrescriptionItem[];
  prescriptions: Prescription[];
  doctors: Doctor[];
  onViewPrescription: (rx: Prescription) => void;
}

export const PatientMedicinesView: React.FC<PatientMedicinesViewProps> = ({
  patientId,
  medicines,
  prescriptionItems,
  prescriptions,
  doctors,
  onViewPrescription,
}) => {
  const [search, setSearch] = useState('');

  // Find all items belonging to prescriptions for this patient
  const patientPrescriptions = prescriptions.filter((r) => r.PatientID === patientId);
  const patientItems = prescriptionItems.filter((i) =>
    patientPrescriptions.some((r) => r.PrescriptionID === i.PrescriptionID)
  );

  const filteredItems = patientItems.filter((item) => {
    const med = medicines.find((m) => m.MedicineID === item.MedicineID);
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      med?.Name.toLowerCase().includes(q) ||
      med?.Brand.toLowerCase().includes(q) ||
      item.Dosage.toLowerCase().includes(q) ||
      item.PrescriptionID.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">My Medications</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Personal medication record &amp; dosage directions authorized by your care team
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search my medications..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600/20"
          />
        </div>
      </div>

      {/* Medications Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-2xs overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 dark:bg-slate-900/60 border-b border-slate-100 dark:border-slate-700/80 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Medication</th>
                <th className="py-3 px-4">Prescribed Dosage</th>
                <th className="py-3 px-4">Quantity</th>
                <th className="py-3 px-4">Unit Price</th>
                <th className="py-3 px-4">Subtotal</th>
                <th className="py-3 px-4">Prescription Order</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 text-xs">
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => {
                  const med = medicines.find((m) => m.MedicineID === item.MedicineID);
                  const parentRx = prescriptions.find((r) => r.PrescriptionID === item.PrescriptionID);
                  const doctor = parentRx ? doctors.find((d) => d.DoctorID === parentRx.DoctorID) : null;
                  const unitPrice = med ? med.Price : 0;
                  const subtotal = unitPrice * item.Quantity;

                  return (
                    <tr
                      key={item.ItemID}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-700/40 transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/60 flex items-center justify-center text-teal-600 dark:text-teal-400 shrink-0">
                            <Pill className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-semibold text-slate-900 dark:text-white block">
                              {med?.Name || item.MedicineID}
                            </span>
                            <span className="text-[11px] text-slate-400 dark:text-slate-500">
                              {med?.Brand || 'Formulary Item'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-2.5 py-1 rounded-lg">
                          {item.Dosage}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-800 dark:text-slate-200">
                        {item.Quantity} units
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-400">
                        {formatINR(unitPrice)}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-teal-700 dark:text-teal-400">
                        {formatINR(subtotal)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-slate-800 dark:text-slate-200 block text-xs">
                          {item.PrescriptionID}
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500">
                          {doctor ? doctor.Name : parentRx?.Date}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {parentRx && (
                          <button
                            onClick={() => onViewPrescription(parentRx)}
                            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-colors cursor-pointer"
                          >
                            View Order
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 dark:text-slate-500 text-xs">
                    No medications found for your profile.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
