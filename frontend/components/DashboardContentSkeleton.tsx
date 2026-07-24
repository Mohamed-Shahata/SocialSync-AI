export default function DashboardContentSkeleton({
  withHeader = true,
}: {
  withHeader?: boolean;
}) {
  return (
    <div>
      {withHeader && (
        <div className="mb-8 flex items-center justify-between">
          <div className="h-7 w-48 animate-pulse rounded bg-surface-line" />
          <div className="h-10 w-28 animate-pulse rounded-full bg-surface-line" />
        </div>
      )}

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-xl border border-surface-line bg-surface"
            style={{ animationDelay: `${i * 0.08}s` }}
          />
        ))}
      </div>

      <div className="rounded-xl border border-surface-line bg-surface p-5">
        <div className="mb-5 h-5 w-32 animate-pulse rounded bg-surface-line" />
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-14 animate-pulse rounded-lg bg-bg-soft"
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
