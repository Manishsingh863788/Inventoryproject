import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar
        role={session.role}
        userName={session.name}
        userEmail={session.email}
      />
      <div className="flex-1 overflow-y-auto">
        <main className="p-6 lg:p-8 pt-16 lg:pt-8 min-h-full">{children}</main>
      </div>
    </div>
  );
}
