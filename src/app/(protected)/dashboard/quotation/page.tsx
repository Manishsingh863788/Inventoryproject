import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/page-header";
import { QuotationBuilder } from "./quotation-builder";

export const metadata: Metadata = { title: "New Order" };

interface QuotationPageProps {
  searchParams: Promise<{ add?: string }>;
}

export default async function QuotationPage({ searchParams }: QuotationPageProps) {
  const params = await searchParams;

  const products = await prisma.product.findMany({
    where:   { isActive: true },
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="New Order"
        description="Select products, choose quantities and units, then confirm your order."
      />
      <QuotationBuilder
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
        preAddId={params.add}
      />
    </div>
  );
}
