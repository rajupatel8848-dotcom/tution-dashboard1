import Shell from "@/components/layout/Shell";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";

export default function DashboardLayout({ children }) {
  const session = cookies().get(SESSION_COOKIE)?.value;
  if (!verifySessionToken(session)) redirect("/login");
  return <Shell>{children}</Shell>;
}
