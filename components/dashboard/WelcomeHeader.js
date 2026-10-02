import ActionButton from "@/components/ui/ActionButton";

export default function WelcomeHeader() {
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", marginBottom: 18 }}>
      <div>
        <h2 style={{ margin: 0, fontSize: 22, letterSpacing: "-.02em" }}>Good Morning, Admin 👋</h2>
        <span className="muted">Here&apos;s what&apos;s happening with your tuition institute today.</span>
      </div>
      <div className="sp" />
      <ActionButton icon="Calendar" message="Date range: Today">Today</ActionButton>
      <ActionButton icon="Download" primary message="Report exported">Export Report</ActionButton>
    </div>
  );
}
