"use client";

import Image from "next/image";
import Reveal from "./Reveal";
import { useLanguage } from "../lib/i18n/language-context";

export default function Features() {
  const { t } = useLanguage();

  const features = [
    {
      title: t("features.t1"),
      desc: t("features.d1"),
      img: "/design/lock-icon.png",
    },
    {
      title: t("features.t2"),
      desc: t("features.d2"),
      img: "/design/wand-icon.png",
    },
  ];

  return (
    <section id="features" className="relative py-24">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal>
          <div className="text-center">
            <h2 className="font-headline text-3xl font-bold text-neutral sm:text-4xl">
              {t("features.title")}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-muted">
              {t("features.desc")}
            </p>
          </div>
        </Reveal>

        <div className="mt-16 grid gap-6 sm:grid-cols-2">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={i * 120}>
              <div className="flex h-full flex-col items-center rounded-2xl border border-surface-line bg-surface p-10 text-center transition-colors hover:border-primary-light/40">
                <Image src={f.img} alt={f.title} width={120} height={120} />
                <h3 className="font-headline mt-6 text-base font-bold text-neutral">
                  {f.title}
                </h3>
                <p className="mt-2 text-sm leading-7 text-muted">{f.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
