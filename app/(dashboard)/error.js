"use client";

export default function Error({ error, reset }) {
  return (
    <div className="card empty">
      <h3 style={{ color: "var(--ink)" }}>Something went wrong</h3>
      <p>{error?.message || "We couldn't load this page."}</p>
      <button type="button" className="btn p" onClick={reset}>Try again</button>
    </div>
  );
}
