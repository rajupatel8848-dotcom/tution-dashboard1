"use client";
import Card from "@/components/ui/Card";
import Icon from "@/components/ui/Icon";
import ApiStatus from "@/components/api/ApiStatus";
import useApiCollection from "@/components/api/useApiCollection";

export default function RecentActivity() {
  const { data, loading, error, reload } = useApiCollection("activities");
  return (
    <Card title="Recent activity">
      <ApiStatus loading={loading} error={error} empty={!data.length && !loading && !error} onRetry={reload} />
      {!loading && !error && data.length > 0 && <ul className="tl">
        {data.map((a) => (
          <li key={a.text}>
            <span className="ic"><Icon name={a.icon || "Activity"} /></span>
            <div><div>{a.text}</div><span className="muted">{a.time || a.createdAt || ""}</span></div>
          </li>
        ))}
      </ul>}
    </Card>
  );
}
