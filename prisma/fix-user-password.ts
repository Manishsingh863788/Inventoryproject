import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import bcrypt from "bcryptjs";

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Test what bcrypt produces for both passwords
  const adminHash = await bcrypt.hash("Admin123@", 12);
  const userHash  = await bcrypt.hash("User123@", 12);

  // Verify they work
  const adminOk = await bcrypt.compare("Admin123@", adminHash);
  const userOk  = await bcrypt.compare("User123@",  userHash);
  console.log("Admin hash test:", adminOk); // should be true
  console.log("User hash test:",  userOk);  // should be true

  // Update both passwords in DB to freshly generated hashes
  await prisma.user.update({
    where: { email: "admin@example.com" },
    data:  { password: adminHash },
  });
  console.log("✅ Admin password updated");

  await prisma.user.update({
    where: { email: "user@example.com" },
    data:  { password: userHash },
  });
  console.log("✅ User password updated");

  // Read back and verify stored hash
  const adminUser = await prisma.user.findUnique({ where: { email: "admin@example.com" } });
  const userUser  = await prisma.user.findUnique({ where: { email: "user@example.com"  } });

  const adminVerify = await bcrypt.compare("Admin123@", adminUser!.password);
  const userVerify  = await bcrypt.compare("User123@",  userUser!.password);
  console.log("Admin DB verify:", adminVerify); // must be true
  console.log("User  DB verify:", userVerify);  // must be true
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
