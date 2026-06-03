/**
 * Zod validation schemas for all forms and server actions.
 * Using Zod v4 API (breaking changes from v3: error → message in some validators).
 */
import { z } from "zod";

// ─── Auth ──────────────────────────────────────────────────────────────────

export const LoginSchema = z.object({
  email: z.email("Please enter a valid email address").trim(),
  password: z.string().min(1, "Password is required"),
});

export const RegisterSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name is too long")
    .trim(),
  email: z.email("Please enter a valid email address").trim(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[a-zA-Z]/, "Password must contain at least one letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character"),
});

export type LoginInput = z.infer<typeof LoginSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;

// ─── Products ─────────────────────────────────────────────────────────────

export const ProductSchema = z.object({
  name: z.string().min(1, "Product name is required").max(200).trim(),
  description: z.string().max(1000).optional().or(z.literal("")),
  sku: z
    .string()
    .min(1, "SKU is required")
    .max(100)
    .regex(/^[A-Za-z0-9_-]+$/, "SKU may only contain letters, numbers, dashes and underscores")
    .trim(),
  category: z.string().min(1, "Category is required").max(100).trim(),
  baseUnit: z.enum(["g", "mL", "item"]),
  pricePerBaseUnit: z
    .string()
    .min(1, "Price is required")
    .refine((v) => !isNaN(parseFloat(v)) && parseFloat(v) > 0, {
      message: "Price must be a positive number",
    }),
  stockQuantity: z
    .string()
    .min(1, "Stock quantity is required")
    .refine((v) => !isNaN(parseFloat(v)) && parseFloat(v) >= 0, {
      message: "Stock must be a non-negative number",
    }),
  isActive: z.boolean().optional().default(true),
});

export type ProductInput = z.infer<typeof ProductSchema>;

// ─── Orders / Quotations ──────────────────────────────────────────────────

export const QuotationItemSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  enteredQuantity: z
    .string()
    .min(1, "Quantity is required")
    .refine((v) => !isNaN(parseFloat(v)) && parseFloat(v) > 0, {
      message: "Quantity must be positive",
    }),
  enteredUnit: z.string().min(1, "Unit is required"),
});

export const CreateOrderSchema = z.object({
  items: z.array(QuotationItemSchema).min(1, "At least one item is required"),
});

export type QuotationItemInput = z.infer<typeof QuotationItemSchema>;
export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;

// ─── Order Status ─────────────────────────────────────────────────────────

export const UpdateOrderStatusSchema = z.object({
  orderId: z.string().min(1),
  status: z.enum(["PENDING", "APPROVED", "REJECTED", "COMPLETED"]),
});

export type UpdateOrderStatusInput = z.infer<typeof UpdateOrderStatusSchema>;

// ─── Inventory Update ─────────────────────────────────────────────────────

export const UpdateStockSchema = z.object({
  productId: z.string().min(1),
  stockQuantity: z
    .string()
    .min(1, "Stock is required")
    .refine((v) => !isNaN(parseFloat(v)) && parseFloat(v) >= 0, {
      message: "Stock must be non-negative",
    }),
});

export type UpdateStockInput = z.infer<typeof UpdateStockSchema>;
