import { getServerSession } from "next-auth";
import type { GetServerSideProps } from "next";
import { authOptions } from "./api/auth/[...nextauth]";
import Layout from "@/components/Layout";
import Input from "@/components/Input";
import { useEffect, useState } from "react";
import { isValidKsaMobile, normalizeMobile } from "@/lib/phone";
import { safeFetchJson } from "@/lib/apiClient";
import { motion, AnimatePresence } from "framer-motion";

type FieldErrors = {
    mobile?: string;
    general?: string;
};

export default function Home() {
    const [customerName, setCustomerName] = useState("");
    const [mobile, setMobile] = useState("");
    const [deviceType, setDeviceType] = useState("");
    const [problem, setProblem] = useState("");
    const [agreedPrice, setAgreedPrice] = useState("");
    const [staffReceiver, setStaffReceiver] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
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

    function clearFieldError(field: keyof FieldErrors) {
        setFieldErrors((prev) => {
            const next = { ...prev };
            delete next[field];
            return next;
        });
    }

    async function submit() {
        const errors: FieldErrors = {};

        if (mobile.trim()) {
            if (!isValidKsaMobile(mobile)) {
                errors.mobile = "رقم جوال غير صحيح. الصيغة الصحيحة: 05XXXXXXXX";
            }
        }

        const values = [customerName, mobile, deviceType, problem].filter(
            (value) => value.trim().length > 0
        );
        const comboA = customerName.trim() && deviceType.trim();
        const comboB = mobile.trim() && problem.trim();
        if (!(comboA || comboB || values.length >= 2)) {
            errors.general =
                "أدخل على الأقل أي حقلين (مثل: اسم العميل + نوع الجهاز) أو (رقم الجوال + المشكلة).";
        }

        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            return;
        }

        setFieldErrors({});
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
            setFieldErrors({
                general: err instanceof Error ? err.message : "تعذر حفظ الفاتورة"
            });
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
        setFieldErrors({});
    }

    const canSend = savedInvoice?.mobile
        ? isValidKsaMobile(savedInvoice.mobile)
        : false;
    const normalizedMobile = savedInvoice?.mobile
        ? normalizeMobile(savedInvoice.mobile)
        : "";

    const messageText = savedInvoice
        ? [
            `فاتورتك رقم "${savedInvoice.invoiceNo}".`,
            savedInvoice.customerName
                ? `العميل: "${savedInvoice.customerName}".`
                : null,
            savedInvoice.deviceType
                ? `الجهاز: "${savedInvoice.deviceType}".`
                : null,
            savedInvoice.problem ? `المشكلة: "${savedInvoice.problem}".` : null,
            settings?.shopPhone ? `للاستفسار: "${settings.shopPhone}"` : null
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

            // Fix: Directly open the URL if API returns it.
            if (data.url) {
                window.open(data.url, "_blank");
            }
        } catch (err) {
            setFieldErrors({
                general: err instanceof Error ? err.message : "تعذر إرسال الرسالة"
            });
        }
        setSending(false);
    }

    return (
        <Layout>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2 space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-surface rounded-3xl border border-border shadow-sm overflow-hidden"
                    >
                        <div className="border-b border-border/50 bg-surface-elevated/50 px-6 py-5 flex items-center justify-between">
                            <h3 className="font-black text-text-main flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-primary" />
                                بيانات الصيانة
                            </h3>
                            <div className="text-xs font-black text-text-muted border border-border rounded-full px-3 py-1 bg-surface">يرجى تعبئة حقلين على الأقل</div>
                        </div>
                        <div className="p-6 md:p-8">
                            {fieldErrors.general && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    className="mb-6 flex items-center gap-3 rounded-2xl border border-danger-border bg-danger-bg px-4 py-4 text-sm font-bold text-danger-text"
                                >
                                    <svg className="h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    {fieldErrors.general}
                                </motion.div>
                            )}

                            <div className="mb-8">
                                <label className="text-sm font-black text-text-main mb-3 block mr-1">الموظف المستلم</label>
                                <div className="flex flex-wrap gap-3">
                                    {staffOptions.map((option) => (
                                        <button
                                            key={option}
                                            type="button"
                                            onClick={() => setStaffReceiver(option)}
                                            className={`relative flex-1 min-w-[100px] h-12 rounded-2xl border-2 text-sm font-black transition-all
                                                ${staffReceiver === option
                                                    ? "border-primary bg-primary text-white shadow-lg shadow-primary/20"
                                                    : "border-border bg-surface-elevated text-text-muted hover:border-border-strong hover:bg-surface-strong"
                                                }`}
                                        >
                                            {option}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid gap-6 md:grid-cols-2">
                                <Input
                                    label="اسم العميل"
                                    value={customerName}
                                    onChange={(event) => setCustomerName(event.target.value)}
                                    placeholder="أدخل اسم العميل بالكامل"
                                />
                                <Input
                                    label="رقم الجوال"
                                    value={mobile}
                                    placeholder="05XXXXXXXX"
                                    type="tel"
                                    error={fieldErrors.mobile}
                                    onChange={(event) => {
                                        setMobile(event.target.value);
                                        clearFieldError("mobile");
                                    }}
                                />
                                <Input
                                    label="نوع الجهاز"
                                    value={deviceType}
                                    onChange={(event) => setDeviceType(event.target.value)}
                                    placeholder="مثلاً: iPhone 14 Pro Max"
                                />
                                <Input
                                    label="المشكلة / العطل"
                                    value={problem}
                                    onChange={(event) => setProblem(event.target.value)}
                                    placeholder="صف عطل الجهاز"
                                />
                                <Input
                                    label="السعر المتفق عليه (ر.س)"
                                    value={agreedPrice}
                                    type="number"
                                    onChange={(event) => setAgreedPrice(event.target.value)}
                                    placeholder="0"
                                    className="md:col-start-1"
                                />
                            </div>

                            <div className="mt-10 flex flex-wrap items-center gap-4">
                                <button
                                    onClick={submit}
                                    className="h-14 flex-1 rounded-2xl bg-primary px-8 text-base font-black text-white shadow-xl shadow-primary/20 transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
                                    disabled={saving}
                                >
                                    {saving ? "جاري الحفظ..." : "حفظ وطباعة الفاتورة"}
                                </button>
                                <button
                                    onClick={resetForm}
                                    className="h-14 rounded-2xl border border-border bg-surface px-8 text-sm font-black text-text-muted transition-all hover:bg-surface-elevated active:scale-95"
                                >
                                    مسح البيانات
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>

                <div className="space-y-6">
                    <AnimatePresence>
                        {savedInvoice ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-success-bg rounded-3xl border border-success-border p-6 shadow-sm"
                            >
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="h-12 w-12 flex items-center justify-center rounded-2xl bg-success text-white shadow-lg shadow-success/20">
                                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h4 className="font-black text-success-text">تم الحفظ بنجاح</h4>
                                        <p className="text-xs font-bold text-success-text/80">رقم الفاتورة: {savedInvoice.invoiceNo}</p>
                                    </div>
                                </div>

                                <div className="grid gap-3">
                                    <button
                                        className="flex items-center justify-between w-full p-4 bg-surface rounded-2xl border border-success-border/50 hover:border-success-border transition-all shadow-sm group"
                                        onClick={() => window.open(`/invoices/${savedInvoice.id}/print`, "_blank")}
                                    >
                                        <span className="text-sm font-black text-text-main group-hover:text-primary transition-colors">طباعة الفاتورة</span>
                                        <svg className="h-5 w-5 text-text-subtle group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                        </svg>
                                    </button>

                                    <button
                                        className="flex items-center justify-between w-full p-4 bg-surface rounded-2xl border border-success-border/50 hover:border-success-border disabled:opacity-50 transition-all shadow-sm group"
                                        onClick={() => sendMessage("WHATSAPP")}
                                        disabled={!canSend || sending}
                                    >
                                        <span className="text-sm font-black text-text-main group-hover:text-emerald-500 transition-colors">إرسال عبر واتساب</span>
                                        <svg className="h-5 w-5 text-emerald-500" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.246 2.248 3.484 5.232 3.483 8.412-.003 6.557-5.338 11.892-11.893 11.892-1.997-.001-3.951-.5-5.688-1.448l-6.308 1.656zm6.304-4.008c1.552.922 3.392 1.409 5.269 1.41 5.513 0 10.038-4.524 10.041-10.038 0-2.673-1.04-5.186-2.93-7.078-1.89-1.891-4.401-2.933-7.076-2.933-5.515 0-10.041 4.524-10.044 10.038-.001 2.036.617 4.013 1.785 5.698l-1.131 4.129 4.226-1.108zm11.496-6.65c-.279-.14-1.651-.815-1.907-.907-.256-.092-.441-.139-.627.139-.186.279-.72.907-.883 1.092-.163.186-.325.21-.604.07-.279-.14-1.181-.435-2.249-1.388-.83-.74-1.391-1.653-1.553-1.933-.163-.28-.018-.431.122-.571.125-.126.279-.325.418-.488.14-.163.186-.279.279-.465.093-.186.047-.349-.023-.489-.07-.139-.627-1.512-.86-2.07-.227-.552-.455-.477-.627-.486-.163-.008-.349-.009-.535-.009-.186 0-.488.07-.744.349-.256.279-.976.953-.976 2.324s1 2.697 1.14 2.883c.14.186 1.968 3.006 4.767 4.209.666.286 1.187.456 1.591.585.669.213 1.278.183 1.76.111.537-.081 1.651-.674 1.883-1.326.233-.651.233-1.21.163-1.325s-.256-.21-.535-.35z" /></svg>
                                    </button>

                                    <button
                                        className="flex items-center justify-between w-full p-4 bg-surface rounded-2xl border border-success-border/50 hover:border-success-border disabled:opacity-50 transition-all shadow-sm group"
                                        onClick={() => sendMessage("SMS")}
                                        disabled={!canSend || sending}
                                    >
                                        <span className="text-sm font-black text-text-main group-hover:text-blue-500 transition-colors">إرسال رسالة نصية</span>
                                        <svg className="h-5 w-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                        </svg>
                                    </button>
                                </div>

                                <div className="mt-4 p-4 rounded-2xl bg-surface/50 border border-success-border/30">
                                    <div className="text-[10px] font-black text-success-text uppercase mb-2 tracking-widest">معلومات العميل</div>
                                    <div className="text-sm font-black text-text-main truncate">{normalizedMobile || "لا يوجد رقم مسجل"}</div>
                                    {savedInvoice.customerName && <div className="text-xs font-bold text-text-muted mt-1">{savedInvoice.customerName}</div>}
                                </div>
                            </motion.div>
                        ) : (
                            <div className="bg-surface-elevated/50 rounded-3xl border-2 border-dashed border-border p-8 flex flex-col items-center justify-center text-center">
                                <div className="h-16 w-16 rounded-3xl bg-surface-elevated flex items-center justify-center text-text-subtle mb-4 shadow-sm">
                                    <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <h4 className="font-black text-text-muted">لا توجد فاتورة حديثة</h4>
                                <p className="text-xs font-bold text-text-subtle mt-2 leading-relaxed">قم بتعبئة النموذج لإنشاء فاتورة جديدة وبدء عملية الصيانة</p>
                            </div>
                        )}
                    </AnimatePresence>

                    <div className="bg-primary rounded-3xl p-6 text-white shadow-xl shadow-primary/20 overflow-hidden relative group transition-transform hover:scale-[1.02]">
                        <div className="relative z-10">
                            <h4 className="font-black mb-2 flex items-center gap-2">
                                <span className="h-4 w-1 bg-white/30 rounded-full" />
                                نصيحة تقنية
                            </h4>
                            <p className="text-sm font-bold text-white/80 leading-relaxed">
                                يمكنك دائماً طباعة الفاتورة للعميل لضمان حقوقه. النظام يدعم الطباعة الحرارية والمقاسات القياسية.
                            </p>
                        </div>
                        <div className="absolute -bottom-6 -left-6 opacity-10 transition-transform group-hover:scale-110 group-hover:rotate-12">
                            <svg className="h-32 w-32" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                            </svg>
                        </div>
                    </div>
                </div>
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
            redirect: {
                destination: "/login",
                permanent: false
            }
        };
    }
    return { props: {} };
};
