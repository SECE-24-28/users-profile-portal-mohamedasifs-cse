// Seed script — creates a default admin user for first-time login
// Run with: npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed.ts

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("admin123", 10);
  const user = await prisma.user.upsert({
    where: { email: "admin@school.com" },
    update: {},
    create: { email: "admin@school.com", password },
  });
  console.log("Seed complete. Admin user:", user.email);
  console.log("Password: admin123");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
