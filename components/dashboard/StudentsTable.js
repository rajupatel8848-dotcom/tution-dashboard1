"use client";
import { useMemo, useState } from "react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Icon from "@/components/ui/Icon";
import ProgressBar from "@/components/ui/ProgressBar";
import EmptyState from "@/components/ui/EmptyState";
import Pagination from "@/components/ui/Pagination";
import { useToast } from "@/components/providers/ToastProvider";
import useApiCollection from "@/components/api/useApiCollection";
import ApiStatus from "@/components/api/ApiStatus";

export default function StudentsTable({ title = "Recent students", limit }) {
  const toast = useToast();
  const [query, setQuery] = useState("");
  const { data: students, loading, error, reload } = useApiCollection("students");
  const rows = useMemo(() => {
    const filtered = students.filter((s) => (s.name || "").toLowerCase().includes(query.toLowerCase()));
    return limit ? filtered.slice(0, limit) : filtered;
  }, [students, query, limit]);

  const iconBtn = (name, label, student, message) => (
    <button type="button" className="ib" style={{ display: "inline-grid", width: 30, height: 30 }} aria-label={`${label} ${student}`} title={label} onClick={() => toast(message)}>
      <Icon name={name} />
    </button>
  );

  return (
    <Card
      title={title}
      actions={
        <label className="search" style={{ width: 200 }}>
          <Icon name="Search" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Filter students" aria-label="Filter students" />
        </label>
      }
    >
      <div className="tw">
        <table>
          <thead>
            <tr>{["Student", "Class", "Parent", "Phone", "Attendance", "Fees", "Performance", "Status", "Action"].map((h) => <th key={h}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((s) => (
              <tr key={s.id}>
                <td><b>{s.name}</b></td>
                <td>{s.cls || "—"}</td>
                <td>{s.parent || "—"}</td>
                <td>{s.phone || "—"}</td>
                <td>{Number(s.attendance) || 0}%</td>
                <td><Badge>{s.fees || "Not recorded"}</Badge></td>
                <td><ProgressBar value={Number(s.performance) || 0} /></td>
                <td><Badge>{s.status || "Unspecified"}</Badge></td>
                <td>
                  {iconBtn("Eye", "View", s.name, `Viewing ${s.name}`)}{" "}
                  {iconBtn("Pencil", "Edit", s.name, `Editing ${s.name}`)}{" "}
                  {iconBtn("MessageCircle", "Message parent of", s.name, `Message sent to ${s.parent}`)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && !error && rows.length === 0 && students.length > 0 && <EmptyState title="No students found" text={`Nothing matches "${query}". Try a different name.`} />}
      </div>
      <ApiStatus loading={loading} error={error} empty={!students.length} onRetry={reload} />
      <Pagination shown={rows.length ? `1–${rows.length}` : "0"} total={students.length} />
    </Card>
  );
}
