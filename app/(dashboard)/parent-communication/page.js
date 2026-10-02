"use client";
import { useState } from "react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import ActionButton from "@/components/ui/ActionButton";
import ApiStatus from "@/components/api/ApiStatus";
import useApiCollection from "@/components/api/useApiCollection";

export default function ParentCommunicationPage() {
  const { data, loading, error, reload } = useApiCollection("conversations");
  const [selectedId, setSelectedId] = useState(null);
  const selected = data.find((conversation) => conversation.id === selectedId) || data[0];
  return (
    <div className="grid g2">
      <Card title="WhatsApp conversations">
        <ApiStatus loading={loading} error={error} empty={!data.length && !loading && !error} onRetry={reload} />
        {!loading && !error && data.map((conversation) => (
          <button type="button" className="cls" key={conversation.id} onClick={() => setSelectedId(conversation.id)} style={{ width: "100%", textAlign: "left", border: 0, background: "transparent" }}>
            <span className="av">{conversation.parent?.[0] || "?"}</span>
            <div className="in"><b>{conversation.parent}</b><div className="muted">{conversation.last || "No message recorded"}</div></div>
            <span className="muted">{conversation.time || ""}</span>
            {conversation.status && <Badge>{conversation.status}</Badge>}
          </button>
        ))}
      </Card>
      <Card title="Conversation">
        {selected
          ? <><b>{selected.parent}</b><p className="muted">{selected.last || "No message content recorded."}</p></>
          : <p className="muted">Select a conversation to see its latest recorded message.</p>}
      </Card>
    </div>
  );
}
