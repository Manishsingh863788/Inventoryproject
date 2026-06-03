"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search, SlidersHorizontal, ChevronLeft, ChevronRight,
  Package, ShoppingCart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, getAvailableUnits } from "@/lib/units";
import type { BaseUnit } from "@/lib/units";

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

interface ProductBrowserProps {
  products: Product[];
  totalPages: number;
  currentPage: number;
  categories: string[];
  currentSearch: string;
  currentCategory: string;
  currentUnit: string;
  currentSort: string;
}

export function ProductBrowser({
  products, totalPages, currentPage,
  categories, currentSearch, currentCategory,
  currentUnit, currentSort,
}: ProductBrowserProps) {
  const router = useRouter();
  const [search, setSearch] = useState(currentSearch);
  const [showFilters, setShowFilters] = useState(false);

  function buildUrl(overrides: Record<string, string>) {
    const p = new URLSearchParams();
    const vals = { search, category: currentCategory, unit: currentUnit, sort: currentSort, page: "1", ...overrides };
    Object.entries(vals).forEach(([k, v]) => { if (v) p.set(k, v); });
    return `/dashboard/products?${p.toString()}`;
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    router.push(buildUrl({ search, page: "1" }));
  }

  return (
    <div className="space-y-4">
      {/* Search + filter bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products, SKU, category…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button type="submit" size="sm">Search</Button>
        </form>

        <Button
          variant="outline" size="sm"
          className="gap-2"
          onClick={() => setShowFilters(!showFilters)}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </Button>
      </div>

      {/* Expandable filters */}
      {showFilters && (
        <Card>
          <CardContent className="p-4 flex flex-wrap gap-4">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Category</p>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => router.push(buildUrl({ category: "" }))}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                    !currentCategory ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
                  }`}
                >All</button>
                {categories.map((c) => (
                  <button
                    key={c}
                    onClick={() => router.push(buildUrl({ category: c }))}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                      currentCategory === c ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
                    }`}
                  >{c}</button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Unit</p>
              <div className="flex gap-1.5">
                {[["", "All"], ["g", "Weight"], ["mL", "Volume"], ["item", "Count"]].map(([v, l]) => (
                  <button
                    key={v}
                    onClick={() => router.push(buildUrl({ unit: v }))}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                      currentUnit === v ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
                    }`}
                  >{l}</button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Sort</p>
              <div className="flex gap-1.5">
                {[
                  ["name", "Name"],
                  ["price_asc", "Price ↑"],
                  ["price_desc", "Price ↓"],
                  ["newest", "Newest"],
                ].map(([v, l]) => (
                  <button
                    key={v}
                    onClick={() => router.push(buildUrl({ sort: v }))}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                      currentSort === v ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
                    }`}
                  >{l}</button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Products grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {products.map((p) => {
          const units = getAvailableUnits(p.baseUnit as BaseUnit);
          const inStock = p.stockQuantity > 0;
          return (
            <Card key={p.id} className="group hover:shadow-md transition-all duration-200 flex flex-col">
              <CardContent className="p-5 flex flex-col flex-1">
                {/* Category badge */}
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="secondary" className="text-xs">{p.category}</Badge>
                  {inStock
                    ? <Badge variant="success" className="text-xs">In Stock</Badge>
                    : <Badge variant="destructive" className="text-xs">Out of Stock</Badge>
                  }
                </div>

                {/* Icon placeholder */}
                <div className="flex items-center justify-center h-20 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 rounded-xl mb-4 group-hover:from-indigo-100 group-hover:to-purple-100 transition-colors">
                  <Package className="h-8 w-8 text-indigo-400" />
                </div>

                {/* Details */}
                <div className="flex-1">
                  <h3 className="font-semibold truncate">{p.name}</h3>
                  <p className="text-xs text-muted-foreground font-mono mt-0.5">{p.sku}</p>
                  {p.description && (
                    <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">{p.description}</p>
                  )}
                </div>

                {/* Price + units */}
                <div className="mt-4 pt-3 border-t space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Price</span>
                    <span className="font-bold text-primary">
                      {formatCurrency(p.pricePerBaseUnit)}
                      <span className="text-xs font-normal text-muted-foreground">/{p.baseUnit}</span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Available units</span>
                    <span className="text-xs font-medium">{units.join(", ")}</span>
                  </div>
                </div>

                {/* Add to order button */}
                <Button
                  asChild
                  variant={inStock ? "default" : "outline"}
                  size="sm"
                  disabled={!inStock}
                  className="mt-3 w-full gap-2"
                >
                  <Link href={`/dashboard/quotation?add=${p.id}`}>
                    <ShoppingCart className="h-3.5 w-3.5" />
                    {inStock ? "Add to Order" : "Out of Stock"}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}

        {products.length === 0 && (
          <div className="col-span-full py-16 text-center text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No products found</p>
            <p className="text-sm mt-1">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline" size="sm"
            disabled={currentPage <= 1}
            onClick={() => router.push(buildUrl({ page: String(currentPage - 1) }))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground px-2">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline" size="sm"
            disabled={currentPage >= totalPages}
            onClick={() => router.push(buildUrl({ page: String(currentPage + 1) }))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
