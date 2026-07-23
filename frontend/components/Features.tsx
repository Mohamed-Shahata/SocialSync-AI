import Image from "next/image";
import Reveal from "./Reveal";

const features = [
  {
    title: "حماية وخصوصية مطلقة",
    desc: "بياناتك وهويتك هي أولويتنا القصوى. نستخدم بروتوكولات تشفير عسكرية لضمان أمان حساباتك ومحتواك.",
    img: "/design/lock-icon.png",
  },
  {
    title: "توليد محتوى ذكي",
    desc: "خوارزميات متطورة تحلل التوجهات الحالية وتنشئ منشورات جذابة متوافقة مع هويتك البصرية والصوتية.",
    img: "/design/wand-icon.png",
  },
];

export default function Features() {
  return (
    <section id="features" className="relative py-24">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal>
          <div className="text-center">
            <h2 className="font-headline text-3xl font-bold text-neutral sm:text-4xl">
              مميزات صُممت لنموك
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-muted">
              نحن ندمج أحدث تقنيات الذكاء الاصطناعي مع واجهة مستخدم سلسة لتوفر
              لك تجربة لا مثيل لها.
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
