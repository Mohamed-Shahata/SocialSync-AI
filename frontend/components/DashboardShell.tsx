"use client";

import { useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../lib/auth-context";
import { useLanguage } from "../lib/i18n/language-context";
import Sidebar from "./Sidebar";

export default function DashboardShell({ children }: { children: ReactNode }) {
  const { token, isLoading } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  // Route guard: no dashboard-area access without login.
  useEffect(() => {
    if (!isLoading && !token) {
      router.replace("/login");
    }
  }, [isLoading, token, router]);

  if (isLoading || !token) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted">
        {t("shell.verifying")}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 px-4 py-6 md:ms-64 md:px-8">{children}</div>
    </div>
  );
}
