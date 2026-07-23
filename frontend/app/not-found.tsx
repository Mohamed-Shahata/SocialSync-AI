import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-bg px-6 text-center">
      <Image
        src="/design/omnipost-logo.png"
        alt="OmniPost"
        width={56}
        height={56}
        className="h-14 w-14 object-contain opacity-80"
      />
      <p className="font-headline text-6xl font-extrabold text-primary">404</p>
      <h1 className="font-headline text-2xl font-bold text-neutral">
        الصفحة مش موجودة / Page not found
      </h1>
      <p className="max-w-md text-sm text-muted">
        الرابط ده مش موجود أو اتشال. / This link doesn&apos;t exist or was
        removed.
      </p>
      <Link
        href="/"
        className="mt-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-light"
      >
        الرجوع للرئيسية / Back home
      </Link>
    </div>
  );
}
