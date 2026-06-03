"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { formatCurrency } from "@/lib/units";

interface OrderItem {
  id: string;
  productName: string;
  productSku: string;
  productBaseUnit: string;
  enteredQuantity: number;
  enteredUnit: string;
  convertedQuantity: number;
  pricePerUnit: number;
  lineTotal: number;
}

export function OrderDetailsAccordion({ items }: { items: OrderItem[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-3 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/20 transition-colors"
      >
        <span>{items.length} item{items.length !== 1 ? "s" : ""}</span>
        {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>

      {open && (
        <div className="overflow-x-auto border-t">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/20">
                <th className="px-4 py-2.5 text-left font-medium text-muted-foreground text-xs">Product</th>
                <th className="px-4 py-2.5 text-center font-medium text-muted-foreground text-xs">Entered</th>
                <th className="px-4 py-2.5 text-center font-medium text-muted-foreground text-xs">Converted</th>
                <th className="px-4 py-2.5 text-right font-medium text-muted-foreground text-xs">Price/Unit</th>
                <th className="px-4 py-2.5 text-right font-medium text-muted-foreground text-xs">Line Total</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-muted/10">
                  <td className="px-4 py-2.5">
                    <p className="font-medium">{item.productName}</p>
                    <p className="text-xs text-muted-foreground font-mono">{item.productSku}</p>
                  </td>
                  <td className="px-4 py-2.5 text-center font-mono text-xs">
                    {item.enteredQuantity} {item.enteredUnit}
                  </td>
                  <td className="px-4 py-2.5 text-center font-mono text-xs text-muted-foreground">
                    {item.convertedQuantity.toFixed(4)} {item.productBaseUnit}
                  </td>
                  <td className="px-4 py-2.5 text-right text-xs">
                    {formatCurrency(item.pricePerUnit)}/{item.productBaseUnit}
                  </td>
                  <td className="px-4 py-2.5 text-right font-semibold">
                    {formatCurrency(item.lineTotal)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
