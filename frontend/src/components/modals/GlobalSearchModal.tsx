import React, { useState, useEffect } from 'react';
import { Search, Pill, Users, Stethoscope, FileText, ArrowRight } from 'lucide-react';
import { Medicine, Patient, Doctor, Prescription } from '../../types/pharmacy';
import { formatINR } from '../../utils/currency';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  medicines: Medicine[];
  patients: Patient[];
  doctors: Doctor[];
  prescriptions: Prescription[];
  onSelectMedicine: (med: Medicine) => void;
  onSelectPatient: (pat: Patient) => void;
  onSelectDoctor: (doc: Doctor) => void;
  onSelectPrescription: (rx: Prescription) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  medicines,
  patients,
  doctors,
  prescriptions,
  onSelectMedicine,
  onSelectPatient,
  onSelectDoctor,
  onSelectPrescription,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (isOpen) {
      setQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const q = query.trim().toLowerCase();

  const matchedMeds = q
    ? medicines.filter(
        (m) =>
          m.Name.toLowerCase().includes(q) ||
          m.Brand.toLowerCase().includes(q) ||
          m.MedicineID.toLowerCase().includes(q)
      )
    : [];

  const matchedPatients = q
    ? patients.filter(
        (p) =>
          p.Name.toLowerCase().includes(q) ||
          p.PatientID.toLowerCase().includes(q) ||
          p.Phone.includes(q)
      )
    : [];

  const matchedDoctors = q
    ? doctors.filter(
        (d) =>
          d.Name.toLowerCase().includes(q) ||
          d.Specialization.toLowerCase().includes(q) ||
          d.DoctorID.toLowerCase().includes(q)
      )
    : [];

  const matchedRx = q
    ? prescriptions.filter((r) => r.PrescriptionID.toLowerCase().includes(q))
    : [];

  const hasResults =
    matchedMeds.length > 0 ||
    matchedPatients.length > 0 ||
    matchedDoctors.length > 0 ||
    matchedRx.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-xl border border-slate-200/90 overflow-hidden flex flex-col max-h-[75vh]">
        {/* Search input bar */}
        <div className="p-4 border-b border-slate-100 flex items-center gap-3">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search medicines, patients, doctors, prescriptions..."
            className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px] text-slate-500 font-mono">
            ESC
          </kbd>
        </div>

        {/* Results Area */}
        <div className="p-4 overflow-y-auto space-y-4 text-xs">
          {!q ? (
            <p className="text-center py-8 text-slate-400">
              Type to search across medicines, patients, doctors, and prescriptions.
            </p>
          ) : !hasResults ? (
            <p className="text-center py-8 text-slate-400">No results found for "{query}".</p>
          ) : (
            <>
              {/* Group: Medicines */}
              {matchedMeds.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Medicines
                  </span>
                  {matchedMeds.map((med) => (
                    <div
                      key={med.MedicineID}
                      onClick={() => {
                        onSelectMedicine(med);
                        onClose();
                      }}
                      className="p-2.5 rounded-xl hover:bg-slate-50 flex items-center justify-between cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <Pill className="w-4 h-4 text-teal-600" />
                        <div>
                          <p className="font-semibold text-slate-900">{med.Name}</p>
                          <span className="text-[11px] text-slate-400">{med.Brand}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-mono text-teal-700 font-semibold text-xs block">
                          {formatINR(med.Price)}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {med.StockQty} in stock
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Group: Patients */}
              {matchedPatients.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Patients
                  </span>
                  {matchedPatients.map((pat) => (
                    <div
                      key={pat.PatientID}
                      onClick={() => {
                        onSelectPatient(pat);
                        onClose();
                      }}
                      className="p-2.5 rounded-xl hover:bg-slate-50 flex items-center justify-between cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <Users className="w-4 h-4 text-cyan-600" />
                        <p className="font-semibold text-slate-900">{pat.Name}</p>
                      </div>
                      <span className="font-mono text-slate-400">{pat.PatientID}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Group: Doctors */}
              {matchedDoctors.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Doctors
                  </span>
                  {matchedDoctors.map((doc) => (
                    <div
                      key={doc.DoctorID}
                      onClick={() => {
                        onSelectDoctor(doc);
                        onClose();
                      }}
                      className="p-2.5 rounded-xl hover:bg-slate-50 flex items-center justify-between cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <Stethoscope className="w-4 h-4 text-slate-600" />
                        <p className="font-semibold text-slate-900">{doc.Name}</p>
                      </div>
                      <span className="text-cyan-700 font-medium">{doc.Specialization}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Group: Prescriptions */}
              {matchedRx.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Prescriptions
                  </span>
                  {matchedRx.map((rx) => (
                    <div
                      key={rx.PrescriptionID}
                      onClick={() => {
                        onSelectPrescription(rx);
                        onClose();
                      }}
                      className="p-2.5 rounded-xl hover:bg-slate-50 flex items-center justify-between cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <FileText className="w-4 h-4 text-teal-600" />
                        <span className="font-mono font-bold text-teal-700">
                          {rx.PrescriptionID}
                        </span>
                      </div>
                      <span className="text-slate-400">{rx.Date}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
