"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import Link from "next/link";
import {
  Search,
  Users,
  ChevronDown,
  UserX,
  Gift,
  MessageCircle,
  CalendarCheck,
  Trophy,
  GraduationCap,
  ShoppingBag,
  Check,
  CheckCircle,
  ArrowUpRight,
} from "lucide-react";
import { useTranslation } from "@/i18n";
import { Header } from "@/components/header";
import {
  heroTextReveal,
  staggerDarkBento,
  darkBentoItem,
  scaleInGlow,
  revealUp,
} from "@/lib/animations";
import type { Easing } from "framer-motion";
import type { LucideIcon } from "lucide-react";

const easePremium = [0.22, 1, 0.36, 1] as unknown as Easing;

// ─── Phone Mockup Frame ───
function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-[240px] h-[480px] rounded-[32px] border-[3px] border-white/10 bg-[#0a0f1a] overflow-hidden shadow-2xl shadow-black/50 animate-float-slow">
      {/* Notch */}
      <div className="mx-auto w-24 h-6 bg-black rounded-b-2xl" />
      {/* Screen content */}
      <div className="p-3 space-y-3">{children}</div>
      {/* Bottom nav mockup */}
      <div className="absolute bottom-0 inset-x-0 h-12 bg-[#0a0f1a]/90 border-t border-white/5 flex items-center justify-around px-4">
        <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
        <div className="h-1.5 w-1.5 rounded-full bg-white/20" />
        <div className="h-1.5 w-1.5 rounded-full bg-white/20" />
        <div className="h-1.5 w-1.5 rounded-full bg-white/20" />
        <div className="h-1.5 w-1.5 rounded-full bg-white/20" />
      </div>
    </div>
  );
}

