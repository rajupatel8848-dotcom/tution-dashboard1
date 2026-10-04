import { createHmac, timingSafeEqual } from "node:crypto";
import { AsyncLocalStorage } from "node:async_hooks";
import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { indiaDateKey } from "@/lib/date";

/* ================================================================
   TUITION MANAGEMENT + AI AUTOMATION  —  WhatsApp backend
   File: app/api/webhook/route.js

   WHO TALKS TO THE BOT
   • Admin   (numbers in ADMIN_PHONES) -> AI assistant + automation control
   • Parent  (number matches a student's parentPhone) -> child's attendance,
             fees, homework, exams, performance report, talk to teacher
   • Unknown number -> coaching ENQUIRY flow (10 questions) -> saved as lead

   AUTOMATIONS (each has ON/OFF; run by cron or by admin command)
   attendance | fees | homework | exams | reports | parentChat

   ENV (.env.local)
   WHATSAPP_VERIFY_TOKEN, WHATSAPP_TOKEN, WHATSAPP_PHONE_NUMBER_ID, META_APP_SECRET
   ADMIN_PHONES=919876543210,919811111111     (country code, no +)
   CRON_SECRET=any-long-secret                 (protects automation jobs)
   ANTHROPIC_API_KEY=...                       (optional, AI summaries & chat)
   WA_NOTIFY_TEMPLATE=tuition_notify           (optional, see NOTE below)

   CRON (vercel.json) — call the same route:
   GET /api/whatsapp?job=attendance_alerts   (header Authorization: Bearer CRON_SECRET)
   jobs: attendance_alerts | fee_reminders | homework_updates |
         exam_reminders | performance_reports | all

   NOTE: WhatsApp only allows free-text messages within 24h of the user's
   last message. Automated alerts to parents usually fall outside that, so
   create ONE approved template with a single {{1}} body variable
   (e.g. "{{1}}") and put its name in WA_NOTIFY_TEMPLATE.
   ================================================================ */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;
const WA_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const GRAPH_API_VERSION = process.env.WHATSAPP_GRAPH_API_VERSION || "v26.0";
const CRON_SECRET = process.env.CRON_SECRET;
const AI_KEY = process.env.ANTHROPIC_API_KEY;
const NOTIFY_TEMPLATE = process.env.WA_NOTIFY_TEMPLATE;
const META_APP_SECRET = process.env.META_APP_SECRET;
const ADMINS = (process.env.ADMIN_PHONES || "").split(",").map((s) => s.trim()).filter(Boolean);

/* ---------------- BRANDING (edit these) ---------------- */
const INSTITUTE = process.env.INSTITUTE_NAME || "Tutora";
const TAGLINE = process.env.INSTITUTE_TAGLINE || "";
const CONTACT_ETA = process.env.CONTACT_ETA || "shortly";
const PAYMENT_INFO = process.env.PAYMENT_INFO || "";

const SESSION_TTL = 24 * 60 * 60 * 1000;            // enquiry session expires after 24h of silence
const HR = "━━━━━━━━━━━━━━━━";
const FOOT = "\n\n💬 Type *menu* anytime for more options";

const requestContext = new AsyncLocalStorage();
const requestValue = (key) => requestContext.getStore()?.[key];
const requestArray = (key) => new Proxy([], {
  get(_target, property) {
    const value = requestValue(key) || [];
    const result = Reflect.get(value, property, value);
    return typeof result === "function" ? result.bind(value) : result;
  },
});
const STUDENTS = requestArray("students");
const HOMEWORK = requestArray("homework");
const EXAMS = requestArray("exams");
const leads = requestArray("leads");
const settings = new Proxy({}, {
  get(_target, property) { return requestValue("settings")?.[property]; },
  set(_target, property, value) {
    const current = requestValue("settings");
    if (!current) return false;
    current[property] = value;
    return true;
  },
  ownKeys() { return Reflect.ownKeys(requestValue("settings") || {}); },
  getOwnPropertyDescriptor(_target, property) {
    const current = requestValue("settings") || {};
    return Object.prototype.hasOwnProperty.call(current, property)
      ? { enumerable: true, configurable: true, value: current[property], writable: true }
      : undefined;
  },
});

async function loadWebhookData(database) {
  const date = indiaDateKey();
  const month = date.slice(0, 7);
  const [studentDocs, attendance, fees, assignments, exams, enquiries, automations] = await Promise.all([
    database.collection("students").find({ status: { $ne: "Inactive" } }).limit(5000).toArray(),
    database.collection("attendance").find({ date }).toArray(),
    database.collection("fees").find({}).limit(10000).toArray(),
    database.collection("assignments").find({ status: { $ne: "Cancelled" } }).limit(1000).toArray(),
    database.collection("exams").find({}).limit(1000).toArray(),
    database.collection("leads").find({}).sort({ createdAt: -1 }).limit(50).toArray(),
    database.collection("automations").find({}).toArray(),
  ]);

  const attendanceFor = (student) => attendance.find((record) =>
    (record.studentId && String(record.studentId) === String(student._id))
      || (record.student === student.name && (!record.cls || record.cls === student.cls)));
  const feeTotals = new Map();
  for (const fee of fees) {
    const key = fee.studentId ? String(fee.studentId) : fee.student;
    if (!key) continue;
    const current = feeTotals.get(key) || { total: 0, paid: 0, due: null };
    current.total += Number(fee.total) || 0;
    current.paid += Number(fee.paid) || 0;
    if (fee.due && (!current.due || String(fee.due) < String(current.due))) current.due = fee.due;
    feeTotals.set(key, current);
  }
  const students = studentDocs.map((student) => {
    const todayAttendance = attendanceFor(student);
    const id = String(student._id);
    const fee = feeTotals.get(id) || feeTotals.get(student.name) || { total: 0, paid: 0, due: null };
    return {
      id,
      name: student.name || "",
      cls: student.cls || "",
      parent: student.parent || "Parent",
      parentPhone: student.parentPhone || "",
      attendance: Number(student.attendance) || 0,
      marks: Number(student.performance) || 0,
      absentToday: todayAttendance?.status === "Absent",
      presentToday: todayAttendance?.status === "Present",
      fee,
    };
  });
  const automationSettings = Object.fromEntries(automations.map((automation) => [
    automation.key === "parents" ? "parentChat" : automation.key,
    Boolean(automation.on),
  ]));
  const defaultSettings = {
    attendance: false,
    fees: false,
    homework: false,
    exams: false,
    reports: false,
    parentChat: false,
  };

  return {
    database,
    students,
    attendance,
    homework: assignments.map((assignment) => ({
      id: String(assignment._id),
      cls: assignment.cls || "",
      subject: assignment.subject || "General",
      text: assignment.title || "",
      due: assignment.due || "Not specified",
    })),
    exams: exams.map((exam) => ({
      id: String(exam._id),
      cls: exam.cls || "",
      subject: exam.exam || "",
      date: exam.date || "",
      time: exam.time || "Not specified",
      room: exam.room || "Not specified",
    })),
    fees,
    feeCollectedThisMonth: fees
      .filter((fee) => fee.month === month)
      .reduce((total, fee) => total + (Number(fee.paid) || 0), 0),
    leads: enquiries.map(({ _id, ...lead }) => ({ ...lead, id: String(_id) })),
    settings: { ...defaultSettings, ...automationSettings },
  };
}

