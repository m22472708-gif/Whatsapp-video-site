import React, { useState } from 'react';
import { Lock, KeyRound, X, AlertCircle } from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Default PIN: 1234 or admin
    if (pin === '1234' || pin.toLowerCase() === 'admin') {
      setError(false);
      setPin('');
      onSuccess();
    } else {
      setError(true);
      setPin('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-center relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center mx-auto mb-3 shadow-md">
          <KeyRound className="w-6 h-6" />
        </div>

        <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
          Admin Authentication
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">
          Enter admin security PIN to manage videos, banners, and Telegram settings.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="password"
            autoFocus
            maxLength={6}
            placeholder="Enter PIN (Default: 1234)"
            value={pin}
            onChange={(e) => {
              setPin(e.target.value);
              setError(false);
            }}
            className="w-full text-center tracking-widest text-lg font-bold py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
          />

          {error && (
            <p className="text-xs text-rose-500 font-semibold flex items-center justify-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> Incorrect PIN. Hint: 1234
            </p>
          )}

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-md transition-all active:scale-95"
          >
            Authorize Access
          </button>

          <button
            type="button"
            onClick={onSuccess}
            className="w-full py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors"
          >
            Quick Enter (Admin Mode)
          </button>
        </form>

        <div className="mt-3 text-[11px] text-slate-400">
          Default Passcode: <span className="font-mono font-bold text-slate-600 dark:text-slate-300">1234</span>
        </div>
      </div>
    </div>
  );
};
