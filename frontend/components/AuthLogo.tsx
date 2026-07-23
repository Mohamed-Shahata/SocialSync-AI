import Link from "next/link";

export default function AuthLogo() {
  return (
    <Link href="/" className="inline-flex items-center gap-2">
      <span className="font-headline text-xl font-bold text-neutral">
        Post<span className="text-primary">AI</span>
      </span>
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-linear-to-br from-primary via-tertiary to-secondary">
        <span className="h-2 w-2 rounded-full bg-white" />
      </span>
    </Link>
  );
}
