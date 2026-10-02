"use client";
import { useState } from "react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import { useNotifications } from "@/components/providers/NotificationsProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { NOTIFICATION_CATEGORIES } from "@/data/notifications";

export default function NotificationList() {
  const { items, unread, markRead, markAllRead } = useNotifications();
  const toast = useToast();
  const [cat, setCat] = useState("All");
  const rows = items.filter((n) => cat === "All" || n.category === cat);

  return (
    <Card
      title={`Notifications (${unread} unread)`}
      actions={<button type="button" className="btn" onClick={markAllRead}>Mark all as read</button>}
    >
      <div className="toolbar">
        {NOTIFICATION_CATEGORIES.map((c) => (
          <button key={c} type="button" className={`btn ${c === cat ? "p" : ""}`} onClick={() => setCat(c)}>{c}</button>
        ))}
      </div>
      {rows.length === 0 && <EmptyState title="You're all caught up" text="No notifications in this category." />}
      {rows.map((n) => (
        <div className="cls" key={n.id}>
          <Badge tone="info">{n.category}</Badge>
          <div className="in" style={{ fontWeight: n.read ? 400 : 600 }}>{n.text}</div>
          {!n.read && <Badge tone="warn">Unread</Badge>}
          <button type="button" className="btn" onClick={() => toast(`Viewing: ${n.text}`)}>View</button>
          {!n.read && <button type="button" className="btn" onClick={() => markRead(n.id)}>Mark as read</button>}
        </div>
      ))}
    </Card>
  );
}
