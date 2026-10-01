import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, AlertTriangle, XCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random().toString();
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const showSuccess = (msg) => addToast(msg, 'success');
  const showError = (msg) => addToast(msg, 'error');
  const showInfo = (msg) => addToast(msg, 'info');
  const showWarning = (msg) => addToast(msg, 'warning');

  return (
    <ToastContext.Provider value={{ showSuccess, showError, showInfo, showWarning }}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-3 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start p-4 rounded-2xl shadow-xl border text-xs font-semibold transition-all transform duration-300 translate-y-0 ${
              toast.type === 'success'
                ? 'bg-[#FFFFFF] border-[#25855A]/30 text-[#202B36]'
                : toast.type === 'error'
                ? 'bg-[#FFFFFF] border-[#D04444]/30 text-[#202B36]'
                : toast.type === 'warning'
                ? 'bg-[#FFFFFF] border-[#B7791F]/30 text-[#202B36]'
                : 'bg-[#FFFFFF] border-[#167D8D]/30 text-[#202B36]'
            }`}
          >
            <div className="mr-3 flex-shrink-0 mt-0.5">
              {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-[#25855A]" />}
              {toast.type === 'error' && <XCircle className="w-5 h-5 text-[#D04444]" />}
              {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 text-[#B7791F]" />}
              {toast.type === 'info' && <Info className="w-5 h-5 text-[#167D8D]" />}
            </div>
            <div className="flex-1 text-[#202B36] font-medium leading-relaxed">{toast.message}</div>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-3 text-[#667085] hover:text-[#202B36]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
