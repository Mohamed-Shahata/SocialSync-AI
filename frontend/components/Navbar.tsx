"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "../lib/auth-context";
import { useLanguage } from "../lib/i18n/language-context";
import LanguageToggle from "./LanguageToggle";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { token, isLoading } = useAuth();
  const { t } = useLanguage();
  const isAuthed = !isLoading && !!token;

  const links = [
    { href: "#how", label: t("nav.how") },
    { href: "#features", label: t("nav.features") },
    { href: "#showcase", label: t("nav.showcase") },
    { href: "#pricing", label: t("nav.pricing") },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-bg/80 backdrop-blur-md border-b border-surface-line"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="#" className="flex items-center gap-2">
          <Image
            src="/design/omnipost-logo.png"
            alt="OmniPost"
            width={32}
            height={32}
            className="h-8 w-8 object-contain"
          />
          <span className="font-headline text-lg font-bold text-neutral">
            Omni<span className="text-secondary">Post</span>
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-muted transition-colors hover:text-neutral"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <LanguageToggle />
          {isAuthed ? (
            <Link
              href="/dashboard"
              className="rounded-full bg-primary hover:bg-primary-light px-5 py-2 text-sm font-semibold text-white transition-transform hover:scale-[1.03] active:scale-[0.98]"
            >
              {t("nav.dashboard")}
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm text-muted transition-colors hover:text-neutral"
              >
                {t("nav.login")}
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-primary hover:bg-primary-light px-5 py-2 text-sm font-semibold text-white transition-transform hover:scale-[1.03] active:scale-[0.98]"
              >
                {t("nav.register")}
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <LanguageToggle />
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-surface-line text-neutral"
            aria-label={t("nav.openMenu")}
            aria-expanded={open}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              {open ? (
                <path
                  d="M2 2L16 16M16 2L2 16"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              ) : (
                <path
                  d="M1 4H17M1 9H17M1 14H17"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {open && (
        <div className="border-t border-surface-line bg-bg px-6 py-4 md:hidden">
          <div className="flex flex-col gap-4">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-sm text-muted hover:text-neutral"
              >
                {link.label}
              </a>
            ))}
            <div className="mt-2 flex flex-col gap-3 border-t border-surface-line pt-4">
              {isAuthed ? (
                <Link
                  href="/dashboard"
                  className="rounded-full bg-primary hover:bg-primary-light px-5 py-2 text-center text-sm font-semibold text-white"
                >
                  {t("nav.dashboard")}
                </Link>
              ) : (
                <>
                  <Link href="/login" className="text-sm text-muted">
                    {t("nav.login")}
                  </Link>
                  <Link
                    href="/register"
                    className="rounded-full bg-primary hover:bg-primary-light px-5 py-2 text-center text-sm font-semibold text-white"
                  >
                    {t("nav.register")}
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
