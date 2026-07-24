import Image from "next/image";
import DashboardContentSkeleton from "./DashboardContentSkeleton";

export default function DashboardLoading() {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar skeleton */}
      <aside className="fixed inset-y-0 start-0 z-40 hidden w-64 shrink-0 flex-col justify-between border-e border-surface-line bg-white p-5 md:flex">
        <div>
          <div className="mb-8 flex items-center gap-2">
            <Image
              src="/design/omnipost-logo.png"
              alt="OmniPost"
              width={36}
              height={36}
              className="h-9 w-9 animate-pulse object-contain opacity-70"
            />
            <div className="flex flex-col gap-1.5">
              <div className="h-3 w-20 animate-pulse rounded bg-surface-line" />
              <div className="h-2.5 w-14 animate-pulse rounded bg-surface-line" />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-9 animate-pulse rounded-lg bg-bg-soft"
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        </div>
        <div className="h-24 animate-pulse rounded-xl bg-bg-soft" />
      </aside>

      {/* Content skeleton */}
      <div className="flex-1 px-4 py-6 md:ms-64 md:px-8">
        <DashboardContentSkeleton />
      </div>
    </div>
  );
}
