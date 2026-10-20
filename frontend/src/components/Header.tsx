import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, Menu, Sun, Moon, User, LogOut, ShieldCheck, Stethoscope, Database, RefreshCw } from 'lucide-react';
import { CurrentUser } from '../types/pharmacy';

interface HeaderProps {
  title: string;
  onOpenSearch: () => void;
  onOpenNotifications: () => void;
  onToggleMobileMenu: () => void;
  hasNotifications?: boolean;
  isSidebarCollapsed: boolean;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  currentUser: CurrentUser;
  onNavigateToProfile: () => void;
  onLogout: () => void;
  apiConnected?: boolean | null;
  isSyncingData?: boolean;
  onRefreshData?: () => void;
  onOpenApiConfig?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  onOpenSearch,
  onOpenNotifications,
  onToggleMobileMenu,
  hasNotifications = true,
  isSidebarCollapsed,
  theme,
  onToggleTheme,
  currentUser,
  onNavigateToProfile,
  onLogout,
  apiConnected = null,
  isSyncingData = false,
  onRefreshData,
  onOpenApiConfig,
}) => {
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 ${
        isSidebarCollapsed ? 'lg:left-20' : 'lg:left-64'
      } right-0 h-16 bg-white/95 dark:bg-[#111827]/95 backdrop-blur-md border-b border-slate-200/80 dark:border-[#334155] z-30 flex items-center justify-between px-4 lg:px-8 transition-all duration-300`}
    >
      {/* Left: Mobile hamburger & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 text-slate-500 hover:text-slate-700 dark:text-[#94A3B8] dark:hover:text-[#F8FAFC] hover:bg-slate-100 dark:hover:bg-[#1E293B] rounded-xl transition-colors cursor-pointer"
          aria-label="Open Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold text-slate-900 dark:text-[#F8FAFC] tracking-tight">{title}</h1>
      </div>

      {/* Right: Search, Dark Mode, Notifications, Avatar */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Global Search Trigger */}
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-2.5 px-3 py-1.5 bg-slate-50 dark:bg-[#1E293B] hover:bg-slate-100 dark:hover:bg-[#273449] text-slate-400 dark:text-[#94A3B8] hover:text-slate-600 dark:hover:text-[#F8FAFC] rounded-xl text-xs font-medium border border-slate-200/60 dark:border-[#334155] focus:outline-none dark:focus-within:border-[#14B8A6] transition-all cursor-pointer w-36 sm:w-60"
        >
          <Search className="w-3.5 h-3.5 text-slate-400 dark:text-[#94A3B8] shrink-0" />
          <span className="truncate dark:text-[#94A3B8]">Search anything...</span>
          <kbd className="ml-auto hidden sm:inline-block px-1.5 py-0.5 bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#334155] rounded text-[10px] text-slate-400 dark:text-[#94A3B8] font-mono shadow-2xs">
            ⌘K
          </kbd>
        </button>

        {/* Backend API Connection Status Pill */}
        {onOpenApiConfig && (
          <button
            onClick={onOpenApiConfig}
            className={`hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-semibold border transition-all cursor-pointer ${
              apiConnected === true
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800 hover:bg-emerald-100/60'
                : apiConnected === false
                ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200/80 dark:border-rose-800 hover:bg-rose-100/60 animate-pulse'
                : 'bg-slate-100 dark:bg-[#1E293B] text-slate-600 dark:text-[#94A3B8] border-slate-200 dark:border-[#334155]'
            }`}
            title="Configure backend API (http://localhost:5000/api)"
          >
            <Database className="w-3.5 h-3.5 shrink-0" />
            <span>
              {isSyncingData
                ? 'Syncing...'
                : apiConnected === true
                ? 'MySQL: Online'
                : apiConnected === false
                ? 'MySQL: Offline'
                : 'MySQL API'}
            </span>
          </button>
        )}

        {/* Refresh Live Data Button */}
        {onRefreshData && (
          <button
            onClick={onRefreshData}
            disabled={isSyncingData}
            className="p-2 text-slate-500 hover:text-teal-600 dark:text-[#CBD5E1] dark:hover:text-[#2DD4BF] hover:bg-slate-100 dark:hover:bg-[#1E293B] rounded-xl transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh dynamic data from backend"
            aria-label="Refresh data"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncingData ? 'animate-spin text-teal-600 dark:text-[#2DD4BF]' : ''}`} />
          </button>
        )}

        {/* Dark Mode Toggle */}
        <button
          onClick={onToggleTheme}
          className="p-2 text-slate-500 hover:text-slate-800 dark:text-[#CBD5E1] dark:hover:text-[#FBBF24] hover:bg-slate-100 dark:hover:bg-[#1E293B] rounded-xl transition-colors cursor-pointer"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-[#FBBF24]" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600" />
          )}
        </button>

        {/* Notifications */}
        <button
          onClick={onOpenNotifications}
          className="relative p-2 text-slate-500 hover:text-slate-800 dark:text-[#CBD5E1] dark:hover:text-[#F8FAFC] hover:bg-slate-100 dark:hover:bg-[#1E293B] rounded-xl transition-colors cursor-pointer"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          {hasNotifications && (
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#F59E0B] ring-2 ring-white dark:ring-[#111827]" />
          )}
        </button>

        {/* User avatar with profile dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setProfileMenuOpen((prev) => !prev)}
            className="flex items-center pl-1 focus:outline-none cursor-pointer group"
            title="User Profile"
          >
            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-[#1E293B] text-slate-700 dark:text-[#CBD5E1] flex items-center justify-center font-bold text-xs ring-2 ring-slate-100 dark:ring-[#334155] group-hover:ring-teal-500 transition-all">
              {currentUser.role === 'admin' ? (
                <ShieldCheck className="w-4 h-4 text-indigo-500" />
              ) : currentUser.role === 'doctor' ? (
                <Stethoscope className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              ) : (
                <User className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              )}
            </div>
          </button>

          {/* Profile Dropdown Menu */}
          {profileMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#182235] rounded-2xl shadow-xl border border-slate-200/90 dark:border-[#334155] py-2 z-50 animate-fade-in text-xs">
              <div className="px-4 py-2.5 border-b border-slate-100 dark:border-[#334155]">
                <p className="font-bold text-slate-900 dark:text-[#F8FAFC] truncate">{currentUser.name}</p>
                <p className="text-[11px] text-teal-600 dark:text-[#2DD4BF] font-medium truncate">
                  {currentUser.subtitle || (currentUser.role === 'admin' ? 'Super Admin' : currentUser.role === 'doctor' ? 'Clinical Doctor' : 'Patient')}
                </p>
                {currentUser.email && (
                  <p className="text-[10px] text-slate-400 dark:text-[#94A3B8] truncate mt-0.5">{currentUser.email}</p>
                )}
              </div>

              <div className="p-1 space-y-0.5">
                <button
                  onClick={() => {
                    setProfileMenuOpen(false);
                    onNavigateToProfile();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-[#CBD5E1] hover:bg-slate-100 dark:hover:bg-[#1E293B] dark:hover:text-[#F8FAFC] transition-colors text-left cursor-pointer font-medium"
                >
                  <User className="w-3.5 h-3.5 text-teal-600 dark:text-[#2DD4BF]" />
                  <span>View Profile</span>
                </button>

                <button
                  onClick={() => {
                    onToggleTheme();
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-slate-700 dark:text-[#CBD5E1] hover:bg-slate-100 dark:hover:bg-[#1E293B] dark:hover:text-[#F8FAFC] transition-colors text-left cursor-pointer font-medium"
                >
                  <div className="flex items-center gap-2.5">
                    {theme === 'dark' ? (
                      <Sun className="w-3.5 h-3.5 text-[#FBBF24]" />
                    ) : (
                      <Moon className="w-3.5 h-3.5 text-slate-400" />
                    )}
                    <span>{theme === 'dark' ? 'Light Theme' : 'Dark Theme'}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 dark:text-[#94A3B8] uppercase font-semibold">
                    {theme}
                  </span>
                </button>
              </div>

              <div className="p-1 border-t border-slate-100 dark:border-[#334155] mt-1">
                <button
                  onClick={() => {
                    setProfileMenuOpen(false);
                    onLogout();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-[#273449] transition-colors text-left cursor-pointer font-medium"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
