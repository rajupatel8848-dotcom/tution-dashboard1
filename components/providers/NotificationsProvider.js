"use client";
import { createContext, useContext, useMemo, useState } from "react";
import { NOTIFICATIONS } from "@/data/notifications";

const NotificationsContext = createContext(null);
export const useNotifications = () => useContext(NotificationsContext);

export default function NotificationsProvider({ children }) {
  const [items, setItems] = useState(NOTIFICATIONS);
  const value = useMemo(() => ({
    items,
    unread: items.filter((n) => !n.read).length,
    markRead: (id) => setItems((l) => l.map((n) => (n.id === id ? { ...n, read: true } : n))),
    markAllRead: () => setItems((l) => l.map((n) => ({ ...n, read: true }))),
  }), [items]);
  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}
