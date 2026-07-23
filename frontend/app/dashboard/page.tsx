"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "../../lib/auth-context";
import { postsApi, UserPost } from "../../lib/api";
import DashboardShell from "../../components/DashboardShell";

const statusLabels: Record<string, string> = {
  DRAFT: "مسودة",
  SCHEDULED: "مجدول",
  PUBLISHED: "منشور",
  FAILED: "فشل",
};

export default function DashboardPage() {
  const { user, token } = useAuth();

  const [posts, setPosts] = useState<UserPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    postsApi
      .list(token)
      .then(setPosts)
      .finally(() => setIsLoading(false));
  }, [token]);

  const stats = useMemo(() => {
    const total = posts.length;
    const published = posts.filter((p) => p.status === "PUBLISHED").length;
    const scheduled = posts.filter((p) => p.status === "SCHEDULED").length;
    const draft = posts.filter((p) => p.status === "DRAFT").length;
    return { total, published, scheduled, draft };
  }, [posts]);

  const recent = posts.slice(0, 5);

  return (
    <DashboardShell>
      <div>
        <div className="flex items-center justify-between">
          <h1 className="font-headline text-2xl font-bold text-neutral">
            أهلاً بيك، {user?.email}
          </h1>
          <Link
            href="/posts/new"
            className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-light"
          >
            + بوست جديد
          </Link>
        </div>

        {isLoading ? (
          <p className="mt-8 text-sm text-muted">...جاري التحميل</p>
        ) : (
          <>
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <StatCard label="إجمالي البوستات" value={stats.total} />
              <StatCard label="منشورة" value={stats.published} />
              <StatCard label="مجدولة" value={stats.scheduled} />
              <StatCard label="مسودات" value={stats.draft} />
            </div>

            <div className="mt-8 rounded-xl border border-surface-line bg-white p-5">
              <div className="flex items-center justify-between">
                <h2 className="font-headline text-lg font-semibold text-neutral">
                  آخر البوستات
                </h2>
                <Link
                  href="/posts"
                  className="text-xs text-primary hover:underline"
                >
                  عرض الكل
                </Link>
              </div>

              {recent.length === 0 && (
                <p className="mt-4 text-sm text-muted">مفيش بوستات لسه.</p>
              )}

              <div className="mt-4 flex flex-col gap-3">
                {recent.map((post) => (
                  <div
                    key={post.id}
                    className="flex items-center justify-between gap-3 rounded-lg bg-bg-soft px-4 py-3"
                  >
                    <p className="line-clamp-1 text-sm text-neutral">
                      {post.originalText}
                    </p>
                    <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-xs font-medium text-muted">
                      {statusLabels[post.status]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardShell>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-surface-line bg-white p-4">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 font-headline text-2xl font-bold text-neutral">
        {value}
      </p>
    </div>
  );
}
