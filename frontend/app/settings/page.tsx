"use client";

import { useEffect, useRef, useState, FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "../../lib/auth-context";
import {
  usersApi,
  socialAuthApi,
  ApiError,
  Platform,
  ConnectedAccount,
} from "../../lib/api";
import DashboardShell from "../../components/DashboardShell";
import { useLanguage } from "../../lib/i18n/language-context";

const SOCIAL_PLATFORMS: {
  id: Platform;
  label: string;
  bg: string;
  icon: string;
}[] = [
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

export default function SettingsPage() {
  const { user, token, refreshUser } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const searchParams = useSearchParams();

  const [name, setName] = useState(user?.name ?? "");
  const [nameStatus, setNameStatus] = useState<"idle" | "saving" | "saved">(
    "idle",
  );
  const [nameError, setNameError] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordStatus, setPasswordStatus] = useState<
    "idle" | "saving" | "saved"
  >("idle");
  const [passwordError, setPasswordError] = useState("");

  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState("");

  const [accounts, setAccounts] = useState<ConnectedAccount[]>([]);
  const [accountsLoading, setAccountsLoading] = useState(true);
  const [pendingPlatform, setPendingPlatform] = useState<Platform | null>(null);
  const [callbackNotice, setCallbackNotice] = useState<{
    kind: "success" | "error";
    text: string;
  } | null>(null);

  const loadAccounts = async () => {
    if (!token) return;
    try {
      const list = await usersApi.socialAccounts(token);
      setAccounts(list);
    } finally {
      setAccountsLoading(false);
    }
  };

  useEffect(() => {
    loadAccounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Handle the ?platform=&status=&message= query the OAuth callback redirects with.
  useEffect(() => {
    const status = searchParams.get("status");
    if (!status) return;
    if (status === "connected") {
      setCallbackNotice({
        kind: "success",
        text: t("settings.accountsConnectedOk"),
      });
      loadAccounts();
    } else if (status === "error") {
      setCallbackNotice({
        kind: "error",
        text: searchParams.get("message") || t("settings.accountsConnectError"),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  async function handleConnect(platform: Platform) {
    if (!token) return;
    setPendingPlatform(platform);
    try {
      const { url } = await socialAuthApi.connect(token, platform);
      window.location.href = url;
    } catch {
      setPendingPlatform(null);
    }
  }

  async function handleDisconnect(accountId: string) {
    if (!token) return;
    setPendingPlatform(
      accounts.find((a) => a.id === accountId)?.platform ?? null,
    );
    try {
      await usersApi.disconnectSocialAccount(token, accountId);
      await loadAccounts();
    } finally {
      setPendingPlatform(null);
    }
  }

  async function handleNameSubmit(e: FormEvent) {
    e.preventDefault();
    if (!token) return;
    setNameError("");
    setNameStatus("saving");
    try {
      await usersApi.updateProfile(token, name);
      await refreshUser();
      setNameStatus("saved");
      setTimeout(() => setNameStatus("idle"), 2000);
    } catch (err) {
      setNameError(
        err instanceof ApiError ? err.message : t("settings.genericError"),
      );
      setNameStatus("idle");
    }
  }

  async function handlePasswordSubmit(e: FormEvent) {
    e.preventDefault();
    if (!token) return;
    setPasswordError("");

    if (newPassword !== confirmPassword) {
      setPasswordError(t("settings.mismatch"));
      return;
    }

    setPasswordStatus("saving");
    try {
      await usersApi.changePassword(token, currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordStatus("saved");
      setTimeout(() => setPasswordStatus("idle"), 2000);
    } catch (err) {
      setPasswordError(
        err instanceof ApiError ? err.message : t("settings.genericError"),
      );
      setPasswordStatus("idle");
    }
  }

  async function handleAvatarChange(file: File | undefined) {
    if (!file || !token) return;
    setAvatarError("");
    setIsUploadingAvatar(true);
    try {
      await usersApi.uploadAvatar(token, file);
      await refreshUser();
    } catch (err) {
      setAvatarError(
        err instanceof ApiError ? err.message : t("settings.avatarError"),
      );
    } finally {
      setIsUploadingAvatar(false);
    }
  }

  return (
    <DashboardShell>
      <div className="mx-auto max-w-2xl">
        <h1 className="font-headline text-2xl font-bold text-neutral">
          {t("settings.title")}
        </h1>

        {/* Language */}
        <div className="mt-6 rounded-xl border border-surface-line bg-white p-5">
          <h2 className="font-headline text-lg font-semibold text-neutral">
            {t("settings.language")}
          </h2>
          <p className="mt-1 text-sm text-muted">
            {t("settings.languageDesc")}
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setLanguage("ar")}
              className={`rounded-xl border py-2.5 text-sm font-medium transition-colors ${
                language === "ar"
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-surface-line text-muted hover:bg-bg-soft"
              }`}
            >
              العربية
            </button>
            <button
              type="button"
              onClick={() => setLanguage("en")}
              className={`rounded-xl border py-2.5 text-sm font-medium transition-colors ${
                language === "en"
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-surface-line text-muted hover:bg-bg-soft"
              }`}
            >
              English
            </button>
          </div>
        </div>

        {/* Connected accounts */}
        <div
          id="accounts"
          className="mt-6 rounded-xl border border-surface-line bg-white p-5"
        >
          <h2 className="font-headline text-lg font-semibold text-neutral">
            {t("settings.accounts")}
          </h2>
          <p className="mt-1 text-sm text-muted">
            {t("settings.accountsDesc")}
          </p>

          {callbackNotice && (
            <p
              className={`mt-3 rounded-lg px-3 py-2 text-xs ${
                callbackNotice.kind === "success"
                  ? "bg-green-50 text-green-700"
                  : "bg-red-50 text-red-600"
              }`}
            >
              {callbackNotice.text}
            </p>
          )}

          <div className="mt-4 flex flex-col gap-2">
            {SOCIAL_PLATFORMS.map((p) => {
              const account = accounts.find((a) => a.platform === p.id);
              const isPending = pendingPlatform === p.id;
              const statusLabel =
                account?.status === "ACTIVE"
                  ? t("settings.accountsActive")
                  : account?.status === "EXPIRED"
                    ? t("settings.accountsExpired")
                    : null;

              return (
                <div
                  key={p.id}
                  className="flex items-center justify-between gap-3 rounded-lg bg-bg-soft px-3 py-2.5"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                      style={{ background: p.bg }}
                    >
                      {p.icon}
                    </span>
                    <div>
                      <span className="block text-sm text-neutral">
                        {p.label}
                      </span>
                      {account && (
                        <span
                          className={`block text-[11px] ${
                            account.status === "ACTIVE"
                              ? "text-green-600"
                              : "text-amber-600"
                          }`}
                        >
                          {account.accountName} · {statusLabel}
                        </span>
                      )}
                    </div>
                  </div>

                  {!account || account.status !== "ACTIVE" ? (
                    <button
                      type="button"
                      disabled={accountsLoading || isPending}
                      onClick={() => handleConnect(p.id)}
                      className="rounded-lg border border-primary px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/5 disabled:opacity-50"
                    >
                      {isPending
                        ? t("settings.accountsConnecting")
                        : account?.status === "EXPIRED"
                          ? t("settings.accountsReconnect")
                          : t("settings.accountsConnect")}
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleDisconnect(account.id)}
                      className="rounded-lg border border-surface-line px-3 py-1.5 text-xs font-medium text-muted hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
                    >
                      {isPending
                        ? t("settings.accountsDisconnecting")
                        : t("settings.accountsDisconnect")}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Avatar */}
        <div className="mt-6 rounded-xl border border-surface-line bg-white p-5">
          <h2 className="font-headline text-lg font-semibold text-neutral">
            {t("settings.avatar")}
          </h2>
          <div className="mt-4 flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-bg-soft text-lg font-semibold text-muted">
              {user?.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.avatarUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                (user?.name?.[0] ?? user?.email?.[0] ?? "؟").toUpperCase()
              )}
            </div>
            <div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingAvatar}
                className="rounded-xl border border-surface-line px-4 py-2 text-sm font-medium text-neutral hover:bg-bg-soft disabled:opacity-50"
              >
                {isUploadingAvatar
                  ? t("settings.uploading")
                  : t("settings.changeAvatar")}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleAvatarChange(e.target.files?.[0])}
              />
              {avatarError && (
                <p className="mt-1.5 text-xs text-red-500">{avatarError}</p>
              )}
            </div>
          </div>
        </div>

        {/* Name */}
        <form
          onSubmit={handleNameSubmit}
          className="mt-6 rounded-xl border border-surface-line bg-white p-5"
        >
          <h2 className="font-headline text-lg font-semibold text-neutral">
            {t("settings.nameTitle")}
          </h2>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label className="mb-1.5 block text-sm font-medium text-neutral">
                {t("settings.fullName")}
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("settings.namePlaceholder")}
                className="w-full rounded-xl border border-surface-line bg-bg-soft px-3 py-2.5 text-sm text-neutral outline-none focus:border-primary-light focus:bg-white"
              />
            </div>
            <button
              type="submit"
              disabled={nameStatus === "saving"}
              className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-light disabled:opacity-50"
            >
              {nameStatus === "saving"
                ? t("settings.saving")
                : nameStatus === "saved"
                  ? t("settings.saved")
                  : t("settings.save")}
            </button>
          </div>
          {nameError && (
            <p className="mt-2 text-xs text-red-500">{nameError}</p>
          )}
        </form>

        {/* Password */}
        <form
          onSubmit={handlePasswordSubmit}
          className="mt-6 rounded-xl border border-surface-line bg-white p-5"
        >
          <h2 className="font-headline text-lg font-semibold text-neutral">
            {t("settings.passwordTitle")}
          </h2>
          <div className="mt-4 flex flex-col gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral">
                {t("settings.currentPassword")}
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-surface-line bg-bg-soft px-3 py-2.5 text-sm text-neutral outline-none focus:border-primary-light focus:bg-white"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral">
                  {t("settings.newPassword")}
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-surface-line bg-bg-soft px-3 py-2.5 text-sm text-neutral outline-none focus:border-primary-light focus:bg-white"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral">
                  {t("settings.confirmPassword")}
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-surface-line bg-bg-soft px-3 py-2.5 text-sm text-neutral outline-none focus:border-primary-light focus:bg-white"
                />
              </div>
            </div>

            {passwordError && (
              <p className="text-xs text-red-500">{passwordError}</p>
            )}

            <button
              type="submit"
              disabled={passwordStatus === "saving"}
              className="self-start rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-light disabled:opacity-50"
            >
              {passwordStatus === "saving"
                ? t("settings.saving")
                : passwordStatus === "saved"
                  ? t("settings.passwordChanged")
                  : t("settings.changePassword")}
            </button>
          </div>
        </form>
      </div>
    </DashboardShell>
  );
}
