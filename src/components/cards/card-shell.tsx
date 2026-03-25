"use client";

import { useRef, useCallback } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";

type Tier = "bronze" | "gold" | "emerald" | "diamond" | "master" | "grandmaster";
type Size = "sm" | "md" | "lg";

interface CardShellProps {
  children: React.ReactNode;
  tier?: Tier;
  accentColor?: string;
  interactive?: boolean;
  size?: Size;
  className?: string;
  onClick?: () => void;
}

/* ─── Tier visual definitions ─── */

const TIER_CARD_CLASSES: Record<Tier, string> = {
  bronze:
    "border-2 border-[#cd7f32] bg-gradient-to-br from-[#1a1a2e] to-[#16213e]",
  gold:
    "border-[3px] border-[#ffd700] bg-gradient-to-br from-[#1a1a2e] to-[#2a2040]",
  emerald:
    "border-[3px] border-[#50c878] bg-gradient-to-br from-[#0a1a15] to-[#0f2b1a]",
  diamond:
    "border-4 border-[#b9f2ff] bg-gradient-to-br from-[#0a0f1a] to-[#0f1b2d]",
  master:
    "border-4 border-[#ff4655] bg-gradient-to-br from-[#1a0a0e] to-[#2a1015]",
  grandmaster:
    "border-[5px] border-transparent bg-gradient-to-br from-[#0a0f1a] to-[#120a20]",
};

const TIER_STYLES: Partial<Record<Tier, React.CSSProperties>> = {
  bronze: {
    boxShadow: "0 0 10px rgba(205,127,50,0.1)",
  },
  gold: {
    boxShadow:
      "0 0 20px rgba(255,215,0,0.2), 0 0 40px rgba(255,215,0,0.08)",
  },
  emerald: {
    boxShadow:
      "0 0 25px rgba(80,200,120,0.2), 0 0 50px rgba(80,200,120,0.08)",
  },
  diamond: {
    boxShadow:
      "0 0 30px rgba(185,242,255,0.25), 0 0 60px rgba(185,242,255,0.1)",
  },
  master: {
    boxShadow:
      "0 0 30px rgba(255,70,85,0.3), 0 0 60px rgba(255,70,85,0.15), 0 0 100px rgba(255,70,85,0.05)",
  },
  grandmaster: {
    boxShadow:
      "0 0 40px rgba(200,255,0,0.25), 0 0 60px rgba(0,212,255,0.15), 0 0 100px rgba(255,70,85,0.1)",
  },
};

/* No frame ornaments — pure glow rings style */

const SIZE_CLASSES: Record<Size, string> = {
  sm: "w-28 h-[156px]",
  md: "w-44 card-ratio",
  lg: "w-56 card-ratio",
};

/* ─── Gold effects ─── */
function GoldEffects() {
  return (
    <>
      {/* Gold shimmer sweep */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none z-[2] overflow-hidden"
        style={{ borderRadius: "inherit" }}
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(105deg, transparent 30%, rgba(255,215,0,0.08) 38%, rgba(255,255,255,0.18) 50%, rgba(255,215,0,0.08) 62%, transparent 70%)",
            backgroundSize: "200% 100%",
            animation: "gold-shimmer 2.5s ease-in-out infinite",
          }}
        />
      </div>
    </>
  );
}

/* ─── Emerald effects ─── */
function EmeraldEffects() {
  return (
    <>
      {/* Breathing emerald glow pulse */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{
          borderRadius: "inherit",
          animation: "emerald-pulse 3s ease-in-out infinite",
        }}
      />
      {/* Green-tinted holo sweep */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none z-[2] overflow-hidden"
        style={{ borderRadius: "inherit" }}
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(105deg, transparent 30%, rgba(80,200,120,0.06) 38%, rgba(255,255,255,0.14) 50%, rgba(80,200,120,0.06) 62%, transparent 70%)",
            backgroundSize: "200% 100%",
            animation: "gold-shimmer 3s ease-in-out infinite",
          }}
        />
      </div>
    </>
  );
}

