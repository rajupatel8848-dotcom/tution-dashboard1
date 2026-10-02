"use client";
import { useState } from "react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import ApiStatus from "@/components/api/ApiStatus";
import { useNotifications } from "@/components/providers/NotificationsProvider";

export default function NotificationList() {
  const { items, unread, error, loading, markRead, markAllRead } = useNotifications();
  const [cat, setCat] = useState("All");
  const rows = items.filter((n) => cat === "All" || n.category === cat);
  const categories = ["All", ...new Set(items.map((item) => item.category).filter(Boolean))];

  return (
    <Card
      title={`Notifications (${unread} unread)`}
      actions={<button type="button" className="btn" onClick={markAllRead}>Mark all as read</button>}
    >
      <div className="toolbar">
        {categories.map((c) => (
          <button key={c} type="button" className={`btn ${c === cat ? "p" : ""}`} onClick={() => setCat(c)}>{c}</button>
        ))}
      </div>
      <ApiStatus loading={loading} error={error} />
      {!loading && !error && rows.length === 0 && <EmptyState title="You're all caught up" text="No notifications in this category." />}
      {rows.map((n) => (
        <div className="cls" key={n.id}>
          <Badge tone="info">{n.category}</Badge>
          <div className="in" style={{ fontWeight: n.read ? 400 : 600 }}>{n.text}</div>
          {!n.read && <Badge tone="warn">Unread</Badge>}
          {!n.read && <button type="button" className="btn" onClick={() => markRead(n.id)}>Mark as read</button>}
        </div>
      ))}
    </Card>
  );
}
