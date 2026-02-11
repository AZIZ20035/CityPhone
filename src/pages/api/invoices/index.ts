import type { NextApiRequest, NextApiResponse } from "next";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { normalizeMobile, isValidKsaMobile } from "@/lib/phone";
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

async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
  context: { requestId: string }
) {
  const requestId = context.requestId;
  const user = await getSessionUser(req, res);
  if (!user) {
    return res.status(401).json({ error: "UNAUTHORIZED" });
  }

  if (req.method === "GET") {
    const invoices = await prisma.invoice.findMany({
      orderBy: { createdAt: "desc" }
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

    if (payload.mobile && payload.mobile.trim() && !isValidKsaMobile(payload.mobile)) {
      return res.status(400).json({
        error: "رقم جوال غير صحيح. الصيغة الصحيحة: 05XXXXXXXX",
        field: "mobile"
      });
    }

    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        console.info("INVOICE_CREATE_START", {
          requestId,
          attempt
        });
        const invoice = await prisma.$transaction(async (tx) => {
          console.info("INVOICE_COUNTER_UPSERT", { requestId, attempt });
          await tx.invoiceCounter.upsert({
            where: { id: "GLOBAL" },
            update: {},
            create: { id: "GLOBAL", counter: 10498 }
          });
          console.info("INVOICE_COUNTER_READ", { requestId, attempt });
          const current = await tx.invoiceCounter.findUnique({
            where: { id: "GLOBAL" }
          });
          const base = current?.counter ?? 10498;
          const nextValue = Math.max(base + 1, 10499);
          console.info("INVOICE_COUNTER_UPDATE", {
            requestId,
            attempt,
            nextValue
          });
          const next = await tx.invoiceCounter.update({
            where: { id: "GLOBAL" },
            data: { counter: nextValue }
          });

          const invoiceNo = formatSimpleInvoice(next.counter);
          const mobile = payload.mobile ? normalizeMobile(payload.mobile) : null;

          let createdByUserId: string | null = null;
          if (user.id && user.email) {
            console.info("INVOICE_USER_UPSERT", { requestId, attempt });
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

          console.info("INVOICE_CREATE", {
            requestId,
            attempt,
            invoiceNo
          });
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
              totalAmount:
                payload.totalAmount !== undefined && payload.totalAmount !== ""
                  ? Number(payload.totalAmount)
                  : null,
              createdByUserId
            }
          });
        });

        console.info("INVOICE_CREATE_SUCCESS", {
          requestId,
          attempt,
          invoiceId: invoice.id
        });
        return res.status(201).json({ invoice });
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === "P2002"
        ) {
          console.warn("INVOICE_CREATE_RETRY", {
            requestId,
            attempt,
            code: error.code
          });
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
