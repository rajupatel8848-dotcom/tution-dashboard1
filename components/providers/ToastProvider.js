"use client";
import { createContext, useCallback, useContext, useState } from "react";

const ToastContext = createContext(() => {});
export const useToast = () => useContext(ToastContext);

export default function ToastProvider({ children }) {
  const [items, setItems] = useState([]);
  const toast = useCallback((message) => {
    const id = Date.now() + Math.random();
    setItems((list) => [...list, { id, message }]);
    setTimeout(() => setItems((list) => list.filter((t) => t.id !== id)), 2400);
  }, []);
  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="toasts" aria-live="polite">
        {items.map((t) => <div key={t.id} className="toast" role="status">{t.message}</div>)}
      </div>
    </ToastContext.Provider>
  );
}
