"use client";
import { useEffect, useRef, useState } from "react";
import Icon from "@/components/ui/Icon";
import { SUGGESTED_PROMPTS } from "@/data/assistant";
import { answer } from "@/lib/assistant";

const WELCOME = { role: "bot", text: "Hi! I can pull up attendance, fees and performance. Try a suggestion below." };

export default function AiChatPanel() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME]);
  const [typing, setTyping] = useState(false);
  const [draft, setDraft] = useState("");
  const bodyRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { bodyRef.current?.scrollTo({ top: 1e6 }); }, [messages, typing]);
  useEffect(() => { if (open) inputRef.current?.focus(); }, [open]);
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const send = (text) => {
    if (!text.trim()) return;
    setMessages((m) => [...m, { role: "me", text }]);
    setDraft("");
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages((m) => [...m, { role: "bot", text: answer(text) }]);
    }, 700);
  };

  return (
    <>
      <button type="button" className="fab" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label="Open Tuition AI Assistant">
        <Icon name="Sparkles" /><span className="hide-s">Ask AI</span>
      </button>
      <section className={`chat ${open ? "open" : ""}`} aria-label="Tuition AI Assistant">
        <div className="hd">
          <Icon name="Sparkles" />
          <div>
            <b>Tuition AI Assistant</b>
            <div style={{ fontSize: 11.5, opacity: 0.85 }}>Ask about students, fees and attendance</div>
          </div>
          <button type="button" className="ib" style={{ marginLeft: "auto", background: "none", color: "#fff", borderColor: "rgba(255,255,255,.4)" }} onClick={() => setOpen(false)} aria-label="Close chat">
            <Icon name="X" />
          </button>
        </div>
        <div className="bd" ref={bodyRef} aria-live="polite">
          {messages.map((m, i) => <div key={i} className={`m ${m.role}`}>{m.text}</div>)}
          {typing && <div className="m bot skel" style={{ width: 90, height: 32 }} />}
        </div>
        <div className="sug">
          {SUGGESTED_PROMPTS.map((p) => <button key={p} type="button" onClick={() => send(p)}>{p}</button>)}
        </div>
        <div className="cin">
          <input ref={inputRef} value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send(draft)} placeholder="Ask something…" aria-label="Message" />
          <button type="button" className="btn p" onClick={() => send(draft)} aria-label="Send"><Icon name="Send" /></button>
        </div>
      </section>
    </>
  );
}
