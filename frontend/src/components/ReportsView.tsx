import React, { useState } from 'react';
import { Download, Printer, FileSpreadsheet, Calendar, Filter } from 'lucide-react';
import { Medicine, Doctor } from '../types/pharmacy';

interface ReportsViewProps {
  medicines: Medicine[];
  doctors: Doctor[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({ medicines, doctors }) => {
  const [dateRange, setDateRange] = useState('30d');
  const [selectedDoctor, setSelectedDoctor] = useState('all');

  const handleExportCSV = () => {
    const csvContent =
      'Category,Metric,Value\n' +
      'Prescriptions,30-Day Total,1442\n' +
      'Inventory,Healthy Stock,1423\n' +
      'Inventory,Low Stock,4\n' +
      'Inventory,Depleted Stock,1\n';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PharmRx_Report_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Reports &amp; Analytics</h1>
          <p className="text-xs text-slate-500 mt-0.5">Clinical performance, dispensing trends, and inventory distribution</p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-teal-600" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-slate-500 font-medium">
            <Filter className="w-3.5 h-3.5" />
            <span>Filters:</span>
          </div>

          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none cursor-pointer"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Year to Date</option>
          </select>

          <select
            value={selectedDoctor}
            onChange={(e) => setSelectedDoctor(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none cursor-pointer"
          >
            <option value="all">All Clinicians</option>
            {doctors.map((d) => (
              <option key={d.DoctorID} value={d.DoctorID}>
                {d.Name}
              </option>
            ))}
          </select>
        </div>

        <span className="text-slate-400 font-medium">Aggregated over 3,842 total historical records</span>
      </div>

      {/* 1. Large Chart: Prescription Trends (Line / Area chart) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Prescription Trends</h2>
          <p className="text-xs text-slate-400">Weekly dispensation volumes across all hospital wards</p>
        </div>

        <div className="w-full h-52 pt-2">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 600 140" preserveAspectRatio="none">
            <line x1="0" y1="20" x2="600" y2="20" stroke="#f1f5f9" strokeWidth="1" />
            <line x1="0" y1="60" x2="600" y2="60" stroke="#f1f5f9" strokeWidth="1" />
            <line x1="0" y1="100" x2="600" y2="100" stroke="#f1f5f9" strokeWidth="1" />

            <path
              d="M 0 110 L 100 85 L 200 95 L 300 50 L 400 40 L 500 60 L 600 25 L 600 135 L 0 135 Z"
              fill="rgba(13, 148, 136, 0.12)"
            />
            <path
              d="M 0 110 L 100 85 L 200 95 L 300 50 L 400 40 L 500 60 L 600 25"
              fill="none"
              stroke="#0d9488"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>

          <div className="flex justify-between text-[11px] text-slate-400 font-medium mt-2">
            <span>Week 1</span>
            <span>Week 2</span>
            <span>Week 3</span>
            <span>Week 4</span>
            <span>Week 5</span>
            <span>Week 6</span>
            <span>Current Week</span>
          </div>
        </div>
      </div>

      {/* 2. Grid: Most Prescribed Medicines + Inventory Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Prescribed Medicines (Bar chart) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Most Prescribed Medicines</h3>
            <p className="text-xs text-slate-400">Total units dispensed</p>
          </div>

          <div className="space-y-3 pt-2">
            {[
              { name: 'Atorvastatin', count: 312, percent: 90 },
              { name: 'Metformin', count: 284, percent: 80 },
              { name: 'Ventolin', count: 195, percent: 60 },
              { name: 'Amoxicillin', count: 162, percent: 50 },
              { name: 'Lisinopril', count: 94, percent: 35 },
            ].map((item) => (
              <div key={item.name} className="space-y-1 text-xs">
                <div className="flex justify-between font-medium">
                  <span className="text-slate-800">{item.name}</span>
                  <span className="text-slate-500 font-semibold">{item.count} units</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-teal-600 rounded-full" style={{ width: `${item.percent}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Inventory Distribution (Donut chart) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Inventory Distribution</h3>
            <p className="text-xs text-slate-400">Formulary SKU availability ratios</p>
          </div>

          <div className="py-4 flex items-center justify-center">
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="38" stroke="#f1f5f9" strokeWidth="12" fill="none" />
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  stroke="#0d9488"
                  strokeWidth="12"
                  strokeDasharray="238.7"
                  strokeDashoffset="8"
                  strokeLinecap="round"
                  fill="none"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  stroke="#f59e0b"
                  strokeWidth="12"
                  strokeDasharray="238.7"
                  strokeDashoffset="232"
                  fill="none"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  stroke="#ef4444"
                  strokeWidth="12"
                  strokeDasharray="238.7"
                  strokeDashoffset="237"
                  fill="none"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                <span className="text-xl font-bold text-slate-900">1,428</span>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Total SKUs</span>
              </div>
            </div>
          </div>

          <div className="flex justify-around text-xs pt-2 border-t border-slate-100">
            <span className="text-teal-700 font-semibold">• In Stock (99.6%)</span>
            <span className="text-amber-700 font-semibold">• Low (0.3%)</span>
            <span className="text-rose-700 font-semibold">• Out (0.1%)</span>
          </div>
        </div>
      </div>

      {/* 3. Grid: Doctor Activity + Patient Prescription Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Doctor Activity (Bar chart) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Doctor Activity</h3>
            <p className="text-xs text-slate-400">Total prescriptions authorized by clinician</p>
          </div>

          <div className="space-y-3 pt-2">
            {[
              { name: 'Dr. Arjun Mehta', count: 52, percent: 92 },
              { name: 'Dr. Priya Sharma', count: 44, percent: 78 },
              { name: 'Dr. Rohan Iyer', count: 36, percent: 65 },
              { name: 'Dr. Sneha Kulkarni', count: 31, percent: 58 },
              { name: 'Dr. Vikram Patel', count: 28, percent: 52 },
            ].map((d) => (
              <div key={d.name} className="space-y-1 text-xs">
                <div className="flex justify-between font-medium">
                  <span className="text-slate-800">{d.name}</span>
                  <span className="text-slate-500 font-semibold">{d.count} orders</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-600 rounded-full" style={{ width: `${d.percent}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Patient Prescription Activity (Line chart) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Patient Prescription Intake Activity</h3>
            <p className="text-xs text-slate-400">Unique patient intakes filled across time</p>
          </div>

          <div className="w-full h-44 pt-2">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 400 120" preserveAspectRatio="none">
              <path
                d="M 0 90 L 80 70 L 160 80 L 240 45 L 320 50 L 400 20 L 400 120 L 0 120 Z"
                fill="rgba(2, 132, 199, 0.1)"
              />
              <path
                d="M 0 90 L 80 70 L 160 80 L 240 45 L 320 50 L 400 20"
                fill="none"
                stroke="#0284c7"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
            <div className="flex justify-between text-[10px] text-slate-400 font-medium mt-1">
              <span>May</span>
              <span>Jun</span>
              <span>Jul</span>
              <span>Aug</span>
              <span>Sep</span>
              <span>Oct</span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Average intake: 310 patients / month</span>
            <span className="text-teal-600 font-semibold">+6.4% YoY</span>
          </div>
        </div>
      </div>
    </div>
  );
};
