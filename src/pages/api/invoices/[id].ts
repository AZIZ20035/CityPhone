import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { withApiHandler } from "@/lib/api";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
  _context: { requestId: string }
) {
  const user = await getSessionUser(req, res);
  if (!user) {
    res.status(401).json({ error: "UNAUTHORIZED" });
    return;
  }

  const id = String(req.query.id);

  if (req.method === "GET") {
    const invoice = await prisma.invoice.findUnique({
      where: { id }
    });
    if (!invoice) {
      res.status(404).json({ error: "NOT_FOUND" });
      return;
    }
    res.json({ invoice });
    return;
  }

  if (req.method === "PATCH") {
    const payload = req.body as any;
    const invoice = await prisma.invoice.update({
      where: { id },
      data: {
        customerName: payload.customerName ?? undefined,
        mobile: payload.mobile ?? undefined,
        deviceType: payload.deviceType ?? undefined,
        problem: payload.problem ?? undefined,
        staffReceiver: payload.staffReceiver ?? undefined,
        agreedPrice:
          payload.agreedPrice !== undefined && payload.agreedPrice !== ""
            ? Number(payload.agreedPrice)
            : payload.agreedPrice === ""
              ? null
              : undefined,
        totalAmount:
          payload.totalAmount !== undefined && payload.totalAmount !== ""
            ? Number(payload.totalAmount)
            : payload.totalAmount === ""
              ? null
              : undefined,
        deviceStatus: payload.deviceStatus ?? undefined,
        contactedCustomer: payload.contactedCustomer ?? undefined,
        isDelivered: payload.isDelivered ?? undefined,
        deliveredAt: payload.deliveredAt ?? undefined,
        receiverName: payload.receiverName ?? undefined
      }
    });
    res.json({ invoice });
    return;
  }

  if (req.method === "DELETE") {
    // First delete related message logs
    await prisma.messageLog.deleteMany({
      where: { invoiceId: id }
    });
    // Then delete the invoice
    await prisma.invoice.delete({
      where: { id }
    });
    res.status(204).end();
    return;
  }

  res.status(405).json({ error: "METHOD_NOT_ALLOWED" });
}

export default withApiHandler(handler);
