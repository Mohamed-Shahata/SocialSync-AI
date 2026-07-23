"use client";

import Link from "next/link";
import { useLanguage } from "../lib/i18n/language-context";

export default function Footer() {
  const { t } = useLanguage();

  const columns = [
    {
      title: t("footer.product"),
      links: [
        { label: t("nav.features"), href: "#features" },
        { label: t("nav.how"), href: "#how" },
        { label: t("nav.pricing"), href: "#pricing" },
      ],
    },
    {
      title: t("footer.company"),
      links: [
        { label: t("footer.contact"), href: "#" },
        { label: t("footer.careers"), href: "#" },
        { label: t("footer.blog"), href: "#" },
      ],
    },
    {
      title: t("footer.legal"),
      links: [
        { label: t("footer.privacy"), href: "#" },
        { label: t("footer.terms"), href: "#" },
      ],
    },
  ];

  return (
    <footer className="relative border-t border-surface-line py-14">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
          <div>
            <Link href="#" className="flex items-center gap-2">
              <span className="font-headline text-lg font-bold text-neutral">
                Omni<span className="text-secondary">Post</span>
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-7 text-muted">
              {t("footer.desc")}
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold text-neutral">
                {col.title}
              </h4>
              <ul className="mt-4 flex flex-col gap-3">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      className="text-sm text-muted transition-colors hover:text-neutral"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-surface-line pt-6 sm:flex-row">
          <p className="text-xs text-muted">
            © {new Date().getFullYear()} OmniPost. {t("footer.rights")}
          </p>
          <div className="flex items-center gap-4">
            {[
              t("footer.facebook"),
              t("footer.instagram"),
              t("footer.tiktok"),
            ].map((s) => (
              <a
                key={s}
                href="#"
                className="text-xs text-muted transition-colors hover:text-neutral"
              >
                {s}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
