export default function AiBrainIllustration() {
  return (
    <svg viewBox="0 0 320 320" fill="none" className="h-full w-full">
      <defs>
        <radialGradient id="glow" cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor="#00D2FF" stopOpacity="0.55" />
          <stop offset="55%" stopColor="#7C4DFF" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#3F51B5" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="core" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#00D2FF" />
          <stop offset="100%" stopColor="#7C4DFF" />
        </linearGradient>
        <linearGradient id="ring" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3F51B5" />
          <stop offset="100%" stopColor="#00D2FF" />
        </linearGradient>
      </defs>

      <circle cx="160" cy="150" r="130" fill="url(#glow)" />

      {[0, 45, 90, 135].map((angle) => (
        <line
          key={angle}
          x1="160"
          y1="150"
          x2={160 + 118 * Math.cos((angle * Math.PI) / 180)}
          y2={150 + 118 * Math.sin((angle * Math.PI) / 180)}
          stroke="url(#ring)"
          strokeWidth="1"
          strokeOpacity="0.35"
        />
      ))}

      <circle
        cx="160"
        cy="150"
        r="72"
        stroke="url(#ring)"
        strokeWidth="1.5"
        strokeOpacity="0.5"
        strokeDasharray="4 6"
      />
      <circle
        cx="160"
        cy="150"
        r="95"
        stroke="url(#ring)"
        strokeWidth="1"
        strokeOpacity="0.3"
      />

      <path
        d="M160 92c-30 0-46 20-46 44 0 16 8 26 8 38 0 10 8 16 18 16h40c10 0 18-6 18-16 0-12 8-22 8-38 0-24-16-44-46-44Z"
        fill="url(#core)"
        opacity="0.9"
      />
      <path
        d="M160 92c-30 0-46 20-46 44 0 16 8 26 8 38 0 10 8 16 18 16h40c10 0 18-6 18-16 0-12 8-22 8-38 0-24-16-44-46-44Z"
        stroke="white"
        strokeOpacity="0.5"
        strokeWidth="1"
      />
      <path
        d="M138 108c-8 8-12 18-12 28M182 108c8 8 12 18 12 28M150 100v-14M170 100v-14"
        stroke="white"
        strokeOpacity="0.7"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      {[
        [70, 70],
        [250, 90],
        [60, 220],
        [255, 225],
        [160, 40],
      ].map(([cx, cy], i) => (
        <circle
          key={i}
          cx={cx}
          cy={cy}
          r={i === 4 ? 4 : 3}
          fill={i % 2 === 0 ? "#00D2FF" : "#7C4DFF"}
        />
      ))}
    </svg>
  );
}
