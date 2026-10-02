"use client";
import { usePathname } from "next/navigation";
import Icon from "@/components/ui/Icon";
import { NAV } from "@/data/nav";
import NotificationsPopover from "./NotificationsPopover";
import ProfileMenu from "./ProfileMenu";

export default function Topbar({ onMenu }) {
  const pathname = usePathname();
  const current = NAV.find((n) => (n.href === "/" ? pathname === "/" : pathname.startsWith(n.href)));
  const title = current?.label ?? "Dashboard";

  return (
    <header className="top">
      <button type="button" className="ib mob" onClick={onMenu} aria-label="Open menu"><Icon name="Menu" /></button>
      <div>
        <div className="crumb">Tutora / {title}</div>
        <h1>{title}</h1>
      </div>
      <div className="sp" />
      <label className="search">
        <Icon name="Search" />
        <input placeholder="Search students, fees, classes" aria-label="Global search" />
      </label>
      <span className="pill hide-s">AI Automation: Active</span>
      <NotificationsPopover />
      <ProfileMenu />
    </header>
  );
}
