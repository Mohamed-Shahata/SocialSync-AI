"use client";

import { useState, FormEvent, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../lib/auth-context";
import { validateEmail, validatePassword } from "../../lib/validation";
import { ApiError } from "../../lib/api";
import { useLanguage } from "../../lib/i18n/language-context";
import AuthLogo from "../../components/AuthLogo";
import AuthField from "../../components/AuthField";

export default function LoginPage() {
  const { login, token, isLoading: authLoading } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && token) {
      router.replace("/dashboard");
    }
  }, [authLoading, token, router]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validate() {
    const nextErrors: Record<string, string> = {};

    const emailError = validateEmail(email);
    if (emailError) nextErrors.email = emailError;

    const passwordError = validatePassword(password);
    if (passwordError) nextErrors.password = passwordError;

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setServerError("");
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err) {
      setServerError(
        err instanceof ApiError ? err.message : t("auth.genericError"),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-10">
      <div className="grid w-full max-w-4xl overflow-hidden rounded-3xl border border-surface-line bg-white shadow-xl shadow-primary/5 lg:grid-cols-2">
        {/* Form panel */}
        <div className="flex flex-col justify-center p-8 sm:p-10">
          <AuthLogo />

          <h1 className="font-headline mt-7 text-2xl font-bold text-neutral">
            {t("login.title")}
          </h1>
          <p className="mt-1.5 text-sm text-muted">{t("login.subtitle")}</p>

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
              label={t("auth.email")}
              type="email"
              placeholder="example@omnipost.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
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

            <AuthField
              label={t("auth.password")}
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              trailingLink={
                <Link
                  href="/forgot-password"
                  className="text-xs font-medium text-primary"
                >
                  {t("login.forgot")}
                </Link>
              }
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

            <label className="flex items-center gap-2 text-xs text-muted">
              <input
                type="checkbox"
                className="h-3.5 w-3.5 rounded border-surface-line accent-primary"
              />
              {t("login.remember")}
            </label>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-1 rounded-xl bg-primary py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-light disabled:opacity-50"
            >
              {isSubmitting ? t("login.submitting") : t("login.submit")}
            </button>

            <div className="my-1 flex items-center gap-3">
              <span className="h-px flex-1 bg-surface-line" />
              <span className="text-xs text-muted">{t("login.or")}</span>
              <span className="h-px flex-1 bg-surface-line" />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-surface-line py-2.5 text-sm font-medium text-neutral transition-colors hover:bg-bg-soft"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="#0A66C2">
                  <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.38-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45Z" />
                </svg>
                {t("login.linkedin")}
              </button>
              <button
                type="button"
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-surface-line py-2.5 text-sm font-medium text-neutral transition-colors hover:bg-bg-soft"
              >
                <svg width="15" height="15" viewBox="0 0 20 20" fill="none">
                  <rect
                    x="5"
                    y="2"
                    width="10"
                    height="16"
                    rx="1.5"
                    stroke="currentColor"
                    strokeWidth="1.4"
                  />
                  <path
                    d="M9 15.5h2"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                  />
                </svg>
                {t("login.mobile")}
              </button>
            </div>
          </form>

          <p className="mt-6 text-center text-sm text-muted">
            {t("login.noAccount")}{" "}
            <Link href="/register" className="font-semibold text-primary">
              {t("login.registerNow")}
            </Link>
          </p>
        </div>

        {/* Hero panel */}
        <div className="relative hidden flex-col justify-between overflow-hidden bg-linear-to-br from-[#f3e9ff] via-[#eef1fb] to-[#ffeef5] p-10 lg:flex">
          <div
            className="animate-float-a pointer-events-none absolute -top-16 -start-16 h-64 w-64 rounded-full opacity-30 blur-[90px]"
            style={{ background: "var(--tertiary)" }}
          />
          <div
            className="animate-float-b pointer-events-none absolute bottom-0 end-0 h-56 w-56 rounded-full opacity-25 blur-[90px]"
            style={{ background: "var(--secondary)" }}
          />

          <AuthLogo />

          <div className="relative">
            <h2 className="font-headline text-3xl font-bold leading-tight text-neutral">
              {t("login.heroTitle1")}
              <br /> {t("login.heroTitle2")}
            </h2>
            <p className="mt-4 max-w-xs text-sm leading-7 text-muted">
              {t("login.heroDesc")}
            </p>
          </div>

          <div className="relative flex items-center gap-3">
            <div className="flex -space-x-3 rtl:space-x-reverse">
              {["#3F51B5", "#7C4DFF", "#00B8D9", "#5C6BC0"].map((c, i) => (
                <span
                  key={i}
                  className="h-9 w-9 rounded-full border-2 border-white"
                  style={{ background: c }}
                />
              ))}
            </div>
            <p className="text-xs text-muted">{t("login.trust")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