/* ─── Diamond effects ─── */
function DiamondEffects() {
  return (
    <>
      {/* Ice sparkle particles */}
      <div
        className="absolute pointer-events-none z-[3]"
        style={{
          inset: -6,
          borderRadius: "inherit",
          backgroundImage: [
            "radial-gradient(2px 2px at 10% 20%, rgba(255,255,255,0.8), transparent)",
            "radial-gradient(2px 2px at 25% 75%, rgba(185,242,255,0.8), transparent)",
            "radial-gradient(1.5px 1.5px at 40% 10%, rgba(255,255,255,0.7), transparent)",
            "radial-gradient(2px 2px at 55% 85%, rgba(185,242,255,0.7), transparent)",
            "radial-gradient(2px 2px at 70% 30%, rgba(255,255,255,0.8), transparent)",
            "radial-gradient(1.5px 1.5px at 85% 60%, rgba(185,242,255,0.6), transparent)",
          ].join(", "),
          animation: "diamond-sparkle 2.5s ease-in-out infinite",
        }}
      />
      {/* Pulsing ice glow */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{
          borderRadius: "inherit",
          animation: "diamond-ice-pulse 2s ease-in-out infinite",
        }}
      />
      {/* Refraction edge energy */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none z-[4]"
        style={{
          borderRadius: "inherit",
          background: [
            "linear-gradient(90deg, transparent 0%, rgba(185,242,255,0.4) 20%, transparent 40%) top / 200% 1px no-repeat",
            "linear-gradient(90deg, transparent 60%, rgba(185,242,255,0.4) 80%, transparent 100%) bottom / 200% 1px no-repeat",
            "linear-gradient(180deg, transparent 0%, rgba(185,242,255,0.3) 30%, transparent 60%) left / 1px 200% no-repeat",
            "linear-gradient(180deg, transparent 40%, rgba(185,242,255,0.3) 70%, transparent 100%) right / 1px 200% no-repeat",
          ].join(", "),
          animation: "diamond-edge-flash 3s ease-in-out infinite",
        }}
      />
    </>
  );
}

/* ─── Master effects ─── */
function MasterEffects() {
  return (
    <>
      {/* Crimson flame-like animated border glow */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{
          borderRadius: "inherit",
          animation: "master-flame 1.5s ease-in-out infinite",
        }}
      />
      {/* Ember particles floating upward */}
      <div
        className="absolute pointer-events-none z-[3]"
        style={{
          inset: -6,
          borderRadius: "inherit",
          backgroundImage: [
            "radial-gradient(2px 2px at 15% 80%, rgba(255,70,85,0.8), transparent)",
            "radial-gradient(2px 2px at 30% 90%, rgba(255,140,50,0.7), transparent)",
            "radial-gradient(1.5px 1.5px at 50% 85%, rgba(255,70,85,0.6), transparent)",
            "radial-gradient(2px 2px at 70% 75%, rgba(255,140,50,0.7), transparent)",
            "radial-gradient(2px 2px at 85% 88%, rgba(255,70,85,0.8), transparent)",
            "radial-gradient(1.5px 1.5px at 40% 70%, rgba(255,200,50,0.5), transparent)",
            "radial-gradient(2px 2px at 60% 95%, rgba(255,70,85,0.6), transparent)",
            "radial-gradient(1.5px 1.5px at 25% 65%, rgba(255,140,50,0.5), transparent)",
          ].join(", "),
          animation: "ember-float 2s ease-in-out infinite",
        }}
      />
      {/* Second ember layer, staggered */}
      <div
        className="absolute pointer-events-none z-[3]"
        style={{
          inset: -8,
          borderRadius: "inherit",
          backgroundImage: [
            "radial-gradient(2px 2px at 20% 92%, rgba(255,70,85,0.7), transparent)",
            "radial-gradient(1.5px 1.5px at 45% 78%, rgba(255,200,50,0.6), transparent)",
            "radial-gradient(2px 2px at 65% 88%, rgba(255,70,85,0.8), transparent)",
            "radial-gradient(2px 2px at 80% 95%, rgba(255,140,50,0.6), transparent)",
            "radial-gradient(1.5px 1.5px at 35% 82%, rgba(255,70,85,0.5), transparent)",
            "radial-gradient(2px 2px at 55% 72%, rgba(255,140,50,0.7), transparent)",
          ].join(", "),
          animation: "ember-float 2.5s ease-in-out infinite 0.6s",
        }}
      />
      {/* Intense inner glow */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none z-[1]"
        style={{
          borderRadius: "inherit",
          background:
            "radial-gradient(ellipse at center, rgba(255,70,85,0.08) 0%, transparent 70%)",
        }}
      />
    </>
  );
}

/* ─── Grandmaster effects — MAXIMUM OVERDRIVE ─── */
function GrandmasterEffects() {
  return (
    <>
      {/* 1. Rotating aurora border */}
      <div
        className="absolute rounded-2xl pointer-events-none z-[-1]"
        style={{
          inset: -5,
          background:
            "conic-gradient(from var(--gm-aurora-angle, 0deg), #c8ff00, #00d4ff, #ff4655, #ffd700, #c8ff00)",
          borderRadius: "inherit",
          animation:
            "gm-aurora-rotate 3s linear infinite, gm-border-pulse 4s ease-in-out infinite",
        }}
      />
      {/* 2. Inner mask — creates the border ring effect */}
      <div
        className="absolute rounded-2xl pointer-events-none z-[-1]"
        style={{
          inset: 1,
          background: "linear-gradient(to bottom right, #0a0f1a, #120a20)",
          borderRadius: "inherit",
        }}
      />
      {/* 3. Chromatic holo sweep */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none z-[2] overflow-hidden"
        style={{ borderRadius: "inherit" }}
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(105deg, transparent 25%, rgba(200,255,0,0.05) 32%, rgba(0,212,255,0.06) 40%, rgba(255,255,255,0.18) 50%, rgba(255,70,85,0.06) 60%, rgba(255,215,0,0.05) 68%, transparent 75%)",
            backgroundSize: "200% 100%",
            animation: "gm-holo-sweep 2s ease-in-out infinite",
          }}
        />
      </div>
      {/* 4. Dense sparkle particles layer 1 */}
      <div
        className="absolute pointer-events-none z-[3]"
        style={{
          inset: -8,
          borderRadius: "inherit",
          backgroundImage: [
            "radial-gradient(2px 2px at 10% 20%, rgba(255,255,255,0.8), transparent)",
            "radial-gradient(2px 2px at 25% 75%, rgba(0,212,255,0.8), transparent)",
            "radial-gradient(1.5px 1.5px at 40% 10%, rgba(200,255,0,0.7), transparent)",
            "radial-gradient(2px 2px at 55% 85%, rgba(255,255,255,0.7), transparent)",
            "radial-gradient(2px 2px at 70% 30%, rgba(0,212,255,0.8), transparent)",
            "radial-gradient(1.5px 1.5px at 85% 60%, rgba(200,255,0,0.6), transparent)",
            "radial-gradient(2px 2px at 15% 50%, rgba(255,255,255,0.6), transparent)",
            "radial-gradient(1.5px 1.5px at 60% 45%, rgba(0,212,255,0.7), transparent)",
            "radial-gradient(2px 2px at 90% 15%, rgba(200,255,0,0.7), transparent)",
            "radial-gradient(2px 2px at 45% 65%, rgba(255,255,255,0.8), transparent)",
          ].join(", "),
          animation: "sparkle-float 2s ease-in-out infinite",
        }}
      />
      {/* 5. Dense sparkle particles layer 2 — offset timing */}
      <div
        className="absolute pointer-events-none z-[3]"
        style={{
          inset: -10,
          borderRadius: "inherit",
          backgroundImage: [
            "radial-gradient(2px 2px at 8% 40%, rgba(200,255,0,0.7), transparent)",
            "radial-gradient(2px 2px at 22% 15%, rgba(255,255,255,0.8), transparent)",
            "radial-gradient(1.5px 1.5px at 38% 90%, rgba(0,212,255,0.6), transparent)",
            "radial-gradient(2px 2px at 52% 25%, rgba(255,70,85,0.5), transparent)",
            "radial-gradient(2px 2px at 68% 70%, rgba(255,215,0,0.6), transparent)",
            "radial-gradient(1.5px 1.5px at 78% 5%, rgba(200,255,0,0.8), transparent)",
            "radial-gradient(2px 2px at 92% 55%, rgba(255,255,255,0.7), transparent)",
            "radial-gradient(1.5px 1.5px at 35% 35%, rgba(0,212,255,0.7), transparent)",
            "radial-gradient(2px 2px at 5% 80%, rgba(200,255,0,0.6), transparent)",
            "radial-gradient(2px 2px at 75% 90%, rgba(255,70,85,0.5), transparent)",
          ].join(", "),
          animation: "sparkle-float-alt 2.5s ease-in-out infinite 0.5s",
        }}
      />
      {/* 6. Noise overlay */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none z-[1]"
        style={{
          borderRadius: "inherit",
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "256px 256px",
          mixBlendMode: "overlay",
        }}
      />
    </>
  );
}

/* ─── Effect component map ─── */
const TIER_EFFECTS: Partial<Record<Tier, React.FC>> = {
  gold: GoldEffects,
  emerald: EmeraldEffects,
  diamond: DiamondEffects,
  master: MasterEffects,
  grandmaster: GrandmasterEffects,
};

export function CardShell({
  children,
  tier = "bronze",
  accentColor,
  interactive = true,
  size = "md",
  className = "",
  onClick,
}: CardShellProps) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-0.5, 0.5], [10, -10]);
  const rotateY = useTransform(x, [-0.5, 0.5], [-10, 10]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const rect = ref.current?.getBoundingClientRect();
      if (!rect) return;
      x.set((e.clientX - rect.left) / rect.width - 0.5);
      y.set((e.clientY - rect.top) / rect.height - 0.5);
    },
    [x, y]
  );

  const handleMouseLeave = useCallback(() => {
    animate(x, 0, { duration: 0.5, ease: "easeOut" });
    animate(y, 0, { duration: 0.5, ease: "easeOut" });
  }, [x, y]);

  const tierClasses = accentColor ? "" : TIER_CARD_CLASSES[tier];
  const tierStyle = accentColor
    ? {
        borderColor: accentColor,
        boxShadow: `0 0 20px ${accentColor}25`,
      }
    : TIER_STYLES[tier] ?? {};

  /* No ornaments in glow rings style */

  /* Resolve tier effect component */
  const EffectComponent = !accentColor ? TIER_EFFECTS[tier] : undefined;

  const cardElement = (
    <motion.div
      ref={ref}
      style={{
        rotateX: interactive ? rotateX : 0,
        rotateY: interactive ? rotateY : 0,
        transformStyle: "preserve-3d",
        ...tierStyle,
      }}
      onMouseMove={interactive ? handleMouseMove : undefined}
      onMouseLeave={interactive ? handleMouseLeave : undefined}
      whileTap={interactive ? { scale: 0.97 } : undefined}
      onClick={onClick}
      data-card-shell=""
      className={[
        "relative rounded-2xl cursor-pointer",
        "transition-shadow duration-300",
        accentColor
          ? "border-2 bg-gradient-to-br from-[#1a1a2e] to-[#16213e]"
          : "",
        tierClasses,
        SIZE_CLASSES[size],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* Tier-specific visual effects (real DOM elements, no pseudo-elements) */}
      {EffectComponent && <EffectComponent />}

      {/* Inner content wrapper — clips content, does NOT clip card effects */}
      <div className="relative overflow-hidden rounded-2xl h-full z-[5]">
        {children}
      </div>
    </motion.div>
  );

  return <div style={{ perspective: 1200 }}>{cardElement}</div>;
}
