"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "../lib/auth-context";
import { useLanguage } from "../lib/i18n/language-context";

export default function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const { t } = useLanguage();

  const navItems = [
    { label: t("sidebar.dashboard"), href: "/dashboard" },
    { label: t("sidebar.myPosts"), href: "/posts" },
    { label: t("sidebar.settings"), href: "/settings" },
  ];

  return (
    <aside className="fixed inset-y-0 start-0 z-40 hidden w-64 shrink-0 flex-col justify-between border-e border-surface-line bg-white p-5 md:flex">
      <div>
        <div className="mb-8 flex items-center gap-2">
          <Image
            src="/design/omnipost-logo.png"
            alt="OmniPost"
            width={36}
            height={36}
            className="h-9 w-9 object-contain"
          />
          <div>
            <p className="font-headline text-sm font-bold">OmniPost</p>
            <p className="text-xs text-muted">{t("sidebar.tagline")}</p>
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
                key={item.href}
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
          <p className="text-sm font-semibold">{t("sidebar.upgrade")}</p>
          <p className="mt-1 text-xs text-white/80">
            {t("sidebar.upgradeDesc")}
          </p>
          <button className="mt-3 w-full rounded-lg bg-white py-1.5 text-xs font-semibold text-primary">
            {t("sidebar.upgradeCta")}
          </button>
        </div>
        <button
          onClick={() => logout()}
          className="text-start text-xs text-muted hover:text-neutral"
        >
          {t("sidebar.logout")}
        </button>
      </div>
    </aside>
  );
}
