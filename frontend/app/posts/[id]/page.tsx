"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../../lib/auth-context";
import { postsApi, UserPost } from "../../../lib/api";
import DashboardShell from "../../../components/DashboardShell";
import { useLanguage } from "../../../lib/i18n/language-context";

export default function EditPostPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { token } = useAuth();
  const { t } = useLanguage();

  const [post, setPost] = useState<UserPost | null>(null);
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    postsApi
      .list(token)
      .then((posts) => {
        const found = posts.find((p) => p.id === id) ?? null;
        setPost(found);
        setText(found?.originalText ?? "");
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

  if (isLoading) {
    return (
      <DashboardShell>
        <div className="mx-auto max-w-2xl text-sm text-muted">
          {t("editPost.loading")}
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
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center justify-between">
          <h1 className="font-headline text-2xl font-bold text-neutral">
            {t("editPost.title")}
          </h1>
          <Link href="/posts" className="text-sm text-muted hover:text-neutral">
            {t("editPost.cancel")}
          </Link>
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={8}
          className="mt-6 w-full rounded-xl border border-surface-line bg-white p-4 text-sm outline-none focus:border-primary"
        />

        {post.variants.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {post.variants.map((v) => (
              <span
                key={v.id}
                className="rounded-full bg-bg-soft px-2 py-0.5 text-xs text-muted"
              >
                {v.platform}
              </span>
            ))}
          </div>
        )}

        {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={handleSave}
            disabled={isSaving || !text.trim()}
            className="rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary-light disabled:opacity-50"
          >
            {isSaving ? t("editPost.saving") : t("editPost.save")}
          </button>
        </div>
      </div>
    </DashboardShell>
  );
}
