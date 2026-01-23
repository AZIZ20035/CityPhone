import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import Input from "@/components/Input";
import TextArea from "@/components/TextArea";
import Select from "@/components/Select";
import { getServerSession } from "next-auth";
import type { GetServerSideProps } from "next";
import { authOptions } from "../api/auth/[...nextauth]";

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
  const [error, setError] = useState("");

  async function load() {
    const [settingsRes, templateRes] = await Promise.all([
      fetch("/api/settings"),
      fetch("/api/templates")
    ]);
    setSettings((await settingsRes.json()).settings);
    setTemplates((await templateRes.json()).templates ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  async function saveSettings() {
    setError("");
    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings)
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "تعذر حفظ الإعدادات");
    }
  }

  async function saveTemplate() {
    if (!editingTemplate) return;
    setError("");
    const res = await fetch("/api/templates", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editingTemplate)
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "تعذر حفظ القالب");
      return;
    }
    setEditingTemplate(null);
    await load();
  }

  if (!settings) {
    return (
      <Layout title="الإعدادات">
        <div className="rounded bg-white p-6 shadow-sm">جاري التحميل...</div>
      </Layout>
    );
  }

  return (
    <Layout title="الإعدادات">
      {error && <p className="mb-4 text-sm text-rose-600">{error}</p>}
      <div className="rounded bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-slate-700">
          بيانات المتجر
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="اسم المتجر"
            value={settings.shopName ?? ""}
            onChange={(event) =>
              setSettings({ ...settings, shopName: event.target.value })
            }
          />
          <Input
            label="رقم المتجر"
            value={settings.shopPhone ?? ""}
            onChange={(event) =>
              setSettings({ ...settings, shopPhone: event.target.value })
            }
          />
          <Input
            label="مفتاح واتساب (اختياري)"
            value={settings.whatsappApiKey ?? ""}
            onChange={(event) =>
              setSettings({ ...settings, whatsappApiKey: event.target.value })
            }
          />
          <Input
            label="مفتاح SMS (اختياري)"
            value={settings.smsApiKey ?? ""}
            onChange={(event) =>
              setSettings({ ...settings, smsApiKey: event.target.value })
            }
          />
        </div>
        <div className="mt-4">
          <button
            className="rounded bg-slate-900 px-4 py-2 text-white"
            onClick={saveSettings}
          >
            حفظ الإعدادات
          </button>
        </div>
      </div>

      <div className="mt-6 rounded bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-slate-700">
          قوالب الرسائل
        </h2>
        <div className="grid gap-3">
          {templates.map((template) => (
            <button
              key={template.id}
              className="rounded border border-slate-200 px-3 py-2 text-right text-sm hover:bg-slate-50"
              onClick={() => setEditingTemplate(template)}
            >
              {template.titleAr} ({template.code})
            </button>
          ))}
        </div>
        {editingTemplate && (
          <div className="mt-6 rounded border border-slate-200 p-4">
            <div className="grid gap-3 md:grid-cols-2">
              <Input
                label="الكود"
                value={editingTemplate.code}
                onChange={(event) =>
                  setEditingTemplate({
                    ...editingTemplate,
                    code: event.target.value
                  })
                }
              />
              <Input
                label="العنوان"
                value={editingTemplate.titleAr}
                onChange={(event) =>
                  setEditingTemplate({
                    ...editingTemplate,
                    titleAr: event.target.value
                  })
                }
              />
              <Select
                label="القناة"
                value={editingTemplate.channel}
                onChange={(event) =>
                  setEditingTemplate({
                    ...editingTemplate,
                    channel: event.target.value
                  })
                }
              >
                <option value="WHATSAPP">واتساب</option>
                <option value="SMS">SMS</option>
              </Select>
              <Select
                label="مفعل"
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
            <div className="mt-3">
              <TextArea
                label="نص الرسالة"
                value={editingTemplate.bodyAr}
                onChange={(event) =>
                  setEditingTemplate({
                    ...editingTemplate,
                    bodyAr: event.target.value
                  })
                }
              />
            </div>
            <div className="mt-4 flex gap-2">
              <button
                className="rounded bg-slate-900 px-4 py-2 text-white"
                onClick={saveTemplate}
              >
                حفظ القالب
              </button>
              <button
                className="rounded border border-slate-200 px-4 py-2"
                onClick={() => setEditingTemplate(null)}
              >
                إلغاء
              </button>
            </div>
          </div>
        )}
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
