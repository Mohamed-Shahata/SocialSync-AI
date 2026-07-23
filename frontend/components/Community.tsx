"use client";

import Image from "next/image";
import Link from "next/link";
import Reveal from "./Reveal";
import { useLanguage } from "../lib/i18n/language-context";

export default function Community() {
  const { t } = useLanguage();
  const points = [t("community.p1"), t("community.p2"), t("community.p3")];

  return (
    <section id="showcase" className="relative py-24">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal>
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <h2 className="font-headline text-3xl font-bold text-neutral sm:text-4xl">
                {t("community.title")}
              </h2>
              <p className="mt-4 text-sm leading-7 text-muted">
                {t("community.desc")}
              </p>

              <ul className="mt-6 flex flex-col gap-3">
                {points.map((p) => (
                  <li
                    key={p}
                    className="flex items-center gap-2 text-sm text-neutral/90"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M3 8.5L6 11.5L13 4.5"
                        stroke="var(--primary)"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    {p}
                  </li>
                ))}
              </ul>

              <Link
                href="/register"
                className="mt-8 inline-block rounded-full bg-primary hover:bg-primary-light px-7 py-3.5 text-sm font-semibold text-white transition-transform hover:scale-[1.03] active:scale-[0.98]"
              >
                {t("community.cta")}
              </Link>
            </div>

            <div className="overflow-hidden rounded-2xl border border-surface-line">
              <Image
                src="/design/team-photo.png"
                alt={t("community.imgAlt")}
                width={700}
                height={500}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
