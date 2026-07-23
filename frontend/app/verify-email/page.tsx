"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { authApi, ApiError } from "../../lib/api";
import { useAuth } from "../../lib/auth-context";
import { useLanguage } from "../../lib/i18n/language-context";
import AuthLogo from "../../components/AuthLogo";

function VerifyEmailStatus() {
  const token = useSearchParams().get("token") ?? "";
  const router = useRouter();
  const { token: authToken, isLoading: authLoading } = useAuth();
  const { t } = useLanguage();

  useEffect(() => {
    if (!authLoading && authToken) {
      router.replace("/dashboard");
    }
  }, [authLoading, authToken, router]);
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );

  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage(t("verify.invalidLink"));
      return;
    }

    authApi
      .verifyEmail(token)
      .then(() => setStatus("success"))
      .catch((err) => {
        setStatus("error");
        setMessage(
          err instanceof ApiError ? err.message : t("verify.invalidOrExpired"),
        );
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm rounded-3xl border border-surface-line bg-white p-8 text-center shadow-xl shadow-primary/5">
        <div className="flex justify-center">
          <AuthLogo />
        </div>

        {status === "loading" && (
          <p className="mt-7 text-sm text-muted">{t("verify.loading")}</p>
        )}

        {status === "success" && (
          <>
            <h1 className="font-headline mt-7 text-2xl font-bold text-neutral">
              {t("verify.successTitle")}
            </h1>
            <p className="mt-2 text-sm text-muted">{t("verify.successDesc")}</p>
            <Link
              href="/login"
              className="mt-6 inline-block w-full rounded-xl bg-primary py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-light"
            >
              {t("verify.login")}
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <h1 className="font-headline mt-7 text-2xl font-bold text-neutral">
              {t("verify.errorTitle")}
            </h1>
            <p className="mt-2 text-sm text-muted">{message}</p>
            <Link
              href="/login"
              className="mt-6 inline-block text-sm font-semibold text-primary"
            >
              {t("verify.backLogin")}
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