// ─── Hero Phone Mockup (Discover Feed) ───
function HeroPhoneMockup() {
  return (
    <PhoneFrame>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="h-3 w-16 rounded bg-white/20" />
        <div className="h-3 w-3 rounded-full bg-emerald-400/40" />
      </div>
      {/* Quick actions */}
      <div className="flex gap-1.5">
        <div className="h-7 flex-1 rounded-full bg-emerald-500/15 border border-emerald-500/20" />
        <div className="h-7 flex-1 rounded-full bg-white/5 border border-white/10" />
      </div>
      {/* Venue cards row */}
      <div className="flex gap-2">
        <div className="w-24 rounded-xl bg-white/5 border border-white/10 overflow-hidden">
          <div className="h-14 bg-emerald-500/10" />
          <div className="p-1.5 space-y-1">
            <div className="h-2 w-14 rounded bg-white/15" />
            <div className="h-2 w-8 rounded bg-emerald-400/30" />
          </div>
        </div>
        <div className="w-24 rounded-xl bg-white/5 border border-white/10 overflow-hidden">
          <div className="h-14 bg-cyan-500/10" />
          <div className="p-1.5 space-y-1">
            <div className="h-2 w-14 rounded bg-white/15" />
            <div className="h-2 w-8 rounded bg-emerald-400/30" />
          </div>
        </div>
      </div>
      {/* Lobby cards */}
      <div className="flex gap-2">
        <div className="flex-1 rounded-lg bg-white/5 border border-white/10 p-2 space-y-1.5">
          <div className="flex items-center gap-1">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <div className="h-2 w-12 rounded bg-white/15" />
          </div>
          <div className="h-2 w-16 rounded bg-white/10" />
        </div>
        <div className="flex-1 rounded-lg bg-white/5 border border-white/10 p-2 space-y-1.5">
          <div className="flex items-center gap-1">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <div className="h-2 w-12 rounded bg-white/15" />
          </div>
          <div className="h-2 w-16 rounded bg-white/10" />
        </div>
      </div>
      {/* Market cards */}
      <div className="flex gap-2">
        <div className="w-20 rounded-lg bg-white/5 border border-white/10 overflow-hidden">
          <div className="h-16 bg-[#c8ff00]/5" />
          <div className="p-1 space-y-0.5">
            <div className="h-1.5 w-12 rounded bg-white/15" />
            <div className="h-1.5 w-8 rounded bg-[#c8ff00]/20" />
          </div>
        </div>
        <div className="w-20 rounded-lg bg-white/5 border border-white/10 overflow-hidden">
          <div className="h-16 bg-cyan-500/5" />
          <div className="p-1 space-y-0.5">
            <div className="h-1.5 w-12 rounded bg-white/15" />
            <div className="h-1.5 w-8 rounded bg-[#c8ff00]/20" />
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
}

// ─── Feature Mockups (per tab) ───
function CourtsMockup() {
  return (
    <PhoneFrame>
      <div className="h-3 w-20 rounded bg-white/20 mb-1" />
      {/* Search bar */}
      <div className="h-8 rounded-full bg-white/5 border border-white/10 flex items-center ps-3 gap-2">
        <div className="h-2.5 w-2.5 rounded-full bg-emerald-400/40" />
        <div className="h-2 w-16 rounded bg-white/10" />
      </div>
      {/* Venue card */}
      <div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
        <div className="h-20 bg-emerald-500/8" />
        <div className="p-2 space-y-1.5">
          <div className="h-2.5 w-24 rounded bg-white/15" />
          <div className="h-2 w-16 rounded bg-white/8" />
          <div className="h-2 w-12 rounded bg-emerald-400/30" />
        </div>
      </div>
      {/* Time slot grid */}
      <div className="space-y-1.5">
        <div className="h-2 w-14 rounded bg-white/15" />
        <div className="grid grid-cols-3 gap-1.5">
          {[true, true, false, true, false, true].map((avail, i) => (
            <div
              key={i}
              className={`h-7 rounded-lg flex items-center justify-center text-[8px] font-bold ${
                avail
                  ? "bg-emerald-500/15 border border-emerald-500/20 text-emerald-400/60"
                  : "bg-white/3 border border-white/5 text-white/15"
              }`}
            >
              {`${i + 3}:00`}
            </div>
          ))}
        </div>
      </div>
      {/* CTA */}
      <div className="h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30" />
    </PhoneFrame>
  );
}

function PlayersMockup() {
  return (
    <PhoneFrame>
      <div className="h-3 w-20 rounded bg-white/20 mb-1" />
      {/* Lobby cards */}
      {[0, 1, 2].map((i) => (
        <div key={i} className="rounded-xl bg-white/5 border border-white/10 p-2.5 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
              <div className="h-2 w-20 rounded bg-white/15" />
            </div>
            <div className="h-4 px-1.5 rounded-full bg-cyan-500/15 border border-cyan-500/20 flex items-center">
              <div className="h-1.5 w-8 rounded bg-cyan-400/40" />
            </div>
          </div>
          <div className="flex gap-1">
            {[true, true, false, false].map((filled, j) => (
              <div
                key={j}
                className={`h-5 w-5 rounded-full ${
                  filled ? "bg-cyan-400/30" : "border border-dashed border-white/15"
                }`}
              />
            ))}
          </div>
          <div className="h-2 w-24 rounded bg-white/8" />
        </div>
      ))}
    </PhoneFrame>
  );
}

function CoachesMockup() {
  return (
    <PhoneFrame>
      <div className="h-3 w-20 rounded bg-white/20 mb-1" />
      {/* Coach cards */}
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex gap-2.5 rounded-xl bg-white/5 border border-white/10 p-2.5">
          {/* Avatar */}
          <div className="h-12 w-12 shrink-0 rounded-xl bg-purple-500/15 border border-purple-500/20" />
          <div className="flex-1 space-y-1.5">
            <div className="h-2.5 w-20 rounded bg-white/15" />
            <div className="flex gap-1">
              <div className="h-4 px-1.5 rounded-full bg-purple-500/10 border border-purple-500/15 flex items-center">
                <div className="h-1.5 w-8 rounded bg-purple-400/30" />
              </div>
            </div>
            <div className="h-2 w-16 rounded bg-purple-400/20" />
          </div>
        </div>
      ))}
      {/* CTA */}
      <div className="h-8 rounded-full bg-purple-500/15 border border-purple-500/20" />
    </PhoneFrame>
  );
}

