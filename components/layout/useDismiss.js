"use client";
import { useEffect } from "react";

/** Close a popover on outside click or Escape. */
export default function useDismiss(ref, close) {
  useEffect(() => {
    const onDown = (e) => { if (!ref.current?.contains(e.target)) close(); };
    const onKey = (e) => { if (e.key === "Escape") close(); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [ref, close]);
}
