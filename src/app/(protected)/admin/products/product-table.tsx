"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteProduct, toggleProductActive } from "@/actions/products";
import { formatCurrency, formatBaseQuantity } from "@/lib/units";
import { useToast } from "@/hooks/use-toast";
import { ProductFormDialog } from "./product-form-dialog";

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  baseUnit: "g" | "mL" | "item";
  pricePerBaseUnit: number;
  stockQuantity: number;
  isActive: boolean;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface ProductTableProps {
  products: Product[];
  totalPages: number;
  currentPage: number;
  categories: string[];
  currentSearch: string;
  currentCategory: string;
  currentUnit: string;
}

export function ProductTable({
  products,
  totalPages,
  currentPage,
  categories,
  currentSearch,
  currentCategory,
  currentUnit,
}: ProductTableProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [searchValue, setSearchValue] = useState(currentSearch);

  function applyFilter(key: string, value: string) {
    const params = new URLSearchParams();
    if (searchValue) params.set("search", searchValue);
    if (currentCategory) params.set("category", currentCategory);
    if (currentUnit) params.set("unit", currentUnit);
    params.set(key, value);
    params.set("page", "1");
    router.push(`/admin/products?${params.toString()}`);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchValue) params.set("search", searchValue);
    if (currentCategory) params.set("category", currentCategory);
    if (currentUnit) params.set("unit", currentUnit);
    params.set("page", "1");
    router.push(`/admin/products?${params.toString()}`);
  }

  function handleDelete(productId: string) {
    startTransition(async () => {
      const result = await deleteProduct(productId);
      if (result.error) {
        toast({ title: "Error", description: result.error, variant: "destructive" });
      } else {
        toast({ title: "Deleted", description: "Product removed.", variant: "success" });
      }
    });
  }

  function handleToggleActive(productId: string, isActive: boolean) {
    startTransition(async () => {
      await toggleProductActive(productId, !isActive);
      toast({
        title: !isActive ? "Activated" : "Deactivated",
        description: `Product ${!isActive ? "is now visible" : "is hidden"} to users.`,
      });
    });
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex gap-2 flex-1">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search name, SKU, category..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button type="submit" size="sm">Search</Button>
            </form>

            {/* Category filter */}
            <select
              value={currentCategory}
              onChange={(e) => applyFilter("category", e.target.value)}
              className="h-9 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            {/* Unit filter */}
            <select
              value={currentUnit}
              onChange={(e) => applyFilter("unit", e.target.value)}
              className="h-9 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">All Units</option>
              <option value="g">Weight (g/kg)</option>
              <option value="mL">Volume (mL/L)</option>
              <option value="item">Count (item)</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Product</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">SKU</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Category</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Base Unit</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Price/Unit</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Stock</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium">{product.name}</p>
                        {product.description && (
                          <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {product.description}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      {product.sku}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="secondary">{product.category}</Badge>
                    </td>
                    <td className="px-4 py-3 font-medium">{product.baseUnit}</td>
                    <td className="px-4 py-3 text-right font-semibold">
                      {formatCurrency(product.pricePerBaseUnit)}
                      <span className="text-xs text-muted-foreground font-normal">/{product.baseUnit}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm">
                        {formatBaseQuantity(product.stockQuantity, product.baseUnit)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggleActive(product.id, product.isActive)}
                        disabled={isPending}
                        className="flex items-center gap-1.5 text-xs"
                      >
                        {product.isActive ? (
                          <>
                            <ToggleRight className="h-4 w-4 text-emerald-500" />
                            <Badge variant="success">Active</Badge>
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                            <Badge variant="secondary">Inactive</Badge>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <ProductFormDialog mode="edit" product={product}>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                        </ProductFormDialog>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-destructive">
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete product?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete <strong>{product.name}</strong>. This action cannot be undone. Products with existing orders cannot be deleted.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                onClick={() => handleDelete(product.id)}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">
                      No products found. Try adjusting your filters.
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
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => {
                const params = new URLSearchParams();
                if (currentSearch) params.set("search", currentSearch);
                if (currentCategory) params.set("category", currentCategory);
                if (currentUnit) params.set("unit", currentUnit);
                params.set("page", String(currentPage - 1));
                router.push(`/admin/products?${params.toString()}`);
              }}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => {
                const params = new URLSearchParams();
                if (currentSearch) params.set("search", currentSearch);
                if (currentCategory) params.set("category", currentCategory);
                if (currentUnit) params.set("unit", currentUnit);
                params.set("page", String(currentPage + 1));
                router.push(`/admin/products?${params.toString()}`);
              }}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
