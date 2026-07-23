import Reveal from "./Reveal";

const steps = [
  {
    n: "01",
    title: "اختار المنصة والنبرة",
    desc: "حدد فيسبوك ولا إنستجرام ولا تيك توك، واختار نبرة الكلام: رسمية، ودّية، ولا فيها شوية كوميدي.",
  },
  {
    n: "02",
    title: "اكتب فكرتك زي ما هي",
    desc: "مش محتاج صياغة ولا تنسيق، اكتب الفكرة بكلمتين أو تلاتة زي ما بتقولها لصاحبك.",
  },
  {
    n: "03",
    title: "استلم بوستات جاهزة",
    desc: "PostAI بيطلعلك أكتر من صياغة، تختار اللي عاجبك، تعدّل لو حابب، وتنشر على طول.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how" className="relative py-24">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal>
          <div className="text-center">
            <span className="text-xs font-semibold uppercase tracking-widest text-secondary">
              طريقة العمل
            </span>
            <h2 className="font-headline mt-3 text-3xl font-bold text-neutral sm:text-4xl">
              ثلاث خطوات، مش أكتر
            </h2>
          </div>
        </Reveal>

        <div className="relative mt-16 grid gap-8 md:grid-cols-3">
          <div className="pointer-events-none absolute top-10 hidden h-px w-full bg-gradient-to-l from-transparent via-surface-line to-transparent md:block" />
          {steps.map((step, i) => (
            <Reveal key={step.n} delay={i * 120}>
              <div className="relative rounded-2xl border border-surface-line bg-surface p-7">
                <span className="font-headline block text-4xl font-extrabold text-transparent [-webkit-text-stroke:1.5px_var(--surface-line)]">
                  {step.n}
                </span>
                <h3 className="font-headline mt-4 text-lg font-bold text-neutral">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-7 text-muted">{step.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
