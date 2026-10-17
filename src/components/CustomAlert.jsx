import React, { useEffect, useState } from 'react';
import { CheckCircle2, AlertCircle, X, Info, AlertTriangle } from 'lucide-react';

// ✅ Global state for alert
let setAlertState = null;
let setConfirmState = null;

// ✅ Call this function instead of alert()
export const showAlert = (message, type = 'success') => {
  if (setAlertState) {
    setAlertState({ message, type, isOpen: true });
  }
};

// ✅ Call this function instead of window.confirm()
export const showConfirm = (message, onConfirm) => {
  if (setConfirmState) {
    setConfirmState({ message, onConfirm, isOpen: true });
  }
};

export const CustomAlert = () => {
  const [alert, setAlert] = useState({ message: '', type: 'success', isOpen: false });
  const [confirm, setConfirm] = useState({ message: '', onConfirm: null, isOpen: false });

  useEffect(() => {
    setAlertState = setAlert;
    setConfirmState = setConfirm;
  }, []);

  // Auto close alert
  useEffect(() => {
    if (alert.isOpen) {
      const timer = setTimeout(() => {
        setAlert((prev) => ({ ...prev, isOpen: false }));
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [alert.isOpen]);

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
    <>
      {/* ✅ 1. Top Notification Alert */}
      {alert.isOpen && (
        <div className="fixed top-20 left-0 right-0 z-[100] flex justify-center px-4 pointer-events-none animate-in fade-in slide-in-from-top-4 duration-300">
          <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-lg border w-full max-w-sm pointer-events-auto ${colors[alert.type]}`}>
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
      )}

      {/* ✅ 2. Custom Confirm Dialog (For Delete) */}
      {confirm.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 text-center mb-2">Are you sure?</h3>
            <p className="text-sm text-gray-500 text-center mb-6">{confirm.message}</p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirm({ ...confirm, isOpen: false })}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (confirm.onConfirm) confirm.onConfirm();
                  setConfirm({ ...confirm, isOpen: false });
                }}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors shadow-md"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
