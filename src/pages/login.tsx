import { getServerSession } from "next-auth";
import { signIn } from "next-auth/react";
import type { GetServerSideProps } from "next";
import { authOptions } from "./api/auth/[...nextauth]";
import { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow">
        <h1 className="text-xl font-semibold">تسجيل الدخول</h1>
        <p className="text-sm text-slate-500">نظام صيانة الاتصالات</p>

        {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}

        <div className="mt-4 space-y-3">
          <label className="block text-sm">
            البريد الإلكتروني
            <input
              className="mt-1 w-full rounded border border-slate-200 px-3 py-2"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          <label className="block text-sm">
            كلمة المرور
            <input
              type="password"
              className="mt-1 w-full rounded border border-slate-200 px-3 py-2"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          <button
            className="w-full rounded bg-slate-900 py-2 text-white"
            onClick={async () => {
              setError("");
              const result = await signIn("credentials", {
                email,
                password,
                redirect: false
              });
              if (result?.error) {
                setError("بيانات الدخول غير صحيحة");
              } else {
                window.location.href = "/";
              }
            }}
          >
            دخول
          </button>
        </div>
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
