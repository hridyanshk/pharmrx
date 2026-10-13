import React, { useState, useEffect } from 'react';
import { X, Package, RefreshCw, AlertCircle } from 'lucide-react';
import { Medicine } from '../../types/pharmacy';

interface StockAdjustModalProps {
  medicine: Medicine | null;
  isOpen: boolean;
  onClose: () => void;
  onApply: (medicineId: string, newStock: number) => Promise<boolean | void> | void;
  isSubmitting?: boolean;
  error?: string | null;
}

export const StockAdjustModal: React.FC<StockAdjustModalProps> = ({
  medicine,
  isOpen,
  onClose,
  onApply,
  isSubmitting = false,
  error = null,
}) => {
  const [stock, setStock] = useState(0);
  const [localSubmitting, setLocalSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (medicine) {
      setStock(medicine.StockQty);
    }
    setLocalError(null);
  }, [medicine, isOpen]);

  if (!isOpen || !medicine) return null;

  const submitting = isSubmitting || localSubmitting;
  const displayError = error || localError;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setLocalSubmitting(true);
    try {
      const res = await onApply(medicine.MedicineID, Math.max(0, Number(stock)));
      if (res !== false) {
        onClose();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to adjust stock';
      setLocalError(msg);
    } finally {
      setLocalSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
      <div className="bg-white dark:bg-[#182235] w-full max-w-sm rounded-2xl shadow-xl border border-slate-200/90 dark:border-[#334155] overflow-hidden flex flex-col text-slate-800 dark:text-[#F8FAFC]">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-[#334155] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-[#F8FAFC]">Adjust Stock</h2>
          </div>
          <button
            onClick={onClose}
            disabled={submitting}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-[#1E293B] cursor-pointer disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {displayError && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl flex items-start gap-2 text-rose-800 dark:text-rose-200 text-xs">
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold">Error: </span>
              <span>{displayError}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <span className="text-slate-400 dark:text-[#94A3B8] text-[11px] block">Medicine</span>
            <p className="text-sm font-bold text-slate-900 dark:text-[#F8FAFC]">{medicine.Name}</p>
            <span className="text-[11px] text-slate-500 dark:text-[#94A3B8] font-mono">
              {medicine.MedicineID} • {medicine.Brand}
            </span>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-[#CBD5E1] mb-1">
              New Physical Stock Count (Units)
            </label>
            <input
              type="number"
              min="0"
              required
              disabled={submitting}
              value={stock}
              onChange={(e) => setStock(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-[#334155] rounded-xl text-slate-900 dark:text-[#F8FAFC] font-mono text-base font-bold focus:bg-white dark:focus:bg-[#111827] focus:outline-none focus:ring-2 focus:ring-teal-600/20 disabled:opacity-60"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              disabled={submitting}
              onClick={() => setStock((s) => s + 50)}
              className="flex-1 py-1.5 bg-slate-100 dark:bg-[#1E293B] hover:bg-slate-200 dark:hover:bg-[#273449] rounded-lg text-slate-700 dark:text-[#CBD5E1] font-semibold text-xs cursor-pointer transition-colors disabled:opacity-50"
            >
              +50
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={() => setStock((s) => s + 100)}
              className="flex-1 py-1.5 bg-slate-100 dark:bg-[#1E293B] hover:bg-slate-200 dark:hover:bg-[#273449] rounded-lg text-slate-700 dark:text-[#CBD5E1] font-semibold text-xs cursor-pointer transition-colors disabled:opacity-50"
            >
              +100
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={() => setStock((s) => Math.max(0, s - 10))}
              className="flex-1 py-1.5 bg-slate-100 dark:bg-[#1E293B] hover:bg-slate-200 dark:hover:bg-[#273449] rounded-lg text-slate-700 dark:text-[#CBD5E1] font-semibold text-xs cursor-pointer transition-colors disabled:opacity-50"
            >
              -10
            </button>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-[#334155] flex items-center justify-end gap-2">
            <button
              type="button"
              disabled={submitting}
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 dark:text-[#CBD5E1] hover:bg-slate-100 dark:hover:bg-[#1E293B] font-medium cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Updating MySQL...</span>
                </>
              ) : (
                <span>Update Stock</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
