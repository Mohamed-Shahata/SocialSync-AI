"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../../../lib/auth-context";
import { useLanguage } from "../../../lib/i18n/language-context";

export default function AuthCallbackPage() {
  const { loginWithToken } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setError(t("auth.genericError"));
      return;
    }

    loginWithToken(token)
      .then((authUser) => {
        router.replace(authUser?.hasCompletedOnboarding ? "/dashboard" : "/onboarding");
      })
      .catch(() => setError(t("auth.genericError")));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-sm text-muted">
        {error || t("auth.signingIn")}
      </p>
    </div>
  );
}
