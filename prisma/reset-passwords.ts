import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import bcrypt from "bcryptjs";

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Use bcrypt cost 10 (faster, still secure for dev)
  const adminHash = await bcrypt.hash("Admin123@", 10);
  const userHash  = await bcrypt.hash("User123@",  10);

  // Verify hashes work locally before writing to DB
  console.log("Pre-write verify Admin:", await bcrypt.compare("Admin123@", adminHash));
  console.log("Pre-write verify User:", await bcrypt.compare("User123@",  userHash));

  // Update in DB
  const a = await prisma.user.update({
    where: { email: "admin@example.com" },
    data:  { password: adminHash },
    select: { email: true, password: true },
  });
  const u = await prisma.user.update({
    where: { email: "user@example.com" },
    data:  { password: userHash },
    select: { email: true, password: true },
  });

  // Read back and verify
  console.log("\n=== Verification after DB write ===");
  console.log("Admin stored hash:", a.password);
  console.log("User  stored hash:", u.password);

  const adminOk = await bcrypt.compare("Admin123@", a.password);
  const userOk  = await bcrypt.compare("User123@",  u.password);
  console.log("Admin verify:", adminOk, "← must be true");
  console.log("User  verify:", userOk,  "← must be true");

  if (!adminOk || !userOk) {
    throw new Error("Hash mismatch — something is wrong with bcrypt");
  }
  console.log("\n✅ Both passwords fixed and verified!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
