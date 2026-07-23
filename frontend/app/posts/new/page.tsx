"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../lib/auth-context";
import { postsApi, ApiError, Platform } from "../../../lib/api";
import DashboardShell from "../../../components/DashboardShell";

const platforms: { id: Platform; label: string }[] = [
  { id: "LINKEDIN", label: "LinkedIn" },
  { id: "FACEBOOK", label: "Facebook" },
  { id: "INSTAGRAM", label: "Instagram" },
  { id: "TIKTOK", label: "TikTok" },
  { id: "X", label: "X" },
];

export default function NewPostPage() {
  const { token } = useAuth();
  const router = useRouter();

  const [text, setText] = useState("");
  const [selected, setSelected] = useState<Platform[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function togglePlatform(p: Platform) {
    setSelected((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p],
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!token) return;
    if (!text.trim()) {
      setError("اكتب نص البوست");
      return;
    }

    setIsSubmitting(true);
    try {
      await postsApi.create(token, text, selected, files);
      router.push("/posts");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "حصل خطأ، حاول تاني");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <DashboardShell>
      <div className="mx-auto flex max-w-2xl flex-1 flex-col">
        <h1 className="font-headline text-2xl font-bold text-neutral">
          إنشاء بوست جديد
        </h1>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral">
              نص البوست
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={6}
              placeholder="اكتب فكرتك هنا..."
              className="w-full rounded-xl border border-surface-line bg-bg-soft p-3 text-sm text-neutral outline-none focus:border-primary-light focus:bg-white"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral">
              انشر على
            </label>
            <div className="flex flex-wrap gap-2">
              {platforms.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => togglePlatform(p.id)}
                  className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                    selected.includes(p.id)
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-surface-line text-muted hover:bg-bg-soft"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral">
              صور / فيديوهات (اختياري)
            </label>
            <input
              type="file"
              accept="image/*,video/*"
              multiple
              onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
              className="block w-full text-sm text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-primary/10 file:px-3 file:py-2 file:text-sm file:font-medium file:text-primary"
            />
            {files.length > 0 && (
              <p className="mt-1 text-xs text-muted">
                {files.length} ملف تم اختياره
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-1 rounded-xl bg-primary py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-light disabled:opacity-50"
          >
            {isSubmitting ? "...جاري الحفظ" : "حفظ كمسودة"}
          </button>
        </form>
      </div>
    </DashboardShell>
  );
}
