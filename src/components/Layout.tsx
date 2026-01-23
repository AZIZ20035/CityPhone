import type { ReactNode } from "react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

export default function Layout({
  title,
  children
}: {
  title: string;
  children: ReactNode;
}) {
  const { data } = useSession();
  return (
    <div className="min-h-screen">
      <header className="bg-white shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-xl font-semibold">اتصالات سيتي فون برو</h1>
            <p className="text-sm text-slate-500">إدارة الصيانة</p>
            <p className="text-sm text-slate-700">{title}</p>
          </div>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/" className="hover:text-slate-700">
              إضافة فاتورة
            </Link>
            <Link href="/control" className="hover:text-slate-700">
              لوحة التحكم
            </Link>
            <Link href="/stats" className="hover:text-slate-700">
              إحصائيات
            </Link>
            {data?.user?.role === "ADMIN" && (
              <Link href="/settings" className="hover:text-slate-700">
                الإعدادات
              </Link>
            )}
            <span className="text-slate-400">|</span>
            <span className="text-slate-600">{data?.user?.name}</span>
            <button
              onClick={() => signOut()}
              className="rounded bg-slate-900 px-3 py-1 text-white"
            >
              خروج
            </button>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
