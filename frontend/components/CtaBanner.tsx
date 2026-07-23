import Link from "next/link";
import Reveal from "./Reveal";

export default function CtaBanner() {
  return (
    <section className="relative py-8">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-surface-line bg-linear-to-l from-primary/25 via-tertiary/20 to-secondary/15 px-8 py-16 text-center">
            <div
              className="animate-float-a pointer-events-none absolute -top-20 right-10 h-64 w-64 rounded-full opacity-[0.16] blur-[90px]"
              style={{ background: "var(--secondary)" }}
            />
            <h2 className="font-headline relative text-3xl font-bold text-neutral sm:text-4xl">
              جاهز تسيب فكرتك تتحول لبوست؟
            </h2>
            <p className="relative mx-auto mt-4 max-w-md text-sm leading-7 text-muted">
              ابدأ دلوقتي مجانًا، من غير كارت ائتمان، وشوف أول بوست ليك خلال
              دقيقة.
            </p>
            <Link
              href="/register"
              className="relative mt-8 inline-block rounded-full bg-primary hover:bg-primary-light px-8 py-3.5 text-sm font-semibold text-white transition-transform hover:scale-[1.03] active:scale-[0.98]"
            >
              جرّب PostAI مجانًا
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
