"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "../../lib/auth-context";
import { postsApi, UserPost, Platform } from "../../lib/api";
import DashboardShell from "../../components/DashboardShell";
import DashboardContentSkeleton from "../../components/DashboardContentSkeleton";
import { useLanguage } from "../../lib/i18n/language-context";
import type { TranslationKey } from "../../lib/i18n/translations";

const platformDot: Record<Platform, string> = {
  LINKEDIN: "bg-sky-500",
  FACEBOOK: "bg-blue-600",
  INSTAGRAM: "bg-pink-500",
  TIKTOK: "bg-neutral",
  X: "bg-neutral",
};

type FilterKey = "ALL" | "PUBLISHED" | "DRAFT" | "SCHEDULED";

const PAGE_SIZE = 5;

export default function MyPostsPage() {
  const { user, token } = useAuth();
  const { t, language } = useLanguage();

  const statusLabels: Record<string, string> = {
    DRAFT: t("status.DRAFT"),
    SCHEDULED: t("status.SCHEDULED"),
    PUBLISHED: t("status.PUBLISHED"),
    FAILED: t("status.FAILED"),
  };

  const filters: { key: FilterKey; label: string }[] = [
    { key: "ALL", label: t("posts.filterAll") },
    { key: "PUBLISHED", label: t("posts.filterPublished") },
    { key: "DRAFT", label: t("posts.filterDraft") },
    { key: "SCHEDULED", label: t("posts.filterScheduled") },
  ];

  const [posts, setPosts] = useState<UserPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterKey>("ALL");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!token) return;
    postsApi
      .list(token)
      .then(setPosts)
      .finally(() => setIsLoading(false));
  }, [token]);

  async function handleDelete(id: string) {
    if (!token) return;
    setDeletingId(id);
    try {
      await postsApi.remove(token, id);
      setPosts((prev) => prev.filter((p) => p.id !== id));
    } finally {
      setDeletingId(null);
    }
  }

  const filtered = useMemo(() => {
    return posts.filter((p) => {
      const matchesFilter = filter === "ALL" || p.status === filter;
      const matchesSearch = p.originalText
        .toLowerCase()
        .includes(search.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [posts, filter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pagePosts = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <DashboardShell>
      <div>
        {/* Topbar */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-bg-soft text-sm">
              {user?.email?.[0]?.toUpperCase() ?? "؟"}
            </div>
            <Link
              href="/posts/new"
              className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-light"
            >
              + {t("posts.newPost")}
            </Link>
          </div>
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder={t("posts.searchPlaceholder")}
            className="w-64 rounded-xl border border-surface-line bg-white px-4 py-2 text-sm outline-none focus:border-primary"
          />
        </div>

        {/* Filters */}
        <div className="mt-6 flex items-center gap-2">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => {
                setFilter(f.key);
                setPage(1);
              }}
              className={`rounded-full px-4 py-1.5 text-sm font-medium ${
                filter === f.key
                  ? "bg-primary text-white"
                  : "bg-white text-muted hover:bg-bg-soft"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {isLoading && (
          <div className="mt-6">
            <DashboardContentSkeleton withHeader={false} />
          </div>
        )}

        {!isLoading && (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pagePosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onDelete={() => handleDelete(post.id)}
                deleting={deletingId === post.id}
                statusLabels={statusLabels}
                t={t}
                language={language}
              />
            ))}

            {/* New post card */}
            <Link
              href="/posts/new"
              className="flex min-h-[220px] flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-surface-line bg-white text-center text-muted hover:border-primary hover:text-primary"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-bg-soft text-lg">
                +
              </span>
              <p className="text-sm font-medium">{t("posts.newCardTitle")}</p>
              <p className="px-6 text-xs">{t("posts.newCardDesc")}</p>
            </Link>
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <p className="mt-6 text-sm text-muted">{t("posts.empty")}</p>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2 text-sm">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-lg px-2 py-1 text-muted disabled:opacity-30"
            >
              ‹
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                onClick={() => setPage(n)}
                className={`h-7 w-7 rounded-full ${
                  page === n
                    ? "bg-primary text-white"
                    : "text-muted hover:bg-bg-soft"
                }`}
              >
                {n}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="rounded-lg px-2 py-1 text-muted disabled:opacity-30"
            >
              ›
            </button>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}

function PostCard({
  post,
  onDelete,
  deleting,
  statusLabels,
  t,
  language,
}: {
  post: UserPost;
  onDelete: () => void;
  deleting: boolean;
  statusLabels: Record<string, string>;
  t: (key: TranslationKey) => string;
  language: string;
}) {
  const date = new Date(post.createdAt).toLocaleDateString(
    language === "ar" ? "ar-EG" : "en-US",
    {
      day: "2-digit",
      month: "long",
      year: "numeric",
    },
  );

  return (
    <div className="overflow-hidden rounded-xl border border-surface-line bg-white">
      <div className="relative h-32 w-full bg-bg-soft">
        {post.mediaUrls[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.mediaUrls[0]}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted">
            {t("posts.noImage")}
          </div>
        )}
        <span className="absolute end-2 top-2 rounded-full bg-black/50 px-2 py-0.5 text-[10px] text-white">
          {statusLabels[post.status]}
        </span>
      </div>

      <div className="p-3">
        <p className="text-xs text-muted">{date}</p>
        <p className="mt-1 line-clamp-2 text-sm font-semibold text-neutral">
          {post.topic || post.originalText.slice(0, 40)}
        </p>
        <p className="mt-1 line-clamp-2 text-xs text-muted">
          {post.originalText}
        </p>

        <div className="mt-3 flex items-center justify-between">
          <div className="flex gap-2">
            {post.status === "DRAFT" && (
              <button
                onClick={onDelete}
                disabled={deleting}
                title={t("posts.delete")}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-100 disabled:opacity-50"
              >
                🗑
              </button>
            )}
            <Link
              href={`/posts/${post.id}`}
              title={t("posts.edit")}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-bg-soft text-muted hover:bg-surface-line"
            >
              ✎
            </Link>
          </div>
          <div className="flex -space-x-1 rtl:space-x-reverse">
            {post.variants.map((v) => (
              <span
                key={v.id}
                title={v.platform}
                className={`h-5 w-5 rounded-full border-2 border-white ${platformDot[v.platform]}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
