import Link from "next/link";

export default function NotFound() {
  return (
    <div className="card empty">
      <h3 style={{ color: "var(--ink)" }}>Page not found</h3>
      <p>The page you are looking for doesn&apos;t exist.</p>
      <Link href="/" className="btn p">Back to Dashboard</Link>
    </div>
  );
}
