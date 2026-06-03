/**
 * Root page — proxy.ts will redirect authenticated users to their dashboard.
 * Unauthenticated users are redirected to /login.
 */
import { redirect } from "next/navigation";

export default function Home() {
  redirect("/login");
}
