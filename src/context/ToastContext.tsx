"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { Check, AlertCircle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "info";
type Toast = { id: number; message: string; type: ToastType };

type ToastContextType = {
  /** Show a toast. Defaults to a success style. */
  toast: (message: string, type?: ToastType) => void;
};

const ToastContext = createContext<ToastContextType | null>(null);

let nextId = 1;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (message: string, type: ToastType = "success") => {
      const id = nextId++;
      setToasts((prev) => [...prev, { id, message, type }]);
      // Auto-dismiss after 2.6s
      setTimeout(() => remove(id), 2600);
    },
    [remove],
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}

      {/* Toast stack — bottom-right, above everything */}
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => {
          const Icon =
            t.type === "success" ? Check : t.type === "error" ? AlertCircle : Info;
          const accent =
            t.type === "success"
              ? "#22c55e"
              : t.type === "error"
                ? "#ef4444"
                : "var(--accent)";
          return (
            <div
              key={t.id}
              className="pointer-events-auto flex items-center gap-3 pl-3 pr-2 py-3 min-w-[260px] max-w-sm shadow-lg border animate-[toastIn_0.2s_ease-out]"
              style={{
                backgroundColor: "var(--card-bg)",
                borderColor: "var(--border)",
              }}
              role="status"
            >
              <span
                className="w-7 h-7 flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: accent, color: "#fff" }}
              >
                <Icon size={15} />
              </span>
              <p
                className="text-sm font-['DM_Sans'] flex-1"
                style={{ color: "var(--text-primary)" }}
              >
                {t.message}
              </p>
              <button
                onClick={() => remove(t.id)}
                className="w-6 h-6 flex items-center justify-center hover:opacity-60 transition-opacity flex-shrink-0"
                style={{ color: "var(--text-muted)" }}
                aria-label="Dismiss"
              >
                <X size={14} />
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
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}
