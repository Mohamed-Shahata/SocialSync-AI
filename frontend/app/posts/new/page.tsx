"use client";

import { useMemo, useRef, useState } from "react";
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

type ContentType = "TEXT" | "TEXT_IMAGE" | "TEXT_VIDEO";

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

function CheckIcon() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
      <path
        d="M5 13l4 4L19 7"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const TOTAL_STEPS = 4;

export default function NewPostPage() {
  const { token } = useAuth();
  const router = useRouter();
  const { t } = useLanguage();

  const [step, setStep] = useState(1);

  // Step 1
  const [aiPrompt, setAiPrompt] = useState("");
  const [originalPlatform, setOriginalPlatform] = useState<Platform | "">("");

  // Step 2
  const [selected, setSelected] = useState<Platform[]>([]);

  // Step 3
  const [contentType, setContentType] = useState<ContentType>("TEXT");
  const [files, setFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Step 4 / generation
  const [dialect, setDialect] = useState<Dialect>("EGYPTIAN");
  const [provider, setProvider] = useState<AiProvider>("GEMINI");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedCount, setGeneratedCount] = useState(0);

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
    const accept =
      contentType === "TEXT_VIDEO"
        ? (f: File) => f.type.startsWith("video")
        : (f: File) => f.type.startsWith("image");
    setFiles((prev) => [...prev, ...Array.from(list).filter(accept)]);
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  function changeContentType(next: ContentType) {
    setContentType(next);
    setFiles([]);
  }

  function goNext() {
    setError("");
    if (step === 1) {
      if (!aiPrompt.trim()) {
        setError(t("newPost.step1Error"));
        return;
      }
    }
    if (step === 2) {
      if (selected.length === 0) {
        setError(t("newPost.step2Error"));
        return;
      }
    }
    if (step === 3) {
      if (contentType !== "TEXT" && files.length === 0) {
        setError(t("newPost.step3Error"));
        return;
      }
    }
    setStep((s) => Math.min(TOTAL_STEPS, s + 1));
  }

  function goBack() {
    setError("");
    setStep((s) => Math.max(1, s - 1));
  }

  async function handleGenerate() {
    if (!token) return;
    setError("");
    setIsSubmitting(true);
    setGeneratedCount(0);

    // simulated per-platform progress while the single create request runs
    const progressTimer = setInterval(() => {
      setGeneratedCount((c) => (c < selected.length - 1 ? c + 1 : c));
    }, 900);

    try {
      const created = await postsApi.create(
        token,
        aiPrompt.trim(),
        selected,
        files,
        originalPlatform || undefined,
        provider,
        dialect,
        aiPrompt.trim(),
      );
      clearInterval(progressTimer);
      setGeneratedCount(selected.length);
      router.push(`/posts/${created.id}`);
    } catch (err) {
      clearInterval(progressTimer);
      setError(
        err instanceof ApiError ? err.message : t("newPost.genericError"),
      );
      setIsSubmitting(false);
    }
  }

  const contentTypes: { id: ContentType; label: string; accept: string }[] = [
    { id: "TEXT", label: t("newPost.contentTypeText"), accept: "" },
    {
      id: "TEXT_IMAGE",
      label: t("newPost.contentTypeImage"),
      accept: "image/*",
    },
    {
      id: "TEXT_VIDEO",
      label: t("newPost.contentTypeVideo"),
      accept: "video/*",
    },
  ];

  return (
    <DashboardShell>
      <div className="mx-auto flex max-w-2xl flex-1 flex-col">
        <h1 className="font-headline text-2xl font-bold text-neutral">
          {t("newPost.title")}
        </h1>

        {/* Step indicator */}
        <div className="mt-4 flex items-center gap-2">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((n) => (
            <div key={n} className="flex flex-1 items-center gap-2">
              <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                  n < step
                    ? "bg-primary text-white"
                    : n === step
                      ? "bg-gradient-to-br from-primary to-secondary text-white shadow-sm"
                      : "bg-bg-soft text-muted"
                }`}
              >
                {n < step ? <CheckIcon /> : n}
              </div>
              {n < TOTAL_STEPS && (
                <div
                  className={`h-0.5 flex-1 rounded ${n < step ? "bg-primary" : "bg-surface-line"}`}
                />
              )}
            </div>
          ))}
        </div>
        <p className="mt-2 text-xs text-muted">
          {t("newPost.step")} {step} {t("newPost.stepOf")} {TOTAL_STEPS}
        </p>

        {error && (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        )}

        <div className="mt-5 flex flex-col gap-5">
          {/* STEP 1 */}
          {step === 1 && (
            <div className="gradient-border">
              <div className="overflow-hidden rounded-[24px] bg-white shadow-sm">
                <div className="flex items-center gap-2.5 border-b border-primary/10 bg-gradient-to-br from-primary/[0.05] via-white to-secondary/[0.05] px-4 py-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-white shadow-sm">
                    <SparklesIcon />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-neutral">
                      {t("newPost.step1Title")}
                    </p>
                    <p className="text-xs text-muted">
                      {t("newPost.step1Subtitle")}
                    </p>
                  </div>
                </div>

                <div className="p-4">
                  <textarea
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    rows={5}
                    placeholder={t("newPost.textPlaceholder")}
                    className="w-full resize-none rounded-xl border border-surface-line bg-white p-3 text-sm leading-7 text-neutral outline-none focus:border-primary"
                  />
                  <div className="mt-1 text-end text-xs text-muted">
                    {aiPrompt.length} {t("newPost.charCount")}
                  </div>

                  <label className="mt-4 mb-2 block text-sm font-medium text-neutral">
                    {t("newPost.originalPlatform")}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setOriginalPlatform("")}
                      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                        originalPlatform === ""
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-surface-line text-muted hover:text-neutral"
                      }`}
                    >
                      {t("newPost.originalPlatformNone")}
                    </button>
                    {platforms.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setOriginalPlatform(p.id)}
                        className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                          originalPlatform === p.id
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-surface-line text-muted hover:text-neutral"
                        }`}
                      >
                        <span
                          className="flex h-4 w-4 items-center justify-center rounded-full text-[8px] font-bold text-white"
                          style={{ background: p.bg }}
                        >
                          {p.icon}
                        </span>
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="overflow-hidden rounded-2xl border border-surface-line bg-white shadow-sm">
              <div className="border-b border-surface-line p-4">
                <p className="text-sm font-semibold text-neutral">
                  {t("newPost.step2Title")}
                </p>
                <p className="mt-0.5 text-xs text-muted">
                  {t("newPost.step2Subtitle")}
                </p>
              </div>
              <div className="grid grid-cols-1 gap-1.5 p-3 sm:grid-cols-2">
                {platforms.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => togglePlatform(p.id)}
                    className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm transition ${
                      selected.includes(p.id)
                        ? "border-primary bg-primary/5"
                        : "border-surface-line hover:bg-bg-soft"
                    }`}
                  >
                    <span
                      className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white"
                      style={{ background: p.bg }}
                    >
                      {p.icon}
                    </span>
                    <span className="flex-1 text-start text-neutral">
                      {p.label}
                    </span>
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                        selected.includes(p.id)
                          ? "border-primary bg-primary text-white"
                          : "border-surface-line"
                      }`}
                    >
                      {selected.includes(p.id) && <CheckIcon />}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="flex flex-col gap-4">
              <div className="overflow-hidden rounded-2xl border border-surface-line bg-white shadow-sm">
                <div className="border-b border-surface-line p-4">
                  <p className="text-sm font-semibold text-neutral">
                    {t("newPost.step3Title")}
                  </p>
                  <p className="mt-0.5 text-xs text-muted">
                    {t("newPost.step3Subtitle")}
                  </p>
                </div>
                <div className="flex gap-2 p-3">
                  {contentTypes.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => changeContentType(c.id)}
                      className={`flex-1 rounded-xl border px-3 py-2.5 text-center text-xs font-semibold transition ${
                        contentType === c.id
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-surface-line text-muted hover:text-neutral"
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {contentType !== "TEXT" && (
                <>
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
                    <p className="text-xs text-muted">
                      {t("newPost.dropzoneOr")}
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept={
                        contentType === "TEXT_VIDEO" ? "video/*" : "image/*"
                      }
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
                            <video
                              src={p.url}
                              className="h-full w-full object-cover"
                            />
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
                </>
              )}
            </div>
          )}

          {/* STEP 4 */}
          {step === 4 && (
            <div className="flex flex-col gap-4">
              <div className="overflow-hidden rounded-2xl border border-surface-line bg-white shadow-sm">
                <div className="border-b border-surface-line p-4">
                  <p className="text-sm font-semibold text-neutral">
                    {t("newPost.step4Title")}
                  </p>
                  <p className="mt-0.5 text-xs text-muted">
                    {t("newPost.step4Subtitle")}
                  </p>
                </div>
                <div className="flex flex-col gap-3 p-4 text-sm">
                  <div>
                    <p className="text-xs font-medium text-muted">
                      {t("newPost.summaryIdea")}
                    </p>
                    <p className="mt-0.5 text-neutral">{aiPrompt}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted">
                      {t("newPost.summaryPlatforms")}
                    </p>
                    <div className="mt-1 flex flex-wrap gap-1.5">
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
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted">
                      {t("newPost.summaryContentType")}
                    </p>
                    <p className="mt-0.5 text-neutral">
                      {contentTypes.find((c) => c.id === contentType)?.label}
                    </p>
                  </div>
                  {files.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-muted">
                        {t("newPost.summaryMedia")}
                      </p>
                      <p className="mt-0.5 text-neutral">
                        {files.length} {t("newPost.filesSelected")}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-surface-line bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
              </div>

              {isSubmitting && (
                <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/[0.05] via-white to-secondary/[0.05] p-4">
                  <p className="text-sm font-semibold text-neutral">
                    {t("newPost.generatingTitle")}
                  </p>
                  <p className="mt-0.5 text-xs text-muted">
                    {t("newPost.generatingSubtitle")}
                  </p>
                  <div className="mt-3 flex flex-col gap-2">
                    {selected.map((id, i) => {
                      const p = platforms.find((pl) => pl.id === id)!;
                      const done = i < generatedCount;
                      return (
                        <div
                          key={id}
                          className="flex items-center gap-2.5 rounded-lg bg-white px-3 py-2 shadow-sm"
                        >
                          <span
                            className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-white"
                            style={{ background: p.bg }}
                          >
                            {p.icon}
                          </span>
                          <span className="flex-1 text-xs text-neutral">
                            {p.label}
                          </span>
                          {done ? (
                            <span className="text-primary">
                              <CheckIcon />
                            </span>
                          ) : (
                            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-surface-line border-t-primary" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Nav buttons */}
        <div className="mt-6 flex items-center gap-3">
          {step > 1 && (
            <button
              type="button"
              onClick={goBack}
              disabled={isSubmitting}
              className="flex-1 rounded-xl border border-surface-line py-3 text-sm font-semibold text-neutral transition hover:bg-bg-soft disabled:opacity-50"
            >
              {t("newPost.back")}
            </button>
          )}

          {step < TOTAL_STEPS ? (
            <button
              type="button"
              onClick={goNext}
              className="flex-1 rounded-xl bg-gradient-to-br from-primary to-secondary py-3 text-sm font-semibold text-white shadow-sm transition hover:shadow-md"
            >
              {t("newPost.next")}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isSubmitting}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-primary to-secondary py-3 text-sm font-semibold text-white shadow-sm transition hover:shadow-md disabled:opacity-50"
            >
              <SparklesIcon />
              {isSubmitting
                ? t("newPost.generatingTitle")
                : t("newPost.generateNow")}
            </button>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
