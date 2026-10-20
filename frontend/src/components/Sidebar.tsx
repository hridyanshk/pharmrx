import React from 'react';
import {
  LayoutDashboard,
  Pill,
  Users,
  Stethoscope,
  FileText,
  Package,
  BarChart3,
  LogOut,
  X,
  ChevronLeft,
  ChevronRight,
  User,
  PanelLeftClose,
  PanelLeftOpen,
  Bell,
  Database,
  ShieldCheck,
} from 'lucide-react';
import { NavRoute, CurrentUser } from '../types/pharmacy';

interface SidebarProps {
  currentRoute: NavRoute;
  onRouteChange: (route: NavRoute) => void;
  hasInventoryAlert?: boolean;
  onLogout: () => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  currentUser: CurrentUser;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRoute,
  onRouteChange,
  hasInventoryAlert = false,
  onLogout,
  mobileOpen = false,
  onCloseMobile,
  isCollapsed,
  onToggleCollapse,
  currentUser,
}) => {
  // Navigation items based on user role
  const adminNavItems = [
    { id: 'dashboard' as NavRoute, label: 'System Overview', icon: LayoutDashboard },
    { id: 'medicines' as NavRoute, label: 'Medicines', icon: Pill },
    { id: 'patients' as NavRoute, label: 'Patients', icon: Users },
    { id: 'doctors' as NavRoute, label: 'Doctors', icon: Stethoscope },
    { id: 'prescriptions' as NavRoute, label: 'Prescriptions', icon: FileText },
    { id: 'inventory' as NavRoute, label: 'Inventory', icon: Package },
    { id: 'alerts' as NavRoute, label: 'Stock Alerts', icon: Bell, hasAlert: hasInventoryAlert },
    { id: 'reports' as NavRoute, label: 'Reports & Analytics', icon: BarChart3 },
  ];

  const doctorNavItems = [
    { id: 'dashboard' as NavRoute, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'patients' as NavRoute, label: 'Patients', icon: Users },
    { id: 'prescriptions' as NavRoute, label: 'Prescriptions', icon: FileText },
    { id: 'medicines' as NavRoute, label: 'Medicines', icon: Pill },
    { id: 'reports' as NavRoute, label: 'Reports', icon: BarChart3 },
  ];

  const patientNavItems = [
    { id: 'dashboard' as NavRoute, label: 'My Dashboard', icon: LayoutDashboard },
    { id: 'my-prescriptions' as NavRoute, label: 'My Prescriptions', icon: FileText },
    { id: 'my-medicines' as NavRoute, label: 'My Medicines', icon: Pill },
    { id: 'profile' as NavRoute, label: 'My Profile', icon: User },
  ];

  const navItems =
    currentUser.role === 'admin'
      ? adminNavItems
      : currentUser.role === 'doctor'
      ? doctorNavItems
      : patientNavItems;

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-full bg-white dark:bg-[#111827] border-r border-slate-200/80 dark:border-[#334155] z-50 flex flex-col justify-between transition-all duration-300 lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'w-20' : 'w-64'}`}
      >
        <div className="flex flex-col">
          {/* Brand header */}
          <div className="h-16 px-4 flex items-center justify-between border-b border-slate-100 dark:border-[#334155]">
            <div
              className={`flex items-center gap-2.5 cursor-pointer select-none overflow-hidden ${
                isCollapsed ? 'justify-center w-full' : ''
              }`}
              onClick={() => {
                onRouteChange('dashboard');
                onCloseMobile?.();
              }}
              title="PharmRx - Healthcare OS"
            >
              <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white shadow-xs shrink-0">
                <Pill className="w-4 h-4" />
              </div>
              {!isCollapsed && (
                <div className="flex flex-col min-w-0">
                  <span className="font-bold text-base text-slate-900 dark:text-[#F8FAFC] tracking-tight leading-tight truncate">
                    PharmRx
                  </span>
                  <span className="text-[10px] text-teal-600 dark:text-[#2DD4BF] font-semibold truncate">
                    {currentUser.role === 'admin'
                      ? 'Admin'
                      : currentUser.role === 'doctor'
                      ? 'Clinical Pharmacy OS'
                      : 'Patient Care Portal'}
                  </span>
                </div>
              )}
            </div>

            {/* Mobile close button */}
            {mobileOpen && (
              <button
                onClick={onCloseMobile}
                className="lg:hidden p-1.5 text-slate-400 hover:text-slate-600 dark:text-[#94A3B8] dark:hover:text-[#F8FAFC] rounded-lg hover:bg-slate-50 dark:hover:bg-[#1E293B] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* Desktop Collapse Toggle in Header */}
            {!isCollapsed && (
              <button
                onClick={onToggleCollapse}
                className="hidden lg:flex p-1.5 text-slate-400 hover:text-slate-600 dark:text-[#94A3B8] dark:hover:text-[#2DD4BF] rounded-lg hover:bg-slate-100 dark:hover:bg-[#1E293B] transition-colors cursor-pointer"
                title="Collapse sidebar"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Collapsed expand button on desktop */}
          {isCollapsed && (
            <div className="hidden lg:flex justify-center pt-2">
              <button
                onClick={onToggleCollapse}
                className="p-1.5 text-slate-400 hover:text-teal-600 dark:text-[#94A3B8] dark:hover:text-[#2DD4BF] rounded-lg hover:bg-slate-100 dark:hover:bg-[#1E293B] transition-colors cursor-pointer"
                title="Expand sidebar"
              >
                <PanelLeftOpen className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1 px-3 py-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                currentRoute === item.id ||
                (currentUser.role === 'patient' && currentRoute === 'prescriptions' && item.id === 'my-prescriptions') ||
                (currentUser.role === 'patient' && currentRoute === 'medicines' && item.id === 'my-medicines');

              return (
                <div key={item.id} className="relative group">
                  <button
                    onClick={() => {
                      onRouteChange(item.id);
                      onCloseMobile?.();
                    }}
                    className={`w-full flex items-center ${
                      isCollapsed ? 'justify-center px-2 py-3' : 'justify-between px-3.5 py-2.5'
                    } rounded-xl text-sm font-medium transition-all text-left cursor-pointer ${
                      isActive
                        ? 'bg-teal-50 dark:bg-[#063F43] text-teal-700 dark:text-[#2DD4BF] font-semibold shadow-2xs border-l-[3px] border-teal-600 dark:border-[#14B8A6]'
                        : 'text-slate-600 dark:text-[#CBD5E1] hover:bg-slate-50 dark:hover:bg-[#1E293B] hover:text-slate-900 dark:hover:text-[#F8FAFC]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          isActive
                            ? 'text-teal-600 dark:text-[#2DD4BF]'
                            : 'text-slate-400 dark:text-[#94A3B8] group-hover:text-slate-600 dark:group-hover:text-[#5EEAD4]'
                        }`}
                      />
                      {!isCollapsed && <span className="truncate">{item.label}</span>}
                    </div>

                    {!isCollapsed && (item as any).hasAlert && (
                      <span className="w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white dark:ring-[#111827]" />
                    )}
                  </button>

                  {/* Tooltip for collapsed mode */}
                  {isCollapsed && (
                    <div className="hidden lg:block absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1 bg-slate-900 dark:bg-[#1E293B] border border-transparent dark:border-[#334155] text-white dark:text-[#F8FAFC] text-xs font-semibold rounded-lg shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                      {item.label}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* User profile & logout at bottom */}
        <div className="p-3 border-t border-slate-100 dark:border-[#334155]">
          <div
            className={`flex items-center ${
              isCollapsed ? 'justify-center p-2' : 'justify-between p-2'
            } rounded-xl bg-slate-50 dark:bg-[#1E293B] border border-slate-200/60 dark:border-[#334155] hover:bg-slate-100 dark:hover:bg-[#273449] transition-colors`}
          >
            <div
              className={`flex items-center gap-2.5 min-w-0 cursor-pointer ${
                isCollapsed ? 'justify-center' : ''
              }`}
              onClick={() => onRouteChange('profile')}
              title={isCollapsed ? `${currentUser.name} (View Profile)` : 'View Profile'}
            >
              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-[#111827] text-slate-700 dark:text-[#CBD5E1] flex items-center justify-center font-bold text-xs shrink-0 ring-1 ring-slate-200 dark:ring-[#334155]">
                {currentUser.role === 'admin' ? (
                  <ShieldCheck className="w-4 h-4 text-indigo-500" />
                ) : currentUser.role === 'doctor' ? (
                  <Stethoscope className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                ) : (
                  <User className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                )}
              </div>
              {!isCollapsed && (
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-800 dark:text-[#F8FAFC] truncate">
                    {currentUser.name}
                  </p>
                  <p className="text-[10px] text-slate-400 dark:text-[#94A3B8] truncate">
                    {currentUser.subtitle ||
                      (currentUser.role === 'admin'
                        ? 'Super Admin'
                        : currentUser.role === 'doctor'
                        ? 'Clinical Doctor'
                        : 'Patient')}
                  </p>
                </div>
              )}
            </div>

            {!isCollapsed && (
              <button
                onClick={onLogout}
                className="p-1.5 text-slate-400 hover:text-rose-600 dark:text-[#CBD5E1] dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-[#273449] rounded-lg transition-colors cursor-pointer"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* In collapsed mode, separate logout button */}
          {isCollapsed && (
            <div className="flex justify-center pt-2">
              <button
                onClick={onLogout}
                className="p-2 text-slate-400 hover:text-rose-600 dark:text-[#CBD5E1] dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-[#273449] rounded-lg transition-colors cursor-pointer"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
