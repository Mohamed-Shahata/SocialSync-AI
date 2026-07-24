"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../lib/auth-context";
import { usersApi } from "../../lib/api";
import { useLanguage } from "../../lib/i18n/language-context";

const PLATFORMS = [
  { name: "Facebook", color: "#3F51B5" },
  { name: "Instagram", color: "#7C4DFF" },
  { name: "LinkedIn", color: "#0A66C2" },
  { name: "TikTok", color: "#00D2FF" },
];

export default function OnboardingPage() {
  const { token, refreshUser } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [connected, setConnected] = useState<Record<string, boolean>>({});
  const [niche, setNiche] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  function toggleConnect(name: string) {
    // Real OAuth integrations per platform are not wired up yet;
    // this simulates the connected state until that work lands.
    setConnected((prev) => ({ ...prev, [name]: !prev[name] }));
  }

  async function finishOnboarding() {
    if (!token) return;
    setIsSaving(true);
    try {
      await usersApi.completeOnboarding(token, niche || undefined);
      await refreshUser();
      router.push("/dashboard");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-white p-8 shadow-sm">
        <div className="mb-6 flex gap-2">
          <div
            className={`h-1.5 flex-1 rounded-full ${step >= 1 ? "bg-primary" : "bg-border"}`}
          />
          <div
            className={`h-1.5 flex-1 rounded-full ${step >= 2 ? "bg-primary" : "bg-border"}`}
          />
        </div>

        {step === 1 && (
          <>
            <h1 className="text-xl font-bold text-foreground">
              {t("onboarding.step1Title")}
            </h1>
            <p className="mt-1 text-sm text-muted">
              {t("onboarding.step1Subtitle")}
            </p>

            <div className="mt-6 flex flex-col gap-3">
              {PLATFORMS.map((platform) => (
                <button
                  key={platform.name}
                  type="button"
                  onClick={() => toggleConnect(platform.name)}
                  className="flex items-center justify-between rounded-lg border border-border px-4 py-3 text-sm font-medium"
                >
                  <span className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: platform.color }}
                    />
                    {platform.name}
                  </span>
                  <span
                    className={
                      connected[platform.name]
                        ? "text-green-600"
                        : "text-primary"
                    }
                  >
                    {connected[platform.name]
                      ? t("onboarding.connected")
                      : t("onboarding.connect")}
                  </span>
                </button>
              ))}
            </div>

            <div className="mt-8 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="text-sm font-medium text-muted"
              >
                {t("onboarding.skip")}
              </button>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-white"
              >
                {t("onboarding.next")}
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h1 className="text-xl font-bold text-foreground">
              {t("onboarding.step2Title")}
            </h1>
            <p className="mt-1 text-sm text-muted">
              {t("onboarding.step2Subtitle")}
            </p>

            <input
              type="text"
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              placeholder={t("onboarding.nichePlaceholder")}
              className="mt-6 w-full rounded-lg border border-border px-4 py-2.5 text-sm outline-none focus:border-primary"
            />

            <div className="mt-8 flex items-center justify-between">
              <button
                type="button"
                onClick={finishOnboarding}
                disabled={isSaving}
                className="text-sm font-medium text-muted"
              >
                {t("onboarding.skip")}
              </button>
              <button
                type="button"
                onClick={finishOnboarding}
                disabled={isSaving}
                className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                {t("onboarding.finish")}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
