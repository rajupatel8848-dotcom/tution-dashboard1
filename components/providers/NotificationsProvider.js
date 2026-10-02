"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { apiRequest } from "@/components/api/client";
import { useToast } from "./ToastProvider";

const NotificationsContext = createContext(null);
export const useNotifications = () => useContext(NotificationsContext);

export default function NotificationsProvider({ children }) {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  useEffect(() => {
    apiRequest("/api/notifications")
      .then(setItems)
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, []);

  const markRead = useCallback(async (id) => {
    try {
      const updated = await apiRequest(`/api/notifications/${id}`, {
        method: "PUT",
        body: JSON.stringify({ read: true }),
      });
      setItems((list) => list.map((item) => item.id === id ? updated : item));
    } catch (requestError) {
      toast(requestError.message);
    }
  }, [toast]);
  const markAllRead = useCallback(async () => {
    try {
      await apiRequest("/api/notifications/read-all", { method: "POST" });
      setItems((list) => list.map((item) => ({ ...item, read: true })));
    } catch (requestError) {
      toast(requestError.message);
    }
  }, [items, toast]);
  const value = useMemo(() => ({
    items,
    error,
    loading,
    unread: items.filter((n) => !n.read).length,
    markRead,
    markAllRead,
  }), [items, error, loading, markRead, markAllRead]);
  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}
