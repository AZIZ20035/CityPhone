import { useEffect, useMemo, useState } from "react";
import Layout from "@/components/Layout";
import { getServerSession } from "next-auth";
import type { GetServerSideProps } from "next";
import { authOptions } from "./api/auth/[...nextauth]";

type Invoice = {
  id: string;
  deviceStatus: string;
  isDelivered: boolean;
  receivedAt: string;
  deliveredAt?: string | null;
};

export default function StatsPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  useEffect(() => {
    fetch("/api/invoices")
      .then((res) => res.json())
      .then((data) => setInvoices(data.invoices ?? []))
      .catch(() => {});
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
    const deliveredToday = invoices.filter(
      (inv) =>
        inv.deliveredAt &&
        new Date(inv.deliveredAt).toDateString() === today
    );
    const deliveredTodayCount = deliveredToday.length;

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

  return (
    <Layout title="إحصائيات">
      <div className="grid gap-4 md:grid-cols-3">
        <button
          className="rounded bg-white p-4 text-right shadow-sm"
          onClick={() => (window.location.href = "/control")}
        >
          <div className="text-sm text-slate-500">إجمالي الأجهزة المستلمة</div>
          <div className="text-2xl font-semibold">{stats.totalReceived}</div>
        </button>
        <button
          className="rounded bg-white p-4 text-right shadow-sm"
          onClick={() => (window.location.href = "/control?status=DELIVERED")}
        >
          <div className="text-sm text-slate-500">الأجهزة المسلمة للعميل</div>
          <div className="text-2xl font-semibold text-green-700">
            {stats.totalDelivered}
          </div>
        </button>
        <button
          className="rounded bg-white p-4 text-right shadow-sm"
          onClick={() =>
            (window.location.href = "/control?receivedDate=today")
          }
        >
          <div className="text-sm text-slate-500">المستلمة اليوم</div>
          <div className="text-2xl font-semibold">{stats.todayNew}</div>
        </button>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <button
          className="rounded border border-orange-200 bg-orange-50 p-4 text-right"
          onClick={() => (window.location.href = "/control?status=WAITING_PARTS")}
        >
          <div className="text-sm text-orange-700">في انتظار القطع</div>
          <div className="text-2xl font-semibold text-orange-700">
            {stats.waitingParts}
          </div>
        </button>
        <button
          className="rounded border border-green-200 bg-green-50 p-4 text-right"
          onClick={() => (window.location.href = "/control?status=READY")}
        >
          <div className="text-sm text-green-700">جاهزة للتسليم</div>
          <div className="text-2xl font-semibold text-green-700">
            {stats.ready}
          </div>
        </button>
        <button
          className="rounded border border-rose-200 bg-rose-50 p-4 text-right"
          onClick={() => (window.location.href = "/control?status=REFUSED")}
        >
          <div className="text-sm text-rose-700">تم التواصل والعميل رفض</div>
          <div className="text-2xl font-semibold text-rose-700">
            {stats.refused}
          </div>
        </button>
      </div>

      <div className="mt-6 rounded bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-slate-700">أداء اليوم</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <button
            className="rounded bg-slate-50 p-4 text-right"
            onClick={() =>
              (window.location.href = "/control?receivedDate=today")
            }
          >
            <div className="text-sm text-slate-500">المستلمة اليوم</div>
            <div className="text-2xl font-semibold">{stats.todayNew}</div>
          </button>
          <button
            className="rounded bg-green-50 p-4 text-right"
            onClick={() =>
              (window.location.href = "/control?deliveredDate=today")
            }
          >
            <div className="text-sm text-green-700">تم التسليم اليوم</div>
            <div className="text-2xl font-semibold text-green-700">
              {stats.deliveredTodayCount}
            </div>
          </button>
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
      redirect: { destination: "/login", permanent: false }
    };
  }
  return { props: {} };
};
