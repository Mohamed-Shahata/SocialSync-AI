"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "../lib/auth-context";
import { usersApi, ConnectedAccount, Platform } from "../lib/api";
import { useLanguage } from "../lib/i18n/language-context";

const PLATFORMS: { id: Platform; label: string; bg: string; icon: string }[] = [
  { id: "FACEBOOK", label: "Facebook", bg: "#1877F2", icon: "f" },
  { id: "LINKEDIN", label: "LinkedIn", bg: "#0A66C2", icon: "in" },
  {
    id: "INSTAGRAM",
    label: "Instagram",
    bg: "linear-gradient(135deg,#f58529,#dd2a7b,#8134af)",
    icon: "◎",
  },
  { id: "TIKTOK", label: "TikTok", bg: "#000000", icon: "♪" },
  { id: "X", label: "X", bg: "#000000", icon: "✕" },
];

export default function ConnectedAccountsWidget() {
  const { token } = useAuth();
  const { t } = useLanguage();
  const [accounts, setAccounts] = useState<ConnectedAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    usersApi
      .socialAccounts(token)
      .then(setAccounts)
      .finally(() => setIsLoading(false));
  }, [token]);

  const connectedByPlatform = new Map(
    accounts.filter((a) => a.status === "ACTIVE").map((a) => [a.platform, a]),
  );

  const hasAnyConnected = connectedByPlatform.size > 0;

  return (
    <div className="rounded-xl border border-surface-line bg-white p-5">
      <p className="text-sm font-semibold text-neutral">
        {t("dash.accounts.title")}
      </p>

      <div className="mt-3 flex flex-col gap-2">
        {PLATFORMS.map((p) => {
          const connected = connectedByPlatform.has(p.id);
          return (
            <div
              key={p.id}
              className="flex items-center justify-between gap-3 rounded-lg bg-bg-soft px-3 py-2"
            >
              <div className="flex items-center gap-2">
                <span
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
                  style={{ background: p.bg }}
                >
                  {p.icon}
                </span>
                <span className="text-sm text-neutral">{p.label}</span>
              </div>

              <span
                className={`flex items-center gap-1.5 text-xs font-medium ${
                  connected ? "text-emerald-600" : "text-muted"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    connected ? "bg-emerald-500" : "bg-muted"
                  }`}
                />
                {isLoading
                  ? ""
                  : connected
                    ? t("dash.accounts.connected")
                    : t("dash.accounts.disconnected")}
              </span>
            </div>
          );
        })}
      </div>

      {!isLoading && !hasAnyConnected && (
        <Link
          href="/settings#accounts"
          className="mt-3 flex items-center justify-center gap-1.5 rounded-lg bg-primary/10 px-3 py-2 text-xs font-semibold text-primary transition hover:bg-primary/15"
        >
          {t("dash.accounts.cta")}
        </Link>
      )}
    </div>
  );
}
