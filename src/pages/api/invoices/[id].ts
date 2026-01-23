import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await getSessionUser(req, res);
  if (!user) return res.status(401).json({ error: "UNAUTHORIZED" });

  const id = String(req.query.id);

  if (req.method === "GET") {
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: { messages: { orderBy: { createdAt: "desc" } } }
    });
    if (!invoice) return res.status(404).json({ error: "NOT_FOUND" });
    return res.json({ invoice });
  }

  if (req.method === "PATCH") {
    const payload = req.body as any;
    const isDelivered =
      typeof payload.isDelivered === "boolean" ? payload.isDelivered : undefined;
    const deliveredAt =
      isDelivered === true
        ? payload.deliveredAt
          ? new Date(payload.deliveredAt)
          : new Date()
        : isDelivered === false
          ? null
          : undefined;
    const invoice = await prisma.invoice.update({
      where: { id },
      data: {
        deviceStatus: payload.deviceStatus,
        contactedCustomer:
          typeof payload.contactedCustomer === "boolean"
            ? payload.contactedCustomer
            : undefined,
        agreedPrice:
          payload.agreedPrice !== undefined && payload.agreedPrice !== ""
            ? Number(payload.agreedPrice)
            : payload.agreedPrice === ""
              ? null
              : undefined,
        notes: payload.notes ?? undefined,
        customerName: payload.customerName ?? undefined,
        mobile: payload.mobile ?? undefined,
        deviceType: payload.deviceType ?? undefined,
        problem: payload.problem ?? undefined,
        staffReceiver: payload.staffReceiver ?? undefined,
        isDelivered,
        receiverName: payload.receiverName ?? undefined,
        deliveredAt
      }
    });
    return res.json({ invoice });
  }

  return res.status(405).json({ error: "METHOD_NOT_ALLOWED" });
}
