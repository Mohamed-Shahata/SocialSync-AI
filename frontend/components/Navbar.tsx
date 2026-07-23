"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "../lib/auth-context";

const links = [
  { href: "#how", label: "طريقة العمل" },
  { href: "#features", label: "المميزات" },
  { href: "#showcase", label: "شكل النتيجة" },
  { href: "#pricing", label: "الأسعار" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { token, isLoading } = useAuth();
  const isAuthed = !isLoading && !!token;

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
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-primary via-tertiary to-secondary text-sm font-bold text-white font-headline">
            P
          </span>
          <span className="font-headline text-lg font-bold text-neutral">
            Post<span className="text-secondary">AI</span>
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
          {isAuthed ? (
            <Link
              href="/dashboard"
              className="rounded-full bg-primary hover:bg-primary-light px-5 py-2 text-sm font-semibold text-white transition-transform hover:scale-[1.03] active:scale-[0.98]"
            >
              لوحة التحكم
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm text-muted transition-colors hover:text-neutral"
              >
                تسجيل الدخول
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-primary hover:bg-primary-light px-5 py-2 text-sm font-semibold text-white transition-transform hover:scale-[1.03] active:scale-[0.98]"
              >
                جرّب مجانًا
              </Link>
            </>
          )}
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-surface-line text-neutral md:hidden"
          aria-label="فتح القائمة"
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
                  لوحة التحكم
                </Link>
              ) : (
                <>
                  <Link href="/login" className="text-sm text-muted">
                    تسجيل الدخول
                  </Link>
                  <Link
                    href="/register"
                    className="rounded-full bg-primary hover:bg-primary-light px-5 py-2 text-center text-sm font-semibold text-white"
                  >
                    جرّب مجانًا
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
