"use client";

import { useRef, useCallback } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";

type Tier = "bronze" | "silver" | "gold" | "diamond" | "elite" | "pro";
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

const TIER_CLASSES: Record<Tier, string> = {
  bronze: [
    "border-2 border-[#cd7f32]",
    "bg-gradient-to-br from-[#1a1a2e] to-[#16213e]",
  ].join(" "),
  silver: [
    "border-[3px] silver-frame holo-shine",
    "bg-gradient-to-br from-[#1a1a2e] to-[#252540]",
  ].join(" "),
  gold: [
    "border-4 gold-frame holo-shine-gold holo-shine",
    "bg-gradient-to-br from-[#1a1a2e] to-[#2a2040]",
  ].join(" "),
  diamond: [
    "border-4 diamond-frame sparkle-particles-dense diamond-pulse-glow diamond-edge-energy holo-shine",
    "bg-gradient-to-br from-[#0a0f1a] to-[#0f1b2d]",
  ].join(" "),
  elite: [
    "border-[5px] aurora-border sparkle-particles-dense sparkle-particles-layer2 elite-surface elite-noise",
    "bg-gradient-to-br from-[#0a0f1a] to-[#120a20]",
  ].join(" "),
  pro: [
    "border-4 border-[#c8ff00] holo-shine-gold holo-shine",
    "bg-gradient-to-br from-[#1a1a2e] to-[#1a2a1e]",
  ].join(" "),
};

const TIER_STYLES: Partial<Record<Tier, React.CSSProperties>> = {
  silver: {
    boxShadow: "0 0 15px rgba(192,192,192,0.2)",
  },
  gold: {
    boxShadow:
      "0 0 30px rgba(255,215,0,0.25), 0 0 60px rgba(255,215,0,0.1), inset 0 0 20px rgba(255,215,0,0.05)",
  },
  // diamond glow is handled by the diamond-pulse-glow CSS animation
  diamond: {},
  elite: {
    boxShadow:
      "0 0 30px rgba(200,255,0,0.3), 0 0 60px rgba(0,212,255,0.15), 0 0 100px rgba(200,255,0,0.08)",
  },
  pro: {
    boxShadow:
      "0 0 25px rgba(200,255,0,0.2), 0 0 50px rgba(200,255,0,0.08)",
  },
};

/* Tiers that need a frame wrapper with ornamental pseudo-elements */
const FRAME_ORNAMENTS: Partial<Record<Tier, string>> = {
  gold: "gold-wings",
  elite: "elite-wisps",
};

/* Silver gets corner accents via extra span elements */
const NEEDS_CORNER_ACCENTS: Partial<Record<Tier, boolean>> = {
  silver: true,
};

const SIZE_CLASSES: Record<Size, string> = {
  sm: "w-36 h-[201px]",
  md: "w-56 card-ratio",
  lg: "w-72 card-ratio",
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

  const tierClasses = accentColor ? "" : TIER_CLASSES[tier];
  const tierStyle = accentColor
    ? {
        borderColor: accentColor,
        boxShadow: `0 0 20px ${accentColor}25`,
      }
    : TIER_STYLES[tier] ?? {};

  const frameOrnament = !accentColor ? FRAME_ORNAMENTS[tier] : undefined;
  const needsCorners = !accentColor && NEEDS_CORNER_ACCENTS[tier];

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
      className={[
        "relative rounded-2xl overflow-hidden cursor-pointer",
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
      {/* Silver corner accents — bottom corners need real elements since
          ::before/::after are already used by holo-shine */}
      {needsCorners && (
        <>
          {/* Top-left L-corner */}
          <span
            className="absolute top-1 z-10 pointer-events-none"
            style={{
              insetInlineStart: "4px",
              width: 14,
              height: 14,
              borderTop: "2px solid rgba(192,192,192,0.6)",
              borderInlineStart: "2px solid rgba(192,192,192,0.6)",
              borderRadius: "3px 0 0 0",
            }}
          />
          {/* Top-right L-corner */}
          <span
            className="absolute top-1 z-10 pointer-events-none"
            style={{
              insetInlineEnd: "4px",
              width: 14,
              height: 14,
              borderTop: "2px solid rgba(192,192,192,0.6)",
              borderInlineEnd: "2px solid rgba(192,192,192,0.6)",
              borderRadius: "0 3px 0 0",
            }}
          />
          {/* Bottom-left L-corner */}
          <span
            className="absolute bottom-1 z-10 pointer-events-none"
            style={{
              insetInlineStart: "4px",
              width: 14,
              height: 14,
              borderBottom: "2px solid rgba(192,192,192,0.6)",
              borderInlineStart: "2px solid rgba(192,192,192,0.6)",
              borderRadius: "0 0 0 3px",
            }}
          />
          {/* Bottom-right L-corner */}
          <span
            className="absolute bottom-1 z-10 pointer-events-none"
            style={{
              insetInlineEnd: "4px",
              width: 14,
              height: 14,
              borderBottom: "2px solid rgba(192,192,192,0.6)",
              borderInlineEnd: "2px solid rgba(192,192,192,0.6)",
              borderRadius: "0 0 3px 0",
            }}
          />
        </>
      )}

      {children}
    </motion.div>
  );

  /* Wrap in a frame div for tiers that have ornaments extending OUTSIDE the card */
  if (frameOrnament) {
    return (
      <div
        className={`relative ${frameOrnament}`}
        style={{ perspective: 1200, padding: "16px 8px 8px 8px" }}
      >
        {cardElement}
      </div>
    );
  }

  return (
    <div style={{ perspective: 1200 }}>
      {cardElement}
    </div>
  );
}
