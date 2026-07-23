"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../../lib/auth-context";
import { postsApi, UserPost } from "../../../lib/api";

export default function EditPostPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { token } = useAuth();

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
      setError("حصل خطأ أثناء الحفظ، حاول تاني.");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10 text-sm text-muted">
        ...جاري التحميل
      </div>
    );
  }

  if (!post) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <p className="text-sm text-muted">البوست ده مش موجود.</p>
        <Link href="/posts" className="mt-4 inline-block text-sm text-primary">
          ← الرجوع للبوستات
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="font-headline text-2xl font-bold text-neutral">
          تعديل البوست
        </h1>
        <Link href="/posts" className="text-sm text-muted hover:text-neutral">
          إلغاء
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
          {isSaving ? "...جاري الحفظ" : "حفظ التعديلات"}
        </button>
      </div>
    </div>
  );
}
