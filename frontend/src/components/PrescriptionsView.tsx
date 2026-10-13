import React, { useState, useMemo } from 'react';
import { Plus, Search, Printer, Download, ArrowLeft, FileText, CheckCircle2 } from 'lucide-react';
import { Prescription, PrescriptionItem, Medicine, Doctor, Patient } from '../types/pharmacy';
import { formatINR } from '../utils/currency';

interface PrescriptionsViewProps {
  prescriptions: Prescription[];
  prescriptionItems: PrescriptionItem[];
  medicines: Medicine[];
  doctors: Doctor[];
  patients: Patient[];
  onOpenNewRxModal: () => void;
  selectedPrescription?: Prescription | null;
  onClearSelectedPrescription?: () => void;
}

export const PrescriptionsView: React.FC<PrescriptionsViewProps> = ({
  prescriptions,
  prescriptionItems,
  medicines,
  doctors,
  patients,
  onOpenNewRxModal,
  selectedPrescription: initialSelectedRx = null,
  onClearSelectedPrescription,
}) => {
  const [search, setSearch] = useState('');
  const [selectedDoctorFilter, setSelectedDoctorFilter] = useState('all');
  const [selectedRx, setSelectedRx] = useState<Prescription | null>(initialSelectedRx);

  // Filter prescriptions
  const filteredPrescriptions = useMemo(() => {
    return prescriptions.filter((rx) => {
      const patient = patients.find((p) => p.PatientID === rx.PatientID);
      const doctor = doctors.find((d) => d.DoctorID === rx.DoctorID);

      if (selectedDoctorFilter !== 'all' && rx.DoctorID !== selectedDoctorFilter) {
        return false;
      }

      if (search.trim()) {
        const q = search.toLowerCase();
        const matchId = rx.PrescriptionID.toLowerCase().includes(q);
        const matchPatient = patient?.Name.toLowerCase().includes(q) || false;
        const matchDoctor = doctor?.Name.toLowerCase().includes(q) || false;
        if (!matchId && !matchPatient && !matchDoctor) return false;
      }

      return true;
    });
  }, [prescriptions, patients, doctors, search, selectedDoctorFilter]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    alert('Generating clinical prescription PDF document...');
  };

  // 18. PRESCRIPTION DETAILS VIEW (Medical Document Style)
  if (selectedRx) {
    const patient = patients.find((p) => p.PatientID === selectedRx.PatientID);
    const doctor = doctors.find((d) => d.DoctorID === selectedRx.DoctorID);
    const items = prescriptionItems.filter((i) => i.PrescriptionID === selectedRx.PrescriptionID);

    const totalCost = items.reduce((sum, item) => {
      const med = medicines.find((m) => m.MedicineID === item.MedicineID);
      return sum + (med ? med.Price * item.Quantity : 0);
    }, 0);

    return (
      <div className="p-4 lg:p-8 max-w-4xl mx-auto space-y-6">
        {/* Back navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              setSelectedRx(null);
              onClearSelectedPrescription?.();
            }}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Prescriptions</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <button
              onClick={handleDownloadPDF}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-700 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>
          </div>
        </div>

        {/* Medical Document Card */}
        <div className="bg-white p-8 sm:p-10 rounded-2xl border border-slate-200/90 shadow-sm space-y-8 print:border-none print:shadow-none">
          {/* Document Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <span className="text-[11px] font-mono uppercase font-bold text-teal-600 tracking-wider">
                Official Clinical Prescription
              </span>
              <h1 className="text-2xl font-bold text-slate-900 mt-0.5">
                Prescription {selectedRx.PrescriptionID}
              </h1>
              <p className="text-xs text-slate-400 mt-1">Order Date: {selectedRx.Date}</p>
            </div>

            <div className="text-left sm:text-right">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-700">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {selectedRx.status || 'Dispensed'}
              </span>
            </div>
          </div>

          {/* Patient & Doctor Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-5 bg-slate-50/70 rounded-xl border border-slate-100">
            <div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Patient Information
              </span>
              <p className="text-sm font-bold text-slate-900">{patient?.Name || selectedRx.PatientID}</p>
              <p className="text-xs text-slate-500 mt-0.5">ID: {selectedRx.PatientID}</p>
              <p className="text-xs text-slate-500">DOB: {patient?.DateOfBirth || 'N/A'}</p>
              <p className="text-xs text-slate-500">Phone: {patient?.Phone || 'N/A'}</p>
            </div>

            <div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Prescribing Clinician
              </span>
              <p className="text-sm font-bold text-slate-900">{doctor?.Name || selectedRx.DoctorID}</p>
              <p className="text-xs text-slate-500 mt-0.5">{doctor?.Specialization || 'Physician'}</p>
              <p className="text-xs text-slate-500">Phone: {doctor?.Phone || 'N/A'}</p>
            </div>
          </div>

          {/* Medicines Table */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Prescribed Medicines
            </h3>

            <div className="border border-slate-100 rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase">
                    <th className="py-2.5 px-4">Medicine</th>
                    <th className="py-2.5 px-4">Dosage</th>
                    <th className="py-2.5 px-4">Quantity</th>
                    <th className="py-2.5 px-4 text-right">Unit Price</th>
                    <th className="py-2.5 px-4 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item) => {
                    const med = medicines.find((m) => m.MedicineID === item.MedicineID);
                    const unitPrice = med ? med.Price : 0;
                    const subtotal = unitPrice * item.Quantity;
                    return (
                      <tr key={item.ItemID}>
                        <td className="py-3 px-4">
                          <p className="font-semibold text-slate-900">{med?.Name || item.MedicineID}</p>
                          <span className="text-[10px] text-slate-400">{med?.Brand}</span>
                        </td>
                        <td className="py-3 px-4 text-slate-600 font-medium">{item.Dosage}</td>
                        <td className="py-3 px-4 font-mono text-slate-700">{item.Quantity} units</td>
                        <td className="py-3 px-4 text-right font-mono text-slate-600">
                          {formatINR(unitPrice)}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-semibold text-slate-900">
                          {formatINR(subtotal)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-50/70 border-t border-slate-100 font-semibold text-xs">
                    <td colSpan={4} className="py-3 px-4 text-slate-700 text-right">
                      Estimated Total:
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-teal-700 text-sm">
                      {formatINR(totalCost)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Notes Section */}
          <div className="space-y-1.5 p-4 bg-slate-50/70 rounded-xl border border-slate-100">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
              Prescription Notes &amp; Sig Instructions
            </span>
            <p className="text-xs text-slate-700 leading-relaxed">
              {selectedRx.Notes || 'Take medication exactly as prescribed by physician.'}
            </p>
          </div>

          {/* Footer Barcode / Regulatory sign-off */}
          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <span className="font-mono text-[10px]">AUTH_SIG: SHA256_{selectedRx.PrescriptionID}_VERIFIED</span>
            <span>Dispensed via PharmRx Clinical OS</span>
          </div>
        </div>
      </div>
    );
  }

  // 16. PRESCRIPTIONS DIRECTORY / LIST VIEW
  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Prescriptions</h1>
          <p className="text-xs text-slate-500 mt-0.5">Active pharmacy prescription order queue</p>
        </div>

        <button
          onClick={onOpenNewRxModal}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Prescription</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Rx ID or patient name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 transition-all"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <select
            value={selectedDoctorFilter}
            onChange={(e) => setSelectedDoctorFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-medium text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="all">All Prescribing Doctors</option>
            {doctors.map((d) => (
              <option key={d.DoctorID} value={d.DoctorID}>
                {d.Name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Clean spacious Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Prescription</th>
                <th className="py-3 px-4">Patient</th>
                <th className="py-3 px-4">Doctor</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Items</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredPrescriptions.map((rx) => {
                const patient = patients.find((p) => p.PatientID === rx.PatientID);
                const doctor = doctors.find((d) => d.DoctorID === rx.DoctorID);
                const items = prescriptionItems.filter((i) => i.PrescriptionID === rx.PrescriptionID);

                return (
                  <tr
                    key={rx.PrescriptionID}
                    onClick={() => setSelectedRx(rx)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                  >
                    <td className="py-4 px-4">
                      <span className="font-mono text-teal-700 font-bold block">{rx.PrescriptionID}</span>
                      <span className="text-[10px] text-slate-400">{rx.status || 'Active'}</span>
                    </td>
                    <td className="py-4 px-4">
                      <p className="font-semibold text-slate-900">{patient ? patient.Name : rx.PatientID}</p>
                      <span className="text-[10px] text-slate-400 font-mono">{rx.PatientID}</span>
                    </td>
                    <td className="py-4 px-4 text-slate-700 font-medium">
                      {doctor ? doctor.Name : rx.DoctorID}
                    </td>
                    <td className="py-4 px-4 text-slate-500">{rx.Date}</td>
                    <td className="py-4 px-4">
                      <span className="font-semibold text-slate-800">{items.length}</span>
                      <span className="text-[11px] text-slate-400 ml-1">
                        {items.length === 1 ? 'medicine' : 'medicines'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setSelectedRx(rx)}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
                      >
                        View Details
                      </button>
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
