"use client";

interface LogoProps {
  size?: number;
  variant?: "full" | "icon" | "wordmark";
  colorMode?: "dark" | "light" | "lime";
  className?: string;
}

function SmashArcIcon({
  size = 32,
  stroke,
  fill,
}: {
  size: number;
  stroke: string;
  fill: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="smashGrad" x1="0" y1="100" x2="100" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#c8ff00" />
          <stop offset="50%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#14b8a6" />
        </linearGradient>
      </defs>
      {/* Primary smash arc */}
      <path
        d="M 15 105 Q 25 15, 85 25 Q 105 27, 100 12"
        stroke={stroke === "gradient" ? "url(#smashGrad)" : stroke}
        strokeWidth="6"
        fill="none"
        strokeLinecap="round"
      />
      {/* Echo arc */}
      <path
        d="M 22 102 Q 32 35, 78 42"
        stroke={stroke === "gradient" ? "url(#smashGrad)" : stroke}
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        opacity={0.35}
      />
      {/* Ball */}
      <circle cx="100" cy="12" r="11" fill={fill} />
      {/* Impact ring */}
      <circle cx="100" cy="12" r="16" fill="none" stroke={fill} strokeWidth="1" opacity={0.3} />
    </svg>
  );
}

export function Logo({ size = 32, variant = "full", colorMode = "dark", className = "" }: LogoProps) {
  const colors = {
    dark: { stroke: "gradient", fill: "#c8ff00", text: "#ffffff", arabic: "#c8ff00" },
    light: { stroke: "#111827", fill: "#111827", text: "#111827", arabic: "#111827" },
    lime: { stroke: "#111827", fill: "#111827", text: "#111827", arabic: "#111827" },
  }[colorMode];

  if (variant === "icon") {
    return (
      <span className={`inline-flex items-center ${className}`}>
        <SmashArcIcon size={size} stroke={colors.stroke} fill={colors.fill} />
      </span>
    );
  }

  if (variant === "wordmark") {
    return (
      <span className={`inline-flex items-baseline gap-1.5 ${className}`}>
        <span
          className="font-display font-extrabold tracking-[0.15em] leading-none"
          style={{ color: colors.text, fontSize: size * 0.7 }}
        >
          BADELZ
        </span>
        <span
          className="font-sans font-bold leading-none"
          style={{ color: colors.arabic, fontSize: size * 0.45 }}
        >
          بادلز
        </span>
      </span>
    );
  }

  // Full logo: icon + wordmark
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <SmashArcIcon size={size} stroke={colors.stroke} fill={colors.fill} />
      <span className="flex flex-col leading-none">
        <span
          className="font-display font-extrabold tracking-[0.12em]"
          style={{ color: colors.text, fontSize: size * 0.55 }}
        >
          BADELZ
        </span>
        <span
          className="font-sans font-bold"
          style={{ color: colors.arabic, fontSize: size * 0.32, marginTop: 1 }}
        >
          بادلز
        </span>
      </span>
    </span>
  );
}
