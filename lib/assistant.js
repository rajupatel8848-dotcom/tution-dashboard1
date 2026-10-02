import { REPLIES, FALLBACK } from "@/data/assistant";

/** Hard-coded matcher. Replace with a call to your AI route later. */
export function answer(question) {
  const q = question.toLowerCase();
  return REPLIES.find((r) => r.match.some((m) => q.includes(m)))?.text ?? FALLBACK;
}
