import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { Roles } from "@/lib/constants";
import { withApiHandler } from "@/lib/api";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await getSessionUser(req, res);
  if (!user) return res.status(401).json({ error: "UNAUTHORIZED" });

  if (req.method === "GET") {
    let templates = await prisma.messageTemplate.findMany({
      orderBy: { code: "asc" }
    });

    if (templates.length === 0) {
      // Auto-seed default templates
      const defaultTemplates = [
        {
          code: "RECEIVED",
          titleAr: "استلام الجهاز",
          bodyAr: "عزيزي العميل، تم استلام جهازك {device_name} تحت رقم الفاتورة {invoice_no}. سنوافيكم بالتحديثات فوراً. {shop_name}",
          channel: "WHATSAPP",
        },
        {
          code: "READY",
          titleAr: "الجهاز جاهز",
          bodyAr: "عزيزي العميل، جهازك {device_name} (فاتورة رقم {invoice_no}) جاهز للاستلام. التكلفة: {final_cost} ريال. {shop_name}",
          channel: "WHATSAPP",
        },
        {
          code: "DELIVERED",
          titleAr: "تم التسليم",
          bodyAr: "تم تسليم جهازك بنجاح. شكرًا لثقتكم بـ {shop_name}. يسعدنا خدمتكم دائماً.",
          channel: "WHATSAPP",
        }
      ];

      for (const t of defaultTemplates) {
        await prisma.messageTemplate.create({ data: t });
      }

      templates = await prisma.messageTemplate.findMany({
        orderBy: { code: "asc" }
      });
    }

    return res.json({ templates });
  }

  if (user.role !== Roles.ADMIN) {
    return res.status(403).json({ error: "FORBIDDEN" });
  }

  if (req.method === "POST") {
    const payload = req.body as any;
    const template = await prisma.messageTemplate.create({
      data: {
        channel: payload.channel,
        code: payload.code,
        titleAr: payload.titleAr,
        bodyAr: payload.bodyAr,
        enabled: Boolean(payload.enabled)
      }
    });
    return res.status(201).json({ template });
  }

  if (req.method === "PUT") {
    const payload = req.body as any;
    const template = await prisma.messageTemplate.update({
      where: { id: payload.id },
      data: {
        channel: payload.channel,
        code: payload.code,
        titleAr: payload.titleAr,
        bodyAr: payload.bodyAr,
        enabled: Boolean(payload.enabled)
      }
    });
    return res.json({ template });
  }

  return res.status(405).json({ error: "METHOD_NOT_ALLOWED" });
}

export default withApiHandler(handler);
