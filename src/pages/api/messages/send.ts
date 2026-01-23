import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { normalizeMobile } from "@/lib/phone";
import { renderTemplate } from "@/lib/templates";
import { MessageStatuses } from "@/lib/constants";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await getSessionUser(req, res);
  if (!user) return res.status(401).json({ error: "UNAUTHORIZED" });

  if (req.method !== "POST") {
    return res.status(405).json({ error: "METHOD_NOT_ALLOWED" });
  }

  const payload = req.body as any;
  const invoice = await prisma.invoice.findUnique({
    where: { id: payload.invoiceId }
  });

  if (!invoice) {
    return res.status(404).json({ error: "NOT_FOUND" });
  }

  const settings = await prisma.settings.findUnique({ where: { id: 1 } });
  if (!settings) {
    return res.status(400).json({ error: "SETTINGS_MISSING" });
  }

  if (!invoice.mobile) {
    return res.status(400).json({ error: "INVALID_MOBILE" });
  }
  const mobile = normalizeMobile(invoice.mobile);

  const template = payload.templateId
    ? await prisma.messageTemplate.findUnique({
        where: { id: payload.templateId }
      })
    : null;

  const body = template ? template.bodyAr : String(payload.customBody ?? "");
  const rendered = renderTemplate(body, {
    invoice,
    settings
  });

  const channel = payload.channel;
  const encoded = encodeURIComponent(rendered);
  const url =
    channel === "WHATSAPP"
      ? `https://wa.me/${mobile.replace("+", "")}?text=${encoded}`
      : `sms:${mobile}?body=${encoded}`;

  const log = await prisma.messageLog.create({
    data: {
      invoiceId: invoice.id,
      channel,
      templateCode: template?.code ?? null,
      toMobile: mobile,
      messageBody: rendered,
      status: MessageStatuses.SENT,
      sentByUserId: user.id
    }
  });

  return res.status(200).json({ url, log });
}
