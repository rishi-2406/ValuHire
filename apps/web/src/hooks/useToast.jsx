import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from "lucide-react";
import { createContext, useCallback, useContext, useMemo, useState } from "react";

const ToastContext = createContext(null);

const ICON_MAP = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info
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
        duration: 4000,
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
      <div className="toast-container" role="region" aria-label="Notifications" aria-live="polite">
        {toasts.map((toast) => {
          const Icon = ICON_MAP[toast.type] || Info;
          return (
            <div key={toast.id} className={`toast ${toast.type}`} role="status">
              <div className="toast-icon-wrapper">
                <Icon size={18} strokeWidth={2.5} />
              </div>
              <div className="toast-content">
                {toast.title ? <h4 className="toast-title">{toast.title}</h4> : null}
                <p className="toast-message">{toast.message}</p>
              </div>
              <button
                type="button"
                className="toast-close"
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
