import React, { useEffect, useState } from 'react';
import { CheckCircle2, AlertCircle, X, Info } from 'lucide-react';

// ✅ Global state for alert
let setAlertState = null;

// ✅ Call this function instead of alert()
export const showAlert = (message, type = 'success') => {
  if (setAlertState) {
    setAlertState({ message, type, isOpen: true });
  }
};

export const CustomAlert = () => {
  const [alert, setAlert] = useState({ message: '', type: 'success', isOpen: false });

  useEffect(() => {
    setAlertState = setAlert;
  }, []);

  // Auto close after 3.5 seconds
  useEffect(() => {
    if (alert.isOpen) {
      const timer = setTimeout(() => {
        setAlert((prev) => ({ ...prev, isOpen: false }));
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [alert.isOpen]);

  if (!alert.isOpen) return null;

  const colors = {
    success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  };

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />,
    info: <Info className="w-5 h-5 text-blue-600 shrink-0" />,
  };

  return (
    <div className="fixed top-20 left-0 right-0 z-[100] flex justify-center px-4 pointer-events-none">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-lg border w-full max-w-sm pointer-events-auto animate-in fade-in slide-in-from-top-4 duration-300 ${colors[alert.type]}`}
      >
        {icons[alert.type]}
        <p className="text-sm font-semibold flex-1">{alert.message}</p>
        <button
          onClick={() => setAlert((prev) => ({ ...prev, isOpen: false }))}
          className="p-1 hover:bg-black/5 rounded-lg transition-colors"
        >
          <X className="w-4 h-4 opacity-50" />
        </button>
      </div>
    </div>
  );
};
