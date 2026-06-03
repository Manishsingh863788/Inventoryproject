"use server";

/**
 * Order Server Actions
 * Users can create orders; admins can update status.
 */
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { CreateOrderSchema, UpdateOrderStatusSchema } from "@/lib/validations";
import { convertToBaseUnit, calculatePrice } from "@/lib/units";
import type { AnyUnit } from "@/lib/units";

export type OrderState =
  | {
      errors?: Record<string, string[]>;
      message?: string;
      success?: boolean;
      orderId?: string;
    }
  | undefined;

// Internal type matching what Prisma returns for product rows
interface ProductRecord {
  id: string;
  pricePerBaseUnit: unknown;
  isActive: boolean;
}

// ─── Create Order ─────────────────────────────────────────────────────────

export async function createOrder(
  _prev: OrderState,
  formData: FormData
): Promise<OrderState> {
  const session = await getSession();
  if (!session) return { message: "You must be logged in to place an order" };

  const itemsRaw = formData.get("items") as string;
  let itemsParsed: unknown;
  try {
    itemsParsed = JSON.parse(itemsRaw);
  } catch {
    return { message: "Invalid order data" };
  }

  const validated = CreateOrderSchema.safeParse({ items: itemsParsed });
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors as Record<string, string[]> };
  }

  const { items } = validated.data;

  const productIds = items.map((i) => i.productId);
  const rawProducts = await prisma.product.findMany({
    where: { id: { in: productIds }, isActive: true },
  });
  const products = rawProducts as unknown as ProductRecord[];
  const productMap = new Map<string, ProductRecord>(products.map((p) => [p.id, p]));

  for (const item of items) {
    if (!productMap.has(item.productId)) {
      return { message: `Product not found or inactive: ${item.productId}` };
    }
  }

  let totalAmount = 0;
  const orderItems = items.map((item) => {
    const product = productMap.get(item.productId)!;
    const qty = parseFloat(item.enteredQuantity);
    const unit = item.enteredUnit as AnyUnit;
    const pricePerBase = Number(product.pricePerBaseUnit);

    const convertedQty = convertToBaseUnit(qty, unit);
    const lineTotal = calculatePrice(qty, unit, pricePerBase);
    totalAmount += lineTotal;

    return {
      productId:         product.id,
      enteredQuantity:   qty,
      enteredUnit:       item.enteredUnit,
      convertedQuantity: convertedQty,
      pricePerUnit:      pricePerBase,
      lineTotal,
    };
  });

  // Create order + items in a single transaction
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const order = await prisma.$transaction(async (tx: any) => {
    const newOrder = await tx.order.create({
      data: {
        userId:      session.userId,
        status:      "PENDING",
        totalAmount,
        items: {
          create: orderItems.map((oi) => ({
            productId:         oi.productId,
            enteredQuantity:   oi.enteredQuantity,
            enteredUnit:       oi.enteredUnit,
            convertedQuantity: oi.convertedQuantity,
            pricePerUnit:      oi.pricePerUnit,
            lineTotal:         oi.lineTotal,
          })),
        },
      },
    });
    return newOrder;
  });

  revalidatePath("/dashboard/orders");
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
  return { success: true, message: "Order placed successfully!", orderId: (order as { id: string }).id };
}

// ─── Update Order Status (Admin) ──────────────────────────────────────────

export async function updateOrderStatus(
  orderId: string,
  status: "PENDING" | "APPROVED" | "REJECTED" | "COMPLETED"
): Promise<{ error?: string; success?: boolean }> {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return { error: "Unauthorized" };
  }

  const validated = UpdateOrderStatusSchema.safeParse({ orderId, status });
  if (!validated.success) {
    return { error: "Invalid request" };
  }

  await prisma.order.update({
    where: { id: orderId },
    data:  { status },
  });

  revalidatePath("/admin/orders");
  revalidatePath("/dashboard/orders");
  revalidatePath("/admin");
  return { success: true };
}
