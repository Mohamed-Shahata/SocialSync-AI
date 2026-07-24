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
import AiBrainIllustration from "../../components/AiBrainIllustration";
import GoogleAuthButton from "../../components/GoogleAuthButton";

export default function RegisterPage() {
  const { register, token, user, isLoading: authLoading } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && token) {
      router.replace(
        user?.hasCompletedOnboarding ? "/dashboard" : "/onboarding",
      );
    }
  }, [authLoading, token, user, router]);

  const accountTypes = [
    { id: "individual", label: t("register.individual") },
    { id: "business", label: t("register.business") },
  ];

  const [accountType, setAccountType] = useState("individual");
  const [fullName, setFullName] = useState("");
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
      await register(email, password);
      router.push("/onboarding");
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
            {t("register.title")}
          </h1>
          <p className="mt-1.5 text-sm text-muted">{t("register.subtitle")}</p>

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

            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral">
                {t("register.userType")}
              </label>
              <div className="grid grid-cols-2 gap-3">
                {accountTypes.map((ty) => (
                  <button
                    key={ty.id}
                    type="button"
                    onClick={() => setAccountType(ty.id)}
                    className={`rounded-xl border py-2.5 text-sm font-medium transition-colors ${
                      accountType === ty.id
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-surface-line text-muted hover:bg-bg-soft"
                    }`}
                  >
                    {ty.label}
                  </button>
                ))}
              </div>
            </div>

            <AuthField
              label={t("register.fullName")}
              type="text"
              placeholder={t("register.fullNamePlaceholder")}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              icon={
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                  <circle
                    cx="10"
                    cy="6.5"
                    r="3"
                    stroke="currentColor"
                    strokeWidth="1.4"
                  />
                  <path
                    d="M3.5 17c1-3.5 4-5 6.5-5s5.5 1.5 6.5 5"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                  />
                </svg>
              }
            />

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

            <label className="flex items-start gap-2 text-xs leading-5 text-muted">
              <input
                type="checkbox"
                required
                className="mt-0.5 h-3.5 w-3.5 rounded border-surface-line accent-primary"
              />
              {t("register.agree")}{" "}
              <a href="#" className="text-primary">
                {t("register.terms")}
              </a>{" "}
              {t("register.and")}{" "}
              <a href="#" className="text-primary">
                {t("register.privacy")}
              </a>
            </label>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-1 rounded-xl bg-primary py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-light disabled:opacity-50"
            >
              {isSubmitting ? t("register.submitting") : t("register.submit")}
            </button>
          </form>

          <GoogleAuthButton />

          <p className="mt-6 text-center text-sm text-muted">
            {t("register.haveAccount")}{" "}
            <Link href="/login" className="font-semibold text-primary">
              {t("register.loginNow")}
            </Link>
          </p>
        </div>

        {/* Hero panel */}
        <div className="relative hidden flex-col justify-between overflow-hidden bg-linear-to-br from-[#eef1fb] via-[#eceffb] to-[#e9ecfb] p-8 lg:flex">
          <div className="relative flex flex-1 items-center justify-center py-4">
            <div className="h-56 w-56">
              <AiBrainIllustration />
            </div>
          </div>

          <div className="relative rounded-2xl bg-white/70 p-5 backdrop-blur-sm">
            <h2 className="font-headline text-xl font-bold text-neutral">
              {t("register.heroTitle")}
            </h2>
            <p className="mt-2 text-sm leading-7 text-muted">
              {t("register.heroDesc")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
