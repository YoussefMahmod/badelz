import type { Transition } from "framer-motion";

// ─── BALADI: Minimal animation set ───
// Only used in booking flow step transitions and chip selectors.

const easePremium = [0.22, 1, 0.36, 1] as const;

// Step transitions (booking flow only)
export const stepFade = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.15 } satisfies Transition,
};

// Checkmark draw (booking confirmed)
export const checkmarkDraw = {
  initial: { pathLength: 0, opacity: 0 },
  animate: {
    pathLength: 1,
    opacity: 1,
    transition: { duration: 0.6, ease: "easeOut", delay: 0.2 } satisfies Transition,
  },
};
