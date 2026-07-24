"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../../lib/auth-context";
import {
  postsApi,
  UserPost,
  PostVariant,
  Platform,
  AiProvider,
  PublishMode,
} from "../../../lib/api";
import DashboardShell from "../../../components/DashboardShell";
import DashboardContentSkeleton from "../../../components/DashboardContentSkeleton";
import { useLanguage } from "../../../lib/i18n/language-context";

const PLATFORM_META: Record<
  Platform,
  { label: string; bg: string; icon: string }
> = {
  FACEBOOK: { label: "Facebook", bg: "#1877F2", icon: "f" },
  LINKEDIN: { label: "LinkedIn", bg: "#0A66C2", icon: "in" },
  INSTAGRAM: {
    label: "Instagram",
    bg: "linear-gradient(135deg,#f58529,#dd2a7b,#8134af)",
    icon: "◎",
  },
  TIKTOK: { label: "TikTok", bg: "#000000", icon: "♪" },
  X: { label: "X", bg: "#000000", icon: "✕" },
};

const STATUS_META: Record<string, { label: string; className: string }> = {
  PENDING: {
    label: "بانتظار المراجعة",
    className: "bg-amber-50 text-amber-600",
  },
  APPROVED: { label: "متعمد", className: "bg-emerald-50 text-emerald-600" },
  PUBLISHING: { label: "بينشر...", className: "bg-blue-50 text-blue-600" },
  PUBLISHED: { label: "منشور", className: "bg-emerald-50 text-emerald-600" },
  FAILED: { label: "فشل النشر", className: "bg-red-50 text-red-600" },
};

const PROVIDERS: { id: AiProvider; label: string }[] = [
  { id: "GEMINI", label: "Gemini" },
  { id: "GROQ", label: "Groq" },
];

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  );
}

function SparklesIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3z"
        fill="currentColor"
      />
      <path
        d="M19 14l.8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8L19 14z"
        fill="currentColor"
      />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg
      className="h-3.5 w-3.5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        d="M3 12a9 9 0 0115.4-6.4M21 12a9 9 0 01-15.4 6.4"
        strokeLinecap="round"
      />
      <path
        d="M18 3v5h-5M6 21v-5h5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SaveIcon() {
  return (
    <svg
      className="h-3.5 w-3.5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg
      className="h-4.5 w-4.5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M12 21s-6.7-4.3-9.3-8.2C.9 9.9 1.7 6.4 4.6 5c2.2-1 4.6-.3 6 1.6C11.9 4.7 14.3 4 16.5 5c2.9 1.4 3.7 4.9 1.9 7.8C18.7 16.7 12 21 12 21z" />
    </svg>
  );
}

