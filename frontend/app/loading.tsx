import Image from "next/image";

export default function Loading() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center gap-6 overflow-hidden bg-bg">
      <div
        className="pointer-events-none absolute -top-24 -start-24 h-72 w-72 rounded-full opacity-[0.16] blur-[100px]"
        style={{ background: "var(--primary)" }}
      />
      <div
        className="pointer-events-none absolute -bottom-24 -end-24 h-72 w-72 rounded-full opacity-[0.14] blur-[100px]"
        style={{ background: "var(--tertiary)" }}
      />

      <div className="relative flex h-20 w-20 items-center justify-center">
        <span className="absolute inset-0 animate-spin rounded-full border-4 border-surface-line border-t-primary border-e-primary-light" />
        <Image
          src="/design/omnipost-logo.png"
          alt="OmniPost"
          width={40}
          height={40}
          className="h-10 w-10 object-contain"
          priority
        />
      </div>

      <div className="flex flex-col items-center gap-1.5">
        <p className="font-headline text-sm font-semibold text-neutral">
          جاري التحميل
        </p>
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]" />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]" />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary" />
        </span>
      </div>
    </div>
  );
}
