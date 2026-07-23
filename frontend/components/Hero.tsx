import Link from "next/link";
import GeneratorCard from "./GeneratorCard";

export default function Hero() {
  return (
    <section className="relative overflow-hidden pt-40 pb-24">
      <div
        className="animate-float-a pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full opacity-[0.16] blur-[110px]"
        style={{ background: "var(--primary)" }}
      />
      <div
        className="animate-float-b pointer-events-none absolute top-40 -left-24 h-80 w-80 rounded-full opacity-[0.14] blur-[100px]"
        style={{ background: "var(--tertiary)" }}
      />

      <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-16 px-6 lg:flex-row lg:items-center lg:gap-8">
        <div className="flex-1 text-center lg:text-right">
          <span className="inline-flex items-center gap-2 rounded-full border border-surface-line bg-surface px-4 py-1.5 text-xs text-muted">
            مبني لصنّاع المحتوى العربي
          </span>

          <h1 className="font-headline mt-6 text-4xl font-extrabold leading-[1.15] text-neutral sm:text-5xl lg:text-6xl">
            فكرتك بتتحول لبوست
            <br />
            <span className="bg-linear-to-l from-secondary via-primary-light to-tertiary bg-clip-text text-transparent">
              جاهز للنشر
            </span>{" "}
            في ثواني
          </h1>

          <p className="mx-auto mt-6 max-w-lg text-base leading-8 text-muted lg:mx-0">
            PostAI بياخد فكرتك الخام ويطلعلك منشورات احترافية لفيسبوك وإنستجرام
            وتيك توك، بصوتك انت وأسلوبك، من غير ما تقعد قدام صفحة فاضية.
          </p>

          <div className="mt-9 flex flex-col items-center gap-4 sm:flex-row sm:justify-center lg:justify-start">
            <Link
              href="/register"
              className="w-full rounded-full bg-primary hover:bg-primary-light px-7 py-3.5 text-center text-sm font-semibold text-white transition-transform hover:scale-[1.03] active:scale-[0.98] sm:w-auto"
            >
              ابدأ مجانًا الآن
            </Link>
            <a
              href="#showcase"
              className="w-full rounded-full border border-surface-line px-7 py-3.5 text-center text-sm font-semibold text-neutral transition-colors hover:border-primary-light sm:w-auto"
            >
              شوف مثال حي
            </a>
          </div>

          <div className="mt-10 flex items-center justify-center gap-8 text-right lg:justify-start">
            <div>
              <p className="font-headline text-2xl font-bold text-neutral">
                +12K
              </p>
              <p className="text-xs text-muted">بوست اتولد الشهر ده</p>
            </div>
            <div className="h-8 w-px bg-surface-line" />
            <div>
              <p className="font-headline text-2xl font-bold text-neutral">
                4 ثواني
              </p>
              <p className="text-xs text-muted">متوسط وقت التوليد</p>
            </div>
            <div className="h-8 w-px bg-surface-line" />
            <div>
              <p className="font-headline text-2xl font-bold text-neutral">
                3 منصات
              </p>
              <p className="text-xs text-muted">فيسبوك، إنستا، تيك توك</p>
            </div>
          </div>
        </div>

        <div className="flex flex-1 justify-center">
          <GeneratorCard />
        </div>
      </div>
    </section>
  );
}
