"use client";
import { useState } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import Toggle from "@/components/ui/Toggle";
import { useConfirm } from "@/components/providers/ConfirmProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { AI_KPIS, AUTOMATIONS } from "@/data/dashboard";

export default function AiAutomationCenter({ showOpenButton = true }) {
  const [enabled, setEnabled] = useState(() => Object.fromEntries(AUTOMATIONS.map((a) => [a.id, a.on])));
  const confirm = useConfirm();
  const toast = useToast();

  const flip = async (a) => {
    const isOn = enabled[a.id];
    if (isOn && !(await confirm({ title: `Turn off ${a.title}?`, text: "Parents will stop receiving these automatic messages." }))) return;
    setEnabled((s) => ({ ...s, [a.id]: !isOn }));
    toast(`${a.title} turned ${isOn ? "off" : "on"}`);
  };

  return (
    <section className="card ai">
      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <h3 style={{ margin: 0 }}>AI Automation Center</h3>
        <span className="pill" style={{ background: "rgba(255,255,255,.15)", color: "#5eead4" }}>Active</span>
        {showOpenButton && (
          <Link href="/ai-automation" className="btn" style={{ marginLeft: "auto", background: "#fff", color: "#0b4f49", border: 0 }}>
            Open AI Automation
          </Link>
        )}
      </div>
      <div className="kp">
        {AI_KPIS.map((k) => <div key={k.label}><b>{k.value}</b><span className="muted">{k.label}</span></div>)}
      </div>
      {AUTOMATIONS.map((a) => (
        <div className="auto" key={a.id}>
          <Icon name={a.icon} />
          <div><b>{a.title}</b><p>{a.text}</p></div>
          <Toggle checked={enabled[a.id]} label={a.title} onChange={() => flip(a)} />
        </div>
      ))}
    </section>
  );
}
