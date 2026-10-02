"use client";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import Toggle from "@/components/ui/Toggle";
import { useConfirm } from "@/components/providers/ConfirmProvider";
import { useToast } from "@/components/providers/ToastProvider";
import ApiStatus from "@/components/api/ApiStatus";
import useApiCollection from "@/components/api/useApiCollection";
import { apiRequest } from "@/components/api/client";

export default function AiAutomationCenter({ showOpenButton = true }) {
  const { data, loading, error, reload, setData } = useApiCollection("automations");
  const confirm = useConfirm();
  const toast = useToast();

  const flip = async (a) => {
    const isOn = Boolean(a.on);
    if (isOn && !(await confirm({ title: `Turn off ${a.title}?`, text: "Parents will stop receiving these automatic messages." }))) return;
    try {
      const updated = await apiRequest(`/api/automations/${a.id}`, {
        method: "PUT",
        body: JSON.stringify({ on: !isOn }),
      });
      setData((items) => items.map((item) => item.id === updated.id ? updated : item));
      toast(`${a.title} turned ${isOn ? "off" : "on"}`);
    } catch (requestError) {
      toast(requestError.message);
    }
  };

  const enabledCount = data.filter((automation) => automation.on).length;
  return (
    <section className="card ai">
      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <h3 style={{ margin: 0 }}>AI Automation Center</h3>
        <span className="pill" style={{ background: "rgba(255,255,255,.15)", color: "#5eead4" }}>{enabledCount ? "Active" : "Inactive"}</span>
        {showOpenButton && (
          <Link href="/ai-automation" className="btn" style={{ marginLeft: "auto", background: "#fff", color: "#0b4f49", border: 0 }}>
            Open AI Automation
          </Link>
        )}
      </div>
      <div className="kp"><div><b>{enabledCount}</b><span className="muted">Enabled automations</span></div><div><b>{data.length}</b><span className="muted">Configured</span></div></div>
      <ApiStatus loading={loading} error={error} empty={!data.length && !loading && !error} onRetry={reload} />
      {!loading && !error && data.map((a) => (
        <div className="auto" key={a.id}>
          <Icon name={a.icon || "Sparkles"} />
          <div><b>{a.title}</b><p>{a.text}</p></div>
          <Toggle checked={Boolean(a.on)} label={a.title} onChange={() => flip(a)} />
        </div>
      ))}
    </section>
  );
}
