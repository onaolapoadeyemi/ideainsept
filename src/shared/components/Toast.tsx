import { createContext, PropsWithChildren, useContext, useMemo, useState } from "react";

type Toast = { id: string; message: string; tone: "success" | "info" | "warning" | "error" };
type ToastContextValue = { notify: (message: string, tone?: Toast["tone"]) => void };

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: PropsWithChildren) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const value = useMemo<ToastContextValue>(
    () => ({
      notify(message, tone = "info") {
        const id = crypto.randomUUID();
        setToasts((current) => [...current, { id, message, tone }]);
        window.setTimeout(() => setToasts((current) => current.filter((toast) => toast.id !== id)), 4200);
      },
    }),
    [],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 grid max-w-sm gap-2" aria-live="polite" aria-atomic="true">
        {toasts.map((toast) => (
          <div key={toast.id} className={`panel px-4 py-3 text-sm font-semibold ${toast.tone === "error" ? "border-rose-400/50" : ""}`}>
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
}
