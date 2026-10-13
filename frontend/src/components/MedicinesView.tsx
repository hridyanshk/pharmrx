import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  SlidersHorizontal,
  X,
  TrendingUp,
  Package,
  Edit2,
  Trash2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { Medicine, PrescriptionItem, Prescription } from '../types/pharmacy';
import { formatINR } from '../utils/currency';

interface MedicinesViewProps {
  medicines: Medicine[];
  prescriptionItems: PrescriptionItem[];
  prescriptions: Prescription[];
  onOpenAddModal: () => void;
  onOpenEditModal: (med: Medicine) => void;
  onDeleteMedicine: (medicineId: string) => void;
  onOpenStockAdjust: (med: Medicine) => void;
}

export const MedicinesView: React.FC<MedicinesViewProps> = ({
  medicines,
  prescriptionItems,
  prescriptions,
  onOpenAddModal,
  onOpenEditModal,
  onDeleteMedicine,
  onOpenStockAdjust,
}) => {
  const [search, setSearch] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);

  // Extract unique brands
  const brands = useMemo(() => {
    return ['all', ...Array.from(new Set(medicines.map((m) => m.Brand)))];
  }, [medicines]);

  // Filter medicines
  const filteredMedicines = useMemo(() => {
    return medicines.filter((m) => {
      // Search
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchName = m.Name.toLowerCase().includes(q);
        const matchBrand = m.Brand.toLowerCase().includes(q);
        if (!matchName && !matchBrand) return false;
      }
      // Brand filter
      if (selectedBrand !== 'all' && m.Brand !== selectedBrand) return false;
      // Status filter
      if (selectedStatus === 'in-stock' && m.StockQty <= (m.safetyThreshold || 30)) return false;
      if (selectedStatus === 'low-stock' && (m.StockQty <= 0 || m.StockQty > (m.safetyThreshold || 30))) return false;
      if (selectedStatus === 'out-of-stock' && m.StockQty > 0) return false;

      return true;
    });
  }, [medicines, search, selectedBrand, selectedStatus]);

  // Detail panel: items linked to this medicine
  const linkedItems = useMemo(() => {
    if (!selectedMedicine) return [];
    return prescriptionItems
      .filter((item) => item.MedicineID === selectedMedicine.MedicineID)
      .map((item) => {
        const parentRx = prescriptions.find((r) => r.PrescriptionID === item.PrescriptionID);
        return {
          ...item,
          rxDate: parentRx?.Date || 'Recent',
        };
      });
  }, [selectedMedicine, prescriptionItems, prescriptions]);

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Medicines</h1>
          <p className="text-xs text-slate-500 mt-0.5">Manage your pharmacy inventory</p>
        </div>

        <button
          onClick={onOpenAddModal}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Medicine</span>
        </button>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search medicines..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {/* Brand Filter */}
          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-medium text-slate-700 focus:outline-none cursor-pointer"
          >
            {brands.map((b) => (
              <option key={b} value={b}>
                {b === 'all' ? 'All Brands' : b}
              </option>
            ))}
          </select>

          {/* Stock Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-medium text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="all">All Stock Status</option>
            <option value="in-stock">In Stock (&gt;30)</option>
            <option value="low-stock">Low Stock (≤30)</option>
            <option value="out-of-stock">Out of Stock (0)</option>
          </select>
        </div>
      </div>

      {/* Clean Table & Side Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Table Container */}
        <div
          className={`${
            selectedMedicine ? 'lg:col-span-7' : 'lg:col-span-12'
          } bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden transition-all`}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Medicine</th>
                  <th className="py-3 px-4">Brand</th>
                  <th className="py-3 px-4">Price (₹)</th>
                  <th className="py-3 px-4">Stock</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredMedicines.length > 0 ? (
                  filteredMedicines.map((med) => {
                    const isSelected = selectedMedicine?.MedicineID === med.MedicineID;
                    const isOutOfStock = med.StockQty === 0;
                    const isLowStock = med.StockQty > 0 && med.StockQty <= (med.safetyThreshold || 30);

                    return (
                      <tr
                        key={med.MedicineID}
                        onClick={() => setSelectedMedicine(med)}
                        className={`hover:bg-slate-50/80 transition-colors cursor-pointer ${
                          isSelected ? 'bg-teal-50/50' : ''
                        }`}
                      >
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-900">{med.Name}</div>
                          <span className="text-[10px] text-slate-400 font-mono">{med.MedicineID}</span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 font-medium">{med.Brand}</td>
                        <td className="py-3.5 px-4 font-mono font-semibold text-slate-800">
                          {formatINR(med.Price)}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-mono font-semibold text-slate-800">{med.StockQty} units</div>
                          <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1">
                            <div
                              className={`h-full rounded-full ${
                                isOutOfStock ? 'bg-rose-500' : isLowStock ? 'bg-amber-500' : 'bg-teal-600'
                              }`}
                              style={{ width: `${Math.min(100, (med.StockQty / 300) * 100)}%` }}
                            />
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          {isOutOfStock ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                              Out of stock
                            </span>
                          ) : isLowStock ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                              Low stock
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-teal-50 text-teal-700">
                              <span className="w-1.5 h-1.5 rounded-full bg-teal-600" />
                              In stock
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => onOpenStockAdjust(med)}
                              className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                              title="Quick Stock Adjustment"
                            >
                              <Package className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onOpenEditModal(med)}
                              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                              title="Edit Medicine"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onDeleteMedicine(med.MedicineID)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                              title="Delete Medicine"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400 text-xs">
                      No medicines found matching the current search or filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Medicine Detail Side Panel */}
        {selectedMedicine && (
          <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-6">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase">
                  ID: {selectedMedicine.MedicineID}
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-0.5">{selectedMedicine.Name}</h3>
                <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                  <span>Brand: <strong className="text-slate-700">{selectedMedicine.Brand}</strong></span>
                  <span>•</span>
                  <span>Price: <strong className="text-slate-900">{formatINR(selectedMedicine.Price)}</strong></span>
                </div>
              </div>
              <button
                onClick={() => setSelectedMedicine(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Stock Level Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Stock Level</span>
                <span className="font-bold text-slate-900">{selectedMedicine.StockQty} units</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    selectedMedicine.StockQty === 0
                      ? 'bg-rose-500'
                      : selectedMedicine.StockQty <= 30
                      ? 'bg-amber-500'
                      : 'bg-teal-600'
                  }`}
                  style={{ width: `${Math.min(100, (selectedMedicine.StockQty / 300) * 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>Min: {selectedMedicine.safetyThreshold || 30} units</span>
                <span>Max Target: 300 units</span>
              </div>
            </div>

            {/* Prescription Usage (Mini Chart) */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-800">Prescription Usage</span>
                <span className="text-[11px] text-teal-600 font-semibold flex items-center gap-0.5">
                  <TrendingUp className="w-3 h-3" />
                  High velocity
                </span>
              </div>

              {/* Minimal bar visualization for 6 periods */}
              <div className="h-16 flex items-end gap-2 pt-2">
                {[35, 48, 62, 55, 78, 92].map((val, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                    <div
                      className="w-full bg-teal-100 rounded-t-sm hover:bg-teal-600 transition-colors"
                      style={{ height: `${val}%` }}
                    />
                    <span className="text-[9px] text-slate-400">W{idx + 1}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Prescription Items (Small list) */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <span className="text-xs font-semibold text-slate-800 block">
                Recent Prescription Items ({linkedItems.length})
              </span>

              <div className="space-y-2">
                {linkedItems.length > 0 ? (
                  linkedItems.slice(0, 3).map((item) => (
                    <div
                      key={item.ItemID}
                      className="p-2.5 bg-slate-50 rounded-xl flex items-center justify-between text-xs border border-slate-100"
                    >
                      <div>
                        <span className="font-mono font-bold text-teal-700">{item.PrescriptionID}</span>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Dosage: {item.Dosage} • Qty: {item.Quantity}
                        </p>
                      </div>
                      <span className="text-[11px] text-slate-400">{item.rxDate}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 py-2">No linked prescription records found.</p>
                )}
              </div>
            </div>

            {/* Quick Action Button */}
            <div className="pt-2">
              <button
                onClick={() => onOpenStockAdjust(selectedMedicine)}
                className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
              >
                Adjust Stock Quantity
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
