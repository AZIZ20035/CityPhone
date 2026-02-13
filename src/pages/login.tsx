import { getServerSession } from "next-auth";
import { signIn } from "next-auth/react";
import type { GetServerSideProps } from "next";
import { authOptions } from "./api/auth/[...nextauth]";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Mail, AlertCircle, Smartphone, ArrowLeft, Loader2 } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email || !password) {
      setError("يرجى إدخال البريد الإلكتروني وكلمة المرور");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false
      });

      if (result?.error) {
        setError("بيانات الدخول غير صحيحة، يرجى المحاولة مرة أخرى");
        setLoading(false);
      } else {
        window.location.href = "/";
      }
    } catch (err) {
      setError("حدث خطأ أثناء تسجيل الدخول");
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-base px-4 overflow-hidden rtl transition-colors duration-300" dir="rtl">
      {/* Background Decorative Elements */}
      <div className="absolute -top-24 -left-20 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute -bottom-24 -right-20 h-96 w-96 rounded-full bg-primary/5 blur-3xl opacity-50" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 w-full max-w-[440px]"
      >
        {/* Logo/Brand Area */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-primary-900 text-white shadow-2xl shadow-primary-900/20 ring-4 ring-surface">
            <Smartphone className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-black text-text-main tracking-tight">سيتي فون برو</h1>
          <p className="mt-2 text-text-muted font-bold tracking-wide">نظام إدارة صيانة الاتصالات الذكي</p>
        </div>

        {/* Login Card */}
        <div className="overflow-hidden rounded-[2.5rem] border border-border bg-surface p-8 shadow-2xl shadow-border/20 md:p-10">
          <div className="mb-8">
            <h2 className="text-xl font-black text-text-main">تسجيل الدخول</h2>
            <p className="mt-1 text-sm text-text-muted font-bold">أهلاً بك مجدداً، يرجى إدخال بياناتك</p>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 flex items-center gap-2 rounded-xl border border-danger-border bg-danger-bg p-4 text-sm font-black text-danger-text"
              >
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-black text-text-muted uppercase tracking-widest mr-1">
                البريد الإلكتروني
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                  <Mail className="h-4 w-4 text-text-subtle" />
                </div>
                <input
                  type="email"
                  placeholder="name@example.com"
                  className="block w-full rounded-2xl border border-border bg-surface-elevated py-3.5 pl-4 pr-11 text-sm font-bold transition-all focus:border-primary focus:bg-surface focus:ring-4 focus:ring-primary/10 outline-none placeholder:text-text-subtle/50"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-text-muted uppercase tracking-widest mr-1">
                كلمة المرور
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                  <Lock className="h-4 w-4 text-text-subtle" />
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="block w-full rounded-2xl border border-border bg-surface-elevated py-3.5 pl-4 pr-11 text-sm font-bold transition-all focus:border-primary focus:bg-surface focus:ring-4 focus:ring-primary/10 outline-none placeholder:text-text-subtle/50"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                disabled={loading}
                onClick={handleLogin}
                className="group relative flex w-full items-center justify-center overflow-hidden rounded-2xl bg-primary-900 py-4 font-black text-white shadow-lg shadow-primary-900/20 transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <div className="flex items-center gap-2">
                    <span>دخول للنظام</span>
                    <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <p className="mt-8 text-center text-xs font-black text-text-subtle uppercase tracking-widest">
          &copy; {new Date().getFullYear()} سيتي فون برو للصيانة. جميع الحقوق محفوظة.
        </p>
      </motion.div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(
    context.req,
    context.res,
    authOptions
  );
  if (session) {
    return {
      redirect: {
        destination: "/",
        permanent: false
      }
    };
  }
  return { props: {} };
};
