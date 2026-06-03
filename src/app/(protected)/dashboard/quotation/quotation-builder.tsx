"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Plus, Trash2, ShoppingCart, Package,
  ArrowRight, CheckCircle2, Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  convertToBaseUnit, calculatePrice, getAvailableUnits, formatCurrency,
} from "@/lib/units";
import type { BaseUnit, AnyUnit } from "@/lib/units";
import { createOrder } from "@/actions/orders";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  baseUnit: "g" | "mL" | "item";
  pricePerBaseUnit: number;
  stockQuantity: number;
  description: string | null;
}

interface QuotationItem {
  productId: string;
  product: Product;
  enteredQuantity: string;
  enteredUnit: AnyUnit;
}

interface QuotationBuilderProps {
  products: Product[];
  preAddId?: string;
}

export function QuotationBuilder({ products, preAddId }: QuotationBuilderProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [items, setItems] = useState<QuotationItem[]>([]);
  const [search, setSearch] = useState("");
  const [step, setStep] = useState<"build" | "review">("build");

  // Pre-add product if coming from product browse
  useEffect(() => {
    if (preAddId) {
      const p = products.find((pr) => pr.id === preAddId);
      if (p && !items.find((i) => i.productId === p.id)) {
        addProduct(p);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preAddId]);

  const filteredProducts = products.filter(
    (p) =>
      !items.find((i) => i.productId === p.id) &&
      (search === "" ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase()))
  );

  function addProduct(p: Product) {
    const units = getAvailableUnits(p.baseUnit as BaseUnit);
    setItems((prev) => [
      ...prev,
      {
        productId: p.id,
        product: p,
        enteredQuantity: "1",
        enteredUnit: units[0],
      },
    ]);
  }

  function removeItem(productId: string) {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }

  function updateQuantity(productId: string, qty: string) {
    setItems((prev) =>
      prev.map((i) => (i.productId === productId ? { ...i, enteredQuantity: qty } : i))
    );
  }

  function updateUnit(productId: string, unit: AnyUnit) {
    setItems((prev) =>
      prev.map((i) => (i.productId === productId ? { ...i, enteredUnit: unit } : i))
    );
  }

  // Compute line totals
  const computedItems = items.map((item) => {
    const qty      = parseFloat(item.enteredQuantity) || 0;
    const baseQty  = convertToBaseUnit(qty, item.enteredUnit);
    const price    = calculatePrice(qty, item.enteredUnit, item.product.pricePerBaseUnit);
    return { ...item, qty, baseQty, lineTotal: price };
  });

  const grandTotal = computedItems.reduce((s, i) => s + i.lineTotal, 0);

  function handlePlaceOrder() {
    const orderItems = computedItems.map((i) => ({
      productId:       i.productId,
      enteredQuantity: String(i.qty),
      enteredUnit:     i.enteredUnit,
    }));

    const formData = new FormData();
    formData.set("items", JSON.stringify(orderItems));

    startTransition(async () => {
      const result = await createOrder(undefined, formData);
      if (result?.success) {
        toast({
          title: "Order placed!",
          description: `Your order has been submitted for review.`,
          variant: "success",
        });
        router.push("/dashboard/orders");
      } else {
        toast({
          title: "Failed",
          description: result?.message ?? "Something went wrong",
          variant: "destructive",
        });
      }
    });
  }

  // ── Step: Build ──────────────────────────────────────────────────────────
  if (step === "build") {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product selector */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Package className="h-4 w-4" /> Select Products
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="max-h-80 overflow-y-auto space-y-1 pr-1">
                {filteredProducts.length === 0 && (
                  <p className="text-sm text-center text-muted-foreground py-6">
                    {search ? "No products match your search" : "All products already added"}
                  </p>
                )}
                {filteredProducts.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => addProduct(p)}
                    disabled={p.stockQuantity === 0}
                    className="w-full flex items-center justify-between rounded-lg border px-3 py-2.5 text-left hover:bg-muted/40 hover:border-primary/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center shrink-0">
                        <Package className="h-4 w-4 text-indigo-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{p.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {p.category} · {formatCurrency(p.pricePerBaseUnit)}/{p.baseUnit}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {p.stockQuantity > 0
                        ? <Badge variant="success" className="text-xs">In Stock</Badge>
                        : <Badge variant="destructive" className="text-xs">Out</Badge>
                      }
                      <Plus className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Selected items table */}
          {items.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Order Items ({items.length})</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Product</th>
                      <th className="px-4 py-2.5 text-center font-medium text-muted-foreground">Qty</th>
                      <th className="px-4 py-2.5 text-center font-medium text-muted-foreground">Unit</th>
                      <th className="px-4 py-2.5 text-right font-medium text-muted-foreground">Converted</th>
                      <th className="px-4 py-2.5 text-right font-medium text-muted-foreground">Line Total</th>
                      <th className="px-4 py-2.5" />
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {computedItems.map((item) => {
                      const units = getAvailableUnits(item.product.baseUnit as BaseUnit);
                      return (
                        <tr key={item.productId} className="hover:bg-muted/10">
                          <td className="px-4 py-3">
                            <p className="font-medium">{item.product.name}</p>
                            <p className="text-xs text-muted-foreground">{item.product.sku}</p>
                          </td>
                          <td className="px-4 py-3">
                            <Input
                              type="number"
                              min="0.01"
                              step="0.01"
                              value={item.enteredQuantity}
                              onChange={(e) => updateQuantity(item.productId, e.target.value)}
                              className="w-24 mx-auto text-center h-8"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <select
                              value={item.enteredUnit}
                              onChange={(e) => updateUnit(item.productId, e.target.value as AnyUnit)}
                              className="h-8 rounded-lg border border-input bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring mx-auto block"
                            >
                              {units.map((u) => (
                                <option key={u} value={u}>{u}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-4 py-3 text-right text-muted-foreground text-xs">
                            {item.baseQty.toFixed(2)} {item.product.baseUnit}
                          </td>
                          <td className="px-4 py-3 text-right font-semibold">
                            {formatCurrency(item.lineTotal)}
                          </td>
                          <td className="px-4 py-3">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:text-destructive"
                              onClick={() => removeItem(item.productId)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Summary panel */}
        <div className="space-y-4">
          <Card className="sticky top-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" /> Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Add products to see the summary
                </p>
              ) : (
                <>
                  <div className="space-y-2">
                    {computedItems.map((item) => (
                      <div key={item.productId} className="flex justify-between text-sm">
                        <span className="text-muted-foreground truncate max-w-[140px]">
                          {item.product.name}
                          <span className="block text-xs">
                            {item.qty} {item.enteredUnit} → {item.baseQty.toFixed(2)} {item.product.baseUnit}
                          </span>
                        </span>
                        <span className="font-medium shrink-0">{formatCurrency(item.lineTotal)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-3">
                    <div className="flex justify-between font-bold text-base">
                      <span>Grand Total</span>
                      <span className="text-primary">{formatCurrency(grandTotal)}</span>
                    </div>
                  </div>

                  <Button
                    className="w-full gap-2"
                    onClick={() => setStep("review")}
                    disabled={computedItems.some((i) => i.qty <= 0)}
                  >
                    Review Order
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ── Step: Review & Confirm ───────────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            Confirm Your Order
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Quotation preview table */}
          <div className="rounded-xl border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/40">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Product</th>
                  <th className="px-4 py-3 text-center font-medium text-muted-foreground">Entered</th>
                  <th className="px-4 py-3 text-center font-medium text-muted-foreground">Converted</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Line Total</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {computedItems.map((item) => (
                  <tr key={item.productId}>
                    <td className="px-4 py-3">
                      <p className="font-medium">{item.product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(item.product.pricePerBaseUnit)}/{item.product.baseUnit}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-center font-mono text-sm">
                      {item.qty} {item.enteredUnit}
                    </td>
                    <td className="px-4 py-3 text-center font-mono text-sm text-muted-foreground">
                      {item.baseQty.toFixed(4)} {item.product.baseUnit}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">
                      {formatCurrency(item.lineTotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-muted/20 border-t-2">
                  <td colSpan={3} className="px-4 py-3 font-bold text-right">Grand Total</td>
                  <td className="px-4 py-3 font-bold text-right text-primary text-base">
                    {formatCurrency(grandTotal)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <p className="text-xs text-muted-foreground bg-muted/40 rounded-lg p-3">
            After placing this order, it will be sent to an admin for approval.
            You can track its status in <strong>My Orders</strong>.
          </p>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep("build")} className="flex-1">
              ← Back
            </Button>
            <Button
              onClick={handlePlaceOrder}
              disabled={isPending}
              className="flex-1 gap-2"
            >
              {isPending ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/40 border-t-primary-foreground" />
                  Placing order…
                </>
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4" />
                  Place Order
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
