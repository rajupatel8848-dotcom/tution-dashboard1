import Card from "@/components/ui/Card";
import Icon from "@/components/ui/Icon";
import ActionButton from "@/components/ui/ActionButton";
import { AI_MESSAGES } from "@/data/dashboard";

export default function AiMessageCenter() {
  return (
    <Card title="AI message center" actions={<ActionButton message="Opening all messages">View All Messages</ActionButton>}>
      <ul className="tl">
        {AI_MESSAGES.map((m) => (
          <li key={m.title}>
            <span className="ic"><Icon name="Sparkles" /></span>
            <div><b>{m.title}</b><div className="muted">{m.text}</div></div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
