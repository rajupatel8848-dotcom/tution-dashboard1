"use client";
import EmptyState from "@/components/ui/EmptyState";

export default function ApiStatus({ loading, error, empty, onRetry }) {
  if (loading) return <p className="muted" role="status">Loading records…</p>;
  if (error) {
    return (
      <div role="alert">
        <EmptyState title="Could not load data" text={error} />
        {onRetry && <button type="button" className="btn" onClick={onRetry}>Retry</button>}
      </div>
    );
  }
  if (empty) return <EmptyState title="No records yet" text="Add a record to see it here." />;
  return null;
}
