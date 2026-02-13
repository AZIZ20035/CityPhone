import { useRouter } from "next/router";
import { useEffect, useState, useMemo, useCallback } from "react";
import Layout from "@/components/Layout";
import Input from "@/components/Input";
import Select from "@/components/Select";
import TextArea from "@/components/TextArea";
import { isValidKsaMobile, normalizeMobile } from "@/lib/phone";
import { safeFetchJson } from "@/lib/apiClient";
import { getServerSession } from "next-auth";
import type { GetServerSideProps } from "next";
import { authOptions } from "../api/auth/[...nextauth]";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  Save,
  MessageSquare,
  PhoneCall,
  Printer,
  Clock,
  User,
  Laptop,
  CheckCircle2,
  X,
  Send,
  MoreHorizontal,
  ClipboardList,
  UserCheck,
  Smartphone,
  Info
} from "lucide-react";
import Link from "next/link";

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
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [settings, setSettings] = useState<any>(null);
  const [composerOpen, setComposerOpen] = useState(false);
  const [composerChannel, setComposerChannel] = useState<"WHATSAPP" | "SMS">("WHATSAPP");
  const [composerMessage, setComposerMessage] = useState("");

  const staffOptions = ["محمد", "زمران", "سالم"];

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const data = await safeFetchJson<{ invoice: any }>(`/api/invoices/${id}`);
      setInvoice(data.invoice);
    } catch {
      setInvoice(null);
    }
  }, [id]);

  const loadSettings = useCallback(async () => {
    try {
      const data = await safeFetchJson<{ settings: any }>("/api/settings");
      setSettings(data.settings ?? null);
    } catch {
      setSettings(null);
    }
  }, []);

  useEffect(() => {
    load();
    loadSettings();
  }, [load, loadSettings]);

  async function save() {
    setSaving(true);
    setError("");
    setSuccess("");
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
          receiverName: invoice.receiverName,
          totalAmount: invoice.totalAmount
        })
      });
      setInvoice(data.invoice);
      setSuccess("تم حفظ التعديلات بنجاح");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر حفظ التعديلات");
    } finally {
      setSaving(false);
    }
  }

  function templateForStatus(status: string) {
    const templates: Record<string, string> = {
      RECEIVED: "تم استلام جهازك \"{deviceType}\" تحت رقم الفاتورة \"{invoiceNo}\". سنوافيك بالتحديثات.",
      IN_PROGRESS: "جاري العمل على جهازك \"{deviceType}\" تحت رقم الفاتورة \"{invoiceNo}\".",
      WAITING_PARTS: "فاتورتك رقم \"{invoiceNo}\" بانتظار وصول القطع. سنبلغك فور وصولها.",
      READY: "جهازك (\"{deviceType}\") جاهز للاستلام. رقم الفاتورة \"{invoiceNo}\". السعر: \"{price}\" ريال.",
      DELIVERED: "تم تسليم جهازك بنجاح. شكرًا لثقتكم بسيتي فون برو.",
      REFUSED: "تم تحديث الفاتورة رقم \"{invoiceNo}\": العميل رفض الإصلاح."
    };
    return templates[status] ?? templates.RECEIVED;
  }

  function buildMessage() {
    return templateForStatus(invoice.deviceStatus)
      .replaceAll("{invoiceNo}", invoice.invoiceNo)
      .replaceAll("{deviceType}", invoice.deviceType || "الجهاز")
      .replaceAll("{price}", String(invoice.agreedPrice || invoice.totalAmount || "0"));
  }

  const canSend = useMemo(() => {
    return (
      invoice?.deviceStatus !== "NO_PARTS" &&
      invoice?.mobile &&
      isValidKsaMobile(invoice.mobile)
    );
  }, [invoice]);

  const normalizedMobile = useMemo(() => {
    return invoice?.mobile ? normalizeMobile(invoice.mobile) : "";
  }, [invoice?.mobile]);

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

      // Mark as contacted
      const patch = await safeFetchJson<{ invoice: any }>(`/api/invoices/${invoice.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contactedCustomer: true })
      });
      setInvoice(patch.invoice);
      setComposerOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر إرسال الرسالة");
    } finally {
      setSending(false);
    }
  }

  if (!invoice) {
    return (
      <Layout>
        <div className="flex h-64 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent shadow-sm"></div>
        </div>
      </Layout>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <Layout>
      <div className="mx-auto max-w-5xl space-y-6 pb-28">
        {/* Top Navigation & Status */}
        <div className="flex items-center justify-between">
          <Link
            href="/control"
            className="group flex items-center gap-2 text-text-muted transition-colors hover:text-primary"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface border border-border transition-all group-hover:bg-primary/5 group-hover:border-primary/20 shadow-sm group-active:scale-95">
              <ChevronLeft className="h-5 w-5" />
            </div>
            <span className="text-sm font-black">العودة للجدول</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href={`/invoices/${invoice.id}/print`}
              className="flex items-center gap-2 rounded-2xl border border-border bg-surface px-5 py-2.5 text-sm font-black text-text-main shadow-sm transition-all hover:bg-surface-elevated hover:border-text-subtle/20 group active:scale-95"
            >
              <Printer className="h-4 w-4 text-text-subtle group-hover:text-primary transition-colors" />
              <span>طباعة الفاتورة</span>
            </Link>
          </div>
        </div>

        {/* Invoice Header Card */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[2.5rem] border border-border bg-surface p-8 shadow-xl md:p-10 overflow-hidden relative"
        >
          <div className="absolute top-0 right-0 h-1.5 w-full bg-gradient-to-l from-primary via-primary-600 to-indigo-500 opacity-80" />
          <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between relative z-10">
            <div className="space-y-3">
              <div className="flex items-center gap-4 mb-2">
                <span className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2 font-mono text-sm font-black text-white tracking-[0.2em] leading-none shadow-lg shadow-primary/20">
                  {invoice.invoiceNo}
                </span>
                {invoice.isDelivered && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-success-bg px-4 py-1.5 text-xs font-black text-success-text border border-success-border/50">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    تم التسليم
                  </span>
                )}
              </div>
              <h1 className="text-3xl font-black text-text-main tracking-tight">
                {invoice.customerName || "عميل بدون اسم"}
              </h1>
              <div className="flex flex-wrap gap-5 text-sm text-text-muted pt-1">
                <div className="flex items-center gap-2 bg-surface-elevated/50 px-3 py-1.5 rounded-xl border border-border/50">
                  <Clock className="h-4 w-4 text-primary/60" />
                  <span className="font-bold">تاريخ الاستلام: {new Date(invoice.receivedAt).toLocaleDateString("ar-SA")}</span>
                </div>
                <div className="flex items-center gap-2 bg-surface-elevated/50 px-3 py-1.5 rounded-xl border border-border/50">
                  <User className="h-4 w-4 text-primary/60" />
                  <span className="font-bold">المستلم: {invoice.staffReceiver || "غير محدد"}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end gap-2 bg-surface-elevated/30 p-6 rounded-[2rem] border border-border/50 backdrop-blur-sm">
              <div className="text-right">
                <p className="text-[10px] font-black text-text-subtle uppercase tracking-[0.2em] mb-2 mr-1">السعر الإجمالي</p>
                <div className="text-4xl font-black text-primary leading-none flex items-baseline gap-1">
                  {invoice.totalAmount || invoice.agreedPrice || 0}
                  <span className="text-sm font-black text-text-subtle tracking-normal">ر.س</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Alerts */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="rounded-2xl border border-danger-border bg-danger-bg p-5 text-sm font-black text-danger-text flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-danger animate-pulse" />
              {error}
            </motion.div>
          )}
          {success && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="rounded-2xl border border-success-border bg-success-bg p-5 text-sm font-black text-success-text flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
              {success}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content Sections */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid gap-8 md:grid-cols-2"
        >
          {/* Section: Customer & Device */}
          <motion.div variants={itemVariants} className="space-y-8">
            <div className="rounded-[2.5rem] border border-border bg-surface p-8 shadow-sm">
              <div className="mb-8 flex items-center gap-3 border-b border-border/50 pb-5">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Laptop className="h-5 w-5 text-primary" />
                </div>
                <h2 className="font-black text-text-main text-lg">بيانات الجهاز والعميل</h2>
              </div>
              <div className="space-y-6">
                <div className="grid gap-6">
                  <div>
                    <label className="mb-2 block text-[10px] font-black text-text-subtle uppercase tracking-[0.2em] mr-1">
                      الموظف المستلم
                    </label>
                    <div className="flex gap-3">
                      {staffOptions.map(staff => (
                        <button
                          key={staff}
                          type="button"
                          onClick={() => setInvoice({ ...invoice, staffReceiver: staff })}
                          className={`flex-1 rounded-[1.25rem] py-3 text-sm font-black transition-all active:scale-95 ${invoice.staffReceiver === staff
                            ? 'bg-primary text-white shadow-xl shadow-primary/20 ring-1 ring-primary'
                            : 'bg-surface-elevated text-text-muted hover:bg-surface-strong hover:text-text-main border border-border/50'
                            }`}
                        >
                          {staff}
                        </button>
                      ))}
                    </div>
                  </div>
                  <Input
                    label="اسم العميل"
                    value={invoice.customerName ?? ""}
                    onChange={(e) => setInvoice({ ...invoice, customerName: e.target.value })}
                  />
                  <Input
                    label="رقم الجوال"
                    value={invoice.mobile ?? ""}
                    onChange={(e) => setInvoice({ ...invoice, mobile: e.target.value })}
                  />
                  <Input
                    label="نوع الجهاز"
                    value={invoice.deviceType ?? ""}
                    onChange={(e) => setInvoice({ ...invoice, deviceType: e.target.value })}
                  />
                  <TextArea
                    label="المشكلة"
                    value={invoice.problem ?? ""}
                    onChange={(e) => setInvoice({ ...invoice, problem: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Section: Workflow & Status */}
          <motion.div variants={itemVariants} className="space-y-8">
            <div className="rounded-[2.5rem] border border-border bg-surface p-8 shadow-sm">
              <div className="mb-8 flex items-center gap-3 border-b border-border/50 pb-5">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <ClipboardList className="h-5 w-5 text-primary" />
                </div>
                <h2 className="font-black text-text-main text-lg">حالة الإصلاح والتكاليف</h2>
              </div>
              <div className="space-y-6">
                <Select
                  label="خطوة العمل الحالية"
                  value={invoice.deviceStatus}
                  onChange={(e) => setInvoice({ ...invoice, deviceStatus: e.target.value })}
                >
                  {statusOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </Select>

                <div className="grid grid-cols-2 gap-6">
                  <Input
                    label="السعر المتفق عليه"
                    type="number"
                    value={invoice.agreedPrice ?? ""}
                    onChange={(e) => setInvoice({ ...invoice, agreedPrice: e.target.value })}
                  />
                  <Input
                    label="التكلفة النهائية"
                    type="number"
                    value={invoice.totalAmount ?? ""}
                    onChange={(e) => setInvoice({ ...invoice, totalAmount: e.target.value })}
                  />
                </div>

                <TextArea
                  label="ملاحظات فنية / إضافية"
                  rows={3}
                  value={invoice.notes ?? ""}
                  onChange={(e) => setInvoice({ ...invoice, notes: e.target.value })}
                />

                <div className="rounded-[1.5rem] bg-surface-elevated/50 p-5 border border-border/50 transition-all hover:bg-surface-elevated group">
                  <label className="flex items-center gap-4 cursor-pointer select-none">
                    <div className={`flex h-7 w-7 items-center justify-center rounded-xl border-2 transition-all active:scale-90 ${invoice.contactedCustomer ? 'bg-primary border-primary shadow-lg shadow-primary/20' : 'bg-surface border-border'
                      }`}>
                      {invoice.contactedCustomer && <CheckCircle2 className="h-4 w-4 text-white" />}
                    </div>
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={invoice.contactedCustomer}
                      onChange={(e) => setInvoice({ ...invoice, contactedCustomer: e.target.checked })}
                    />
                    <div className="text-sm font-black text-text-main group-hover:text-primary transition-colors">تم التواصل مع العميل مسبقاً</div>
                  </label>
                </div>
              </div>
            </div>

            {/* Delivery Status Card */}
            <div className={`rounded-[2.5rem] border p-8 transition-all shadow-sm ${invoice.isDelivered ? 'bg-success-bg/30 border-success-border/50 shadow-success-border/10' : 'bg-surface-elevated/30 border-border'
              }`}>
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center border transition-all ${invoice.isDelivered ? 'bg-success-bg border-success-border/50 shadow-sm' : 'bg-surface-elevated border-border/50'}`}>
                    <UserCheck className={`h-5 w-5 ${invoice.isDelivered ? 'text-success' : 'text-text-subtle'}`} />
                  </div>
                  <h2 className={`font-black text-lg ${invoice.isDelivered ? 'text-success-text' : 'text-text-main'}`}>بيانات التسليم</h2>
                </div>
                <label className="relative inline-flex cursor-pointer items-center group">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={invoice.isDelivered}
                    onChange={(e) => {
                      const val = e.target.checked;
                      setInvoice({
                        ...invoice,
                        isDelivered: val,
                        deviceStatus: val ? "DELIVERED" : invoice.deviceStatus
                      });
                    }}
                  />
                  <div className="w-14 h-7 bg-surface-strong peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-[20px] after:w-[20px] after:transition-all peer-checked:bg-success shadow-inner"></div>
                </label>
              </div>
              <AnimatePresence>
                {invoice.isDelivered && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-6 pt-2"
                  >
                    <Input
                      label="اسم الشخص المستلم"
                      value={invoice.receiverName ?? ""}
                      onChange={(e) => setInvoice({ ...invoice, receiverName: e.target.value })}
                    />
                    {invoice.deliveredAt && (
                      <div className="flex items-center gap-3 text-xs font-black text-success-text/80 bg-success-bg/50 p-4 rounded-2xl border border-success-border/30">
                        <div className="h-8 w-8 rounded-lg bg-surface flex items-center justify-center shadow-sm">
                          <Clock className="h-4 w-4" />
                        </div>
                        <span>وقت التسليم المسجل: {new Date(invoice.deliveredAt).toLocaleString("ar-SA")}</span>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>

        {/* Action Toolbar (Sticky) */}
        <div className="fixed bottom-0 left-0 z-30 w-full border-t border-border bg-surface/80 p-6 backdrop-blur-xl shadow-[0_-10px_40px_rgba(0,0,0,0.05)] dark:shadow-[0_-10px_40px_rgba(0,0,0,0.2)]">
          <div className="mx-auto max-w-5xl flex items-center justify-between gap-6">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setComposerChannel("WHATSAPP");
                  setComposerMessage(buildMessage());
                  setComposerOpen(true);
                }}
                disabled={!canSend || sending}
                className="flex items-center gap-3 rounded-[1.25rem] border border-border bg-surface-elevated px-5 py-3 text-sm font-black text-success transition-all hover:bg-surface hover:shadow-lg hover:border-success/30 disabled:opacity-30 active:scale-95"
              >
                <MessageSquare className="h-5 w-5" />
                <span className="hidden sm:inline">واتساب</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setComposerChannel("SMS");
                  setComposerMessage(buildMessage());
                  setComposerOpen(true);
                }}
                disabled={!canSend || sending}
                className="flex items-center gap-3 rounded-[1.25rem] border border-border bg-surface-elevated px-5 py-3 text-sm font-black text-info transition-all hover:bg-surface hover:shadow-lg hover:border-info/30 disabled:opacity-30 active:scale-95"
              >
                <Smartphone className="h-5 w-5" />
                <span className="hidden sm:inline">رسالة نصية</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!canSend) return;
                  window.open(`tel:${normalizedMobile}`, "_self");
                }}
                disabled={!canSend}
                className="flex items-center gap-3 rounded-[1.25rem] border border-border bg-surface-elevated px-5 py-3 text-sm font-black text-primary transition-all hover:bg-surface hover:shadow-lg hover:border-primary/30 disabled:opacity-30 active:scale-95"
              >
                <PhoneCall className="h-5 w-5" />
                <span className="hidden sm:inline">اتصال هاتي</span>
              </button>
            </div>

            <button
              onClick={save}
              disabled={saving}
              className="flex items-center gap-3 rounded-[1.25rem] bg-primary px-10 py-3.5 text-base font-black text-white shadow-2xl shadow-primary/30 transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
            >
              {saving ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <Save className="h-5 w-5" />
              )}
              <span>حفظ التعديلات</span>
            </button>
          </div>
        </div>

        {/* Message Composer Modal */}
        <AnimatePresence>
          {composerOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setComposerOpen(false)}
                className="absolute inset-0 bg-black/60 backdrop-blur-md"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 30 }}
                className="relative w-full max-w-lg rounded-[2.5rem] bg-surface border border-border p-8 shadow-2xl overflow-hidden"
              >
                <div className="absolute top-0 right-0 h-1 w-full bg-primary/20" />
                <div className="mb-8 flex items-center justify-between border-b border-border/50 pb-6">
                  <div className="flex items-center gap-4">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl shadow-sm ${composerChannel === "WHATSAPP" ? 'bg-success-bg text-success border border-success-border/50' : 'bg-info-bg text-info border border-info-border/50'
                      }`}>
                      {composerChannel === "WHATSAPP" ? <MessageSquare className="h-6 w-6" /> : <Smartphone className="h-6 w-6" />}
                    </div>
                    <div>
                      <h3 className="font-black text-text-main text-lg">محتوى الرسالة</h3>
                      <p className="text-xs font-bold text-text-muted">إرسال عبر {composerChannel === "WHATSAPP" ? 'واتساب' : 'SMS'}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setComposerOpen(false)}
                    className="rounded-xl p-2 text-text-subtle hover:bg-surface-elevated hover:text-text-main transition-all shadow-sm active:scale-95"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  <TextArea
                    label="نص الرسالة المرسلة للعميل"
                    className="min-h-[180px] text-base font-bold leading-relaxed"
                    value={composerMessage}
                    onChange={(e) => setComposerMessage(e.target.value)}
                  />
                  <div className="flex items-start gap-3 rounded-[1.5rem] bg-primary/5 p-5 text-xs font-black text-primary border border-primary/10">
                    <Info className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <p className="leading-relaxed">سيتم تسجيل عملية التواصل في سجل الفاتورة عند النقر على إرسال وتلقائياً تحديث حالة التواصل.</p>
                  </div>
                </div>

                <div className="mt-10 flex gap-4">
                  <button
                    onClick={() => setComposerOpen(false)}
                    className="flex-1 rounded-[1.5rem] border border-border py-4 font-black text-text-muted hover:bg-surface-elevated transition-all active:scale-95 shadow-sm"
                  >
                    تراجع
                  </button>
                  <button
                    disabled={sending}
                    onClick={() => sendMessage(composerChannel)}
                    className={`flex-[2] flex items-center justify-center gap-3 rounded-[1.5rem] py-4 font-black text-white shadow-2xl transition-all active:scale-95 ${composerChannel === "WHATSAPP" ? 'bg-success shadow-success/30 hover:opacity-90' : 'bg-info shadow-info/30 hover:opacity-90'
                      }`}
                  >
                    {sending ? (
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <Send className="h-6 w-6" />
                    )}
                    <span>إرسال الآن</span>
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
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
