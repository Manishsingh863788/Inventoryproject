import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/page-header";
import { ProductBrowser } from "./product-browser";

export const metadata: Metadata = { title: "Browse Products" };

interface ProductsPageProps {
  searchParams: Promise<{
    search?: string;
    category?: string;
    unit?: string;
    sort?: string;
    page?: string;
  }>;
}

const PAGE_SIZE = 12;

export default async function UserProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const search   = params.search   ?? "";
  const category = params.category ?? "";
  const unit     = params.unit     ?? "";
  const sort     = params.sort     ?? "name";
  const page     = parseInt(params.page ?? "1");

  const sortMap: Record<string, object> = {
    name:       { name: "asc" },
    price_asc:  { pricePerBaseUnit: "asc" },
    price_desc: { pricePerBaseUnit: "desc" },
    newest:     { createdAt: "desc" },
  };

  const where = {
    isActive: true,
    AND: [
      search
        ? {
            OR: [
              { name:     { contains: search, mode: "insensitive" as const } },
              { sku:      { contains: search, mode: "insensitive" as const } },
              { category: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {},
      category ? { category: { equals: category, mode: "insensitive" as const } } : {},
      unit     ? { baseUnit: unit as "g" | "mL" | "item" }                        : {},
    ],
  };

  const [products, totalCount, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: sortMap[sort] ?? { name: "asc" },
      skip:    (page - 1) * PAGE_SIZE,
      take:    PAGE_SIZE,
    }),
    prisma.product.count({ where }),
    prisma.product.findMany({
      where:    { isActive: true },
      select:   { category: true },
      distinct: ["category"],
      orderBy:  { category: "asc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Browse Products"
        description={`${totalCount} product${totalCount !== 1 ? "s" : ""} available`}
      />
      <ProductBrowser
        products={(products as Array<{
          id: string; name: string; sku: string; description: string | null;
          category: string; baseUnit: "g" | "mL" | "item";
          pricePerBaseUnit: unknown; stockQuantity: unknown; isActive: boolean;
          createdAt: Date; updatedAt: Date;
        }>).map((p) => ({
          ...p,
          pricePerBaseUnit: Number(p.pricePerBaseUnit),
          stockQuantity:    Number(p.stockQuantity),
        }))}
        totalPages={Math.ceil(totalCount / PAGE_SIZE)}
        currentPage={page}
        categories={(categories as Array<{ category: string }>).map((c) => c.category)}
        currentSearch={search}
        currentCategory={category}
        currentUnit={unit}
        currentSort={sort}
      />
    </div>
  );
}
