import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import Input from "@/components/Input";
import Select from "@/components/Select";
import TextArea from "@/components/TextArea";
import { safeFetchJson } from "@/lib/apiClient";
import { getServerSession } from "next-auth";
import type { GetServerSideProps } from "next";
import { authOptions } from "../api/auth/[...nextauth]";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings as SettingsIcon,
  MessageSquare,
  Store,
  Save,
  X,
  Check,
  ChevronLeft,
  Smartphone,
  MessageCircle,
  BellRing
} from "lucide-react";

type Template = {
  id: string;
  code: string;
  titleAr: string;
  bodyAr: string;
  channel: string;
  enabled: boolean;
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<any>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function load() {
    setLoading(true);
    try {
      const [settingsData, templateData] = await Promise.all([
        safeFetchJson<{ settings: any }>("/api/settings"),
        safeFetchJson<{ templates: Template[] }>("/api/templates")
      ]);
      setSettings(settingsData.settings);
      setTemplates(templateData.templates ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر تحميل الإعدادات");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function saveSettings() {
    setError("");
    setSuccess("");
    setSavingSettings(true);
    try {
      await safeFetchJson("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings)
      });
      setSuccess("تم حفظ إعدادات المتجر بنجاح");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر حفظ الإعدادات");
    } finally {
      setSavingSettings(false);
    }
  }

  async function saveTemplate() {
    if (!editingTemplate) return;
    setError("");
    setSuccess("");
    setSavingTemplate(true);
    try {
      await safeFetchJson("/api/templates", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingTemplate)
      });
      setSuccess("تم حفظ قالب الرسالة بنجاح");
      setEditingTemplate(null);
      await load();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر حفظ القالب");
    } finally {
      setSavingTemplate(false);
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (loading && !settings) {
    return (
      <Layout>
        <div className="flex h-64 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent shadow-sm"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mx-auto max-w-5xl space-y-8 pb-10">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-text-main tracking-tight">الإعدادات العامة</h1>
            <p className="text-text-muted font-bold">تخصيص بيانات المتجر وقوالب الرسائل التلقائية</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-surface-elevated flex items-center justify-center border border-border shadow-sm">
            <SettingsIcon className="h-6 w-6 text-text-subtle" />
          </div>
        </div>

        {/* Status Messages */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="rounded-2xl border border-danger-border bg-danger-bg p-4 text-sm font-bold text-danger-text flex items-center gap-3"
            >
              <div className="h-2 w-2 rounded-full bg-danger animate-pulse" />
              {error}
            </motion.div>
          )}
          {success && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="rounded-2xl border border-success-border bg-success-bg p-4 text-sm font-bold text-success-text flex items-center gap-3"
            >
              <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
              {success}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid gap-10"
        >
          {/* Shop Information Section */}
          <motion.section variants={sectionVariants} className="rounded-3xl border border-border bg-surface shadow-sm overflow-hidden">
            <div className="border-b border-border/50 bg-surface-elevated/50 px-6 py-5 flex items-center gap-3 text-text-main">
              <Store className="h-5 w-5 text-primary" />
              <h2 className="font-black">بيانات المتجر</h2>
            </div>
            <div className="p-6 md:p-8">
              <div className="grid gap-6 md:grid-cols-2">
                <Input
                  label="اسم المتجر"
                  placeholder="مثلاً: سيتي فون للصيانة"
                  value={settings.shopName ?? ""}
                  onChange={(event) =>
                    setSettings({ ...settings, shopName: event.target.value })
                  }
                />
                <Input
                  label="رقم التواصل (واتساب)"
                  placeholder="9665XXXXXXXX"
                  value={settings.shopPhone ?? ""}
                  onChange={(event) =>
                    setSettings({ ...settings, shopPhone: event.target.value })
                  }
                />
              </div>
              <div className="mt-10 flex justify-end">
                <button
                  disabled={savingSettings}
                  className="flex items-center gap-2 rounded-2xl bg-primary px-8 py-3.5 text-base font-black text-white shadow-xl shadow-primary/20 transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
                  onClick={saveSettings}
                >
                  {savingSettings ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <Save className="h-5 w-5" />
                  )}
                  <span>حفظ التعديلات</span>
                </button>
              </div>
            </div>
          </motion.section>

          {/* Message Templates Section */}
          <motion.section variants={sectionVariants} className="rounded-3xl border border-border bg-surface shadow-sm overflow-hidden">
            <div className="border-b border-border/50 bg-surface-elevated/50 px-6 py-5 flex items-center gap-3 text-text-main">
              <BellRing className="h-5 w-5 text-primary" />
              <h2 className="font-black">قوالب الرسائل التلقائية</h2>
            </div>
            <div className="p-6 md:p-8">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    className={`flex items-center justify-between rounded-2xl border p-5 text-right transition-all hover:bg-surface-elevated group active:scale-[0.98] ${editingTemplate?.id === template.id
                      ? 'border-primary bg-primary/5 ring-4 ring-primary/10'
                      : 'border-border bg-surface'
                      }`}
                    onClick={() => setEditingTemplate(template)}
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-text-main">{template.titleAr}</span>
                      <span className="text-[10px] font-black text-text-subtle font-mono mt-1 uppercase tracking-tighter bg-surface-elevated px-2 py-0.5 rounded-md w-fit">{template.code}</span>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-elevated text-text-subtle transition-all group-hover:bg-surface group-hover:text-primary shadow-sm">
                      <ChevronLeft className="h-5 w-5 font-bold" />
                    </div>
                  </button>
                ))}
              </div>

              {/* Template Editor */}
              <AnimatePresence mode="wait">
                {editingTemplate && (
                  <motion.div
                    key={editingTemplate.id}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className="mt-10 rounded-3xl border border-primary/20 bg-primary/5 p-8 shadow-inner relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 h-1 w-full bg-primary/20" />
                    <div className="mb-8 flex items-center justify-between">
                      <h3 className="font-black text-primary flex items-center gap-2 text-lg">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <MessageCircle className="h-5 w-5" />
                        </div>
                        <span>تعديل قالب: {editingTemplate.titleAr}</span>
                      </h3>
                      <button
                        onClick={() => setEditingTemplate(null)}
                        className="rounded-xl p-2 text-text-subtle hover:bg-surface hover:text-text-main transition-all shadow-sm"
                      >
                        <X className="h-6 w-6" />
                      </button>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                      <Input
                        label="عنوان القالب"
                        value={editingTemplate.titleAr}
                        onChange={(event) =>
                          setEditingTemplate({
                            ...editingTemplate,
                            titleAr: event.target.value
                          })
                        }
                      />
                      <Input
                        label="كود التعريف"
                        value={editingTemplate.code}
                        onChange={(event) =>
                          setEditingTemplate({
                            ...editingTemplate,
                            code: event.target.value
                          })
                        }
                      />
                      <Select
                        label="قناة الإرسال"
                        value={editingTemplate.channel}
                        onChange={(event) =>
                          setEditingTemplate({
                            ...editingTemplate,
                            channel: event.target.value
                          })
                        }
                      >
                        <option value="WHATSAPP">واتساب</option>
                        <option value="SMS">رسالة نصية SMS</option>
                      </Select>
                      <Select
                        label="حالة التفعيل"
                        value={editingTemplate.enabled ? "1" : "0"}
                        onChange={(event) =>
                          setEditingTemplate({
                            ...editingTemplate,
                            enabled: event.target.value === "1"
                          })
                        }
                      >
                        <option value="1">مفعل</option>
                        <option value="0">غير مفعل</option>
                      </Select>
                    </div>

                    <div className="mt-8">
                      <TextArea
                        label="نص الرسالة"
                        rows={6}
                        placeholder="استخدم المتغيرات مثل {name} و {invoiceNo}"
                        value={editingTemplate.bodyAr}
                        onChange={(event) =>
                          setEditingTemplate({
                            ...editingTemplate,
                            bodyAr: event.target.value
                          })
                        }
                        className="min-h-[160px]"
                      />
                      <div className="mt-2 text-[10px] font-black text-text-subtle uppercase tracking-widest bg-surface-elevated/50 px-3 py-1.5 rounded-lg w-fit">
                        المتغيرات المتاحة: &#123;name&#125;, &#123;invoiceNo&#125;, &#123;device&#125;, &#123;problem&#125;
                      </div>
                    </div>

                    <div className="mt-10 flex items-center justify-end gap-4">
                      <button
                        className="rounded-2xl border border-border bg-surface px-8 py-3.5 text-sm font-black text-text-muted transition-all hover:bg-surface-elevated active:scale-95 shadow-sm"
                        onClick={() => setEditingTemplate(null)}
                      >
                        إلغاء
                      </button>
                      <button
                        disabled={savingTemplate}
                        className="flex items-center gap-2 rounded-2xl bg-primary px-10 py-3.5 text-base font-black text-white shadow-xl shadow-primary/20 transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
                        onClick={saveTemplate}
                      >
                        {savingTemplate ? (
                          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        ) : (
                          <Check className="h-5 w-5" />
                        )}
                        <span>حفظ التغييرات</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.section>
        </motion.div>
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
  if ((session.user as any)?.role !== "ADMIN") {
    return {
      redirect: { destination: "/control", permanent: false }
    };
  }
  return { props: {} };
};
