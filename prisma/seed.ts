import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database…");

  const adminPassword = await bcrypt.hash("Admin123@", 12);
  const userPassword  = await bcrypt.hash("User123@", 12);

  const admin = await prisma.user.upsert({
    where:  { email: "admin@example.com" },
    update: {},
    create: { name: "Admin User", email: "admin@example.com", password: adminPassword, role: "ADMIN" },
  });
  console.log(`✅ Admin: ${admin.email}`);

  const user = await prisma.user.upsert({
    where:  { email: "user@example.com" },
    update: {},
    create: { name: "Regular User", email: "user@example.com", password: userPassword, role: "USER" },
  });
  console.log(`✅ User:  ${user.email}`);

  const products = [
    { name: "Ethanol 99% Pure",          description: "High-purity ethanol for laboratory use",           sku: "ETH-99",    category: "Chemicals",        baseUnit: "mL"   as const, pricePerBaseUnit: 0.5,   stockQuantity: 50000  },
    { name: "Acetone Technical Grade",   description: "Technical-grade acetone for industrial cleaning",  sku: "ACE-TG",    category: "Chemicals",        baseUnit: "mL"   as const, pricePerBaseUnit: 0.35,  stockQuantity: 30000  },
    { name: "Hydrochloric Acid 35%",     description: "35% HCl solution for pH adjustment",               sku: "HCL-35",    category: "Chemicals",        baseUnit: "mL"   as const, pricePerBaseUnit: 0.8,   stockQuantity: 20000  },
    { name: "Sodium Chloride (Salt)",    description: "Food & industrial grade NaCl",                     sku: "NACL-FG",   category: "Salts & Minerals", baseUnit: "g"    as const, pricePerBaseUnit: 0.002, stockQuantity: 500000 },
    { name: "Calcium Carbonate Powder",  description: "Fine calcium carbonate for industrial use",        sku: "CACO3-P",   category: "Salts & Minerals", baseUnit: "g"    as const, pricePerBaseUnit: 0.005, stockQuantity: 200000 },
    { name: "Potassium Permanganate",    description: "KMnO4 crystals for water treatment",               sku: "KMNO4-C",   category: "Salts & Minerals", baseUnit: "g"    as const, pricePerBaseUnit: 0.12,  stockQuantity: 10000  },
    { name: "Glass Beaker 250 mL",       description: "Borosilicate glass beaker, 250 mL",               sku: "BKR-250",   category: "Lab Glassware",    baseUnit: "item" as const, pricePerBaseUnit: 85,    stockQuantity: 150    },
    { name: "Conical Flask 500 mL",      description: "Erlenmeyer flask with standard taper",             sku: "FLASK-500", category: "Lab Glassware",    baseUnit: "item" as const, pricePerBaseUnit: 120,   stockQuantity: 80     },
    { name: "Distilled Water",           description: "Ultra-pure distilled water for lab use",           sku: "H2O-DI",    category: "Solvents",         baseUnit: "mL"   as const, pricePerBaseUnit: 0.01,  stockQuantity: 100000 },
    { name: "Sodium Hydroxide Pellets",  description: "NaOH pellets 97% purity",                         sku: "NAOH-P",    category: "Reagents",         baseUnit: "g"    as const, pricePerBaseUnit: 0.04,  stockQuantity: 25000  },
  ];

  for (const p of products) {
    const product = await prisma.product.upsert({
      where:  { sku: p.sku },
      update: { stockQuantity: p.stockQuantity, pricePerBaseUnit: p.pricePerBaseUnit },
      create: p,
    });
    console.log(`  📦 ${product.name} (${product.sku})`);
  }

  console.log("\n✨ Seed complete!");
  console.log("   Admin: admin@example.com / Admin123@");
  console.log("   User:  user@example.com  / User123@");
}

main()
  .catch((e) => { console.error("❌ Seed failed:", e); process.exit(1); })
  .finally(() => prisma.$disconnect());