function MarketMockup() {
  return (
    <PhoneFrame>
      <div className="h-3 w-20 rounded bg-white/20 mb-1" />
      {/* Category pills */}
      <div className="flex gap-1.5 overflow-hidden">
        <div className="h-6 px-2 rounded-full bg-[#c8ff00]/10 border border-[#c8ff00]/20 shrink-0" />
        <div className="h-6 px-2 rounded-full bg-white/5 border border-white/10 shrink-0 w-12" />
        <div className="h-6 px-2 rounded-full bg-white/5 border border-white/10 shrink-0 w-10" />
      </div>
      {/* Listing grid */}
      <div className="grid grid-cols-2 gap-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
            <div className={`h-20 ${i === 0 ? "bg-[#c8ff00]/5" : i === 1 ? "bg-cyan-500/5" : i === 2 ? "bg-purple-500/5" : "bg-emerald-500/5"}`}>
              {i === 0 && (
                <div className="m-1">
                  <div className="h-3 w-6 rounded-sm bg-[#c8ff00]/20 flex items-center justify-center">
                    <span className="text-[5px] font-bold text-[#c8ff00]/60">NEW</span>
                  </div>
                </div>
              )}
            </div>
            <div className="p-1.5 space-y-0.5">
              <div className="h-1.5 w-14 rounded bg-white/15" />
              <div className="h-1.5 w-10 rounded bg-[#c8ff00]/20" />
            </div>
          </div>
        ))}
      </div>
    </PhoneFrame>
  );
}

// ─── Screenshot Phone (real app screenshots) ───
function ScreenshotPhone({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative w-[240px] h-[480px] rounded-[32px] border-[3px] border-white/10 bg-[#0a0f1a] overflow-hidden shadow-2xl shadow-black/50 animate-float-slow">
      <img src={src} alt={alt} className="w-full h-full object-cover object-top" />
    </div>
  );
}

const FEATURE_MOCKUPS = [
  () => <ScreenshotPhone src="/screenshots/booking.png" alt="Book a court" />,
  PlayersMockup,
  () => <ScreenshotPhone src="/screenshots/coaches.png" alt="Find coaches" />,
  () => <ScreenshotPhone src="/screenshots/market.png" alt="Gear market" />,
];

// ─── Value Chip ───
function ValueChip({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full glass-dark px-4 py-2 border border-white/10">
      <Icon size={14} className="text-emerald-400 shrink-0" />
      <span className="text-xs sm:text-sm font-medium text-white/70">{label}</span>
    </div>
  );
}

// ─── Animated Counter ───
function AnimatedCounter({ target, label, suffix = "+" }: { target: number; label: string; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 2000;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target]);

  return (
    <div ref={ref} className="text-center">
      <p className="text-3xl sm:text-4xl font-black text-white/90">
        {count}{suffix}
      </p>
      <p className="text-sm text-white/40 mt-1">{label}</p>
    </div>
  );
}

// ─── Tier Card Stack ───
function TierCardStack() {
  const tiers = [
    { name: "Diamond", color: "#60a5fa", glow: "shadow-blue-500/30" },
    { name: "Emerald", color: "#10b981", glow: "shadow-emerald-500/30" },
    { name: "Gold", color: "#f59e0b", glow: "shadow-amber-500/30" },
    { name: "Bronze", color: "#d97706", glow: "shadow-orange-500/30" },
  ];

  return (
    <div className="relative h-64 w-48 mx-auto perspective-container">
      {tiers.map((tier, i) => (
        <motion.div
          key={tier.name}
          initial={{ opacity: 0, y: 20, rotateX: 10 }}
          whileInView={{
            opacity: 1 - i * 0.15,
            y: i * -16,
            rotateX: 5,
          }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: i * 0.12, ease: easePremium }}
          className={`absolute inset-0 rounded-2xl border-2 p-4 bg-[#0d1220] ${tier.glow}`}
          style={{ borderColor: tier.color, zIndex: tiers.length - i }}
        >
          <div
            className="text-xs font-bold uppercase tracking-widest"
            style={{ color: tier.color }}
          >
            {tier.name}
          </div>
          <div className="mt-2 h-2 w-16 rounded bg-white/10" />
          <div className="mt-1.5 h-2 w-10 rounded bg-white/5" />
        </motion.div>
      ))}
    </div>
  );
}

