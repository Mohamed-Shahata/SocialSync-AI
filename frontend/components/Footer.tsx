import Link from "next/link";

const columns = [
  {
    title: "المنتج",
    links: [
      { label: "المميزات", href: "#features" },
      { label: "طريقة العمل", href: "#how" },
      { label: "الأسعار", href: "#pricing" },
    ],
  },
  {
    title: "الشركة",
    links: [
      { label: "تواصل معنا", href: "#" },
      { label: "الوظائف", href: "#" },
      { label: "المدونة", href: "#" },
    ],
  },
  {
    title: "قانوني",
    links: [
      { label: "سياسة الخصوصية", href: "#" },
      { label: "الشروط والأحكام", href: "#" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="relative border-t border-surface-line py-14">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
          <div>
            <Link href="#" className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary via-tertiary to-secondary text-sm font-bold text-white font-headline">
                P
              </span>
              <span className="font-headline text-lg font-bold text-neutral">
                Post<span className="text-secondary">AI</span>
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-7 text-muted">
              أداة عربية بتحول أفكارك لبوستات جاهزة للنشر على السوشيال ميديا، في ثواني.
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold text-neutral">{col.title}</h4>
              <ul className="mt-4 flex flex-col gap-3">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      className="text-sm text-muted transition-colors hover:text-neutral"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-surface-line pt-6 sm:flex-row">
          <p className="text-xs text-muted">
            © {new Date().getFullYear()} PostAI. كل الحقوق محفوظة.
          </p>
          <div className="flex items-center gap-4">
            {["فيسبوك", "إنستجرام", "تيك توك"].map((s) => (
              <a
                key={s}
                href="#"
                className="text-xs text-muted transition-colors hover:text-neutral"
              >
                {s}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
