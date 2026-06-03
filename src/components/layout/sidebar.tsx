"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Warehouse,
  Users,
  BarChart3,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Boxes,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { logout } from "@/actions/auth";
import { useState } from "react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const adminNav: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Inventory", href: "/admin/inventory", icon: Warehouse },
  { label: "Orders", href: "/admin/orders", icon: ShoppingCart },
];

const userNav: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Browse Products", href: "/dashboard/products", icon: Package },
  { label: "My Orders", href: "/dashboard/orders", icon: ShoppingCart },
  { label: "New Order", href: "/dashboard/quotation", icon: Boxes },
];

interface SidebarProps {
  role: "ADMIN" | "USER";
  userName: string;
  userEmail: string;
}

export function Sidebar({ role, userName, userEmail }: SidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navItems = role === "ADMIN" ? adminNav : userNav;

  const NavContent = () => (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-sidebar-border">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <BarChart3 className="h-4 w-4 text-primary-foreground" />
        </div>
        <div>
          <p className="text-sm font-bold text-sidebar-foreground">InvManager</p>
          <p className="text-xs text-sidebar-foreground/60 capitalize">{role.toLowerCase()} panel</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== "/admin" && item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
              {isActive && <ChevronRight className="ml-auto h-3 w-3" />}
            </Link>
          );
        })}
      </nav>

      {/* User Info & Logout */}
      <div className="border-t border-sidebar-border p-4">
        <div className="mb-3 flex items-center gap-3 rounded-lg bg-sidebar-accent/50 px-3 py-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary text-sm font-semibold">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">{userName}</p>
            <p className="text-xs text-sidebar-foreground/60 truncate">{userEmail}</p>
          </div>
        </div>
        <form action={logout}>
          <Button
            type="submit"
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-sidebar-foreground/70 hover:text-destructive hover:bg-destructive/10"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </form>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col bg-sidebar border-r border-sidebar-border h-screen sticky top-0">
        <NavContent />
      </aside>

      {/* Mobile Hamburger */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden bg-background shadow-md"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle menu"
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Mobile Sidebar */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="fixed left-0 top-0 z-40 h-full w-72 bg-sidebar border-r border-sidebar-border shadow-xl lg:hidden">
            <NavContent />
          </aside>
        </>
      )}
    </>
  );
}
