"use client";

import { useState, FormEvent, Suspense, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { authApi, ApiError } from "../../lib/api";
import { validatePassword } from "../../lib/validation";
import { useAuth } from "../../lib/auth-context";
import AuthLogo from "../../components/AuthLogo";
import AuthField from "../../components/AuthField";

function ResetPasswordForm() {
  const router = useRouter();
  const resetToken = useSearchParams().get("token") ?? "";
  const { token: authToken, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && authToken) {
      router.replace("/dashboard");
    }
  }, [authLoading, authToken, router]);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  function validate() {
    const next: Record<string, string> = {};
    const passwordError = validatePassword(password);
    if (passwordError) next.password = passwordError;
    if (confirmPassword !== password) {
      next.confirmPassword = "كلمتا المرور غير متطابقتين";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setServerError("");
    if (!resetToken) {
      setServerError("رابط إعادة التعيين غير صالح");
      return;
    }
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await authApi.resetPassword(resetToken, password);
      setDone(true);
      setTimeout(() => router.push("/login"), 2000);
    } catch (err) {
      setServerError(
        err instanceof ApiError ? err.message : "الرابط غير صالح أو منتهي",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm rounded-3xl border border-surface-line bg-white p-8 shadow-xl shadow-primary/5">
        <AuthLogo />

        <h1 className="font-headline mt-7 text-2xl font-bold text-neutral">
          كلمة مرور جديدة
        </h1>
        <p className="mt-1.5 text-sm text-muted">
          اختار كلمة مرور جديدة لحسابك.
        </p>

        {done ? (
          <p className="mt-7 rounded-lg bg-green-50 px-3 py-2.5 text-sm text-green-700">
            تم تغيير كلمة المرور، جاري تحويلك لتسجيل الدخول...
          </p>
        ) : (
          <form
            onSubmit={handleSubmit}
            noValidate
            className="mt-7 flex flex-col gap-4"
          >
            {serverError && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                {serverError}
              </p>
            )}

            <AuthField
              label="كلمة المرور الجديدة"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              icon={
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                  <rect
                    x="4"
                    y="9"
                    width="12"
                    height="8"
                    rx="1.5"
                    stroke="currentColor"
                    strokeWidth="1.4"
                  />
                  <path
                    d="M6.5 9V6.5a3.5 3.5 0 0 1 7 0V9"
                    stroke="currentColor"
                    strokeWidth="1.4"
                  />
                </svg>
              }
            />

            <AuthField
              label="تأكيد كلمة المرور"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={errors.confirmPassword}
              icon={
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                  <rect
                    x="4"
                    y="9"
                    width="12"
                    height="8"
                    rx="1.5"
                    stroke="currentColor"
                    strokeWidth="1.4"
                  />
                  <path
                    d="M6.5 9V6.5a3.5 3.5 0 0 1 7 0V9"
                    stroke="currentColor"
                    strokeWidth="1.4"
                  />
                </svg>
              }
            />

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-1 rounded-xl bg-primary py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-light disabled:opacity-50"
            >
              {isSubmitting ? "...جاري الحفظ" : "حفظ كلمة المرور"}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-muted">
          <Link href="/login" className="font-semibold text-primary">
            الرجوع لتسجيل الدخول
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
