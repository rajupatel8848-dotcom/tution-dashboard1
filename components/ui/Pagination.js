"use client";
import { useState } from "react";

export default function Pagination({ total, shown }) {
  const [page, setPage] = useState(1);
  return (
    <div className="pg">
      <span className="muted">Showing {shown} of {total}</span>
      {[1, 2, 3].map((p) => (
        <button key={p} type="button" className={p === page ? "on" : ""} aria-label={`Page ${p}`} onClick={() => setPage(p)}>{p}</button>
      ))}
    </div>
  );
}
