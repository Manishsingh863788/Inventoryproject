"use server";

/**
 * Product Server Actions (Admin only)
 */
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { ProductSchema, UpdateStockSchema } from "@/lib/validations";

export type ProductState =
  | {
      errors?: Record<string, string[]>;
      message?: string;
      success?: boolean;
    }
  | undefined;

// ─── Guard: Admin only ────────────────────────────────────────────────────
async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    throw new Error("Unauthorized: Admin access required");
  }
  return session;
}

// ─── Create Product ───────────────────────────────────────────────────────

export async function createProduct(
  _prev: ProductState,
  formData: FormData
): Promise<ProductState> {
  await requireAdmin();

  const raw = {
    name: formData.get("name") as string,
    description: formData.get("description") as string,
    sku: formData.get("sku") as string,
    category: formData.get("category") as string,
    baseUnit: formData.get("baseUnit") as string,
    pricePerBaseUnit: formData.get("pricePerBaseUnit") as string,
    stockQuantity: formData.get("stockQuantity") as string,
    isActive: formData.get("isActive") === "true",
  };

  const validated = ProductSchema.safeParse(raw);
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const d = validated.data;

  try {
    await prisma.product.create({
      data: {
        name: d.name,
        description: d.description || null,
        sku: d.sku,
        category: d.category,
        baseUnit: d.baseUnit as "g" | "mL" | "item",
        pricePerBaseUnit: parseFloat(d.pricePerBaseUnit),
        stockQuantity: parseFloat(d.stockQuantity),
        isActive: d.isActive,
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    if (msg.includes("Unique constraint") || msg.includes("unique")) {
      return { errors: { sku: ["A product with this SKU already exists"] } };
    }
    return { message: "Failed to create product. Please try again." };
  }

  revalidatePath("/admin/products");
  revalidatePath("/admin");
  return { success: true, message: "Product created successfully!" };
}

// ─── Update Product ───────────────────────────────────────────────────────

export async function updateProduct(
  productId: string,
  _prev: ProductState,
  formData: FormData
): Promise<ProductState> {
  await requireAdmin();

  const raw = {
    name: formData.get("name") as string,
    description: formData.get("description") as string,
    sku: formData.get("sku") as string,
    category: formData.get("category") as string,
    baseUnit: formData.get("baseUnit") as string,
    pricePerBaseUnit: formData.get("pricePerBaseUnit") as string,
    stockQuantity: formData.get("stockQuantity") as string,
    isActive: formData.get("isActive") === "true",
  };

  const validated = ProductSchema.safeParse(raw);
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const d = validated.data;

  try {
    await prisma.product.update({
      where: { id: productId },
      data: {
        name: d.name,
        description: d.description || null,
        sku: d.sku,
        category: d.category,
        baseUnit: d.baseUnit as "g" | "mL" | "item",
        pricePerBaseUnit: parseFloat(d.pricePerBaseUnit),
        stockQuantity: parseFloat(d.stockQuantity),
        isActive: d.isActive,
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    if (msg.includes("Unique constraint") || msg.includes("unique")) {
      return { errors: { sku: ["A product with this SKU already exists"] } };
    }
    return { message: "Failed to update product. Please try again." };
  }

  revalidatePath("/admin/products");
  revalidatePath("/admin");
  return { success: true, message: "Product updated successfully!" };
}

// ─── Delete Product ───────────────────────────────────────────────────────

export async function deleteProduct(productId: string): Promise<{ error?: string; success?: boolean }> {
  await requireAdmin();

  try {
    await prisma.product.delete({ where: { id: productId } });
  } catch {
    return { error: "Failed to delete product. It may be referenced by orders." };
  }

  revalidatePath("/admin/products");
  revalidatePath("/admin");
  return { success: true };
}

// ─── Toggle Active ────────────────────────────────────────────────────────

export async function toggleProductActive(productId: string, isActive: boolean): Promise<void> {
  await requireAdmin();
  await prisma.product.update({ where: { id: productId }, data: { isActive } });
  revalidatePath("/admin/products");
}

// ─── Update Stock ─────────────────────────────────────────────────────────

export async function updateStock(
  _prev: ProductState,
  formData: FormData
): Promise<ProductState> {
  await requireAdmin();

  const raw = {
    productId: formData.get("productId") as string,
    stockQuantity: formData.get("stockQuantity") as string,
  };

  const validated = UpdateStockSchema.safeParse(raw);
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const { productId, stockQuantity } = validated.data;

  await prisma.product.update({
    where: { id: productId },
    data: { stockQuantity: parseFloat(stockQuantity) },
  });

  revalidatePath("/admin/inventory");
  revalidatePath("/admin");
  return { success: true, message: "Stock updated successfully!" };
}