/* ---------------- small helpers ---------------- */
const normalize = (p) => String(p || "").replace(/\D/g, "");
const samePhone = (a, b) => {
  a = normalize(a); b = normalize(b);
  return !!a && !!b && (a === b || (a.length >= 10 && b.length >= 10 && a.slice(-10) === b.slice(-10)));
};
const childrenOf = (phone) => STUDENTS.filter((s) => samePhone(s.parentPhone, phone));
const isAdmin = (phone) => ADMINS.some((a) => samePhone(a, phone));

async function saveConversation(phone, input, status) {
  const kids = childrenOf(phone);
  const now = new Date().toISOString();
  await requestValue("database").collection("conversations").updateOne(
    { phone: normalize(phone) },
    {
      $set: {
        parent: kids[0]?.parent || `WhatsApp +${normalize(phone)}`,
        last: input.text || "Interactive reply",
        time: fmtTime(),
        status,
        updatedAt: now,
      },
      $setOnInsert: { createdAt: now },
    },
    { upsert: true },
  );
}

const inr = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");
const first = (n) => String(n || "").trim().split(/\s+/)[0] || "there";
const plural = (n, w) => `${n} ${w}${n === 1 ? "" : "s"}`;
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const clip = (s, n) => { const a = Array.from(String(s)); return a.length > n ? a.slice(0, n).join("") : String(s); }; // emoji-safe
const bar = (pct, n = 10) => { const f = Math.max(0, Math.min(n, Math.round((Number(pct) / 100) * n))); return "▰".repeat(f) + "▱".repeat(n - f); };

/* ---------------- dates (always India time, so jobs behave on UTC servers) ---------------- */
const IST_MS = 330 * 60 * 1000;
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const istNow = () => new Date(Date.now() + IST_MS);
const today = () => istNow().toISOString().slice(0, 10);
const dayNum = (d) => Date.parse(String(d).slice(0, 10) + "T00:00:00Z");
const daysUntil = (d) => Math.round((dayNum(d) - dayNum(today())) / 864e5);
const fmtDate = (d) => { const x = new Date(dayNum(d)); return isNaN(x) ? String(d) : `${DAYS[x.getUTCDay()]}, ${x.getUTCDate()} ${MONTHS[x.getUTCMonth()]} ${x.getUTCFullYear()}`; };
const fmtTime = () => { const x = istNow(); const h = x.getUTCHours(); return `${h % 12 || 12}:${String(x.getUTCMinutes()).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`; };
const rel = (n) => (n === 0 ? "today" : n === 1 ? "tomorrow" : n > 1 ? `in ${n} days` : `${-n} day${n === -1 ? "" : "s"} ago`);
const greeting = () => { const h = istNow().getUTCHours(); return h < 12 ? "☀️ Good morning" : h < 17 ? "🌤️ Good afternoon" : "🌙 Good evening"; };

/* ---------------- fees & labels ---------------- */
const feeOf = (s) => {
  const f = s.fee || { total: 0, paid: 0, due: null };
  const pending = Math.max(0, f.total - f.paid);
  const d = f.due ? daysUntil(f.due) : 0;
  const late = pending > 0 && Number.isFinite(d) && d < 0 ? -d : 0;
  return { ...f, pending, overdue: late > 0, daysLate: late };
};
const dueText = (f) => (!f.due ? "—" : `${fmtDate(f.due)} (${f.overdue ? `overdue by ${plural(f.daysLate, "day")}` : rel(daysUntil(f.due))})`);
const attLabel = (p) => (p >= 90 ? "🌟 Excellent" : p >= 80 ? "👍 Good" : p >= 75 ? "🙂 Satisfactory" : "⚠️ Needs attention");
const marksLabel = (p) => (p >= 85 ? "🏆 Outstanding" : p >= 70 ? "👏 Very good" : p >= 55 ? "👍 Good" : "📈 Room to improve");

/* ---------------- leads (saved by the enquiry flow) ---------------- */
const G = globalThis;
async function saveLead(phone, lead) {
  await requestValue("database").collection("leads").insertOne(lead);
  const currentLeads = requestValue("leads");
  currentLeads.unshift(lead);
  if (currentLeads.length > 50) currentLeads.length = 50;
}

/* ================================================================
   2. STATE  (in-memory; use Redis/DB on serverless)
================================================================ */
const sessions = G.__sess || (G.__sess = new Map());
const seen = G.__seen || (G.__seen = new Set());
const sentLog = G.__sent || (G.__sent = new Set());           // de-dupe automation messages per day
const callbackLog = G.__cb || (G.__cb = new Map());           // throttle "talk to teacher" requests
const runLock = G.__lock || (G.__lock = new Map());           // stop accidental double-sends from admin
const stats = G.__stats || (G.__stats = { tasks: 0, messages: 0, parents: new Set() });
const SETTING_LABEL = { attendance: "Attendance Automation", fees: "Fee Reminders", homework: "Homework Updates", exams: "Exam Reminders", reports: "Performance Reports", parentChat: "Parent Communication (AI chat)" };

function rollDay() {
  const d = today();
  if (G.__day !== d) { G.__day = d; sentLog.clear(); stats.tasks = 0; stats.messages = 0; stats.parents.clear(); }
}

