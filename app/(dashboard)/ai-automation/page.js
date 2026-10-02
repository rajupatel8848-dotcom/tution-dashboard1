"use client";
import Card from "@/components/ui/Card";
import ActionButton from "@/components/ui/ActionButton";
import AiAutomationCenter from "@/components/dashboard/AiAutomationCenter";
import RecentActivity from "@/components/dashboard/RecentActivity";
import ApiStatus from "@/components/api/ApiStatus";
import useApiCollection from "@/components/api/useApiCollection";
import { apiRequest } from "@/components/api/client";
import { useToast } from "@/components/providers/ToastProvider";

export default function AiAutomationPage() {
  const { data, loading, error, reload, setData } = useApiCollection("ai-actions");
  const toast = useToast();
  const approve = async (action) => {
    try {
      const updated = await apiRequest(`/api/ai-actions/${action.id}`, {
        method: "PUT",
        body: JSON.stringify({ status: "Approved" }),
      });
      setData((items) => items.map((item) => item.id === updated.id ? updated : item));
    } catch (requestError) {
      toast(requestError.message);
    }
  };
  return (
    <div className="grid g2">
      <AiAutomationCenter showOpenButton={false} />
      <div className="stack">
        <Card title="AI actions">
          <ApiStatus loading={loading} error={error} empty={!data.length && !loading && !error} onRetry={reload} />
          {!loading && !error && data.map((a) => (
            <div className="cls" key={a.id}>
              <div className="in"><b>{a.text}</b><div className="muted">{a.area || "Uncategorized"} · {a.status || "Pending"}</div></div>
              {a.status !== "Approved" && <ActionButton primary onClick={() => approve(a)}>Approve</ActionButton>}
            </div>
          ))}
        </Card>
        <RecentActivity />
      </div>
    </div>
  );
}
