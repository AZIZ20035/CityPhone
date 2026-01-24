import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { useRouter } from "next/router";
import { safeFetchJson } from "@/lib/apiClient";
import { getServerSession } from "next-auth";
import type { GetServerSideProps } from "next";
import { authOptions } from "./api/auth/[...nextauth]";

type Invoice = {
  id: string;
  invoiceNo: string;
  customerName?: string | null;
  mobile?: string | null;
  deviceType?: string | null;
  problem?: string | null;
  deviceStatus: string;
  contactedCustomer: boolean;
  staffReceiver?: string | null;
  isDelivered: boolean;
  receivedAt: string;
  deliveredAt?: string | null;
};

const statusLabels: Record<string, string> = {
  NEW: "جديد",
  RECEIVED: "تم استلام الجهاز",
  IN_PROGRESS: "جاري تجهيزه",
  WAITING_PARTS: "في احتياج إلى قطع",
  NO_PARTS: "داخلي – لا يُرسل للعميل (لا توجد قطعة)",
  READY: "جاهز",
  DELIVERED: "تم التسليم",
  REFUSED: "تم التواصل والعميل رفض"
};

export default function ControlPanel() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "READY" | "WAITING">(
    "ALL"
  );
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [receivedDateFilter, setReceivedDateFilter] = useState<string | null>(
    null
  );
  const [deliveredDateFilter, setDeliveredDateFilter] = useState<string | null>(
    null
  );
  const [deliverTarget, setDeliverTarget] = useState<Invoice | null>(null);
  const [receiverName, setReceiverName] = useState("العميل نفسه");
  const [delivering, setDelivering] = useState(false);

  async function load() {
    try {
      const data = await safeFetchJson<{ invoices: Invoice[] }>("/api/invoices");
      setInvoices(data.invoices ?? []);
    } catch (err) {
      setInvoices([]);
    }
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!router.isReady) return;
    const status = router.query.status as string | undefined;
    const receivedDate = router.query.receivedDate as string | undefined;
    const deliveredDate = router.query.deliveredDate as string | undefined;
    if (status) {
      setStatusFilter(status);
      if (status === "DELIVERED") setFilter("ALL");
      if (status === "READY") setFilter("READY");
      if (status === "WAITING_PARTS") setFilter("WAITING");
    }
    if (receivedDate) setReceivedDateFilter(receivedDate);
    if (deliveredDate) setDeliveredDateFilter(deliveredDate);
  }, [router.isReady, router.query]);

  const filtered = invoices.filter((invoice) => {
    if (filter === "PENDING" && invoice.isDelivered) return false;
    if (filter === "READY" && invoice.deviceStatus !== "READY") return false;
    if (filter === "WAITING" && invoice.deviceStatus !== "WAITING_PARTS")
      return false;
    if (statusFilter) {
      if (statusFilter === "DELIVERED" && !invoice.isDelivered) return false;
      if (statusFilter !== "DELIVERED" && invoice.deviceStatus !== statusFilter)
        return false;
    }
    if (receivedDateFilter === "today") {
      if (new Date(invoice.receivedAt).toDateString() !== new Date().toDateString())
        return false;
    }
    if (deliveredDateFilter === "today") {
      if (
        !invoice.deliveredAt ||
        new Date(invoice.deliveredAt).toDateString() !==
          new Date().toDateString()
      )
        return false;
    }
    if (!search.trim()) return true;
    const q = search.trim();
    return (
      invoice.invoiceNo.toLowerCase().includes(q.toLowerCase()) ||
      (invoice.mobile ?? "").includes(q)
    );
  });

  return (
    <Layout title="لوحة التحكم">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="inline-flex rounded border border-slate-200 p-1 text-sm">
          <button
            className={`rounded px-3 py-1 ${
              filter === "ALL" ? "bg-slate-900 text-white" : "text-slate-600"
            }`}
            onClick={() => {
              setFilter("ALL");
              setStatusFilter(null);
              setReceivedDateFilter(null);
              setDeliveredDateFilter(null);
            }}
          >
            الكل
          </button>
          <button
            className={`rounded px-3 py-1 ${
              filter === "PENDING"
                ? "bg-slate-900 text-white"
                : "text-slate-600"
            }`}
            onClick={() => setFilter("PENDING")}
          >
            لم يتم التسليم
          </button>
          <button
            className={`rounded px-3 py-1 ${
              filter === "READY" ? "bg-slate-900 text-white" : "text-slate-600"
            }`}
            onClick={() => setFilter("READY")}
          >
            جاهزة للتسليم
          </button>
          <button
            className={`rounded px-3 py-1 ${
              filter === "WAITING"
                ? "bg-slate-900 text-white"
                : "text-slate-600"
            }`}
            onClick={() => setFilter("WAITING")}
          >
            في انتظار القطع
          </button>
        </div>
        <input
          className="w-full max-w-xs rounded border border-slate-200 px-3 py-2 text-sm"
          placeholder="بحث برقم الفاتورة أو الجوال"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>
      <div className="overflow-x-auto rounded bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-4 py-3 text-right">رقم الفاتورة</th>
              <th className="px-4 py-3 text-right">وقت الاستلام</th>
              <th className="px-4 py-3 text-right">وقت التسليم</th>
              <th className="px-4 py-3 text-right">العميل</th>
              <th className="px-4 py-3 text-right">الجوال</th>
              <th className="px-4 py-3 text-right">نوع الجهاز</th>
              <th className="px-4 py-3 text-right">الموظف</th>
              <th className="px-4 py-3 text-right">الحالة</th>
              <th className="px-4 py-3 text-right">حالة الجهاز</th>
              <th className="px-4 py-3 text-right">تم التواصل؟</th>
              <th className="px-4 py-3 text-right">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((invoice) => (
              <tr
                key={invoice.id}
                className={`border-t hover:bg-slate-50 ${
                  invoice.deviceStatus === "READY" && !invoice.isDelivered
                    ? "bg-green-50"
                    : ""
                }`}
                onClick={() =>
                  (window.location.href = `/invoices/${invoice.id}`)
                }
              >
                <td className="px-4 py-3">{invoice.invoiceNo}</td>
                <td className="px-4 py-3">
                  {new Date(invoice.receivedAt).toLocaleString("ar-SA")}
                </td>
                <td className="px-4 py-3">
                  {invoice.deliveredAt
                    ? new Date(invoice.deliveredAt).toLocaleString("ar-SA")
                    : "-"}
                </td>
                <td className="px-4 py-3">{invoice.customerName ?? "-"}</td>
                <td className="px-4 py-3">{invoice.mobile ?? "-"}</td>
                <td className="px-4 py-3">{invoice.deviceType ?? "-"}</td>
                <td className="px-4 py-3">{invoice.staffReceiver ?? "-"}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded px-2 py-1 text-xs ${
                      invoice.isDelivered
                        ? "bg-green-100 text-green-700"
                        : "bg-orange-100 text-orange-700"
                    }`}
                  >
                    {invoice.isDelivered ? "تم التسليم" : "لم يتم التسليم"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {statusLabels[invoice.deviceStatus] ?? invoice.deviceStatus}
                </td>
                <td className="px-4 py-3">
                  {invoice.contactedCustomer ? "نعم" : "لا"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    {!invoice.isDelivered && (
                      <button
                        className="rounded bg-slate-900 px-3 py-1 text-xs text-white"
                        onClick={(event) => {
                          event.stopPropagation();
                          setDeliverTarget(invoice);
                          setReceiverName("العميل نفسه");
                        }}
                      >
                        تسليم الجهاز
                      </button>
                    )}
                    <button
                      className="rounded border border-slate-200 px-3 py-1 text-xs"
                      onClick={(event) => {
                        event.stopPropagation();
                        window.open(
                          `/invoices/${invoice.id}/print`,
                          "_blank"
                        );
                      }}
                    >
                      طباعة
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!filtered.length && (
              <tr>
                <td className="px-4 py-6 text-center text-slate-500" colSpan={11}>
                  لا توجد بيانات
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {deliverTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 px-4">
          <div className="w-full max-w-md rounded bg-white p-4 shadow-lg">
            <div className="text-sm font-semibold text-slate-700">
              تسليم الجهاز
            </div>
            <div className="mt-2 text-sm text-slate-500">
              الفاتورة: {deliverTarget.invoiceNo}
            </div>
            <div className="mt-4">
              <label className="block text-sm text-slate-700">
                اسم المستلم
                <input
                  className="mt-1 w-full rounded border border-slate-200 px-3 py-2 text-sm"
                  value={receiverName}
                  onChange={(event) => setReceiverName(event.target.value)}
                />
              </label>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                className="rounded border border-slate-200 px-4 py-2 text-sm"
                onClick={() => setDeliverTarget(null)}
                disabled={delivering}
              >
                إلغاء
              </button>
              <button
                className="rounded bg-slate-900 px-4 py-2 text-sm text-white"
                onClick={async () => {
                  setDelivering(true);
                  const data = await safeFetchJson<{ invoice: Invoice }>(
                    `/api/invoices/${deliverTarget.id}`,
                    {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        isDelivered: true,
                        receiverName: receiverName || "العميل نفسه",
                        deviceStatus: "DELIVERED"
                      })
                    }
                  );
                    setInvoices((prev) =>
                      prev.map((inv) =>
                        inv.id === deliverTarget.id ? data.invoice : inv
                      )
                    );
                    setDeliverTarget(null);
                  setDelivering(false);
                }}
                disabled={delivering}
              >
                تأكيد التسليم
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
