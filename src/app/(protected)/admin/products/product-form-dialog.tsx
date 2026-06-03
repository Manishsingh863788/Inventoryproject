"use client";

import { useActionState, useState, useEffect } from "react";
import { createProduct, updateProduct } from "@/actions/products";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: string;
  name: string;
  sku: string;
  description: string | null;
  category: string;
  baseUnit: "g" | "mL" | "item";
  pricePerBaseUnit: number;
  stockQuantity: number;
  isActive: boolean;
}

interface ProductFormDialogProps {
  mode: "create" | "edit";
  product?: Product;
  children: React.ReactNode;
}

export function ProductFormDialog({ mode, product, children }: ProductFormDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const action = mode === "create"
    ? createProduct
    : updateProduct.bind(null, product!.id);

  const [state, formAction, pending] = useActionState(action, undefined);

  useEffect(() => {
    if (state?.success) {
      toast({ title: "Success", description: state.message, variant: "success" });
      setOpen(false);
    }
  }, [state?.success, state?.message, toast]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Add New Product" : "Edit Product"}
          </DialogTitle>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          {state?.message && !state.success && (
            <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">
              {state.message}
            </p>
          )}

          {/* Name */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5 col-span-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                name="name"
                defaultValue={product?.name}
                placeholder="e.g. Ethanol 99%"
                className={cn(state?.errors?.name && "border-destructive")}
                required
              />
              {state?.errors?.name && (
                <p className="text-xs text-destructive">{state.errors.name[0]}</p>
              )}
            </div>

            {/* SKU */}
            <div className="space-y-1.5">
              <Label htmlFor="sku">SKU *</Label>
              <Input
                id="sku"
                name="sku"
                defaultValue={product?.sku}
                placeholder="ETH-99"
                className={cn(state?.errors?.sku && "border-destructive")}
                required
              />
              {state?.errors?.sku && (
                <p className="text-xs text-destructive">{state.errors.sku[0]}</p>
              )}
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <Label htmlFor="category">Category *</Label>
              <Input
                id="category"
                name="category"
                defaultValue={product?.category}
                placeholder="Chemicals"
                className={cn(state?.errors?.category && "border-destructive")}
                required
              />
              {state?.errors?.category && (
                <p className="text-xs text-destructive">{state.errors.category[0]}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              name="description"
              defaultValue={product?.description ?? ""}
              placeholder="Optional product description..."
              rows={2}
              className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            {/* Base Unit */}
            <div className="space-y-1.5">
              <Label htmlFor="baseUnit">Base Unit *</Label>
              <select
                id="baseUnit"
                name="baseUnit"
                defaultValue={product?.baseUnit ?? "g"}
                className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                required
              >
                <option value="g">g (gram)</option>
                <option value="mL">mL (milliliter)</option>
                <option value="item">item</option>
              </select>
              {state?.errors?.baseUnit && (
                <p className="text-xs text-destructive">{state.errors.baseUnit[0]}</p>
              )}
            </div>

            {/* Price per base unit */}
            <div className="space-y-1.5">
              <Label htmlFor="pricePerBaseUnit">Price/Unit (₹) *</Label>
              <Input
                id="pricePerBaseUnit"
                name="pricePerBaseUnit"
                type="number"
                step="0.01"
                min="0.01"
                defaultValue={product?.pricePerBaseUnit}
                placeholder="0.50"
                className={cn(state?.errors?.pricePerBaseUnit && "border-destructive")}
                required
              />
              {state?.errors?.pricePerBaseUnit && (
                <p className="text-xs text-destructive">{state.errors.pricePerBaseUnit[0]}</p>
              )}
            </div>

            {/* Stock */}
            <div className="space-y-1.5">
              <Label htmlFor="stockQuantity">Stock *</Label>
              <Input
                id="stockQuantity"
                name="stockQuantity"
                type="number"
                step="0.01"
                min="0"
                defaultValue={product?.stockQuantity}
                placeholder="0"
                className={cn(state?.errors?.stockQuantity && "border-destructive")}
                required
              />
              {state?.errors?.stockQuantity && (
                <p className="text-xs text-destructive">{state.errors.stockQuantity[0]}</p>
              )}
            </div>
          </div>

          {/* Active toggle */}
          <div className="flex items-center gap-3">
            <input
              type="hidden"
              name="isActive"
              value="false"
            />
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              value="true"
              defaultChecked={product?.isActive ?? true}
              className="h-4 w-4 rounded border-input accent-primary"
            />
            <Label htmlFor="isActive" className="cursor-pointer">
              Active (visible to users)
            </Label>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving..." : mode === "create" ? "Create Product" : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
