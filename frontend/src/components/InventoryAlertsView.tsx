import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Medicine } from '../types/pharmacy';

interface InventoryAlertsViewProps {
  medicines: Medicine[];
  onOpenStockAdjust: (med: Medicine) => void;
}

export const InventoryAlertsView: React.FC<InventoryAlertsViewProps> = ({
  medicines,
  onOpenStockAdjust,
}) => {
  const outOfStockMeds = medicines.filter((m) => m.StockQty === 0);
  const lowStockMeds = medicines.filter(
    (m) => m.StockQty > 0 && m.StockQty <= (m.safetyThreshold || 30)
  );
  // Recently restocked simulation (medicines with healthy stock)
  const restockedMeds = medicines
    .filter((m) => m.StockQty > 50)
    .slice(0, 3);

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Inventory Alerts</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Dedicated monitoring of stockouts, critical safety thresholds, and replenishment
        </p>
      </div>

      {/* 1. OUT OF STOCK (Red status) */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertCircle className="w-4 h-4" />
          </div>
          <h2 className="text-sm font-bold text-slate-900">Out of Stock</h2>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700">
            {outOfStockMeds.length} items
          </span>
        </div>

        <div className="space-y-2">
          {outOfStockMeds.length > 0 ? (
            outOfStockMeds.map((med) => (
              <div
                key={med.MedicineID}
                className="bg-white p-4 rounded-xl border border-rose-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{med.Name}</h3>
                  <span className="text-xs text-slate-500">{med.Brand}</span>
                  <div className="flex items-center gap-4 text-xs mt-1 text-slate-600">
                    <span className="text-rose-600 font-semibold">Current Stock: 0 units</span>
                    <span>•</span>
                    <span>Threshold: {med.safetyThreshold || 30} units</span>
                  </div>
                </div>

                <button
                  onClick={() => onOpenStockAdjust(med)}
                  className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition-colors cursor-pointer self-start sm:self-auto shadow-2xs"
                >
                  Adjust Stock
                </button>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-400 p-4 bg-white rounded-xl border border-slate-100">
              No medicines currently out of stock.
            </p>
          )}
        </div>
      </div>

      {/* 2. LOW STOCK (Amber status) */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <h2 className="text-sm font-bold text-slate-900">Low Stock</h2>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">
            {lowStockMeds.length} items
          </span>
        </div>

        <div className="space-y-2">
          {lowStockMeds.length > 0 ? (
            lowStockMeds.map((med) => (
              <div
                key={med.MedicineID}
                className="bg-white p-4 rounded-xl border border-amber-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{med.Name}</h3>
                  <span className="text-xs text-slate-500">{med.Brand}</span>
                  <div className="flex items-center gap-4 text-xs mt-1 text-slate-600">
                    <span className="text-amber-700 font-semibold">
                      Current Stock: {med.StockQty} units
                    </span>
                    <span>•</span>
                    <span>Threshold: {med.safetyThreshold || 30} units</span>
                  </div>
                </div>

                <button
                  onClick={() => onOpenStockAdjust(med)}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs transition-colors cursor-pointer self-start sm:self-auto shadow-2xs"
                >
                  Adjust Stock
                </button>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-400 p-4 bg-white rounded-xl border border-slate-100">
              No low stock warnings recorded.
            </p>
          )}
        </div>
      </div>

      {/* 3. RECENTLY RESTOCKED (Green status) */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <h2 className="text-sm font-bold text-slate-900">Recently Restocked</h2>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700">
            Healthy
          </span>
        </div>

        <div className="space-y-2">
          {restockedMeds.map((med) => (
            <div
              key={med.MedicineID}
              className="bg-white p-4 rounded-xl border border-teal-100 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div>
                <h3 className="font-bold text-slate-900 text-sm">{med.Name}</h3>
                <span className="text-xs text-slate-500">{med.Brand}</span>
                <div className="flex items-center gap-4 text-xs mt-1 text-slate-600">
                  <span className="text-teal-700 font-semibold">
                    Current Stock: {med.StockQty} units
                  </span>
                  <span>•</span>
                  <span>Threshold: {med.safetyThreshold || 30} units</span>
                </div>
              </div>

              <button
                onClick={() => onOpenStockAdjust(med)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer self-start sm:self-auto"
              >
                Adjust Stock
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
