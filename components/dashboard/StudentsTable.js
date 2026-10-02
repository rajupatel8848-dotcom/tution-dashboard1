"use client";
import { useMemo, useState } from "react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Icon from "@/components/ui/Icon";
import ProgressBar from "@/components/ui/ProgressBar";
import EmptyState from "@/components/ui/EmptyState";
import Pagination from "@/components/ui/Pagination";
import { useToast } from "@/components/providers/ToastProvider";
import { STUDENTS } from "@/data/students";

export default function StudentsTable({ title = "Recent students", limit }) {
  const toast = useToast();
  const [query, setQuery] = useState("");
  const rows = useMemo(() => {
    const filtered = STUDENTS.filter((s) => s.name.toLowerCase().includes(query.toLowerCase()));
    return limit ? filtered.slice(0, limit) : filtered;
  }, [query, limit]);

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
                <td>{s.cls}</td>
                <td>{s.parent}</td>
                <td>{s.phone}</td>
                <td>{s.attendance}%</td>
                <td><Badge>{s.fees}</Badge></td>
                <td><ProgressBar value={s.performance} /></td>
                <td><Badge>{s.status}</Badge></td>
                <td>
                  {iconBtn("Eye", "View", s.name, `Viewing ${s.name}`)}{" "}
                  {iconBtn("Pencil", "Edit", s.name, `Editing ${s.name}`)}{" "}
                  {iconBtn("MessageCircle", "Message parent of", s.name, `Message sent to ${s.parent}`)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <EmptyState title="No students found" text={`Nothing matches "${query}". Try a different name.`} />}
      </div>
      <Pagination shown={`1–${rows.length}`} total="1,248" />
    </Card>
  );
}
