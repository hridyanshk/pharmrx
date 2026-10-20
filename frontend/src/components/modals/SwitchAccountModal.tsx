import React from 'react';
import {
  X,
  Check,
  Stethoscope,
  Database,
  User,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { UserRole, CurrentUser } from '../../types/pharmacy';

interface SwitchAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: CurrentUser;
  onSelectRole: (role: UserRole, targetId?: string) => void;
}

export const SwitchAccountModal: React.FC<SwitchAccountModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSelectRole,
}) => {
  if (!isOpen) return null;

  const views: {
    role: UserRole;
    targetId: string;
    name: string;
    subtitle: string;
    badge: string;
    icon: React.ElementType;
    iconBg: string;
    iconColor: string;
    activeBorder: string;
    badgeBg: string;
    badgeText: string;
  }[] = [
    {
      role: 'doctor',
      targetId: 'DOC-101',
      name: 'Pharma View',
      subtitle: 'Dr. Arjun Mehta • Clinical & Pharmacy Operations',
      badge: 'Clinical',
      icon: Stethoscope,
      iconBg: 'bg-teal-50 dark:bg-teal-950/80',
      iconColor: 'text-teal-600 dark:text-teal-400',
      activeBorder: 'border-teal-500/80 dark:border-teal-400',
      badgeBg: 'bg-teal-50 dark:bg-teal-950/60',
      badgeText: 'text-teal-700 dark:text-teal-300',
    },
    {
      role: 'admin',
      targetId: 'ADMIN-001',
      name: 'Admin View',
      subtitle: 'System Administrator • Full Master Access',
      badge: 'Full Access',
      icon: Database,
      iconBg: 'bg-indigo-50 dark:bg-indigo-950/80',
      iconColor: 'text-indigo-600 dark:text-indigo-400',
      activeBorder: 'border-indigo-500/80 dark:border-indigo-400',
      badgeBg: 'bg-indigo-50 dark:bg-indigo-950/60',
      badgeText: 'text-indigo-700 dark:text-indigo-300',
    },
    {
      role: 'patient',
      targetId: 'PT-1002',
      name: 'Patient View',
      subtitle: 'Aarav Sharma • Personal Health Records',
      badge: 'Patient Portal',
      icon: User,
      iconBg: 'bg-cyan-50 dark:bg-cyan-950/80',
      iconColor: 'text-cyan-600 dark:text-cyan-400',
      activeBorder: 'border-cyan-500/80 dark:border-cyan-400',
      badgeBg: 'bg-cyan-50 dark:bg-cyan-950/60',
      badgeText: 'text-cyan-700 dark:text-cyan-300',
    },
  ];

  const handleSelect = (role: UserRole, targetId?: string) => {
    onSelectRole(role, targetId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
      <div className="bg-white dark:bg-[#182235] w-full max-w-md rounded-2xl shadow-2xl border border-slate-200/90 dark:border-[#334155] overflow-hidden flex flex-col p-6 space-y-5 text-slate-800 dark:text-[#F8FAFC]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#283548]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950/80 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-[#F8FAFC]">Switch View</h3>
              <p className="text-xs text-slate-500 dark:text-[#94A3B8]">
                Select an account view to switch instantly
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-[#1E293B] cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current Active Account Header Banner */}
        <div className="px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#1E293B] border border-slate-100 dark:border-[#283548] flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
            {currentUser.name.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-800 dark:text-[#F8FAFC] truncate">
                {currentUser.name}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 font-semibold">
                Active
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-[#94A3B8] truncate">
              {currentUser.email}
            </p>
          </div>
        </div>

        {/* Account List (Google Style) */}
        <div className="space-y-2.5">
          {views.map((v) => {
            const Icon = v.icon;
            const isActive = currentUser.role === v.role;

            return (
              <button
                key={v.role}
                onClick={() => handleSelect(v.role, v.targetId)}
                className={`w-full p-3.5 rounded-xl border text-left transition-all duration-150 cursor-pointer flex items-center justify-between gap-3 ${
                  isActive
                    ? `bg-teal-50/50 dark:bg-teal-950/30 ${v.activeBorder} ring-1 ring-teal-500/50`
                    : 'bg-white dark:bg-[#111827] border-slate-200/80 dark:border-[#283548] hover:border-teal-500/60 dark:hover:border-teal-400/60 hover:bg-slate-50/80 dark:hover:bg-[#1E293B]'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-xl ${v.iconBg} ${v.iconColor} flex items-center justify-center shrink-0 shadow-2xs`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900 dark:text-[#F8FAFC]">
                        {v.name}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${v.badgeBg} ${v.badgeText}`}
                      >
                        {v.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-[#94A3B8] truncate mt-0.5">
                      {v.subtitle}
                    </p>
                  </div>
                </div>

                {isActive ? (
                  <div className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                ) : (
                  <span className="text-xs font-semibold text-slate-400 group-hover:text-teal-600 dark:text-[#64748B] dark:group-hover:text-teal-400">
                    Switch
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer Note */}
        <div className="pt-2 text-center text-[11px] text-slate-400 dark:text-[#64748B] flex items-center justify-center gap-1.5 border-t border-slate-100 dark:border-[#283548]">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-500" />
          <span>Instant View Switch • No Password Required</span>
        </div>
      </div>
    </div>
  );
};