// ════════════════════════════════════════════════════
// Section 1: Hero
// ════════════════════════════════════════════════════
function Hero() {
  const { t } = useTranslation();

  const staggerParent = {
    animate: {
      transition: { staggerChildren: 0.12, delayChildren: 0.15 },
    },
  };

  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden">
      <Header />

      <div className="relative z-10 flex-1 flex items-center">
        <div className="mx-auto w-full max-w-7xl px-5 sm:px-8 py-16 sm:py-20 lg:py-0">
          <div className="flex flex-col lg:flex-row lg:items-center lg:gap-12 xl:gap-20">
            {/* Text side */}
            <motion.div
              className="flex-1 max-w-2xl"
              variants={staggerParent}
              initial="initial"
              animate="animate"
            >
              {/* Badge */}
              <motion.div variants={heroTextReveal}>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 text-sm font-semibold text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {t("landing.platformBadge")}
                </span>
              </motion.div>

              {/* Heading — 3 lines */}
              <div className="mt-6 space-y-1">
                {(["heroLine1", "heroLine2", "heroLine3"] as const).map(
                  (key, i) => (
                    <motion.h1
                      key={key}
                      variants={heroTextReveal}
                      className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-[1.1] tracking-tight"
                    >
                      {i === 2 ? (
                        <span className="text-emerald-400 glow-lime-text">
                          {t(`landing.${key}`)}
                        </span>
                      ) : (
                        t(`landing.${key}`)
                      )}
                    </motion.h1>
                  )
                )}
              </div>

              {/* Subtitle */}
              <motion.p
                variants={heroTextReveal}
                className="mt-5 text-lg text-white/50 max-w-lg leading-relaxed"
              >
                {t("landing.heroSubtitleNew")}
              </motion.p>

              {/* CTAs */}
              <motion.div
                variants={heroTextReveal}
                className="mt-8 flex flex-col sm:flex-row gap-3"
              >
                <Link href="/browse">
                  <motion.span
                    whileHover={{
                      scale: 1.03,
                      boxShadow:
                        "0 0 30px rgba(16,185,129,0.3), 0 0 60px rgba(16,185,129,0.1)",
                    }}
                    whileTap={{ scale: 0.97 }}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-8 py-4 text-lg font-bold cursor-pointer transition-all min-w-[200px]"
                  >
                    {t("landing.startBooking")}
                    <Search size={18} />
                  </motion.span>
                </Link>
                <Link href="/register">
                  <motion.span
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    className="inline-flex items-center justify-center rounded-full border border-white/10 text-white/80 px-8 py-4 text-lg font-semibold cursor-pointer transition-all hover:border-white/20 hover:bg-white/5 min-w-[200px]"
                  >
                    {t("landing.imVenueOwner")}
                  </motion.span>
                </Link>
              </motion.div>

              {/* Value chips */}
              <motion.div
                variants={heroTextReveal}
                className="mt-10 flex flex-wrap items-center gap-3"
              >
                <ValueChip icon={UserX} label={t("landing.valueNoAccount")} />
                <ValueChip icon={Gift} label={t("landing.valueFreeVenues")} />
                <ValueChip
                  icon={MessageCircle}
                  label={t("landing.valueWhatsApp")}
                />
              </motion.div>
            </motion.div>

            {/* Phone mockup — hidden on mobile */}
            <motion.div
              className="hidden lg:flex flex-1 justify-center perspective-container"
              initial={{ opacity: 0, y: 40, rotateY: -8 }}
              animate={{ opacity: 1, y: 0, rotateY: 0 }}
              transition={{ duration: 0.8, delay: 0.6, ease: easePremium }}
            >
              {/* Decorative orbs */}
              <div
                className="absolute -top-16 -end-16 w-56 h-56 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none"
                aria-hidden="true"
              />
              <div
                className="absolute -bottom-12 -start-12 w-40 h-40 rounded-full bg-teal-500/8 blur-3xl pointer-events-none"
                aria-hidden="true"
              />
              <ScreenshotPhone src="/screenshots/discover.png" alt="Badelz app" />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-6 inset-x-0 flex justify-center z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-1"
        >
          <span className="text-[10px] text-white/30 font-medium">
            {t("landing.scrollToExplore")}
          </span>
          <ChevronDown size={16} className="text-white/30" />
        </motion.div>
      </motion.div>
    </section>
  );
}

