import Icon from "./Icon";
import Sparkline from "@/components/charts/Sparkline";

export default function StatCard({ icon, label, value, note, up = true, trend }) {
  return (
    <div className="card stat">
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div className="ic"><Icon name={icon} /></div>
        {trend && <Sparkline data={trend} />}
      </div>
      <span className="muted">{label}</span>
      <span className="v">{value}</span>
      <span className={up ? "up" : "dn"}>{note}</span>
    </div>
  );
}
