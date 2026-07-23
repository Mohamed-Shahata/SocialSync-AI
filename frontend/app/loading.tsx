export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-bg">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-surface-line border-t-primary" />
      <p className="text-sm text-muted">جاري التحميل... / Loading...</p>
    </div>
  );
}
