"use client";
import { useCallback, useRef, useState } from "react";
import Icon from "@/components/ui/Icon";
import { useConfirm } from "@/components/providers/ConfirmProvider";
import { useToast } from "@/components/providers/ToastProvider";
import useDismiss from "./useDismiss";

export default function ProfileMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const close = useCallback(() => setOpen(false), []);
  const confirm = useConfirm();
  const toast = useToast();
  useDismiss(ref, close);

  const signOut = async () => {
    close();
    if (await confirm({ title: "Sign out?", text: "You will need to sign in again to access the dashboard." })) toast("Signed out (demo)");
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
