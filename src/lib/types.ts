/**
 * Shared application types.
 * These mirror the Prisma models but use plain TypeScript (no Decimal)
 * so they're safe to pass from Server Components to Client Components.
 */

export type OrderStatus = "PENDING" | "APPROVED" | "REJECTED" | "COMPLETED";
export type BaseUnit = "g" | "mL" | "item";
export type UserRole = "ADMIN" | "USER";

export interface ProductRow {
  id: string;
  name: string;
  description: string | null;
  sku: string;
  category: string;
  baseUnit: BaseUnit;
  pricePerBaseUnit: number;
  stockQuantity: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItemRow {
  id: string;
  orderId: string;
  productId: string;
  enteredQuantity: number;
  enteredUnit: string;
  convertedQuantity: number;
  pricePerUnit: number;
  lineTotal: number;
  createdAt: Date;
}

export interface OrderRow {
  id: string;
  userId: string;
  status: OrderStatus;
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
}
