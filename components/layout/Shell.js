"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Providers from "@/components/providers/Providers";
import AiChatPanel from "@/components/assistant/AiChatPanel";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function Shell({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => setMenuOpen(false), [pathname]);
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <Providers>
      <div className="app">
        {menuOpen && <div className="scrim" onClick={() => setMenuOpen(false)} />}
        <Sidebar open={menuOpen} />
        <main>
          <Topbar onMenu={() => setMenuOpen((o) => !o)} />
          <div className="page">{children}</div>
        </main>
      </div>
      <AiChatPanel />
    </Providers>
  );
}
