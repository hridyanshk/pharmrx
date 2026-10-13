import React from 'react';
import { AlertCircle, RefreshCw, Settings, Database, CheckCircle2, X } from 'lucide-react';
import { getApiBaseUrl } from '../../services/api';

interface ApiStatusBannerProps {
  isLoading: boolean;
  error: string | null;
  isConnected: boolean | null;
  onRetry: () => void;
  onOpenSettings: () => void;
  onDismissError?: () => void;
}

export const ApiStatusBanner: React.FC<ApiStatusBannerProps> = ({
  isLoading,
  error,
  isConnected,
  onRetry,
  onOpenSettings,
  onDismissError,
}) => {
  const currentBaseUrl = getApiBaseUrl();

  // If loading initially or refreshing
  if (isLoading) {
    return (
      <div className="bg-teal-50 dark:bg-teal-950/50 border-b border-teal-200/80 dark:border-teal-800/80 px-4 py-2.5 flex items-center justify-between text-xs text-teal-800 dark:text-teal-200 transition-all">
        <div className="flex items-center gap-2.5 max-w-4xl mx-auto w-full">
          <RefreshCw className="w-4 h-4 text-teal-600 dark:text-teal-400 animate-spin shrink-0" />
          <div className="flex flex-wrap items-center gap-1.5 font-medium">
            <span>Fetching live data from backend at</span>
            <code className="px-1.5 py-0.5 rounded-md bg-teal-100/70 dark:bg-teal-900/60 font-mono text-[11px] text-teal-900 dark:text-teal-100">
              {currentBaseUrl}
            </code>
            <span>...</span>
          </div>
        </div>
      </div>
    );
  }

  // If error occurred
  if (error) {
    return (
      <div className="bg-rose-50 dark:bg-rose-950/60 border-b border-rose-200/80 dark:border-rose-900 px-4 py-3 text-xs text-rose-900 dark:text-rose-200 shadow-2xs transition-all">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5 sm:mt-0" />
            <div>
              <span className="font-bold">Backend Connection Notice: </span>
              <span className="text-rose-800 dark:text-rose-300">
                {error}
              </span>
              <p className="text-[11px] text-rose-700/80 dark:text-rose-400 mt-0.5">
                Verify your Node.js/Express server is running at{' '}
                <code className="font-mono bg-rose-100 dark:bg-rose-900/60 px-1 py-0.2 rounded text-rose-900 dark:text-rose-200">
                  {currentBaseUrl}
                </code>{' '}
                with CORS enabled. Displaying cached/fallback records.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            <button
              onClick={onRetry}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-2xs transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
            <button
              onClick={onOpenSettings}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#1E293B] border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 hover:bg-rose-100/50 dark:hover:bg-[#273449] font-medium text-xs transition-colors cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Configure URL</span>
            </button>
            {onDismissError && (
              <button
                onClick={onDismissError}
                className="p-1 text-rose-400 hover:text-rose-600 dark:hover:text-rose-200 rounded-md cursor-pointer"
                title="Dismiss"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
};
