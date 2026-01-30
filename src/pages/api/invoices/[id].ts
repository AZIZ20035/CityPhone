import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { withApiHandler } from "@/lib/api";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await getSessionUser(req, res);
  if (!user) return res.status(401).json({ error: "UNAUTHORIZED" });

  const id = String(req.query.id);

  if (req.method === "GET") {
    const invoice = await prisma.invoice.findUnique({
      where: { id }
    });
    if (!invoice) return res.status(404).json({ error: "NOT_FOUND" });
    return res.json({ invoice });
  }

  if (req.method === "PATCH") {
    const payload = req.body as any;
    const invoice = await prisma.invoice.update({
      where: { id },
      data: {
        customerName: payload.customerName ?? undefined,
        mobile: payload.mobile ?? undefined,
        totalAmount:
          payload.totalAmount !== undefined && payload.totalAmount !== ""
            ? Number(payload.totalAmount)
            : payload.totalAmount === ""
              ? null
              : undefined
      }
    });
    return res.json({ invoice });
  }

  return res.status(405).json({ error: "METHOD_NOT_ALLOWED" });
}

export default withApiHandler(handler);
