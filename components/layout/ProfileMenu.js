"use client";
import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/ui/Icon";
import { useConfirm } from "@/components/providers/ConfirmProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { apiRequest } from "@/components/api/client";
import useDismiss from "./useDismiss";

export default function ProfileMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const close = useCallback(() => setOpen(false), []);
  const confirm = useConfirm();
  const toast = useToast();
  const router = useRouter();
  useDismiss(ref, close);

  const signOut = async () => {
    close();
    if (!(await confirm({ title: "Sign out?", text: "You will need to sign in again to access the dashboard." }))) return;
    try {
      await apiRequest("/api/auth/logout", { method: "POST" });
      router.replace("/login");
      router.refresh();
    } catch (error) {
      toast(error.message);
    }
  };

  return (
    <div style={{ position: "relative" }} ref={ref}>
      <button type="button" className="btn" style={{ padding: "4px 8px" }} aria-expanded={open} aria-haspopup="menu" onClick={() => setOpen((o) => !o)}>
        <span className="av">AD</span>
        <span className="nm">Admin</span>
        <Icon name="ChevronDown" size={16} />
      </button>
      <div className={`pop sm ${open ? "open" : ""}`} role="menu">
        <div className="it" role="menuitem" onClick={() => { close(); toast("Profile opened"); }}>My profile</div>
        <div className="it" role="menuitem" onClick={() => { close(); toast("Settings opened"); }}>Settings</div>
        <div className="it" role="menuitem" onClick={signOut}>Sign out</div>
      </div>
    </div>
  );
}
