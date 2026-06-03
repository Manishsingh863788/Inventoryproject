import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/units";
import { formatDateTime } from "@/lib/utils";
import { AdminOrderActions } from "./admin-order-actions";
import type { OrderStatus } from "@/lib/types";

export const metadata: Metadata = { title: "Orders" };

interface OrdersPageProps {
  searchParams: Promise<{ status?: string; page?: string }>;
}

const PAGE_SIZE = 15;

const statusConfig = {
  PENDING: { label: "Pending", variant: "warning" as const },
  APPROVED: { label: "Approved", variant: "info" as const },
  REJECTED: { label: "Rejected", variant: "destructive" as const },
  COMPLETED: { label: "Completed", variant: "success" as const },
};

export default async function AdminOrdersPage({ searchParams }: OrdersPageProps) {
  const params = await searchParams;
  const statusFilter = params.status as "PENDING" | "APPROVED" | "REJECTED" | "COMPLETED" | undefined;
  const page = parseInt(params.page ?? "1");

  const where = statusFilter ? { status: statusFilter } : {};

  const [orders, totalCount] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        user: { select: { name: true, email: true } },
        items: {
          include: {
            product: { select: { name: true, baseUnit: true } },
          },
        },
      },
    }),
    prisma.order.count({ where }),
  ]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Orders"
        description={`${totalCount} order${totalCount !== 1 ? "s" : ""}`}
      />

      {/* Status filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {[
          { label: "All", value: "" },
          { label: "Pending", value: "PENDING" },
          { label: "Approved", value: "APPROVED" },
          { label: "Rejected", value: "REJECTED" },
          { label: "Completed", value: "COMPLETED" },
        ].map((tab) => (
          <a
            key={tab.value}
            href={`/admin/orders${tab.value ? `?status=${tab.value}` : ""}`}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              (statusFilter ?? "") === tab.value
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </a>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Order</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Customer</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Items</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Total</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Date</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {orders.map((order: {
                  id: string; status: OrderStatus; totalAmount: unknown; createdAt: Date;
                  user: { name: string; email: string };
                  items: Array<{ id: string; enteredQuantity: unknown; enteredUnit: string; convertedQuantity: unknown; product: { name: string; baseUnit: string } }>;
                }) => {
                  const cfg = statusConfig[order.status];
                  return (
                    <tr key={order.id} className="hover:bg-muted/20">
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                        #{order.id.slice(-8).toUpperCase()}
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium">{order.user.name}</p>
                          <p className="text-xs text-muted-foreground">{order.user.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="space-y-0.5">
                          {order.items.slice(0, 2).map((item) => (
                            <div key={item.id} className="text-xs text-muted-foreground">
                              {item.product.name}: {Number(item.enteredQuantity)} {item.enteredUnit}
                              <span className="text-muted-foreground/60">
                                {" "}→ {Number(item.convertedQuantity).toFixed(2)} {item.product.baseUnit}
                              </span>
                            </div>
                          ))}
                          {order.items.length > 2 && (
                            <p className="text-xs text-muted-foreground/60">
                              +{order.items.length - 2} more
                            </p>
                          )}
                        </div>
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
                      <td className="px-4 py-3 text-right">
                        <AdminOrderActions
                          orderId={order.id}
                          currentStatus={order.status}
                        />
                      </td>
                    </tr>
                  );
                })}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                      No orders found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <a
                href={`/admin/orders?${statusFilter ? `status=${statusFilter}&` : ""}page=${page - 1}`}
                className="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-sm hover:bg-muted transition-colors"
              >
                Previous
              </a>
            )}
            {page < totalPages && (
              <a
                href={`/admin/orders?${statusFilter ? `status=${statusFilter}&` : ""}page=${page + 1}`}
                className="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-sm hover:bg-muted transition-colors"
              >
                Next
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
