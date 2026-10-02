export const SUGGESTED_PROMPTS = [
  "How many students are absent today?", "Show pending fees.", "Which students have low attendance?",
  "Generate today's attendance report.", "Send fee reminders.", "Show Class 12 performance.",
  "How much fee was collected this month?",
];
export const REPLIES = [
  { match: ["absent"], text: "18 students are absent today, down from 26 yesterday. Class 11-B has the most absences (5)." },
  { match: ["pending", "fees"], text: "68 students have pending fees totalling ₹1,24,500. ₹48,200 of that is overdue." },
  { match: ["low attendance", "low"], text: "Sneha Patel (72%) and Rohit Yadav (64%) are below the 75% threshold." },
  { match: ["report"], text: "Today's attendance report is ready: 92.5% present across 4 classes. Want me to share it with teachers?" },
  { match: ["reminder"], text: "Fee reminders are queued for 32 parents. Confirm in AI Automation to send." },
  { match: ["class 12"], text: "Class 12 averages 79% marks with 94% attendance across 300 students." },
  { match: ["collected"], text: "₹8,45,000 has been collected this month, up 12.6% from last month." },
];
export const FALLBACK = "I couldn't match that yet. Try asking about absences, fees, attendance or a class.";
