import type { Metadata } from "next";
import { Plus, Search } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/page-header";
import { ProductTable } from "./product-table";
import { ProductFormDialog } from "./product-form-dialog";

export const metadata: Metadata = { title: "Products" };

interface ProductsPageProps {
  searchParams: Promise<{
    search?: string;
    category?: string;
    unit?: string;
    page?: string;
  }>;
}

const PAGE_SIZE = 10;

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  // Next.js 16: searchParams is a Promise — must await
  const params = await searchParams;
  const search = params.search ?? "";
  const category = params.category ?? "";
  const unit = params.unit ?? "";
  const page = parseInt(params.page ?? "1");

  const where = {
    AND: [
      search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" as const } },
              { sku: { contains: search, mode: "insensitive" as const } },
              { category: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {},
      category ? { category: { equals: category, mode: "insensitive" as const } } : {},
      unit ? { baseUnit: unit as "g" | "mL" | "item" } : {},
    ],
  };

  const [products, totalCount, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.product.count({ where }),
    prisma.product.findMany({
      select: { category: true },
      distinct: ["category"],
      orderBy: { category: "asc" },
    }),
  ]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const categoryList = (categories as Array<{ category: string }>).map((c) => c.category);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Products"
        description={`${totalCount} product${totalCount !== 1 ? "s" : ""} total`}
      >
        <ProductFormDialog mode="create">
          <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors">
            <Plus className="h-4 w-4" />
            Add Product
          </button>
        </ProductFormDialog>
      </PageHeader>

      <ProductTable
        products={(products as Array<{
          id: string; name: string; sku: string; description: string | null;
          category: string; baseUnit: "g" | "mL" | "item";
          pricePerBaseUnit: unknown; stockQuantity: unknown;
          isActive: boolean; createdAt: Date; updatedAt: Date;
        }>).map((p) => ({
          ...p,
          pricePerBaseUnit: Number(p.pricePerBaseUnit),
          stockQuantity:    Number(p.stockQuantity),
        }))}
        totalPages={totalPages}
        currentPage={page}
        categories={categoryList}
        currentSearch={search}
        currentCategory={category}
        currentUnit={unit}
      />
    </div>
  );
}
