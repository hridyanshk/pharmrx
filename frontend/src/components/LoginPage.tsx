import React, { useState } from 'react';
import {
  Pill,
  ShieldCheck,
  Activity,
  CheckCircle2,
  Stethoscope,
  User,
  Database,
  ArrowRight,
  Layers,
  Sparkles,
} from 'lucide-react';
import { UserRole } from '../types/pharmacy';

interface LoginPageProps {
  onLogin: (role: UserRole, targetId?: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  const handleSelectRole = (role: UserRole, targetId?: string) => {
    setSelectedRole(role);
    // Instant navigation to role workspace
    onLogin(role, targetId);
  };

  const roleOptions: {
    role: UserRole;
    targetId: string;
    title: string;
    badge: string;
    subtitle: string;
    persona: string;
    description: string;
    icon: React.ElementType;
    iconColor: string;
    iconBg: string;
    borderColor: string;
    hoverBorder: string;
    badgeBg: string;
    badgeText: string;
    tableHighlights: string[];
  }[] = [
    {
      role: 'doctor',
      targetId: 'DOC-101',
      title: 'Doctor',
      badge: 'Clinical Portal',
      subtitle: 'Prescriptions & Patient Care',
      persona: 'Dr. Arjun Mehta, MD (Cardiologist)',
      description:
        'Access patient medical records, author electronic prescriptions, review clinical diagnostics, and consult formulary stock.',
      icon: Stethoscope,
      iconColor: 'text-teal-600 dark:text-teal-300',
      iconBg: 'bg-teal-50 dark:bg-teal-950/70',
      borderColor: 'border-slate-200/80 dark:border-slate-800',
      hoverBorder: 'hover:border-teal-500/80 dark:hover:border-teal-400',
      badgeBg: 'bg-teal-50 dark:bg-teal-950/60',
      badgeText: 'text-teal-700 dark:text-teal-300',
      tableHighlights: ['Patient Medical Records', 'Prescription Authoring', 'Formulary & Diagnostics'],
    },
    {
      role: 'patient',
      targetId: 'PT-1002',
      title: 'Patient',
      badge: 'Patient Portal',
      subtitle: 'Personal Health Records',
      persona: 'Aarav Sharma (Patient #PT-1002)',
      description:
        'View active prescriptions, review dosage instructions, track prescribed medications, and update personal allergy profile.',
      icon: User,
      iconColor: 'text-cyan-600 dark:text-cyan-300',
      iconBg: 'bg-cyan-50 dark:bg-cyan-950/70',
      borderColor: 'border-slate-200/80 dark:border-slate-800',
      hoverBorder: 'hover:border-cyan-500/80 dark:hover:border-cyan-400',
      badgeBg: 'bg-cyan-50 dark:bg-cyan-950/60',
      badgeText: 'text-cyan-700 dark:text-cyan-300',
      tableHighlights: ['My Prescriptions', 'My Medications', 'Personal Care Profile'],
    },
    {
      role: 'admin',
      targetId: 'ADMIN-001',
      title: 'Admin',
      badge: 'Full Access',
      subtitle: 'Master System Access',
      persona: 'System Administrator (Full Authority)',
      description:
        'Complete administrative authority with direct access to all system sections: Medicines, Patients, Doctors, Prescriptions, Inventory, Alerts, and Reports.',
      icon: Database,
      iconColor: 'text-indigo-600 dark:text-indigo-300',
      iconBg: 'bg-indigo-50 dark:bg-indigo-950/70',
      borderColor: 'border-indigo-200/80 dark:border-indigo-900/60',
      hoverBorder: 'hover:border-indigo-500/80 dark:hover:border-indigo-400',
      badgeBg: 'bg-indigo-50 dark:bg-indigo-950/60',
      badgeText: 'text-indigo-700 dark:text-indigo-300',
      tableHighlights: ['All System Sections', 'Warehouse & Stock Audits', 'Clinical & Financial Analytics'],
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-between transition-colors duration-200">
      {/* Top Bar Header */}
      <header className="px-6 py-4 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-sm">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">PharmRx</span>
              <span className="text-xs text-teal-600 dark:text-teal-400 block -mt-1 font-semibold">
                Clinical Pharmacy OS
              </span>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium border border-slate-200/60 dark:border-slate-700/60">
            <Activity className="w-3.5 h-3.5 text-teal-500" />
            <span>Instant Role Access • No Password Required</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-5xl space-y-8">
          {/* Header Title */}
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 text-xs font-semibold border border-teal-200/60 dark:border-teal-800/60">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Select Your Role</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Choose an account to open your view
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Click any option below to immediately enter that role's customized workspace.
            </p>
          </div>

          {/* 3 Role Selection Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {roleOptions.map((opt) => {
              const Icon = opt.icon;
              const isSelected = selectedRole === opt.role;

              return (
                <div
                  key={opt.role}
                  onClick={() => handleSelectRole(opt.role, opt.targetId)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleSelectRole(opt.role, opt.targetId);
                    }
                  }}
                  className={`relative group bg-white dark:bg-slate-900 p-6 rounded-2xl border ${opt.borderColor} ${opt.hoverBorder} shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between text-left focus:outline-none focus:ring-2 focus:ring-teal-500 hover:-translate-y-1 ${
                    isSelected ? 'ring-2 ring-teal-500 bg-teal-50/20' : ''
                  }`}
                >
                  <div className="space-y-4">
                    {/* Top Row: Icon + Badge */}
                    <div className="flex items-center justify-between">
                      <div
                        className={`w-12 h-12 rounded-xl ${opt.iconBg} ${opt.iconColor} flex items-center justify-center shadow-xs transition-transform group-hover:scale-110`}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold ${opt.badgeBg} ${opt.badgeText} border border-current/20`}
                      >
                        {opt.badge}
                      </span>
                    </div>

                    {/* Role Title & Subtitle */}
                    <div>
                      <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                        {opt.title}
                      </h2>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                        {opt.subtitle}
                      </p>
                    </div>

                    {/* Persona Details */}
                    <div className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-800 text-xs">
                      <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block">
                        Account Persona
                      </span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block">
                        {opt.persona}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {opt.description}
                    </p>

                    {/* Highlighted tables or features */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                      {opt.tableHighlights.map((hl, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                          <span className="truncate">{hl}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bottom Action Button */}
                  <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      className="w-full py-2.5 px-4 rounded-xl bg-slate-900 group-hover:bg-teal-600 dark:bg-slate-800 dark:group-hover:bg-teal-600 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                    >
                      <span>Open {opt.title} View</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-4 border-t border-slate-200/80 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/50 text-xs text-slate-500 dark:text-slate-400 text-center">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>&copy; 2026 PharmRx Health Systems • Instant Workspace Navigation</span>
          <span className="flex items-center gap-1 text-slate-400 dark:text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-500" />
            NABH &amp; CDSCO Compliant Operating System
          </span>
        </div>
      </footer>
    </div>
  );
};
