"use client";

import { useEffect, useState } from "react";

const FULL_TEXT =
  "لو بتفكر تبدأ مشروعك الخاص وخايف تاخد الخطوة… الخوف ده طبيعي، بس اللي مش طبيعي إنك تسيبه يوقفك. ابدأ صغير، اتعلم من كل خطوة، وكمّل. 🚀";

const platforms = [
  { name: "Facebook", color: "#3F51B5" },
  { name: "Instagram", color: "#7C4DFF" },
  { name: "TikTok", color: "#00D2FF" },
];

export default function GeneratorCard() {
  const [displayed, setDisplayed] = useState("");
  const [phase, setPhase] = useState<"typing" | "pause" | "erasing">("typing");
  const [activePlatform, setActivePlatform] = useState(0);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    if (phase === "typing") {
      if (displayed.length < FULL_TEXT.length) {
        timeout = setTimeout(
          () => setDisplayed(FULL_TEXT.slice(0, displayed.length + 1)),
          28,
        );
      } else {
        timeout = setTimeout(() => setPhase("pause"), 1800);
      }
    } else if (phase === "pause") {
      timeout = setTimeout(() => setPhase("erasing"), 300);
    } else if (phase === "erasing") {
      if (displayed.length > 0) {
        timeout = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 10);
      } else {
        timeout = setTimeout(() => {
          setActivePlatform((p) => (p + 1) % platforms.length);
          setPhase("typing");
        }, 400);
      }
    }

    return () => clearTimeout(timeout);
  }, [displayed, phase]);

  return (
    <div className="gradient-border w-full max-w-md rounded-3xl bg-surface p-[1.5px] shadow-xl shadow-primary/10">
      <div className="rounded-[22px] bg-surface p-5">
        <div className="flex items-center justify-between border-b border-surface-line pb-4">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
          </div>
          <span className="text-xs text-muted">مولّد المنشورات</span>
        </div>

        <div className="mt-4 flex gap-2">
          {platforms.map((p, i) => (
            <span
              key={p.name}
              className="rounded-full px-3 py-1 text-[11px] font-medium transition-all duration-500"
              style={{
                background: i === activePlatform ? p.color : "transparent",
                color: i === activePlatform ? "white" : "var(--muted)",
                border: `1px solid ${i === activePlatform ? p.color : "var(--surface-line)"}`,
              }}
            >
              {p.name}
            </span>
          ))}
        </div>

        <div className="mt-4 min-h-35 rounded-xl bg-bg-soft p-4">
          <p className="text-xs leading-loose text-neutral" dir="rtl">
            {displayed}
            <span className="caret" />
          </p>
        </div>

        <div className="mt-4 flex items-center justify-between text-[11px] text-muted">
          <span>بيتولد بأسلوبك انت مش بأسلوب عام</span>
          <span className="flex items-center gap-1 text-secondary">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-secondary" />
            جاهز خلال 4 ثواني
          </span>
        </div>
      </div>
    </div>
  );
}
