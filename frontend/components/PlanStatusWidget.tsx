"use client";

import { AuthUser } from "../lib/api";
import { useLanguage } from "../lib/i18n/language-context";

const DEFAULT_TRIAL_LIMIT = 5;

export default function PlanStatusWidget({ user }: { user: AuthUser | null }) {
  const { t, language } = useLanguage();

  if (!user) return null;

  if (user.plan === "FREE_TRIAL") {
    const limit = user.trialPostsLimit ?? DEFAULT_TRIAL_LIMIT;
    const used = user.trialPostsUsed ?? 0;
    const remaining = Math.max(limit - used, 0);
    const percentUsed = Math.min((used / limit) * 100, 100);
    const isUsedUp = remaining === 0;

    return (
      <div className="rounded-xl border border-surface-line bg-white p-5">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-neutral">
            {t("dash.plan.trial")}
          </p>
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
              isUsedUp
                ? "bg-amber-50 text-amber-700"
                : "bg-primary/10 text-primary"
            }`}
          >
            {isUsedUp
              ? t("dash.plan.postsUsedUp")
              : `${remaining} ${t("dash.plan.postsLeft")}`}
          </span>
        </div>

        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-bg-soft">
          <div
            className={`h-full rounded-full ${
              isUsedUp ? "bg-amber-500" : "bg-primary"
            }`}
            style={{ width: `${percentUsed}%` }}
          />
        </div>
      </div>
    );
  }

  const planLabel =
    user.plan === "PRO" ? t("dash.plan.pro") : t("dash.plan.basic");
  const isPastDue = user.subscription?.status
    ? user.subscription.status.toLowerCase() !== "active"
    : false;
  const renewsAt = user.subscription?.renewsAt
    ? new Date(user.subscription.renewsAt).toLocaleDateString(
        language === "ar" ? "ar-EG" : "en-US",
        { year: "numeric", month: "long", day: "numeric" },
      )
    : null;

  return (
    <div className="rounded-xl border border-surface-line bg-white p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-neutral">{planLabel}</p>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
            isPastDue
              ? "bg-red-50 text-red-700"
              : "bg-emerald-50 text-emerald-700"
          }`}
        >
          {isPastDue ? t("dash.plan.pastDue") : t("dash.plan.active")}
        </span>
      </div>

      {renewsAt && (
        <p className="mt-2 text-xs text-muted">
          {t("dash.plan.renewsAt")} {renewsAt}
        </p>
      )}
    </div>
  );
}