/* ================================================================
   3. WHATSAPP SENDERS
================================================================ */
async function waSend(payload) {
  try {
    const res = await fetch(`https://graph.facebook.com/${GRAPH_API_VERSION}/${PHONE_ID}/messages`, {
      method: "POST",
      headers: { Authorization: `Bearer ${WA_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({ messaging_product: "whatsapp", ...payload }),
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) { console.error("❌ WA SEND:", res.status, await res.text()); return false; }
    return true;
  } catch (e) {
    console.error("❌ WA SEND (network):", e);
    return false;
  }
}
const markRead = (id) => waSend({ status: "read", message_id: id });

function chunk(text, max = 3800) {
  const out = [];
  let rest = String(text || "");
  while (rest.length > max) {
    let cut = rest.lastIndexOf("\n", max);
    if (cut < max * 0.5) cut = max;
    out.push(rest.slice(0, cut).trimEnd());
    rest = rest.slice(cut).trimStart();
  }
  if (rest.trim()) out.push(rest);
  return out;
}
async function sendText(to, body) {
  let ok = true;
  for (const part of chunk(body)) ok = (await waSend({ to, type: "text", text: { body: part, preview_url: false } })) && ok;
  return ok;
}

// options: "Label" or [id, "Label"]  (max 3, titles max 20 chars)
async function sendButtons(to, body, options, footer) {
  const opts = options.slice(0, 3).map((o, i) => (Array.isArray(o) ? o : [`opt_${i}`, o]));
  const ok = await waSend({
    to, type: "interactive",
    interactive: {
      type: "button",
      body: { text: clip(body, 1024) },
      ...(footer ? { footer: { text: clip(footer, 60) } } : {}),
      action: { buttons: opts.map(([id, title]) => ({ type: "reply", reply: { id: clip(id, 256), title: clip(title, 20) } })) },
    },
  });
  // if interactive fails for any reason, fall back to plain text so the user is never stuck
  return ok || sendText(to, `${body}\n\n${opts.map(([, t]) => `▫️ ${t}`).join("\n")}\n\n✍️ Please reply with one of the options above.`);
}

// input: rows [[id,title,desc],...]  OR  sections [{title, rows}]   (max 10 rows total)
const toSections = (x) => (x.length && !Array.isArray(x[0]) ? x : [{ title: "Choose one", rows: x }]);
async function sendList(to, body, label, input, footer) {
  const sections = toSections(input);
  const ok = await waSend({
    to, type: "interactive",
    interactive: {
      type: "list",
      body: { text: clip(body, 1024) },
      ...(footer ? { footer: { text: clip(footer, 60) } } : {}),
      action: {
        button: clip(label, 20),
        sections: sections.map((s) => ({
          title: clip(s.title, 24),
          rows: s.rows.map(([id, title, desc]) => ({ id: clip(id, 200), title: clip(title, 24), ...(desc ? { description: clip(desc, 72) } : {}) })),
        })),
      },
    },
  });
  const labels = sections.flatMap((s) => s.rows.map((r) => r[1]));
  return ok || sendText(to, `${body}\n\n${labels.map((l) => `▫️ ${l}`).join("\n")}\n\n✍️ Please reply with one of the options above.`);
}

// Business-initiated message (automation). Uses template if configured.
async function notify(to, text) {
  const ok = NOTIFY_TEMPLATE
    ? await waSend({
        to, type: "template",
        template: {
          name: NOTIFY_TEMPLATE, language: { code: "en" },
          // template variables cannot contain new lines / tabs / long runs of spaces
          components: [{ type: "body", parameters: [{ type: "text", text: clip(text.replace(/\t/g, " ").replace(/\n+/g, " | ").replace(/ {2,}/g, " "), 1000) }] }],
        },
      })
    : await sendText(to, text);
  if (ok) { stats.messages++; stats.parents.add(to); }
  return ok;
}

/* ================================================================
   4. AI HELPER  (optional — falls back to templates if no key)
================================================================ */
async function ai(system, user, max = 400) {
  if (!AI_KEY) return null;
  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": AI_KEY, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({ model: "claude-sonnet-5-5", max_tokens: max, system, messages: [{ role: "user", content: user }] }),
      signal: AbortSignal.timeout(12000),
    });
    if (!r.ok) { console.error("AI error", r.status, await r.text()); return null; }
    const d = await r.json();
    return d?.content?.map((c) => c.text || "").join("").trim() || null;
  } catch (e) { console.error("AI error", e); return null; }
}

async function performanceSummary(s) {
  const f = feeOf(s);
  const tip = s.attendance < 75
    ? "Attendance is below 75% — regular classes will make a real difference to results."
    : s.marks < 60
      ? "A little extra daily practice at home will help lift these marks quickly."
      : "Wonderful progress — keep up the consistency! 🎉";
  const text = await ai(
    `You write short, warm, professional WhatsApp progress notes from ${INSTITUTE} to parents. Max 60 words, plain text, no markdown, at most one emoji. Be encouraging, mention one strength and give one concrete suggestion.`,
    `Student: ${s.name}, ${s.cls}. Avg marks ${s.marks}%, attendance ${s.attendance}%. Write the parent summary.`
  );
  return `📊 *Progress Report*\n👤 *${s.name}* • ${s.cls}\n${HR}\n📝 Avg marks: *${s.marks}%*\n${bar(s.marks)}  ${marksLabel(s.marks)}\n\n📅 Attendance: *${s.attendance}%*\n${bar(s.attendance)}  ${attLabel(s.attendance)}${f.pending > 0 ? `\n\n💰 Fees pending: *${inr(f.pending)}*` : ""}\n${HR}\n💡 ${text || tip}`;
}

/* ================================================================
   5. AUTOMATION JOBS
================================================================ */
async function once(key, to, text, force) {
  rollDay();
  const k = `${today()}|${key}|${to}`;
  if (!force && sentLog.has(k)) return 0;
  const ok = await notify(to, text);
  if (ok) sentLog.add(k);
  return ok ? 1 : 0;
}

const JOBS = {
  async attendance_alerts(force) {
    let n = 0;
    for (const s of STUDENTS.filter((x) => x.absentToday))
      n += await once(`abs${s.id}`, s.parentPhone,
        `🔔 *Attendance Alert*\n\nDear ${s.parent},\n\nWe missed *${s.name}* (${s.cls}) at ${INSTITUTE} today, ${fmtDate(today())}. 📚\n\nCould you please share the reason for the absence? Our teachers will help your child catch up on today's lessons.\n\n📊 Overall attendance: *${s.attendance}%*\n${bar(s.attendance)}\n\nRegular attendance is the key to success 🌟\nThank you for your support 🙏\n— Team *${INSTITUTE}*`, force);
    return n;
  },
  async fee_reminders(force) {
    let n = 0;
    for (const s of STUDENTS) {
      const f = feeOf(s);
      if (f.pending <= 0) continue;
      const head = f.overdue ? "⚠️ *Fee Payment Overdue*" : "💳 *Fee Reminder*";
      const body = f.overdue
        ? "This is a gentle reminder that the fee below is overdue."
        : "A friendly reminder that a fee payment is coming up.";
      n += await once(`fee${s.id}`, s.parentPhone,
        `${head}\n\nDear ${s.parent},\n\n${body}\n\n👤 Student: *${s.name}* (${s.cls})\n📦 Total fee: ${inr(f.total)}\n✅ Paid: ${inr(f.paid)}\n${f.overdue ? "🔴" : "🟡"} Pending: *${inr(f.pending)}*\n📅 Due: ${dueText(f)}${PAYMENT_INFO ? `\n\n💳 ${PAYMENT_INFO}` : ""}\n\nKindly clear the dues at your earliest convenience. If you have already paid, please ignore this message. 🙏\n— Team *${INSTITUTE}*`, force);
    }
    return n;
  },
  async homework_updates(force) {
    let n = 0;
    for (const h of HOMEWORK)
      for (const s of STUDENTS.filter((x) => x.cls === h.cls))
        n += await once(`hw${h.id}${s.id}`, s.parentPhone,
          `📝 *Homework Update*\n\nDear ${s.parent}, here is today's homework for *${s.name}*:\n\n📚 Subject: *${h.subject}*\n🎓 Class: ${h.cls}\n✏️ Task: ${h.text}\n⏳ Submit by: *${h.due}*\n\nConsistent practice builds confidence! 💪\n— Team *${INSTITUTE}*`, force);
    return n;
  },
  async exam_reminders(force) {
    let n = 0;
    for (const e of EXAMS) {
      const d = daysUntil(e.date);
      if (!(d >= 0 && d <= 3)) continue;
      for (const s of STUDENTS.filter((x) => x.cls === e.cls))
        n += await once(`ex${e.id}${s.id}`, s.parentPhone,
          `📅 *Exam Reminder*\n\nDear ${s.parent}, ${s.name} has an exam coming up ${rel(d)}:\n\n📚 Subject: *${e.subject}* (${e.cls})\n🗓️ Date: ${fmtDate(e.date)}\n⏰ Time: ${e.time}\n📍 Venue: ${e.room}\n\n💡 Revise well, sleep early and arrive 15 minutes before time.\nAll the best, ${first(s.name)}! 🌟💪\n— Team *${INSTITUTE}*`, force);
    }
    return n;
  },
  async performance_reports(force) {
    let n = 0;
    for (const s of STUDENTS) n += await once(`perf${s.id}`, s.parentPhone, await performanceSummary(s), force);
    return n;
  },
};
const JOB_SETTING = { attendance_alerts: "attendance", fee_reminders: "fees", homework_updates: "homework", exam_reminders: "exams", performance_reports: "reports" };
const JOB_LABEL = { fee_reminders: "fee reminders", attendance_alerts: "absence alerts", homework_updates: "homework updates", exam_reminders: "exam reminders", performance_reports: "performance reports" };

async function runJob(name, { force = false, respectToggle = true } = {}) {
  const names = name === "all" ? Object.keys(JOBS) : [name];
  const out = {};
  for (const j of names) {
    if (!Object.prototype.hasOwnProperty.call(JOBS, j)) { out[j] = "unknown job"; continue; }
    if (respectToggle && !settings[JOB_SETTING[j]]) { out[j] = "disabled"; continue; }
    try {
      out[j] = await JOBS[j](force);
      stats.tasks++;
    } catch (e) {
      console.error(`❌ JOB ${j}:`, e);
      out[j] = "error";
    }
  }
  return out;
}

/* ================================================================
   6. ADMIN — AI ASSISTANT + AUTOMATION CONTROL
================================================================ */
const ADMIN_CMD = { a_absent: "absent today", a_fees: "pending fees", a_low: "low attendance", a_att: "attendance report", a_leads: "enquiries" };
const ADMIN_SEND = { a_s_fee: "fee_reminders", a_s_abs: "attendance_alerts", a_s_hw: "homework_updates", a_s_exam: "exam_reminders", a_s_rep: "performance_reports" };
const ADMIN_SECTIONS = [
  { title: "📊 Reports & insights", rows: [
    ["a_absent", "🚫 Absent today", "Who missed class today"],
    ["a_fees", "💰 Pending fees", "Dues & overdue accounts"],
    ["a_low", "⚠️ Low attendance", "Students below 75%"],
    ["a_att", "📋 Attendance report", "Today's present / absent summary"],
    ["a_leads", "📥 Enquiries / leads", "Latest enquiries received"],
  ] },
  { title: "🚀 Quick actions", rows: [
    ["a_s_fee", "💸 Send fee reminders", "Notify parents with pending fees"],
    ["a_s_abs", "📣 Send absent alerts", "Notify parents of absent students"],
    ["a_s_hw", "📝 Send homework", "Share today's homework"],
    ["a_s_exam", "📅 Send exam reminders", "Exams in the next 3 days"],
    ["a_s_rep", "📈 Send reports", "AI progress reports to parents"],
  ] },
];

const sendAdminMenu = (phone, lead) =>
  sendList(
    phone,
    `${lead || `${greeting()}, Admin! 👋`}\n\n🤖 *${INSTITUTE} AI Assistant* is ready.\n\nTap *Open menu*, or just type a question:\n• How many students are absent today?\n• Fee collected this month\n• Show Class 12 performance\n• AI status  |  Automation status\n• Automation fees off / on`,
    "Open menu", ADMIN_SECTIONS, INSTITUTE
  );

async function runAdminJob(phone, job) {
  const label = JOB_LABEL[job];
  if (!label) return sendText(phone, "🤔 I don't recognise that action. Type *menu* to see what I can do.");
  if (Date.now() - (runLock.get(job) || 0) < 60000)
    return sendText(phone, `⏱️ ${cap(label)} were just sent a moment ago. Please wait a minute before sending them again.`);
  runLock.set(job, Date.now());
  await sendText(phone, `⏳ Sending ${label}… please wait a moment.`);
  const r = await runJob(job, { force: true, respectToggle: false });
  const n = r[job];
  if (typeof n !== "number") return sendText(phone, `⚠️ Couldn't send ${label} (${n}). Please check the server logs.`);
  if (n === 0) return sendText(phone, `ℹ️ Nothing to send — no parents need ${label} right now.`);
  return sendText(phone, `✅ *Done!* ${cap(label)} sent to *${plural(n, "parent")}*. 📬`);
}

async function handleAdmin(phone, text, id) {
  // ----- interactive button / list ids -----
  if (id && id.startsWith("go:")) {
    const job = id.slice(3);
    return job === "cancel" ? sendText(phone, "👍 Cancelled — nothing was sent.") : runAdminJob(phone, job);
  }
  if (id && Object.prototype.hasOwnProperty.call(ADMIN_SEND, id)) {
    const job = ADMIN_SEND[id];
    return sendButtons(phone, `📣 *Please confirm*\n\nSend *${JOB_LABEL[job]}* to parents now?`, [[`go:${job}`, "✅ Yes, send"], ["go:cancel", "❌ Cancel"]]);
  }

  const t = ((id && ADMIN_CMD[id]) || text).toLowerCase().trim();

  if (/^(hi+|hello+|hey+|hola|namaste|help|menu|start)[\s!.]*$/.test(t)) return sendAdminMenu(phone);
  if (/^(thanks|thank you|thx|ok|okay|great|cool|got it)[\s!.]*$/.test(t)) return sendText(phone, "😊 Anytime! Type *menu* whenever you need me.");

  // ----- automation toggles -----
  if (t.startsWith("automation")) {
    const m = t.match(/automation\s+(\w+)\s+(on|off)/);
    const key = m && Object.keys(settings).find((k) => k.toLowerCase() === m[1]);
    if (key) {
      settings[key] = m[2] === "on";
      await requestValue("database").collection("automations").updateOne(
        { key: key === "parentChat" ? "parents" : key },
        { $set: { on: settings[key] }, $setOnInsert: { title: SETTING_LABEL[key] } },
        { upsert: true },
      );
      return sendText(phone, `✅ *${SETTING_LABEL[key]}* is now *${m[2].toUpperCase()}* ${settings[key] ? "🟢" : "⚪"}`);
    }
    return sendText(phone, `⚙️ *Automation Status*\n${HR}\n${Object.keys(settings).map((k) => `${settings[k] ? "🟢" : "⚪"} *${k}* – ${SETTING_LABEL[k]}`).join("\n")}\n${HR}\n💡 Change with:\n• automation fees off\n• automation fees on`);
  }
  if (/\bstatus\b/.test(t)) {
    rollDay();
    const active = Object.values(settings).filter(Boolean).length;
    return sendText(phone, `🤖 *AI Automation: Active*\n${HR}\n⚙️ Automated tasks today: *${stats.tasks}*\n💬 Messages sent: *${stats.messages}*\n👥 Parents notified: *${stats.parents.size}*\n🟢 Automations ON: *${active}/${Object.keys(settings).length}*\n🧠 AI replies: *${AI_KEY ? "Enabled" : "Template mode"}*\n${HR}\nType *automation status* to manage them.`);
  }

  // ----- actions (admin explicitly asked, so force) -----
  const act = [
    [/\b(send|run)\b.*\b(fee|fees|payment)/, "fee_reminders"],
    [/\b(send|run)\b.*\b(absent|attendance)/, "attendance_alerts"],
    [/\b(send|run)\b.*\bhomework/, "homework_updates"],
    [/\b(send|run)\b.*\bexam/, "exam_reminders"],
    [/\b(send|run)\b.*\b(report|reports|performance)/, "performance_reports"],
  ];
  for (const [re, job] of act) if (re.test(t)) return runAdminJob(phone, job);

  // ----- queries -----
  if (/\b(pending|dues?|overdue|unpaid|outstanding)\b/.test(t)) {
    const rows = STUDENTS.map((s) => ({ s, f: feeOf(s) })).filter((x) => x.f.pending > 0).sort((a, b) => b.f.daysLate - a.f.daysLate);
    if (!rows.length) return sendText(phone, "✅ *All fees are cleared!* 🎉 No pending dues.");
    const total = rows.reduce((a, x) => a + x.f.pending, 0);
    return sendText(phone, `💰 *Pending Fees: ${inr(total)}*\n${plural(rows.length, "student")} with dues\n${HR}\n${rows.map((x) => `${x.f.overdue ? "🔴" : "🟡"} ${x.s.name} (${x.s.cls})\n    ${inr(x.f.pending)} • ${x.f.overdue ? `overdue ${plural(x.f.daysLate, "day")}` : `due ${rel(daysUntil(x.f.due))}`}`).join("\n")}\n${HR}\n💡 Reply *send fee reminders* to notify parents.`);
  }
  if (/low attendance|attendance below|poor attendance|short attendance/.test(t)) {
    const l = STUDENTS.filter((s) => s.attendance < 75);
    if (!l.length) return sendText(phone, "🎉 *Great news!* Every student is above 75% attendance.");
    return sendText(phone, `⚠️ *Low Attendance (below 75%)*\n${plural(l.length, "student")}\n${HR}\n${l.map((s) => `• ${s.name} (${s.cls})\n  ${bar(s.attendance)} ${s.attendance}%`).join("\n")}\n${HR}\n💡 Consider calling these parents personally.`);
  }
  if (/attendance report|today.*attendance|attendance.*today/.test(t)) {
    const present = STUDENTS.filter((s) => s.presentToday).length;
    const absent = STUDENTS.filter((s) => s.absentToday).length;
    const recorded = present + absent;
    const rate = recorded ? (present / recorded) * 100 : 0;
    return sendText(phone, `📋 *Attendance Report*\n📅 ${fmtDate(today())}\n${HR}\n👥 Attendance records: *${present + absent}*\n✅ Present: *${present}*\n❌ Absent: *${absent}*\n📈 Rate: *${present + absent ? ((present / (present + absent)) * 100).toFixed(1) : "0.0"}%*\n${bar(rate)}`);
  }
  if (/\babsent\b/.test(t)) {
    const a = STUDENTS.filter((s) => s.absentToday);
    if (!a.length) return sendText(phone, `🎉 *Full attendance today!*\nEvery student is present on ${fmtDate(today())}.`);
    return sendText(phone, `🚫 *Absent Today: ${plural(a.length, "student")}*\n📅 ${fmtDate(today())}\n${HR}\n${a.map((s, i) => `${i + 1}. ${s.name} (${s.cls})`).join("\n")}\n${HR}\n💡 Reply *send absent alerts* to notify their parents.`);
  }
  const cm = t.match(/class\s*(\d+).*(performance|marks|result|report)/);
  if (cm) {
    const g = STUDENTS.filter((s) => s.cls === `Class ${cm[1]}`);
    if (!g.length) return sendText(phone, `🔍 No students found in *Class ${cm[1]}*.`);
    const avg = (k) => (g.reduce((a, s) => a + s[k], 0) / g.length).toFixed(1);
    const sorted = [...g].sort((a, b) => b.marks - a.marks);
    return sendText(phone, `📈 *Class ${cm[1]} Performance*\n${HR}\n👥 Students: *${g.length}*\n📝 Avg marks: *${avg("marks")}%*\n📅 Avg attendance: *${avg("attendance")}%*\n${HR}\n🏆 Top: ${sorted[0].name} (${sorted[0].marks}%)\n📌 Needs support: ${sorted[sorted.length - 1].name} (${sorted[sorted.length - 1].marks}%)`);
  }
  if (/\b(collected|collection|revenue)\b/.test(t)) {
    const pending = STUDENTS.reduce((a, s) => a + feeOf(s).pending, 0);
    return sendText(phone, `💵 *Fee Collection*\n${HR}\n✅ Collected this month: *${inr(requestValue("feeCollectedThisMonth"))}*\n⏳ Still pending: *${inr(pending)}*`);
  }
  if (/enquir|\bleads?\b/.test(t)) {
    if (!leads.length) return sendText(phone, "📭 *No enquiries yet.*\nNew leads will appear here as soon as someone completes the enquiry chat.");
    return sendText(phone, `📥 *Latest Enquiries* (${leads.length > 5 ? "last 5" : leads.length})\n${HR}\n${leads.slice(0, 5).map((l, i) => `${i + 1}. *${l.name}* • +${l.phone}\n   🎓 ${l.grade} • ${l.board}\n   🎯 ${l.goal}\n   🎁 Demo: ${l.demo}\n   🕒 ${fmtDate(String(l.createdAt).slice(0, 10))}`).join("\n\n")}`);
  }

  // ----- anything else -> AI with institute context -----
  const ctx = `Students: ${STUDENTS.length}. Absent today: ${STUDENTS.filter((s) => s.absentToday).map((s) => s.name).join(", ") || "none"}. Pending fees: ${inr(STUDENTS.reduce((a, s) => a + feeOf(s).pending, 0))}.`;
  const a = await ai(`You are the AI assistant of ${INSTITUTE}, talking to the admin. Be concise, friendly and professional. Answer in under 60 words, WhatsApp plain text, at most 2 emojis. Use only this context and say so if you don't know: ${ctx}`, text);
  if (a) return sendText(phone, a);
  return sendAdminMenu(phone, "🤔 I couldn't quite catch that — here's what I can do for you:");
}

/* ================================================================
   7. PARENT — SELF SERVICE MENU
================================================================ */
const PARENT_MENU = [
  ["p_att", "📋 Attendance", "Your child's attendance"],
  ["p_fee", "💰 Fees", "Pending fees & due date"],
  ["p_hw", "📝 Homework", "Today's homework"],
  ["p_exam", "📅 Upcoming exams", "Dates, timings & venue"],
  ["p_rep", "📈 Performance report", "AI progress summary"],
  ["p_talk", "📞 Talk to teacher", "Request a call back"],
];
const sendParentMenu = (phone, kids, lead) =>
  sendList(
    phone,
    `${lead || `${greeting()}, *${kids[0].parent}*! 🙏`}\nWelcome to *${INSTITUTE}*${TAGLINE ? `\n${TAGLINE}` : ""}\n\n🎓 *Your child${kids.length > 1 ? "ren" : ""}:*\n${kids.map((k) => `• ${k.name} (${k.cls})`).join("\n")}\n\nHow can I help you today? 👇`,
    "Open menu", PARENT_MENU, INSTITUTE
  );

const parentIntent = (t) =>
  /attend|absent|present/.test(t) ? "p_att"
  : /\b(fees?|payment|pending|due|dues)\b/.test(t) ? "p_fee"
  : /homework|\bhw\b|assignment/.test(t) ? "p_hw"
  : /\b(exams?|tests?|schedule)\b/.test(t) ? "p_exam"
  : /report|performance|marks|progress|result/.test(t) ? "p_rep"
  : /\b(teacher|call|speak|talk)\b/.test(t) ? "p_talk"
  : null;

async function handleParent(phone, kids, input) {
  const { text, id } = input;
  const t = text.toLowerCase().trim();

  if (/^(thanks|thank you|thx|ok|okay|great|got it|👍|🙏)[\s!.]*$/.test(t))
    return sendText(phone, `😊 You're most welcome, ${kids[0].parent}! We're always here to help.${FOOT}`);

  // short messages map straight to a menu option; longer ones go to AI chat when it's available
  const aiChat = settings.parentChat && !!AI_KEY;
  const want = id || (t.split(/\s+/).length <= 3 || !aiChat ? parentIntent(t) : null);
  const HRS = `\n\n${HR}\n\n`;

  switch (want) {
    case "p_att":
      return sendText(phone, kids.map((s) =>
        `📋 *Attendance — ${s.name}*\n🎓 ${s.cls}\n${HR}\n📅 Today: ${s.absentToday ? "❌ Absent" : s.presentToday ? "✅ Present" : "⏳ Not marked"}\n📊 Overall: *${s.attendance}%*\n${bar(s.attendance)}  ${attLabel(s.attendance)}${s.attendance < 75 ? "\n\n💡 Attendance is below 75% — regular classes will make a real difference to results." : ""}`
      ).join(HRS) + FOOT);
    case "p_fee":
      return sendText(phone, kids.map((s) => {
        const f = feeOf(s);
        const pct = f.total ? Math.round((f.paid / f.total) * 100) : 0;
        const head = `💰 *Fee Details — ${s.name}*\n🎓 ${s.cls}\n${HR}\n📦 Total: ${inr(f.total)}\n✅ Paid: ${inr(f.paid)}  (${pct}%)\n${bar(pct)}`;
        return f.pending > 0
          ? `${head}\n${f.overdue ? "🔴" : "🟡"} Pending: *${inr(f.pending)}*\n📅 Due: ${dueText(f)}${PAYMENT_INFO ? `\n\n💳 ${PAYMENT_INFO}` : ""}`
          : `${head}\n\n🎉 *All fees are cleared.* Thank you!`;
      }).join(HRS) + FOOT);
    case "p_hw": {
      const hw = HOMEWORK.filter((h) => kids.some((k) => k.cls === h.cls));
      return sendText(phone, (hw.length
        ? `📝 *Homework*\n${HR}\n` + hw.map((h) => `📚 *${h.subject}* (${h.cls})\n✏️ ${h.text}\n⏳ Submit by: *${h.due}*`).join("\n\n")
        : "🎉 *No homework assigned today!*\nYour child can enjoy a little free time.") + FOOT);
    }
    case "p_exam": {
      const ex = EXAMS.filter((e) => daysUntil(e.date) >= 0 && kids.some((k) => k.cls === e.cls));
      return sendText(phone, (ex.length
        ? `📅 *Upcoming Exams*\n${HR}\n` + ex.map((e) => `📚 *${e.subject}* (${e.cls})\n🗓️ ${fmtDate(e.date)} — ${rel(daysUntil(e.date))}\n⏰ ${e.time}\n📍 ${e.room}`).join("\n\n") + "\n\n🌟 Wishing your child all the best!"
        : "📭 *No upcoming exams scheduled.*\nWe'll remind you as soon as one is announced. 📅") + FOOT);
    }
    case "p_rep": {
      await sendText(phone, "⏳ Preparing your child's progress report…");
      for (let i = 0; i < kids.length; i++) await sendText(phone, (await performanceSummary(kids[i])) + (i === kids.length - 1 ? FOOT : ""));
      return;
    }
    case "p_talk": {
      const key = normalize(phone);
      if (Date.now() - (callbackLog.get(key) || 0) < 30 * 60000)
        return sendText(phone, "✅ Your call-back request is already with our team. 📞\nA teacher will reach out to you shortly. Thank you for your patience! 🙏");
      callbackLog.set(key, Date.now());
      await sendText(phone, `✅ *Request received!*\n\nThank you, ${kids[0].parent}. A teacher from *${INSTITUTE}* will call you ${CONTACT_ETA}. 📞🙏`);
      for (const a of ADMINS) await notify(a, `📞 *Call-back Request*\n\n👤 Parent: ${kids[0].parent}\n📱 +${normalize(phone)}\n🎓 Student(s): ${kids.map((k) => `${k.name} (${k.cls})`).join(", ")}\n🕒 ${fmtTime()}, ${fmtDate(today())}`);
      return;
    }
  }

  // free text -> AI parent communication (if enabled)
  if (aiChat) {
    const ctx = kids.map((s) => { const f = feeOf(s); return `${s.name} (${s.cls}): attendance ${s.attendance}%, marks ${s.marks}%, fee pending ${inr(f.pending)}, absent today: ${s.absentToday}`; }).join("; ");
    const a = await ai(`You are the friendly, professional parent-support assistant of ${INSTITUTE}. Reply in under 60 words, plain WhatsApp text, at most 2 emojis, no markdown except *bold*. Use only this data: ${ctx}. If you are unsure or the question is outside this data, politely say a teacher will call back and suggest typing *teacher*.`, text);
    if (a) return sendText(phone, a + FOOT);
  }
  return sendParentMenu(phone, kids, "🤔 I'm not sure I understood that — here's what I can help with:");
}

/* ================================================================
   8. ENQUIRY FLOW  (unknown numbers) — 10 questions
================================================================ */
const STEPS = [
  { key: "name", type: "text", q: () => "👤 *May I know your name?*",
    hint: "Please type your name using letters, e.g. *Rahul Sharma* 🙂",
    ack: (v) => `Nice to meet you, *${first(v)}*! 😊` },
  { key: "enquiryFor", type: "buttons", q: () => "🙋 *Who is this enquiry for?*",
    options: ["Myself", "My child"], icons: ["🙋", "🧒"],
    ack: (v) => (v === "My child" ? "Wonderful — we'd love to help your child shine! 🌟" : "Great — let's find the perfect batch for you! 🙌") },
  { key: "grade", type: "list", button: "Select class",
    q: (a) => `🎓 *Which class / level ${a.enquiryFor === "My child" ? "is your child in" : "are you in"}?*`,
    options: ["Class 5-7", "Class 8", "Class 9", "Class 10", "Class 11", "Class 12", "Dropper / Repeater", "College / Other"],
    icons: ["📗", "📗", "📘", "📘", "📙", "📙", "🔁", "🏛️"],
    ack: (v) => (/10|12/.test(v) ? "Board year — we'll make it count! 💪" : `Noted — ${v}. 👍`) },
  { key: "board", type: "buttons", q: () => "📘 *Which board does the syllabus follow?*",
    options: ["CBSE", "State Board", "ICSE / Other"], icons: ["📘", "🏛️", "📙"],
    ack: (v) => `${v} — noted! ✅` },
  { key: "subjects", type: "text", q: () => "📚 *Which subjects do you need help with?*\n_e.g. Maths, Physics, Chemistry_",
    hint: "Please type at least one subject, e.g. *Maths, Physics* 🙂",
    ack: () => "Great choice of subjects! 📚" },
  { key: "goal", type: "list", button: "Select goal", q: () => "🎯 *What's the main goal?*",
    options: ["Board exam prep", "JEE preparation", "NEET preparation", "Olympiad / NTSE", "Improve school marks", "Concept building", "Other"],
    icons: ["📖", "🚀", "🩺", "🏅", "📈", "💡", "✨"],
    ack: () => "A clear goal makes all the difference! 🎯" },
  { key: "mode", type: "buttons", q: () => "🏫 *Preferred mode of learning?*",
    options: ["Offline (Centre)", "Online", "Either is fine"], icons: ["🏫", "💻", "👍"],
    ack: () => "Noted! ✅" },
  { key: "timing", type: "buttons", q: () => "⏰ *Which batch timing suits you best?*",
    options: ["Morning", "Afternoon", "Evening"], icons: ["🌅", "☀️", "🌙"],
    ack: () => "Perfect — we'll try to match that slot. ⏰" },
  { key: "challenge", type: "text", q: () => "💭 *What's the biggest challenge right now?*\n_Type *skip* if you'd rather not say_",
    hint: "Please describe it in a few words, or type *skip* 🙂",
    ack: (v) => (v === "Not specified" ? "No problem! 👍" : "Thanks for sharing — our counsellor will address this personally. 🤝") },
  { key: "demo", type: "buttons", q: () => "🎁 *Would you like a FREE demo class?*",
    options: ["Yes, book demo", "Call me first", "Maybe later"], icons: ["✅", "📞", "🕒"], ack: () => "" },
];
const N = STEPS.length;
const STEP_TIP = "💡 Type 'back' to change your previous answer";
const optLabel = (st, i) => (st.icons?.[i] ? `${st.icons[i]} ` : "") + st.options[i];

function askStep(to, s, ack = "") {
  const st = STEPS[s.step];
  const head = `${ack ? ack + "\n\n" : ""}${"▰".repeat(s.step + 1)}${"▱".repeat(N - s.step - 1)}  *Step ${s.step + 1} of ${N}*\n${st.q(s.answers)}`;
  if (st.type === "buttons") return sendButtons(to, head, st.options.map((_, i) => [`${st.key}:${i}`, optLabel(st, i)]), s.step > 0 ? STEP_TIP : undefined);
  if (st.type === "list") return sendList(to, head, st.button, st.options.map((_, i) => [`${st.key}:${i}`, optLabel(st, i)]), STEP_TIP);
  return sendText(to, head + (s.step > 0 ? "\n\n↩️ Type *back* to change a previous answer" : ""));
}

function matchStep(st, { text, id }) {
  if (id && id.includes(":")) {
    const [k, n] = id.split(":");
    if (k === st.key && st.options[Number(n)] !== undefined) return st.options[Number(n)];
  }
  const t = text.toLowerCase().trim();
  const exact = st.options.findIndex((o, i) => [o, optLabel(st, i)].some((x) => x.toLowerCase() === t));
  if (exact >= 0) return st.options[exact];
  if (t.length >= 3) { const hits = st.options.filter((o) => o.toLowerCase().includes(t)); if (hits.length === 1) return hits[0]; }
  return null;
}

const summary = (a) =>
  `✅ *Enquiry Summary*\n${HR}\n👤 *Name:* ${a.name}\n🙋 *For:* ${a.enquiryFor}\n🎓 *Class:* ${a.grade}  •  📘 *Board:* ${a.board}\n📚 *Subjects:* ${a.subjects}\n🎯 *Goal:* ${a.goal}\n🏫 *Mode:* ${a.mode}  •  ⏰ *Batch:* ${a.timing}\n💭 *Challenge:* ${a.challenge}\n🎁 *Demo:* ${a.demo}\n${HR}`;

async function beginEnquiry(phone) {
  if (sessions.size > 1000) for (const [k, v] of sessions) if (Date.now() - v.at > SESSION_TTL) sessions.delete(k);
  const s = { step: 0, answers: {}, done: false, at: Date.now() };
  sessions.set(phone, s);
  await sendText(phone, `👋 *Welcome to ${INSTITUTE}!*${TAGLINE ? `\n${TAGLINE}` : ""}\n\nI'm your virtual assistant 🤖 I'll ask *${N} quick questions* (about 2 minutes) so our counsellor can recommend the perfect batch for you. 🎯\n\n💡 *Tips:* type *back* to change an answer, or *restart* to begin again.\n\nLet's get started! 🚀`);
  return askStep(phone, s);
}

async function handleEnquiry(phone, input) {
  const { text } = input;
  const lower = text.toLowerCase().trim();
  const greet = /^(hi+|hello+|hey+|hola|namaste|start|menu|help)[\s!.]*$/.test(lower);
  const restart = /^(restart|start over|reset|new|new enquiry)[\s!.]*$/.test(lower);

  let s = sessions.get(phone);
  if (s && Date.now() - s.at > SESSION_TTL) s = null;
  if (!s || restart || (s.done && greet)) return beginEnquiry(phone);
  s.at = Date.now();

  if (s.done)
    return sendText(phone, `✅ Your enquiry is already with our counsellor, *${first(s.answers.name)}*! They'll be in touch ${CONTACT_ETA}. 🙏\n\nWant to submit another enquiry? Just type *hi*.`);

  if (/^(cancel|stop|exit|quit)[\s!.]*$/.test(lower)) {
    sessions.delete(phone);
    return sendText(phone, "👍 No worries — your enquiry has been cancelled.\nType *hi* anytime to start again. 😊");
  }
  if (greet) {
    await sendText(phone, `👋 Welcome back${s.answers.name ? `, *${first(s.answers.name)}*` : ""}! Let's pick up where we left off.`);
    return askStep(phone, s);
  }
  if (/^back[\s!.]*$/.test(lower)) {
    if (s.step === 0) { await sendText(phone, "🙂 You're already at the first question."); return askStep(phone, s); }
    s.step--;
    return askStep(phone, s, "↩️ Sure — let's update that answer.");
  }

  const step = STEPS[s.step];

  // a tap on a button/list from an earlier question
  if (input.id && /^[a-zA-Z]+:\d+$/.test(input.id) && input.id.split(":")[0] !== step.key) {
    await sendText(phone, "↩️ That option belongs to an earlier question. Here's where we are now:");
    return askStep(phone, s);
  }

  let v;
  if (step.type === "text") {
    v = text.replace(/\s+/g, " ").trim();
    if (step.key === "challenge" && /^skip$/i.test(v)) v = "Not specified";
    else if (v.length < 2 || (step.key === "name" && !/\p{L}/u.test(v)) || (step.key === "subjects" && !/\p{L}/u.test(v)))
      return sendText(phone, `🙂 Hmm, that doesn't look quite right.\n${step.hint}`);
    v = clip(v, step.key === "name" ? 60 : 300);
  } else {
    v = matchStep(step, input);
    if (!v) { await sendText(phone, "👇 Please tap one of the options below."); return askStep(phone, s); }
  }

  s.answers[step.key] = v;
  const ack = step.ack ? step.ack(v, s.answers) : "";
  s.step++;

  if (s.step < N) return askStep(phone, s, ack);

  // ---------- finished ----------
  s.done = true;
  const a = s.answers;
  const lead = { phone, ...a, createdAt: new Date().toISOString() };
  await saveLead(phone, lead);

  await sendText(phone, summary(a));
  const next = a.demo === "Yes, book demo"
    ? `🎁 We've noted your *free demo class* request — our counsellor will confirm a slot ${CONTACT_ETA}.`
    : a.demo === "Call me first"
      ? `📞 Our counsellor will call you ${CONTACT_ETA} to explain everything.`
      : `No pressure at all 😊 Our counsellor will reach out ${CONTACT_ETA} to answer any questions.`;
  await sendText(phone, `🎉 *Thank you, ${first(a.name)}!*\n\n${next}\n\nWe're excited to help you learn and grow with *${INSTITUTE}*. 🌟\n\n💬 Want to submit another enquiry? Just type *hi*.`);

  const hot = a.demo === "Yes, book demo" ? "\n🔥 *Wants a free demo!*" : "";
  for (const adm of ADMINS) await notify(adm, `🔔 *New Enquiry Received!*${hot}\n📞 +${normalize(phone)}\n💬 wa.me/${normalize(phone)}\n\n${summary(a)}`);
}

/* ================================================================
   9. ROUTER
================================================================ */
function readInput(msg) {
  let r = null;
  if (msg.type === "text") r = { text: msg.text?.body?.trim() || "", id: null };
  else if (msg.type === "button") r = { text: msg.button?.text?.trim() || "", id: null };
  else if (msg.type === "interactive") {
    const i = msg.interactive;
    if (i?.type === "button_reply") r = { text: i.button_reply?.title || "", id: i.button_reply?.id || null };
    else if (i?.type === "list_reply") r = { text: i.list_reply?.title || "", id: i.list_reply?.id || null };
  }
  return r && (r.text || r.id) ? r : null;
}

async function handleMessage(phone, msg) {
  void markRead(msg.id); // A slow read receipt must not delay the actual reply.
  const parsedInput = readInput(msg);
  const input = parsedInput || { text: `Unsupported ${msg.type || "unknown"} message`, id: null };
  let status = "Enquiry";

  if (!parsedInput) {
    await sendText(phone, "📎 Thanks! I can only read text and button replies for now — please type your message. 🙂");
  } else if (isAdmin(phone)) {
    status = "Admin";
    await handleAdmin(phone, input.text, input.id);
  } else {
    const kids = childrenOf(phone);
    if (kids.length) {
      // plain greetings open the menu; menu taps carry p_* ids
      status = input.id === "p_talk" || parentIntent(input.text) === "p_talk" ? "Needs you" : "AI replied";
      if (!input.id && /^(hi+|hello+|hey+|hola|namaste|menu|start|help)[\s!.]*$/i.test(input.text)) {
        await sendParentMenu(phone, kids);
      } else {
        await handleParent(phone, kids, input);
      }
    } else {
      await handleEnquiry(phone, input);
    }
  }
  await saveConversation(phone, input, status);
}

/* ================================================================
   10. WEBHOOK
================================================================ */
export async function GET(request) {
  const sp = new URL(request.url).searchParams;

  // ---- automation jobs (cron) ----
  if (sp.get("job")) {
    if (!CRON_SECRET || request.headers.get("authorization") !== `Bearer ${CRON_SECRET}`) {
      return new Response("Unauthorized", { status: 401 });
    }
    try {
      const database = await getDatabase();
      const data = await loadWebhookData(database);
      return requestContext.run(data, async () => {
        const result = await runJob(sp.get("job"));
        return NextResponse.json({ ok: true, result, stats: { tasks: stats.tasks, messages: stats.messages, parents: stats.parents.size } });
      });
    } catch (error) {
      console.error("❌ CRON WEBHOOK ERROR:", error);
      return NextResponse.json({ error: "Could not load webhook data." }, { status: 503 });
    }
  }

  // ---- Meta webhook verification ----
  if (VERIFY_TOKEN && sp.get("hub.mode") === "subscribe" && sp.get("hub.verify_token") === VERIFY_TOKEN) {
    console.log("✅ META WEBHOOK VERIFIED");
    return new Response(sp.get("hub.challenge"), { status: 200 });
  }
  return new Response("Forbidden", { status: 403 });
}

export async function POST(request) {
  if (!META_APP_SECRET) {
    return NextResponse.json({ error: "META_APP_SECRET is not configured." }, { status: 503 });
  }

  const rawBody = await request.text();
  const signature = request.headers.get("x-hub-signature-256") || "";
  const expectedSignature = `sha256=${createHmac("sha256", META_APP_SECRET).update(rawBody).digest("hex")}`;
  const supplied = Buffer.from(signature);
  const expected = Buffer.from(expectedSignature);
  if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) {
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 401 });
  }

  let body;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Webhook body must be valid JSON." }, { status: 400 });
  }

  try {
    const database = await getDatabase();
    const data = await loadWebhookData(database);
    return requestContext.run(data, async () => {
      // Meta can batch several messages in one webhook call — handle all of them.
      for (const entry of body?.entry || [])
        for (const change of entry?.changes || [])
          for (const msg of change?.value?.messages || []) {
            if (!msg?.id || !msg?.from) continue;
            if (seen.has(msg.id)) continue;
            seen.add(msg.id);
            if (seen.size > 2000) seen.clear();

            console.log(`📩 ${msg.from} [${msg.type}]`);
            try {
              await handleMessage(msg.from, msg);
            } catch (error) {
              console.error("❌ HANDLER ERROR:", error);
              await sendText(msg.from, "😔 Sorry, something went wrong on our side.\nPlease try again in a moment, or type *hi* to start over.");
            }
          }
      return NextResponse.json({ success: true }, { status: 200 });
    });
  } catch (error) {
    console.error("❌ POST WEBHOOK ERROR:", error);
    return NextResponse.json({ error: "Could not load webhook data." }, { status: 503 });
  }
}
