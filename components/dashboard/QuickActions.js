import Link from "next/link";
import Card from "@/components/ui/Card";
import Icon from "@/components/ui/Icon";
import ActionButton from "@/components/ui/ActionButton";
import { QUICK_ACTIONS } from "@/data/dashboard";

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
