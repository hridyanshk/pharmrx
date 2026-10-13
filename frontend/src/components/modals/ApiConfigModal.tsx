import React, { useState } from 'react';
import { X, Server, CheckCircle2, AlertCircle, RefreshCw, Globe, Database, Terminal, ShieldAlert } from 'lucide-react';
import { getApiBaseUrl, setApiBaseUrl, resetApiBaseUrl, testApiConnection } from '../../services/api';

interface ApiConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshData: () => Promise<void>;
  isDataLoading: boolean;
}

export const ApiConfigModal: React.FC<ApiConfigModalProps> = ({
  isOpen,
  onClose,
  onRefreshData,
  isDataLoading,
}) => {
  const [apiUrl, setApiUrlState] = useState(getApiBaseUrl());
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const handleSaveAndTest = async () => {
    setTesting(true);
    setTestResult(null);
    setApiBaseUrl(apiUrl);
    const res = await testApiConnection();
    setTestResult(res);
    setTesting(false);
    if (res.ok) {
      await onRefreshData();
    }
  };

  const handleResetDefault = () => {
    resetApiBaseUrl();
    const def = getApiBaseUrl();
    setApiUrlState(def);
    setTestResult(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
      <div className="bg-white dark:bg-[#182235] w-full max-w-lg rounded-2xl shadow-xl border border-slate-200/90 dark:border-[#334155] overflow-hidden flex flex-col text-slate-800 dark:text-[#F8FAFC]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-[#334155] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/70 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-[#F8FAFC]">Backend API Settings</h2>
              <p className="text-xs text-slate-400 dark:text-[#94A3B8]">Node.js / Express &amp; MySQL Configuration</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-[#1E293B] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs max-h-[75vh] overflow-y-auto">
          {/* Endpoint Input */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-[#CBD5E1] mb-1.5">
              API Base URL
            </label>
            <div className="relative">
              <Globe className="w-4 h-4 absolute left-3 top-2.5 text-slate-400 dark:text-[#94A3B8]" />
              <input
                type="text"
                value={apiUrl}
                onChange={(e) => setApiUrlState(e.target.value)}
                placeholder="http://localhost:5000/api"
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-[#334155] rounded-xl font-mono text-xs focus:bg-white dark:focus:bg-[#111827] focus:outline-none focus:ring-2 focus:ring-teal-600/30 text-slate-900 dark:text-[#F8FAFC]"
              />
            </div>
            <div className="flex items-center justify-between mt-1 text-[11px] text-slate-400 dark:text-[#94A3B8]">
              <span>Default: http://localhost:5000/api</span>
              <button
                type="button"
                onClick={handleResetDefault}
                className="text-teal-600 dark:text-teal-400 hover:underline cursor-pointer"
              >
                Reset to default
              </button>
            </div>
          </div>

          {/* Test Status Banner */}
          {testResult && (
            <div
              className={`p-3.5 rounded-xl border flex items-start gap-3 ${
                testResult.ok
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200/80 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                  : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200/80 dark:border-rose-800 text-rose-800 dark:text-rose-200'
              }`}
            >
              {testResult.ok ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              )}
              <div className="text-xs">
                <p className="font-semibold">{testResult.ok ? 'Connection Successful!' : 'Connection Failed'}</p>
                <p className="mt-0.5 leading-relaxed">{testResult.message}</p>
              </div>
            </div>
          )}

          {/* Expected Endpoints Guide */}
          <div className="bg-slate-50 dark:bg-[#111827] p-3.5 rounded-xl border border-slate-200/80 dark:border-[#334155] space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-[#F8FAFC]">
              <Database className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>Expected Express API Endpoints:</span>
            </div>
            <div className="space-y-1 font-mono text-[11px] text-slate-600 dark:text-[#94A3B8]">
              <div className="flex justify-between">
                <span>GET / POST</span>
                <span className="text-slate-800 dark:text-slate-300">/api/medicines</span>
              </div>
              <div className="flex justify-between">
                <span>PUT / DELETE</span>
                <span className="text-slate-800 dark:text-slate-300">/api/medicines/:id</span>
              </div>
              <div className="flex justify-between">
                <span>GET / POST</span>
                <span className="text-slate-800 dark:text-slate-300">/api/patients</span>
              </div>
              <div className="flex justify-between">
                <span>GET / POST</span>
                <span className="text-slate-800 dark:text-slate-300">/api/doctors</span>
              </div>
              <div className="flex justify-between">
                <span>GET / POST</span>
                <span className="text-slate-800 dark:text-slate-300">/api/prescriptions</span>
              </div>
            </div>
          </div>

          {/* Quick Express CORS Checklist */}
          <div className="bg-amber-50/70 dark:bg-amber-950/30 p-3.5 rounded-xl border border-amber-200/80 dark:border-amber-900/50 space-y-1.5 text-amber-900 dark:text-amber-200">
            <div className="flex items-center gap-1.5 font-bold text-xs">
              <Terminal className="w-3.5 h-3.5" />
              <span>Express.js CORS Requirement</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              If you see "Failed to fetch" or CORS errors, verify your backend has:
            </p>
            <pre className="bg-amber-100/70 dark:bg-amber-900/50 p-2 rounded-lg font-mono text-[10px] overflow-x-auto text-amber-950 dark:text-amber-100">
{`const cors = require('cors');
app.use(cors()); // Enable all CORS requests`}
            </pre>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-[#111827] border-t border-slate-100 dark:border-[#334155] flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-600 dark:text-[#CBD5E1] hover:bg-slate-200 dark:hover:bg-[#1E293B] font-medium text-xs cursor-pointer"
          >
            Close
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={testing || isDataLoading}
              onClick={handleSaveAndTest}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {testing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Testing Connection...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Test &amp; Sync Data</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
