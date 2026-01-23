import { PrismaClient } from "@prisma/client";
import { MessageChannels, Roles } from "../src/lib/constants";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@local.test";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "Admin12345";
  const adminName = process.env.ADMIN_NAME ?? "Admin";

  const passwordHash = await bcrypt.hash(adminPassword, 10);

  await prisma.settings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      shopName: process.env.SHOP_NAME ?? "محل الصيانة",
      shopPhone: process.env.SHOP_PHONE ?? "+966500000000",
      vatRate: 0.15
    }
  });

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: adminName,
      role: Roles.ADMIN,
      passwordHash
    },
    create: {
      email: adminEmail,
      name: adminName,
      role: Roles.ADMIN,
      passwordHash
    }
  });

  const templates = [
    {
      channel: MessageChannels.WHATSAPP,
      code: "RECEIVED",
      titleAr: "استلام الجهاز",
      bodyAr:
        "تم استلام جهازك ({device_name} {model}) تحت رقم فاتورة {invoice_no}. سنوافيك بالتحديثات. للاستفسار: {shop_phone}"
    },
    {
      channel: MessageChannels.SMS,
      code: "RECEIVED_SMS",
      titleAr: "استلام الجهاز - SMS",
      bodyAr:
        "تم استلام جهازك ({device_name} {model}) تحت رقم فاتورة {invoice_no}. للاستفسار: {shop_phone}"
    },
    {
      channel: MessageChannels.WHATSAPP,
      code: "WAITING_PART",
      titleAr: "انتظار القطعة",
      bodyAr:
        "جهازك تحت رقم {invoice_no} بانتظار وصول القطعة. موعد الوصول المتوقع: {expected_part_arrival_date}. سنبلغك فور وصولها."
    },
    {
      channel: MessageChannels.WHATSAPP,
      code: "READY",
      titleAr: "جاهز للاستلام",
      bodyAr:
        "تم الانتهاء من صيانة جهازك ({device_name} {model}) ورقم الفاتورة {invoice_no}. المبلغ: {final_cost} ريال. يمكنك الاستلام خلال أوقات الدوام."
    },
    {
      channel: MessageChannels.WHATSAPP,
      code: "DELIVERED",
      titleAr: "تم التسليم",
      bodyAr: "تم تسليم جهازك بنجاح. رقم الفاتورة {invoice_no}. نشكرك على زيارتك."
    }
  ];

  for (const template of templates) {
    await prisma.messageTemplate.upsert({
      where: { code: template.code },
      update: template,
      create: template
    });
  }

  await prisma.invoiceCounter.upsert({
    where: { dateKey: "GLOBAL" },
    update: {},
    create: { dateKey: "GLOBAL", counter: 10498 }
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
