/**
 * Unit Conversion Utilities
 *
 * Internal storage strategy:
 * - Weight: stored in grams (g)
 * - Volume: stored in milliliters (mL)
 * - Count:  stored as integer items
 *
 * All arithmetic is done with JavaScript numbers (sufficient precision for display),
 * but values are stored as NUMERIC(20,8) via Prisma Decimal in the database.
 */

export type WeightUnit = "g" | "kg";
export type VolumeUnit = "mL" | "L";
export type CountUnit = "item";
export type AnyUnit = WeightUnit | VolumeUnit | CountUnit;

export type BaseUnit = "g" | "mL" | "item";

/** Map: user-facing unit → base unit */
export const UNIT_BASE_MAP: Record<AnyUnit, BaseUnit> = {
  g: "g",
  kg: "g",
  mL: "mL",
  L: "mL",
  item: "item",
};

/** Conversion factors: 1 <unit> = <factor> <baseUnit> */
const CONVERSION_FACTORS: Record<AnyUnit, number> = {
  g: 1,
  kg: 1000,
  mL: 1,
  L: 1000,
  item: 1,
};

/** Reverse factors: 1 <baseUnit> = <factor> <unit> */
const REVERSE_FACTORS: Record<AnyUnit, number> = {
  g: 1,
  kg: 0.001,
  mL: 1,
  L: 0.001,
  item: 1,
};

/**
 * Convert an entered quantity from its entered unit to the base unit.
 * e.g. convertToBaseUnit(2, "kg") → 2000 (grams)
 * e.g. convertToBaseUnit(1.5, "L") → 1500 (mL)
 */
export function convertToBaseUnit(quantity: number, unit: AnyUnit): number {
  return quantity * CONVERSION_FACTORS[unit];
}

/**
 * Convert a quantity from base unit to a display unit.
 * e.g. convertFromBaseUnit(5000, "g", "kg") → 5 (kg)
 */
export function convertFromBaseUnit(
  baseQuantity: number,
  baseUnit: BaseUnit,
  displayUnit: AnyUnit
): number {
  return baseQuantity * REVERSE_FACTORS[displayUnit];
}

/**
 * Calculate the price for a given quantity in a given unit.
 * e.g. calculatePrice(2, "kg", 0.50) → 1000 (2000mL * 0.50 per mL)
 *
 * @param enteredQuantity - amount in the entered unit
 * @param enteredUnit     - the unit the user selected
 * @param pricePerBaseUnit - price per 1 base unit (g, mL, or item)
 */
export function calculatePrice(
  enteredQuantity: number,
  enteredUnit: AnyUnit,
  pricePerBaseUnit: number
): number {
  const baseQty = convertToBaseUnit(enteredQuantity, enteredUnit);
  return baseQty * pricePerBaseUnit;
}

/**
 * Get the best human-readable display string for a base-unit quantity.
 * e.g. formatBaseQuantity(5000, "g") → "5 kg (5000 g)"
 * e.g. formatBaseQuantity(500, "mL") → "500 mL"
 * e.g. formatBaseQuantity(1500, "mL") → "1.5 L (1500 mL)"
 */
export function formatBaseQuantity(
  baseQty: number,
  baseUnit: BaseUnit
): string {
  if (baseUnit === "g") {
    if (baseQty >= 1000) {
      const kg = baseQty / 1000;
      return `${kg % 1 === 0 ? kg : kg.toFixed(3).replace(/\.?0+$/, "")} kg (${baseQty} g)`;
    }
    return `${baseQty} g`;
  }
  if (baseUnit === "mL") {
    if (baseQty >= 1000) {
      const L = baseQty / 1000;
      return `${L % 1 === 0 ? L : L.toFixed(3).replace(/\.?0+$/, "")} L (${baseQty} mL)`;
    }
    return `${baseQty} mL`;
  }
  return `${baseQty} item${baseQty !== 1 ? "s" : ""}`;
}

/**
 * Returns the available user-facing units for a given base unit.
 */
export function getAvailableUnits(baseUnit: BaseUnit): AnyUnit[] {
  if (baseUnit === "g") return ["g", "kg"];
  if (baseUnit === "mL") return ["mL", "L"];
  return ["item"];
}

/**
 * Format currency in INR (Indian Rupees)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
