import Link from "next/link";
import Card from "@/components/ui/Card";
import Icon from "@/components/ui/Icon";
import ActionButton from "@/components/ui/ActionButton";

const QUICK_ACTIONS = [
  { icon: "UserPlus", label: "Add Student" }, { icon: "Layers", label: "Create Batch" },
  { icon: "CalendarCheck", label: "Mark Attendance" }, { icon: "IndianRupee", label: "Collect Fee" },
  { icon: "FilePlus", label: "Create Assignment" }, { icon: "ClipboardList", label: "Schedule Exam" },
  { icon: "Megaphone", label: "Send Announcement" }, { icon: "Sparkles", label: "AI Automation", href: "/ai-automation" },
];

export default function QuickActions() {
  return (
    <Card title="Quick actions">
      <div className="qa">
        {QUICK_ACTIONS.map((a) =>
          a.href ? (
            <Link key={a.label} href={a.href} className="btn p" style={{ justifyContent: "flex-start" }}><Icon name={a.icon} />{a.label}</Link>
          ) : (
            <ActionButton key={a.label} icon={a.icon}>{a.label}</ActionButton>
          )
        )}
      </div>
    </Card>
  );
}
