"use client";

import Reveal from "./Reveal";
import { useLanguage } from "../lib/i18n/language-context";

export default function HowItWorks() {
  const { t } = useLanguage();

  const steps = [
    {
      title: t("how.s3t"),
      desc: t("how.s3d"),
      tag: t("how.s3tag"),
      highlighted: false,
    },
    {
      title: t("how.s1t"),
      desc: t("how.s1d"),
      tag: t("how.s1tag"),
      highlighted: true,
    },
    {
      title: t("how.s2t"),
      desc: t("how.s2d"),
      tag: t("how.s2tag"),
      highlighted: false,
    },
  ];

  return (
    <section id="how" className="relative py-24">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal>
          <div className="text-center">
            <h2 className="font-headline mt-3 text-3xl font-bold text-neutral sm:text-4xl">
              {t("how.title")}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-muted">
              {t("how.desc")}
            </p>
          </div>
        </Reveal>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {steps.map((step, i) => (
            <Reveal key={step.title} delay={i * 120}>
              <div
                className={`flex h-full flex-col justify-between rounded-2xl p-7 ${
                  step.highlighted
                    ? "bg-primary text-white"
                    : "border border-surface-line bg-surface text-neutral"
                }`}
              >
                <div>
                  <h3 className="font-headline text-lg font-bold">
                    {step.title}
                  </h3>
                  <p
                    className={`mt-2 text-sm leading-7 ${
                      step.highlighted ? "text-white/80" : "text-muted"
                    }`}
                  >
                    {step.desc}
                  </p>
                </div>
                <span
                  className={`mt-6 text-xs font-semibold ${
                    step.highlighted ? "text-white/70" : "text-muted"
                  }`}
                >
                  {step.tag}
                </span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
