"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { authApi, ApiError } from "../../lib/api";
import AuthLogo from "../../components/AuthLogo";

function VerifyEmailStatus() {
  const token = useSearchParams().get("token") ?? "";
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );

  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("رابط التفعيل غير صالح");
      return;
    }

    authApi
      .verifyEmail(token)
      .then(() => setStatus("success"))
      .catch((err) => {
        setStatus("error");
        setMessage(
          err instanceof ApiError ? err.message : "الرابط غير صالح أو منتهي",
        );
      });
  }, [token]);

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm rounded-3xl border border-surface-line bg-white p-8 text-center shadow-xl shadow-primary/5">
        <div className="flex justify-center">
          <AuthLogo />
        </div>

        {status === "loading" && (
          <p className="mt-7 text-sm text-muted">...جاري تفعيل حسابك</p>
        )}

        {status === "success" && (
          <>
            <h1 className="font-headline mt-7 text-2xl font-bold text-neutral">
              تم تفعيل حسابك 🎉
            </h1>
            <p className="mt-2 text-sm text-muted">
              تقدر دلوقتي تسجل الدخول وتبدأ تستخدم PostAI.
            </p>
            <Link
              href="/login"
              className="mt-6 inline-block w-full rounded-xl bg-primary py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-light"
            >
              تسجيل الدخول
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <h1 className="font-headline mt-7 text-2xl font-bold text-neutral">
              الرابط مش شغال
            </h1>
            <p className="mt-2 text-sm text-muted">{message}</p>
            <Link
              href="/login"
              className="mt-6 inline-block text-sm font-semibold text-primary"
            >
              الرجوع لتسجيل الدخول
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailStatus />
    </Suspense>
  );
}
