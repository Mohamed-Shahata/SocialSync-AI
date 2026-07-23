import Link from "next/link";
import Image from "next/image";

export default function AuthLogo() {
  return (
    <Link href="/" className="inline-flex items-center gap-2">
      <Image
        src="/design/omnipost-logo.png"
        alt="OmniPost"
        width={28}
        height={28}
        className="h-7 w-7 object-contain"
      />
      <span className="font-headline text-xl font-bold text-neutral">
        Omni<span className="text-primary">Post</span>
      </span>
    </Link>
  );
}
