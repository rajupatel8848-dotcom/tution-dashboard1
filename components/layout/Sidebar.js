"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon from "@/components/ui/Icon";
import { NAV } from "@/data/nav";
import { useNotifications } from "@/components/providers/NotificationsProvider";
import { useToast } from "@/components/providers/ToastProvider";

export default function Sidebar({ open }) {
  const pathname = usePathname();
  const { unread } = useNotifications();
  const toast = useToast();
  const isActive = (href) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <aside className={open ? "open" : ""} aria-label="Main navigation">
      <div className="brand">
        <div className="logo">T</div>
        <div><b>Tutora Institute</b><small>AI Tuition Management</small></div>
      </div>
      <nav>
        {NAV.map((n) => {
          const on = isActive(n.href);
          return (
            <Link key={n.href} href={n.href} className={`navb ${on ? "on" : ""}`} aria-current={on ? "page" : undefined}>
              <Icon name={n.icon} />
              <span>{n.label}</span>
              {n.href === "/notifications" && unread > 0 && <span className="cnt">{unread}</span>}
            </Link>
          );
        })}
      </nav>
      <div className="side-b">
        <nav>
          <button type="button" onClick={() => toast("Settings opened")}><Icon name="Settings" />Settings</button>
          <button type="button" onClick={() => toast("Support: help@tutora.in")}><Icon name="LifeBuoy" />Help &amp; Support</button>
        </nav>
        <div className="me">
          <div className="av">AD</div>
          <div><b>Admin</b><div className="muted">Institute owner</div></div>
        </div>
      </div>
    </aside>
  );
}
