import { useEffect, useMemo, useState } from "react";
import Layout from "@/components/Layout";
import { safeFetchJson } from "@/lib/apiClient";
import { getServerSession } from "next-auth";
import type { GetServerSideProps } from "next";
import { authOptions } from "./api/auth/[...nextauth]";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart3,
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Package,
  CalendarDays,
  ArrowUpRight
} from "lucide-react";
import Link from "next/link";

type Invoice = {
  id: string;
  deviceStatus: string;
  isDelivered: boolean;
  receivedAt: string;
  deliveredAt?: string | null;
};

export default function StatsPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    safeFetchJson<{ invoices: Invoice[] }>("/api/invoices")
      .then((data) => {
        setInvoices(data.invoices ?? []);
      })
      .catch(() => setInvoices([]))
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => {
    const totalReceived = invoices.length;
    const totalDelivered = invoices.filter((inv) => inv.isDelivered).length;
    const waitingParts = invoices.filter(
      (inv) => inv.deviceStatus === "WAITING_PARTS"
    ).length;
    const ready = invoices.filter((inv) => inv.deviceStatus === "READY").length;
    const refused = invoices.filter((inv) => inv.deviceStatus === "REFUSED").length;
    const today = new Date().toDateString();
    const todayNew = invoices.filter(
      (inv) => new Date(inv.receivedAt).toDateString() === today
    ).length;
    const deliveredTodayCount = invoices.filter(
      (inv) =>
        inv.deliveredAt &&
        new Date(inv.deliveredAt).toDateString() === today
    ).length;

    return {
      totalReceived,
      totalDelivered,
      waitingParts,
      ready,
      refused,
      todayNew,
      deliveredTodayCount
    };
  }, [invoices]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  return (
    <Layout>
      <div className="space-y-8 pb-10">
        {/* Page Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-black text-text-main tracking-tight">لوحة المؤشرات</h1>
          <p className="text-text-muted font-bold">نظرة عامة على أداء المركز وحالة الإصلاحات</p>
        </div>

        {/* Primary KPIs */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid gap-6 md:grid-cols-3"
        >
          <KpiCard
            title="إجمالي الأجهزة المستلمة"
            value={stats.totalReceived}
            icon={<Package className="h-6 w-6 text-primary" />}
            href="/control"
            color="primary"
          />
          <KpiCard
            title="الأجهزة المسلمة"
            value={stats.totalDelivered}
            icon={<CheckCircle2 className="h-6 w-6 text-success" />}
            href="/control?status=DELIVERED"
            color="success"
          />
          <KpiCard
            title="استلامات اليوم"
            value={stats.todayNew}
            icon={<CalendarDays className="h-6 w-6 text-info" />}
            href="/control?receivedDate=today"
            color="info"
          />
        </motion.div>

        {/* Workflow Stages */}
        <div className="space-y-4">
          <h2 className="text-xs font-black text-text-muted uppercase tracking-widest mr-1">مراحل العمل الحالية</h2>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid gap-6 md:grid-cols-3"
          >
            <StatusActionCard
              title="في انتظار القطع"
              value={stats.waitingParts}
              icon={<Clock className="h-5 w-5 text-warning-text" />}
              href="/control?status=WAITING_PARTS"
              borderColor="border-warning-border"
              bgColor="bg-warning-bg"
              textColor="text-warning-text"
            />
            <StatusActionCard
              title="جاهزة للتسليم"
              value={stats.ready}
              icon={<CheckCircle2 className="h-5 w-5 text-success-text" />}
              href="/control?status=READY"
              borderColor="border-success-border"
              bgColor="bg-success-bg"
              textColor="text-success-text"
            />
            <StatusActionCard
              title="تم التواصل والعميل رفض"
              value={stats.refused}
              icon={<XCircle className="h-5 w-5 text-danger-text" />}
              href="/control?status=REFUSED"
              borderColor="border-danger-border"
              bgColor="bg-danger-bg"
              textColor="text-danger-text"
            />
          </motion.div>
        </div>

        {/* Today's Summary */}
        <div className="rounded-3xl border border-border bg-surface p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between border-b border-border/50 pb-5">
            <h2 className="text-lg font-black text-text-main flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <span>ملخص أداء اليوم</span>
            </h2>
            <div className="text-xs font-black text-text-subtle bg-surface-elevated px-4 py-2 rounded-full border border-border">
              {new Date().toLocaleDateString("ar-SA", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="flex items-center gap-4 rounded-2xl bg-surface-elevated/50 p-5 border border-border/50 transition-all hover:border-border hover:bg-surface-elevated">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface shadow-sm ring-1 ring-border">
                <Clock className="h-6 w-6 text-text-subtle" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-text-muted">تم استلامها اليوم</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-text-main">{stats.todayNew}</span>
                  <span className="text-xs font-black text-text-subtle">جهاز</span>
                </div>
              </div>
              <Link
                href="/control?receivedDate=today"
                className="rounded-xl p-2.5 text-text-subtle hover:bg-surface hover:text-primary transition-all active:scale-95"
              >
                <ArrowUpRight className="h-5 w-5" />
              </Link>
            </div>

            <div className="flex items-center gap-4 rounded-2xl bg-success-bg/30 p-5 border border-success-border/30 transition-all hover:border-success-border/60 hover:bg-success-bg/50">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface shadow-sm ring-1 ring-success-border/50">
                <CheckCircle2 className="h-6 w-6 text-success" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-success-text">تم تسليمها اليوم</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-success-text">{stats.deliveredTodayCount}</span>
                  <span className="text-xs font-black text-success-text/50">جهاز</span>
                </div>
              </div>
              <Link
                href="/control?deliveredDate=today"
                className="rounded-xl p-2.5 text-success-text/60 hover:bg-surface hover:text-success-text transition-all active:scale-95"
              >
                <ArrowUpRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function KpiCard({ title, value, icon, href, color }: {
  title: string;
  value: number;
  icon: React.ReactNode;
  href: string;
  color: "primary" | "success" | "info"
}) {
  const colorMap = {
    primary: "bg-primary/5 ring-primary/10",
    success: "bg-success-bg ring-success-border/50",
    info: "bg-info-bg ring-info-border/50"
  };

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
      }}
      whileHover={{ y: -4 }}
      className="relative overflow-hidden rounded-3xl border border-border bg-surface p-6 shadow-sm transition-all hover:shadow-xl group"
    >
      <Link href={href} className="absolute inset-0 z-0" />
      <div className="flex justify-between relative z-10">
        <div>
          <p className="text-sm font-black text-text-muted">{title}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <h3 className="text-3xl font-black text-text-main">{value}</h3>
          </div>
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ring-1 ${colorMap[color]}`}>
          {icon}
        </div>
      </div>
      <div className="mt-6 flex items-center text-[11px] font-black text-text-subtle uppercase tracking-widest">
        <ArrowUpRight className="mr-1 h-3.5 w-3.5 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
        <span>عرض التفاصيل</span>
      </div>
    </motion.div>
  );
}

function StatusActionCard({ title, value, icon, href, borderColor, bgColor, textColor }: {
  title: string;
  value: number;
  icon: React.ReactNode;
  href: string;
  borderColor: string;
  bgColor: string;
  textColor: string;
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, scale: 0.95 },
        visible: { opacity: 1, scale: 1 }
      }}
      whileHover={{ scale: 1.02 }}
      className={`group relative flex flex-col items-center justify-center rounded-3xl border ${borderColor} ${bgColor} p-8 text-center transition-all hover:shadow-lg`}
    >
      <Link href={href} className="absolute inset-0 z-0" />
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-surface shadow-sm ring-1 ring-border">
        {icon}
      </div>
      <div className={`text-sm font-black ${textColor} mb-1 tracking-tight`}>{title}</div>
      <div className={`text-2xl font-black ${textColor}`}>{value}</div>
      <div className="mt-3 opacity-0 transition-all group-hover:opacity-100 translate-y-2 group-hover:translate-y-0">
        <span className={`text-[10px] font-black uppercase tracking-widest ${textColor} bg-surface/50 px-3 py-1 rounded-full`}>مشاهدة القائمة</span>
      </div>
    </motion.div>
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
