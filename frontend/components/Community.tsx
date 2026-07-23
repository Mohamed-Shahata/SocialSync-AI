import Image from "next/image";
import Link from "next/link";
import Reveal from "./Reveal";

const points = [
  "تحليل أداء المحتوى بلحظة",
  "دعم في مخصص باللغة العربية",
  "تحديثات أسبوعية لأحدث ترندات السوشيال ميديا",
];

export default function Community() {
  return (
    <section id="showcase" className="relative py-24">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal>
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <h2 className="font-headline text-3xl font-bold text-neutral sm:text-4xl">
                مجتمع المبدعين ينتظرك
              </h2>
              <p className="mt-4 text-sm leading-7 text-muted">
                انضم إلى أكثر من 5,000 صانع محتوى وشركة يستخدمون PostAI يوميًا
                لتوسيع نطاق تأثيرهم الرقمي دون عناء.
              </p>

              <ul className="mt-6 flex flex-col gap-3">
                {points.map((p) => (
                  <li
                    key={p}
                    className="flex items-center gap-2 text-sm text-neutral/90"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M3 8.5L6 11.5L13 4.5"
                        stroke="var(--primary)"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    {p}
                  </li>
                ))}
              </ul>

              <Link
                href="/register"
                className="mt-8 inline-block rounded-full bg-primary hover:bg-primary-light px-7 py-3.5 text-sm font-semibold text-white transition-transform hover:scale-[1.03] active:scale-[0.98]"
              >
                اقرأ قصص النجاح
              </Link>
            </div>

            <div className="overflow-hidden rounded-2xl border border-surface-line">
              <Image
                src="/design/team-photo.png"
                alt="فريق من صناع المحتوى يعملون معًا"
                width={700}
                height={500}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
