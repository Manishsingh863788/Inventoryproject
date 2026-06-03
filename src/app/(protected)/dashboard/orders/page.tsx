import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/units";
import { formatDateTime } from "@/lib/utils";
import Link from "next/link";
import { Boxes, ChevronDown, ChevronUp } from "lucide-react";
import { OrderDetailsAccordion } from "./order-details-accordion";

export const metadata: Metadata = { title: "My Orders" };

interface OrdersPageProps {
  searchParams: Promise<{ status?: string; page?: string }>;
}

const PAGE_SIZE = 10;

import type { OrderStatus } from "@/lib/types";

type StatusVariant = "warning" | "info" | "destructive" | "success";
const statusConfig: Record<OrderStatus, { label: string; variant: StatusVariant }> = {
  PENDING:   { label: "Pending",   variant: "warning" },
  APPROVED:  { label: "Approved",  variant: "info" },
  REJECTED:  { label: "Rejected",  variant: "destructive" },
  COMPLETED: { label: "Completed", variant: "success" },
};

export default async function UserOrdersPage({ searchParams }: OrdersPageProps) {
  const params       = await searchParams;
  const session      = await getSession();
  if (!session) return null;

  const statusFilter = params.status as
    | "PENDING" | "APPROVED" | "REJECTED" | "COMPLETED"
    | undefined;
  const page = parseInt(params.page ?? "1");

  const where = {
    userId: session.userId,
    ...(statusFilter ? { status: statusFilter } : {}),
  };

  const [orders, totalCount] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip:    (page - 1) * PAGE_SIZE,
      take:    PAGE_SIZE,
      include: {
        items: {
          include: { product: { select: { name: true, baseUnit: true, sku: true } } },
        },
      },
    }),
    prisma.order.count({ where }),
  ]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Orders"
        description={`${totalCount} order${totalCount !== 1 ? "s" : ""} total`}
      >
        <Button asChild>
          <Link href="/dashboard/quotation" className="gap-2">
            <Boxes className="h-4 w-4" />
            New Order
          </Link>
        </Button>
      </PageHeader>

      {/* Status tabs */}
      <div className="flex gap-2 flex-wrap">
        {[
          { label: "All",       value: "" },
          { label: "Pending",   value: "PENDING" },
          { label: "Approved",  value: "APPROVED" },
          { label: "Rejected",  value: "REJECTED" },
          { label: "Completed", value: "COMPLETED" },
        ].map((tab) => (
          <a
            key={tab.value}
            href={`/dashboard/orders${tab.value ? `?status=${tab.value}` : ""}`}
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

      {/* Orders list */}
      <div className="space-y-3">
        {orders.map((order: {
          id: string; status: OrderStatus; totalAmount: unknown; createdAt: Date; updatedAt: Date;
          items: Array<{
            id: string; enteredQuantity: unknown; enteredUnit: string;
            convertedQuantity: unknown; pricePerUnit: unknown; lineTotal: unknown; createdAt: Date;
            product: { name: string; baseUnit: string; sku: string };
          }>;
        }) => {
          const cfg = statusConfig[order.status];
          return (
            <Card key={order.id} className="overflow-hidden">
              {/* Order header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b bg-muted/20">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="font-mono text-xs text-muted-foreground">
                      #{order.id.slice(-8).toUpperCase()}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatDateTime(order.createdAt)}
                    </p>
                  </div>
                  <Badge variant={cfg.variant}>{cfg.label}</Badge>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Total</p>
                    <p className="font-bold text-lg">{formatCurrency(Number(order.totalAmount))}</p>
                  </div>
                </div>
              </div>

              {/* Order items (expandable) */}
              <OrderDetailsAccordion
                items={order.items.map((item: {
                  id: string; enteredQuantity: unknown; enteredUnit: string;
                  convertedQuantity: unknown; pricePerUnit: unknown; lineTotal: unknown;
                  product: { name: string; baseUnit: string; sku: string };
                }) => ({
                  id: item.id,
                  productName:      item.product.name,
                  productSku:       item.product.sku,
                  productBaseUnit:  item.product.baseUnit,
                  enteredQuantity:  Number(item.enteredQuantity),
                  enteredUnit:      item.enteredUnit,
                  convertedQuantity: Number(item.convertedQuantity),
                  pricePerUnit:     Number(item.pricePerUnit),
                  lineTotal:        Number(item.lineTotal),
                }))}
              />
            </Card>
          );
        })}

        {orders.length === 0 && (
          <Card>
            <CardContent className="py-16 text-center">
              <Boxes className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
              <p className="font-medium text-muted-foreground">No orders found</p>
              <p className="text-sm text-muted-foreground mt-1">
                {statusFilter
                  ? `No ${statusFilter.toLowerCase()} orders`
                  : "You haven't placed any orders yet"}
              </p>
              <Button asChild className="mt-4">
                <Link href="/dashboard/quotation">Place your first order</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <a
                href={`/dashboard/orders?${statusFilter ? `status=${statusFilter}&` : ""}page=${page - 1}`}
                className="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-sm hover:bg-muted"
              >
                Previous
              </a>
            )}
            {page < totalPages && (
              <a
                href={`/dashboard/orders?${statusFilter ? `status=${statusFilter}&` : ""}page=${page + 1}`}
                className="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-sm hover:bg-muted"
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
