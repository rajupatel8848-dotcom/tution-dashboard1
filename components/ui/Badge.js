import { toneFor } from "@/lib/tones";

export default function Badge({ children, tone }) {
  return <span className={`badge b-${tone || toneFor(children)}`}>{children}</span>;
}
