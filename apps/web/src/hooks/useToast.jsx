import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from "lucide-react";
import { createContext, useCallback, useContext, useMemo, useState } from "react";

const ToastContext = createContext(null);

const ICON_MAP = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info
};

const THEME_MAP = {
  success: {
    container: "bg-green-50 border-green-200",
    icon: "text-green-600",
    title: "text-green-900",
    text: "text-green-900",
    closeBtn: "text-green-600 hover:text-green-800"
  },
  error: {
    container: "bg-error-container border-error/20",
    icon: "text-error",
    title: "text-on-error-container",
    text: "text-on-error-container",
    closeBtn: "text-error/70 hover:text-error"
  },
  warning: {
    container: "bg-yellow-50 border-yellow-200",
    icon: "text-yellow-600",
    title: "text-yellow-900",
    text: "text-yellow-900",
    closeBtn: "text-yellow-600 hover:text-yellow-800"
  },
  info: {
    container: "bg-surface border-primary/20",
    icon: "text-primary",
    title: "text-on-surface",
    text: "text-on-surface",
    closeBtn: "text-outline hover:text-on-surface"
  }
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
          const theme = THEME_MAP[toast.type] || THEME_MAP.info;
          return (
            <div key={toast.id} className={`pointer-events-auto w-full rounded-lg shadow-lg border p-4 flex items-start gap-3 relative z-50 animate-fade-in-up ${theme.container}`} role="status">
              <span className={`shrink-0 mt-0.5 ${theme.icon}`}>
                <Icon size={20} strokeWidth={2.5} />
              </span>
              <div className="flex-1 min-w-0">
                {toast.title ? <h4 className={`font-label-md text-label-md font-semibold mb-1 ${theme.title}`}>{toast.title}</h4> : null}
                <p className={`font-body-sm text-body-sm leading-relaxed ${theme.text}`}>{toast.message}</p>
              </div>
              <button
                type="button"
                className={`shrink-0 transition-colors ${theme.closeBtn}`}
                onClick={() => dismiss(toast.id)}
                aria-label="Dismiss notification"
              >
                <X size={20} />
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
