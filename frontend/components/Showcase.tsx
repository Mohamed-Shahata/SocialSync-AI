"use client";

import Reveal from "./Reveal";
import { useLanguage } from "../lib/i18n/language-context";

export default function Showcase() {
  const { t } = useLanguage();

  const outputs = [
    { platform: "Instagram", color: "var(--tertiary)", text: t("showcase.ig") },
    { platform: "Facebook", color: "var(--primary)", text: t("showcase.fb") },
    { platform: "TikTok", color: "var(--secondary)", text: t("showcase.tt") },
  ];

  return (
    <section id="showcase" className="relative py-24">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal>
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <div className="lg:sticky lg:top-32">
              <span className="text-xs font-semibold uppercase tracking-widest text-secondary">
                {t("showcase.label")}
              </span>
              <h2 className="font-headline mt-3 text-3xl font-bold leading-tight text-neutral sm:text-4xl">
                {t("showcase.title1")}
                <br /> {t("showcase.title2")}
              </h2>
              <p className="mt-4 text-sm leading-7 text-muted">
                {t("showcase.desc")}
              </p>

              <div className="mt-6 rounded-xl border border-surface-line bg-surface p-4">
                <p className="text-xs text-muted">{t("showcase.ideaLabel")}</p>
                <p className="mt-2 text-sm leading-7 text-neutral/90">
                  &ldquo;{t("showcase.idea")}&rdquo;
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-5">
              {outputs.map((o, i) => (
                <Reveal key={o.platform} delay={i * 130}>
                  <div className="rounded-2xl border border-surface-line bg-surface p-6 transition-transform hover:-translate-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ background: o.color }}
                      />
                      <span className="text-xs font-semibold text-muted">
                        {o.platform}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-8 text-neutral/90">
                      {o.text}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
