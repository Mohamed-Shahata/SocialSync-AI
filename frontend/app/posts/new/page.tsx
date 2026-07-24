"use client";

import { useMemo, useRef, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../lib/auth-context";
import {
  postsApi,
  ApiError,
  Platform,
  AiProvider,
  Dialect,
} from "../../../lib/api";
import DashboardShell from "../../../components/DashboardShell";
import { useLanguage } from "../../../lib/i18n/language-context";

const platforms: { id: Platform; label: string; bg: string; icon: string }[] = [
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

const dialects: { id: Dialect; label: string }[] = [
  { id: "EGYPTIAN", label: "مصرية" },
  { id: "GULF", label: "خليجية" },
  { id: "IRAQI", label: "عراقية" },
  { id: "LEVANTINE", label: "شامية" },
  { id: "MSA", label: "فصحى" },
  { id: "ENGLISH", label: "English" },
];

const providers: { id: AiProvider; label: string }[] = [
  { id: "GEMINI", label: "Gemini" },
  { id: "GROQ", label: "Groq" },
];

function SparklesIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
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

function UploadIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        d="M12 16V4M12 4l-4 4M12 4l4 4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function NewPostPage() {
  const { token } = useAuth();
  const router = useRouter();
  const { t } = useLanguage();

  const [text, setText] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [selected, setSelected] = useState<Platform[]>([]);
  const [dialect, setDialect] = useState<Dialect>("EGYPTIAN");
  const [provider, setProvider] = useState<AiProvider>("GEMINI");
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const previews = useMemo(
    () =>
      files.map((f) => ({
        url: URL.createObjectURL(f),
        isVideo: f.type.startsWith("video"),
        name: f.name,
      })),
    [files],
  );

  function togglePlatform(p: Platform) {
    setSelected((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p],
    );
  }

  function addFiles(list: FileList | null) {
    if (!list) return;
    setFiles((prev) => [...prev, ...Array.from(list)]);
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!token) return;

    const trimmedText = text.trim();
    const trimmedPrompt = aiPrompt.trim();

    if (!trimmedText && !trimmedPrompt) {
      setError("اكتب فكرة للـ AI أو اكتب محتوى البوست بنفسك الأول");
      return;
    }

    const finalText = trimmedText || trimmedPrompt;

    setIsSubmitting(true);
    try {
      const created = await postsApi.create(
        token,
        finalText,
        selected,
        files,
        undefined,
        provider,
        dialect,
        trimmedPrompt || undefined,
      );
      router.push(`/posts/${created.id}`);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : t("newPost.genericError"),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <DashboardShell>
      <div className="mx-auto flex max-w-2xl flex-1 flex-col">
        <h1 className="font-headline text-2xl font-bold text-neutral">
          {t("newPost.title")}
        </h1>
        <p className="mt-1 text-sm text-muted">
          اكتب فكرتك مرة واحدة، وهنولّدها بالشكل المناسب لكل منصة
        </p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5">
          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}

          <div className="overflow-hidden rounded-2xl border border-surface-line bg-white shadow-sm">
            {/* Platform select */}
            <div className="relative border-b border-surface-line p-4">
              <label className="mb-2 block text-sm font-medium text-neutral">
                {t("newPost.postOn")}
              </label>
              <button
                type="button"
                onClick={() => setDropdownOpen((v) => !v)}
                className="flex w-full items-center justify-between rounded-xl border border-surface-line bg-bg-soft px-3 py-2.5 text-sm text-neutral"
              >
                {selected.length === 0 ? (
                  <span className="text-muted">
                    {t("newPost.selectPlatforms")}
                  </span>
                ) : (
                  <span className="flex flex-wrap items-center gap-1.5">
                    {selected.map((id) => {
                      const p = platforms.find((pl) => pl.id === id)!;
                      return (
                        <span
                          key={id}
                          className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-white"
                          style={{ background: p.bg }}
                        >
                          {p.icon}
                        </span>
                      );
                    })}
                    <span className="text-xs text-muted">
                      {selected.length} {t("newPost.platformsSelected")}
                    </span>
                  </span>
                )}
                <span
                  className={`text-muted transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                >
                  ▾
                </span>
              </button>

              {dropdownOpen && (
                <div className="absolute inset-x-4 top-full z-10 mt-1.5 rounded-xl border border-surface-line bg-white p-1.5 shadow-lg">
                  {platforms.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => togglePlatform(p.id)}
                      className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-sm hover:bg-bg-soft"
                    >
                      <span
                        className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white"
                        style={{ background: p.bg }}
                      >
                        {p.icon}
                      </span>
                      <span className="flex-1 text-start text-neutral">
                        {p.label}
                      </span>
                      <span
                        className={`flex h-4.5 w-4.5 items-center justify-center rounded border ${
                          selected.includes(p.id)
                            ? "border-primary bg-primary text-white"
                            : "border-surface-line"
                        }`}
                      >
                        {selected.includes(p.id) && "✓"}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Compose box */}
            <div className="p-4">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={5}
                placeholder={t("newPost.textPlaceholder")}
                className="w-full resize-none border-0 bg-transparent text-base leading-7 text-neutral outline-none placeholder:text-muted"
              />
              <div className="mt-1 text-end text-xs text-muted">
                {text.length} {t("newPost.charCount")}
              </div>
            </div>
          </div>

          {/* AI assist card */}
          <div className="gradient-border">
            <div className="overflow-hidden rounded-[24px] bg-white shadow-sm">
              <div className="flex items-center gap-2.5 border-b border-primary/10 bg-gradient-to-br from-primary/[0.05] via-white to-secondary/[0.05] px-4 py-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-white shadow-sm">
                  <SparklesIcon />
                </span>
                <div>
                  <p className="text-sm font-semibold text-neutral">
                    خلي الـ AI يكتبلك البوست
                  </p>
                  <p className="text-xs text-muted">
                    اكتب فكرة سريعة وسيبله الباقي، أو سيب الخانة فاضية وهيعتمد
                    على النص اللي كتبته فوق
                  </p>
                </div>
              </div>

              <div className="p-4">
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  rows={3}
                  placeholder="مثال: بوست عن افتتاح فرع جديد للمحل في المعادي..."
                  className="w-full resize-none rounded-xl border border-surface-line bg-white p-3 text-sm text-neutral outline-none focus:border-primary"
                />

                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-muted">
                      اللهجة
                    </span>
                    <select
                      value={dialect}
                      onChange={(e) => setDialect(e.target.value as Dialect)}
                      className="rounded-lg border border-surface-line bg-white px-2.5 py-1.5 text-xs font-medium text-neutral outline-none focus:border-primary"
                    >
                      {dialects.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-muted">
                      موديل التوليد
                    </span>
                    <div className="flex rounded-full border border-surface-line bg-white p-1">
                      {providers.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setProvider(p.id)}
                          className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
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

                <p className="mt-3 text-[11px] text-muted">
                  {selected.length > 0
                    ? `هيتولّد بوست منفصل لكل منصة من الـ ${selected.length} اللي اخترتها بس`
                    : "اختار منصة واحدة على الأقل فوق عشان يتولّدلها بوست تلقائي"}
                </p>
              </div>
            </div>
          </div>

          {/* Media dropzone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              addFiles(e.dataTransfer.files);
            }}
            className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-8 text-center transition-all ${
              dragOver
                ? "scale-[1.01] border-primary bg-primary/5"
                : "border-surface-line bg-white hover:border-primary-light hover:bg-bg-soft"
            }`}
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-white shadow-sm">
              <UploadIcon />
            </span>
            <p className="text-sm font-medium text-neutral">
              {t("newPost.dropzoneTitle")}
            </p>
            <p className="text-xs text-muted">{t("newPost.dropzoneOr")}</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              multiple
              onChange={(e) => addFiles(e.target.files)}
              className="hidden"
            />
          </div>

          {previews.length > 0 && (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {previews.map((p, i) => (
                <div
                  key={i}
                  className="group relative aspect-square overflow-hidden rounded-lg border border-surface-line bg-bg-soft"
                >
                  {p.isVideo ? (
                    // eslint-disable-next-line jsx-a11y/media-has-caption
                    <video src={p.url} className="h-full w-full object-cover" />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.url}
                      alt={p.name}
                      className="h-full w-full object-cover"
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    className="absolute end-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-primary to-secondary py-3 text-sm font-semibold text-white shadow-sm transition hover:shadow-md disabled:opacity-50"
          >
            {selected.length > 0 && <SparklesIcon />}
            {isSubmitting
              ? selected.length > 0
                ? "بيتولد المحتوى..."
                : t("newPost.saving")
              : selected.length > 0
                ? "ولّد البوست بالـ AI"
                : t("newPost.save")}
          </button>
          {selected.length > 0 && (
            <p className="-mt-2 text-center text-[11px] text-muted">
              الزرار ده هيحفظ البوست ويولّدلك نسخة لكل منصة اخترتها فورًا
            </p>
          )}
        </form>
      </div>
    </DashboardShell>
  );
}
