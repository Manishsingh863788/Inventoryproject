/**
 * Admin layout — wraps all /admin/* pages.
 * Session is guaranteed by proxy.ts (ADMIN only).
 * params is a Promise in Next.js 16 — accessed with await.
 */
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session || session.role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar
        role="ADMIN"
        userName={session.name}
        userEmail={session.email}
      />
      <div className="flex-1 overflow-y-auto">
        <main className="p-6 lg:p-8 pt-16 lg:pt-8 min-h-full">{children}</main>
      </div>
    </div>
  );
}
