"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-bg px-6 text-center">
      <Image
        src="/design/omnipost-logo.png"
        alt="OmniPost"
        width={56}
        height={56}
        className="h-14 w-14 object-contain opacity-80"
      />
      <h1 className="font-headline text-2xl font-bold text-neutral">
        حصل خطأ غير متوقع / Something went wrong
      </h1>
      <p className="max-w-md text-sm text-muted">
        في مشكلة حصلت أثناء تحميل الصفحة، جرّب تاني. / An error occurred
        while loading this page, please try again.
      </p>
      <div className="mt-2 flex gap-3">
        <button
          onClick={() => reset()}
          className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-light"
        >
          إعادة المحاولة / Retry
        </button>
        <Link
          href="/"
          className="rounded-full border border-surface-line px-6 py-2.5 text-sm font-semibold text-neutral hover:border-primary-light"
        >
          الرئيسية / Home
        </Link>
      </div>
    </div>
  );
}
