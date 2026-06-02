import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from "lucide-react";
import { createContext, useCallback, useContext, useMemo, useState } from "react";

const ToastContext = createContext(null);

const ICON_MAP = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info
};

const COLOR_MAP = {
  success: "text-green-600 bg-green-50",
  error: "text-red-600 bg-red-50",
  warning: "text-yellow-600 bg-yellow-50",
  info: "text-blue-600 bg-blue-50"
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (options) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const toast = {
        id,
        type: "info",
        duration: options?.type === 'error' ? 0 : 5000,
        ...(typeof options === "string" ? { message: options } : options)
      };
      setToasts((prev) => [...prev, toast]);
      if (toast.duration > 0) {
        setTimeout(() => dismiss(id), toast.duration);
      }
      return id;
    },
    [dismiss]
  );

  const api = useMemo(
    () => ({
      showToast,
      dismiss,
      success: (message, opts = {}) => showToast({ type: "success", message, ...opts }),
      error: (message, opts = {}) => showToast({ type: "error", message, ...opts }),
      warning: (message, opts = {}) => showToast({ type: "warning", message, ...opts }),
      info: (message, opts = {}) => showToast({ type: "info", message, ...opts })
    }),
    [showToast, dismiss]
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 max-w-sm w-full pointer-events-none" role="region" aria-label="Notifications" aria-live="polite">
        {toasts.map((toast) => {
          const Icon = ICON_MAP[toast.type] || Info;
          const iconColors = COLOR_MAP[toast.type] || COLOR_MAP.info;
          return (
            <div key={toast.id} className="pointer-events-auto bg-white border border-outline-variant/60 shadow-lg rounded-xl p-4 flex gap-3 items-start animate-fade-in-up" role="status">
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${iconColors}`}>
                <Icon size={18} strokeWidth={2.5} />
              </div>
              <div className="flex-1 min-w-0 pt-1">
                {toast.title ? <h4 className="text-sm font-bold text-on-surface mb-1">{toast.title}</h4> : null}
                <p className="text-sm text-on-surface-variant leading-snug">{toast.message}</p>
              </div>
              <button
                type="button"
                className="flex-shrink-0 text-on-surface-variant hover:text-black transition-colors p-1"
                onClick={() => dismiss(toast.id)}
                aria-label="Dismiss notification"
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    return {
      showToast: () => {},
      dismiss: () => {},
      success: () => {},
      error: () => {},
      warning: () => {},
      info: () => {}
    };
  }
  return ctx;
}
