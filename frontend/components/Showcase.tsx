import Reveal from "./Reveal";

const outputs = [
  {
    platform: "Instagram",
    color: "var(--tertiary)",
    text: "معظم اللي بيبدأوا مشروعهم مش عندهم كل الإجابات… وده طبيعي. المهم إنك تبدأ بأول خطوة صح، والباقي بيتوضح وانت ماشي. 🚀",
  },
  {
    platform: "Facebook",
    color: "var(--primary)",
    text: "سؤال بسيط: إيه اللي بيوقفك عن بداية مشروعك؟ اكتبلي في الكومنتات، وأنا هرد على كل واحد بنصيحة عملية.",
  },
  {
    platform: "TikTok",
    color: "var(--secondary)",
    text: "3 حاجات محدش بيقولهملك قبل ما تبدأ مشروعك ⬇️ (الفيديو ده هيوفرلك شهور من التجربة والخطأ)",
  },
];

export default function Showcase() {
  return (
    <section id="showcase" className="relative py-24">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal>
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <div className="lg:sticky lg:top-32">
              <span className="text-xs font-semibold uppercase tracking-widest text-secondary">
                شكل النتيجة
              </span>
              <h2 className="font-headline mt-3 text-3xl font-bold leading-tight text-neutral sm:text-4xl">
                فكرة واحدة… ثلاث
                <br /> صياغات مختلفة
              </h2>
              <p className="mt-4 text-sm leading-7 text-muted">
                اكتب فكرتك مرة واحدة، وPostAI بيحولها لصياغة مناسبة لكل منصة،
                بنفس المعنى وأسلوب مختلف يناسب جمهور كل مكان.
              </p>

              <div className="mt-6 rounded-xl border border-surface-line bg-surface p-4">
                <p className="text-xs text-muted">الفكرة اللي اتكتبت</p>
                <p className="mt-2 text-sm leading-7 text-neutral/90">
                  &ldquo;خايف تبدأ مشروعك؟ كلام عن أهمية اول خطوة&rdquo;
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
