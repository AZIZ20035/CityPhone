import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { Roles } from "@/lib/constants";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await getSessionUser(req, res);
  if (!user) return res.status(401).json({ error: "UNAUTHORIZED" });

  if (req.method === "GET") {
    const templates = await prisma.messageTemplate.findMany({
      orderBy: { code: "asc" }
    });
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
