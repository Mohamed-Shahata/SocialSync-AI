"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../lib/auth-context";

const navItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "My Posts", href: "/posts" },
  { label: "Create Post", href: "/posts/new" },
  { label: "Settings", href: "#" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <aside className="fixed inset-y-0 right-0 z-40 hidden w-64 shrink-0 flex-col justify-between border-l border-surface-line bg-white p-5 md:flex">
      <div>
        <div className="mb-8 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white">
            ✦
          </div>
          <div>
            <p className="font-headline text-sm font-bold">PostAI</p>
            <p className="text-xs text-muted">Social Media Manager</p>
          </div>
        </div>

        <nav className="flex flex-col gap-1 text-sm">
          {navItems.map((item) => {
            const active =
              item.href !== "#" &&
              (pathname === item.href ||
                (item.href !== "/dashboard" && pathname.startsWith(item.href)));
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`rounded-lg px-3 py-2 ${
                  active
                    ? "bg-primary text-white"
                    : "text-muted hover:bg-bg-soft hover:text-neutral"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex flex-col gap-4">
        <div className="rounded-xl bg-primary p-4 text-white">
          <p className="text-sm font-semibold">Upgrade Pro</p>
          <p className="mt-1 text-xs text-white/80">
            احصل على مزيد من الميزات الذكاء الاصطناعي المتقدمة
          </p>
          <button className="mt-3 w-full rounded-lg bg-white py-1.5 text-xs font-semibold text-primary">
            ترقية الآن
          </button>
        </div>
        <button
          onClick={() => logout()}
          className="text-right text-xs text-muted hover:text-neutral"
        >
          تسجيل الخروج
        </button>
      </div>
    </aside>
  );
}
