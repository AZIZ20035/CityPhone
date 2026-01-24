import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import Input from "@/components/Input";
import Select from "@/components/Select";
import TextArea from "@/components/TextArea";
import { isValidKsaMobile, normalizeMobile } from "@/lib/phone";
import { safeFetchJson } from "@/lib/apiClient";
import { getServerSession } from "next-auth";
import type { GetServerSideProps } from "next";
import { authOptions } from "../api/auth/[...nextauth]";

const statusOptions = [
  { value: "NEW", label: "جديد" },
  { value: "RECEIVED", label: "تم استلام الجهاز" },
  { value: "IN_PROGRESS", label: "جاري تجهيزه" },
  { value: "WAITING_PARTS", label: "في احتياج إلى قطع" },
  { value: "NO_PARTS", label: "داخلي – لا يُرسل للعميل (لا توجد قطعة)" },
  { value: "READY", label: "جاهز" },
  { value: "DELIVERED", label: "تم التسليم" },
  { value: "REFUSED", label: "تم التواصل والعميل رفض" }
];

export default function InvoiceDetails() {
  const router = useRouter();
  const { id } = router.query;
  const [invoice, setInvoice] = useState<any>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [settings, setSettings] = useState<any>(null);
  const [composerOpen, setComposerOpen] = useState(false);
  const [composerChannel, setComposerChannel] = useState<"WHATSAPP" | "SMS">(
    "WHATSAPP"
  );
  const [composerMessage, setComposerMessage] = useState("");
  const staffOptions = ["محمد", "زمران", "سالم"];

  async function load() {
    if (!id) return;
    try {
      const data = await safeFetchJson<{ invoice: any }>(
        `/api/invoices/${id}`
      );
      setInvoice(data.invoice);
    } catch {
      setInvoice(null);
    }
  }

  async function loadSettings() {
    try {
      const data = await safeFetchJson<{ settings: any }>("/api/settings");
      setSettings(data.settings ?? null);
    } catch {
      setSettings(null);
    }
  }

  useEffect(() => {
    load();
    loadSettings();
  }, [id]);

  async function save() {
    setSaving(true);
    setError("");
    try {
      const data = await safeFetchJson<{ invoice: any }>(`/api/invoices/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deviceStatus: invoice.deviceStatus,
          contactedCustomer: invoice.contactedCustomer,
          agreedPrice: invoice.agreedPrice,
          notes: invoice.notes,
          customerName: invoice.customerName,
          mobile: invoice.mobile,
          deviceType: invoice.deviceType,
          problem: invoice.problem,
          staffReceiver: invoice.staffReceiver,
          isDelivered: invoice.isDelivered,
          receiverName: invoice.receiverName
        })
      });
      setInvoice(data.invoice);
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر حفظ التعديلات");
    }
    setSaving(false);
  }

  if (!invoice) {
    return (
      <Layout title="تفاصيل الفاتورة">
        <div className="rounded bg-white p-6 shadow-sm">جاري التحميل...</div>
      </Layout>
    );
  }

  function templateForStatus(status: string) {
    const templates: Record<string, string> = {
      RECEIVED: "تم استلام جهازك تحت رقم الفاتورة {invoiceNo}. سنوافيك بالتحديثات.",
      IN_PROGRESS:
        "جاري العمل على جهازك تحت رقم الفاتورة {invoiceNo}. سنبلغك عند أي تحديث.",
      WAITING_PARTS:
        "فاتورتك رقم {invoiceNo} بانتظار وصول القطع. سنبلغك فور وصولها.",
      NO_PARTS: "لا توجد قطعة لهذا الجهاز. رقم الفاتورة {invoiceNo}.",
      READY:
        "جهازك جاهز للاستلام. رقم الفاتورة {invoiceNo}. يرجى الحضور خلال أوقات الدوام.",
      DELIVERED: "تم تسليم جهازك بنجاح. رقم الفاتورة {invoiceNo}. شكرًا لزيارتك.",
      REFUSED: "تم تحديث الفاتورة رقم {invoiceNo}: العميل رفض الإصلاح.",
      CANCELED: "تم إلغاء الفاتورة رقم {invoiceNo}."
    };
    return templates[status] ?? templates.RECEIVED;
  }

  function buildMessage() {
    return templateForStatus(invoice.deviceStatus).replaceAll(
      "{invoiceNo}",
      invoice.invoiceNo
    );
  }

  const canSend =
    invoice.deviceStatus !== "NO_PARTS" &&
    invoice.mobile &&
    isValidKsaMobile(invoice.mobile);
  const normalizedMobile = invoice.mobile ? normalizeMobile(invoice.mobile) : "";

  async function sendMessage(channel: "WHATSAPP" | "SMS") {
    if (!canSend) return;
    setSending(true);
    setError("");
    try {
      const data = await safeFetchJson<{ url: string }>("/api/messages/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceId: invoice.id,
          channel,
          customBody: composerMessage
        })
      });
      window.open(data.url, "_blank");
      await safeFetchJson(`/api/invoices/${invoice.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contactedCustomer: true })
      });
      setInvoice((prev: any) => ({ ...prev, contactedCustomer: true }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر إرسال الرسالة");
    }
    setSending(false);
    setComposerOpen(false);
  }

  return (
    <Layout title="تفاصيل الفاتورة">
      {error && <p className="mb-4 text-sm text-rose-600">{error}</p>}
      <div className="rounded bg-white p-6 shadow-sm">
        <div className="text-sm text-slate-500">رقم الفاتورة</div>
        <div className="text-2xl font-semibold">{invoice.invoiceNo}</div>
        <div className="mt-2 text-sm text-slate-500">
          تاريخ الإنشاء: {new Date(invoice.createdAt).toLocaleString("ar-SA")}
        </div>
        <div className="mt-1 text-sm text-slate-500">
          وقت الاستلام: {new Date(invoice.receivedAt).toLocaleString("ar-SA")}
        </div>
        {invoice.deliveredAt && (
          <div className="mt-1 text-sm text-slate-500">
            وقت التسليم: {new Date(invoice.deliveredAt).toLocaleString("ar-SA")}
          </div>
        )}
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-slate-700">
            بيانات أساسية
          </h2>
          <div className="grid gap-3">
            <div>
              <div className="mb-1 text-sm text-slate-700">
                اسم الموظف المستلم
              </div>
              <div className="inline-flex rounded border border-slate-200 p-1">
                {staffOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() =>
                      setInvoice({ ...invoice, staffReceiver: option })
                    }
                    className={`rounded px-3 py-1 text-sm ${
                      invoice.staffReceiver === option
                        ? "bg-slate-900 text-white"
                        : "text-slate-600"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
            <Input
              label="اسم العميل"
              value={invoice.customerName ?? ""}
              onChange={(event) =>
                setInvoice({ ...invoice, customerName: event.target.value })
              }
            />
            <Input
              label="رقم الجوال"
              value={invoice.mobile ?? ""}
              onChange={(event) =>
                setInvoice({ ...invoice, mobile: event.target.value })
              }
            />
            <Input
              label="نوع الجهاز"
              value={invoice.deviceType ?? ""}
              onChange={(event) =>
                setInvoice({ ...invoice, deviceType: event.target.value })
              }
            />
            <Input
              label="المشكلة"
              value={invoice.problem ?? ""}
              onChange={(event) =>
                setInvoice({ ...invoice, problem: event.target.value })
              }
            />
          </div>
        </div>

        <div className="rounded bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-slate-700">
            حالة الفاتورة
          </h2>
          <div className="grid gap-3">
            <Select
              label="حالة الجهاز"
              value={invoice.deviceStatus}
              onChange={(event) =>
                setInvoice({ ...invoice, deviceStatus: event.target.value })
              }
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
            {invoice.deviceStatus === "NO_PARTS" && (
              <div className="text-xs text-slate-500">
                داخلي – لا يُرسل للعميل
              </div>
            )}
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={invoice.contactedCustomer}
                onChange={(event) =>
                  setInvoice({
                    ...invoice,
                    contactedCustomer: event.target.checked
                  })
                }
              />
              هل تم التواصل مع العميل؟
            </label>
            <Input
              label="السعر المتفق عليه"
              value={invoice.agreedPrice ?? ""}
              onChange={(event) =>
                setInvoice({ ...invoice, agreedPrice: event.target.value })
              }
            />
            <TextArea
              label="ملاحظات"
              value={invoice.notes ?? ""}
              onChange={(event) =>
                setInvoice({ ...invoice, notes: event.target.value })
              }
            />
          </div>
        </div>
      </div>

      <div className="mt-6 rounded bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-slate-700">
          حالة التسليم
        </h2>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={Boolean(invoice.isDelivered)}
              onChange={(event) =>
                setInvoice({
                  ...invoice,
                  isDelivered: event.target.checked,
                  deviceStatus: event.target.checked ? "DELIVERED" : invoice.deviceStatus
                })
              }
            />
            هل تم التسليم؟
          </label>
          <Input
            label="اسم المستلم"
            value={invoice.receiverName ?? ""}
            onChange={(event) =>
              setInvoice({ ...invoice, receiverName: event.target.value })
            }
          />
          <div className="text-sm text-slate-500">
            وقت التسليم:{" "}
            {invoice.deliveredAt
              ? new Date(invoice.deliveredAt).toLocaleString("ar-SA")
              : "-"}
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <button
          onClick={save}
          className="rounded bg-slate-900 px-6 py-2 text-white"
          disabled={saving}
        >
          حفظ التعديلات
        </button>
        <div className="w-full rounded border border-slate-200 p-3">
          <div className="mb-2 text-sm font-semibold text-slate-700">
            إجراءات التواصل مع العميل
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              className="rounded border border-slate-200 px-4 py-2 text-sm"
              onClick={() => {
                setComposerChannel("WHATSAPP");
                setComposerMessage(buildMessage());
                setComposerOpen(true);
              }}
              disabled={!canSend || sending}
            >
              رسالة واتساب
            </button>
            <button
              className="rounded border border-slate-200 px-4 py-2 text-sm"
              onClick={() => {
                setComposerChannel("SMS");
                setComposerMessage(buildMessage());
                setComposerOpen(true);
              }}
              disabled={!canSend || sending}
            >
              رسالة نصية
            </button>
            <button
              className="rounded border border-slate-200 px-4 py-2 text-sm"
              onClick={async () => {
                if (!canSend) return;
                window.open(`tel:${normalizedMobile}`, "_self");
                await fetch(`/api/invoices/${invoice.id}`, {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ contactedCustomer: true })
                });
                setInvoice((prev: any) => ({ ...prev, contactedCustomer: true }));
              }}
              disabled={!canSend}
            >
              اتصال
            </button>
            {!canSend && (
              <span className="text-sm text-rose-600">
                {invoice.deviceStatus === "NO_PARTS"
                  ? "داخلي – لا يُرسل للعميل."
                  : "لا يمكن التواصل بدون رقم جوال صحيح."}
              </span>
            )}
          </div>
        </div>
      </div>

      {composerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 px-4">
          <div className="w-full max-w-lg rounded bg-white p-4 shadow-lg">
            <div className="text-sm font-semibold text-slate-700">
              محتوى الرسالة
            </div>
            <textarea
              className="mt-3 h-32 w-full rounded border border-slate-200 p-3 text-sm"
              value={composerMessage}
              onChange={(event) => setComposerMessage(event.target.value)}
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                className="rounded border border-slate-200 px-4 py-2 text-sm"
                onClick={() => setComposerOpen(false)}
                disabled={sending}
              >
                إلغاء
              </button>
              <button
                className="rounded bg-slate-900 px-4 py-2 text-sm text-white"
                onClick={() => sendMessage(composerChannel)}
                disabled={sending}
              >
                إرسال
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(
    context.req,
    context.res,
    authOptions
  );
  if (!session) {
    return {
      redirect: { destination: "/login", permanent: false }
    };
  }
  return { props: {} };
};
