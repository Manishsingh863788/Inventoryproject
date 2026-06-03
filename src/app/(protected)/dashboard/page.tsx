import type { Metadata } from "next";
import Link from "next/link";
import {
  ShoppingCart,
  Package,
  Clock,
  CheckCircle2,
  ArrowUpRight,
  Boxes,
  TrendingUp,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { formatCurrency } from "@/lib/units";
import { formatDateTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Dashboard" };

import type { OrderStatus } from "@/lib/types";

type StatusVariant = "warning" | "info" | "destructive" | "success";
const statusConfig: Record<OrderStatus, { label: string; variant: StatusVariant }> = {
  PENDING:   { label: "Pending",   variant: "warning" },
  APPROVED:  { label: "Approved",  variant: "info" },
  REJECTED:  { label: "Rejected",  variant: "destructive" },
  COMPLETED: { label: "Completed", variant: "success" },
};

export default async function UserDashboardPage() {
  const session = await getSession();
  if (!session) return null;

  const [totalOrders, pendingOrders, completedOrders, recentOrders, totalProducts] =
    await Promise.all([
      prisma.order.count({ where: { userId: session.userId } }),
      prisma.order.count({ where: { userId: session.userId, status: "PENDING" } }),
      prisma.order.count({ where: { userId: session.userId, status: "COMPLETED" } }),
      prisma.order.findMany({
        where: { userId: session.userId },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          items: {
            include: { product: { select: { name: true } } },
          },
        },
      }),
      prisma.product.count({ where: { isActive: true } }),
    ]);

  const totalSpent = await prisma.order.aggregate({
    where: { userId: session.userId, status: { in: ["APPROVED", "COMPLETED"] } },
    _sum: { totalAmount: true },
  });

  const stats = [
    {
      title: "Total Orders",
      value: totalOrders,
      description: "All time",
      icon: ShoppingCart,
      color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/30",
      href: "/dashboard/orders",
    },
    {
      title: "Pending",
      value: pendingOrders,
      description: "Awaiting approval",
      icon: Clock,
      color: "text-amber-600 bg-amber-50 dark:bg-amber-950/30",
      href: "/dashboard/orders?status=PENDING",
    },
    {
      title: "Completed",
      value: completedOrders,
      description: "Fulfilled orders",
      icon: CheckCircle2,
      color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30",
      href: "/dashboard/orders?status=COMPLETED",
    },
    {
      title: "Total Spent",
      value: formatCurrency(Number(totalSpent._sum.totalAmount ?? 0)),
      description: "Approved + completed",
      icon: TrendingUp,
      color: "text-blue-600 bg-blue-50 dark:bg-blue-950/30",
      href: "/dashboard/orders",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${session.name.split(" ")[0]} 👋`}
        description="Here's an overview of your orders and activity."
      >
        <Button asChild>
          <Link href="/dashboard/quotation" className="gap-2">
            <Boxes className="h-4 w-4" />
            New Order
          </Link>
        </Button>
      </PageHeader>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Link key={s.title} href={s.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer group">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{s.title}</p>
                    <p className="text-2xl font-bold mt-1">{s.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{s.description}</p>
                  </div>
                  <div className={`p-2.5 rounded-xl ${s.color}`}>
                    <s.icon className="h-5 w-5" />
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-3 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>View details</span>
                  <ArrowUpRight className="h-3 w-3" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-0">
          <CardContent className="p-6">
            <Boxes className="h-8 w-8 mb-3 opacity-80" />
            <h3 className="font-semibold text-lg">Place a New Order</h3>
            <p className="text-sm opacity-80 mt-1 mb-4">
              Browse {totalProducts} products and create a quotation
            </p>
            <Button asChild variant="secondary" size="sm" className="bg-white/20 hover:bg-white/30 text-white border-0">
              <Link href="/dashboard/quotation">Get started →</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-0">
          <CardContent className="p-6">
            <Package className="h-8 w-8 mb-3 opacity-80" />
            <h3 className="font-semibold text-lg">Browse Products</h3>
            <p className="text-sm opacity-80 mt-1 mb-4">
              Search and filter our full product catalogue
            </p>
            <Button asChild variant="secondary" size="sm" className="bg-white/20 hover:bg-white/30 text-white border-0">
              <Link href="/dashboard/products">Browse →</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base">Recent Orders</CardTitle>
            <CardDescription>Your latest 5 orders</CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/orders">View all</Link>
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Order</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Items</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Total</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {recentOrders.map((order: {
                  id: string; status: OrderStatus; totalAmount: unknown; createdAt: Date;
                  items: Array<{ product: { name: string } }>;
                }) => {
                  const cfg = statusConfig[order.status];
                  return (
                    <tr key={order.id} className="hover:bg-muted/20">
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                        #{order.id.slice(-8).toUpperCase()}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {(order.items as Array<{ product: { name: string } }>).map((i) => i.product.name).join(", ").slice(0, 40)}
                        {order.items.length > 2 ? "..." : ""}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold">
                        {formatCurrency(Number(order.totalAmount))}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={cfg.variant}>{cfg.label}</Badge>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {formatDateTime(order.createdAt)}
                      </td>
                    </tr>
                  );
                })}
                {recentOrders.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                      No orders yet.{" "}
                      <Link href="/dashboard/quotation" className="text-primary hover:underline">
                        Place your first order →
                      </Link>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