function CommentIcon() {
  return (
    <svg
      className="h-4.5 w-4.5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M21 12c0 4.4-4 8-9 8-1.2 0-2.4-.2-3.4-.6L3 21l1.3-4.1C3.5 15.6 3 13.9 3 12c0-4.4 4-8 9-8s9 3.6 9 8z" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg
      className="h-4.5 w-4.5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        d="M4 12v7a1 1 0 001 1h14a1 1 0 001-1v-7M16 6l-4-4-4 4M12 2v13"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BookmarkIcon() {
  return (
    <svg
      className="h-4.5 w-4.5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        d="M6 3h12a1 1 0 011 1v17l-7-4-7 4V4a1 1 0 011-1z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function isVideoUrl(url: string) {
  return /\.(mp4|mov|webm|m4v)$/i.test(url);
}

/** A rough visual mockup of how a generated variant would look on its target platform. */
function PlatformPreview({
  platform,
  text,
  mediaUrl,
  t,
}: {
  platform: Platform;
  text: string;
  mediaUrl?: string;
  t: (key: string) => string;
}) {
  const meta = PLATFORM_META[platform];
  const media = mediaUrl ? (
    isVideoUrl(mediaUrl) ? (
      // eslint-disable-next-line jsx-a11y/media-has-caption
      <video src={mediaUrl} className="max-h-64 w-full object-cover" />
    ) : (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={mediaUrl} alt="" className="max-h-64 w-full object-cover" />
    )
  ) : null;

  const header = (
    <div className="flex items-center gap-2 px-4 pt-3">
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
        style={{ background: meta.bg }}
      >
        {meta.icon}
      </span>
      <div className="leading-tight">
        <p className="text-sm font-semibold text-neutral">
          {t("editPost.you")}
        </p>
        <p className="text-[11px] text-muted">{t("editPost.now")}</p>
      </div>
    </div>
  );

  if (platform === "INSTAGRAM") {
    return (
      <div className="mx-auto w-full max-w-[320px] overflow-hidden rounded-lg border border-surface-line bg-white">
        {header}
        <div className="mt-3 aspect-square w-full bg-bg-soft">
          {media ?? (
            <div className="flex h-full w-full items-center justify-center text-xs text-muted">
              {meta.label}
            </div>
          )}
        </div>
        <div className="flex items-center gap-3 px-4 pt-2.5 text-neutral">
          <HeartIcon />
          <CommentIcon />
          <ShareIcon />
          <span className="flex-1" />
          <BookmarkIcon />
        </div>
        <p className="whitespace-pre-wrap px-4 py-2 text-sm leading-6 text-neutral">
          <span className="font-semibold">{t("editPost.you")} </span>
          {text}
        </p>
      </div>
    );
  }

  if (platform === "TIKTOK") {
    return (
      <div className="mx-auto flex w-full max-w-[280px] overflow-hidden rounded-2xl bg-black">
        <div className="relative aspect-[9/16] w-full">
          {media ?? (
            <div className="flex h-full w-full items-center justify-center bg-neutral-900 text-xs text-white/60">
              {meta.label}
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-black/70 to-transparent p-3">
            <p className="line-clamp-3 max-w-[75%] whitespace-pre-wrap text-xs leading-5 text-white">
              <span className="font-semibold">{t("editPost.you")} </span>
              {text}
            </p>
            <div className="flex flex-col items-center gap-3 text-white">
              <HeartIcon />
              <CommentIcon />
              <ShareIcon />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (platform === "X") {
    return (
      <div className="mx-auto w-full max-w-[400px] overflow-hidden rounded-2xl border border-surface-line bg-white">
        {header}
        <p className="whitespace-pre-wrap px-4 py-2.5 text-sm leading-6 text-neutral">
          {text}
        </p>
        {media && (
          <div className="overflow-hidden rounded-2xl mx-4 mb-3 border border-surface-line">
            {media}
          </div>
        )}
        <div className="flex items-center justify-around border-t border-surface-line px-4 py-2 text-muted">
          <CommentIcon />
          <ShareIcon />
          <HeartIcon />
          <ShareIcon />
        </div>
      </div>
    );
  }

  // FACEBOOK & LINKEDIN share a similar card layout
  return (
    <div className="mx-auto w-full max-w-[400px] overflow-hidden rounded-2xl border border-surface-line bg-white">
      {header}
      <p className="whitespace-pre-wrap px-4 py-2.5 text-sm leading-6 text-neutral">
        {text}
      </p>
      {media && <div className="mt-1">{media}</div>}
      <div className="flex items-center justify-around border-t border-surface-line px-4 py-2 text-muted">
        <span className="flex items-center gap-1.5 text-xs">
          <HeartIcon /> {platform === "LINKEDIN" ? "إعجاب" : "لايك"}
        </span>
        <span className="flex items-center gap-1.5 text-xs">
          <CommentIcon /> تعليق
        </span>
        <span className="flex items-center gap-1.5 text-xs">
          <ShareIcon /> مشاركة
        </span>
      </div>
    </div>
  );
}

export default function EditPostPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { token } = useAuth();
  const { t } = useLanguage();

  const [post, setPost] = useState<UserPost | null>(null);
  const [text, setText] = useState("");
  const [variants, setVariants] = useState<PostVariant[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [provider, setProvider] = useState<AiProvider>("GEMINI");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);
  const [savingVariantId, setSavingVariantId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cardTab, setCardTab] = useState<Record<string, "edit" | "preview">>(
    {},
  );
  const [publishMode, setPublishMode] = useState<PublishMode>("NOW");
  const [scheduledFor, setScheduledFor] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [publishAttempted, setPublishAttempted] = useState(false);

  useEffect(() => {
    if (!token) return;
    postsApi
      .list(token)
      .then((posts) => {
        const found = posts.find((p) => p.id === id) ?? null;
        setPost(found);
        setText(found?.originalText ?? "");
        setVariants(found?.variants ?? []);
        setDrafts(
          Object.fromEntries(
            (found?.variants ?? []).map((v) => [v.id, v.generatedText]),
          ),
        );
      })
      .finally(() => setIsLoading(false));
  }, [token, id]);

  async function handleSave() {
    if (!token || !post) return;
    setIsSaving(true);
    setError(null);
    try {
      await postsApi.update(token, post.id, text);
      router.push("/posts");
    } catch {
      setError(t("editPost.saveError"));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleRegenerate(variantId: string) {
    if (!token || !post) return;
    setRegeneratingId(variantId);
    setError(null);
    try {
      const updated = await postsApi.regenerateVariant(
        token,
        post.id,
        variantId,
        provider,
      );
      setVariants((prev) =>
        prev.map((v) => (v.id === variantId ? updated : v)),
      );
      setDrafts((prev) => ({ ...prev, [variantId]: updated.generatedText }));
    } catch {
      setError("تعذّر إعادة التوليد، حاول تاني");
    } finally {
      setRegeneratingId(null);
    }
  }

  async function handleSaveVariant(variantId: string) {
    if (!token || !post) return;
    setSavingVariantId(variantId);
    setError(null);
    try {
      const updated = await postsApi.updateVariant(
        token,
        post.id,
        variantId,
        drafts[variantId] ?? "",
      );
      setVariants((prev) =>
        prev.map((v) => (v.id === variantId ? updated : v)),
      );
    } catch {
      setError("تعذّر حفظ التعديل");
    } finally {
      setSavingVariantId(null);
    }
  }

  async function handleConfirmPublish() {
    if (!token || !post) return;
    if (publishMode === "SCHEDULE") {
      if (!scheduledFor || new Date(scheduledFor).getTime() <= Date.now()) {
        setPublishError(t("editPost.scheduleError"));
        return;
      }
    }
    setIsPublishing(true);
    setPublishError(null);
    setShowConfirm(false);
    setPublishAttempted(true);
    try {
      const updated = await postsApi.publish(
        token,
        post.id,
        publishMode,
        publishMode === "SCHEDULE"
          ? new Date(scheduledFor).toISOString()
          : undefined,
      );
      setPost(updated);
      setVariants(updated.variants);
    } catch {
      setPublishError(t("editPost.publishError"));
    } finally {
      setIsPublishing(false);
    }
  }

  async function handleRetryPublish(variantId: string) {
    if (!token || !post) return;
    setRetryingId(variantId);
    setPublishError(null);
    try {
      const updated = await postsApi.retryPublish(token, post.id, variantId);
      setVariants((prev) =>
        prev.map((v) => (v.id === variantId ? updated : v)),
      );
    } catch {
      setPublishError(t("editPost.publishError"));
    } finally {
      setRetryingId(null);
    }
  }

  if (isLoading) {
    return (
      <DashboardShell>
        <div className="mx-auto max-w-2xl">
          <DashboardContentSkeleton withHeader={false} />
        </div>
      </DashboardShell>
    );
  }

  if (!post) {
    return (
      <DashboardShell>
        <div className="mx-auto max-w-2xl">
          <p className="text-sm text-muted">{t("editPost.notFound")}</p>
          <Link
            href="/posts"
            className="mt-4 inline-block text-sm text-primary"
          >
            {t("editPost.back")}
          </Link>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <div className="mx-auto max-w-3xl pb-16">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-headline text-2xl font-bold text-neutral">
              {t("editPost.title")}
            </h1>
            <p className="mt-1 text-sm text-muted">
              راجع وعدّل النسخ قبل ما تنشرها
            </p>
          </div>
          <Link
            href="/posts"
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-muted transition hover:bg-bg-soft hover:text-neutral"
          >
            {t("editPost.cancel")}
          </Link>
        </div>

        {/* Original idea card */}
        <div className="mt-6 overflow-hidden rounded-2xl border border-surface-line bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-surface-line bg-bg-soft/60 px-4 py-3">
            <span className="text-sm font-semibold text-neutral">
              الفكرة الأصلية
            </span>
            <span className="text-xs tabular-nums text-muted">
              {text.length} حرف
            </span>
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={5}
            placeholder="اكتب فكرة البوست هنا..."
            className="w-full resize-none bg-transparent p-4 text-sm leading-7 text-neutral outline-none placeholder:text-muted"
          />
          <div className="flex items-center justify-end border-t border-surface-line px-4 py-2.5">
            <button
              onClick={handleSave}
              disabled={isSaving || !text.trim()}
              className="flex items-center gap-2 rounded-xl bg-primary px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-primary-light disabled:opacity-50"
            >
              {isSaving && <Spinner />}
              {isSaving ? t("editPost.saving") : t("editPost.save")}
            </button>
          </div>
        </div>

        {error && (
          <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        )}

        {variants.length > 0 && (
          <div className="mt-10">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-headline text-lg font-bold text-neutral">
                  المراجعة قبل النشر
                </h2>
                <p className="mt-0.5 text-xs text-muted">
                  {variants.length} نسخة جاهزة للمنصات اللي اخترتها
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted">
                  موديل إعادة التوليد
                </span>
                <div className="flex rounded-full border border-surface-line bg-white p-1 shadow-sm">
                  {PROVIDERS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setProvider(p.id)}
                      className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                        provider === p.id
                          ? "bg-primary text-white shadow-sm"
                          : "text-muted hover:text-neutral"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {variants.map((v) => {
                const meta = PLATFORM_META[v.platform];
                const status = STATUS_META[v.status] ?? {
                  label: v.status,
                  className: "bg-bg-soft text-muted",
                };
                const draftText = drafts[v.id] ?? "";
                const activeTab = cardTab[v.id] ?? "edit";
                return (
                  <div
                    key={v.id}
                    className="flex flex-col overflow-hidden rounded-2xl border border-surface-line bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    <div className="flex items-center justify-between border-b border-surface-line px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span
                          className="flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold text-white shadow-sm"
                          style={{ background: meta.bg }}
                        >
                          {meta.icon}
                        </span>
                        <span className="text-sm font-semibold text-neutral">
                          {meta.label}
                        </span>
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${status.className}`}
                      >
                        {status.label}
                      </span>
                    </div>

                    <div className="flex gap-1 border-b border-surface-line bg-bg-soft/40 px-3 pt-2">
                      {(["edit", "preview"] as const).map((tab) => (
                        <button
                          key={tab}
                          type="button"
                          onClick={() =>
                            setCardTab((prev) => ({ ...prev, [v.id]: tab }))
                          }
                          className={`rounded-t-lg px-3 py-1.5 text-xs font-semibold transition ${
                            activeTab === tab
                              ? "bg-white text-primary shadow-[0_-1px_0_0_theme(colors.primary)]"
                              : "text-muted hover:text-neutral"
                          }`}
                        >
                          {tab === "edit"
                            ? t("editPost.tabEdit")
                            : t("editPost.tabPreview")}
                        </button>
                      ))}
                    </div>

                    {activeTab === "edit" ? (
                      <textarea
                        value={draftText}
                        onChange={(e) =>
                          setDrafts((prev) => ({
                            ...prev,
                            [v.id]: e.target.value,
                          }))
                        }
                        rows={6}
                        className="flex-1 resize-none bg-transparent p-4 text-sm leading-7 text-neutral outline-none"
                      />
                    ) : (
                      <div className="flex-1 bg-bg-soft/40 p-4">
                        <PlatformPreview
                          platform={v.platform}
                          text={draftText}
                          mediaUrl={post.mediaUrls?.[0]}
                          t={t}
                        />
                      </div>
                    )}

                    {v.status === "FAILED" && v.errorLog && (
                      <div className="flex items-center justify-between gap-2 border-t border-red-100 bg-red-50 px-4 py-2.5">
                        <p className="text-xs text-red-600">{v.errorLog}</p>
                        <button
                          onClick={() => handleRetryPublish(v.id)}
                          disabled={retryingId === v.id}
                          className="flex shrink-0 items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
                        >
                          {retryingId === v.id ? <Spinner /> : <RefreshIcon />}
                          {retryingId === v.id
                            ? t("editPost.retrying")
                            : t("editPost.retryButton")}
                        </button>
                      </div>
                    )}

                    <div className="flex items-center justify-between border-t border-surface-line bg-bg-soft/40 px-4 py-2.5">
                      <span className="text-[11px] tabular-nums text-muted">
                        {draftText.length} حرف
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleRegenerate(v.id)}
                          disabled={regeneratingId === v.id}
                          className="flex items-center gap-1.5 rounded-lg border border-surface-line bg-white px-3 py-1.5 text-xs font-semibold text-neutral transition hover:bg-bg-soft disabled:opacity-50"
                        >
                          {regeneratingId === v.id ? (
                            <Spinner />
                          ) : (
                            <RefreshIcon />
                          )}
                          {regeneratingId === v.id
                            ? "بيتم التوليد..."
                            : "إعادة توليد"}
                        </button>
                        <button
                          onClick={() => handleSaveVariant(v.id)}
                          disabled={savingVariantId === v.id}
                          className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-primary-light disabled:opacity-50"
                        >
                          {savingVariantId === v.id ? (
                            <Spinner />
                          ) : (
                            <SaveIcon />
                          )}
                          {savingVariantId === v.id
                            ? "بيتحفظ..."
                            : "حفظ التعديل"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {variants.length > 0 && (
          <div className="mt-8 overflow-hidden rounded-2xl border border-surface-line bg-white shadow-sm">
            <div className="border-b border-surface-line p-4">
              <p className="text-sm font-semibold text-neutral">
                {t("editPost.publishTitle")}
              </p>
            </div>
            <div className="flex flex-col gap-4 p-4">
              <div className="flex rounded-full border border-surface-line bg-bg-soft p-1">
                <button
                  type="button"
                  onClick={() => setPublishMode("NOW")}
                  className={`flex-1 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                    publishMode === "NOW"
                      ? "bg-primary text-white shadow-sm"
                      : "text-muted hover:text-neutral"
                  }`}
                >
                  {t("editPost.publishNow")}
                </button>
                <button
                  type="button"
                  onClick={() => setPublishMode("SCHEDULE")}
                  className={`flex-1 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                    publishMode === "SCHEDULE"
                      ? "bg-primary text-white shadow-sm"
                      : "text-muted hover:text-neutral"
                  }`}
                >
                  {t("editPost.publishSchedule")}
                </button>
              </div>

              {publishMode === "SCHEDULE" && (
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted">
                    {t("editPost.scheduleLabel")}
                  </label>
                  <input
                    type="datetime-local"
                    value={scheduledFor}
                    onChange={(e) => setScheduledFor(e.target.value)}
                    className="rounded-xl border border-surface-line bg-white px-3 py-2 text-sm text-neutral outline-none focus:border-primary"
                  />
                </div>
              )}

              {publishError && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                  {publishError}
                </p>
              )}

              {publishAttempted &&
                !isPublishing &&
                post.status === "PUBLISHED" && (
                  <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-600">
                    {variants.every((v) => v.status === "PUBLISHED")
                      ? t("editPost.publishedOk")
                      : `${variants.filter((v) => v.status === "PUBLISHED").length}/${variants.length} ${t("editPost.publishedOk")}`}
                  </p>
                )}

              {publishAttempted &&
                !isPublishing &&
                post.status === "SCHEDULED" && (
                  <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-600">
                    {t("editPost.scheduledOk")}
                  </p>
                )}

              <button
                type="button"
                onClick={() => {
                  setPublishError(null);
                  setShowConfirm(true);
                }}
                disabled={isPublishing}
                className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-primary to-secondary py-3 text-sm font-semibold text-white shadow-sm transition hover:shadow-md disabled:opacity-50"
              >
                {isPublishing && <Spinner />}
                {isPublishing
                  ? t("editPost.publishing")
                  : publishMode === "NOW"
                    ? t("editPost.publishButton")
                    : t("editPost.scheduleButton")}
              </button>
            </div>
          </div>
        )}

        {variants.length === 0 && (
          <div className="mt-8 flex flex-col items-center gap-2 rounded-2xl border border-dashed border-surface-line bg-white/60 px-6 py-10 text-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-white shadow-sm">
              <SparklesIcon />
            </span>
            <p className="text-sm font-medium text-neutral">
              لسه مفيش نسخ متولّدة للبوست ده
            </p>
            <p className="text-xs text-muted">
              التوليد بيحصل من صفحة إنشاء البوست — ارجع للقائمة وابدأ بوست جديد
            </p>
          </div>
        )}
      </div>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
            <h3 className="font-headline text-lg font-bold text-neutral">
              {t("editPost.confirmTitle")}
            </h3>
            <p className="mt-2 text-sm text-muted">
              {publishMode === "NOW"
                ? t("editPost.confirmPublishNow")
                : `${t("editPost.confirmSchedule")} ${
                    scheduledFor ? new Date(scheduledFor).toLocaleString() : ""
                  }`}
            </p>
            {publishMode === "NOW" && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {variants.map((v) => {
                  const meta = PLATFORM_META[v.platform];
                  return (
                    <span
                      key={v.id}
                      className="flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold text-white"
                      style={{ background: meta.bg }}
                    >
                      {meta.icon}
                    </span>
                  );
                })}
              </div>
            )}
            <div className="mt-5 flex gap-2">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 rounded-xl border border-surface-line py-2.5 text-sm font-semibold text-neutral transition hover:bg-bg-soft"
              >
                {t("editPost.confirmCancel")}
              </button>
              <button
                onClick={handleConfirmPublish}
                className="flex-1 rounded-xl bg-gradient-to-br from-primary to-secondary py-2.5 text-sm font-semibold text-white shadow-sm transition hover:shadow-md"
              >
                {t("editPost.confirmProceed")}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
