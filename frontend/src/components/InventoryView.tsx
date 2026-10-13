import React from 'react';
import { Package, AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react';
import { Medicine } from '../types/pharmacy';
import { formatINR } from '../utils/currency';

interface InventoryViewProps {
  medicines: Medicine[];
  onNavigateToAlerts: () => void;
  onOpenStockAdjust: (med: Medicine) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  medicines,
  onNavigateToAlerts,
  onOpenStockAdjust,
}) => {
  // 4 summary values
  const totalMedicines = 1428;
  const outOfStockMeds = medicines.filter((m) => m.StockQty === 0);
  const lowStockMeds = medicines.filter((m) => m.StockQty > 0 && m.StockQty <= (m.safetyThreshold || 30));
  const healthyMeds = medicines.filter((m) => m.StockQty > (m.safetyThreshold || 30));

  const outOfStockCount = outOfStockMeds.length || 1;
  const lowStockCount = lowStockMeds.length || 4;
  const healthyStockCount = totalMedicines - outOfStockCount - lowStockCount;

  // Medicines sorted by lowest stock for horizontal bar chart
  const lowestStockMeds = [...medicines].sort((a, b) => a.StockQty - b.StockQty).slice(0, 5);

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Inventory</h1>
          <p className="text-xs text-slate-500 mt-0.5">Stock level analytics &amp; threshold monitoring</p>
        </div>

        <button
          onClick={onNavigateToAlerts}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold border border-amber-200/80 transition-colors cursor-pointer"
        >
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          <span>View Stock Alerts ({lowStockCount + outOfStockCount})</span>
        </button>
      </div>

      {/* 4 Compact Summary Values */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Total Medicines</span>
          <p className="text-2xl font-bold text-slate-900 mt-2">{totalMedicines.toLocaleString()}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Healthy Stock</span>
          <p className="text-2xl font-bold text-teal-600 mt-2">{healthyStockCount.toLocaleString()}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Low Stock</span>
          <p className="text-2xl font-bold text-amber-600 mt-2">{lowStockCount}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Out of Stock</span>
          <p className="text-2xl font-bold text-rose-600 mt-2">{outOfStockCount}</p>
        </div>
      </div>

      {/* Visual Analytics Row: Donut Chart + Horizontal Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Inventory Overview (Donut Chart) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Inventory Overview</h2>
            <p className="text-xs text-slate-400">Distribution by availability tier</p>
          </div>

          <div className="py-6 flex items-center justify-center">
            <div className="relative w-44 h-44 flex items-center justify-center">
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
                <span className="text-2xl font-bold text-slate-900">{totalMedicines}</span>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">SKUs</span>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-3 border-t border-slate-100 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-600" />
                <span className="text-slate-700">Healthy Stock</span>
              </div>
              <span className="font-semibold text-slate-900">{healthyStockCount} (99.6%)</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="text-slate-700">Low Stock Warning</span>
              </div>
              <span className="font-semibold text-amber-700">{lowStockCount} (0.3%)</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span className="text-slate-700">Depleted / Stockout</span>
              </div>
              <span className="font-semibold text-rose-700">{outOfStockCount} (0.1%)</span>
            </div>
          </div>
        </div>

        {/* Stock Levels (Horizontal Bar Chart for Lowest Stock) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Stock Levels</h2>
            <p className="text-xs text-slate-400">Medicines requiring imminent replenishment</p>
          </div>

          <div className="space-y-4 pt-2">
            {lowestStockMeds.map((med) => {
              const maxScale = 100;
              const barPercent = Math.min(100, Math.max(4, (med.StockQty / maxScale) * 100));
              const isOut = med.StockQty === 0;
              const isLow = med.StockQty > 0 && med.StockQty <= (med.safetyThreshold || 30);

              return (
                <div key={med.MedicineID} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900">{med.Name}</span>
                      <span className="text-[11px] text-slate-400">({med.Brand})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-800">{med.StockQty} units</span>
                      <span className="text-slate-400 text-[10px]">
                        (Min: {med.safetyThreshold || 30})
                      </span>
                    </div>
                  </div>

                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isOut ? 'bg-rose-500' : isLow ? 'bg-amber-500' : 'bg-teal-600'
                      }`}
                      style={{ width: `${barPercent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-400">Safety replenishment threshold standard: 30 units</span>
            <button
              onClick={onNavigateToAlerts}
              className="text-teal-600 hover:text-teal-700 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>Manage Alerts</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Small Table for Detailed Inventory */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Detailed Formulary Inventory</h3>
          <span className="text-xs text-slate-400">{medicines.length} SKUs in Catalog</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-2.5 px-4">Medicine</th>
                <th className="py-2.5 px-4">Brand</th>
                <th className="py-2.5 px-4">Unit Price (₹)</th>
                <th className="py-2.5 px-4">Current Stock</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {medicines.map((med) => (
                <tr key={med.MedicineID} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-900">{med.Name}</td>
                  <td className="py-3 px-4 text-slate-600 font-medium">{med.Brand}</td>
                  <td className="py-3 px-4 font-mono font-semibold text-slate-800">{formatINR(med.Price)}</td>
                  <td className="py-3 px-4 font-mono font-semibold text-slate-900">{med.StockQty} units</td>
                  <td className="py-3 px-4">
                    {med.StockQty === 0 ? (
                      <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full font-semibold text-[10px]">
                        Out of stock
                      </span>
                    ) : med.StockQty <= (med.safetyThreshold || 30) ? (
                      <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full font-semibold text-[10px]">
                        Low stock
                      </span>
                    ) : (
                      <span className="text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full font-semibold text-[10px]">
                        Healthy
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => onOpenStockAdjust(med)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer transition-colors"
                    >
                      Adjust Stock
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
