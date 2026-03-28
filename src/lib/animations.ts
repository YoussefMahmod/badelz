import type { Transition, Easing } from "framer-motion";

const easeOut = "easeOut" as Easing;
const easePremium = [0.22, 1, 0.36, 1] as const;

// ─── Basic transitions (legacy compat) ───

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.3 } satisfies Transition,
};

export const slideUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
  transition: { duration: 0.4, ease: easeOut } satisfies Transition,
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
  transition: { duration: 0.3, ease: easeOut } satisfies Transition,
};

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export const staggerItem = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export const checkmarkDraw = {
  initial: { pathLength: 0, opacity: 0 },
  animate: {
    pathLength: 1,
    opacity: 1,
    transition: { duration: 0.6, ease: easeOut, delay: 0.2 } satisfies Transition,
  },
};

export const pulseGlow = {
  animate: {
    boxShadow: [
      "0 0 0 0 rgba(200, 255, 0, 0.4)",
      "0 0 0 10px rgba(200, 255, 0, 0)",
      "0 0 0 0 rgba(200, 255, 0, 0)",
    ],
    transition: { duration: 2, repeat: Infinity },
  },
};

// ─── Scroll-triggered reveals (whileInView) ───

export const revealUp = {
  initial: { opacity: 0, y: 60 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: 0.7, ease: easePremium },
};

export const revealScale = {
  initial: { opacity: 0, scale: 0.85 },
  whileInView: { opacity: 1, scale: 1 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.6, ease: easePremium },
};

// ─── Bento grid animations ───

export const staggerBento = {
  animate: {
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
};

export const bentoItem = {
  initial: { opacity: 0, y: 40, scale: 0.95 },
  whileInView: { opacity: 1, y: 0, scale: 1 },
  viewport: { once: true },
  transition: { duration: 0.6, ease: easePremium },
};

// ─── Card interactions ───

export const cardHover = {
  whileHover: { y: -8, transition: { duration: 0.3, ease: easeOut } },
};

export const cardHoverSubtle = {
  whileHover: { y: -4, transition: { duration: 0.25, ease: easeOut } },
};

// ─── Step transitions (booking flow) ───

export const stepTransition = {
  initial: { opacity: 0, x: 60, scale: 0.98 },
  animate: { opacity: 1, x: 0, scale: 1 },
  exit: { opacity: 0, x: -60, scale: 0.98 },
  transition: { duration: 0.35, ease: easePremium },
};

// ─── Counter animation config ───

export const counterConfig = {
  duration: 2,
  ease: easePremium as unknown as [number, number, number, number],
};

// ─── Dark Premium Theme Animations ───

// Stagger for dark bento grid
export const staggerDarkBento = {
  initial: {},
  animate: {
    transition: { staggerChildren: 0.12, delayChildren: 0.2 },
  },
};

export const darkBentoItem = {
  initial: { opacity: 0, y: 30, scale: 0.97 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: easePremium as unknown as Easing },
  },
};

// Hero text reveal (stagger per line)
export const heroTextReveal = {
  initial: { opacity: 0, y: 40, filter: "blur(10px)" },
  animate: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.7, ease: easePremium as unknown as Easing },
  },
};

// Scale in with glow
export const scaleInGlow = {
  initial: { opacity: 0, scale: 0.9 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: easePremium as unknown as Easing },
  },
};
