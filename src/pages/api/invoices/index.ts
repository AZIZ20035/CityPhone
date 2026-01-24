import type { NextApiRequest, NextApiResponse } from "next";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { normalizeMobile } from "@/lib/phone";
import { formatSimpleInvoice } from "@/lib/invoice";
import { withApiHandler } from "@/lib/api";

function hasValue(value?: string | null) {
  return Boolean(value && value.trim().length > 0);
}

function validateMinimal(payload: any) {
  const customerName = payload.customerName ?? "";
  const mobile = payload.mobile ?? "";
  const deviceType = payload.deviceType ?? "";
  const problem = payload.problem ?? "";

  const comboA = hasValue(customerName) && hasValue(deviceType);
  const comboB = hasValue(mobile) && hasValue(problem);
  const count =
    Number(hasValue(customerName)) +
    Number(hasValue(mobile)) +
    Number(hasValue(deviceType)) +
    Number(hasValue(problem));

  return comboA || comboB || count >= 2;
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await getSessionUser(req, res);
  if (!user) {
    return res.status(401).json({ error: "UNAUTHORIZED" });
  }

  if (req.method === "GET") {
    const invoices = await prisma.invoice.findMany({
      orderBy: { updatedAt: "desc" }
    });
    return res.json({ invoices });
  }

  if (req.method === "POST") {
    const payload = req.body as any;
    if (!validateMinimal(payload)) {
      return res.status(400).json({
        error:
          "أدخل على الأقل أي حقلين (مثل: اسم العميل + نوع الجهاز) أو (رقم الجوال + المشكلة)."
      });
    }

    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        const invoice = await prisma.$transaction(async (tx) => {
          await tx.invoiceCounter.upsert({
            where: { dateKey: "GLOBAL" },
            update: {},
            create: { dateKey: "GLOBAL", counter: 10498 }
          });
          const current = await tx.invoiceCounter.findUnique({
            where: { dateKey: "GLOBAL" }
          });
          const base = current?.counter ?? 10498;
          const nextValue = Math.max(base + 1, 10499);
          const next = await tx.invoiceCounter.update({
            where: { dateKey: "GLOBAL" },
            data: { counter: nextValue }
          });

          const invoiceNo = formatSimpleInvoice(next.counter);
          const mobile = payload.mobile ? normalizeMobile(payload.mobile) : null;

          let createdByUserId: string | null = null;
          if (user.id && user.email) {
            const upserted = await tx.user.upsert({
              where: { email: user.email },
              update: {
                name: user.name ?? "Admin",
                role: user.role ?? "ADMIN"
              },
              create: {
                id: user.id,
                email: user.email,
                name: user.name ?? "Admin",
                role: user.role ?? "ADMIN",
                passwordHash: "bypass"
              }
            });
            createdByUserId = upserted.id;
          }

          return tx.invoice.create({
            data: {
              invoiceNo,
              customerName: payload.customerName?.trim() || null,
              mobile: mobile || null,
              deviceType: payload.deviceType?.trim() || null,
              problem: payload.problem?.trim() || null,
              staffReceiver: payload.staffReceiver?.trim() || null,
              agreedPrice:
                payload.agreedPrice !== undefined && payload.agreedPrice !== ""
                  ? Number(payload.agreedPrice)
                  : null,
              createdByUserId
            }
          });
        });

        return res.status(201).json({ invoice });
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === "P2002"
        ) {
          continue;
        }
        throw error;
      }
    }

    return res.status(500).json({ error: "تعذر إنشاء رقم فاتورة جديد" });
  }

  return res.status(405).json({ error: "METHOD_NOT_ALLOWED" });
}

export default withApiHandler(handler);
