import Card from "@/components/ui/Card";
import ActionButton from "@/components/ui/ActionButton";
import AiAutomationCenter from "@/components/dashboard/AiAutomationCenter";
import RecentActivity from "@/components/dashboard/RecentActivity";
import { PENDING_AI_ACTIONS } from "@/data/academics";

export const metadata = { title: "AI Automation · Tutora" };

export default function AiAutomationPage() {
  return (
    <div className="grid g2">
      <AiAutomationCenter showOpenButton={false} />
      <div className="stack">
        <Card title="Pending AI actions (8)">
          {PENDING_AI_ACTIONS.map((a) => (
            <div className="cls" key={a.id}>
              <div className="in"><b>{a.text}</b><div className="muted">{a.area}</div></div>
              <ActionButton primary message={`Approved: ${a.text}`}>Approve</ActionButton>
            </div>
          ))}
        </Card>
        <RecentActivity />
      </div>
    </div>
  );
}
