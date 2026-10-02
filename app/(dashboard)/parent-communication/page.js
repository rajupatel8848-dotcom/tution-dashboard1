import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import ActionButton from "@/components/ui/ActionButton";
import { PARENT_CHATS } from "@/data/academics";

export const metadata = { title: "Parent Communication · Tutora" };

export default function ParentCommunicationPage() {
  return (
    <div className="grid g2">
      <Card title="WhatsApp conversations">
        {PARENT_CHATS.map((c) => (
          <div className="cls" key={c.id}>
            <span className="av">{c.parent.split(" ")[1][0]}</span>
            <div className="in"><b>{c.parent}</b><div className="muted">{c.last}</div></div>
            <span className="muted">{c.time}</span>
            <Badge>{c.status}</Badge>
          </div>
        ))}
      </Card>
      <Card title="AI draft reply">
        <div className="m bot" style={{ maxWidth: "100%" }}>
          Hello Mr. Sharma, Rahul was marked absent today in Class 12-A. He can join tomorrow at 8:00 AM. Notes from today&apos;s Physics class will be shared by evening.
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <ActionButton primary message="Reply sent on WhatsApp">Send</ActionButton>
          <ActionButton message="Draft regenerated">Regenerate</ActionButton>
        </div>
      </Card>
    </div>
  );
}
