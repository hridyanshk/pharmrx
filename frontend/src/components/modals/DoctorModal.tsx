import React, { useState, useEffect } from 'react';
import { X, RefreshCw, AlertCircle } from 'lucide-react';
import { Doctor } from '../../types/pharmacy';

interface DoctorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (doc: Doctor) => Promise<boolean | void> | void;
  initialDoctor?: Doctor | null;
  isSubmitting?: boolean;
  error?: string | null;
}

export const DoctorModal: React.FC<DoctorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialDoctor,
  isSubmitting = false,
  error = null,
}) => {
  const isEdit = !!initialDoctor;

  const [name, setName] = useState('');
  const [specialization, setSpecialization] = useState('Cardiology');
  const [phone, setPhone] = useState('+91 98201 11001');
  const [email, setEmail] = useState('');
  const [localSubmitting, setLocalSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (initialDoctor) {
      setName(initialDoctor.Name);
      setSpecialization(initialDoctor.Specialization);
      setPhone(initialDoctor.Phone);
      setEmail(initialDoctor.email || '');
    } else {
      setName('');
      setSpecialization('Cardiology');
      setPhone('+91 98201 11001');
      setEmail('');
    }
    setLocalError(null);
  }, [initialDoctor, isOpen]);

  if (!isOpen) return null;

  const submitting = isSubmitting || localSubmitting;
  const displayError = error || localError;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const doc: Doctor = {
      DoctorID: initialDoctor?.DoctorID || `DOC-${Math.floor(107 + Math.random() * 20)}`,
      Name: name.trim().startsWith('Dr.') ? name.trim() : `Dr. ${name.trim()}`,
      Specialization: specialization.trim(),
      Phone: phone.trim(),
      email: email.trim() || `${name.toLowerCase().replace(/[^a-z]/g, '')}@pharmrx-health.com`,
    };

    setLocalError(null);
    setLocalSubmitting(true);
    try {
      const res = await onSave(doc);
      if (res !== false) {
        onClose();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save doctor';
      setLocalError(msg);
    } finally {
      setLocalSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
      <div className="bg-white dark:bg-[#182235] w-full max-w-md rounded-2xl shadow-xl border border-slate-200/90 dark:border-[#334155] overflow-hidden flex flex-col text-slate-800 dark:text-[#F8FAFC]">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-[#334155] flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-[#F8FAFC]">
              {isEdit ? 'Edit Doctor' : 'Add Doctor'}
            </h2>
            <p className="text-[11px] text-slate-400 dark:text-[#94A3B8]">
              {isEdit ? 'Sends PUT request to /api/doctors/:id' : 'Sends POST request to /api/doctors'}
            </p>
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
            <label className="block font-semibold text-slate-700 dark:text-[#CBD5E1] mb-1">Doctor Full Name</label>
            <input
              type="text"
              required
              disabled={submitting}
              placeholder="e.g. Dr. Arjun Mehta"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-[#334155] rounded-xl text-slate-900 dark:text-[#F8FAFC] focus:bg-white dark:focus:bg-[#111827] focus:outline-none focus:ring-2 focus:ring-teal-600/20 disabled:opacity-60"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-[#CBD5E1] mb-1">Specialization</label>
            <input
              type="text"
              required
              disabled={submitting}
              placeholder="e.g. Cardiology, Neurology, Pediatrics"
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-[#334155] rounded-xl text-slate-900 dark:text-[#F8FAFC] focus:bg-white dark:focus:bg-[#111827] focus:outline-none focus:ring-2 focus:ring-teal-600/20 disabled:opacity-60"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-[#CBD5E1] mb-1">Phone Number</label>
              <input
                type="tel"
                required
                disabled={submitting}
                placeholder="+91 98201 11001"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-[#334155] rounded-xl text-slate-900 dark:text-[#F8FAFC] focus:bg-white dark:focus:bg-[#111827] focus:outline-none focus:ring-2 focus:ring-teal-600/20 disabled:opacity-60"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-[#CBD5E1] mb-1">Email Address</label>
              <input
                type="email"
                disabled={submitting}
                placeholder="doctor@pharmrx-health.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-[#334155] rounded-xl text-slate-900 dark:text-[#F8FAFC] focus:bg-white dark:focus:bg-[#111827] focus:outline-none focus:ring-2 focus:ring-teal-600/20 disabled:opacity-60"
              />
            </div>
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
                  <span>Saving to MySQL...</span>
                </>
              ) : (
                <span>{isEdit ? 'Save Changes' : 'Add Doctor'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