// ════════════════════════════════════════════════════
// Section 2: Feature Showcase — "Everything You Need"
// ════════════════════════════════════════════════════
function FeatureShowcase() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState(0);

  const FEATURES = [
    {
      key: "courts",
      icon: Search,
      title: t("landing.featureCourtTitle"),
      desc: t("landing.featureCourtDesc"),
      bullets: [
        t("landing.featureCourtBullet1"),
        t("landing.featureCourtBullet2"),
        t("landing.featureCourtBullet3"),
      ],
      cta: { label: t("landing.browseCourts"), href: "/browse" },
      color: "#10b981",
    },
    {
      key: "players",
      icon: Users,
      title: t("landing.featurePlayTitle"),
      desc: t("landing.featurePlayDesc"),
      bullets: [
        t("landing.featurePlayBullet1"),
        t("landing.featurePlayBullet2"),
        t("landing.featurePlayBullet3"),
      ],
      cta: { label: t("landing.findPlayers"), href: "/play" },
      color: "#06b6d4",
    },
    {
      key: "coaches",
      icon: GraduationCap,
      title: t("landing.featureCoachTitle"),
      desc: t("landing.featureCoachDesc"),
      bullets: [
        t("landing.featureCoachBullet1"),
        t("landing.featureCoachBullet2"),
        t("landing.featureCoachBullet3"),
      ],
      cta: { label: t("landing.findCoach"), href: "/coaches" },
      color: "#a78bfa",
    },
    {
      key: "market",
      icon: ShoppingBag,
      title: t("landing.featureMarketTitle"),
      desc: t("landing.featureMarketDesc"),
      bullets: [
        t("landing.featureMarketBullet1"),
        t("landing.featureMarketBullet2"),
        t("landing.featureMarketBullet3"),
      ],
      cta: { label: t("landing.browseMarket"), href: "/market" },
      color: "#c8ff00",
    },
  ];

  const active = FEATURES[activeTab];
  const ActiveMockup = FEATURE_MOCKUPS[activeTab];

  return (
    <section className="relative py-24 sm:py-32 px-5 sm:px-8 overflow-hidden">
      <div className="mx-auto max-w-6xl">
        {/* Section heading */}
        <motion.div className="text-center mb-12" {...revealUp}>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
            {t("landing.everythingYouNeed")}
          </h2>
        </motion.div>

        {/* Tab pills */}
        <motion.div
          className="flex gap-2 mb-12 overflow-x-auto pb-2 hide-scrollbar justify-start sm:justify-center"
          {...revealUp}
        >
          {FEATURES.map((feature, i) => {
            const isActive = i === activeTab;
            const Icon = feature.icon;
            return (
              <button
                key={feature.key}
                onClick={() => setActiveTab(i)}
                className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold border transition-all duration-300 whitespace-nowrap shrink-0 ${
                  isActive
                    ? "text-white"
                    : "bg-white/5 border-white/10 text-white/40 hover:text-white/60 hover:border-white/20"
                }`}
                style={
                  isActive
                    ? {
                        backgroundColor: `${feature.color}15`,
                        borderColor: `${feature.color}30`,
                      }
                    : undefined
                }
              >
                <Icon size={16} style={isActive ? { color: feature.color } : undefined} />
                {feature.title}
              </button>
            );
          })}
        </motion.div>

        {/* Content area */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35, ease: easePremium }}
            className="flex flex-col-reverse lg:flex-row items-center gap-8 lg:gap-16"
          >
            {/* Text side */}
            <div className="flex-1 max-w-lg">
              <h3
                className="text-2xl sm:text-3xl font-bold text-white mb-4"
                style={{ color: active.color }}
              >
                {active.title}
              </h3>
              <p className="text-white/50 text-lg mb-8 leading-relaxed">
                {active.desc}
              </p>

              {/* Bullet points */}
              <ul className="space-y-4 mb-8">
                {active.bullets.map((bullet, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      duration: 0.35,
                      delay: 0.1 + i * 0.08,
                      ease: easePremium,
                    }}
                    className="flex items-center gap-3"
                  >
                    <div
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                      style={{ backgroundColor: `${active.color}20` }}
                    >
                      <Check size={12} style={{ color: active.color }} />
                    </div>
                    <span className="text-white/70 text-sm sm:text-base">
                      {bullet}
                    </span>
                  </motion.li>
                ))}
              </ul>

              {/* CTA link */}
              <Link
                href={active.cta.href}
                className="inline-flex items-center gap-2 text-sm font-semibold transition-colors hover:gap-3"
                style={{ color: active.color }}
              >
                {active.cta.label}
                <ArrowUpRight size={16} />
              </Link>
            </div>

            {/* Phone mockup side */}
            <div className="flex justify-center perspective-container">
              <ActiveMockup />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

// ════════════════════════════════════════════════════
// Section 3: How It Works
// ════════════════════════════════════════════════════
function HowItWorksSection() {
  const { t } = useTranslation();

  const steps = [
    {
      icon: Search,
      title: t("landing.step1Title"),
      desc: t("landing.step1Desc"),
    },
    {
      icon: CalendarCheck,
      title: t("landing.step2Title"),
      desc: t("landing.step2Desc"),
    },
    {
      icon: Trophy,
      title: t("landing.step3Title"),
      desc: t("landing.step3Desc"),
    },
  ];

  return (
    <section className="relative py-24 sm:py-32 px-5 sm:px-8 overflow-hidden">
      <div className="mx-auto max-w-5xl">
        {/* Section heading */}
        <motion.div className="text-center mb-16" {...revealUp}>
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            {t("landing.howItWorksTitle")}
          </h2>
        </motion.div>

        {/* Steps */}
        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-6">
          {/* Connecting dashed line (desktop only) */}
          <div
            className="hidden md:block absolute top-10 inset-x-[15%] h-px border-t border-dashed border-white/10"
            aria-hidden="true"
          />

          {steps.map((step, i) => (
            <motion.div
              key={i}
              className="relative flex flex-col items-center text-center"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{
                duration: 0.6,
                delay: i * 0.15,
                ease: easePremium,
              }}
            >
              {/* Icon circle */}
              <div className="relative z-10 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6">
                <step.icon size={28} className="text-emerald-400" />
              </div>

              {/* Step number badge */}
              <div className="absolute top-0 end-1/2 z-20 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold translate-x-1/2 -translate-y-1">
                {i + 1}
              </div>

              <h3 className="text-xl font-bold text-white mb-2">
                {step.title}
              </h3>
              <p className="text-white/50 text-sm leading-relaxed max-w-[280px]">
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ════════════════════════════════════════════════════
// Section 4: Player Cards & Ranks
// ════════════════════════════════════════════════════
function PlayerCardsSection() {
  const { t } = useTranslation();

  return (
    <section className="relative py-24 sm:py-32 px-5 sm:px-8 overflow-hidden">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          {/* Text side */}
          <motion.div
            className="flex-1 text-center lg:text-start"
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease: easePremium }}
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              {t("landing.everyGameLevels")}
            </h2>
            <p className="text-white/50 text-lg max-w-md mx-auto lg:mx-0 mb-8 leading-relaxed">
              {t("landing.everyGameLevelsDesc")}
            </p>
            <Link
              href="/players"
              className="inline-flex items-center gap-2 text-emerald-400 font-semibold hover:gap-3 transition-all"
            >
              {t("landing.seeLeaderboard")}
              <ArrowUpRight size={18} />
            </Link>
          </motion.div>

          {/* Leaderboard screenshot */}
          <motion.div
            className="flex-1 flex justify-center"
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease: easePremium }}
          >
            <div className="relative rounded-2xl border border-white/10 overflow-hidden shadow-2xl shadow-black/40 max-w-md w-full">
              <img
                src="/screenshots/leaderboard.png"
                alt="Player leaderboard and tier rankings"
                className="w-full h-auto"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ════════════════════════════════════════════════════
// Section 5: Marketplace Showcase
// ════════════════════════════════════════════════════
function MarketplaceSection() {
  const { t } = useTranslation();

  return (
    <section className="relative py-24 sm:py-32 px-5 sm:px-8 overflow-hidden">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col-reverse lg:flex-row items-center gap-8 lg:gap-20">
          {/* Screenshot side */}
          <motion.div
            className="flex-1 flex justify-center"
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease: easePremium }}
          >
            <div className="relative rounded-2xl border border-white/10 overflow-hidden shadow-2xl shadow-black/40 max-w-md w-full">
              <img
                src="/screenshots/marketplace.png"
                alt="Padel gear marketplace"
                className="w-full h-auto"
              />
            </div>
          </motion.div>

          {/* Text side */}
          <motion.div
            className="flex-1 text-center lg:text-start"
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease: easePremium }}
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              {t("landing.marketShowcaseTitle")}
            </h2>
            <p className="text-white/50 text-lg max-w-md mx-auto lg:mx-0 mb-8 leading-relaxed">
              {t("landing.marketShowcaseDesc")}
            </p>
            <Link
              href="/market"
              className="inline-flex items-center gap-2 text-[#c8ff00] font-semibold hover:gap-3 transition-all"
            >
              {t("landing.browseMarket")}
              <ArrowUpRight size={18} />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ════════════════════════════════════════════════════
// Section 6: For Venue Owners
// ════════════════════════════════════════════════════
function VenueOwnerSection() {
  const { t } = useTranslation();

  const bullets = [
    t("landing.ctaBullet1"),
    t("landing.ctaBullet2"),
    t("landing.ctaBullet3"),
  ];

  return (
    <section className="relative py-20 sm:py-28 px-5 sm:px-8 overflow-hidden">
      <div className="mx-auto max-w-4xl">
        <motion.div
          className="relative glass-dark-strong rounded-3xl p-8 sm:p-12 gradient-border overflow-hidden"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: easePremium }}
        >
          {/* Background glow */}
          <div
            className="absolute inset-0 rounded-3xl bg-gradient-to-br from-emerald-500/5 via-transparent to-teal-500/3 pointer-events-none"
            aria-hidden="true"
          />

          <div className="relative z-10 flex flex-col items-center text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-8">
              {t("landing.ownACourt")}
            </h2>

            {/* Bullet points */}
            <ul className="space-y-4 mb-10 text-start">
              {bullets.map((bullet, i) => (
                <motion.li
                  key={i}
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.4,
                    delay: 0.2 + i * 0.1,
                    ease: easePremium,
                  }}
                >
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/15">
                    <CheckCircle size={14} className="text-emerald-400" />
                  </div>
                  <span className="text-white/70 text-base sm:text-lg">
                    {bullet}
                  </span>
                </motion.li>
              ))}
            </ul>

            <Link href="/register">
              <motion.span
                whileHover={{
                  scale: 1.05,
                  boxShadow:
                    "0 0 40px rgba(16,185,129,0.3), 0 0 80px rgba(16,185,129,0.1)",
                }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-10 py-4 text-lg font-bold cursor-pointer transition-all"
              >
                {t("landing.registerVenue")}
                <ArrowUpRight size={18} />
              </motion.span>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// Stats section removed

// ════════════════════════════════════════════════════
// Section 7: Final CTA + Footer
// ════════════════════════════════════════════════════
function FinalCta() {
  const { t } = useTranslation();

  return (
    <section className="relative py-20 sm:py-28 px-5 sm:px-8 overflow-hidden">
      <div className="mx-auto max-w-4xl">
        <motion.div
          className="relative rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-600 p-8 sm:p-14 text-center overflow-hidden"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: easePremium }}
        >
          {/* Decorative grid */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
              backgroundSize: "32px 32px",
            }}
            aria-hidden="true"
          />

          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              {t("landing.startBookingNow")}
            </h2>

            <Link href="/browse">
              <motion.span
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 rounded-full bg-white text-gray-900 px-10 py-4 text-lg font-bold cursor-pointer transition-all hover:bg-white/90"
              >
                {t("landing.browseCourts")}
                <Search size={18} />
              </motion.span>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="py-8 text-center space-y-1">
      <p className="text-white/25 text-sm">
        {t("landing.footerCopy")} &copy;
      </p>
      <p className="text-white/15 text-xs">{t("landing.madeInEgypt")}</p>
    </footer>
  );
}

// ─── Main Export ───
export function HeroSection() {
  return (
    <div className="gradient-mesh noise-overlay">
      <Hero />
      <FeatureShowcase />
      <HowItWorksSection />
      <PlayerCardsSection />
      <MarketplaceSection />
      <VenueOwnerSection />
      {/* Stats section removed */}
      <FinalCta />
      <Footer />
    </div>
  );
}
