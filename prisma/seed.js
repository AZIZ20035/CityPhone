const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@local.test";

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
      role: "ADMIN"
    }
  });

  await prisma.invoiceCounter.upsert({
    where: { id: "GLOBAL" },
    update: {},
    create: { id: "GLOBAL", counter: 10498 }
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
