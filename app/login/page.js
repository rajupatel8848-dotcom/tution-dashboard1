"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Unable to sign in.");
      const destination = new URLSearchParams(window.location.search).get("next");
      router.replace(destination?.startsWith("/") && !destination.startsWith("//") ? destination : "/");
      router.refresh();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 20 }}>
      <form className="card" onSubmit={submit} style={{ width: "min(100%, 400px)", padding: 28 }}>
        <h1 style={{ marginBottom: 6 }}>Sign in to Tutora</h1>
        <p className="muted">Use the admin credentials configured for this deployment.</p>
        <label style={{ display: "grid", gap: 6, marginTop: 18 }}>
          Username
          <input className="btn" autoComplete="username" required value={username} onChange={(event) => setUsername(event.target.value)} />
        </label>
        <label style={{ display: "grid", gap: 6, marginTop: 14 }}>
          Password
          <input className="btn" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} />
        </label>
        {error && <p role="alert" style={{ color: "var(--bad)" }}>{error}</p>}
        <button className="btn p" type="submit" disabled={loading} style={{ width: "100%", justifyContent: "center", marginTop: 18 }}>
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </main>
  );
}
