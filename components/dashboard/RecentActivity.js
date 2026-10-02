import Card from "@/components/ui/Card";
import Icon from "@/components/ui/Icon";
import { ACTIVITY } from "@/data/dashboard";

export default function RecentActivity() {
  return (
    <Card title="Recent activity">
      <ul className="tl">
        {ACTIVITY.map((a) => (
          <li key={a.text}>
            <span className="ic"><Icon name={a.icon} /></span>
            <div><div>{a.text}</div><span className="muted">{a.time}</span></div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
