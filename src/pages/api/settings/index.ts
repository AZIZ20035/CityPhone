import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { Roles } from "@/lib/constants";
import { withApiHandler } from "@/lib/api";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await getSessionUser(req, res);
  if (!user) return res.status(401).json({ error: "UNAUTHORIZED" });

  if (req.method === "GET") {
    const settings = await prisma.settings.upsert({
      where: { id: 1 },
      update: {},
      create: {
        id: 1,
        shopName: process.env.SHOP_NAME ?? "محل الصيانة",
        shopPhone: process.env.SHOP_PHONE ?? "+966500000000"
      }
    });
    return res.json({ settings });
  }

  if (user.role !== Roles.ADMIN) {
    return res.status(403).json({ error: "FORBIDDEN" });
  }

  if (req.method === "PUT") {
    const payload = req.body as any;
    const settings = await prisma.settings.upsert({
      where: { id: 1 },
      update: {
        shopName: payload.shopName,
        shopPhone: payload.shopPhone
      },
      create: {
        id: 1,
        shopName: payload.shopName,
        shopPhone: payload.shopPhone
      }
    });
    return res.json({ settings });
  }

  return res.status(405).json({ error: "METHOD_NOT_ALLOWED" });
}

export default withApiHandler(handler);
