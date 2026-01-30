import { getServerSession } from "next-auth";
import type { GetServerSideProps } from "next";
import { authOptions } from "./api/auth/[...nextauth]";
import Layout from "@/components/Layout";
import Input from "@/components/Input";
import { useEffect, useState } from "react";
import { isValidKsaMobile, normalizeMobile } from "@/lib/phone";
import { safeFetchJson } from "@/lib/apiClient";

export default function Home() {
  const [customerName, setCustomerName] = useState("");
  const [mobile, setMobile] = useState("");
  const [deviceType, setDeviceType] = useState("");
  const [problem, setProblem] = useState("");
  const [agreedPrice, setAgreedPrice] = useState("");
  const [staffReceiver, setStaffReceiver] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [savedInvoice, setSavedInvoice] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [settings, setSettings] = useState<any>(null);
  const staffOptions = ["محمد", "زمران", "سالم"];

  useEffect(() => {
    safeFetchJson<{ settings: any }>("/api/settings")
      .then((data) => setSettings(data.settings ?? null))
      .catch(() => setSettings(null));
  }, []);

  async function submit() {
    setError("");
    const values = [customerName, mobile, deviceType, problem].filter(
      (value) => value.trim().length > 0
    );
    const comboA = customerName.trim() && deviceType.trim();
    const comboB = mobile.trim() && problem.trim();
    if (!(comboA || comboB || values.length >= 2)) {
      setError(
        "أدخل على الأقل أي حقلين (مثل: اسم العميل + نوع الجهاز) أو (رقم الجوال + المشكلة)."
      );
      return;
    }
    setSaving(true);
    try {
      const data = await safeFetchJson<{ invoice: any }>("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          mobile,
          deviceType,
          problem,
          staffReceiver,
          agreedPrice
        })
      });
      setSavedInvoice(data.invoice);
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر حفظ الفاتورة");
    }
    setSaving(false);
  }

  function resetForm() {
    setCustomerName("");
    setMobile("");
    setDeviceType("");
    setProblem("");
    setAgreedPrice("");
    setSavedInvoice(null);
  }

  const canSend = savedInvoice?.mobile
    ? isValidKsaMobile(savedInvoice.mobile)
    : false;
  const normalizedMobile = savedInvoice?.mobile
    ? normalizeMobile(savedInvoice.mobile)
    : "";

  const messageText = savedInvoice
    ? [
        `فاتورتك رقم ${savedInvoice.invoiceNo}.`,
        savedInvoice.customerName
          ? `العميل: ${savedInvoice.customerName}.`
          : null,
        savedInvoice.deviceType
          ? `الجهاز: ${savedInvoice.deviceType}.`
          : null,
        savedInvoice.problem ? `المشكلة: ${savedInvoice.problem}.` : null,
        settings?.shopPhone ? `للاستفسار: ${settings.shopPhone}` : null
      ]
        .filter(Boolean)
        .join(" ")
    : "";

  async function sendMessage(channel: "WHATSAPP" | "SMS") {
    if (!savedInvoice?.id) return;
    setSending(true);
    try {
      const data = await safeFetchJson<{ url: string }>("/api/messages/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceId: savedInvoice.id,
          channel,
          customBody: messageText
        })
      });
      window.open(data.url, "_blank");
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر إرسال الرسالة");
    }
    setSending(false);
  }

  return (
    <Layout title="إضافة فاتورة">
      <div className="rounded bg-white p-6 shadow-sm">
        {error && <p className="mb-4 text-sm text-rose-600">{error}</p>}
        <div className="mb-4">
          <div className="mb-1 text-sm text-slate-700">اسم الموظف المستلم</div>
          <div className="inline-flex rounded border border-slate-200 p-1">
            {staffOptions.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setStaffReceiver(option)}
                className={`rounded px-3 py-1 text-sm ${
                  staffReceiver === option
                    ? "bg-slate-900 text-white"
                    : "text-slate-600"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="اسم العميل"
            value={customerName}
            onChange={(event) => setCustomerName(event.target.value)}
          />
          <Input
            label="رقم الجوال"
            value={mobile}
            onChange={(event) => setMobile(event.target.value)}
          />
          <Input
            label="نوع الجهاز"
            value={deviceType}
            onChange={(event) => setDeviceType(event.target.value)}
          />
          <Input
            label="المشكلة"
            value={problem}
            onChange={(event) => setProblem(event.target.value)}
          />
          <Input
            label="سعر المتفق عليه"
            value={agreedPrice}
            onChange={(event) => setAgreedPrice(event.target.value)}
          />
        </div>

        <div className="mt-6 flex items-center gap-3">
          <button
            onClick={submit}
            className="rounded bg-slate-900 px-6 py-2 text-white"
            disabled={saving}
          >
            حفظ الفاتورة
          </button>
          <button
            onClick={resetForm}
            className="rounded border border-slate-200 px-6 py-2"
          >
            تفريغ
          </button>
        </div>
      </div>

      {savedInvoice && (
        <div className="mt-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded bg-white p-4 shadow-sm">
            <div className="text-sm text-slate-500">
              تم حفظ الفاتورة:{" "}
              <span className="font-semibold text-slate-900">
                {savedInvoice.invoiceNo}
              </span>
            </div>
            <button
              className="rounded border border-slate-200 px-4 py-2"
              onClick={resetForm}
            >
              تفريغ
            </button>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              className="rounded border border-slate-200 px-4 py-2"
              onClick={() =>
                window.open(`/invoices/${savedInvoice.id}/print`, "_blank")
              }
            >
              طباعة الفاتورة
            </button>
            <button
              className="rounded border border-slate-200 px-4 py-2"
              onClick={() => sendMessage("SMS")}
              disabled={!canSend || sending}
            >
              رسالة نصية
            </button>
            <button
              className="rounded border border-slate-200 px-4 py-2"
              onClick={() => sendMessage("WHATSAPP")}
              disabled={!canSend || sending}
            >
              رسالة واتساب
            </button>
            <button
              className="rounded border border-slate-200 px-4 py-2"
              onClick={async () => {
                await sendMessage("SMS");
                await sendMessage("WHATSAPP");
              }}
              disabled={!canSend || sending}
            >
              إرسال الاثنين
            </button>
            {!canSend && (
              <span className="text-sm text-rose-600">
                لا يمكن الإرسال بدون رقم جوال صحيح.
              </span>
            )}
          </div>
          <div className="text-sm text-slate-500">
            رقم الجوال المحفوظ: {normalizedMobile || "-"}
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
      redirect: {
        destination: "/login",
        permanent: false
      }
    };
  }
  return { props: {} };
};
