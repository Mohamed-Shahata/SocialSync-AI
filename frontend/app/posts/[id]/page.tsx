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
    </DashboardShell>
  );
}
