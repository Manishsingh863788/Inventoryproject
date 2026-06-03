import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatBaseQuantity } from "@/lib/units";
import { InventoryUpdateDialog } from "./inventory-update-dialog";
import type { ProductRow } from "@/lib/types";

export const metadata: Metadata = { title: "Inventory" };

export default async function InventoryPage() {
  const products = (await prisma.product.findMany({
    orderBy: [{ category: "asc" }, { name: "asc" }],
  })) as unknown as ProductRow[];

  const totalValue = products.reduce(
    (acc: number, p: { stockQuantity: unknown; pricePerBaseUnit: unknown }) =>
      acc + Number(p.stockQuantity) * Number(p.pricePerBaseUnit),
    0
  );

  // Group by category
  const grouped: Record<string, typeof products> = {};
  for (const p of products) {
    if (!grouped[p.category]) grouped[p.category] = [];
    grouped[p.category].push(p);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory"
        description="Manage stock levels across all products"
      >
        <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/30 px-4 py-2 text-center">
          <p className="text-xs text-muted-foreground">Total Value</p>
          <p className="text-lg font-bold text-emerald-700 dark:text-emerald-400">
            {formatCurrency(totalValue)}
          </p>
        </div>
      </PageHeader>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total SKUs", value: products.length },
          { label: "Active", value: products.filter((p: {isActive:boolean}) => p.isActive).length },
          { label: "Low Stock", value: products.filter((p: {stockQuantity:unknown}) => Number(p.stockQuantity) < 100 && Number(p.stockQuantity) > 0).length },
          { label: "Out of Stock", value: products.filter((p: {stockQuantity:unknown}) => Number(p.stockQuantity) === 0).length },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Inventory by category */}
      {Object.entries(grouped).map(([category, items]) => (
        <Card key={category}>
          <div className="px-6 py-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="font-semibold">{category}</h2>
              <Badge variant="secondary">{items.length} items</Badge>
            </div>
          </div>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/30">
                    <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Product</th>
                    <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">SKU</th>
                    <th className="px-4 py-2.5 text-right font-medium text-muted-foreground">Stock (Base)</th>
                    <th className="px-4 py-2.5 text-right font-medium text-muted-foreground">Display</th>
                    <th className="px-4 py-2.5 text-right font-medium text-muted-foreground">Price/Unit</th>
                    <th className="px-4 py-2.5 text-right font-medium text-muted-foreground">Value</th>
                    <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Status</th>
                    <th className="px-4 py-2.5 text-right font-medium text-muted-foreground">Update</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {items.map((product) => {
                    const stockNum = Number(product.stockQuantity);
                    const priceNum = Number(product.pricePerBaseUnit);
                    const value = stockNum * priceNum;
                    const isLow = stockNum < 100 && stockNum > 0;
                    const isOut = stockNum === 0;

                    return (
                      <tr key={product.id} className="hover:bg-muted/20">
                        <td className="px-4 py-3 font-medium">{product.name}</td>
                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{product.sku}</td>
                        <td className="px-4 py-3 text-right font-mono text-sm">
                          {stockNum} {product.baseUnit}
                        </td>
                        <td className="px-4 py-3 text-right text-sm text-muted-foreground">
                          {formatBaseQuantity(stockNum, product.baseUnit)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {formatCurrency(priceNum)}/{product.baseUnit}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold">
                          {formatCurrency(value)}
                        </td>
                        <td className="px-4 py-3">
                          {isOut ? (
                            <Badge variant="destructive">Out of Stock</Badge>
                          ) : isLow ? (
                            <Badge variant="warning">Low Stock</Badge>
                          ) : (
                            <Badge variant="success">In Stock</Badge>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <InventoryUpdateDialog product={{ id: product.id, name: product.name, stockQuantity: stockNum, baseUnit: product.baseUnit }} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ))}

      {products.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No products found. Add products to manage inventory.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
