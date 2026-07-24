"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../lib/auth-context";
import {
  postsApi,
  PostHistoryItem,
  PostHistoryResponse,
  Platform,
} from "../../lib/api";
import DashboardShell from "../../components/DashboardShell";
import DashboardContentSkeleton from "../../components/DashboardContentSkeleton";
import { useLanguage } from "../../lib/i18n/language-context";

const platformDot: Record<Platform, string> = {
  LINKEDIN: "bg-sky-500",
  FACEBOOK: "bg-blue-600",
  INSTAGRAM: "bg-pink-500",
  TIKTOK: "bg-neutral",
  X: "bg-neutral",
};

const platformLabel: Record<Platform, string> = {
  LINKEDIN: "LinkedIn",
  FACEBOOK: "Facebook",
  INSTAGRAM: "Instagram",
  TIKTOK: "TikTok",
  X: "X",
};

export default function PostHistoryPage() {
  const { token } = useAuth();
  const { t, language } = useLanguage();

  const [data, setData] = useState<PostHistoryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    postsApi
      .history(token)
      .then(setData)
      .finally(() => setIsLoading(false));
  }, [token]);

  const items = data?.items ?? [];
  const stats = data?.stats;
  const activePlatforms = stats ? Object.keys(stats.byPlatform).length : 0;

  return (
    <DashboardShell>
      <div>
        <div>
          <h1 className="font-headline text-xl font-bold text-neutral">
            {t("history.title")}
          </h1>
          <p className="mt-1 text-sm text-muted">{t("history.subtitle")}</p>
        </div>

        {isLoading && (
          <div className="mt-6">
            <DashboardContentSkeleton withHeader={false} />
          </div>
        )}

        {!isLoading && (
          <>
            {/* Simple stats */}
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <StatCard
                label={t("history.statTotal")}
                value={stats?.totalPublished ?? 0}
              />
              <StatCard
                label={t("history.statMonth")}
                value={stats?.thisMonth ?? 0}
              />
              <StatCard
                label={t("history.statPlatforms")}
                value={activePlatforms}
              />
            </div>

            {items.length === 0 ? (
              <p className="mt-8 text-sm text-muted">{t("history.empty")}</p>
            ) : (
              <div className="mt-6 flex flex-col gap-3">
                {items.map((item) => (
                  <HistoryRow
                    key={item.variantId}
                    item={item}
                    language={language}
                    viewLabel={t("history.viewPost")}
                    noLinkLabel={t("history.noLink")}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </DashboardShell>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-surface-line bg-white p-4">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 text-2xl font-bold text-neutral">{value}</p>
    </div>
  );
}

function HistoryRow({
  item,
  language,
  viewLabel,
  noLinkLabel,
}: {
  item: PostHistoryItem;
  language: string;
  viewLabel: string;
  noLinkLabel: string;
}) {
  const date = item.publishedAt
    ? new Date(item.publishedAt).toLocaleDateString(
        language === "ar" ? "ar-EG" : "en-US",
        { day: "2-digit", month: "long", year: "numeric" },
      )
    : "—";

  return (
    <div className="flex items-center gap-4 rounded-xl border border-surface-line bg-white p-4">
      <span
        className={`h-3 w-3 shrink-0 rounded-full ${platformDot[item.platform]}`}
        title={platformLabel[item.platform]}
      />
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted">
          {platformLabel[item.platform]} · {date}
        </p>
        <p className="mt-1 line-clamp-1 text-sm text-neutral">{item.text}</p>
      </div>
      {item.link ? (
        <a
          href={item.link}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 rounded-lg bg-bg-soft px-3 py-1.5 text-xs font-medium text-primary hover:bg-surface-line"
        >
          {viewLabel} ↗
        </a>
      ) : (
        <span className="shrink-0 text-xs text-muted">{noLinkLabel}</span>
      )}
    </div>
  );
}
