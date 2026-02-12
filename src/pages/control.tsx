import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/router";
import { getServerSession } from "next-auth";
import type { GetServerSideProps } from "next";
import { authOptions } from "./api/auth/[...nextauth]";
import Layout from "@/components/Layout";
import Badge from "@/components/Badge";
import Input from "@/components/Input";
import Select from "@/components/Select";
import { safeFetchJson } from "@/lib/apiClient";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
    Search,
    Filter,
    Calendar,
    ChevronLeft,
    ChevronRight,
    MoreVertical,
    ArrowUpDown,
    Laptop,
    User,
    Phone,
    Clock
} from "lucide-react";

type Invoice = {
    id: string;
    invoiceNo: string;
    customerName: string | null;
    mobile: string | null;
    deviceType: string | null;
    problem: string | null;
    deviceStatus: string;
    createdAt: string;
    totalAmount: number | null;
    isDelivered: boolean;
};

export default function ControlPanel() {
    const router = useRouter();
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState(String(router.query.status || "ALL"));
    const [dateFilter, setDateFilter] = useState(String(router.query.receivedDate || "ALL"));

    useEffect(() => {
        async function fetchData() {
            try {
                const data = await safeFetchJson<{ invoices: Invoice[] }>("/api/invoices");
                setInvoices(data.invoices || []);
            } catch (error) {
                console.error("Failed to fetch invoices", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    // Update filters when query params change
    useEffect(() => {
        if (router.query.status) setStatusFilter(String(router.query.status));
        if (router.query.receivedDate) setDateFilter(String(router.query.receivedDate));
    }, [router.query]);

    const filteredInvoices = useMemo(() => {
        return invoices.filter((inv) => {
            const matchesSearch =
                (inv.customerName?.toLowerCase().includes(search.toLowerCase()) ||
                    inv.mobile?.includes(search) ||
                    inv.invoiceNo.includes(search) ||
                    inv.deviceType?.toLowerCase().includes(search.toLowerCase()));

            const matchesStatus = statusFilter === "ALL" ||
                (statusFilter === "DELIVERED" ? inv.isDelivered : inv.deviceStatus === statusFilter);

            const matchesDate = dateFilter === "ALL" || (
                dateFilter === "today" &&
                new Date(inv.createdAt).toDateString() === new Date().toDateString()
            );

            return matchesSearch && matchesStatus && matchesDate;
        });
    }, [invoices, search, statusFilter, dateFilter]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.05 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <Layout>
            <div className="space-y-6">
                {/* Header Actions */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-black text-text-main tracking-tight">إدارة القائمة</h1>
                        <p className="text-text-muted font-bold">متابعة وتحديث حالات أجهزة الصيانة</p>
                    </div>
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-black text-white shadow-xl shadow-primary/20 transition-all hover:opacity-90 active:scale-95"
                    >
                        <PlusIcon className="h-4 w-4" />
                        <span>إضافة فاتورة جديدة</span>
                    </Link>
                </div>

                {/* Filters Card */}
                <div className="rounded-3xl border border-border bg-surface p-6 shadow-sm">
                    <div className="grid gap-6 md:grid-cols-4 lg:grid-cols-5">
                        <div className="md:col-span-2">
                            <label className="mb-2 block text-xs font-black text-text-muted uppercase tracking-widest mr-1">
                                بحث سريع
                            </label>
                            <div className="relative">
                                <Search className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-subtle" />
                                <input
                                    type="text"
                                    placeholder="ابحث بالاسم، الرقم، أو نوع الجهاز..."
                                    className="w-full rounded-2xl border border-border bg-surface-elevated py-3.5 pl-4 pr-11 text-sm font-bold transition-all focus:border-primary focus:bg-surface focus:ring-4 focus:ring-primary/10 outline-none placeholder:text-text-subtle/50"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="mb-2 block text-xs font-black text-text-muted uppercase tracking-widest mr-1">
                                الحالة
                            </label>
                            <select
                                className="w-full rounded-2xl border border-border bg-surface-elevated px-4 py-3.5 text-sm font-bold outline-none transition-all focus:border-primary focus:bg-surface focus:ring-4 focus:ring-primary/10"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="ALL">الكل</option>
                                <option value="NEW">جديد</option>
                                <option value="WAITING_PARTS">في انتظار القطع</option>
                                <option value="READY">جاهزة للتسليم</option>
                                <option value="DELIVERED">تم التسليم</option>
                                <option value="REFUSED">تم الرفض</option>
                            </select>
                        </div>

                        <div>
                            <label className="mb-2 block text-xs font-black text-text-muted uppercase tracking-widest mr-1">
                                التاريخ
                            </label>
                            <select
                                className="w-full rounded-2xl border border-border bg-surface-elevated px-4 py-3.5 text-sm font-bold outline-none transition-all focus:border-primary focus:bg-surface focus:ring-4 focus:ring-primary/10"
                                value={dateFilter}
                                onChange={(e) => setDateFilter(e.target.value)}
                            >
                                <option value="ALL">كل الأوقات</option>
                                <option value="today">اليوم</option>
                            </select>
                        </div>

                        <div className="flex items-end">
                            <button
                                onClick={() => {
                                    setSearch("");
                                    setStatusFilter("ALL");
                                    setDateFilter("ALL");
                                    router.push("/control", undefined, { shallow: true });
                                }}
                                className="w-full rounded-2xl border border-border bg-surface py-3.5 text-sm font-black text-text-muted transition-all hover:bg-surface-elevated hover:text-text-main active:scale-95"
                            >
                                إعادة ضبط
                            </button>
                        </div>
                    </div>
                </div>

                {/* Table/List Area */}
                <div className="overflow-hidden rounded-3xl border border-border bg-surface shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-right text-sm">
                            <thead className="bg-surface-elevated/50 border-b border-border">
                                <tr>
                                    <th className="px-6 py-5 font-black text-text-muted uppercase tracking-widest text-xs">
                                        <div className="flex items-center gap-1">
                                            <span>رقم الفاتورة</span>
                                            <ArrowUpDown className="h-3 w-3 opacity-30" />
                                        </div>
                                    </th>
                                    <th className="px-6 py-5 font-black text-text-muted uppercase tracking-widest text-xs">
                                        <div className="flex items-center gap-1">
                                            <span>العميل</span>
                                        </div>
                                    </th>
                                    <th className="px-6 py-5 font-black text-text-muted uppercase tracking-widest text-xs">
                                        <div className="flex items-center gap-1">
                                            <span>الجهاز / المشكلة</span>
                                        </div>
                                    </th>
                                    <th className="px-6 py-5 font-black text-text-muted uppercase tracking-widest text-xs">
                                        <div className="flex items-center gap-1">
                                            <span>الحالة</span>
                                        </div>
                                    </th>
                                    <th className="px-6 py-5 font-black text-text-muted uppercase tracking-widest text-xs">
                                        <div className="flex items-center gap-1">
                                            <span>التاريخ</span>
                                        </div>
                                    </th>
                                    <th className="px-6 py-5 font-black text-text-muted uppercase tracking-widest text-xs">
                                        <span className="sr-only">إجراءات</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                <AnimatePresence mode="popLayout">
                                    {loading ? (
                                        // Skeleton Rows
                                        [...Array(5)].map((_, i) => (
                                            <tr key={`skeleton-${i}`} className="animate-pulse">
                                                <td className="px-6 py-6"><div className="h-5 w-20 rounded-lg bg-surface-elevated" /></td>
                                                <td className="px-6 py-6">
                                                    <div className="space-y-2">
                                                        <div className="h-5 w-32 rounded-lg bg-surface-elevated" />
                                                        <div className="h-4 w-24 rounded-lg bg-surface-elevated/50" />
                                                    </div>
                                                </td>
                                                <td className="px-6 py-6">
                                                    <div className="space-y-2">
                                                        <div className="h-5 w-40 rounded-lg bg-surface-elevated" />
                                                        <div className="h-4 w-32 rounded-lg bg-surface-elevated/50" />
                                                    </div>
                                                </td>
                                                <td className="px-6 py-6"><div className="h-7 w-24 rounded-full bg-surface-elevated" /></td>
                                                <td className="px-6 py-6"><div className="h-5 w-28 rounded-lg bg-surface-elevated" /></td>
                                                <td className="px-6 py-6"><div className="h-10 w-10 rounded-xl bg-surface-elevated" /></td>
                                            </tr>
                                        ))
                                    ) : filteredInvoices.length > 0 ? (
                                        filteredInvoices.map((inv) => (
                                            <motion.tr
                                                key={inv.id}
                                                layout
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="group transition-colors hover:bg-surface-elevated/50"
                                            >
                                                <td className="px-6 py-5">
                                                    <span className="font-mono text-[11px] font-black tracking-tighter text-primary bg-primary/5 px-3 py-1.5 rounded-lg border border-primary/10">
                                                        {inv.invoiceNo}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="flex flex-col">
                                                        <span className="font-black text-text-main">{inv.customerName || "—"}</span>
                                                        <span className="text-xs font-bold text-text-muted">{inv.mobile || "—"}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="flex flex-col">
                                                        <div className="flex items-center gap-2 text-text-main font-black">
                                                            <Laptop className="h-4 w-4 text-text-subtle" />
                                                            <span>{inv.deviceType || "—"}</span>
                                                        </div>
                                                        <span className="text-xs font-bold text-text-muted line-clamp-1 mt-0.5">{inv.problem || "—"}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <Badge status={inv.isDelivered ? "DELIVERED" : inv.deviceStatus} />
                                                </td>
                                                <td className="px-6 py-5 whitespace-nowrap">
                                                    <div className="flex items-center gap-2 text-xs font-bold text-text-muted bg-surface-elevated/50 px-3 py-1.5 rounded-full w-fit">
                                                        <Clock className="h-3.5 w-3.5 text-text-subtle" />
                                                        <span>{new Date(inv.createdAt).toLocaleDateString("ar-SA", {
                                                            year: 'numeric',
                                                            month: 'short',
                                                            day: 'numeric'
                                                        })}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 text-left">
                                                    <Link
                                                        href={`/invoices/${inv.id}`}
                                                        className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-border bg-surface text-text-subtle transition-all hover:border-primary hover:bg-primary/5 hover:text-primary active:scale-95"
                                                    >
                                                        <ChevronLeft className="h-5 w-5" />
                                                    </Link>
                                                </td>
                                            </motion.tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-24 text-center">
                                                <div className="flex flex-col items-center justify-center space-y-4">
                                                    <div className="h-20 w-20 rounded-3xl bg-surface-elevated flex items-center justify-center shadow-inner">
                                                        <Search className="h-10 w-10 text-text-subtle/50" />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="font-black text-lg text-text-main">لم يتم العثور على أي نتائج</p>
                                                        <p className="text-sm font-bold text-text-muted">جرب تغيير إعدادات البحث أو الفلاتر</p>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Footer */}
                    {!loading && filteredInvoices.length > 0 && (
                        <div className="flex items-center justify-between border-t border-border bg-surface-elevated/20 px-6 py-5 text-sm font-bold text-text-muted">
                            <div className="flex items-center gap-3">
                                <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface transition-all hover:bg-surface-elevated disabled:opacity-30" disabled>
                                    <ChevronRight className="h-5 w-5" />
                                </button>
                                <div className="flex items-center gap-2 px-2">
                                    <span className="font-black text-text-main">1</span>
                                    <span className="text-text-subtle">من</span>
                                    <span className="font-black text-text-main">1</span>
                                </div>
                                <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface transition-all hover:bg-surface-elevated disabled:opacity-30" disabled>
                                    <ChevronLeft className="h-5 w-5" />
                                </button>
                            </div>
                            <div className="bg-surface px-4 py-2 rounded-xl border border-border shadow-sm">
                                إجمالي النتائج: <span className="font-black text-text-main mr-1">{filteredInvoices.length}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
}

function PlusIcon(props: any) {
    return (
        <svg
            {...props}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
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
