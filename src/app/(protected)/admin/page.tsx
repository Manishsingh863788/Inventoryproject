import type { Metadata } from "next";
import {
  Package, ShoppingCart, Clock, TrendingUp,
  CheckCircle2, XCircle, ArrowUpRight,
} from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { formatCurrency } from "@/lib/units";
import { formatDateTime } from "@/lib/utils";
import { AdminCharts } from "./admin-charts";
import type { OrderStatus } from "@/lib/types";

export const metadata: Metadata = { title: "Admin Dashboard" };

type StatusVariant = "warning" | "info" | "destructive" | "success";
const statusConfig: Record<OrderStatus, { label: string; variant: StatusVariant; icon: React.ElementType }> = {
  PENDING:   { label: "Pending",   variant: "warning",     icon: Clock },
  APPROVED:  { label: "Approved",  variant: "info",        icon: CheckCircle2 },
  REJECTED:  { label: "Rejected",  variant: "destructive", icon: XCircle },
  COMPLETED: { label: "Completed", variant: "success",     icon: CheckCircle2 },
};

export default async function AdminDashboardPage() {
  const [totalProducts, totalOrders, pendingOrders, recentOrders, ordersByStatus, productsByCategory, products] =
    await Promise.all([
      prisma.product.count({ where: { isActive: true } }),
      prisma.order.count(),
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.order.findMany({
        take: 8,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { name: true, email: true } },
          items: { include: { product: { select: { name: true } } } },
        },
      }),
      prisma.order.groupBy({ by: ["status"], _count: { id: true } }),
      prisma.product.groupBy({ by: ["category"], _count: { id: true }, where: { isActive: true } }),
      prisma.product.findMany({
        select: { stockQuantity: true, pricePerBaseUnit: true },
        where: { isActive: true },
      }),
    ]);

  const totalInventoryValue = products.reduce(
    (acc: number, p: { stockQuantity: unknown; pricePerBaseUnit: unknown }) =>
      acc + Number(p.stockQuantity) * Number(p.pricePerBaseUnit),
    0
  );

  const statsCards = [
    { title: "Total Products",  value: totalProducts, description: "Active products",   icon: Package,      color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/30",  href: "/admin/products" },
    { title: "Total Orders",    value: totalOrders,   description: "All time",          icon: ShoppingCart, color: "text-blue-600 bg-blue-50 dark:bg-blue-950/30",        href: "/admin/orders" },
    { title: "Pending Orders",  value: pendingOrders, description: "Awaiting review",   icon: Clock,        color: "text-amber-600 bg-amber-50 dark:bg-amber-950/30",     href: "/admin/orders?status=PENDING" },
    { title: "Inventory Value", value: formatCurrency(totalInventoryValue), description: "At current prices", icon: TrendingUp, color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30", href: "/admin/inventory" },
  ];

  const chartOrdersData   = (ordersByStatus   as Array<{ status: string; _count: { id: number } }>).map((s) => ({ name: s.status, value: s._count.id }));
  const chartCategoryData = (productsByCategory as Array<{ category: string; _count: { id: number } }>).map((c) => ({ name: c.category, value: c._count.id }));

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="Welcome back! Here's an overview of your inventory system." />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statsCards.map((card) => (
          <Link key={card.title} href={card.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer group">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
                    <p className="text-2xl font-bold mt-1">{card.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
                  </div>
                  <div className={`p-2.5 rounded-xl ${card.color}`}>
                    <card.icon className="h-5 w-5" />
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

      <AdminCharts ordersData={chartOrdersData} categoryData={chartCategoryData} />

      {/* Recent Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base">Recent Orders</CardTitle>
            <CardDescription>Latest 8 orders across all users</CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/orders">View all</Link>
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Order ID</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Customer</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Items</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Total</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {recentOrders.map((order) => {
                  const status = order.status as OrderStatus;
                  const cfg = statusConfig[status];
                  return (
                    <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">#{order.id.slice(-8).toUpperCase()}</td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium">{order.user.name}</p>
                          <p className="text-xs text-muted-foreground">{order.user.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{order.items.length} item{order.items.length !== 1 ? "s" : ""}</td>
                      <td className="px-4 py-3 text-right font-semibold">{formatCurrency(Number(order.totalAmount))}</td>
                      <td className="px-4 py-3"><Badge variant={cfg.variant}>{cfg.label}</Badge></td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{formatDateTime(order.createdAt)}</td>
                    </tr>
                  );
                })}
                {recentOrders.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No orders yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
