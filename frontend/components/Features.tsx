import Reveal from "./Reveal";

const features = [
  {
    title: "بأسلوبك انت",
    desc: "PostAI بيتعلم طريقة كتابتك مع الوقت، فالبوستات بتحس إنها منك مش من روبوت.",
    color: "var(--primary)",
    icon: (
      <path
        d="M4 17.5V5.5C4 4.7 4.7 4 5.5 4H16L20 8V17.5C20 18.3 19.3 19 18.5 19H5.5C4.7 19 4 18.3 4 17.5Z"
        stroke="white"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    ),
  },
  {
    title: "صياغات متعددة",
    desc: "مش بوست واحد وخلاص، بتاخد كذا اختيار مختلف في الفكرة والطول وتختار الأنسب.",
    color: "var(--secondary)",
    icon: (
      <path
        d="M5 8H19M5 12H14M5 16H10"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    ),
  },
  {
    title: "مناسب لكل منصة",
    desc: "طول ونبرة الكلام بيتغيروا تلقائيًا حسب المنصة، بوست تيك توك مش زي بوست لينكدإن.",
    color: "var(--tertiary)",
    icon: (
      <path
        d="M12 3V21M3 12H21"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    ),
  },
  {
    title: "جدولة ونشر",
    desc: "بعد ما تختار البوست، تقدر تجدوله ينشر في أنسب وقت من غير ما تفتح التطبيق تاني.",
    color: "var(--primary)",
    icon: (
      <path
        d="M4 9H20M7 4V6M17 4V6M6 20H18C19.1 20 20 19.1 20 18V8C20 6.9 19.1 6 18 6H6C4.9 6 4 6.9 4 8V18C4 19.1 4.9 20 6 20Z"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    ),
  },
  {
    title: "أفكار مفيش عندها نهاية",
    desc: "لما الأفكار تنشف، PostAI بيقترحلك مواضيع جديدة مبنية على مجالك واهتمام جمهورك.",
    color: "var(--secondary)",
    icon: (
      <path
        d="M12 3C8 3 6 6 6 9C6 11 7 12.5 8 13.5V16H16V13.5C17 12.5 18 11 18 9C18 6 16 3 12 3Z"
        stroke="white"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    ),
  },
  {
    title: "خصوصية كاملة",
    desc: "أفكارك ومسودّاتك ليك انت بس، مبتتخزنش ولا بتتستخدم لتدريب نماذج تانية.",
    color: "var(--tertiary)",
    icon: (
      <path
        d="M12 3L19 6V11C19 15.5 16 18.5 12 20C8 18.5 5 15.5 5 11V6L12 3Z"
        stroke="white"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    ),
  },
];

export default function Features() {
  return (
    <section id="features" className="relative py-24">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal>
          <div className="text-center">
            <span className="text-xs font-semibold uppercase tracking-widest text-secondary">
              المميزات
            </span>
            <h2 className="font-headline mt-3 text-3xl font-bold text-neutral sm:text-4xl">
              كل اللي محتاجه عشان تنشر بثبات
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-muted">
              مش بس توليد نصوص، PostAI مبني عشان يفضل معاك في روتين النشر اليومي.
            </p>
          </div>
        </Reveal>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={(i % 3) * 100}>
              <div className="group h-full rounded-2xl border border-surface-line bg-surface p-6 transition-colors hover:border-primary-light/40">
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-xl transition-transform duration-300 group-hover:-translate-y-1"
                  style={{ background: f.color }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    {f.icon}
                  </svg>
                </div>
                <h3 className="font-headline mt-5 text-base font-bold text-neutral">
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
