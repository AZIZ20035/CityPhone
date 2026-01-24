import "@/styles/globals.css";
import { SessionProvider } from "next-auth/react";
import type { AppProps } from "next/app";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { safeFetchJson } from "@/lib/apiClient";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [banner, setBanner] = useState<string | null>(null);

  const protectedPrefixes = useMemo(
    () => ["/control", "/settings", "/stats", "/repairs", "/invoices"],
    []
  );

  useEffect(() => {
    const reason = String(router.query.reason ?? "");
    if (reason === "session_expired" || reason === "unauthorized") {
      setBanner("انتهت الجلسة. سجّل الدخول مرة أخرى.");
    } else if (reason === "updated") {
      setBanner("تم تحديث النظام. جارٍ إعادة تحميل النسخة الجديدة.");
    } else if (reason === "logout") {
      setBanner(null);
    }
  }, [router.query.reason]);

  useEffect(() => {
    async function checkVersion() {
      if (typeof window === "undefined") return;
      const seen = localStorage.getItem("LAST_BUILD_ID");
      const data = await safeFetchJson<{ buildId: string; deployedAt: string }>(
        "/api/version"
      );
      if (seen && seen !== data.buildId) {
        if (!sessionStorage.getItem("BUILD_RELOADED")) {
          sessionStorage.setItem("BUILD_RELOADED", "1");
          localStorage.setItem("LAST_BUILD_ID", data.buildId);
          const url = new URL(window.location.href);
          url.searchParams.set("reason", "updated");
          url.searchParams.set("v", data.buildId);
          window.location.href = url.toString();
          return;
        }
      }
      if (!seen) {
        localStorage.setItem("LAST_BUILD_ID", data.buildId);
      }
    }

    async function checkSession() {
      if (typeof window === "undefined") return;
      const isProtected = protectedPrefixes.some((prefix) =>
        router.pathname.startsWith(prefix)
      );
      if (!isProtected) return;
      try {
        const session = await safeFetchJson<any>("/api/auth/session");
        if (!session || !session.user) {
          router.replace("/login?reason=session_expired");
        }
      } catch {
        router.replace("/login?reason=session_expired");
      }
    }

    checkVersion();
    checkSession();
  }, [router.pathname, protectedPrefixes, router]);

  return (
    <SessionProvider session={(pageProps as any).session}>
      {banner && (
        <div className="bg-amber-50 text-amber-700 text-center text-sm py-2">
          {banner}
        </div>
      )}
      <Component {...pageProps} />
    </SessionProvider>
  );
}
