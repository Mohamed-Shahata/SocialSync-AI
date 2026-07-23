import Link from "next/link";
import Reveal from "./Reveal";

const plans = [
  {
    name: "خطة المحترفين",
    price: "29",
    features: [
      "منشورات غير محدودة",
      "ربط جميع المنصات",
      "ذكاء اصطناعي متطور جداً",
      "تحليلات متقدمة ودقيقة",
    ],
    cta: "اشترك الآن",
    highlighted: true,
  },
  {
    name: "التجربة المجانية",
    price: "0",
    features: ["5 منشورات شهرياً", "منصة واحدة فقط", "ذكاء اصطناعي أساسي"],
    cta: "ابدأ الآن",
    highlighted: false,
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="relative py-24">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal>
          <div className="text-center">
            <span className="text-xs font-semibold uppercase tracking-widest text-secondary">
              الأسعار
            </span>
            <h2 className="font-headline mt-3 text-3xl font-bold text-neutral sm:text-4xl">
              خطط تناسب طموحك
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-muted">
              اختر الخطة المناسبة وابدأ في تحويل تواجدك الرقمي اليوم.
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
                  <span className="absolute -top-3 right-7 rounded-full bg-secondary px-3 py-1 text-[11px] font-bold text-white">
                    الأكثر طلبًا
                  </span>
                )}
                <h3 className="font-headline text-lg font-bold text-neutral">
                  {plan.name}
                </h3>
                <div className="mt-5 flex items-baseline gap-1">
                  <span className="font-headline text-3xl font-extrabold text-neutral">
                    $ {plan.price}
                  </span>
                  <span className="text-sm text-muted">/ شهر</span>
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
