"use client";

import { useActionState, useState, useEffect } from "react";
import { Pencil } from "lucide-react";
import { updateStock } from "@/actions/products";
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
import { useToast } from "@/hooks/use-toast";

interface InventoryUpdateDialogProps {
  product: {
    id: string;
    name: string;
    stockQuantity: number;
    baseUnit: string;
  };
}

export function InventoryUpdateDialog({ product }: InventoryUpdateDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const [state, formAction, pending] = useActionState(updateStock, undefined);

  useEffect(() => {
    if (state?.success) {
      toast({ title: "Updated", description: state.message, variant: "success" });
      setOpen(false);
    }
  }, [state?.success, state?.message, toast]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Pencil className="h-3.5 w-3.5" />
          Update
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Update Stock — {product.name}</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="productId" value={product.id} />

          {state?.message && !state.success && (
            <p className="text-sm text-destructive">{state.message}</p>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="stockQuantity">
              New Stock Quantity ({product.baseUnit})
            </Label>
            <Input
              id="stockQuantity"
              name="stockQuantity"
              type="number"
              step="0.01"
              min="0"
              defaultValue={product.stockQuantity}
              required
            />
            <p className="text-xs text-muted-foreground">
              Current: {product.stockQuantity} {product.baseUnit}
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving..." : "Update Stock"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
