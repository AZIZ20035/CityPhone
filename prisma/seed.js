const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@local.test";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "Admin@123456";

  // Hash the password
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  await prisma.settings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      shopName: process.env.SHOP_NAME ?? "محل الصيانة",
      shopPhone: process.env.SHOP_PHONE ?? "+966500000000"
    }
  });

  await prisma.user.deleteMany({
    where: { email: adminEmail }
  });

  await prisma.user.create({
    data: {
      email: adminEmail,
      name: "Admin",
      passwordHash: passwordHash,
      role: "ADMIN"
    }
  });

  await prisma.invoiceCounter.upsert({
    where: { id: "GLOBAL" },
    update: {},
    create: { id: "GLOBAL", counter: 10498 }
  });

  console.log("✅ Database seeded successfully!");
  console.log(`📧 Admin Email: ${adminEmail}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
