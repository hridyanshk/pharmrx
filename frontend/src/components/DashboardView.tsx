import React, { useState } from 'react';
import {
  Pill,
  Users,
  Stethoscope,
  FileText,
  TrendingUp,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Database,
  Package,
  Bell,
} from 'lucide-react';
import { Prescription, Patient, Doctor, Medicine, NavRoute } from '../types/pharmacy';

interface DashboardViewProps {
  medicines: Medicine[];
  patients: Patient[];
  doctors: Doctor[];
  prescriptions: Prescription[];
  onNavigate: (route: NavRoute) => void;
  onViewPrescription: (rx: Prescription) => void;
  isAdmin?: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  medicines,
  patients,
  doctors,
  prescriptions,
  onNavigate,
  onViewPrescription,
  isAdmin = false,
}) => {
  // Chart 1: Prescription Activity time range
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '3m'>('7d');

  // Activity data by time range
  const activityData = {
    '7d': [
      { label: 'Mon', count: 38 },
      { label: 'Tue', count: 52 },
      { label: 'Wed', count: 45 },
      { label: 'Thu', count: 68 },
      { label: 'Fri', count: 74 },
      { label: 'Sat', count: 48 },
      { label: 'Sun', count: 32 },
    ],
    '30d': [
      { label: 'W1', count: 280 },
      { label: 'W2', count: 340 },
      { label: 'W3', count: 410 },
      { label: 'W4', count: 395 },
    ],
    '3m': [
      { label: 'Aug', count: 1250 },
      { label: 'Sep', count: 1420 },
      { label: 'Oct', count: 1540 },
    ],
  };

  const currentActivity = activityData[timeRange];
  const maxActivity = Math.max(...currentActivity.map((d) => d.count), 1);

  // Chart 2: Top Prescribed Medicines
  const topPrescribedMeds = [
    { name: 'Atorvastatin', count: 312, percent: 90 },
    { name: 'Metformin', count: 284, percent: 80 },
    { name: 'Ventolin', count: 195, percent: 60 },
    { name: 'Amoxicillin', count: 162, percent: 50 },
    { name: 'Lisinopril', count: 94, percent: 35 },
  ];

  // Chart 3: Donut chart data for inventory
  const inStockCount = medicines.filter((m) => m.StockQty > (m.safetyThreshold || 30)).length + 1420;
  const lowStockCount = medicines.filter((m) => m.StockQty > 0 && m.StockQty <= (m.safetyThreshold || 30)).length;
  const outOfStockCount = medicines.filter((m) => m.StockQty === 0).length || 1;
  const totalStockSKUs = inStockCount + lowStockCount + outOfStockCount;

  // Chart 4: Prescription Activity by Doctor (Indian Doctors)
  const doctorVolume = [
    { name: 'Dr. Arjun Mehta', count: 52, spec: 'Cardiology', percent: 92 },
    { name: 'Dr. Priya Sharma', count: 44, spec: 'Pulmonology', percent: 78 },
    { name: 'Dr. Rohan Iyer', count: 36, spec: 'Endocrinology', percent: 64 },
    { name: 'Dr. Sneha Kulkarni', count: 31, spec: 'General Medicine', percent: 55 },
    { name: 'Dr. Vikram Patel', count: 28, spec: 'Dermatology', percent: 50 },
  ];

  // Small inventory alerts (top 3)
  const topAlerts = [
    { name: 'Omeprazole', status: 'Out of stock', color: 'bg-rose-500', isOut: true },
    { name: 'Ventolin', status: 'Low stock (18 left)', color: 'bg-amber-500', isOut: false },
    { name: 'Lisinopril', status: 'Low stock (18 left)', color: 'bg-amber-500', isOut: false },
  ];

  // Recent 5 prescriptions
  const recentPrescriptions = prescriptions.slice(0, 5);

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Admin Mode Ribbon */}
      {isAdmin && (
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-4 sm:p-5 rounded-2xl border border-indigo-800/60 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 flex items-center justify-center shrink-0">
              <Database className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm tracking-tight text-white">Administrator Command Center</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                  FULL SYSTEM ACCESS
                </span>
              </div>
              <p className="text-xs text-indigo-200/80 mt-0.5">
                You are viewing the master workspace. Direct access to all operational sections:
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
            <button
              onClick={() => onNavigate('medicines')}
              className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Pill className="w-3.5 h-3.5 text-teal-300" />
              <span>Medicines</span>
            </button>
            <button
              onClick={() => onNavigate('patients')}
              className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Users className="w-3.5 h-3.5 text-cyan-300" />
              <span>Patients</span>
            </button>
            <button
              onClick={() => onNavigate('doctors')}
              className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Stethoscope className="w-3.5 h-3.5 text-blue-300" />
              <span>Doctors</span>
            </button>
            <button
              onClick={() => onNavigate('prescriptions')}
              className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-indigo-300" />
              <span>Prescriptions</span>
            </button>
            <button
              onClick={() => onNavigate('inventory')}
              className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Package className="w-3.5 h-3.5 text-emerald-300" />
              <span>Inventory</span>
            </button>
            <button
              onClick={() => onNavigate('alerts')}
              className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Bell className="w-3.5 h-3.5 text-amber-300" />
              <span>Alerts</span>
            </button>
          </div>
        </div>
      )}

      {/* 1. Top Section: 4 Compact KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Medicines */}
        <div
          onClick={() => onNavigate('medicines')}
          className="bg-white dark:bg-[#182235] p-5 rounded-2xl border border-slate-200/80 dark:border-[#334155] shadow-2xs hover:shadow-xs hover:border-slate-300 dark:hover:border-slate-500 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-[#94A3B8]">Medicines</span>
            <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-[#063F43] text-teal-600 dark:text-[#2DD4BF] flex items-center justify-center group-hover:bg-teal-100 dark:group-hover:bg-[#084e54] transition-colors">
              <Pill className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-[#F8FAFC]">1,428</span>
            <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-teal-600 dark:text-[#2DD4BF]">
              <TrendingUp className="w-3 h-3" />
              +12
            </span>
          </div>
        </div>

        {/* Card 2: Patients */}
        <div
          onClick={() => onNavigate('patients')}
          className="bg-white dark:bg-[#182235] p-5 rounded-2xl border border-slate-200/80 dark:border-[#334155] shadow-2xs hover:shadow-xs hover:border-slate-300 dark:hover:border-slate-500 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-[#94A3B8]">Patients</span>
            <div className="w-8 h-8 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-[#60A5FA] flex items-center justify-center group-hover:bg-cyan-100 dark:group-hover:bg-cyan-900/60 transition-colors">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-[#F8FAFC]">2,190</span>
            <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-teal-600 dark:text-[#2DD4BF]">
              <TrendingUp className="w-3 h-3" />
              +24
            </span>
          </div>
        </div>

        {/* Card 3: Doctors */}
        <div
          onClick={() => onNavigate('doctors')}
          className="bg-white dark:bg-[#182235] p-5 rounded-2xl border border-slate-200/80 dark:border-[#334155] shadow-2xs hover:shadow-xs hover:border-slate-300 dark:hover:border-slate-500 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-[#94A3B8]">Doctors</span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-[#1E293B] text-slate-600 dark:text-[#CBD5E1] flex items-center justify-center group-hover:bg-slate-200 dark:group-hover:bg-[#273449] transition-colors">
              <Stethoscope className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-[#F8FAFC]">86</span>
            <span className="text-[11px] font-medium text-slate-400 dark:text-[#94A3B8]">14 specs</span>
          </div>
        </div>

        {/* Card 4: Prescriptions */}
        <div
          onClick={() => onNavigate('prescriptions')}
          className="bg-white dark:bg-[#182235] p-5 rounded-2xl border border-slate-200/80 dark:border-[#334155] shadow-2xs hover:shadow-xs hover:border-slate-300 dark:hover:border-slate-500 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-[#94A3B8]">Prescriptions</span>
            <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-[#063F43] text-teal-600 dark:text-[#2DD4BF] flex items-center justify-center group-hover:bg-teal-100 dark:group-hover:bg-[#084e54] transition-colors">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-[#F8FAFC]">3,842</span>
            <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-teal-600 dark:text-[#2DD4BF]">
              <TrendingUp className="w-3 h-3" />
              +8.4%
            </span>
          </div>
        </div>
      </div>

      {/* 2. Main Chart: Prescription Activity (Line / Area chart) */}
      <div className="bg-white dark:bg-[#182235] p-6 rounded-2xl border border-slate-200/80 dark:border-[#334155] shadow-2xs space-y-4 transition-colors">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-[#F8FAFC]">Prescription Activity</h2>
            <p className="text-xs text-slate-400 dark:text-[#94A3B8]">Total prescriptions processed over time</p>
          </div>

          {/* Time range pills */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-[#1E293B] border border-transparent dark:border-[#334155] rounded-xl text-xs font-medium text-slate-600 dark:text-[#CBD5E1]">
            {(['7d', '30d', '3m'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  timeRange === r
                    ? 'bg-white dark:bg-[#063F43] text-slate-900 dark:text-[#2DD4BF] shadow-2xs font-semibold'
                    : 'hover:text-slate-900 dark:hover:text-[#F8FAFC]'
                }`}
              >
                {r === '7d' ? '7 Days' : r === '30d' ? '30 Days' : '3 Months'}
              </button>
            ))}
          </div>
        </div>

        {/* Clean SVG Area / Line Chart */}
        <div className="w-full h-56 pt-2">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 600 160" preserveAspectRatio="none">
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2dd4bf" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#2dd4bf" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid lines */}
            <line x1="0" y1="30" x2="600" y2="30" stroke="#f1f5f9" className="dark:stroke-[#334155]" strokeWidth="1" />
            <line x1="0" y1="75" x2="600" y2="75" stroke="#f1f5f9" className="dark:stroke-[#334155]" strokeWidth="1" />
            <line x1="0" y1="120" x2="600" y2="120" stroke="#f1f5f9" className="dark:stroke-[#334155]" strokeWidth="1" />

            {/* Area Path */}
            {(() => {
              const points = currentActivity.map((d, i) => {
                const x = (i / (currentActivity.length - 1)) * 600;
                const y = 140 - (d.count / maxActivity) * 110;
                return { x, y, count: d.count, label: d.label };
              });

              const pathString = points.reduce((acc, p, i) => {
                return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
              }, '');

              const areaString = `${pathString} L 600 145 L 0 145 Z`;

              return (
                <>
                  <path d={areaString} fill="url(#chartGradient)" />
                  <path d={pathString} fill="none" stroke="#2dd4bf" strokeWidth="2.5" strokeLinecap="round" />
                  {points.map((p, idx) => (
                    <g key={idx} className="group">
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r="3.5"
                        fill="#ffffff"
                        stroke="#2dd4bf"
                        strokeWidth="2"
                        className="transition-transform group-hover:scale-150 cursor-pointer dark:fill-[#182235]"
                      />
                      <text
                        x={p.x}
                        y={p.y - 10}
                        textAnchor="middle"
                        fontSize="10"
                        fontWeight="600"
                        fill="#0f766e"
                        className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none dark:fill-[#2dd4bf]"
                      >
                        {p.count}
                      </text>
                    </g>
                  ))}
                </>
              );
            })()}
          </svg>

          {/* X-axis labels */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-[#94A3B8] mt-2 font-medium">
            {currentActivity.map((d, idx) => (
              <span key={idx}>{d.label}</span>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Secondary Analytics: 3 Cards Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Second Chart: Prescription by Medicine */}
        <div className="bg-white dark:bg-[#182235] p-6 rounded-2xl border border-slate-200/80 dark:border-[#334155] shadow-2xs space-y-4 transition-colors">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-[#F8FAFC]">Prescription by Medicine</h3>
            <p className="text-xs text-slate-400 dark:text-[#94A3B8]">Most frequently prescribed drugs</p>
          </div>

          <div className="space-y-3 pt-1">
            {topPrescribedMeds.map((med) => (
              <div key={med.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-700 dark:text-[#F8FAFC]">{med.name}</span>
                  <span className="text-slate-500 dark:text-[#CBD5E1] font-semibold">{med.count}</span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-[#1E293B] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-teal-600 dark:bg-[#2DD4BF] rounded-full transition-all duration-500"
                    style={{ width: `${med.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Third Chart: Inventory Status (Donut Chart) */}
        <div className="bg-white dark:bg-[#182235] p-6 rounded-2xl border border-slate-200/80 dark:border-[#334155] shadow-2xs flex flex-col justify-between transition-colors">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-[#F8FAFC]">Inventory Status</h3>
            <p className="text-xs text-slate-400 dark:text-[#94A3B8]">Stock health breakdown</p>
          </div>

          {/* Donut representation */}
          <div className="py-4 flex items-center justify-center">
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                {/* Background Ring */}
                <circle cx="50" cy="50" r="38" stroke="#f1f5f9" className="dark:stroke-[#334155]" strokeWidth="12" fill="none" />
                {/* In Stock (98%) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  stroke="#2dd4bf"
                  strokeWidth="12"
                  strokeDasharray="238.7"
                  strokeDashoffset="6"
                  strokeLinecap="round"
                  fill="none"
                />
                {/* Low Stock (1.5%) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  stroke="#fbbf24"
                  strokeWidth="12"
                  strokeDasharray="238.7"
                  strokeDashoffset="232"
                  fill="none"
                />
                {/* Out of Stock (0.5%) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  stroke="#f87171"
                  strokeWidth="12"
                  strokeDasharray="238.7"
                  strokeDashoffset="237"
                  fill="none"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                <span className="text-xl font-bold text-slate-900 dark:text-[#F8FAFC]">{totalStockSKUs}</span>
                <span className="text-[10px] text-slate-400 dark:text-[#94A3B8] uppercase tracking-wider font-medium">SKUs</span>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-around text-xs pt-2 border-t border-slate-100 dark:border-[#334155]">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-500 dark:bg-[#2DD4BF]" />
              <span className="text-slate-600 dark:text-[#CBD5E1]">In Stock ({inStockCount})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 dark:bg-[#FBBF24]" />
              <span className="text-slate-600 dark:text-[#CBD5E1]">Low ({lowStockCount})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 dark:bg-[#F87171]" />
              <span className="text-slate-600 dark:text-[#CBD5E1]">Out ({outOfStockCount})</span>
            </div>
          </div>
        </div>

        {/* Fourth Chart: Prescription Activity by Doctor */}
        <div className="bg-white dark:bg-[#182235] p-6 rounded-2xl border border-slate-200/80 dark:border-[#334155] shadow-2xs space-y-4 transition-colors">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-[#F8FAFC]">Prescription Activity by Doctor</h3>
            <p className="text-xs text-slate-400 dark:text-[#94A3B8]">Order volumes by prescriber</p>
          </div>

          <div className="space-y-3 pt-1">
            {doctorVolume.map((doc) => (
              <div key={doc.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-700 dark:text-[#F8FAFC]">{doc.name}</span>
                  <span className="text-slate-500 dark:text-[#CBD5E1] font-semibold">{doc.count} Rx</span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-[#1E293B] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-cyan-600 dark:bg-[#60A5FA] rounded-full transition-all duration-500"
                    style={{ width: `${doc.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Bottom Section: Alert Card + Recent Prescriptions List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Small Inventory Alert Card */}
        <div className="bg-white dark:bg-[#182235] p-6 rounded-2xl border border-slate-200/80 dark:border-[#334155] shadow-2xs space-y-4 flex flex-col justify-between transition-colors">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-500 dark:text-[#FBBF24]" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-[#F8FAFC]">Inventory Alerts</h3>
            </div>
            <p className="text-xs text-slate-400 dark:text-[#94A3B8]">Critical reorder notices</p>
          </div>

          <div className="space-y-3">
            {topAlerts.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#1E293B] border border-slate-100 dark:border-[#334155] text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span className={`w-2 h-2 rounded-full ${item.color}`} />
                  <span className="font-semibold text-slate-800 dark:text-[#F8FAFC]">{item.name}</span>
                </div>
                <span className={item.isOut ? 'text-rose-600 dark:text-[#F87171] font-semibold' : 'text-amber-700 dark:text-[#FBBF24] font-semibold'}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>

          <button
            onClick={() => onNavigate('inventory')}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-50 dark:bg-[#1E293B] hover:bg-slate-100 dark:hover:bg-[#273449] text-slate-700 dark:text-[#CBD5E1] dark:hover:text-[#F8FAFC] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-slate-200/60 dark:border-[#334155]"
          >
            <span>View inventory</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Recent Activity: 5 Prescriptions List */}
        <div className="lg:col-span-2 bg-white dark:bg-[#182235] p-6 rounded-2xl border border-slate-200/80 dark:border-[#334155] shadow-2xs space-y-4 flex flex-col justify-between transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-[#F8FAFC]">Recent Prescriptions</h3>
              <p className="text-xs text-slate-400 dark:text-[#94A3B8]">Latest doctor orders received</p>
            </div>
            <button
              onClick={() => onNavigate('prescriptions')}
              className="text-xs font-semibold text-teal-600 dark:text-[#2DD4BF] hover:text-teal-700 dark:hover:text-[#5EEAD4] flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>View all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Clean 5-row table */}
          <div className="divide-y divide-slate-100 dark:divide-[#334155] overflow-hidden">
            {recentPrescriptions.map((rx) => {
              const patient = patients.find((p) => p.PatientID === rx.PatientID);
              const doctor = doctors.find((d) => d.DoctorID === rx.DoctorID);

              return (
                <div
                  key={rx.PrescriptionID}
                  onClick={() => onViewPrescription(rx)}
                  className="py-3 px-2 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-[#223047] rounded-xl transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-teal-700 dark:text-[#2DD4BF] group-hover:text-teal-800 dark:group-hover:text-[#5EEAD4]">
                      {rx.PrescriptionID}
                    </span>
                    <div>
                      <p className="text-xs font-semibold text-slate-800 dark:text-[#F8FAFC]">
                        {patient ? patient.Name : rx.PatientID}
                      </p>
                      <p className="text-[11px] text-slate-400 dark:text-[#94A3B8]">
                        {doctor ? doctor.Name : rx.DoctorID}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-[11px] text-slate-400 dark:text-[#94A3B8] hidden sm:inline">
                      {rx.Date === '2024-10-24' ? 'Today' : rx.Date}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                        rx.status === 'Dispensed'
                          ? 'bg-teal-50 dark:bg-emerald-950/40 text-teal-700 dark:text-[#34D399] dark:border dark:border-emerald-500/25'
                          : rx.status === 'In Filling'
                          ? 'bg-cyan-50 dark:bg-blue-950/40 text-cyan-700 dark:text-[#60A5FA] dark:border dark:border-blue-500/25'
                          : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-[#FBBF24] dark:border dark:border-amber-500/25'
                      }`}
                    >
                      {rx.status || 'Active'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
