"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { authApi, ApiError } from "../../lib/api";
import { validateEmail } from "../../lib/validation";
import AuthLogo from "../../components/AuthLogo";
import AuthField from "../../components/AuthField";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setServerError("");

    const emailError = validateEmail(email);
    setError(emailError ?? "");
    if (emailError) return;

    setIsSubmitting(true);
    try {
      await authApi.forgotPassword(email);
      setSent(true);
    } catch (err) {
      setServerError(
        err instanceof ApiError ? err.message : "حصل خطأ، حاول تاني",
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
          نسيت كلمة المرور؟
        </h1>
        <p className="mt-1.5 text-sm text-muted">
          اكتب إيميلك وهنبعتلك رابط تعمل بيه كلمة مرور جديدة.
        </p>

        {sent ? (
          <p className="mt-7 rounded-lg bg-green-50 px-3 py-2.5 text-sm text-green-700">
            لو الإيميل ده مسجل عندنا، هتلاقي رابط إعادة التعيين في بريدك دلوقتي.
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
              label="البريد الإلكتروني"
              type="email"
              placeholder="example@postai.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={error}
              icon={
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M3 5.5C3 4.7 3.7 4 4.5 4h11c.8 0 1.5.7 1.5 1.5v9c0 .8-.7 1.5-1.5 1.5h-11c-.8 0-1.5-.7-1.5-1.5v-9Z"
                    stroke="currentColor"
                    strokeWidth="1.4"
                  />
                  <path
                    d="M3.5 5.5 10 10.5l6.5-5"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                  />
                </svg>
              }
            />

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-1 rounded-xl bg-primary py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-light disabled:opacity-50"
            >
              {isSubmitting ? "...جاري الإرسال" : "إرسال رابط إعادة التعيين"}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-muted">
          افتكرت كلمة المرور؟{" "}
          <Link href="/login" className="font-semibold text-primary">
            تسجيل الدخول
          </Link>
        </p>
      </div>
    </div>
  );
}
