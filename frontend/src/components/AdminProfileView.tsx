import React from 'react';
import {
  ShieldCheck,
  Database,
  Pill,
  Users,
  Stethoscope,
  FileText,
  Package,
  Bell,
  BarChart3,
  ArrowRight,
  Lock,
  Server,
} from 'lucide-react';
import { Medicine, Patient, Doctor, Prescription, NavRoute } from '../types/pharmacy';

interface AdminProfileViewProps {
  medicines: Medicine[];
  patients: Patient[];
  doctors: Doctor[];
  prescriptions: Prescription[];
  onNavigate: (route: NavRoute) => void;
}

export const AdminProfileView: React.FC<AdminProfileViewProps> = ({
  medicines,
  patients,
  doctors,
  prescriptions,
  onNavigate,
}) => {
  const lowStockCount = medicines.filter((m) => m.StockQty <= (m.safetyThreshold || 30)).length;

  const modules = [
    {
      id: 'medicines' as NavRoute,
      name: 'Medicines Formulary',
      count: medicines.length,
      icon: Pill,
      color: 'text-teal-600 dark:text-teal-400',
      bgColor: 'bg-teal-50 dark:bg-teal-950/60',
      description: 'Drug formulary database, pricing in INR, safety threshold, and stock qty.',
    },
    {
      id: 'patients' as NavRoute,
      name: 'Patient Registry',
      count: patients.length,
      icon: Users,
      color: 'text-cyan-600 dark:text-cyan-400',
      bgColor: 'bg-cyan-50 dark:bg-cyan-950/60',
      description: 'Registered patients, DOB, contact phone, and medical histories.',
    },
    {
      id: 'doctors' as NavRoute,
      name: 'Doctors & Clinicians',
      count: doctors.length,
      icon: Stethoscope,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-950/60',
      description: 'Medical officers, specializations, credentials, and prescribing volume.',
    },
    {
      id: 'prescriptions' as NavRoute,
      name: 'Prescriptions & Orders',
      count: prescriptions.length,
      icon: FileText,
      color: 'text-indigo-600 dark:text-indigo-400',
      bgColor: 'bg-indigo-50 dark:bg-indigo-950/60',
      description: 'Doctor-issued orders, line items, dosage schedules, and dispensing status.',
    },
    {
      id: 'inventory' as NavRoute,
      name: 'Inventory & Stock Levels',
      count: medicines.reduce((acc, m) => acc + m.StockQty, 0),
      icon: Package,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/60',
      description: 'Total warehouse inventory units, SKU counts, and stock adjustments.',
    },
    {
      id: 'alerts' as NavRoute,
      name: 'Stock Alerts',
      count: lowStockCount,
      icon: Bell,
      color: lowStockCount > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-600 dark:text-slate-400',
      bgColor: lowStockCount > 0 ? 'bg-amber-50 dark:bg-amber-950/60' : 'bg-slate-50 dark:bg-slate-800',
      description: 'Critical replenishment triggers, minimum thresholds, and out-of-stock items.',
    },
    {
      id: 'reports' as NavRoute,
      name: 'Reports & Analytics',
      count: 5,
      icon: BarChart3,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-950/60',
      description: 'Formulary movement, clinician Rx distribution, and financial summaries.',
    },
  ];

  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto space-y-6">
      {/* Admin Profile Header */}
      <div className="bg-white dark:bg-[#182235] p-6 sm:p-8 rounded-2xl border border-slate-200/80 dark:border-[#334155] shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 transition-colors">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-600 to-slate-900 text-white flex items-center justify-center font-bold text-2xl shadow-md ring-4 ring-teal-50 dark:ring-teal-900/30">
            <ShieldCheck className="w-10 h-10" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-[#F8FAFC]">System Administrator</h2>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/50">
                <Database className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                Full Access
              </span>
            </div>
            <p className="text-sm text-teal-700 dark:text-[#2DD4BF] font-semibold mt-0.5">
              Superuser Authority • Unrestricted System Control
            </p>
            <p className="text-xs text-slate-400 dark:text-[#94A3B8] font-mono mt-0.5">
              Admin ID: ADMIN-001 • Scope: Complete Read &amp; Write Access
            </p>
          </div>
        </div>
      </div>

      {/* Database Modules Access Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-[#F8FAFC]">Connected Database Modules</h3>
            <p className="text-xs text-slate-500 dark:text-[#94A3B8]">
              As an Administrator, you have unrestricted access to all operational sections in PharmRx.
            </p>
          </div>
          <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-[#063F43] text-teal-700 dark:text-[#2DD4BF]">
            7 Modules Active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {modules.map((mod) => {
            const Icon = mod.icon;
            return (
              <div
                key={mod.id}
                onClick={() => onNavigate(mod.id)}
                className="bg-white dark:bg-[#182235] p-5 rounded-2xl border border-slate-200/80 dark:border-[#334155] hover:border-teal-500/60 dark:hover:border-[#14B8A6] shadow-2xs hover:shadow-sm transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-10 h-10 rounded-xl ${mod.bgColor} ${mod.color} flex items-center justify-center`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-lg font-bold text-slate-900 dark:text-[#F8FAFC] font-mono">
                      {mod.count.toLocaleString()}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-[#F8FAFC] group-hover:text-teal-600 dark:group-hover:text-[#2DD4BF] transition-colors">
                    {mod.name}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-1 leading-relaxed line-clamp-2">
                    {mod.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-[#334155] flex items-center justify-between text-xs font-semibold text-teal-600 dark:text-[#2DD4BF]">
                  <span>Open Section</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* System Security & Compliance card */}
      <div className="bg-slate-50 dark:bg-[#1E293B] p-5 rounded-2xl border border-slate-200/80 dark:border-[#334155] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-teal-100 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 flex items-center justify-center shrink-0">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900 dark:text-[#F8FAFC]">Master Security Privileges</p>
            <p className="text-[11px] text-slate-500 dark:text-[#94A3B8]">
              Role: Admin • Full Data Modification • CDSCO &amp; NABH Compliant Audit Trail
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-[#94A3B8]">
          <Server className="w-3.5 h-3.5 text-teal-500" />
          <span>PostgreSQL relational engine synchronized</span>
        </div>
      </div>
    </div>
  );
};
