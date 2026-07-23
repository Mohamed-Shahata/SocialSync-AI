"use client";

import { useLanguage } from "../lib/i18n/language-context";

export default function LanguageToggle({
  className = "",
}: {
  className?: string;
}) {
  const { language, toggleLanguage } = useLanguage();

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      aria-label="Toggle language / تغيير اللغة"
      className={`flex items-center gap-1.5 rounded-full border border-surface-line px-3 py-1.5 text-xs font-semibold text-neutral transition-colors hover:bg-bg-soft ${className}`}
    >
      <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.3" />
        <path
          d="M2.5 10h15M10 2.5c2 2.2 3 5 3 7.5s-1 5.3-3 7.5c-2-2.2-3-5-3-7.5s1-5.3 3-7.5Z"
          stroke="currentColor"
          strokeWidth="1.3"
        />
      </svg>
      <span>{language === "ar" ? "EN" : "AR"}</span>
    </button>
  );
}
