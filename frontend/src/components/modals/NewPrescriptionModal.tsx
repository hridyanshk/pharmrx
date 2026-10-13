import React, { useState } from 'react';
import {
  X,
  User,
  Stethoscope,
  Calendar,
  Pill,
  Plus,
  Trash2,
  Check,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { Patient, Doctor, Medicine, Prescription, PrescriptionItem } from '../../types/pharmacy';
import { formatINR } from '../../utils/currency';

interface NewPrescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  patients: Patient[];
  doctors: Doctor[];
  medicines: Medicine[];
  onSavePrescription: (
    prescription: Prescription,
    items: PrescriptionItem[],
    stockUpdates: { medicineId: string; newStock: number }[]
  ) => Promise<boolean | void> | void;
  preselectedPatientId?: string;
  preselectedDoctorId?: string;
  isSubmitting?: boolean;
  error?: string | null;
}

interface DraftItem {
  medicineId: string;
  dosage: string;
  quantity: number;
}

export const NewPrescriptionModal: React.FC<NewPrescriptionModalProps> = ({
  isOpen,
  onClose,
  patients,
  doctors,
  medicines,
  onSavePrescription,
  preselectedPatientId,
  preselectedDoctorId,
  isSubmitting = false,
  error = null,
}) => {
  if (!isOpen) return null;

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [localSubmitting, setLocalSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Form State
  const [selectedPatientId, setSelectedPatientId] = useState(
    preselectedPatientId || patients[0]?.PatientID || ''
  );
  const [selectedDoctorId, setSelectedDoctorId] = useState(
    preselectedDoctorId || doctors[0]?.DoctorID || ''
  );
  const [date, setDate] = useState('2024-10-24');
  const [notes, setNotes] = useState('Take 1 dose daily as instructed by physician.');

  // Draft medicines list (Step 4)
  const [draftItems, setDraftItems] = useState<DraftItem[]>([
    {
      medicineId: medicines[0]?.MedicineID || 'MED-1004',
      dosage: '20mg',
      quantity: 30,
    },
  ]);

  const [validationError, setValidationError] = useState<string | null>(null);

  // Selected Entities
  const patient = patients.find((p) => p.PatientID === selectedPatientId);
  const doctor = doctors.find((d) => d.DoctorID === selectedDoctorId);

  // Add another medicine line
  const handleAddMedicineRow = () => {
    const nextMed = medicines.find((m) => !draftItems.some((d) => d.medicineId === m.MedicineID)) || medicines[0];
    setDraftItems((prev) => [
      ...prev,
      {
        medicineId: nextMed.MedicineID,
        dosage: '10mg',
        quantity: 30,
      },
    ]);
  };

  const handleRemoveMedicineRow = (index: number) => {
    if (draftItems.length <= 1) return;
    setDraftItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateMedicineRow = (index: number, field: keyof DraftItem, val: any) => {
    setDraftItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: val } : item))
    );
  };

  // Calculations for Summary
  const totalQuantity = draftItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  const estimatedCost = draftItems.reduce((sum, item) => {
    const med = medicines.find((m) => m.MedicineID === item.medicineId);
    return sum + (med ? med.Price * Number(item.quantity || 0) : 0);
  }, 0);

  // Submit & Validation
  const handleFinalSave = async () => {
    setValidationError(null);

    if (!selectedPatientId) {
      setValidationError('Please select a valid patient.');
      setStep(1);
      return;
    }
    if (!selectedDoctorId) {
      setValidationError('Please select a valid prescribing doctor.');
      setStep(2);
      return;
    }
    if (draftItems.length === 0) {
      setValidationError('Please add at least one medicine item.');
      setStep(4);
      return;
    }

    // Validate stock and quantity for each medicine
    const stockUpdates: { medicineId: string; newStock: number }[] = [];
    for (const item of draftItems) {
      const med = medicines.find((m) => m.MedicineID === item.medicineId);
      if (!med) continue;
      const qty = Number(item.quantity);
      if (isNaN(qty) || qty <= 0) {
        setValidationError(`Quantity for ${med.Name} must be greater than zero.`);
        setStep(4);
        return;
      }
      if (qty > med.StockQty) {
        setValidationError(
          `Insufficient stock for ${med.Name}. Available: ${med.StockQty} units.`
        );
        setStep(4);
        return;
      }
      stockUpdates.push({
        medicineId: med.MedicineID,
        newStock: med.StockQty - qty,
      });
    }

    // Create prescription
    const rxIdNum = Math.floor(10000 + Math.random() * 90000);
    const newRxId = `RX-${rxIdNum}`;

    const newPrescription: Prescription = {
      PrescriptionID: newRxId,
      Date: date,
      Notes: notes,
      DoctorID: selectedDoctorId,
      PatientID: selectedPatientId,
      status: 'In Filling',
    };

    const newItems: PrescriptionItem[] = draftItems.map((d, idx) => ({
      ItemID: `ITM-${rxIdNum}-${idx + 1}`,
      Quantity: Number(d.quantity),
      Dosage: d.dosage,
      PrescriptionID: newRxId,
      MedicineID: d.medicineId,
    }));

    setLocalSubmitting(true);
    try {
      const res = await onSavePrescription(newPrescription, newItems, stockUpdates);
      if (res !== false) {
        onClose();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save prescription';
      setLocalError(msg);
      setValidationError(msg);
    } finally {
      setLocalSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl border border-slate-200/90 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">New Prescription</h2>
            <p className="text-xs text-slate-400">Step {step} of 4</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Multi-step progress indicator */}
        <div className="grid grid-cols-4 border-b border-slate-100 text-xs">
          {[
            { s: 1, label: 'Patient', icon: User },
            { s: 2, label: 'Doctor', icon: Stethoscope },
            { s: 3, label: 'Details', icon: Calendar },
            { s: 4, label: 'Medicines', icon: Pill },
          ].map((item) => {
            const Icon = item.icon;
            const isCompleted = step > item.s;
            const isCurrent = step === item.s;
            return (
              <button
                key={item.s}
                onClick={() => setStep(item.s as any)}
                className={`py-3 px-2 flex items-center justify-center gap-1.5 font-medium border-b-2 transition-all cursor-pointer ${
                  isCurrent
                    ? 'border-teal-600 text-teal-700 bg-teal-50/30 font-semibold'
                    : isCompleted
                    ? 'border-transparent text-slate-700'
                    : 'border-transparent text-slate-400'
                }`}
              >
                {isCompleted ? (
                  <Check className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                ) : (
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                )}
                <span className="hidden sm:inline">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Error message banner if any */}
        {validationError && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Modal Body: Steps */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
          {/* STEP 1: Select Patient */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Step 1 — Select Patient</h3>
                <p className="text-slate-400 mt-0.5">Select the recipient for this prescription order</p>
              </div>

              <div className="space-y-2">
                {patients.map((p) => {
                  const isSelected = p.PatientID === selectedPatientId;
                  return (
                    <div
                      key={p.PatientID}
                      onClick={() => setSelectedPatientId(p.PatientID)}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        isSelected
                          ? 'border-teal-600 bg-teal-50/50 shadow-2xs'
                          : 'border-slate-200/80 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700">
                          {p.Name[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{p.Name}</p>
                          <span className="text-[11px] text-slate-400">
                            DOB: {p.DateOfBirth} • {p.Phone}
                          </span>
                        </div>
                      </div>
                      <span className="font-mono text-slate-400">{p.PatientID}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: Select Doctor */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Step 2 — Select Prescribing Doctor</h3>
                <p className="text-slate-400 mt-0.5">Select the physician who authorized this order</p>
              </div>

              <div className="space-y-2">
                {doctors.map((d) => {
                  const isSelected = d.DoctorID === selectedDoctorId;
                  return (
                    <div
                      key={d.DoctorID}
                      onClick={() => setSelectedDoctorId(d.DoctorID)}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        isSelected
                          ? 'border-teal-600 bg-teal-50/50 shadow-2xs'
                          : 'border-slate-200/80 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                          <Stethoscope className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{d.Name}</p>
                          <span className="text-[11px] text-cyan-700 font-medium">
                            {d.Specialization}
                          </span>
                        </div>
                      </div>
                      <span className="font-mono text-slate-400">{d.DoctorID}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: Date & Notes */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Step 3 — Order Details</h3>
                <p className="text-slate-400 mt-0.5">Specify prescription issue date and administration notes</p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Issue Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600/20"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Prescription Notes / Sig Instructions
                </label>
                <textarea
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Enter dosage instructions, administration schedule, warnings..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600/20"
                />
              </div>

              {/* Patient & Doctor Confirmation Preview */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-slate-600">
                <span>Patient: <strong>{patient?.Name}</strong></span>
                <span>•</span>
                <span>Doctor: <strong>{doctor?.Name}</strong></span>
              </div>
            </div>
          )}

          {/* STEP 4: Medicines */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Step 4 — Prescribed Medicines</h3>
                  <p className="text-slate-400 mt-0.5">Add medicine formulations, dosage, and dispense quantity</p>
                </div>
                <button
                  type="button"
                  onClick={handleAddMedicineRow}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Medicine</span>
                </button>
              </div>

              <div className="space-y-3">
                {draftItems.map((item, idx) => {
                  const selectedMed = medicines.find((m) => m.MedicineID === item.medicineId);

                  return (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-800">Item #{idx + 1}</span>
                        {draftItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveMedicineRow(idx)}
                            className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {/* Select Medicine */}
                        <div className="sm:col-span-1">
                          <label className="block text-[11px] font-medium text-slate-500 mb-1">
                            Medicine
                          </label>
                          <select
                            value={item.medicineId}
                            onChange={(e) =>
                              handleUpdateMedicineRow(idx, 'medicineId', e.target.value)
                            }
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none"
                          >
                            {medicines.map((m) => (
                              <option key={m.MedicineID} value={m.MedicineID}>
                                {m.Name} ({m.Brand})
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Dosage */}
                        <div>
                          <label className="block text-[11px] font-medium text-slate-500 mb-1">
                            Dosage
                          </label>
                          <input
                            type="text"
                            value={item.dosage}
                            onChange={(e) =>
                              handleUpdateMedicineRow(idx, 'dosage', e.target.value)
                            }
                            placeholder="e.g. 20mg"
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none"
                          />
                        </div>

                        {/* Quantity */}
                        <div>
                          <label className="block text-[11px] font-medium text-slate-500 mb-1">
                            Quantity
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="500"
                            value={item.quantity}
                            onChange={(e) =>
                              handleUpdateMedicineRow(idx, 'quantity', Number(e.target.value))
                            }
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 font-mono focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Subtle stock & price information */}
                      {selectedMed && (
                        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] pt-1.5 border-t border-slate-100 mt-2 text-slate-500">
                          <span>
                            Available stock:{' '}
                            <strong className={selectedMed.StockQty <= 30 ? 'text-amber-600' : 'text-slate-700'}>
                              {selectedMed.StockQty} units
                            </strong>
                          </span>
                          <div className="flex items-center gap-3">
                            <span>
                              Unit Price: <strong className="text-slate-800">{formatINR(selectedMed.Price)}</strong>
                            </span>
                            <span>•</span>
                            <span>
                              Subtotal: <strong className="text-teal-700 font-bold">{formatINR(selectedMed.Price * Number(item.quantity || 0))}</strong>
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Prescription Summary */}
              <div className="p-4 bg-teal-50/60 rounded-xl border border-teal-100 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-teal-700 tracking-wider block">
                    Prescription Summary
                  </span>
                  <div className="flex items-center gap-4 text-slate-700 font-medium mt-0.5">
                    <span>Medicines: <strong>{draftItems.length}</strong></span>
                    <span>Total units: <strong>{totalQuantity}</strong></span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-teal-700 uppercase font-bold block">
                    Estimated Cost
                  </span>
                  <span className="text-base font-bold text-teal-800 font-mono">
                    {formatINR(estimatedCost)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => (s - 1) as any)}
              className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-medium text-xs hover:bg-slate-50 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl text-slate-500 hover:text-slate-700 font-medium text-xs cursor-pointer"
            >
              Cancel
            </button>
          )}

          {step < 4 ? (
            <button
              type="button"
              disabled={isSubmitting || localSubmitting}
              onClick={() => setStep((s) => (s + 1) as any)}
              className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-xs transition-all cursor-pointer disabled:opacity-50"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={isSubmitting || localSubmitting}
              onClick={handleFinalSave}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-xs transition-all cursor-pointer disabled:opacity-60"
            >
              {isSubmitting || localSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Saving to MySQL...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Save Prescription</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
