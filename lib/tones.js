const TONES = {
  Paid: "ok", Active: "ok", Completed: "ok", Sent: "ok", "AI replied": "ok",
  "Partially Paid": "warn", Pending: "warn", "On Leave": "warn", "Needs you": "warn",
  Overdue: "bad", "At Risk": "bad", Live: "bad",
  Upcoming: "info", Open: "info", Read: "info",
};
export const toneFor = (label) => TONES[label] || "info";
