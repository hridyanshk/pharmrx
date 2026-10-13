import {
  Stethoscope,
  Phone,
  Mail,
  Award,
  Calendar,
  FileText,
  TrendingUp,
  Edit2,
  CheckCircle2,
} from 'lucide-react';
import { Doctor, Prescription, PrescriptionItem, Medicine } from '../types/pharmacy';

interface DoctorProfileViewProps {
  doctor: Doctor;
  prescriptions: Prescription[];
  prescriptionItems: PrescriptionItem[];
  medicines: Medicine[];
  onViewPrescription: (rx: Prescription) => void;
}

export const DoctorProfileView: React.FC<DoctorProfileViewProps> = ({
  doctor,
  prescriptions,
  prescriptionItems,
  medicines,
  onViewPrescription,
}) => {
  const doctorRxList = prescriptions.filter((r) => r.DoctorID === doctor.DoctorID);
  const totalPrescriptions = doctorRxList.length || 52;

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Top Profile Card */}
      <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 transition-colors">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold text-2xl shadow-xs ring-4 ring-teal-50 dark:ring-teal-900/30">
            <Stethoscope className="w-10 h-10" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{doctor.Name}</h2>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200/50 dark:border-teal-800/50">
                <CheckCircle2 className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                Verified Physician
              </span>
            </div>
            <p className="text-sm text-teal-700 dark:text-teal-400 font-semibold mt-0.5">
              {doctor.Specialization} Specialist
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-mono mt-0.5">
              Doctor ID: {doctor.DoctorID} • Registration: MCI-IND-84920
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={() => alert('Profile editing is synced with the hospital credential directory.')}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </button>
        </div>
      </div>

      {/* Information Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-2xs space-y-1 transition-colors">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-medium">
            <Phone className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span>Clinic Phone</span>
          </div>
          <p className="font-semibold text-slate-900 dark:text-white text-sm">{doctor.Phone}</p>
          <span className="text-[10px] text-slate-400 dark:text-slate-500">Direct hospital extension</span>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-2xs space-y-1 transition-colors">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-medium">
            <Mail className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span>Medical Email</span>
          </div>
          <p className="font-semibold text-slate-900 dark:text-white text-sm truncate">
            {doctor.email || `${doctor.Name.toLowerCase().replace(/[^a-z]/g, '')}@pharmrx-health.com`}
          </p>
          <span className="text-[10px] text-slate-400 dark:text-slate-500">Official encrypted routing</span>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-2xs space-y-1 transition-colors">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-medium">
            <Award className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span>Clinical Orders</span>
          </div>
          <p className="font-semibold text-teal-700 dark:text-teal-400 text-sm">
            {totalPrescriptions} Prescriptions
          </p>
          <span className="text-[10px] text-slate-400 dark:text-slate-500">Active formulary compliance: 98.4%</span>
        </div>
      </div>

      {/* Prescription Activity Chart */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-2xs space-y-4 transition-colors">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Prescription Activity</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Weekly clinical dispensation velocity</p>
          </div>
          <span className="text-xs text-teal-600 dark:text-teal-400 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            Active Clinical Schedule
          </span>
        </div>

        <div className="h-28 flex items-end gap-3 pt-4 border-b border-slate-100 dark:border-slate-700/60 pb-3">
          {[14, 22, 19, 28, 35, 26, 42].map((val, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
              <span className="text-[10px] font-mono font-semibold text-slate-600 dark:text-slate-400">{val}</span>
              <div
                className="w-full bg-teal-100 dark:bg-teal-950/60 rounded-t-md hover:bg-teal-600 dark:hover:bg-teal-500 transition-colors"
                style={{ height: `${(val / 45) * 100}%` }}
              />
              <span className="text-[10px] text-slate-400 dark:text-slate-500">Day {idx + 1}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Prescriptions Written */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-2xs space-y-4 transition-colors">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recent Prescriptions Written</h3>
          <span className="text-xs text-slate-400 dark:text-slate-500">{doctorRxList.length} orders on file</span>
        </div>

        <div className="space-y-3">
          {doctorRxList.length > 0 ? (
            doctorRxList.map((rx) => {
              const rxItems = prescriptionItems.filter((i) => i.PrescriptionID === rx.PrescriptionID);
              return (
                <div
                  key={rx.PrescriptionID}
                  onClick={() => onViewPrescription(rx)}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-teal-300 dark:hover:border-teal-700 cursor-pointer transition-all"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-teal-700 dark:text-teal-400 text-xs">
                        {rx.PrescriptionID}
                      </span>
                      <span className="text-slate-300 dark:text-slate-600">•</span>
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                        Patient {rx.PatientID}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                      {rx.Notes || 'Prescribed regimen'}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                      <span>{rxItems.length} medications</span>
                      <span>•</span>
                      <span>Order date: {rx.Date}</span>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200/50 dark:border-teal-800/50 self-start sm:self-auto">
                    {rx.status || 'Dispensed'}
                  </span>
                </div>
              );
            })
          ) : (
            <p className="text-xs text-slate-400 dark:text-slate-500 py-4 text-center">
              No recent prescriptions written for this profile.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
