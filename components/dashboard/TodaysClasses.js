import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import ActionButton from "@/components/ui/ActionButton";
import { TODAYS_CLASSES } from "@/data/dashboard";

export default function TodaysClasses() {
  return (
    <Card title="Today's classes">
      {TODAYS_CLASSES.map((c) => (
        <div className="cls" key={c.subject + c.batch}>
          <span className="tm">{c.time}</span>
          <div className="in">
            <b>{c.subject}</b> <Badge>{c.status}</Badge>
            <div className="muted">{c.teacher} · {c.batch} · Room {c.room} · {c.students} students</div>
          </div>
          <ActionButton message={`Opening ${c.subject} · ${c.batch}`}>View Class</ActionButton>
        </div>
      ))}
    </Card>
  );
}
