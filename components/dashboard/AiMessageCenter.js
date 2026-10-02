"use client";
import Card from "@/components/ui/Card";
import Icon from "@/components/ui/Icon";
import ActionButton from "@/components/ui/ActionButton";
import ApiStatus from "@/components/api/ApiStatus";
import useApiCollection from "@/components/api/useApiCollection";

export default function AiMessageCenter() {
  const { data, loading, error, reload } = useApiCollection("announcements");
  return (
    <Card title="Announcements" actions={<ActionButton message="Opening all announcements">View All Messages</ActionButton>}>
      <ApiStatus loading={loading} error={error} empty={!data.length && !loading && !error} onRetry={reload} />
      {!loading && !error && data.length > 0 && <ul className="tl">
        {data.map((m) => (
          <li key={m.id}>
            <span className="ic"><Icon name="Sparkles" /></span>
            <div><b>{m.title}</b><div className="muted">{m.audience || "Audience not set"} · {m.sent || "Not sent"}</div></div>
          </li>
        ))}
      </ul>}
    </Card>
  );
}
