import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { getServerSession } from "next-auth";
import type { GetServerSideProps } from "next";
import { authOptions } from "../../api/auth/[...nextauth]";

export default function InvoicePrint() {
  const router = useRouter();
  const { id } = router.query;
  const [invoice, setInvoice] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);
  const printedRef = useRef(false);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/invoices/${id}`)
      .then((res) => res.json())
      .then((data) => setInvoice(data.invoice))
      .catch(() => {});
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => setSettings(data.settings))
      .catch(() => {});
  }, [id]);

  useEffect(() => {
    if (!invoice || printedRef.current) return;
    printedRef.current = true;
    setTimeout(() => window.print(), 300);
  }, [invoice]);

  if (!invoice) {
    return <div className="p-4">جاري التحميل...</div>;
  }

  return (
    <div dir="rtl" className="min-h-screen bg-white p-4 text-sm text-black">
      <style>{`
        @media print {
          @page { margin: 6mm; }
          body { -webkit-print-color-adjust: exact; }
        }
      `}</style>
      <div className="text-center">
        <div className="text-base font-semibold">
          {settings?.shopName ?? "محل الصيانة"}
        </div>
        <div className="text-xs text-slate-600">{settings?.shopPhone ?? ""}</div>
      </div>

      <div className="mt-4 border-t border-dashed pt-3">
        <div>رقم الفاتورة: {invoice.invoiceNo}</div>
        <div>التاريخ: {new Date(invoice.createdAt).toLocaleString("ar-SA")}</div>
        {invoice.customerName && <div>العميل: {invoice.customerName}</div>}
        {invoice.deviceType && <div>الجهاز: {invoice.deviceType}</div>}
        {invoice.problem && <div>المشكلة: {invoice.problem}</div>}
        {invoice.agreedPrice && (
          <div>السعر: {Number(invoice.agreedPrice).toFixed(2)} ريال</div>
        )}
      </div>

      <div className="mt-4 border-t border-dashed pt-3 text-xs">
        الاستلام بموجب هذا الكرت - المحل غير مسؤول عن الجهاز بعد 30 يوم
      </div>
    </div>
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
