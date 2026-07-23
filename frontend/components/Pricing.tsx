"use client";

import Link from "next/link";
import Reveal from "./Reveal";
import { useLanguage } from "../lib/i18n/language-context";

export default function Pricing() {
  const { t } = useLanguage();

  const plans = [
    {
      name: t("pricing.pro"),
      price: "29",
      features: [
        t("pricing.proF1"),
        t("pricing.proF2"),
        t("pricing.proF3"),
        t("pricing.proF4"),
      ],
      cta: t("pricing.proCta"),
      highlighted: true,
    },
    {
      name: t("pricing.free"),
      price: "0",
      features: [t("pricing.freeF1"), t("pricing.freeF2"), t("pricing.freeF3")],
      cta: t("pricing.freeCta"),
      highlighted: false,
    },
  ];

  return (
    <section id="pricing" className="relative py-24">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal>
          <div className="text-center">
            <span className="text-xs font-semibold uppercase tracking-widest text-secondary">
              {t("pricing.label")}
            </span>
            <h2 className="font-headline mt-3 text-3xl font-bold text-neutral sm:text-4xl">
              {t("pricing.title")}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-muted">
              {t("pricing.desc")}
            </p>
          </div>
        </Reveal>

        <div className="mt-16 grid max-w-2xl gap-6 sm:mx-auto sm:grid-cols-2">
          {plans.map((plan, i) => (
            <Reveal key={plan.name} delay={i * 120}>
              <div
                className={`relative flex h-full flex-col rounded-2xl border p-7 ${
                  plan.highlighted
                    ? "border-primary-light bg-linear-to-b from-primary/15 to-surface"
                    : "border-surface-line bg-surface"
                }`}
              >
                {plan.highlighted && (
                  <span className="absolute -top-3 end-7 rounded-full bg-secondary px-3 py-1 text-[11px] font-bold text-white">
                    {t("pricing.popular")}
                  </span>
                )}
                <h3 className="font-headline text-lg font-bold text-neutral">
                  {plan.name}
                </h3>
                <div className="mt-5 flex items-baseline gap-1">
                  <span className="font-headline text-3xl font-extrabold text-neutral">
                    $ {plan.price}
                  </span>
                  <span className="text-sm text-muted">
                    {t("pricing.perMonth")}
                  </span>
                </div>

                <ul className="mt-6 flex flex-1 flex-col gap-3">
                  {plan.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-center gap-2 text-sm text-neutral/90"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                      >
                        <path
                          d="M3 8.5L6 11.5L13 4.5"
                          stroke="var(--secondary)"
                          strokeWidth="1.7"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/register"
                  className={`mt-7 rounded-full px-5 py-3 text-center text-sm font-semibold transition-transform hover:scale-[1.02] ${
                    plan.highlighted
                      ? "bg-primary hover:bg-primary-light text-white"
                      : "border border-surface-line text-neutral"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
