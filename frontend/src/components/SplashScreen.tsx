import React, { useEffect, useState } from 'react';
import { Pill } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
  duration?: number;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete, duration = 1200 }) => {
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFading(true);
      setTimeout(onComplete, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900 text-white transition-opacity duration-300 ${
        fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="flex flex-col items-center gap-4 animate-fade-in">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-teal-600 flex items-center justify-center shadow-lg shadow-teal-500/20 text-white">
            <Pill className="w-8 h-8 animate-pulse" />
          </div>
          <div className="absolute -inset-1 rounded-2xl bg-teal-400/20 blur animate-pulse" />
        </div>

        <div className="text-center mt-2">
          <h1 className="text-2xl font-bold tracking-tight text-white">PharmRx</h1>
          <p className="text-xs text-teal-300/80 font-medium tracking-wide mt-1">
            Clinical Pharmacy Management
          </p>
        </div>

        {/* Subtle loading bar */}
        <div className="w-36 h-1 bg-slate-800 rounded-full overflow-hidden mt-4">
          <div className="h-full bg-teal-400 rounded-full animate-[shimmer_1.2s_infinite] w-full" />
        </div>
      </div>
    </div>
  );
};
