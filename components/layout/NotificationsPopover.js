"use client";
import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import { useNotifications } from "@/components/providers/NotificationsProvider";
import useDismiss from "./useDismiss";

export default function NotificationsPopover() {
  const { items, unread, markRead, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const close = useCallback(() => setOpen(false), []);
  useDismiss(ref, close);

  return (
    <div style={{ position: "relative" }} ref={ref}>
      <button type="button" className="ib" aria-label={`Notifications, ${unread} unread`} aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <Icon name="Bell" />
        {unread > 0 && <span className="dot">{unread}</span>}
      </button>
      <div className={`pop ${open ? "open" : ""}`} role="dialog" aria-label="Notifications">
        <div style={{ display: "flex", padding: "12px 14px", alignItems: "center" }}>
          <b>Notifications</b>
          <button type="button" className="btn" style={{ marginLeft: "auto", padding: "3px 9px" }} onClick={markAllRead}>Mark all as read</button>
        </div>
        {items.slice(0, 6).map((n) => (
          <div key={n.id} className={`it ${n.read ? "" : "un"}`} onClick={() => markRead(n.id)}>
            <b>{n.category}</b><span>{n.text}</span>
          </div>
        ))}
        <Link href="/notifications" className="it" style={{ justifyContent: "center", color: "var(--pri)", fontWeight: 600 }} onClick={close}>
          View all notifications
        </Link>
      </div>
    </div>
  );
}
