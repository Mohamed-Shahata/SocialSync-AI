import Reveal from "./Reveal";

const steps = [
  {
    title: "انطلق وانشر",
    desc: "راجع المسودات المقترحة عدليًا، بلمسة، ثم جدولها للنشر في الوقت المثالي.",
    tag: "جدولة ذكية",
    highlighted: false,
  },
  {
    title: "حدد هدفك",
    desc: "أخبر الذكاء الاصطناعي بنوع المحتوى أو الفكرة التي تدور في ذهنك باللغة العربية.",
    tag: "معالجة فورية",
    highlighted: true,
  },
  {
    title: "اربط حساباتك",
    desc: "قم بتوصيل حسابات التواصل الاجتماعي الخاصة بك في ثوان معدودة.",
    tag: "جاهز في 2 دقيقة",
    highlighted: false,
  },
];

export default function HowItWorks() {
  return (
    <section id="how" className="relative py-24">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal>
          <div className="text-center">
            <h2 className="font-headline mt-3 text-3xl font-bold text-neutral sm:text-4xl">
              كيف تعمل PostAI؟
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-muted">
              ثلاث خطوات بسيطة تفصلك عن احتراف النشر الرقمي.
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
